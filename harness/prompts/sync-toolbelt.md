---
description: Refresh toolbelt copies from this Mac, scan for secrets, commit and push
---
1. Run `bun ~/Projects/toolbelt/sync.ts`.
2. In `~/Projects/toolbelt`, show `git status --short` as a summary (count by folder).
3. Scan the changes: `trufflehog filesystem ~/Projects/toolbelt --no-update`. Any verified or unverified secret → stop and tell Paul.
4. Confirm nothing from `~/.config/LIFEOS/USER/` TELOS, PRINCIPAL, FINANCES or CREDENTIALS, and no `.env` or `auth.json`, is staged.
5. Commit with a one-line message saying what changed, push, and show `ahead=0`.
