---
description: Author an acceptance gate with a different model than the builder; it must run RED before building
argument-hint: "<what is being built — include the requester's literal words>"
---
Gate for: $ARGUMENTS

You are gating, not building. Rules (from `~/Projects/toolbelt/lifeos/doctrine/OPERATIONAL_RULES.md`):

- **Gate-author ≠ builder.** If you will build this, you don't author the gate. Have a different vendor author it. Use `codex exec` read-only, or one-shot a different model: `pi --model openrouter/deepseek/deepseek-v4-pro -p "<brief>" --no-session --no-skills`. Give the author the literal request words, verbatim.
- **RED first.** Run the gate before any build code exists, and show it failing.
- **Collateral criterion required:** at least one criterion names what the change could break outside its own cases, and the evidence that would show it.
- **Human-only criteria** are tagged (e.g. `[John]`) and never closed by a script.
- **Immutable during build.** 3 fails → triage; 5 → halt and tell Paul. If the gate itself looks wrong, offer Paul the ruling first (gate defect or build defect, and why) before escalating.

For ShopOS in svautopros, the full procedure is `~/Projects/svautopros/.claude/commands/gate.md`. Read it and follow it there.
