# Pi — your operator's walkthrough

Written for Paul, 2026-10-14, against **pi 1.2.0** and your live config. Read top to bottom once, then use the cheat card at the end.

You took herdr and kitty because Dan used them. Those are the room and the furniture. This is how you drive the car.

---

## 1. The 30-second mental model

Pi is **not** Claude Code. It's a smaller thing made of four parts:

- **A model** — you pick it (yours is DeepSeek V4 Pro by default).
- **A prompt** — ~200 tokens, not 10,000. Most of your context (your rules, your skills, your files) is *layered on* by your config.
- **Tools** — five: read, write, edit, bash, plus whatever extensions add.
- **Sessions** — every conversation is saved as a tree you can rewind or branch.

Dan's whole video is one sentence: *the harness is the product.* You already own yours — it's the `pi-lifeos` package. Everything Pi shows you comes from that package plus your `~/.pi` folder. When you want Pi to behave differently, you change the package, run `/lifeos-rebuild`, then `/reload`. Nothing is hidden.

**The one thing to internalise:** Pi does **not** ask permission before acting. That is the default, not a bug. Your safety is your doctrine (gates; gate-author ≠ builder) and your fingers, not a popup.

---

## 2. Where you are right now (your actual setup)

| Piece | What it is | Where |
|---|---|---|
| Harness | pi 1.2.0 | `~/.bun/bin/pi` |
| Your system | `pi-lifeos` package, loaded by path | `~/Projects/toolbelt/pi-lifeos` |
| Global context | `AGENTS.md` (symlink to the package) | `~/.pi/agent/AGENTS.md` |
| Settings | default model, enabled models, skills filter, packages | `~/.pi/agent/settings.json` |
| Extensions | herdr integration | `~/.pi/agent/extensions/herdr-agent-state.ts` |
| Skills | 7 load (6 yours + `cognitive-harness`) | `~/Projects/toolbelt/pi-lifeos/skills/` (shims) |
| Moves | 8 slash commands | `~/Projects/toolbelt/pi-lifeos/prompts/` |
| Default model | `openrouter/deepseek/deepseek-v4-pro` | `settings.json` + `lifeos.config.json` |
| Terminal | kitty (keyboard protocol, images) + herdr (agent workspace) | `~/.config/kitty`, `~/.config/herdr` |

Your `enabledModels` (what Ctrl+P cycles) include Qwen local, DeepSeek V4 Pro, Claude Opus 4.8 / 5.5, and `openrouter/auto`.

> **Records have dates.** This is current as of 2026-10-14. Re-check with `/session` and by reading `lifeos.config.json` before trusting it later.

---

## 3. Boot it

```bash
cd ~/Projects/anything        # pi looks at the folder you launch from
pi                            # interactive session
```

Command-line forms you'll actually use:

| Command | What it does |
|---|---|
| `pi` | Interactive, in the current folder |
| `pi --continue` | Reopen the **most recent session for this folder** — your everyday "resume" |
| `pi --resume` | Pick any saved session |
| `pi -p "question"` | One-shot: print the answer and exit (no session) |
| `pi -p "..." --model openrouter/deepseek/deepseek-v4-pro --no-session --no-skills` | A *clean* one-shot: no skills, no context, no saved session. This is the exact incantation `/gate` uses to get a second vendor to author a gate |
| `pi --extension ./some.ts` | Try an extension without installing it |
| `pi --help` | The full flag list |

**Recommendation:** keep real work in a named session per project (`cd` there, `pi`, `/name`). Use `pi -p` for throwaway questions so they don't clutter your session history.

---

## 4. Reading the screen

Four zones:

1. **Startup header** — lists the instructions and resources Pi loaded. This is your proof that `AGENTS.md`, your 7 skills and 8 commands are live. Glance at it each boot.
2. **Transcript** — your prompts, the model's answers, every tool call and result.
3. **Editor** — where you type. Its border colour encodes the thinking level.
4. **Footer** — folder · session · model · context left · cumulative tokens and cost.

Two keystrokes you'll use constantly:

- **`Ctrl+O`** — expand/collapse tool output (see exactly what bash ran, what file was written).
- **`Ctrl+T`** — show/hide the model's thinking blocks.

The footer's model name is the thing to watch. If it surprises you, you're on the wrong model — see §9.

---

## 5. Your first turn

Type a request, press **`Enter`**. That's it.

Ways to hand it things:

| You want | Type |
|---|---|
| Add a file to the prompt | `@` then start typing the name; `Tab` completes the path |
| Paste or drag an image | Paste/drag a screenshot into kitty |
| Write a long prompt comfortably | `Ctrl+G` opens your `$EDITOR` for the current prompt |
| Run a shell command and give Pi the output | `!git status` |
| Run a shell command and **not** give Pi the output | `!!some-private-command` |

**`!` vs `!!` matters.** `!` puts the output into the conversation (the model sees it). `!!` runs it and keeps the output to yourself — use it for anything sensitive.

---

## 6. Steering an agent that's already working

You don't have to wait. While Pi is mid-task:

| You want | Do |
|---|---|
| **Adjust** the current task ("also check X") | Type it, press **`Enter`** — it lands after the current tool calls, then guides the next step |
| **Queue extra work** for after it finishes | Type it, press **`Alt+Enter`** |
| Get queued messages **back** to edit | **`Alt+Up`** |
| **Stop** it now | **`Escape`** |

This is the difference between babysitting and directing. Escape aborts but keeps the session.

---

## 7. Your moves (the 8 slash commands)

Type `/` to see everything, or `/` plus a few letters. These are your prompt templates from `prompts/`:

| Command | What it does |
|---|---|
| `/lifeos <question>` | The front door. Reads the map (`toolbelt/LIFEOS.md`), finds the right file, answers from it, quotes the path |
| `/isa [goal]` | Write/update the ideal-state: claims each with a falsifier, anti-claims, out-of-scope, log |
| `/gate <what's being built>` | Author an acceptance gate with a **different** model than the builder; must run RED first |
| `/fuse <question>` | Several decorrelated models answer independently, then merge with attribution, keeping the disagreement |
| `/paper [project]` | The close-out rule: write tomorrow's first action down before the session ends |
| `/upstream <how does Daniel do X?>` | Read-only look-up in Miessler's LifeOS |
| `/sync-toolbelt` | Refresh toolbelt copies, scan for secrets, commit and push |
| `/lifeos-rebuild` | After you edit config/template: rebuild, then it tells you to `/reload` |

**The rule that keeps `gate` honest:** the model that builds never authors or grades its own gate. The command bakes that in by shelling out to a clean `pi -p --no-skills` on a different vendor.

---

## 8. Skills (forced, not magic)

Pi *advertises* skills so the model can grow them automatically, but that's less reliable than Claude Code. To force one:

```
/skill:cognitive-harness            stress a decision or stuck problem
/skill:cognitive-stack-code         the five-part mental-model answer
/skill:engineering-interpreter      turn rough intent into a Foundry work order
/skill:harvest <url>                mine one source for what LifeOS should adopt
/skill:isa                          own the ideal-state artifact
/skill:knowledge <query>            search/add/ingest the Knowledge Archive
/skill:interceptor                  real-browser verification
```

The shims are pointers: each says "read the real `SKILL.md` in `~/.claude/skills/...` and do it." Some skills were written for Claude Code and name tools Pi lacks — when that happens, Pi does the work inline with bash/read, or says plainly what it can't do. `/skill:harvest` is the live example.

---

## 9. Models and thinking (the part you care about)

| Action | Key |
|---|---|
| Open model picker | **`Ctrl+L`** or `/model` |
| Cycle to next model | **`Ctrl+P`** |
| Cycle to previous | **`Shift+Ctrl+P`** |
| Cycle thinking level | **`Shift+Tab`** |
| Collapse/expand thinking | **`Ctrl+T`** |
| Set thinking explicitly | `/thinking low \| medium \| high` |

Your default is **DeepSeek V4 Pro** over OpenRouter. Put the right model on the right job — that's your `MODEL_STACK` doctrine made physical here.

Next build (ISA C14–C17) adds `jev/auto`: Pi asks a cheap classifier which kind of turn this is (build/orchestration vs everything else) and routes it, staying on V4 Pro when the classifier fails or times out. When that lands, the missing piece is a **status line showing which physical model actually ran** — one of the harvest findings. Until then, trust the footer and `Ctrl+L`.

---

## 10. Sessions — your undo history

Sessions auto-save under `~/.pi/agent/sessions/`, grouped by folder. Nothing is lost unless you ask.

| Command | Use it when |
|---|---|
| `/new` | Start clean |
| `/resume` | Jump to another saved session |
| `/name <name>` | Give this one a recognisable name |
| `/session` | Show file, ID, message count, tokens, cost |
| `/tree` | Rewind within **this** session — pick an earlier message and re-branch |
| `/fork` | Branch off an earlier message into a **separate** session |
| `/clone` | Copy the current session to explore a variation |
| `/compact [instructions]` | Shrink the history the model sees (auto-happens near the limit) |
| `/copy` or `Ctrl+X` | Copy the last answer |
| `/export` | Save the session as HTML or JSONL |
| `/share` | Upload and get a viewer link (review first — it can contain secrets) |

**The habit that saves you:** after a big decision, `/tree` back to the branch point and try the other path. Nothing is erased. `/compact` does **not** delete entries; it just changes what gets sent next.

---

## 11. The keys worth memorising

| Key | Does |
|---|---|
| `Enter` | Send (or steer the current task) |
| `Shift+Enter` | Newline |
| `Escape` | Abort the current task |
| `Ctrl+O` | Expand/collapse tool output |
| `Ctrl+T` | Show/hide thinking |
| `Ctrl+P` / `Shift+Ctrl+P` | Next / previous model |
| `Ctrl+L` | Model picker |
| `Shift+Tab` | Cycle thinking level |
| `Alt+Enter` | Queue a follow-up |
| `Alt+Up` | Pull queued messages back to the editor |
| `Ctrl+G` | Edit the prompt in `$EDITOR` |
| `Ctrl+V` | Paste image/files |
| `Ctrl+C` (twice) | Clear editor / exit |
| `Ctrl+D` | Exit |

Run **`/hotkeys`** any time to see the active list for this session.

---

## 12. Make it yours (the loop you'll actually use)

Everything customisable lives in one of two places: the `pi-lifeos` package, or your `~/.pi/agent` folder.

**The change loop:**

```
1. edit  ~/Projects/toolbelt/pi-lifeos/lifeos.config.json   (which skills, which paths, default model)
   or    ~/Projects/toolbelt/pi-lifeos/prompts/<name>.md    (a new/edited move)
   or    ~/Projects/toolbelt/pi-lifeos/AGENTS.template.md   (global context)
2. /lifeos-rebuild            # runs build.ts: regenerates skill shims + AGENTS.md, prints ✓/✗
3. /reload                    # pi picks up the change live — no restart
```

That's the whole ownership story: **config → build → reload.** If a step fails, the ✗ line names the file and reason.

**Where each thing is served from:**

| You want to change | Edit | Then |
|---|---|---|
| Which skills load / default model / paths | `lifeos.config.json` | `/lifeos-rebuild`, `/reload` |
| Your global context (the map, rules) | `AGENTS.template.md` | `/lifeos-rebuild`, `/reload` |
| A slash-command / move | `prompts/*.md` | `/reload` |
| A skill | `~/.claude/skills/<Skill>/SKILL.md` | `/reload` |
| An extension | add a file in `~/.pi/agent/extensions/` | `/reload` |
| Keybindings | `~/.pi/agent/keybindings.json` | `/reload` |
| Settings | `/settings` (or `settings.json`) | live |

---

## 13. Safety — Pi is YOLO by default

Pi has **no permission prompt**. The first time you realise this is usually the first time it deletes something. Your guardrails, in order:

1. **The gates do the guarding.** `/gate` forces a second vendor to author the acceptance test and show it failing (RED) before anything is built. Gate-author ≠ builder.
2. **Your context rules are read, not enforced.** `AGENTS.md` says never read `.env`/credentials, never rename `~/.claude`, never `StrictHostKeyChecking=no`. Pi will *try* to follow — but in this build there is **no protected-paths extension yet**, so a confused model can still do it. Treat the rules as discipline, not a fence.
3. **`!!` for anything sensitive** — keeps private output out of the model's context.
4. **Live shop bot (svautopros):** nothing merges toward it without your eyes on the diff. That's a Paul rule, not a Pi feature.
5. **Untrusted or unattended work:** Pi docs recommend a sandbox. You don't have one wired yet — so don't leave Pi unattended on a folder you care about until you do.

> This is the strongest candidate for the next pi-lifeos extension: adapt Pi's shipped `protected-paths.ts` to mechanically block `.env`, `auth.json`, `~/.claude`, and credential paths. It's a small build and it turns doctrine into a fence. Flag it, don't do it silently.

---

## 14. kitty + herdr — what they actually add

- **kitty** is your terminal emulator. What matters for Pi: it reports the **Kitty keyboard protocol**, so `super+` (⌘) keybindings work, and it accepts **inline images** (drag/paste screenshots straight into a prompt). That's why Dan "just uses kitty."
- **herdr** is a *terminal workspace manager for AI coding agents*. It runs a persistent server + client, so workspaces, tabs and panes survive; and its Pi integration (`herdr-agent-state.ts`) reports each agent's state — **working / blocked / idle** — into herdr's agent panel. That's the panel that lets you run several agents and see at a glance which one needs you.

You don't have to learn herdr to use Pi. But once you're running more than one Pi session, the panel is why you keep it. Useful commands:

```bash
herdr status            # client + server status
herdr workspace --help  # tabs/panes/workspaces
herdr agent --help      # agent/terminal helpers
```

---

## 15. Your 15-minute drill (do this once)

Open kitty, start (or attach to) herdr, make a tab, and run:

```
cd ~/Projects/toolbelt/pi-lifeos
pi
```

Then, in order:

1. **Read the header.** Confirm it names `AGENTS.md`, your skills, your commands. If it doesn't, something didn't load.
2. Type: `read AGENTS.md and tell me my paper rule in one line` — then press **`Ctrl+O`** to watch the file read, and **`Ctrl+T`** to see the thinking.
3. Type `/lifeos where is my Hermes voice spec?` — you should get the path, quoted from the map.
4. Press `Ctrl+L`, pick a different model and watch the footer change. Press `Ctrl+P` to cycle. Set it back to **DeepSeek V4 Pro** with `Ctrl+L`.
5. Type `/session` — note your token count and cost. Then `/name first-walkthrough`.
6. Type `!pwd` (Pi sees the output), then `!!echo this stays with me`.
7. Type `/paper` to close — it writes tomorrow's first action where you'll see it.
8. Quit with `Ctrl+D`, then run `pi --continue` and confirm you're back where you left off.

If all eight work, you can operate Pi.

---

## 16. When it breaks

| Symptom | First move |
|---|---|
| Wrong model | `Ctrl+L`; if it won't stick, `/settings` or check `settings.json` |
| A skill or command isn't listed | `/reload`; if still missing, `/lifeos-rebuild` and read the ✗ line |
| Pi ignored a rule in `AGENTS.md` | It's a model, not a compiler — restate it, or force the right skill. On the small local model, expect this often |
| Context running out / slow | `/compact`, `/new`, or start a fresh `pi -p` for a one-off |
| Weird rendering | `/debug` writes `pi-debug.log` into `~/.pi/agent`; review before sharing |
| Something looks like it did nothing | **Empty output is not absence.** Confirm the command ran (exit code, `command not found`) before concluding anything — this exact failure is in your ISA log |
| Terminal ignores a keybinding | `/hotkeys`; check kitty is sending the protocol; edit `~/.pi/agent/keybindings.json` |

---

## One-screen cheat card

```
BOOT            pi            · start here
                pi -p "q"     · one-shot, no session
                pi --continue · resume this folder's last session

TYPE            @file  Tab    · add a file
                !cmd          · run, model sees output
                !!cmd         · run, model does NOT see output
                Ctrl+G        · edit long prompt in $EDITOR

STEER           Enter         · send / adjust current task
                Alt+Enter     · queue a follow-up
                Alt+Up        · pull queued messages back
                Escape        · stop

READ            Ctrl+O        · tool output
                Ctrl+T        · thinking

MODEL           Ctrl+L        · pick (or /model)
                Ctrl+P        · cycle
                Shift+Tab     · thinking level

SESSIONS        /new /resume /name /session
                /tree /fork /compact

YOUR MOVES      /lifeos  /isa  /gate  /fuse
                /paper   /upstream  /sync-toolbelt  /lifeos-rebuild

SKILLS          /skill:<name>   (7 loaded; see §8)

OWN IT          edit config → /lifeos-rebuild → /reload

CLOSE           /paper   then Ctrl+D
```

> **Your next action:** run the §15 drill once, end to end, before your next real pi session. If step 4 (model switching) or step 6 (`!`/`!!`) trips you, that's the gap to fix first. Then decide the one real build — the **protected-paths extension** (§13) or the **model status line** (§9). Both are small; both turn doctrine into mechanism.

File: `~/Projects/toolbelt/pi-lifeos/WALKTHROUGH.md`