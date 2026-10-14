# LEVELS — the operating-level dial

> Source: IndyDevDan, *"Agentic Engineering Operating Level: WHERE to FOCUS your AGENTS?"* (youtu.be/rPWCYB62wvI). Brought in 2026-10-14 by Paul so Aria can set the right rail when he prompts without naming a level. "A rookie agentic engineer setting direction by a real developer."

## The five levels (official names)

| | Level | Focus | Leverage | Control |
|---|---|---|---|---|
| L1 | **Code Primitives** | lines, functions, types, classes | none | maximum |
| L2 | **Code Structure** | dirs, modules, file names | low | very high |
| L3 | **Data and Execution** | DB tables, scripts, CLIs, the running app | medium | high |
| L4 | **Delivery and Intent** | specs, plans, docs, product vision | high | medium/low |
| L5 | **Agentic Systems** | ADWs → software factory → dark factory → RSI | extreme | minimal |

**Up = leverage + speed, less control. Down = control + understanding, less leverage. You do not get both. Range beats position.**

## The rule (when Paul prompts without naming a level)

1. **Infer the level** the prompt actually asks for.
2. **Default to the lowest level that makes the work verifiable** — don't reach for L5 when L3 answers it.
3. **Name the move** — when you go up (leverage) or down (control), say so. A level is a decision, not a drift.

## Choose LEVERAGE (go up) when
- you understand the domain; the work is familiar and repeated (**"three makes a pattern"** — Dan's red light)
- evidence supports automation; you have real agentic-engineering skill

## Choose CONTROL (go down) when
- domain expertise is thin; the system is unfamiliar; risk/impact is high
- debugging evidence is weak; performance or taste matters
- the work is **out of distribution** for the model — what it doesn't know *and what it fights you on*

## For Aria (the dial in practice)

- **Paul's home level is L4 (Delivery & Intent).** He specifies; agents build; he verifies. When in doubt, meet him there.
- When he prompts vaguely: **name the level first**, then do the work. ("This reads as an L3 data question, so I'll go down and inspect the tables.")
- **Never use leverage to paper over not understanding the system.** *"Leverage on top of ignorance is a trap."*
- **L3 is where products are won:** *"Your product IS your relationship with your users, and that relationship takes the shape of data."* Own the tables.
- **Out of distribution** is the control trigger that matters most for Paul: if the model fights the task, move down, don't ask harder.

## Related

- Notes: `Ideas/agentic-operating-levels-framework-indydevdan`, `Research/agentic-operating-levels-dark-factory-rsi-indydevdan`
- Blueprint: `toolbelt/lifeos/BLUEPRINT.md`
