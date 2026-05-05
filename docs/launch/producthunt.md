# ProductHunt launch draft — crosspec

**Submit at**: https://www.producthunt.com/posts/new
**Best timing**: Tuesday or Wednesday at 12:01am PST. Each launch lasts 24 hours.
**Form fields** (PH walks you through these in order):

---

## 1. Tagline (60 chars max)

```
Pick smart-home devices that actually work in your ecosystem
```

Alternates:

```
Free smart-home compatibility configurator with cited sources
A constraint solver for your smart-home setup, not a chatbot
```

## 2. Description (260 chars max — short pitch with the key differentiators)

```
Pick your ecosystem (HomeKit / Google / Alexa / HA) and what you want to add. Crosspec returns devices that actually work, with public-registry sources cited per claim. 58 devices, 11 types. No signup. Every config is a shareable URL.
```

## 3. Topics

- Smart Home
- Home Improvement
- Open Source (only if you open-source the engine repo — currently `superninjv/crosspec` is private; flip if you want this topic)
- Productivity
- Developer Tools (if you want to attract HN-overlap audience)

## 4. Gallery (PH allows 1 video + up to 5 images, each 1200×800 ideal)

You'll need to create these. Suggested set:

1. **Hero image** — screenshot of the configurator with HomeKit ecosystem + 3 device types selected, results visible. Annotate with "pick ecosystem → pick devices → get cited matches".
2. **Compat strip closeup** — a single ProductCard zoomed in showing the 4-cell compat strip with native/bridge/no-path color coding.
3. **Sources panel** — the reasoning chain expanded showing the citations to HA registry, Zigbee2MQTT, CSA Matter DB.
4. **Device page screenshot** — `/smart-home/devices/aqara_camera_g3/` showing the per-device long-tail SEO page.
5. **Build summary screenshot** — the new "build total + Add all to Amazon cart" pill.

If you don't have time for a video, skip it. PH no longer requires one.

## 5. First comment (post immediately after launch — PH convention)

```
Builder here. Crosspec is a constraint solver that picks smart-home devices
matching your specific ecosystem (HomeKit / Google Home / Alexa / Home
Assistant) and what types you want to add.

Why I built it: every "is X compatible with HomeKit" thread on Reddit
turns into six conflicting answers. Vendor-side compat tables are biased.
The CSA Matter certification database is authoritative but not browsable.
So I built a thin layer over the public sources (HA integrations registry,
Zigbee2MQTT supported devices, CSA Matter cert DB) that picks devices
*for you* and shows the receipts.

What it isn't:
— Not a chatbot. It's a deterministic rule-walker.
— Not a content site. Every page is the working tool.
— Not gated. No email, no signup, no AI freemium tier.

What it is:
— 58 devices across 11 types (sensors, lighting, cameras, locks,
   thermostats, shades, switches, plugs).
— Every config has a shareable URL — DM it to the friend asking what to buy.
— Per-device pages at /smart-home/devices/<sku>/ for long-tail compat
   queries.
— Lighthouse ≥95 perf on every page. Static + Cloudflare Pages.

Honest on money: affiliate links via Amazon Associates fallback today;
direct vendor programs (SwitchBot, Tapo, Hue, Aqara) pending. No display
ads. No premium tier in scope.

Smart home is vertical 1 of 4–6 planned. Solar/battery sizing is on deck.

Roast me on missing devices, missing ecosystem paths, broken compat
claims with sources I should have used instead.
```

## 6. Maker comment-reply template (use for repeated questions)

```
Q: Will you add Z-Wave?
A: Z-Wave is on the next-vertical list. Today we're Matter/Thread/Zigbee/
   Wi-Fi only because that's what the public sources I'm citing
   (CSA + Zigbee2MQTT + HA registry) cover well. If you have a
   community-maintained Z-Wave device DB you'd recommend, drop it.

Q: Why not also a chat interface / LLM?
A: LLM in the hot path is a v0.2+ thing. The constraint solver answers
   95% of queries with sub-millisecond latency and zero LLM cost. When
   we add chat it'll be for the edge cases, routed to local Llama or
   Haiku, not Opus.

Q: How do you make money?
A: Affiliate clickouts via Amazon Associates fallback today; direct
   programs with vendors pending. Our cost ceiling is <$20/mo hosting at
   <100k PV/mo, and <$0.15 per completed configurator session if/when
   LLM lands. We're trying to ship a tool that's worth using and let
   the affiliate math work, not optimize for impressions.

Q: Do you store my config?
A: No backend storage. Configs live in the URL hash. The page does the
   solve client-side after the static SSR.
```

## Pre-submit checklist (~30 minutes for the gallery, 10 for the rest)

- [ ] Make the 5 gallery images (or 3 if time-pressed). Screenshot, crop, annotate in Figma / Photoshop / Pixelmator.
- [ ] Verify https://crosspec.com/smart-home/ loads cleanly in a fresh browser
- [ ] Set up a PH account ahead of launch day if you don't have one — accounts under 30 days old get throttled
- [ ] Coordinate with anyone who can upvote within the first hour (small effect but real). Don't ask strangers.
- [ ] Submit at 12:01am PST (3:01am ET) on Tuesday or Wednesday for max-window exposure. Or pre-schedule via the PH "Launch on a future date" feature.

## What to expect

- A median PH launch lands #15-30 on the day, drives 200–800 visitors and 20–80 upvotes.
- Top 5 of the day requires 100+ upvotes within the first 4 hours and an active maker thread. That's hard for a B2C tool with no warmed-up audience; medium probability.
- Hunters with notification networks ("hunted by ___") boost reach. If you know any with smart-home interest, ask before launch day.
- Most PH-driven traffic converts poorly to affiliate (PH crowd is browsers, not buyers). Don't be surprised. The value is awareness and backlinks.
