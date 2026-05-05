# Show HN draft — crosspec smart-home configurator

**Submit at**: https://news.ycombinator.com/submit
**Best timing**: Tue/Wed/Thu, 8–10am ET. Avoid Mondays and weekends.
**Form fields**:

---

**Title** (80 chars max — HN strips marketing words; keep it factual):

```
Show HN: Crosspec – pick smart-home devices that actually work in your ecosystem
```

Alternatives if the above feels long:

```
Show HN: A smart-home compatibility configurator (Matter, HomeKit, Google, Alexa, HA)
Show HN: Crosspec – matches smart-home devices to your hub/ecosystem with citations
```

**URL**:

```
https://crosspec.com/smart-home/
```

**Text** (leave blank — HN prefers a URL submission with the discussion in the comments. If you must add text, keep it under 4 lines.)

---

## First comment (post immediately after submitting — HN convention)

```
Author here. Built this because every "is X compatible with HomeKit" question
on r/homeautomation gets six conflicting Reddit answers and no source citations.

The configurator picks devices from a knowledge base sourced from public
registries (Home Assistant integrations, Zigbee2MQTT supported devices,
the CSA Matter certified products database) and shows you exactly which
source backs each compatibility claim. 58 devices across 11 types today.

Stack: Astro static + Cloudflare Pages + Pages Functions for affiliate
clickout. No login, no tracking cookies, no AI chat — it's a deterministic
constraint solver behind a form. Every config you build has a shareable URL.

Source for the engine: it's a thin shared core ("engine/") plus per-vertical
knowledge ("verticals/smart-home/kb.json"). Smart home is vertical 1 of a
planned 4–6.

Honest about monetization: affiliate links via Amazon Associates fallback,
direct partnerships with SwitchBot/Tapo/Hue/Aqara still pending. No display
ads. Lighthouse ≥ 95 floor on every page.

Happy to answer any compat questions or argue about whether Matter actually
solves the problem.
```

## Pre-submit checklist (5 minutes)

- [ ] Verify https://crosspec.com/smart-home/ loads cleanly in incognito
- [ ] Try the configurator with at least 3 ecosystem × want combos to make sure nothing's broken on prod
- [ ] Make sure your HN account is logged in
- [ ] Have the first-comment text ready in your clipboard
- [ ] Submit during a US-tech-active window (8–10am ET ideally)

## What to do after submitting

- Don't post the link anywhere else for 60 minutes (HN ranks on velocity; off-site clicks dilute it)
- If you hit /newest top 30 within 2 hours, you have a real shot at hitting the front page
- If anyone asks technical questions in the comments, answer them factually within ~6 hours. Otherwise no engagement required.
- Don't argue with skeptics. If someone says "this could be a Notion doc," ignore.

## What to expect

- Fail case (most likely): never leaves /newest, gets ~50 visits. No harm.
- Median case: hits 30–80 points on front page for 3–6 hours, drives 1k–5k visits, 50–200 configurator runs.
- Tail case: front page top-10 for 12+ hours, drives 10k–50k visits.
