# Awesome-* GitHub PR drafts

GitHub `awesome-*` lists are curated link directories for technical communities. Submitting a PR adding crosspec to a relevant list:

- Costs zero engagement (it's a code change, not a social post)
- Earns a permanent backlink from a high-domain-authority repo
- Drives small-but-targeted traffic (people who land on the awesome list and click)

**Important**: Most awesome lists have a contribution guide. Read it. Common rules:
- Project must be at least 30 days old, or have a clear "Why this is worth listing" explanation
- One-line entry, alphabetized in the relevant section
- Some require a PR template + issue first

---

## Target 1 — `nasa-jon/awesome-home-automation`

**URL**: https://github.com/nasa-jon/awesome-home-automation
**Section**: "Tools" or "Configuration & Provisioning"

**PR diff** (insert alphabetically):

```diff
+ - [Crosspec Smart Home Configurator](https://crosspec.com/smart-home/) - Free constraint solver that picks smart-home devices matching your ecosystem (HomeKit / Google / Alexa / Home Assistant), with public-registry sources cited per claim. Shareable config URLs. No signup.
```

**Commit message**:

```
Add Crosspec Smart Home Configurator

Free, static, no-signup tool that picks smart-home devices matching the
user's ecosystem with provenance citations from the HA integrations
registry, Zigbee2MQTT, and the CSA Matter certified products database.
58 devices across 11 types.
```

---

## Target 2 — `frenck/awesome-home-assistant`

**URL**: https://github.com/frenck/awesome-home-assistant
**Section**: "Resources" → "Tools" subsection (verify path on PR day)

**PR diff**:

```diff
+ - [Crosspec](https://crosspec.com/smart-home/) - Smart-home device picker with HA-only filter that surfaces devices integrating via HA core or HACS, including Z2M-supported Zigbee devices. Compatibility claims cite the source registry per device.
```

---

## Target 3 — `Mitch-Connor/awesome-matter`

**URL**: https://github.com/Mitch-Connor/awesome-matter (verify exact repo on PR day; the awesome-matter ecosystem has multiple curators)
**Section**: "Tools" or "Resources"

**PR diff**:

```diff
+ - [Crosspec Smart Home Configurator](https://crosspec.com/smart-home/) - Picks Matter / Thread devices for a target ecosystem (HomeKit, Google Home, Alexa, HA), labeling native vs bridge paths. Sources citations from the CSA Matter certified products database with ingest dates.
```

---

## Target 4 — `kgrzybek/awesome-architecture` (long shot — for the engine architecture story)

Skip unless you want to write up the constraint-solver-with-thin-vertical-wrappers pattern as a separate blog post. Not the right channel for the smart-home product.

---

## Target 5 — `awesome-selfhosted/awesome-selfhosted`

**URL**: https://github.com/awesome-selfhosted/awesome-selfhosted

**Note**: this list has a strict rule that the project must be self-hostable. Crosspec runs on Cloudflare Pages but the repo is closeable / clone-and-host-elsewhere. If the repo is currently public, eligible. If private, skip.

**PR diff** (only if repo is public + has a deploy guide):

```diff
+ - [Crosspec](https://github.com/superninjv/crosspec) - Smart-home device-compatibility configurator. Astro static site + Cloudflare Pages Functions. Constraint-solver engine, no LLM in the hot path. (Source code-only)
```

Skip if the repo is private — awesome-selfhosted requires a working build for the listed software.

---

## Target 6 — `awesome.re` curated list (the meta-index)

Manual submission via web form: https://awesome.re/ → "Submit a list"

This isn't a PR target; it's a meta-index of awesome lists. Skip unless you eventually maintain `awesome-smart-home-configurator-tools` yourself.

---

## How to submit

For each PR target (per repo):

```bash
# 1. Fork the repo on GitHub UI
# 2. Clone your fork
git clone git@github.com:<your-handle>/awesome-home-automation
cd awesome-home-automation

# 3. Edit the README.md, add your line in the right section, alphabetized
# (use $EDITOR README.md)

# 4. Commit + push
git checkout -b add-crosspec
git add README.md
git commit -m "Add Crosspec Smart Home Configurator"
git push -u origin add-crosspec

# 5. Open the PR on GitHub UI from your branch → upstream main
# Use the commit message body as the PR description
```

Total time: ~5 minutes per repo, no platform engagement beyond the PR.

## What to expect

- ~50-70% PR merge rate. The rest get nitpicked on description format or alphabetization.
- Each merged PR earns a small but durable trickle (5–30 visits/month, indefinitely).
- High-domain-authority backlinks help with SEO ranking on the device pages.
- No follow-up engagement required after merge.
