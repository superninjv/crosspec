#!/usr/bin/env python3
"""Parse Bing SERP HTML for SMC/Festo/Parker demand + SERP-reality check."""
import re
import base64
import sys
from pathlib import Path
from urllib.parse import urlparse, unquote

QUERIES = [
    "SMC VP342-5DZ1-02A equivalent",
    "SMC VQ2120-5-Q cross reference",
    "SMC SY5120-5LZD-01 replacement",
    "SMC AS2201F-02-06 alternative",
    "SMC NCDA1F40-0200 equivalent",
    "Festo DSBC-32-100-PPVA-N3 equivalent",
    "Festo MFH-5-1/8-B cross reference",
    "Festo VUVG-L10-M52-MT-M5-1H2L replacement",
    "Festo DSNU-16-50-P-A alternative",
    "Parker B74G-4AK-CQ1-RMG equivalent",
    "Parker P2M-GBC cross reference",
    "Parker PXB series alternative",
    "SMC equivalent",
    "Festo cross reference",
    "Parker alternative",
]

FORUM_DOMAINS = {"practicalmachinist.com", "eng-tips.com", "reddit.com"}
OEM_DOMAINS = {"smcusa.com", "smc.eu", "smc.com", "festo.com", "parker.com", "smcworld.com"}
DISTRIBUTOR_DOMAINS = {
    "mcmaster.com", "grainger.com", "motionindustries.com", "misumi-ec.com",
    "zoro.com", "fastenal.com", "mscdirect.com", "acklandsgrainger.com",
    "globalindustrial.com", "amazon.com", "ebay.com", "valin.com", "womack.com",
    "smcpneumatics.com", "smcelectric.com", "fluidpowerworld.com",
    "fluidworks.com", "pneumaticsonline.com", "airsuperiority.com",
    "bisco.com", "pneumaticplus.com", "airtec.com", "airbestpractices.com",
}
CROSSREF_DOMAINS = {"bearingcrossreference.net", "partstown.com", "crossreferenceparts.com", "partscrossref.com"}


def decode_bing_url(href: str) -> str:
    """Bing wraps clicks in /ck/a?...&u=<base64>&...; decode to real URL."""
    if "bing.com/ck/a" not in href:
        return href
    m = re.search(r"[?&]u=([^&]+)", href)
    if not m:
        return href
    raw = m.group(1)
    # Bing's 'a1' prefix is a custom marker. Strip it.
    if raw.startswith("a1"):
        raw = raw[2:]
    # pad base64
    raw += "=" * ((4 - len(raw) % 4) % 4)
    try:
        decoded = base64.urlsafe_b64decode(raw).decode("utf-8", errors="ignore")
        return decoded
    except Exception:
        return href


def extract_top_results(html: str, max_results: int = 10) -> list[tuple[str, str]]:
    """Extract top organic results as (title, domain) tuples."""
    # Bing wraps organic hits in <li class="b_algo">...<h2><a href="...">title</a></h2>
    results = []
    li_pattern = re.compile(r'<li\s+class="b_algo"[^>]*>(.*?)</li>', re.DOTALL)
    link_pattern = re.compile(r'<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', re.DOTALL)
    for li in li_pattern.findall(html):
        m = link_pattern.search(li)
        if not m:
            continue
        href, title_html = m.groups()
        real_url = decode_bing_url(href)
        try:
            domain = urlparse(real_url).netloc.lower()
            if domain.startswith("www."):
                domain = domain[4:]
        except Exception:
            domain = ""
        title = re.sub(r"<[^>]+>", "", title_html).strip()
        title = re.sub(r"\s+", " ", title)
        if domain:
            results.append((title, domain, real_url))
        if len(results) >= max_results:
            break
    return results


def categorize_domain(domain: str) -> str:
    if domain in FORUM_DOMAINS or "reddit.com" in domain:
        return "FORUM"
    if any(d in domain for d in OEM_DOMAINS):
        return "OEM"
    if any(d in domain for d in DISTRIBUTOR_DOMAINS):
        return "DIST"
    if any(d in domain for d in CROSSREF_DOMAINS):
        return "XREF"
    return "OTHER"


def has_ads(html: str) -> bool:
    """Detect Bing ad units (b_ad or sb_add classes)."""
    return bool(re.search(r'class="[^"]*b_ad[s ]?', html) or 'class="sb_add"' in html)


def has_paa(html: str) -> bool:
    """Detect 'People also ask' widget."""
    return "People also ask" in html or "peopleAlsoAsk" in html.lower()


def has_shopping(html: str) -> bool:
    return "shopping" in html.lower() and ('class="sc_mslbc"' in html or 'b_prodShowcase' in html)


def main():
    base = Path("/tmp/crossref-serps/bing")
    for i, query in enumerate(QUERIES, start=1):
        f = base / f"q{i:02d}.html"
        html = f.read_text(encoding="utf-8", errors="ignore")
        results = extract_top_results(html, 10)
        ads = has_ads(html)
        paa = has_paa(html)
        shop = has_shopping(html)
        forum_hits = sum(1 for _, d, _ in results if categorize_domain(d) == "FORUM")
        cats = {}
        for _, d, _ in results:
            c = categorize_domain(d)
            cats[c] = cats.get(c, 0) + 1
        print(f"\n### Q{i}: {query}")
        print(f"  ads={ads} | PAA={paa} | shopping={shop} | results_found={len(results)}")
        print(f"  mix: {cats}  forum_in_top10={forum_hits > 0}")
        for n, (title, d, url) in enumerate(results, 1):
            cat = categorize_domain(d)
            print(f"    {n}. [{cat}] {d} :: {title[:70]}")


if __name__ == "__main__":
    main()
