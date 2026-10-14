---
description: Several models answer the same question independently; merge with attribution, keep the disagreement
argument-hint: "<question or approach decision>"
---
Fuse: $ARGUMENTS

Run the question past decorrelated models, independently, then merge. Paul reviews the disagreement, not the work.

- **Default tool: fh.** One-shot: `fh fusion -p "<question + minimum context>"` (stacks in `~/.pi/fusion-harness/`; `fh 5` for five seats). For a live session he runs `fh` himself and uses `/fh-opinion`, `/fh-debate`, `/fh-fusion`.
- No customer PII in any brief.
- Output one table: **consensus** (who agreed) · **divergence** (each position, attributed) · **discarded** (what was dropped and why). Then one recommendation with its reason.

Reference: `~/Projects/svautopros/.claude/commands/fuse.md`.
