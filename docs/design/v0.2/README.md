# Handoff: Crosspec Smart-Home Configurator

## Overview
This is the front-end design for the Crosspec smart-home compatibility configurator — a single-page tool where a user picks an ecosystem (HomeKit / Alexa / Google / SmartThings), selects which device types they want to add, and is shown ranked, compatibility-resolved product recommendations with a transparent reasoning trail.

The design replaces an earlier rail-based "workspace" layout. The configurator form is now the **page itself** — front-and-centre in a hero, three visible steps (ecosystem → devices → solve), with results rendered inline below as inputs change.

## About the Design Files
The files in this bundle are **design references created in HTML/JSX** — prototypes showing intended look and behaviour, not production code to copy directly. Your task is to **recreate these designs in the existing Crosspec codebase** (Astro + React islands, per the existing `ConfiguratorShell.astro` and `engine/ui/render.ts` you already have) using its established patterns. If integrating into a fresh codebase, port the JSX components and CSS tokens to your framework of choice.

The included `app.jsx` is wired to inline mock data — the real solver, KB, and price feed should replace the helpers in `app.jsx` (`pickPerType`, `rankEntities`) and `data.jsx`.

## Fidelity
**High-fidelity.** Final colors, type, spacing, interaction states. Recreate pixel-fidelity using your existing design tokens or port the ones documented below.

## Screens / Views

### Single page — `/smart-home/`
Top-to-bottom: top bar → hero with configurator card → presets row → share strip → results.

#### 1. Top bar (sticky)
- Background: `--paper-0` (`oklch(0.985 0.003 250)`), 1px bottom border `--paper-edge`
- Padding: 10px 24px
- Left: brand glyph (18×18 dark square with `×`) + `crosspec / smart-home / configurator` crumb trail in JetBrains Mono 12.5px
- Right: status pip (green dot, signal-green halo) + `kb v0.1 · N entities` in JetBrains Mono 11px

#### 2. Hero
- Background: `var(--paper-0)` with a soft radial gradient at the top: `radial-gradient(1200px 400px at 50% -200px, oklch(0.92 0.04 145 / 0.45), transparent 60%)`
- Padding: 36px 24px 0
- Eyebrow pill: "smart-home v0.1", JetBrains Mono 11px uppercase, 4px 10px, 99px radius
- Title: 44px / 1.05 / -0.02em, weight 600, max-width 780px, `text-wrap: balance`
  - Phrase "actually works together" wrapped in `<em>` with green highlighter background: `linear-gradient(180deg, transparent 60%, oklch(0.88 0.10 145) 60%)`
- Subtitle: 16px / 1.5, `--ink-2`, max-width 640px

#### 3. Configurator card (the heart of the page)
- Sits inside hero, `transform: translateY(36px)` to overlap into results section
- Background `--paper-0`, 1px border `--paper-edge`, 14px radius
- Shadow: `0 1px 0 var(--paper-1) inset, 0 1px 1px oklch(0.20 0.01 250 / 0.04), 0 24px 60px -28px oklch(0.20 0.02 250 / 0.18)`

**Tabs strip** (top of card):
- Three tabs: `1 ecosystem`, `2 devices`, `→ solve`
- 11px JetBrains Mono uppercase, letter-spacing 0.04em
- Tab states: `done` (filled green dot 16×16 with white number, ink-1 text), `active` (ink-0 text, 2px ink-0 underline), default (ink-3)
- Background `--paper-1`, divider line on the bottom

**Body** — three-column grid `1fr 1fr 280px`, columns separated by 1px `--paper-edge` dividers, 22px 24px padding:

- **Step 1 — Ecosystem (left)**
  - Heading: ord pin (20px dark circle, white mono number) + "Which ecosystem?"
  - Hint line: "The voice / app you'll use day-to-day. Determines which devices show up." (11.5px, `--ink-3`)
  - 2×2 grid of `eco-pick` cards: name (12.5px 600) + sub line in mono 10px (controllers like "Apple Home · Siri")
  - Selected state: `--ink-0` background, `--paper-0` text

- **Step 2 — Devices (centre)**
  - Heading: ord pin + "What do you want to add?"
  - Hint: "Tap any combination. Counts show how many compatible devices we have for {ecosystem}."
  - Wrap of pill chips: device label + count in mono 10px
  - Selected: green-soft background `oklch(0.91 0.05 145)`, `--ok` border, dark-green text, ✓ glyph

- **Step 3 — Solve preview (right)**
  - Background `--paper-1`
  - "live preview" label in mono uppercase
  - 2×2 stat grid: picks / device types / hubs needed / ecosystem; each stat: mono 9.5px label + mono 14px 600 value
  - Primary CTA `btn-solve`: `--ink-0` bg, white text, 13.5px 600, full-width, "show N compatible picks ↓" or disabled-state copy
  - Secondary link below: "share this configuration · copy link" (only when solvable)

#### 4. Presets row
- Below hero card, max-width 1180px, padding 0 24px
- "or jump in:" mono uppercase label, then 4 preset chips (e.g. "Starter Apartment · 6 devices")
- Chip: 7px 12px, 99px radius, `--paper-0` bg, mono tag separated by left border

#### 5. Share strip
- Mono 11px row with hash URL field + copy button
- Only renders when at least one device type is selected

#### 6. Results section
- Max-width 1180px, padding 80px 24px 100px
- **Empty state** (no devices selected): centred dashed-border card "Pick a device type to see compatible recommendations."
- **Solved state**:
  - Header: "N picks for {ecosystem}, ranked by native compatibility, Matter support, and price." Right side: ISO date stamp in mono uppercase
  - Meta strip: 5-cell mono row in a single bordered container — ecosystem / native picks ratio / hubs / est. parts cost / price freshness date. Cell labels mono 9.5px uppercase, values 13px 600.
  - **Hub callout**: 3-column grid (label / hub chips / total). When hubs.length === 0, single green chip "none — every pick works without an extra hub". Otherwise mono chips per hub + total cost.
  - **Per-type sections**: section header (15px 600 title + mono ct line "N picks · top N of M") with dashed bottom border, then auto-fill grid `repeat(auto-fill, minmax(290px, 1fr))`, gap from `--grid-gap` token.
  - **Reasoning `<details>`** at the bottom, collapsed by default. Summary row: chev + "How we picked these" + mono ct count. Body: numbered reasoning steps (24px right-aligned mono number column + step heading + body + comma-separated source pill links). Sources block at bottom: 2-column grid of `[id]` mono pills + name + ingest date.

### Product card (`pcard`)
- 290px min, 10px radius, 1px border, `--paper-0` bg, `var(--card-pad)` padding
- Hover: border darkens to `--ink-4`, shadow lifts
- Featured variant: `--ink-1` border + inset 1px ring
- Topline row: mono ID pin + native/bridge badge (left) — pin `#01` (right)
- Native badge: green-soft pill with green dot. Bridge badge: amber-soft pill with amber dot.
- Title: 15.5px 600 `-0.012em`, balance wrap
- Submodel row: mono 10.5px brand · model · protocol with `--ink-4` separators
- **Compat strip**: 4 equal cells (one per ecosystem), 10px coloured dot + 9.5px mono label
  - native: green-soft bg, dark-green label
  - bridge: amber-soft bg, dark-amber label
  - no path: ink-4 strikethrough label
  - active ecosystem: 2px inset ink-0 underline
- **Stats grid**: 2-column 1px-divider grid showing protocol, hub, then 4 spec rows. Each cell: mono 9.5px uppercase key + 11.5px 500 value.
- "Why" line: 12px `--ink-2`, `text-wrap: pretty`
- Footer row: mono 14.5px 600 price OR small "price not tracked" placeholder; CTA "find on retailer →" (`--ink-0` bg, 12px 600). Arrow nudges right 2px on hover.

## Interactions & Behavior

- **Picking ecosystem** — single-select; triggers re-rank of ranked picks for active selections
- **Toggling device types** — multi-select; counts on chips show live KB filter for the active ecosystem
- **Solve CTA** — disabled until at least one device type is selected. Click smoothly scrolls to results section.
- **Presets** — apply ecosystem + wants in one click and scroll to results after a short delay (80ms)
- **Share strip copy** — `navigator.clipboard.writeText(hash)`, button flips to green "copied ✓" for ~1.4s
- **Hash sync** — on initial load, parses `#ecosystem=...&wants=...,...` and hydrates state. Hash is built reactively but not currently pushed to history (add `history.replaceState` if SEO/UGC routing requires it)
- **Reasoning `<details>`** — closed by default; opens on click. The chevron rotates 90° via CSS transition (.15s) when `[open]`.

## State Management
- `eco: string` (one of ecosystem ids; default `homekit`)
- `wants: string[]` (device type ids)
- `tweaks` — local storage / parent-postMessage state for density, featured ring, reasoning open-by-default

Derived (memoised):
- `picksByType` — ranked top-3 per requested type for the chosen ecosystem
- `hash` — shareable URL fragment

## Design Tokens

### Colors (oklch — fall back to closest hex if your stack doesn't support oklch)
| Token | Value | Use |
|---|---|---|
| `--ink-0` | `oklch(0.14 0.012 250)` | primary text, primary buttons |
| `--ink-1` | `oklch(0.22 0.011 250)` | strong text, hover bg of primary |
| `--ink-2` | `oklch(0.40 0.009 250)` | body text |
| `--ink-3` | `oklch(0.58 0.008 250)` | secondary text, mono labels |
| `--ink-4` | `oklch(0.74 0.006 250)` | dividers, placeholder |
| `--paper-0` | `oklch(0.985 0.003 250)` | card surfaces |
| `--paper-1` | `oklch(0.965 0.004 250)` | page background, recessed surfaces |
| `--paper-2` | `oklch(0.935 0.005 250)` | dashed dividers |
| `--paper-3` | `oklch(0.895 0.006 250)` | quiet bg |
| `--paper-edge` | `oklch(0.86 0.007 250)` | borders |
| `--ok` | `oklch(0.58 0.13 145)` | native pick, success |
| `--ok-soft` | `oklch(0.93 0.05 145)` | native pill bg |
| `--warn` | `oklch(0.66 0.14 70)` | bridge pick |
| `--warn-soft` | `oklch(0.95 0.06 80)` | bridge pill bg |

### Typography
- Sans: `Inter Tight`, 400/500/600/700 (Google Fonts)
- Mono: `JetBrains Mono`, 400/500/600 with `font-feature-settings: "ss01","zero"`
- Sizes used: 9.5 / 10 / 10.5 / 11 / 11.5 / 12 / 12.5 / 13 / 13.5 / 14 / 14.5 / 15 / 15.5 / 16 / 18 / 22 / 32 / 44

### Spacing & shape (CSS custom props that flex with density)
- `--row-pad-y` / `--row-pad-x` — 10/14 (regular), 7/12 (compact), 14/18 (comfy)
- `--grid-gap` — 12 / 8 / 16
- `--card-pad` — 16 / 12 / 22
- Radii: 3 (mono badges), 5 (share btn), 6 (compat strip / stats / pill chips), 8 (eco pick / solve cta / preset chip), 10 (product card / reasoning), 14 (config card)

### Shadows
- Card: `0 1px 0 var(--paper-1) inset, 0 1px 1px oklch(0.20 0.01 250 / 0.04), 0 24px 60px -28px oklch(0.20 0.02 250 / 0.18)`
- Hover: `0 6px 20px oklch(0.20 0.02 250 / 0.06)`

## Assets
No real product imagery is included — the configurator uses spec-sheet cards (no photos). When you wire real data, decide whether you want a photo column on each card; if so, drop a square image-slot in the card head.

Fonts are loaded from Google Fonts CDN; switch to your hosted font infrastructure if needed.

## Files
- `index.html` — the rendered prototype (open this directly to view)
- `app.jsx` — main React app (`App`, `Hero`, `Results`, `ProductCard`, `CompatStrip`, `HubCallout`)
- `data.jsx` — mock KB: `ECOSYSTEMS`, `DEVICE_TYPES`, `ENTITIES`, `PRESETS`, `HUB_LABELS`, `HUB_PRICES`, `REASONING`, `SOURCES`
- `tweaks-panel.jsx` — design-tweak UI (density, featured ring, reasoning open-by-default). Safe to delete in production — it's a designer-side affordance.

## Integration notes for the existing Crosspec repo
- Replace `pickPerType` / `rankEntities` in `app.jsx` with calls into your real solver in `engine/ui/render.ts`
- Move CSS tokens out of inline `<style>` and into your global stylesheet
- Wire the `Hero` component into `ConfiguratorShell.astro` as a client island; keep your existing hash routing (it already matches the format used here: `?ecosystem=...&wants=...`)
- Replace `data.jsx` with live KB queries
- The reasoning panel shape (`{step, body, srcs[], fired}`) maps directly to the solver's trace output — pipe it through.
