# DSH RESEARCH — how Muse and Dots work (and what the forge takes from them)

Paste this into DSH. Goal: a decision-grade comparison, not a product tour. Return a single markdown brief under 1,200 words with citations.

---

## The question

**How do Meta Muse and OpenAI Dots actually work — and what should a person-owned "dæmon forge" adopt or avoid from each?**

## What I already know (verify, correct, extend)

- **Meta Muse** = a *personal AI agent*. The **Muse Wonder** models ship **Active Memory** (carries what matters to you across conversations; resurfaces task-relevant detail) and **Active Focus** (keeps working when a task gets hard, tries other approaches, recovers from errors, **asks for clarification, and checks in before following through on anything important**).
- **OpenAI Dots** = a persistent agent, **agents-as-a-service**: subscribe, don't own. Ksenia Se kept her local OpenClaw instead.

## Research tasks

1. **Active Memory — the mechanics.** Is it retrieval (RAG over a stored profile), a fine-tuned memory, a scratchpad, or a managed memory service? Retention window? Does it persist across devices? Can the user inspect or export it? Correct me if the framing is wrong.
2. **Active Focus — the mechanics.** Is it a loop (plan → attempt → self-check → retry), a supervisor, or a model trained for long-horizon tasks? Where does the "checks in before following through" gate live — policy, prompt, or model?
3. **Dots — the architecture.** What actually persists (session, memory, tools, compute)? Who owns it (OpenAI vs the user)? What happens to your data? Pricing/access model?
4. **The sovereignty delta.** For a personal agent whose data is sensitive: what specifically can *not* be owned/replicated from each product, and what *can* be replicated locally (retrieval memory, a check-in gate, an ideal-state config)?
5. **The maturation/evolution design.** If a personal agent must "mature but not drift," what mechanism do these products use (or what does the literature suggest)? Specifically: how do you keep a stable identity and a single deliverable while letting memory accumulate?

## Constraints

- Public sources only. No login-walled content.
- Distinguish **shipped** from **announced** from **speculated**. Date each claim.
- For each finding, say: **adopt** (use it in the forge) / **avoid** (it's the thing we're differentiating against) / **watch**.

## Output

A markdown brief:
1. Muse, in mechanics (Adopt/Avoid/Watch)
2. Dots, in mechanics (Adopt/Avoid/Watch)
3. The sovereignty delta (what a person-owned dæmon can and can't replicate)
4. The maturation mechanism (how to grow without drifting)
5. One recommendation: the single most important thing the forge should take from each
