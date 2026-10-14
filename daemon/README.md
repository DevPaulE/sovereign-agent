# hemera — the M6 daemon (router, not agent)

> **✅ LIVE as of 2026-10-14.** The M6 owns `@FoundryMercury_bot` (launchd `com.sovereign.hemera`, KeepAlive). Default agent `m6`; `@air <msg>` routes to the Air seat; `@m6 <msg>` to the M6 worker. Verified: `m6-ok` (1.1s), `air-ok` (29s), 0 409s. jev deployed at `~/dpi-work/jev` (mock test green).

**Decision (2026-10-14):** the M6 is always-on and idle, so **the M6 owns the bot and hosts the daemon**. `@FoundryMercury_bot` allows only **one** `getUpdates` consumer, so the M1 Max must **not** run `com.sovereign.hermes` on the same token (stopped 2026-10-14).

## What hemera is

A thin switchboard. Telegram message in → route to an agent → `pi` runs in a fixed workspace → reply back. The daemon holds the **trust boundary** and the **ledger**; the agents hold the work. **No model runs in the daemon** — the control plane is deterministic and auditable.

Named `hemera` (Greek "day," Hermes's counterpart) to avoid colliding with the LifeOS `USER/Daemon/` folder (which is your *public profile*, a different thing).

## Run it

```bash
NODE=~/.nvm/versions/node/v24.21.0/bin/node
$NODE ~/dpi-work/hemera/daemon.mjs --once "/status"   # test routing, no Telegram
$NODE ~/dpi-work/hemera/daemon.mjs --dry              # load, do not poll
$NODE ~/dpi-work/hemera/daemon.mjs                    # live poll loop (foreground)
```

## The flip (make the M6 the permanent daemon)

1. On the **M1 Max**, stop the competing poller:
   `launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.sovereign.hermes.plist`
   (it can stay installed for send-only use; only the poll must stop).
2. On the **M6**, install hemera as a launchd service:
   `cp ~/dpi-work/hemera/com.sovereign.hemera.plist ~/Library/LaunchAgents/ && launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.sovereign.hemera.plist`
3. Message the bot from the phone: `/status`. A reply proves the M6 owns the front door.

## Routing

- `/status`, `/agents` — control.
- `@air <msg>` → Air seat over SSH (M6→Air key `id_ed25519_hemera` authorized 2026-10-14).
- `@m6 <msg>` → M6 pi worker (default).

## Security boundary (irreversible — must hold)

- **Allowlist**: `TELEGRAM_PRINCIPAL_CHAT_ID` only. Any other chat → ignored, logged as denied.
- **Fixed workspace**: from `registry.json` (`~/dpi-work/workspace`). Never `$HOME`, never `~/.claude`.
- **Timeout** every turn (120 s) so a hung agent can't wedge the loop.
- **No shell interpolation** — `pi` is `spawnSync` with an args array.
- **No credential access**; no live shop-bot writes without Paul reading the diff.
- `.hermes.env` is read by path, **never printed**.

## Extending (Wang-shape, later)

Add agents by name in `registry.json`; route by prefix (`@scout …`, `@builder …`) when you have more than one. The ledger (`ledger.jsonl`) is the audit trail and the base for observability.

## Report rule

Every real run ends with a one-line Hermes update:
`~/.nvm/versions/node/v24.21.0/bin/node ~/dpi-work/hermes-notify.mjs "hemera: <result>"`

## Archive — full-text message log (2026-10-14)

Every inbound message and every reply is written **in full**, locally on the M6:
- `archive/transcript.jsonl` — machine-readable / searchable
- `archive/YYYY-MM-DD.md` — human-readable daily log

Read the tail from your phone: **`/log`** or **`/log 20`**.
Mirror to the Mac when it's on: `bash ~/Projects/sovereign-layer/hermes/pull-archive.sh`.

**Why at receipt:** Telegram's Bot API keeps updates ≤24h, delivers each once, and has no history endpoint — so the archive must be written as messages arrive (it is). **Privacy:** local only; never sent to an external API. **Backfill:** messages before 2026-10-14 were not archived.
