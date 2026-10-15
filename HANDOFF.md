# HANDOFF — the Sovereign Agent practice (the Dæmon Forge workstream)

> Self-contained. Read this, then the docs it points at, and you can pick up cold. Date: 2026-10-14.

## The workstream in one paragraph

Paul is building a solo agentic-engineering practice. The product is a **dæmon** — a sovereign, person-owned AI agent crafted for one person, defined by ***one deliverable*** (an ideal state), that matures with them. The demo is a free **Dæmon Audit**; the offer is a **$5,000, 14-day install**; the recurring rung is **renting their own agent's compute**. Everything runs on **the M6 lab** (control plane) with **exe.dev** as the overflow. First proving ground: **the uncle**, in Manila, whose problem is scheduling + tasks.

## Where everything lives

| What | Path |
|---|---|
| This repo (the kit) | `~/Projects/sovereign-agent/` |
| Doctrine + spine + levels | `~/Projects/toolbelt/lifeos/{BLUEPRINT,AUDIT,LEVELS,NEXT-ACTIONS}.md` |
| The pi harness | `~/Projects/toolbelt/pi-lifeos/` |
| Knowledge archive | `~/.claude/LIFEOS/MEMORY/KNOWLEDGE/` |
| M6 services | `m6:~/dpi-work/{hemera,sentinel,llm-lab,pi-lifeos,jev}/` |
| Whisper (course extraction) | `/opt/homebrew/bin/whisper-cli`, model `~/Library/Application Support/whisper.cpp/ggml-base.en.bin` |
| Private course corpus | `~/Documents/brendan-dell/transcripts/` (never commit) |

## The docs (read in this order)

1. **`docs/DAEMON-FORGE.md`** — craft an agent for a person. The eight pieces: problem, avatar, **ideal state (1 deliverable)**, feed, maturation, evolution, gate, ownership. "Maturation is memory; evolution is a re-set ideal state."
2. **`docs/LAB.md`** — the M6 as **control plane, not product**. A tenant = `{chat_id, workspace, lane, state}`. Three walls: workspace, identity, credential. Intake = warm network first. The *model* is the ceiling, not the agents; exe.dev catches overflow.
3. **`docs/LEAD-MAGNET.md`** — the free **Dæmon Audit**: one folder in, one page out (the gaps + one automation, every finding citing its file). Hard-cost to competitors, inconsequential to Paul. The ladder: audit → install → rent.
4. **`docs/POSITIONING.md`** — never say "AI agents / FDE / agentic." Sell **hours recovered + data staying home**.
5. **`docs/ICP.md`** — the ideal customer.
6. **`docs/BROKER-DATA.md`** — the exit-data-room play, ~82% key-person discount, 4-phase checklist, $2,500/30-day, objections→answers.
7. **`docs/SESSION-BRIEF.md`** — the short version of this handoff.
8. **`docs/DSH-RESEARCH-muse-dots.md`** — the DSH research prompt (run it on the research seat).

## Key decisions (locked)

- **The gate is the product.** The data room is the implementation. The gap report is the demo.
- **The offer (verbatim):** *"I install a working agent inside your business in 14 days — you get 20+ hours a week back — for $5,000 fixed. I prove it on your own numbers."*
- **The lead magnet is a map, not the install.** The audit shows the gap; the install closes it.
- **Never claim sovereignty while holding their data.** Be honest the M6 is the *build stage* until the dæmon runs on their box.
- **The negotiation demo shows dæmons proposing, humans approving.** Not autonomous commitment — that would contradict the gate.
- **Sell the dæmon, never the model.** Muse/Dots have better models; the forge competes on *your* ideal state, *your* gate, *your* box.

## Research findings (as of 2026-10-14)

- **Meta Muse** — personal AI agent. **Muse Wonder** models add **Active Memory** (carries what matters across conversations) and **Active Focus** (keeps working, recovers, **asks and checks in before following through on anything important** — the same rule as Paul's gate).
- **OpenAI Dots** — persistent agent, *agents-as-a-service*: subscribe, don't own. The counter-position is sovereignty. (Ksenia Se kept her local OpenClaw.)
- Deep mechanics (how each does memory/focus; what's replicable locally) = the open DSH research task.
- **The uncle** = junto member #1; problem = scheduling + tasks; currently ChatGPT/Grok; a Tesla in Manila. The app = upload files → agent → result, on exe.dev, processed by the M6.

## Open items

1. Write **`UNCLE-PILOT.md`** (his offer, the app scaffold, the demo script, the gate) — *the single next action.*
2. Run the **DSH research prompt** and fold findings back into `DAEMON-FORGE.md`.
3. **The 25-name warm list** — build it, send 10 messages (template in `~/Documents/CognitiveHarness/next-move-25.md`). This is the only revenue move.
4. Ingest the **Brendan Dell corpus** (`~/Documents/brendan-dell/`, 43 lessons, 90k words) into the archive when Paul says go.
5. **Foundry repo:** 56 uncommitted files (51 civic-fostercity) — Paul's call, not session work.

## Rules that bite

- Never read/print/commit credentials (`.env`, `auth.json`, `CREDENTIALS/`); keys are by reference only.
- Private corpus (Dell courses, Leavitt masterclass) stays local; never committed.
- No unattended agent on authenticated social/account sites (LinkedIn incident: the test profile is signed into Paul's real accounts).
- Gate-author ≠ builder.
- One recommendation + an escape hatch, never a menu. Evidence-backed claims only. Records have dates.
- Nothing merges toward the live svautopros shop bot without Paul reading the diff.

## How to resume

- New session already seeded: **`sovereign-daemon-forge`** (`pi --resume`, pick "Daemon Forge"). It was seeded on the M6 local model.
- Or start fresh here: `cd ~/Projects/sovereign-agent && pi` and point at `docs/SESSION-BRIEF.md`.
- For the deep research: run `docs/DSH-RESEARCH-muse-dots.md` on the DSH seat, or `fh or` for a fusion pass.
