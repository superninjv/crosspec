"""Vendors that DON'T link to Amazon from their own product pages.

These brands sell direct-to-consumer (own store, Shopify, etc.) and don't
expose ASINs publicly. Result: this collector cannot populate ASINs for them
without either:
  (a) An Amazon-Associates PA-API key (out-of-scope; covered by Amazon's API
      ToS, not the scrape ban), or
  (b) An affiliate-network feed (Awin / Impact / CJ datafeeds when applied).

Listed here so the omission is documented in code instead of becoming
tribal knowledge.

Brands with KB presence and zero Amazon outbound on vendor PDPs (probed
2026-05-05):

  govee       — us.govee.com — Shopify, no /dp/ links anywhere
  switchbot   — switch-bot.com — Shopify, only a brand-storefront link on
                /pages/where-to-buy
  reolink     — reolink.com — sells direct, no Amazon outbound
  eufy        — eufy.com — sells direct, no Amazon outbound
  wyze        — wyze.com — sells direct, no Amazon outbound
  philips_hue — philips-hue.com — direct + retail-locator widget
  inovelli    — inovelli.com — Shopify, sells direct
  sonoff      — itead.cc — sells direct
  lutron      — lutron.com — corporate, retail-locator, no /dp/
  nanoleaf    — nanoleaf.me — Shopify, sells direct
  lifx        — lifx.com — direct
  ring        — ring.com — Amazon-owned, doesn't /dp/-link itself
  ikea        — ikea.com — sells direct
  google_nest — store.google.com — direct
  yale        — shopyalehome.com — direct
  schlage     — schlage.com — corporate; retail-locator
  kwikset     — kwikset.com — corporate; retail-locator
  aeotec      — aeotec.com — direct
  zooz        — getzooz.com — direct
"""

# Intentionally empty: documents the gap, no extractor.
SKIPPED_BRANDS = {
    "govee", "switchbot", "reolink", "eufy", "wyze",
    "philips_hue", "inovelli", "sonoff", "lutron",
    "nanoleaf", "lifx", "ring", "ikea", "google_nest",
    "yale", "schlage", "kwikset", "aeotec", "zooz",
}
