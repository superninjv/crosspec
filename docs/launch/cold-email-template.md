# Cold-email outreach to smart-home YouTubers and bloggers

Goal: get covered or linked by 1-2 of the established smart-home content creators. They have warmed-up audiences who buy gear; we have a tool that helps their audience pick gear. Mutual fit.

**Why this works without platform engagement**: it's 1:1 email. No public posting, no replies-to-replies threads, no algorithm. You send 10 emails over 30 minutes once. 0–3 reply. Done.

---

## Master template (customize the bracketed bits per target)

**Subject line** (keep under 60 chars; specific, not pitchy):

```
Smart-home compat tool for your viewers — free, no signup
```

```
Built a HomeKit/Matter/HA device picker that cites its sources
```

```
Tool that picks compatible smart-home devices for [their channel name] viewers
```

**Body**:

```
Hi [Creator name],

Long-time viewer of [specific video / specific recurring topic on their
channel — e.g. "your Matter-vs-Thread breakdown" or "the Aqara hub deep-dive"].

I built a free tool that solves the "is X compatible with my ecosystem"
question your audience asks all the time:

https://crosspec.com/smart-home/

Pick your ecosystem (HomeKit / Google / Alexa / HA), tick the device types
you want, and it returns a list of devices that actually work, with
public-registry sources cited per compatibility claim (HA integrations
registry, Zigbee2MQTT, CSA Matter cert DB). 58 devices across 11 types
today.

No signup, no email gate, no AI chatbot — it's a deterministic constraint
solver behind a form. Static site, ≥95 Lighthouse perf, every config gets
a shareable URL.

Two ways this might fit your channel:

1. Just link it in a video description as a viewer tool. No quid pro quo.

2. If you'd like, I can wire a `?ref=[your-handle]` URL parameter so the
   affiliate-link clickouts attribute to you — happy to split affiliate
   revenue 50/50 on conversions traceable to your link. Setup is one line
   in your video description; I send you a CSV of clicks/conversions
   monthly. Zero work for you beyond pasting the link.

Either way, no pressure. The tool's free for your audience either way.

Cheers,
Jack
crosspec.com
```

---

## Target list (smart-home creators with active audiences in the right size band)

**Tier 1 — established channels, 100k+ subs, smart-home-focused**:

| # | Channel / blog | Approx audience | Why fit | Outreach channel |
|---|---|---|---|---|
| 1 | The Hook Up (TheHookUp) | 1.1M YT | Deep-dive Matter/HA reviewer, audience is hands-on | YT "About" → email |
| 2 | Everything Smart Home | 700k YT | Mainstream smart-home reviews, ecosystem comparisons | YT "About" → email |
| 3 | Paul Hibbert | 800k YT | British, irreverent, anti-Apple but covers HomeKit fairly | YT "About" → email |
| 4 | DigitalDigest (Stacey on IoT) | smaller YT, big newsletter | Industry-focused, has covered configurator-type tools before | staceyoniot.com → contact |
| 5 | Smart Home Solver | 300k YT | HA-focused, audience is HA-native | YT "About" → email |

**Tier 2 — niche but high-conversion**:

| # | Channel / blog | Why fit |
|---|---|---|
| 6 | KristijanZ (Home Assistant subset) | HA tutorials, audience knows what HACS is |
| 7 | Home Assistant Community Highlights newsletter | curates HA-relevant tools weekly |
| 8 | r/homeautomation mods | not a creator but mods sometimes feature tools in pinned posts |

**Tier 3 — written blogs / sites**:

| # | Site | Why fit |
|---|---|---|
| 9 | The Verge — Jennifer Pattison Tuohy | covers Matter / smart-home compat issues regularly |
| 10 | Tom's Guide / CNET smart-home staff | mainstream coverage, lower conversion but bigger reach |

---

## Process (one afternoon, ~3 hours total)

1. **Pull contact emails** — most YouTubers list a business email under "About" tab on their channel. For sites, search for their masthead / "About" page. (~15 minutes for the 10 above.)
2. **Customize the bracketed bits per email** — pick a real video / article each creator made, reference it specifically. Generic "I love your channel" gets ignored. (~10 min per email × 10 = ~1.5 hr.)
3. **Send all 10 in one batch** — Tuesday morning is statistically the best day for cold-email reply rates.
4. **Don't follow up.** If you don't hear back in 7 days, move on. Repeated follow-ups feel desperate and zero out reply rate.
5. **For anyone who replies "yes, send me a ref code"** — wire `?ref=<their-handle>` (the existing `/go/[vertical]/[sku]?ref=...` and `/go/[vertical]/cart?ref=...` endpoints already pass it through to Amazon as `ascsubtag`, so per-creator click attribution shows up in Associates reports automatically).

---

## What to expect

- **Reply rate**: 10–30% of cold emails get any response, 1–10% get a substantive yes.
- For 10 emails, expect 1–3 replies, 0–1 actual integrations. That's a great outcome for 3 hours of work.
- **First link in a video description from a 500k-sub creator** drives 200–2000 visits in the 72 hours after the video drops, with conversion rates 3–5x higher than ad/social traffic because the creator pre-warms the audience.

## What NOT to do

- Don't email more than 10 creators at once. Looks spammy if any compare notes.
- Don't pitch on Twitter, Threads, BlueSky, Mastodon. The audience overlap with smart-home YouTubers is small and DM-pitching is a known anti-pattern.
- Don't offer money up front. The 50/50 affiliate split is the right shape because it's contingent on actually delivering value.
- Don't send identical templates with no customization. Reply rate goes to zero.
