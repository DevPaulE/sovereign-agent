// sentinel.mjs — the proactive trigger. The missing wire between DETECT and ACT.
// Reads new lines from a stream, asks a cheap classifier (jev principle) whether each is
// worth acting on, and on a trigger spawns a durable pi task. Reports via Hermes ONLY when
// it matters — the "don't interrupt unless it's an emergency" contract.
//
//   node sentinel.mjs          # watch loop (foreground / launchd)
//   node sentinel.mjs --once   # process new lines once, exit (test)
//   SENTINEL_STREAM=<file>     # override the watched file
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";

const HOME = process.env.HOME;
const DIR = join(HOME, "dpi-work/sentinel");
if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
const STREAM = process.env.SENTINEL_STREAM || join(DIR, "stream.log");
const POS = join(DIR, ".pos");
const LOG = join(DIR, "sentinel.log");
const PI = join(HOME, ".pi/agent/bin/pi");
const WORKSPACE = join(HOME, "dpi-work/workspace");

const envText = [join(HOME, "dpi-work/.hermes.env"), join(HOME, ".dpi/backend.env")]
  .filter(existsSync).map((f) => readFileSync(f, "utf8")).join("\n");
const pick = (k) => envText.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();
const TOKEN = pick("HERMES_BOT_TOKEN") || pick("TELEGRAM_BOT_TOKEN");
const CHAT = pick("TELEGRAM_PRINCIPAL_CHAT_ID");

function log(s) { const l = `[${new Date().toISOString()}] ${s}`; appendFileSync(LOG, l + "\n"); if (process.env.SENTINEL_VERBOSE) console.error(l); }

async function notify(text) {
  if (!TOKEN || !CHAT) return;
  try { await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: CHAT, text: String(text).slice(0, 3900), disable_web_page_preview: true }) }); } catch {}
}

function runPi(prompt, timeoutMs) {
  return new Promise((resolve) => {
    const c = spawn(PI, ["-p", prompt, "--no-session"], { cwd: WORKSPACE, stdio: ["pipe", "pipe", "pipe"] });
    let out = "", err = "";
    const t = setTimeout(() => { try { c.kill("SIGKILL"); } catch {} resolve("(timeout)"); }, timeoutMs);
    c.stdout.on("data", (d) => (out += d));
    c.stderr.on("data", (d) => (err += d));
    c.on("close", (code) => { clearTimeout(t); resolve(code === 0 ? out.trim() : `(error ${code}) ${err.slice(0, 200)}`); });
    c.stdin.end();
  });
}

// the classifier — jev principle: a cheap model decides, not the expensive one
async function classify(line) {
  const r = await runPi(`You are a cheap incident classifier for a log stream. Given ONE line, reply with exactly one word: TRIGGER if it describes a real error, incident, or failure worth investigating; IGNORE otherwise. Line: ${line}`, 45000);
  return /TRIGGER/i.test(r) ? "TRIGGER" : "IGNORE";
}

async function act(line) {
  return await runPi(`A production log stream produced this line:\n\n${line}\n\nInvestigate briefly: what likely failed, the probable cause, and one concrete next step. Keep it to 5 lines.`, 120000);
}

async function once() {
  if (!existsSync(STREAM)) { log(`no stream file ${STREAM}`); return; }
  const lines = readFileSync(STREAM, "utf8").split("\n").filter(Boolean);
  const pos = existsSync(POS) ? Number(readFileSync(POS, "utf8")) || 0 : 0;
  for (const line of lines.slice(pos)) {
    const verdict = await classify(line);
    log(`${verdict}: ${line.slice(0, 100)}`);
    if (verdict === "TRIGGER") {
      const result = await act(line);
      await notify(`⚠ sentinel triggered\n\n${line.slice(0, 300)}\n\n${result}`);
      log(`acted: ${result.slice(0, 120)}`);
    }
  }
  writeFileSync(POS, String(lines.length));
}

if (process.argv.includes("--once")) { await once(); process.exit(0); }
log(`sentinel watching ${STREAM}`);
for (;;) { try { await once(); } catch (e) { log(`loop error ${String(e).slice(0, 150)}`); } await new Promise((r) => setTimeout(r, 20000)); }
