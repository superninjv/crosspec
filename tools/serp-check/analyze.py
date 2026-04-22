#!/usr/bin/env python3
"""Analyze marionette SERP JSON outputs for demand + competitor signals."""
import json
import re
from pathlib import Path
from urllib.parse import urlparse

BASE = Path("/tmp/crossref-serps/mari")

FORUM_MARKERS = ["practicalmachinist.com", "eng-tips.com", "reddit.com", "plctalk.net",
                 "controlbooth.com", "forums.mrplc.com"]
OEM_MARKERS = ["smc.com", "smcusa.com", "smc.eu", "smcworld.com", "festo.com", "parker.com",
               "solutions.parker.com", "parkerstore.com"]
DISTRIBUTOR_MARKERS = [
    "smcpneumatics.com", "smcelectric.com", "misumi-ec.com", "rs-online.com", "motion.com",
    "mcmaster.com", "grainger.com", "amazon.com", "ebay.com", "octopart.com",
    "zoro.com", "fastenal.com", "mscdirect.com", "fluidpowerworld.com", "valin.com",
    "womack.com", "pneumatic", "airsuperiority.com", "globalindustrial.com",
    "automationdirect.com", "airtec.com", "bisco", "csautomation.net", "digikey.com",
    "newark.com", "mouser.com", "imperialsupplies.com", "applied.com",
]
CROSSREF_MARKERS = ["crossreference", "cross-reference", "crossref", "interchange",
                    "partstown.com", "findchips.com"]

def extract_domain(url):
    try:
        d = urlparse(url).netloc.lower()
        return d[4:] if d.startswith("www.") else d
    except Exception:
        return ""

def categorize(domain, url):
    full = (domain + url).lower()
    for m in FORUM_MARKERS:
        if m in full:
            return "FORUM"
    for m in CROSSREF_MARKERS:
        if m in full and "parker-store" not in full:
            return "XREF"
    for m in OEM_MARKERS:
        if m == domain or domain.endswith("." + m):
            return "OEM"
    for m in DISTRIBUTOR_MARKERS:
        if m in domain:
            return "DIST"
    return "OTHER"

summary = {"demand_signal_count": 0, "forum_signal_count": 0, "total_long_tail": 12, "head_commercial": 0}

print("="*80)
print("CROSSREF — SERP REALITY + DEMAND CHECK (DuckDuckGo via headless Firefox)")
print("="*80)

for i in range(1, 16):
    f = BASE / f"q{i:02d}.json"
    d = json.loads(f.read_text())
    query = d.get("query", "?")
    results = d.get("results", [])
    cats = []
    for r in results:
        url = r.get("url", "")
        domain = extract_domain(url)
        cat = categorize(domain, url)
        cats.append((cat, domain, r.get("title", "")[:55]))

    mix = {}
    for c, _, _ in cats:
        mix[c] = mix.get(c, 0) + 1
    forum_present = mix.get("FORUM", 0) > 0
    xref_present = mix.get("XREF", 0) > 0
    # Demand signal: any real commercial results (OEM/DIST/XREF) in top 5
    commercial_top5 = sum(1 for c, _, _ in cats[:5] if c in ("OEM", "DIST", "XREF"))
    has_demand = commercial_top5 >= 2

    is_long_tail = i <= 12
    is_head = i >= 13
    if is_long_tail and has_demand:
        summary["demand_signal_count"] += 1
    if forum_present:
        summary["forum_signal_count"] += 1
    if is_head and mix.get("DIST", 0) + mix.get("OEM", 0) >= 4:
        summary["head_commercial"] += 1

    print(f"\nQ{i:02d}: {query}")
    print(f"  mix: {dict(sorted(mix.items()))}")
    print(f"  demand(comm.in top5≥2): {'YES' if has_demand else 'NO'} | forum_top10: {'YES' if forum_present else 'no'} | xref: {'YES' if xref_present else 'no'}")
    for n, (cat, domain, title) in enumerate(cats, 1):
        print(f"    {n:2}. [{cat:5}] {domain:35} :: {title}")

print("\n" + "="*80)
print("SUMMARY")
print("="*80)
print(f"Long-tail demand signal:     {summary['demand_signal_count']}/{summary['total_long_tail']}  (pass threshold: 10)")
print(f"Intent-gap (forum in top10): {summary['forum_signal_count']}/15          (pass threshold: 5)")
print(f"Head-term commercial intent: {summary['head_commercial']}/3             (pass threshold: 2)")
