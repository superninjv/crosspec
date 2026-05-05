# Reddit Show drafts — uses founder's aged accounts

**Cadence**: post once per subreddit, spaced ~3–5 days apart so it doesn't trip cross-sub spam detection. Read each sub's pinned rules thread first; some require flair, some forbid linkdrops without explanation.

Aged accounts assumed to have ≥30-day history and ≥50 karma. New accounts will be auto-removed regardless of post content.

---

## Post 1 — r/homeautomation

**Subreddit rules to check first**:
- "Self-promotion" — most subs allow tools you built if you disclose authorship
- Some subs require X:1 ratio of non-self-promo to self-promo posts. Fine for an aged account.
- Use the **"OC" / "Self-promotion"** flair if available.

**Title** (Reddit allows ~300 chars but short titles convert better):

```
I built a tool that picks smart-home devices that actually work in your ecosystem (free, no signup, sources cited)
```

**Body**:

```
Frustrated with "is X compatible with HomeKit" Reddit threads where six people
give six conflicting answers, I built a configurator: pick your ecosystem
(HomeKit / Google / Alexa / HA), tick the device types you want, get a list
of devices that work — with the public source backing each claim
(HA integrations registry, Zigbee2MQTT supported devices, CSA Matter cert DB).

https://crosspec.com/smart-home/

It's static and free. No login, no email gate, no AI chatbot — it's a
deterministic constraint solver behind a form. 58 devices across 11 types
today (motion / contact / temp / leak sensors, bulbs, plugs, switches,
locks, thermostats, shades, cameras).

Each config you build gets a shareable URL, so if a friend asks "what
should I buy for my Matter HomeKit setup," you can build it once and DM
them the link.

Honest about money: clickouts go through affiliate links (Amazon Associates
fallback today, direct partnerships with SwitchBot/Tapo/Hue/Aqara pending).
No display ads. Lighthouse ≥95 perf on every page.

Roast it. Especially:
- compatibility claims you think are wrong (link the source you'd cite instead)
- ecosystem paths I missed (e.g. Z-Wave is on the next-vertical list)
- devices from the obvious brands I should have included
```

---

## Post 2 — r/smarthome

**Title**:

```
A free configurator that picks Matter / Thread / Zigbee devices for your specific ecosystem (HomeKit, Google, Alexa, HA)
```

**Body**:

```
Built this because the "what camera should I buy for HomeKit" question
keeps eating r/smarthome threads, and most answers don't cite anything.

https://crosspec.com/smart-home/

Pick an ecosystem, pick what device types you want (smart bulbs, sensors,
cameras, etc.), and it returns devices that actually work in that
ecosystem — labeled as native vs. needs-a-bridge — with the public source
behind each claim.

58 devices today, sourced from the HA integrations registry, Zigbee2MQTT
supported-devices list, and the CSA Matter certified products database.
Static site, no signup, no cookies. Every result is a shareable URL.

I'm planning to add doorbells, light strips, garage door openers, and a
solar/inverter sizing vertical next. Open to suggestions on what's
actually missing — drop the device or category in the comments.
```

---

## Post 3 — r/matterandthread

**Title**:

```
Crosspec — Matter device picker by ecosystem, with provenance citations from the CSA cert database
```

**Body**:

```
Smaller / niche-er audience here so I'll keep it tight.

https://crosspec.com/smart-home/

The configurator filters devices by Matter / Thread support and labels
the ones that need a brand bridge to land in HomeKit / Google / Alexa
versus the ones that commission natively into any Matter controller.

Compat data is sourced from the CSA's Matter certified products database
(cited per-claim with ingest date), with a fallback to Home Assistant's
integration registry for Matter-Bridge / non-Matter devices.

Free, static, no signup. If anyone wants me to add a specific Matter
device that's missing, drop the model number — entries take ~10 minutes
each to add and get republished within the hour.
```

---

## Post 4 — r/HomeAssistant (only if there's a relevant story angle, otherwise skip)

**This sub is more skeptical of self-promo. Only post here if you can frame it as "tool that helps people who eventually want HA."** Otherwise the karma/relevance hit isn't worth it.

**Title**:

```
Configurator that filters smart-home devices by Home Assistant integration support (HACS-aware)
```

**Body**:

```
I built a device picker that lets you set ecosystem = home_assistant and
returns the full set of devices that integrate via HA core OR via HACS
community integrations, with the integration name cited.

https://crosspec.com/smart-home/

The HA-only filter surfaces stuff like the YoLink LoRa leak sensor or
Reolink ONVIF cams that get filtered out of HomeKit/Google-centric
recommender lists. 58 devices today.

Static site, no login. Source citations come from the HA integrations
registry and Zigbee2MQTT's supported-devices list.

If anyone wants their preferred HA-only device added, drop the model.
```

---

## Pre-submit checklist (per post, ~3 minutes each)

- [ ] Open the subreddit and read the most recent pinned mod post for rule changes
- [ ] Use the appropriate flair (Self-promotion / Project / OC / Showcase — varies per sub)
- [ ] Submit from your aged account, not a new one
- [ ] Post at a high-traffic time for that sub (US morning / EU evening generally good)
- [ ] **Don't crosspost across all four in the same hour** — automod will flag

## What to do after each post

- Check back 30 minutes later. If automod removed it, rule is usually in the post-removal message — fix and try once more.
- Reply to top-level comments asking technical questions. **Stop after 6 hours.** No defending against trolls, no DMs, no follow-up posts.

## What to expect

- ~30% of your posts get auto-removed even with an aged account. Move on.
- A successful r/homeautomation post drives 500–3000 visits over 24 hours. A successful r/smarthome post drives ~half that.
- r/matterandthread is small (~30k members) but high-conversion (5–10x average click-through).
