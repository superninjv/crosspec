import type {
  Solution,
  PickedEntity,
  ReasoningStep,
  UserInputs,
} from "@engine/solver";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderProductCard(pick: PickedEntity, vertical: string): string {
  const { entity, hub_required, native_in_ecosystem } = pick;
  const sku = entity.sku ?? entity.id;
  const href = `/go/${esc(vertical)}/${esc(String(sku))}`;
  const ecosystems = (entity.attributes.ecosystems ?? []).join(", ") || "—";
  const rows: [string, string][] = [];
  if (entity.attributes.brand) rows.push(["Brand", entity.attributes.brand]);
  if (entity.attributes.model) rows.push(["Model", entity.attributes.model]);
  if (entity.attributes.protocol) rows.push(["Protocol", entity.attributes.protocol]);
  rows.push(["Hub", hub_required === "none" ? "no hub required" : hub_required]);
  rows.push(["Ecosystems", ecosystems]);
  const sourceIds = (entity.attributes.source_ids ?? [])
    .map((s) => `#${s}`)
    .join(", ");

  return `<article class="product-card">
    <header>
      <h3>${esc(entity.name)}</h3>
      <span class="badge ${native_in_ecosystem ? "ok" : "warn"}">${native_in_ecosystem ? "native" : "via bridge"}</span>
    </header>
    <dl class="specs">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
    <a class="cta" href="${href}" rel="sponsored nofollow">Find via affiliate</a>
    <p class="attrib">Sources: ${esc(sourceIds)} &middot; ingest 2026-04-21</p>
  </article>`;
}

function renderReasoning(steps: ReasoningStep[]): string {
  const items = steps
    .map(
      (s) => `<li>
      <p class="step">${esc(s.step)}</p>
      <p class="rationale">${esc(s.rationale)}</p>
      <p class="sources">${s.sources.map((src) => `<a href="${esc(src.url)}" rel="nofollow" target="_blank">${esc(src.name)} (${esc(src.ingest_date)})</a>`).join("")}</p>
    </li>`,
    )
    .join("");
  return `<details class="reasoning" open>
    <summary>How we picked these (${steps.length} reasoning steps)</summary>
    <ol>${items}</ol>
  </details>`;
}

export function renderSolutionHTML(solution: Solution, vertical: string): string {
  const bulbPicks = solution.picks.filter((p) => p.entity.type === "smart_bulb");
  const motionPicks = solution.picks.filter((p) => p.entity.type === "motion_sensor");

  const warnings =
    solution.warnings.length > 0
      ? `<div class="warnings"><strong>Heads up:</strong><ul>${solution.warnings.map((w) => `<li>${esc(w)}</li>`).join("")}</ul></div>`
      : "";

  const bulbs =
    bulbPicks.length > 0
      ? `<h3>Smart bulbs</h3><div class="grid">${bulbPicks.map((p) => renderProductCard(p, vertical)).join("")}</div>`
      : "";

  const motions =
    motionPicks.length > 0
      ? `<h3>Motion sensors</h3><div class="grid">${motionPicks.map((p) => renderProductCard(p, vertical)).join("")}</div>`
      : "";

  const hubs = `<p class="hub-summary">Hubs needed across this selection: <strong>${solution.hubs_required.length > 0 ? esc(solution.hubs_required.join(", ")) : "none"}</strong></p>`;

  const empty =
    solution.picks.length === 0
      ? `<p class="empty">No compatible devices in the current knowledge base for that selection. Try a different ecosystem or device type.</p>`
      : "";

  return `<h2>Ecosystem: <code>${esc(solution.inputs.ecosystem)}</code> &middot; wants: <code>${esc(solution.inputs.wants.join(", "))}</code></h2>
    ${warnings}
    ${empty}
    ${bulbs}
    ${motions}
    ${hubs}
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
