#!/usr/bin/env python3
"""Dæmon Diligence Gate: inventory evidence files without claiming they are valid.

Usage:
  python3 scripts/check-ddg.py /path/to/data-room
  python3 scripts/check-ddg.py /path/to/data-room --broker-supplied D1-pnl --output gap-report.md
  python3 scripts/check-ddg.py /path/to/data-room --stale-days 365

A filename match means PRESENT, not VERIFIED. Content, reconciliation, signatures,
transferability, and correctness require a human/buyer review. --stale-days is only
an mtime warning, not a judgment that the document is legally or commercially stale.
"""
from __future__ import annotations
import argparse
import os
import re
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

@dataclass(frozen=True)
class Item:
    id: str
    phase: str
    category: str
    label: str
    patterns: tuple[str, ...]

ITEMS = [
    Item("P1-sde", "Screening", "Financial", "Asking price / SDE normalization", (r"sde", r"seller.*discretionary", r"asking.price", r"valuation")),
    Item("P2-sale-reason", "Screening", "Seller", "Reason for sale", (r"reason.for.sale", r"seller.*statement", r"sale.*reason")),
    Item("P3-request-list", "LOI", "Process", "Diligence document request list", (r"document.request", r"diligence.request", r"request.list")),
    Item("P4-timeline", "LOI", "Process", "30–60 day diligence timeline / owners", (r"diligence.timeline", r"timeline", r"milestones")),
    Item("D1-pnl", "Deep diligence", "Financial", "3–5 year P&L", (r"p.?l", r"profit.*loss", r"income.statement")),
    Item("D1-tax", "Deep diligence", "Financial", "Tax returns (3–5 years)", (r"tax.return", r"tax.*filing")),
    Item("D1-bank", "Deep diligence", "Financial", "Bank statements / revenue reconciliation", (r"bank.statement", r"revenue.*recon", r"deposit.*recon")),
    Item("D1-debt", "Deep diligence", "Financial", "Debt schedule", (r"debt.schedule", r"debt.*summary", r"liabilit")),
    Item("D1-arap", "Deep diligence", "Financial", "AR/AP aging", (r"ar.*aging", r"ap.*aging", r"receivable", r"payable")),
    Item("D1-margin", "Deep diligence", "Financial", "Gross-margin trend / working capital", (r"gross.margin", r"working.capital")),
    Item("D1-related", "Deep diligence", "Financial", "Related-party transactions", (r"related.party", r"owner.transaction")),
    Item("D2-entity", "Deep diligence", "Legal", "Entity formation / good standing", (r"formation", r"good.standing", r"articles.of")),
    Item("D2-contracts", "Deep diligence", "Legal", "Material contracts / assignability", (r"contract", r"assignab", r"customer.agreement", r"vendor.agreement")),
    Item("D2-litigation", "Deep diligence", "Legal", "Litigation history", (r"litigation", r"legal.claim", r"lawsuit")),
    Item("D2-licenses", "Deep diligence", "Legal", "Licenses / permits", (r"licen[cs]e", r"permit")),
    Item("D2-ip", "Deep diligence", "Legal", "IP ownership", (r"intellectual.property", r"trademark", r"domain", r"software.ownership", r"ip.")),
    Item("D2-ucc", "Deep diligence", "Legal", "UCC lien search", (r"ucc", r"lien.search")),
    Item("D2-employment", "Deep diligence", "Legal", "Employment agreements / change-of-control", (r"employment.agreement", r"change.of.control")),
    Item("D3-org", "Deep diligence", "Operational", "Org chart / key-person dependency", (r"org.chart", r"organization.chart", r"key.person", r"owner.depend")),
    Item("D3-employees", "Deep diligence", "Operational", "Employee census: tenure / compensation", (r"employee.census", r"employee.list", r"staff.list", r"payroll")),
    Item("D3-turnover", "Deep diligence", "Operational", "Turnover history", (r"turnover", r"attrition")),
    Item("D3-processes", "Deep diligence", "Operational", "Core systems / processes / SOPs", (r"sop", r"process", r"standard.operating", r"systems.documentation")),
    Item("D3-equipment", "Deep diligence", "Operational", "Equipment list / condition", (r"equipment", r"asset.register", r"fixed.asset")),
    Item("D3-inventory", "Deep diligence", "Operational", "Inventory", (r"inventory", r"stock.list")),
    Item("D3-suppliers", "Deep diligence", "Operational", "Key suppliers / alternatives", (r"supplier", r"vendor.list", r"supply")),
    Item("D4-concentration", "Deep diligence", "Customer / Market", "Top-5 / top-10 customer concentration", (r"customer.concentration", r"top.?5", r"top.?10", r"customer.revenue")),
    Item("D4-contracts", "Deep diligence", "Customer / Market", "Customer contracts / renewals", (r"customer.contract", r"renewal", r"contract.schedule")),
    Item("D4-churn", "Deep diligence", "Customer / Market", "Churn / retention", (r"churn", r"retention", r"cohort")),
    Item("D4-competition", "Deep diligence", "Customer / Market", "Competitive landscape / reputation", (r"competitive", r"market.analysis", r"reputation", r"reviews")),
    Item("D5-census", "Deep diligence", "HR", "Full HR census", (r"hr.census", r"employee.census", r"personnel")),
    Item("D5-classification", "Deep diligence", "HR", "W-2 / 1099 classification", (r"w.?2", r"1099", r"worker.classif")),
    Item("D5-workers-comp", "Deep diligence", "HR", "Workers' comp history", (r"workers.?comp", r"workers.compensation")),
    Item("D5-benefits", "Deep diligence", "HR", "Benefits / unfunded obligations", (r"benefit", r"unfunded.obligation", r"pension")),
    Item("D6-lease", "Deep diligence", "Facilities", "Lease: term / renewal / assignability", (r"lease", r"rent.agreement")),
    Item("D6-facility", "Deep diligence", "Facilities", "Facility condition / deferred maintenance", (r"facility.condition", r"property.condition", r"maintenance")),
    Item("D7-regulatory", "Deep diligence", "Regulatory", "Regulatory / environmental", (r"regulatory", r"environmental", r"hazmat")),
    Item("D8-insurance", "Deep diligence", "Insurance", "Insurance policies / claims history", (r"insurance", r"claims.history")),
    Item("D9-it", "Deep diligence", "IT / Data", "Core software / systems inventory", (r"software", r"systems.inventory", r"it.inventory")),
    Item("D9-security", "Deep diligence", "IT / Data", "Data-security practices", (r"data.security", r"cybersecurity", r"security.policy", r"incident.response")),
    Item("C1-purchase", "Closing", "Transaction", "Purchase agreement / asset-vs-entity structure", (r"purchase.agreement", r"asset.purchase", r"stock.purchase", r"deal.structure")),
    Item("C2-transition", "Closing", "Transaction", "Seller transition / training plan", (r"transition.plan", r"training.plan", r"seller.training")),
    Item("C3-noncompete", "Closing", "Transaction", "Non-compete", (r"non.?compete", r"restrictive.covenant")),
    Item("C4-financing", "Closing", "Transaction", "Financing / SBA pre-qualification", (r"financing", r"sba", r"lender", r"pre.?qual")),
    Item("C5-closing", "Closing", "Transaction", "Closing checklist", (r"closing.checklist", r"closing.*list")),
]

def main() -> int:
    ap = argparse.ArgumentParser(description="Inventory DDG evidence files; does not validate contents.")
    ap.add_argument("data_room", type=Path)
    ap.add_argument("--broker-supplied", action="append", default=[], metavar="ITEM_ID", help="Mark item as broker-supplied (repeatable).")
    ap.add_argument("--stale-days", type=int, default=0, help="Flag matched files older than N days (mtime only; 0 disables).")
    ap.add_argument("--output", type=Path, help="Write markdown report here; otherwise stdout.")
    args = ap.parse_args()
    root = args.data_room.expanduser().resolve()
    if not root.is_dir():
        print(f"ERROR: not a directory: {root}", file=sys.stderr); return 2
    supplied = set(args.broker_supplied)
    files = [p for p in root.rglob("*") if p.is_file() and not any(part.startswith(".") for part in p.relative_to(root).parts)]
    now = datetime.now(timezone.utc).timestamp()
    rows = []
    for item in ITEMS:
        if item.id in supplied:
            rows.append((item, "BROKER-SUPPLIED", [])); continue
        pats = [re.compile(p, re.I) for p in item.patterns]
        hits = [p for p in files if any(rx.search(p.name.replace("_", " ").replace("-", " ")) for rx in pats)]
        if not hits:
            rows.append((item, "MISSING", [])); continue
        if args.stale_days:
            fresh = [p for p in hits if (now - p.stat().st_mtime) <= args.stale_days * 86400]
            if not fresh: rows.append((item, "STALE*", hits)); continue
            hits = fresh
        rows.append((item, "PRESENT†", hits))

    counts = {s: sum(1 for _, st, _ in rows if st == s) for s in ("PRESENT†", "STALE*", "MISSING", "BROKER-SUPPLIED")}
    lines = ["# Dæmon Diligence Gate — file inventory", "", f"**Data room:** `{root}`  ", f"**Scanned:** {len(files)} files · {datetime.now().astimezone().strftime('%Y-%m-%d %H:%M %Z')}  ", "**Scope:** filename inventory only. No document contents were read or verified.", "", f"**Summary:** {counts['PRESENT†']} present (not verified) · {counts['STALE*']} stale by mtime · {counts['MISSING']} missing · {counts['BROKER-SUPPLIED']} broker-supplied", "", "| ID | Phase | Category | Requirement | Status | Matched file(s) |", "|---|---|---|---|---|---|"]
    for item, status, hits in rows:
        names = ", ".join(f"`{p.relative_to(root)}`" for p in hits) or "—"
        lines.append(f"| {item.id} | {item.phase} | {item.category} | {item.label} | **{status}** | {names} |")
    lines += ["", "† **PRESENT means filename match only**, not content validity, completeness, reconciliation, signature, assignability, or legal status. Human/buyer review required.", "* **STALE means filesystem mtime older than the supplied `--stale-days` threshold** — not a legal judgment that the document is stale.", "", "Broker-supplied items are explicitly marked by `--broker-supplied ITEM_ID`; no item is silently treated as complete."]
    report = "\n".join(lines) + "\n"
    if args.output:
        args.output.expanduser().write_text(report)
        print(f"wrote {args.output}")
    else:
        print(report, end="")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
