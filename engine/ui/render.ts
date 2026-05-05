import type {
  Solution,
  PickedEntity,
  ReasoningStep,
  UserInputs,
} from "@engine/solver";
import { protocolLabel, hubLabel } from "./labels.js";

const ECOSYSTEMS_FOR_STRIP: { id: string; short: string; name: string }[] = [
  { id: "homekit", short: "homekit", name: "Apple HomeKit" },
  { id: "alexa", short: "alexa", name: "Amazon Alexa" },
  { id: "google_home", short: "google", name: "Google Home" },
  { id: "home_assistant", short: "home-asst", name: "Home Assistant" },
];
const ECOSYSTEM_LABELS: Record<string, string> = {
  homekit: "Apple HomeKit",
  google_home: "Google Home",
  alexa: "Amazon Alexa",
  home_assistant: "Home Assistant",
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type EntityAttrs = {
  protocol?: string;
  ecosystems?: string[];
  ecosystems_unsupported?: string[];
  price_usd?: number;
  brand?: string;
  model?: string;
  note?: string;
  featured?: boolean;
  [k: string]: unknown;
};

function bridgeEcosystems(attrs: EntityAttrs): string[] {
  const out: string[] = [];
  for (const k of Object.keys(attrs)) {
    if (k.startsWith("ecosystems_via_")) {
      const v = attrs[k] as string[] | undefined;
      if (Array.isArray(v)) {
        for (const e of v) if (!out.includes(e)) out.push(e);
      }
    }
  }
  return out;
}

function ecoStatus(attrs: EntityAttrs, ecoId: string): "native" | "bridge" | "no" {
  const supported = (attrs.ecosystems ?? []) as string[];
  const unsupported = (attrs.ecosystems_unsupported ?? []) as string[];
  if (unsupported.includes(ecoId)) return "no";
  if (!supported.includes(ecoId)) return "no";
  const bridged = bridgeEcosystems(attrs);
  if (bridged.includes(ecoId) && !nativeProtocolFor(attrs, ecoId)) return "bridge";
  return "native";
}
function nativeProtocolFor(attrs: EntityAttrs, ecoId: string): boolean {
  const proto = attrs.protocol ?? "";
  if (
    proto === "thread_matter" ||
    proto === "matter_over_wifi" ||
    proto === "wifi_2_4ghz" ||
    proto === "wifi"
  )
    return true;
  if (ecoId === "home_assistant") return true;
  return false;
}

function renderProductCard(
  pick: PickedEntity,
  vertical: string,
  userEcosystem: string,
  idx: number,
): string {
  const { entity, hub_required, native_in_ecosystem } = pick;
  const sku = entity.sku ?? entity.id;
  const href = `/go/${esc(vertical)}/${esc(String(sku))}`;
  const attrs = entity.attributes as EntityAttrs;
  const protoText = attrs.protocol ? protocolLabel(attrs.protocol) : "";
  const hubText = hubLabel(hub_required);
  const priceUsd = attrs.price_usd;
  const priceHTML =
    typeof priceUsd === "number"
      ? `$${priceUsd}`
      : `<span class="nope">price not tracked</span>`;
  const pinNum = String(idx + 1).padStart(2, "0");
  const featured = !!attrs.featured;

  // Compat strip: 4 ecosystem cells
  const stripCells = ECOSYSTEMS_FOR_STRIP.map((e) => {
    const s = ecoStatus(attrs, e.id);
    const cls = `compat-cell s-${s}${e.id === userEcosystem ? " s-active" : ""}`;
    const title = `${e.name}: ${s === "native" ? "native" : s === "bridge" ? "via bridge" : "no path"}`;
    return `<span class="${cls}" title="${esc(title)}"><span class="dot"></span><span class="lbl">${esc(e.short)}</span></span>`;
  }).join("");

  // Stats: protocol + hub + up to 3 spec rows
  const specCandidates: [string, string][] = [];
  for (const [k, niceK] of [
    ["lumens", "lumens"],
    ["color", "color"],
    ["base", "base"],
    ["max_load_watts", "max load"],
    ["form_factor", "form"],
    ["power", "power"],
    ["indoor_outdoor", "use"],
    ["measures", "measures"],
  ] as [string, string][]) {
    const v = attrs[k];
    if (v == null) continue;
    if (Array.isArray(v)) specCandidates.push([niceK, (v as string[]).join(", ")]);
    else specCandidates.push([niceK, String(v)]);
    if (specCandidates.length >= 3) break;
  }
  const statsCells = [
    `<div class="stat"><dt class="k">protocol</dt><dd class="v">${esc(protoText || "—")}</dd></div>`,
    `<div class="stat"><dt class="k">hub</dt><dd class="v ${hub_required === "none" ? "ok" : "warn"}">${esc(hubText)}</dd></div>`,
    ...specCandidates.map(
      ([k, v]) =>
        `<div class="stat"><dt class="k">${esc(k)}</dt><dd class="v">${esc(v)}</dd></div>`,
    ),
  ].join("");

  const submodelParts: string[] = [];
  if (attrs.brand) submodelParts.push(esc(attrs.brand));
  if (attrs.model) submodelParts.push(esc(attrs.model));
  if (protoText) submodelParts.push(esc(protoText));
  const submodel = submodelParts.join('<span class="sep">·</span>');

  const why = attrs.note ? `<p class="why">${esc(attrs.note)}</p>` : "";

  return `<article class="pcard${featured ? " featured" : ""}">
    <div class="topline">
      <span class="left">
        <span class="mono pid">${esc(entity.id)}</span>
        ${native_in_ecosystem ? `<span class="badge-native">native</span>` : `<span class="badge-bridge">via bridge</span>`}
      </span>
      <span class="pin">#${pinNum}</span>
    </div>
    <h4 class="title">${esc(entity.name)}</h4>
    <div class="submodel">${submodel}</div>
    <div class="compat-strip" aria-label="Ecosystem compatibility">${stripCells}</div>
    <dl class="stats">${statsCells}</dl>
    ${why}
    <div class="pcard-foot">
      <span class="price">${priceHTML}</span>
      <a class="cta" href="${href}" rel="sponsored nofollow">find on retailer <span class="arr">&rarr;</span></a>
    </div>
  </article>`;
}

function renderReasoning(steps: ReasoningStep[]): string {
  // Build the deduplicated source map (same logic as ReasoningChain.astro)
  const idByKey = new Map<string, number>();
  const sourcesList: { id: number; name: string; ingest_date: string; url: string }[] = [];
  let nextId = 0;
  for (const s of steps) {
    for (const src of s.sources) {
      const key = src.name + "|" + src.ingest_date;
      if (!idByKey.has(key)) {
        idByKey.set(key, nextId++);
        sourcesList.push({
          id: nextId - 1,
          name: src.name,
          ingest_date: src.ingest_date,
          url: src.url,
        });
      }
    }
  }

  const items = steps
    .map((s, i) => {
      const srcLinks = s.sources
        .map((src) => {
          const key = src.name + "|" + src.ingest_date;
          const id = idByKey.get(key);
          return `<a href="#src-${id}">[${id}] ${esc(src.name)}</a>`;
        })
        .join("");
      return `<div class="rstep">
      <div class="n">${String(i + 1).padStart(2, "0")}</div>
      <div>
        <p class="step">${esc(s.step)}</p>
        <p class="body">${esc(s.rationale)}</p>
        <p class="src">${srcLinks}</p>
      </div>
    </div>`;
    })
    .join("");

  const sourceLegend = sourcesList
    .map(
      (s) => `<div class="src-item" id="src-${s.id}">
      <span class="id">[${s.id}]</span>
      <div>
        <div class="name">${
          s.url && s.url.length > 0
            ? `<a href="${esc(s.url)}" rel="nofollow" target="_blank">${esc(s.name)}</a>`
            : esc(s.name)
        }</div>
        <div class="meta">ingest ${esc(s.ingest_date)}</div>
      </div>
    </div>`,
    )
    .join("");

  return `<details class="reasoning">
    <summary>
      <span class="chev">&#9656;</span>
      <span>How we picked these</span>
      <span class="ct">${steps.length} reasoning steps &middot; ${sourcesList.length} sources</span>
    </summary>
    <div class="reasoning-body">
      ${items}
      <div class="sources">${sourceLegend}</div>
    </div>
  </details>`;
}

export function renderSolutionHTML(solution: Solution, vertical: string): string {
  const userEco = solution.inputs.ecosystem;
  const ecoLabel = ECOSYSTEM_LABELS[userEco] ?? userEco;
  const today = new Date().toISOString().slice(0, 10);
  const totalPicks = solution.picks.length;
  const totalPriceRaw = solution.picks.reduce(
    (a, p) =>
      a +
      (typeof (p.entity.attributes as EntityAttrs).price_usd === "number"
        ? ((p.entity.attributes as EntityAttrs).price_usd as number)
        : 0),
    0,
  );
  const totalPrice = Math.round(totalPriceRaw);
  const nativeCount = solution.picks.filter((p) => p.native_in_ecosystem).length;

  if (totalPicks === 0) {
    return `<div class="empty">
      <h3>Pick a device type to see compatible recommendations.</h3>
      <p>Or tap a preset above for an opinionated start. The configurator filters the knowledge base in real time as you change inputs.</p>
    </div>`;
  }

  const sectionDefs: { type: string; label: string }[] = [
    { type: "smart_bulb", label: "Smart bulbs" },
    { type: "smart_plug", label: "Smart plugs" },
    { type: "smart_lock", label: "Smart locks" },
    { type: "motion_sensor", label: "Motion sensors" },
    { type: "temperature_sensor", label: "Temperature & humidity" },
    { type: "contact_sensor", label: "Door & window sensors" },
    { type: "smart_switch", label: "Smart switches & dimmers" },
    { type: "leak_sensor", label: "Water leak sensors" },
    { type: "thermostat", label: "Thermostats" },
    { type: "smart_shade", label: "Smart shades & blinds" },
    { type: "camera", label: "Security cameras" },
  ];

  const sectionsHTML = sectionDefs
    .map(({ type, label }) => {
      const picks = solution.picks.filter((p) => p.entity.type === type);
      if (picks.length === 0) return "";
      const cards = picks
        .map((p, i) => renderProductCard(p, vertical, userEco, i))
        .join("");
      return `<section class="res-section">
        <header class="res-section-head">
          <h3>${esc(label)}</h3>
          <span class="ct">${picks.length} ${picks.length === 1 ? "pick" : "picks"}</span>
        </header>
        <div class="grid">${cards}</div>
      </section>`;
    })
    .join("");

  const warnings =
    solution.warnings.length > 0
      ? `<div class="warnings"><strong>Heads up:</strong><ul>${solution.warnings.map((w) => `<li>${esc(w)}</li>`).join("")}</ul></div>`
      : "";

  const hubsLine =
    solution.hubs_required.length === 0
      ? `<span class="hub-chip none">none &mdash; every pick works without an extra hub</span>`
      : solution.hubs_required.map((h) => `<span class="hub-chip">${esc(hubLabel(h))}</span>`).join("");

  const hubCallout = `<div class="hub-callout">
    <span class="lbl">hubs you'll need</span>
    <div class="hubs">${hubsLine}</div>
    <div class="total"><span>picks shown</span><span class="v">${totalPicks}</span></div>
  </div>`;

  const buildSummary =
    totalPicks > 0
      ? `<div class="build-summary" id="build-summary">
    <div class="bs-totals">
      <span class="bs-label">build total</span>
      <span class="bs-amount" id="bs-amount">${totalPrice > 0 ? `$${totalPrice}` : "no prices"}</span>
      <span class="bs-meta">across ${totalPicks} ${totalPicks === 1 ? "pick" : "picks"}</span>
    </div>
    <a class="bs-cart" id="bs-cart" href="/go/${esc(vertical)}/cart?skus=${solution.picks.map((p) => esc(String(p.entity.sku ?? p.entity.id))).join(",")}" rel="sponsored nofollow">
      <span class="bs-cart-glyph" aria-hidden="true">&#9635;</span>
      <span>Add all to Amazon cart</span>
      <span class="bs-cart-arr" aria-hidden="true">&rarr;</span>
    </a>
  </div>`
      : "";

  const metaStrip = `<div class="meta-strip">
    <div class="cell"><span class="k">ecosystem</span><span class="v">${esc(ecoLabel)}</span></div>
    <div class="cell"><span class="k">native picks</span><span class="v ${nativeCount === totalPicks ? "ok" : ""}">${nativeCount}/${totalPicks}</span></div>
    <div class="cell"><span class="k">hubs</span><span class="v ${solution.hubs_required.length === 0 ? "ok" : "warn"}">${solution.hubs_required.length || "none"}</span></div>
    <div class="cell"><span class="k">est. parts cost</span><span class="v">${totalPrice > 0 ? `$${totalPrice}` : "&mdash;"}</span></div>
    <div class="cell"><span class="k">price freshness</span><span class="v">2026-05-05</span></div>
  </div>`;

  const head = `<header class="results-head">
    <h2><span class="num">${totalPicks}</span> picks for <span class="qb">${esc(ecoLabel)}</span>, ranked by native compatibility, Matter support, and price.</h2>
    <span class="stamp">solved &middot; ${today}</span>
  </header>`;

  return `${head}
    ${metaStrip}
    ${hubCallout}
    ${buildSummary}
    ${warnings}
    ${sectionsHTML}
    ${renderReasoning(solution.reasoning_chain)}`;
}

// ─── example matcher + hash codec — unchanged ───
const ECOSYSTEM_KEYWORDS: [string, string][] = [
  ["home assistant", "home_assistant"],
  ["apple homekit", "homekit"],
  ["homekit", "homekit"],
  ["apple home", "homekit"],
  ["alexa", "alexa"],
  ["amazon alexa", "alexa"],
  ["google home", "google_home"],
  ["google", "google_home"],
];

const TYPE_KEYWORDS: [string, string][] = [
  ["temperature and humidity sensor", "temperature_sensor"],
  ["temperature sensor", "temperature_sensor"],
  ["humidity sensor", "temperature_sensor"],
  ["hygrometer", "temperature_sensor"],
  ["door and window sensor", "contact_sensor"],
  ["door and window", "contact_sensor"],
  ["contact sensor", "contact_sensor"],
  ["door sensor", "contact_sensor"],
  ["window sensor", "contact_sensor"],
  ["smart switch", "smart_switch"],
  ["smart_switch", "smart_switch"],
  ["light switch", "smart_switch"],
  ["wall switch", "smart_switch"],
  ["wall dimmer", "smart_switch"],
  ["dimmer", "smart_switch"],
  ["water leak", "leak_sensor"],
  ["leak sensor", "leak_sensor"],
  ["flood sensor", "leak_sensor"],
  ["water sensor", "leak_sensor"],
  ["smart thermostat", "thermostat"],
  ["thermostat", "thermostat"],
  ["motorized shade", "smart_shade"],
  ["motorized blind", "smart_shade"],
  ["smart shade", "smart_shade"],
  ["smart blind", "smart_shade"],
  ["smart curtain", "smart_shade"],
  ["roller shade", "smart_shade"],
  ["roller blind", "smart_shade"],
  ["window covering", "smart_shade"],
  ["curtain", "smart_shade"],
  ["blinds", "smart_shade"],
  ["security camera", "camera"],
  ["indoor camera", "camera"],
  ["outdoor camera", "camera"],
  ["smart camera", "camera"],
  ["wifi camera", "camera"],
  ["wi-fi camera", "camera"],
  ["webcam", "camera"],
  ["doorbell camera", "camera"],
  ["surveillance camera", "camera"],
  ["camera", "camera"],
  ["motion sensor", "motion_sensor"],
  ["smart bulb", "smart_bulb"],
  ["smart plug", "smart_plug"],
  ["outlet", "smart_plug"],
  ["smart lock", "smart_lock"],
  ["deadbolt", "smart_lock"],
  ["door lock", "smart_lock"],
];

export function matchExample(text: string): UserInputs | null {
  const lower = text.toLowerCase();
  let ecosystem: string | null = null;
  for (const [kw, slug] of ECOSYSTEM_KEYWORDS) {
    if (lower.includes(kw)) {
      ecosystem = slug;
      break;
    }
  }
  if (!ecosystem) return null;
  const wantsSet = new Set<string>();
  for (const [kw, slug] of TYPE_KEYWORDS) {
    if (lower.includes(kw)) wantsSet.add(slug);
  }
  if (wantsSet.size === 0) return null;
  return { ecosystem, wants: [...wantsSet], picks_per_type: 3 };
}

export function encodeInputs(inputs: UserInputs): string {
  const params = new URLSearchParams();
  params.set("ecosystem", inputs.ecosystem);
  if (inputs.wants.length > 0) params.set("wants", inputs.wants.join(","));
  return params.toString().replace(/%2C/g, ",");
}

export function decodeInputs(hash: string): UserInputs | null {
  if (!hash || hash.length < 2) return null;
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const ecosystem = params.get("ecosystem");
  if (!ecosystem) return null;
  const wantsRaw = params.get("wants");
  const wants = wantsRaw ? wantsRaw.split(",").filter(Boolean) : [];
  return { ecosystem, wants, picks_per_type: 3 };
}
