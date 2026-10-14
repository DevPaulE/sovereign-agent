// hemera — the M6 daemon. A ROUTER, not an agent.
// One bot, one getUpdates consumer (the M6 owns it). Allowlist + fixed workspaces + ledger.
// Deterministic control plane: no model runs in this file.
// Routing: "@air <msg>" -> Air seat over SSH; "@m6 <msg>" -> M6 pi worker; else default.
// Archive: every inbound message and reply written in full to archive/ (jsonl + daily md).
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const HOME = process.env.HOME;
const DIR = join(HOME, "dpi-work/hemera");
if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
const LEDGER = join(DIR, "ledger.jsonl");
const OFFSET_FILE = join(DIR, ".offset");
const ARCHIVE = join(DIR, "archive");
const TRANSCRIPT = join(ARCHIVE, "transcript.jsonl");
if (!existsSync(ARCHIVE)) mkdirSync(ARCHIVE, { recursive: true });

// --- L3: the data layer. The daemon owns its tables. ---
let DB = null;
try {
  DB = new DatabaseSync(join(DIR, "hemera.db"));
  DB.exec(`CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT, dir TEXT, chat TEXT, who TEXT, agent TEXT, text TEXT);
           CREATE TABLE IF NOT EXISTS routes(id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT, agent TEXT, ms INTEGER, acked INTEGER, reply TEXT);
           CREATE TABLE IF NOT EXISTS spine(id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT, kind TEXT, claim TEXT, evidence TEXT);`);
} catch (e) { console.error("hemera: sqlite unavailable — JSONL only", String(e).slice(0, 120)); }

const envText = [join(HOME, "dpi-work/.hermes.env"), join(HOME, ".dpi/backend.env")]
  .filter(existsSync).map((f) => readFileSync(f, "utf8")).join("\n");
const pick = (k) => envText.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();
const TOKEN = pick("HERMES_BOT_TOKEN") || pick("TELEGRAM_BOT_TOKEN");
const PRINCIPAL = pick("TELEGRAM_PRINCIPAL_CHAT_ID");
if (!TOKEN || !PRINCIPAL) { console.error("hemera: missing creds"); process.exit(1); }

const ALLOWED = new Set([String(PRINCIPAL)]);
const REGISTRY = JSON.parse(readFileSync(join(DIR, "registry.json"), "utf8"));
const PI = join(HOME, ".pi/agent/bin/pi");
const DEFAULT = REGISTRY.default;
const ACK_AFTER_MS = 6000;

const preview = (s, n = 140) => String(s ?? "").replace(/\s+/g, " ").slice(0, n);
function ledger(entry) { appendFileSync(LEDGER, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + "\n"); }

// Full-text archive: machine file (jsonl) + human file (daily md). Local only.
function archive(dir, chatId, who, text) {
  const now = new Date();
  const day = now.toLocaleDateString("en-CA");
  const hhmmss = now.toLocaleTimeString("en-GB");
  appendFileSync(TRANSCRIPT, JSON.stringify({ ts: now.toISOString(), dir, chat: String(chatId), who, text }) + "\n");
  appendFileSync(join(ARCHIVE, `${day}.md`), `\n### ${hhmmss} · ${who}\n\n${text}\n`);
}

function readLog(n) {
  if (!existsSync(TRANSCRIPT)) return "no archive yet";
  const lines = readFileSync(TRANSCRIPT, "utf8").trim().split("\n").filter(Boolean).slice(-n);
  return lines.map((l) => {
    try { const e = JSON.parse(l); return `${e.ts.slice(11, 19)} ${e.dir === "in" ? "you" : e.who}: ${(e.text || "").replace(/\s+/g, " ").slice(0, 140)}`; }
    catch { return l.slice(0, 140); }
  }).join("\n") || "no archive yet";
}

async function send(chatId, text) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: String(text).slice(0, 3900), disable_web_page_preview: true }),
    });
    const j = await r.json();
    if (!j.ok) ledger({ dir: "send", ok: false, err: JSON.stringify(j).slice(0, 160) });
    return j.ok;
  } catch (e) { ledger({ dir: "send", ok: false, err: String(e).slice(0, 160) }); return false; }
}

function runAgent(agent, text) {
  const timeoutMs = (agent.timeout_s ?? 300) * 1000;
  const isSsh = agent.kind === "ssh";
  const REMOTE = `f=$(mktemp) && cat > "$f" && cd ~/Projects/sovereign-layer && SEAT_DIR="$HOME/Projects/sovereign-layer/seat" ~/.bun/bin/bun seat/seat-send.ts "$(cat "$f")"; rc=$?; rm -f "$f"; exit $rc`;
  const cmd = isSsh ? "ssh" : PI;
  const args = isSsh ? ["-o", "BatchMode=yes", "-o", "ConnectTimeout=10", agent.host, REMOTE] : ["-p", text, "--no-session"];
  const started = Date.now();
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: isSsh ? HOME : agent.workspace, stdio: ["pipe", "pipe", "pipe"] });
    let out = "", err = "";
    const t = setTimeout(() => { try { child.kill("SIGKILL"); } catch {} resolve({ reply: "agent timed out — try a smaller ask", ms: Date.now() - started }); }, timeoutMs);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) => { clearTimeout(t); resolve({ reply: code === 0 ? out.trim() : `agent error: ${(err || "exit " + code).slice(0, 300)}`, ms: Date.now() - started }); });
    child.stdin.end(isSsh ? text : "");
  });
}

function queryData(t) {
  if (!DB) return "no data layer (sqlite unavailable)";
  const q = t.replace(/^\/q\s*/, "").trim();
  const today = new Date().toISOString().slice(0, 10);
  if (!q || q === "stats") {
    const m = DB.prepare("SELECT COUNT(*) c FROM messages WHERE dir='in'").get().c;
    const r = DB.prepare("SELECT agent, COUNT(*) c, AVG(ms) avgms FROM routes GROUP BY agent").all();
    return `messages: ${m}\n` + (r.map((x) => `${x.agent}: ${x.c} routes, avg ${Math.round(x.avgms)}ms`).join("\n") || "no routes yet");
  }
  if (q === "today") {
    const rows = DB.prepare("SELECT ts, agent, ms, reply FROM routes WHERE ts LIKE ? ORDER BY id DESC LIMIT 20").all(today + "%");
    return rows.length ? rows.map((x) => `${x.ts.slice(11, 19)} ${x.agent} ${x.ms}ms: ${x.reply}`).join("\n") : `no routes today (${today})`;
  }
  const rows = DB.prepare("SELECT ts, dir, who, agent, text FROM messages WHERE text LIKE ? ORDER BY id DESC LIMIT 10").all(`%${q}%`);
  return rows.length
    ? rows.map((x) => `${x.ts.slice(11, 19)} ${x.dir === "in" ? "you" : x.who}: ${preview(x.text, 120)}`).join("\n")
    : `no match for "${q}"`;
}

async function route(chatId, text) {
  if (!ALLOWED.has(String(chatId))) { ledger({ dir: "in", denied: true, from: chatId }); return { ok: false, reply: "not allowed" }; }
  const t = (text || "").trim();
  if (t === "/agents") return { ok: true, reply: "agents: " + Object.keys(REGISTRY.agents).join(", ") + ` (default ${DEFAULT})` };
  if (t === "/status") return { ok: true, reply: `hemera on ${HOME}; default=${DEFAULT}; agents=${Object.keys(REGISTRY.agents).join("/")}` };
  if (t.startsWith("/log")) { const n = Number(t.split(/\s+/)[1]) || 8; return { ok: true, reply: readLog(n) }; }
  if (t.startsWith("/q")) return { ok: true, reply: queryData(t) };

  let agentName = DEFAULT, body = t;
  const m = t.match(/^@(\w+)\s+([\s\S]*)$/);
  if (m && REGISTRY.agents[m[1]]) { agentName = m[1]; body = m[2]; }
  const agent = REGISTRY.agents[agentName];
  archive("in", chatId, "you", t);
  if (DB) DB.prepare("INSERT INTO messages(ts,dir,chat,who,agent,text) VALUES(?,?,?,?,?,?)").run(new Date().toISOString(), "in", String(chatId), "you", agentName, t);
  ledger({ dir: "in", agent: agentName, msg: preview(t) });

  let acked = false;
  const ackTimer = setTimeout(() => { acked = true; send(chatId, `working... (${agentName})`); }, ACK_AFTER_MS);
  const res = await runAgent(agent, body);
  clearTimeout(ackTimer);
  archive("out", chatId, agentName, res.reply || "(empty)");
  if (DB) DB.prepare("INSERT INTO routes(ts,agent,ms,acked,reply) VALUES(?,?,?,?,?)").run(new Date().toISOString(), agentName, res.ms, acked ? 1 : 0, preview(res.reply));
  ledger({ dir: "route", agent: agentName, ms: res.ms, acked, reply: preview(res.reply) });
  return { ok: true, reply: res.reply || "(empty)" };
}

if (process.argv.includes("--once")) {
  const i = process.argv.indexOf("--once");
  const out = await route(PRINCIPAL, process.argv[i + 1] || "");
  console.log(out.reply);
  process.exit(out.ok ? 0 : 1);
}

if (process.argv.includes("--dry")) { console.error("hemera: dry mode"); await new Promise(() => {}); }

let offset = existsSync(OFFSET_FILE) ? Number(readFileSync(OFFSET_FILE, "utf8").trim()) || 0 : 0;
process.on("SIGINT", () => process.exit(0));
console.error(`hemera: polling as ${PRINCIPAL}, default ${DEFAULT}, offset ${offset}`);
for (;;) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates?timeout=30&offset=${offset}`);
    const j = await r.json();
    if (!j.ok) { console.error("hemera: getUpdates not ok", JSON.stringify(j).slice(0, 200)); await new Promise((s) => setTimeout(s, 5000)); continue; }
    for (const u of j.result ?? []) {
      offset = u.update_id + 1;
      writeFileSync(OFFSET_FILE, String(offset));
      const msg = u.message;
      if (!msg?.text) continue;
      const { reply } = await route(msg.chat.id, msg.text);
      await send(msg.chat.id, reply);
    }
  } catch (e) {
    console.error("hemera: loop error", String(e).slice(0, 200));
    await new Promise((s) => setTimeout(s, 5000));
  }
}
