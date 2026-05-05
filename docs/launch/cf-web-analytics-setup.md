# Cloudflare Web Analytics setup (founder action required)

Cloudflare Web Analytics is free, privacy-respecting (no cookies), and adds ~3 KB of script. We use it to see traffic / referrers / top pages without GA4 bloat.

---

## What you do (one-time, ~3 minutes)

1. Open the Cloudflare dashboard → **Analytics & Logs** → **Web Analytics**.
2. Click **Add a site**.
3. Choose **Free site** → enter `crosspec.com`.
4. Cloudflare gives you a **JS snippet** that looks like:

   ```html
   <script defer src='https://static.cloudflareinsights.com/beacon.min.js'
     data-cf-beacon='{"token": "abcd1234567890abcd1234567890"}'></script>
   ```

5. Copy the `token` value — the long alphanumeric string between `"token":` and the closing `"`.

## Then either

**Option A (preferred)**: paste the token into the Cloudflare Pages Production env vars:

- Cloudflare dashboard → **Workers & Pages** → `crosspec` → **Settings** → **Environment variables** → **Production**
- Add: `PUBLIC_CF_ANALYTICS_TOKEN = abcd1234567890abcd1234567890`
- Click **Save** then **Retry deployment** (env vars don't auto-rebuild).

**Option B**: tell me the token, I'll commit it directly to `Layout.astro`. Less ideal because it's then in source — but it's a public token so it's not a secret.

---

## What I'll wire (once token is set)

`engine/ui/Layout.astro` will get this conditional snippet in `<head>`:

```html
{import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN && (
  <script defer
    src="https://static.cloudflareinsights.com/beacon.min.js"
    data-cf-beacon={`{"token": "${import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN}"}`}
  />
)}
```

When `PUBLIC_CF_ANALYTICS_TOKEN` is unset (e.g. on `astro dev`, foundry-01), no script is emitted and there's zero analytics overhead. On Cloudflare Pages production with the env var set, the beacon loads and traffic shows up in the CF dashboard within ~5 min.

---

## What you'll see in the dashboard

Cloudflare Web Analytics shows:

- **Visits / Page views / Unique visitors** (last 24h, 7d, 30d)
- **Top pages** (we'll see `/smart-home/` vs `/smart-home/devices/<sku>/` mix)
- **Top referrers** (where traffic is coming from — HN, PH, Reddit, search engines individually)
- **Country / device** breakdown
- **Web Vitals** (LCP, INP, CLS) — sanity check that we're holding the Lighthouse ≥95 promise

It does **not** show:
- Per-user session paths
- Conversion funnels (configurator → /go/ click)
- Anything cookie-derived

For conversion-funnel granularity (e.g. "of users who hit a device page, what % clicked /go/?"), we'd need a separate event-tracking layer. Possible follow-up if you decide it matters.

---

## Privacy / compliance

- Cloudflare Web Analytics doesn't set cookies. No GDPR consent banner needed.
- IP addresses are processed for fraud detection but not stored/exposed in the dashboard.
- This is the GDPR-friendliest analytics option you can deploy without sacrificing data.
