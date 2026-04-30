import type {
  Solution,
  PickedEntity,
  ReasoningStep,
  UserInputs,
} from "@engine/solver";
import {
  protocolLabel,
  hubLabel,
  ecosystemLabel,
  otherEcosystems,
} from "./labels.js";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderProductCard(
  pick: PickedEntity,
  vertical: string,
  userEcosystem: string,
): string {
  const { entity, hub_required, native_in_ecosystem } = pick;
  const sku = entity.sku ?? entity.id;
  const href = `/go/${esc(vertical)}/${esc(String(sku))}`;
  const ecosystems = (entity.attributes.ecosystems ?? []) as string[];
  const rows: [string, string][] = [];
  if (entity.attributes.brand) rows.push(["Brand", entity.attributes.brand]);
  if (entity.attributes.model) rows.push(["Model", entity.attributes.model]);
  if (entity.attributes.protocol) rows.push(["Protocol", entity.attributes.protocol]);
  rows.push(["Hub", hub_required === "none" ? "no hub required" : hub_required]);
  rows.push(["Ecosystems", ecosystems.join(", ") || "—"]);
  const sourceIds = (entity.attributes.source_ids ?? [])
    .map((s) => `#${s}`)
    .join(", ");

  const priceUsd = entity.attributes.price_usd;
  const priceSource = entity.attributes.price_source;
  const priceDate = entity.attributes.price_ingest_date;
  const priceAmount =
    typeof priceUsd === "number"
      ? `<span class="price-amount">$${priceUsd}</span>`
      : "";
  const priceMetaLine =
    typeof priceUsd === "number" && (priceSource || priceDate)
      ? `<p class="price-meta-line">${esc(priceSource ?? "")}${priceSource && priceDate ? " &middot; " : ""}${esc(priceDate ?? "")}</p>`
      : "";

  const protoText = entity.attributes.protocol
    ? protocolLabel(entity.attributes.protocol)
    : "";
  const hubText = hubLabel(hub_required);
  const ecoLabel = ecosystemLabel(userEcosystem);
  const others = otherEcosystems(ecosystems, userEcosystem).map(ecosystemLabel);
  const compatLine = `<p class="compat-line">
    <span class="compat-badge ${native_in_ecosystem ? "ok" : "warn"}">${native_in_ecosystem ? "Native" : "Via bridge"}</span>
    <span class="compat-eco">${esc(ecoLabel)}</span>
    ${protoText ? `<span class="dot">&middot;</span><span>${esc(protoText)}</span>` : ""}
    <span class="dot">&middot;</span>
    <span>${esc(hubText)}</span>
  </p>`;
  const alsoLine = others.length > 0
    ? `<p class="also-line">Also works with ${esc(others.join(", "))}.</p>`
    : "";

  return `<article class="product-card">
    <header>
      <h3>${esc(entity.name)}</h3>
      ${priceAmount}
    </header>
    ${compatLine}
    ${alsoLine}
    ${priceMetaLine}
    <div class="cta-row">
      <a class="cta" href="${href}" rel="sponsored nofollow">Find on retailer &rarr;</a>
      <span class="affiliate-tag">affiliate</span>
    </div>
    <details class="card-details">
      <summary>Specs &amp; sources</summary>
      <dl class="specs">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
      <p class="attrib">Compatibility cited from sources ${esc(sourceIds)} &middot; KB ingest 2026-04-21</p>
    </details>
  </article>`;
}

function renderSourceLink(src: { name: string; url: string; ingest_date: string }): string {
  const label = `${esc(src.name)} (${esc(src.ingest_date)})`;
  // src.url may be empty (e.g. an aggregate "vendor docs" source where there
  // isn't one canonical URL). Render as plain text in that case rather than
  // emitting a broken <a href="">.
  if (!src.url || src.url.trim() === "") {
    return `<span class="source-cite">${label}</span>`;
  }
  return `<a href="${esc(src.url)}" rel="nofollow" target="_blank">${label}</a>`;
}

function renderReasoning(steps: ReasoningStep[]): string {
  const items = steps
    .map(
      (s) => `<li>
      <p class="step">${esc(s.step)}</p>
      <p class="rationale">${esc(s.rationale)}</p>
      <p class="sources">${s.sources.map(renderSourceLink).join(" ")}</p>
    </li>`,
    )
    .join("");
  return `<details class="reasoning">
    <summary>How we picked these (${steps.length} reasoning steps)</summary>
    <ol>${items}</ol>
  </details>`;
}

export function renderSolutionHTML(solution: Solution, vertical: string): string {
  const bulbPicks = solution.picks.filter((p) => p.entity.type === "smart_bulb");
  const plugPicks = solution.picks.filter((p) => p.entity.type === "smart_plug");
  const lockPicks = solution.picks.filter((p) => p.entity.type === "smart_lock");
  const motionPicks = solution.picks.filter((p) => p.entity.type === "motion_sensor");
  const tempPicks = solution.picks.filter((p) => p.entity.type === "temperature_sensor");
  const contactPicks = solution.picks.filter((p) => p.entity.type === "contact_sensor");
  const switchPicks = solution.picks.filter((p) => p.entity.type === "smart_switch");
  const leakPicks = solution.picks.filter((p) => p.entity.type === "leak_sensor");
  const thermostatPicks = solution.picks.filter((p) => p.entity.type === "thermostat");
  const shadePicks = solution.picks.filter((p) => p.entity.type === "smart_shade");

  const warnings =
    solution.warnings.length > 0
      ? `<div class="warnings"><strong>Heads up:</strong><ul>${solution.warnings.map((w) => `<li>${esc(w)}</li>`).join("")}</ul></div>`
      : "";

  const userEco = solution.inputs.ecosystem;
  const section = (title: string, picks: PickedEntity[]): string =>
    picks.length > 0
      ? `<h3>${title} <span class="count">${picks.length}</span></h3><div class="grid">${picks.map((p) => renderProductCard(p, vertical, userEco)).join("")}</div>`
      : "";

  const bulbs = section("Smart bulbs", bulbPicks);
  const plugs = section("Smart plugs", plugPicks);
  const locks = section("Smart locks", lockPicks);
  const motions = section("Motion sensors", motionPicks);
  const temps = section("Temperature &amp; humidity", tempPicks);
  const contacts = section("Door &amp; window sensors", contactPicks);
  const switches = section("Smart switches &amp; dimmers", switchPicks);
  const leaks = section("Water leak sensors", leakPicks);
  const thermostats = section("Thermostats", thermostatPicks);
  const shades = section("Smart shades &amp; blinds", shadePicks);

  const hubsLine =
    solution.hubs_required.length > 0
      ? esc(solution.hubs_required.join(", "))
      : "None — all picks work without an extra hub";
  const hubCallout = `<div class="hub-callout" role="note"><span class="hub-label">Hubs you&#39;ll need</span><strong>${hubsLine}</strong></div>`;

  const empty =
    solution.picks.length === 0
      ? `<div class="empty"><p><strong>No compatible devices in the current knowledge base for that selection.</strong></p><p>Try Home Assistant ecosystem (broadest support) or pick a different device type. <a href="#configurator-form">Edit selection &uarr;</a></p></div>`
      : "";

  const priceDisclaimer =
    solution.picks.length > 0
      ? `<p class="price-disclaimer">Prices shown are <strong>indicative MSRP or recent retail</strong> at the date next to each price. Click through to the merchant for current price and availability &mdash; values drift as ranges go on sale.</p>`
      : "";

  const backToTop =
    solution.picks.length > 0
      ? `<p class="back-to-top"><a href="#configurator-form">&uarr; Edit selection</a></p>`
      : "";

  return `<h2 class="result-meta">Ecosystem: <code>${esc(solution.inputs.ecosystem)}</code> &middot; wants: <code>${esc(solution.inputs.wants.join(", "))}</code></h2>
    ${hubCallout}
    ${warnings}
    ${empty}
    ${bulbs}
    ${plugs}
    ${locks}
    ${motions}
    ${temps}
    ${contacts}
    ${switches}
    ${leaks}
    ${thermostats}
    ${shades}
    ${priceDisclaimer}
    ${backToTop}
    ${renderReasoning(solution.reasoning_chain)}`;
}

const ECOSYSTEM_KEYWORDS: [string, string][] = [
  ["homekit", "homekit"],
  ["home kit", "homekit"],
  ["apple", "homekit"],
  ["alexa", "alexa"],
  ["amazon echo", "alexa"],
  ["google home", "google_home"],
  ["google assistant", "google_home"],
  ["home assistant", "home_assistant"],
  ["home-assistant", "home_assistant"],
  ["hass", "home_assistant"],
];

const TYPE_KEYWORDS: [string, string][] = [
  ["motion sensor", "motion_sensor"],
  ["occupancy", "motion_sensor"],
  ["smart bulb", "smart_bulb"],
  ["smart light", "smart_bulb"],
  ["bulb", "smart_bulb"],
  ["smart plug", "smart_plug"],
  ["smart outlet", "smart_plug"],
  ["plug", "smart_plug"],
  ["outlet", "smart_plug"],
  ["smart lock", "smart_lock"],
  ["deadbolt", "smart_lock"],
  ["door lock", "smart_lock"],
  ["temperature sensor", "temperature_sensor"],
  ["humidity sensor", "temperature_sensor"],
  ["hygrometer", "temperature_sensor"],
  ["door and window", "contact_sensor"],
  ["contact sensor", "contact_sensor"],
  ["door sensor", "contact_sensor"],
  ["window sensor", "contact_sensor"],
  ["smart switch", "smart_switch"],
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
  ["window covering", "smart_shade"],
  ["smart curtain", "smart_shade"],
  ["roller shade", "smart_shade"],
  ["roller blind", "smart_shade"],
  ["smart shade", "smart_shade"],
  ["smart blind", "smart_shade"],
  ["curtain", "smart_shade"],
  ["blinds", "smart_shade"],
];

export function matchExample(text: string): UserInputs | null {
  const lower = text.toLowerCase();
  const ecosystem = ECOSYSTEM_KEYWORDS.find(([k]) => lower.includes(k))?.[1];
  if (!ecosystem) return null;
  const wants = Array.from(
    new Set(
      TYPE_KEYWORDS.filter(([k]) => lower.includes(k)).map(([, v]) => v),
    ),
  );
  if (wants.length === 0) return null;
  return { ecosystem, wants, picks_per_type: 3 };
}

export function encodeInputs(inputs: UserInputs): string {
  const p = new URLSearchParams();
  p.set("ecosystem", inputs.ecosystem);
  if (inputs.wants.length > 0) p.set("wants", inputs.wants.join(","));
  return p.toString();
}

export function decodeInputs(hash: string): UserInputs | null {
  const stripped = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!stripped) return null;
  const p = new URLSearchParams(stripped);
  const ecosystem = p.get("ecosystem");
  if (!ecosystem) return null;
  const wants = (p.get("wants") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (wants.length === 0) return null;
  return { ecosystem, wants, picks_per_type: 3 };
}
