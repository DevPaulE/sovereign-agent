# THE LAB — architecting the M6 to take in people

> You have the lab: the M6 runs agents persistently (durable-pi), hosts models, and answers through one front door (hemera). What's missing is **tenancy** — a clean way for a stranger to become a resident without touching another resident's business. Architecture below; intake is your **warm network first**.

## The one-line model

**The M6 is the control plane; tenants are isolated workspaces + agents; the models are one shared pool.** The scarce resource is the model, not the agents. So tenancy is a *bookkeeping* problem (who is allowed what), not a hardware problem — until the pool saturates.

## The tenant record

Extend `hemera`'s `registry.json` from `{agents}` to `{tenants}`. One record per person:

```json
{
  "tenants": {
    "john-svauto": {
      "chat_id": "…",            // the allowlist — HIS only
      "workspace": "~/lab/tenants/john-svauto",
      "agent": "worker",          // which agent kind
      "lane": "local",            // local | subscription | paid-api
      "gate": "ddg",              // which gate verifies his work
      "state": "audit"            // audit | install | rent | paused
    }
  }
}
```

Four fields carry the whole business: **allowlist, workspace, lane, state.** The `state` field is the ladder (`LEAD-MAGNET.md`): audit → install → rent.

## The three walls (non-negotiable)

1. **Workspace wall** — every tenant writes only inside `~/lab/tenants/<slug>`. No shared folders, ever. (hemera already enforces a fixed workspace; this makes it per-tenant.)
2. **Identity wall** — the allowlist is one chat id per tenant. A message from tenant A never routes to tenant B's agent. hemera's allowlist becomes per-tenant instead of per-bot.
3. **Credential wall** — tenants never share credentials. Each tenant's keys (if any) live in their own `.env`; the lab's keys (OpenRouter, Ollama) are **the lab's lane**, metered per tenant in the ledger.

## The intake (your network, warm)

Your warm 25-name list is the first cohort. For each name:

1. **Audit** (free, ephemeral): a throwaway workspace + one run of the Dæmon Audit. No tenant record needed — a sandbox that dies. This is the lead magnet.
2. **Qualify**: they name a trigger → they become a **tenant** (`state: install`).
3. **Install** ($5,000): their workspace becomes permanent; their agent runs; the gate is theirs.
4. **Rent**: keep their agent alive and maintained — the recurring rung.

The lab takes people in **one at a time**, warm first. No public intake until the ladder works on your network.

## The scaling math (M6, 16 GB)

- **Agents are cheap.** Dozens of idle durable agents cost little — they're mostly session state.
- **Models are the ceiling.** The M6 serves *one* local model at a time (~7–8B fits; 14B is tight). So:
  - `lane: local` → shared, free, one-tenant-at-a-time on real work.
  - `lane: subscription` → your Ollama cloud allowance; concurrent.
  - `lane: paid-api` → OpenRouter Auto; per-tenant metered.
- **The rule:** local for ambient/cheap work, subscription/paid for real work. The lab's job is routing, not hosting everything.
- **When it saturates:** move heavy tenants to **exe.dev** sandboxes — same architecture, different host. The M6 stays the control plane.

## Build order (smallest first)

1. **Per-tenant workspaces + allowlist** in hemera's registry (the walls).
2. **The ledger** already exists (`hemera.db`) — add a `tenant` column so spend is per-person.
3. **The audit runner** — a sandbox that takes one folder and emits the one-page audit.
4. **The settling** — the onboarding interview (`onboarding/interview.md`) writes the tenant record.
5. **exe.dev fallback** — for a tenant whose lane outgrows the M6.

## The line to hold

**The lab is not the product.** The lab is where the product runs. Don't architect for a thousand tenants; architect for the first ten warm names and let the walls prove themselves before the load does.
