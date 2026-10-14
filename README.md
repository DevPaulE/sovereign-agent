# Sovereign Agent — hand one person an agent they own

> Not another assistant you subscribe to. An agent that lives on a machine the person **owns**, talks through a messenger they already use, remembers everything, and cannot act without a gate. You are the architect; you hand over the house. **The onboarding is a conversation.**

## The four things (remove any one and there is no system)

1. **The front door — `hemera`** (`daemon/`). A router, not an agent. One bot, an allowlist, a fixed workspace. It answers, archives, and queries; it never does the work itself.
2. **The substrate — `pi` + the harness config** (`harness/`). The agent's body and its rules.
3. **The memory — the archive + SQLite** (`daemon/`). Every message and every run, owned by the person, never rented.
4. **The conscience — the gates** (`security/`). Author ≠ builder · evidence you ran · nothing destructive without review. This is the thing the hosted products don't have.

Everything else is a module. A module stays only if it names the layer it serves.

## The handoff, in four steps

1. **Onboard** — the onboarding chat (`onboarding/interview.md`) asks the person who they are and what they want. `onboarding/generate-config.ts` turns their answers into *their* `lifeos.config.json`, `AGENTS.md`, and `registry.json`.
2. **Install** — `harness/install.ts` on their box; `daemon/` and `sentinel/` as always-on services.
3. **Verify** — the gates run; the agent's first job is a verifiable one, not a demo.
4. **Own** — their machine, their key, their data. Nothing is rented.

## What's here

| Path | What it is |
|---|---|
| `harness/` | the pi config → build → reload loop; prompts (the person's moves); skill shims |
| `daemon/` | `hemera` — the router, allowlist, archive, SQLite (`/q`), Hermes sender |
| `sentinel/` | the **proactive trigger** — stream → cheap classifier → agent → notify only if it matters |
| `extensions/` | `jev-router` (route by intent) + `subagent` (delegation) |
| `docs/` | `BLUEPRINT.md` (the template), `LEVELS.md` (the operating-level dial), `OPERATING.md` (the walkthrough) |
| `onboarding/` | the chat-LLM onboarding: the interview + the config writer |
| `security/` | the prohibitions and the trust boundary |

## What is NOT here — and never should be

- **No credentials.** `.env.sample` lists key **names** only.
- **No personal layer, no client data, no instance knowledge base.**
- The architect's own instance docs are not shipped. `docs/BLUEPRINT.md` is a **template** with placeholders — the person's onboarding fills it.

## The onboarding layer — the whole point

The person talks to a chatbot that **understands the system**, and it configures their agent. That is the product: not the code (the code is here), but the *conversation that makes the code theirs*. `onboarding/interview.md` is that conversation; `onboarding/generate-config.ts` writes the result.

## The story — your dæmon

**You don't get an AI agent. You get your dæmon — and it settles to you.** The onboarding is *the settling*; the chart names the form (Sun = essence, Rising = form, Mercury = voice, Moon = instinct, Chiron = gift); you are the **dæmon-namer**. A single product for millions cannot settle — **one dæmon per person can.** See [`docs/DAEMON.md`](docs/DAEMON.md).

## Origin

Built from the convergence of four directions: IndyDevDan (harness engineering; jev classifiers; durable/proactive agents), Andrew Ng (evaluation-driven development; the tool-call bottleneck; shaping the build), Daniel Miessler (LifeOS: Current→Ideal, TELOS, intent engineering), and Earendil/Mario Zechner (durable agents; pi mobile). The insight all four share: **own the harness, or you rent your agents.**
