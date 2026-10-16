# JEV TRIAGE TRIAL — results (turn 26 follow-through)

Prompt contract: `~/Documents/CognitiveHarness/next-move-26.md`. Model: `typesafe/jev-1.14-20261014`.

| Source | collection | type | privacy | duplicate | verdict |
|---|---|---|---|---|---|
| Pi Durable (Mario/Armin) | `agentic-engineering` 1.00 | Research 0.87 | public 0.99 | extend-existing 0.96 | correct ×4 |
| Ng AI Engineering Skills Map | **`career` 0.94** | — | — | extend-existing 0.87 | **disagrees with human: it is both `agentic-engineering` and `career`** |
| Plutarch (content withheld) | `plutarch-education` 0.99 | — | `personal-reflection` 0.93 | — | **correct from descriptor alone** |

## Two amendments before wiring Jev into Harvest

1. **`collections` must be a list.** The Ng source legitimately belongs to two tables. A single-choice schema forces a wrong answer on genuinely dual-purpose sources.
2. **Content-free mode for the personal layer.** The Plutarch trial proves routing works from a descriptor with the content withheld — so personal-layer sources never need to reach a hosted model. Prefer the local seat (ollama-m6) when content must be read.

## Still blocked

Transcript `HDdbU10r7Js` — the transcriptio API auth scheme is now confirmed (`Authorization: Basic base64(<token>:)`), but the token on disk is invalid. Paul regenerates it in his youtube-transcript.io profile.
