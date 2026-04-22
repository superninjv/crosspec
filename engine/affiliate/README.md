# engine/affiliate/

Affiliate-link routing. Vertical-agnostic.

## Responsibility

Given `(vertical, sku)`, return an affiliate clickout URL with tracking parameters. Log the clickout event. Never expose the affiliate tag in rendered HTML — all outbound links route through a Worker-backed 302 so the tag lives server-side.

## `affiliates.json` schema (contract)

```json
{
  "version": "0.1",
  "vertical": "<slug>",
  "fallback": "amazon_associates",
  "merchants": {
    "<merchant_id>": {
      "name": "SwitchBot",
      "network": "awin | impact | direct | amazon | partnerize | sovrn",
      "rate_pct": 10.0,
      "cookie_days": 60,
      "link_template": "https://..../{{affiliate_tag}}/{{sku}}",
      "tag": "<env-var-ref, never inlined>",
      "applied_on": "2026-04-21",
      "status": "pending | approved | rejected"
    }
  },
  "products": {
    "<canonical_sku>": {
      "merchant_id": "<key into merchants>",
      "merchant_sku": "<merchant's own id>",
      "name": "human-readable",
      "last_verified": "2026-04-21"
    }
  }
}
```

## Public interface (target)

```ts
route(vertical: string, sku: string): { url: string, merchant: string, rate_pct: number }
```

Route pattern: `crosspec.com/go/<vertical>/<sku>` → Worker reads `affiliates.json`, logs event, issues 302 to `link_template` with `{{affiliate_tag}}` filled from env.

## Fallback behavior

If SKU not in `products` OR the merchant is `status: "pending"` / `"rejected"`: route through Amazon Associates fallback using canonical product name search. Never 404 a product link.

## Security

- Affiliate tags live in Cloudflare Worker secrets, not in the repo.
- `affiliates.json` is committed; secrets are NOT.
- Per-merchant tag env var names are referenced by `merchants.<id>.tag` as `"env:MERCHANT_TAG_SWITCHBOT"` etc.

## Analytics coupling

Every `route()` call emits an `affiliate_click` event via `engine/analytics/`. See `analytics/README.md`.
