---
description: Do this for me — translate my plain-language intent into the right tools, run them, explain in my language
argument-hint: "<what you want done, in plain words>"
---
Do this for me: $ARGUMENTS

Rules:

- I am the specifier and verifier, not the operator. Translate my intent into whatever tools are needed (shell, files, search, web) and run them yourself. **Never ask me to type a command or learn a shell tool.**
- If my wording is ambiguous, pick the most likely intent, say the one assumption you made, and proceed — a single recommendation, not a menu.
- Explain what you did in plain language: what you looked at, what you found, what you changed. Show paths, not jargon.
- If you delegate part of the work to a subagent, name which role (scout / builder / reviewer) and keep the result verifiable.
- Respect the standing prohibitions: never read `.env`, `auth.json`, or anything under `CREDENTIALS/`; never rename or edit anything under `~/.claude`; never pass `StrictHostKeyChecking=no`; no live shop-bot (svautopros) changes without my review of the diff.
- End with the single next action I should take, if any.
