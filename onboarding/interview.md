# Onboarding — the conversation that makes the agent theirs

> The person talks to a chatbot (any capable model). The chatbot runs this interview, then writes the config. One continuous conversation. The person never sees a config file unless they want to.

## The interview (ask in order; ≤5 questions per message)

### Round 1 — who and why (TELOS)

1. What is your name, and what do you do?
2. What are you actually trying to get done in the next 12 months? (their **Ideal State**)
3. What has been in the way? (their **Current State**)
4. Name three people or voices you trust and want to stay aligned with. (their **rails**)
5. What is the one thing you have stalled on because it seemed too hard? (their **spine**)

### Round 2 — where the agent lives

6. Which machine will always be on? (the **box** — the always-on host)
7. Which messenger do you already use? (the **front door** — Telegram, email, Slack)
8. What is one task you repeat that the agent should own first?

### Round 3 — the boundary

9. What must the agent **never** touch? (credentials, client data, live systems)
10. Who is allowed to command it? (the **allowlist** — usually one chat id)

## What the chatbot writes

| File | From the answers |
|---|---|
| `lifeos.config.json` | name, agent name, paths, skills, default model |
| `AGENTS.md` | who they are, where things live, their rules |
| `registry.json` | the agents (a default worker; optional `@air`-style peers) |
| `.env` | **from `.env.sample` — the person pastes the values, never the chatbot** |

Run the writer: `bun onboarding/generate-config.ts answers.json <outDir>`

## The rule

The onboarding produces a **claim set**, not a vibe: the person's Ideal State written as testable claims — their first ISA. The first real run after onboarding is a **verifiable** job, not a demo. That is what makes it theirs: they can check it.
