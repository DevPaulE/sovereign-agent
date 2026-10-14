# Security — the trust boundary

This is **remote code execution on an always-on machine.** The boundary is the product.

## Non-negotiable
- **Allowlist** = the principal's chat id only. Unknown chat → ignored, logged.
- **Fixed workspace** (from `registry.json`). Never `$HOME`, never `~/.claude`, never credentials.
- **No credential read/print/copy.** `.env` is referenced by path, never loaded into a model or a log.
- **Nothing destructive without a gate** (author ≠ builder).
- **Every build reviewed by a different vendor's model.** The builder never grades its own work.

## Why the boundary is the whole product
The hosted personal-agent products (OpenAI Dots, Claude in Slack, Meta Muse) leak because they have no boundary — a leaked finance thread in a company Slack is the canonical failure. This kit's boundary IS the differentiator: an agent you own, that cannot act outside its yard.
