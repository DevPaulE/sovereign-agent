# THE SYSTEM — blueprint (v1, 2026-10-14)

> The one-page explanation of what Paul is building — by Paul, for Paul, and for whoever he gives a house to next. Every line is a **decision**, not a description. Correct anything wrong; this is the decision record, not a spec to obey.

## The four things (remove any one and there is no system left)

1. **The front door — `hemera`.** A router (not an agent) on the always-on M6. It owns one Telegram bot, authenticates (allowlist), routes a message to an agent, returns the reply. *Remove it → no reach.*
2. **The substrate — `pi` + `pi-lifeos`.** The harness and its config (skills, prompts, context). *Remove it → no body or identity.*
3. **The memory — the Knowledge Archive + the message archive.** What the system knows and what it has been told. *Remove it → no continuity, no brain.*
4. **The conscience — the gates.** Gate-author ≠ builder · evidence you ran · every run leaves a report. *Remove it → nothing is trustworthy; just a bullhorn.*

Everything else is a **module**. A module stays only if it names the layer it serves.

## The layers

- **Identity** — conversation engineer · architect above Dan · nagaraka · CEO of a factory
- **Role** — specifier/verifier: *"thin in content, decisive in direction"*
- **Substrate** — pi · pi-lifeos
- **Memory** — Knowledge Archive · message archive
- **Direction** — three rails: Turing Post (ethical critic) · Ng (field direction) · Miessler (architectural upstream)
- **Verification** — gates
- **The spine** — one high-leverage project (named below)
- **The ship** — a vision made real and tested on market/research/application
- **The feeling** — Euphoric Surprise (the meta-goal above every task)

## Layer 8 — the feeling (Euphoric Surprise)

Miessler's meta-ideal-state: above every task's specific criteria sits the same universal goal. For this system it is:

> **The moment you ask in your own words, from anywhere, and what comes back is better than you would have asked for — you couldn't have specified it, and you didn't have to.**

What that looks like, concretely:
- One sentence from your phone → the daemon routes it to the right agent at the right level (leverage or control, correctly chosen — *and you didn't have to know the levels*), the agent does real work, and the reply is the thing you'd have asked for if you'd known how to ask.
- The level was set right without you knowing the levels exist.
- The house was built without you watching the build.

**It is not:** a fast answer, a working build, a good report. Those are table stakes. Euphoric surprise is the *gap between what you asked for and what you got — in the good direction.*

## What it is NOT

- Not Claude Code. Not Miessler's LifeOS adopted whole. Not a pile of tools.
- `hemera` is not an agent; the daemon does not do work.
- No credential in any repo. No unattended run on the live shop bot.

## Invariants (seams that must hold)

1. **One bot, one `getUpdates` consumer.**
2. **Every message + reply is archived in full** (Telegram keeps updates ≤24h; it must be written at receipt).
3. **Agents run only inside a fixed workspace** (never `$HOME`, never `~/.claude`).
4. **Nothing destructive without a gate.**
5. **Every addition names the layer it serves** ("everything pays rent").

## The spine (name it)

**The Riemann hypothesis: the Meta-muse dispatch.** Telegram → a persistent agent → recall from my knowledge → dispatch named subagents → return a graded report.
**First verifiable job:** the Leavitt watcher (an expert video → claims with timestamps → cross-check against my scanner → a graded report).
**Budget:** ~20% of token spend + ~10 hrs/week, measured on the performance / cost / speed trinity.

## The five-minute explanation (in my words — draft)

> I'm building my own agent harness — a house — where the agents do the visible work and I'm the one who decides and verifies. It lives on a Mac mini at home that's always on, reachable from my phone through Telegram. It remembers everything in my archive, it's pointed by three voices I trust, and it isn't allowed to ship anything I haven't gated. One day I'll hand the same house to someone else, configured for them — and they'll talk to me, the architect, to have it built.

## Status

v1, 2026-10-14. Derived by Aria from the session; **Paul owns and corrects every line.** Companion: `AUDIT.md` (authored vs accumulated).
