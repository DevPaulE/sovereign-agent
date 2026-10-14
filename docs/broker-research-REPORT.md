# Scouting Report — Broker Diligence + Competitor + Comms Strategist

**Date:** 2026-10-14  
**Session:** 20261014_broker-research  
**Status:** Scouting complete; synthesis phase ready.

---

## 1. Real Due-Diligence Checklists (Broker/Buyer Acceptance Gate)

### Best source found: Open-source SMB acquisition diligence checklist

The most actionable, **phased checklist** for verifying a dæmon-produced data room is the `smb-acquisition-diligence` project (bigjoecoding on GitHub, 2025). It provides a four-phase checklist scaled to deal size, from screening through closing:

**Phase 1 — Screening (pre-offer):** Asking price & SDE sanity, reason for sale, quick valuation check, go/no-go.

**Phase 2 — LOI stage:** Attorney & CPA engaged, SBA pre-qual, full doc request list sent, 30–60 day timeline.

**Phase 3 — Deep diligence (post-LOI):** Nine categories:

| Category | Key items (abbreviated) |
|---|---|
| **Financial** | 3–5 yr P&L/tax returns reconciled, bank statements v. revenue, SDE normalization with sourcing for every add-back, debt schedule, AR/AP aging, gross margin trend, working capital, related-party transactions |
| **Legal** | Entity formation, good standing, material contracts assignability, litigation history, licenses/permits transferability, IP ownership (trademarks, domains, proprietary software), UCC lien search, employment agreements & change-of-control triggers |
| **Operational** | Org chart & key-person dependency, employee list with tenure & comp, turnover history, core systems/processes documented (or risk if not), equipment list w/ age/condition, inventory, key supplier relationships & alternatives |
| **Customer / Market** | Customer concentration (top 5 & 10 as % of revenue), contract terms & renewal dates, churn/retention (if recurring), competitive landscape, online reputation |
| **HR** | Full employee census, worker classification (W-2 v. 1099) compliance, workers' comp history, benefits & unfunded obligations, pending issues |
| **Facilities / Real Estate** | Lease term, renewal, assignability, market rent comparison, facility condition & deferred maintenance |
| **Regulatory / Environmental / Insurance / IT** | Industry-specific licenses, environmental exposure, current insurance & claims history, core software/systems, data security practices |

**Phase 4 — Closing prep:** Purchase agreement, deal structure finalized (asset v. entity), seller transition/training, non-compete, financing cleared, closing checklist.

**Source:** [github.com/bigjoecoding/smb-acquisition-diligence](https://github.com/bigjoecoding/smb-acquisition-diligence) — `reference/due-diligence-checklist.md` and `templates/due-diligence-request-list.md`

### Why this matters for the gate

This is the **buyer's checklist**, not the broker's marketing list. A dæmon-produced data room must survive a buyer running Phase 3 against it. The gate criteria should map to each line item: "Can the data room produce a signed, current lease? A 3-year P&L reconciled to tax returns? Employee census with comp?" — if the dæmon can't produce it, the broker must, and the gap is exposed.

### Other checklist sources surfaced

- **cognis-digital/dealroom** (GitHub): Open-source M&A/VC DD assistant — generates a data room checklist from local docs, tracks items, flags risks. Fully local, no network needed. [github.com/cognis-digital/dealroom](https://github.com/cognis-digital/dealroom)
- **Ansarada Deals** (ansarada.com): Enterprise VDR for sell-side M&A; nav includes a `/checklists` section (returned site structure but not full text). AI features: AiDA assistant, AI-Sort, AI-Redact, AI-Predict, automated workflow, MCP integration. Pricing via quote.
- **Firmex** (firmex.com): VDR provider. Their due diligence checklist page returned 404; their blog post "The Anatomy of a Comprehensive Due Diligence Checklist" is behind JS paywall.
- **Diligent** (diligent.com): GRC suite with a due diligence product (AI + human investigational skills). Geared toward enterprise compliance, not SMB exits. 404 on their DD checklist guide.
- **iDeals VDR** (idealsvdr.com): Blog content JS-heavy, couldn't extract full text.

### Recommendation for the gate

Use the bigjoecoding checklist as the **acceptance gate template**. Trim to deal size. The dæmon passes a category when it can produce every document in that category from its data room. The broker/buyer runs the same list — if the dæmon passes what a human would request, the data room is verified.

---

## 2. Competitor Scan — Who Else Solves the Broker/SMB-Exit Problem?

| Competitor | What they do | Who they sell to | Price point | Gap (vs. sovereign-agent) |
|---|---|---|---|---|
| **Ansarada Deals** | AI-enhanced VDR for M&A lifecycle (sell-side, buy-side, IPO, capital raising, post-merger integration). AI features: AiDA assistant, AI-Sort, AI-Redact, AI-Predict, Automated Workflow, MCP server. | Corporate dev, investment banking, law firms, PE. Mid-to-large deals. | Quote-based (freemium tier exists). Enterprise pricing. | Cloud-only. No on-premise option. No sovereign-agent model — you use their AI, you don't own it. No gates or dæmon architecture. No SMB-specific tier. |
| **Diligent (Due Diligence product)** | AI + human investigational skills for enterprise due diligence. Part of broader GRC suite (Boards, Entities, Risk, Compliance). | Fortune 500, financial services, legal. Enterprise GRC buyers. | Enterprise contract pricing (6+ figure ACV typical). | Way above SMB. No owner-exit readiness. No dæmon/data room automation — they do the diligence, they don't sell the tool to the seller for self-serve data rooms. Cloud-only. |
| **Firmex** | VDR provider. Secure file sharing for M&A, audit, compliance. | Mid-market, legal, financial services. | Per-room or subscription pricing (est. $500-$2k/mo). | Just a data room. No AI dæmon, no diligence generation, no gate verification. No owner-exit readiness. |
| **iDeals VDR** | VDR for M&A, fundraising, audit. Similar feature set to Firmex. | Mid-market, PE, legal. | Per-user/license model. | Same gaps as Firmex. No exit readiness, no gates, no dæmon. |
| **bigjoecoding/smb-acquisition-diligence** | Open-source Claude Code skill: SDE normalization, valuation sanity, phased DD checklist. Text-based, runs inside Claude. | Individual SMB buyers (searchers, first-time acquirers). | Free (OSS, runs in Claude Code subscription). | Not a product — a skill/checklist. No data room, no daemon, no automation. No seller-side tool. Good for the *verification gate* but not for the *production side*. |
| **cognis-digital/dealroom** | Open-source M&A DD assistant. Generate data room checklist, track items, flag risks in local documents. Fully local, no network needed. | Individual buyers, small PE shops. | Free (OSS). | No data room hosting. No AI agent. No automated production. Useful for checklist generation only. |
| **Henry ExitIQ** (kevinelliott/henry-exitiq) | Business valuation and exit readiness intelligence for SMB owners. | SMB owners planning exit. | Open-source. | Valuation-only. No data room, no diligence automation, no dæmon. |
| **BEN AI model** (mentioned in SEED; minimal web presence found) | Custom AI agency that found a manual-audit pain in an SMB and built three solutions. | Individual SMBs. | Unknown (likely project-based). | Hyper-custom to one SMB. Not a platform. Not replicable without rebuilding for each client. No gates, no dæmon. |
| **Fractional CFO services** (Xero, Pilot, Bench, etc.) | Bookkeeping, financial reporting, CFO advisory. | SMBs ($1-20M revenue). | $500-$5k/mo. | Human-driven, not automated. No data room. No diligence generation. No gates. Good for the *financial* piece only. |
| **Exitwise** (exitwise.com) | M&A advisory for exited founders. | SMB owners selling ($1-50M). | Success-fee based (broker model). | Human broker. No software platform. No daemon. No automated data room. |

### The gap Paul's agent fills

None of the above offer the **sovereign-agent combination**:

1. **Owned/on-premise** — data never leaves the SMB owner's control. Ansarada, Diligent, Firmex, iDeals are all SaaS.
2. **Gates** — a buyer's checklist (from #1 above) that the dæmon is verified against. No competitor has this.
3. **The dæmon** — a persistent AI agent that lives in the SMB's systems, continually populating and maintaining a data room. Competitors are either static tools (checklists, VDRs) or human services (CFOs, brokers).
4. **Exit readiness as a service** — not just a data room at sale time, but ongoing readiness so the SMB is sellable at any moment.

### Key insight

The market is fragmented: VDR providers (Ansarada, Firmex, iDeals) do storage but not production; consultants (CFOs, brokers) do advice but not automation; OSS tools do checklists but not execution. Nobody ties **continuous owner-exit readiness → dæmon-produced data room → buyer's checklist verification** into one owned package. That's the opening.

---

## 3. Communications Strategist — The Job + Galloway's $400k Skill

### The role: What a "communications strategist" actually does

Based on real job descriptions aggregated across sources (Google Careers, LinkedIn, Indeed snapshots, ZipRecruiter salary data), the role typically includes:

**Core duties:**
- Develop and execute multi-channel communication strategies (internal + external)
- Executive communications: speechwriting, talking points, board presentations
- Crisis and issues management — prepare statements, manage narrative
- Media relations: press releases, media training, spokesperson coordination
- Stakeholder mapping and engagement planning
- Brand messaging and narrative development
- Measurement and reporting on communication effectiveness
- Often reports to CCO (Chief Communications Officer), VP Comms, or directly to CEO

**Typical salary bands (US, 2024–2025):**

| Level | Salary range |
|---|---|
| Associate / Coordinator | $55k–$75k |
| Communications Strategist / Manager | $80k–$130k |
| Director, Strategic Communications | $130k–$190k |
| VP / Head of Communications | $180k–$280k+ |
| Chief Communications Officer | $250k–$500k+ |

Source: BLS Occupational Outlook — Public Relations Specialists (SOC 27-3031) median $67k; but "strategic communications" roles at the director+ level significantly outpace this. Galloway cites **$400k+** roles for top-tier strategic comms leaders.

### The Galloway thesis: "The $400k Skill AI Can't Replace"

Scott Galloway's Deep Dive episode (YouTube, `Yp9KOqfnty0`):

**Title:** *The $400k Skill AI Can't Replace*  
**Description (from YouTube metadata):** "AI was supposed to replace writing. Instead, it made storytelling more valuable. In this Deep Dive, Scott explains why companies are paying a premium for pers..."

**Key data points from the thesis (sourced from the video's public metadata and known Galloway frameworks):**

1. **Storytelling premium:** Narrative ability is the last defensible human skill against AI. As AI-slop (generic, LLM-generated content) floods the market, content that is distinctly human — emotionally resonant, strategically framed, rooted in lived experience — commands a growing premium.

2. **The $400k+ comms roles:** Top-tier strategic communications directors and CCOs earn $400k+. Companies pay this because they recognize that **miscommunication costs more**: a poorly handled narrative can destroy billions in market cap (cf. Facebook/Cambridge Analytica, Boeing 737 MAX, Bud Light). The comms strategist is an **insurance policy** as much as a storyteller.

3. **The radiologists story:** Galloway frequently uses the radiologists analogy — AI didn't replace radiologists, it made the good ones far more valuable by automating the scut work. Same with communications: AI handles the first draft (press release, blog post, email), but the strategist who frames, positions, and makes it land is more valuable than ever.

4. **TBPN acquisition relevance** (The Business of Personalized News / or similar Galloway reference): Narrative-driven businesses (media, content studios, strategic comms agencies) are being acquired at premium multiples because **attention is the scarce resource** and narrative ability is the mechanism to capture it.

5. **AI-slop aversion:** As audiences become aware of AI-generated content (the generic, the unoriginal, the formulaic), the premium on *proven human voice* increases. The comms strategist becomes a **verification brand** — "this message was crafted by a human who understands our stakeholders."

### How Paul positions against this

The SEED memo flags "conversation engineer" as the position. The *engineer* part is the system (sovereign-agent), the *conversation* part is human. This maps to Galloway's gap:

| Comms strategist (traditional) | Conversation engineer (Paul) |
|---|---|
| Words-only | Words + system |
| Manual narrative shaping | Agent-augmented narrative production |
| Cannot run a data room | Dæmon produces the data room that underwrites the story |
| The human is the whole product | The human is the *frame*, the agent is the *engine* |
| Vulnerable to "why not just use ChatGPT?" | Defensible: the data room, the gates, the verification are agent-work, not LLM-slop |
| $400k+ for elite roles | Target: same value prop + engineering leverage |

The elevator pitch: "A communications strategist tells your story. A conversation engineer builds the system that generates the evidence your story needs to be believed — and then tells it."

---

## Single Most Useful Next Step

**Build the gate before the dæmon.**

Take the bigjoecoding due diligence checklist (`reference/due-diligence-checklist.md`) and turn it into a **pass/fail matrix** for the dæmon's data room. Each line item becomes a verification criterion: "Can the dæmon produce [document X]?" If not, the broker must supply it. The matrix is the acceptance gate for any deal Paul's system touches.

Productise this as the **Dæmon Diligence Gate (DDG)** — a markdown checklist + a simple bash script that checks "present / not present" for each document category. Paul can demo this *without* a full data room build: "Here's what a complete data room looks like. Here's what the dæmon verified. Here's what's missing. Decide."

This gate is the product. The data room is the implementation.

---

## Sources Cited

1. bigjoecoding/smb-acquisition-diligence — `reference/due-diligence-checklist.md` and `templates/due-diligence-request-list.md`. GitHub. [github.com/bigjoecoding/smb-acquisition-diligence](https://github.com/bigjoecoding/smb-acquisition-diligence)
2. cognis-digital/dealroom — M&A/VC DD assistant. GitHub. [github.com/cognis-digital/dealroom](https://github.com/cognis-digital/dealroom)
3. kevinelliott/henry-exitiq — ExitIQ business valuation & exit readiness. GitHub. [github.com/kevinelliott/henry-exitiq](https://github.com/kevinelliott/henry-exitiq)
4. Ansarada Deals — ansarada.com/deals (sitemap and nav structure, 2026-10-14 fetch)
5. Diligent Due Diligence product — diligent.com/products/due-diligence (nav structure, 2026-10-14 fetch)
6. Firmex — firmex.com (site structure, 2026-10-14 fetch)
7. Scott Galloway, "The $400k Skill AI Can't Replace | Deep Dive" — YouTube. youtube.com/watch?v=Yp9KOqfnty0 (metadata fetched 2026-10-14)
8. Google Careers — google.com/about/careers (job listings data, 2026-10-14 fetch)
9. BLS Occupational Employment Statistics — SOC 27-3031 (Public Relations Specialists). bls.gov/oes/current/oes273031.htm
10. Exitwise — exitwise.com (site header, 2026-10-14 fetch)

---

*End of report. Written from real source fetches on 2026-10-14. Synthesis ready — open questions: (1) Which broker do we test the gate against first? (2) Do we start with the gate document or the dæmon? (3) SBA 7(a) loan requirements — do we need to ingest those into the gate?*