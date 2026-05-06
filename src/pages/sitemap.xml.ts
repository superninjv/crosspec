import type { APIRoute } from "astro";
import type { KnowledgeBase } from "../../engine/solver/types.js";
import smartHomeKb from "../../verticals/smart-home/kb.json";
import solarKb from "../../verticals/solar/kb.json";
import keyboardsKb from "../../verticals/keyboards/kb.json";

const SITE = "https://crosspec.com";

export const GET: APIRoute = () => {
  const today = new Date().toISOString().slice(0, 10);

  const urls: Array<{ loc: string; priority: string }> = [
    { loc: `${SITE}/smart-home/`, priority: "1.0" },
    { loc: `${SITE}/solar/`, priority: "1.0" },
    { loc: `${SITE}/keyboards/`, priority: "1.0" },
    { loc: `${SITE}/about/`, priority: "0.4" },
  ];

  const kb = smartHomeKb as KnowledgeBase;
  for (const e of kb.entities) {
    const sku = e.sku ?? e.id;
    urls.push({ loc: `${SITE}/smart-home/devices/${sku}/`, priority: "0.7" });
  }
  const solar = solarKb as KnowledgeBase;
  for (const e of solar.entities) {
    const sku = e.sku ?? e.id;
    urls.push({ loc: `${SITE}/solar/devices/${sku}/`, priority: "0.7" });
  }
  const keyboards = keyboardsKb as KnowledgeBase;
  for (const e of keyboards.entities) {
    const sku = e.sku ?? e.id;
    urls.push({ loc: `${SITE}/keyboards/devices/${sku}/`, priority: "0.7" });
  }

  // Comparison pages: same pair-selection rules as src/pages/smart-home/compare/[pair].astro
  const TOP_N: Record<string, number> = {
    smart_bulb: 10, smart_plug: 9, camera: 10, doorbell: 8, smart_switch: 8,
    smart_lock: 9, thermostat: 8, smart_shade: 7, motion_sensor: 7,
    contact_sensor: 7, temperature_sensor: 7, leak_sensor: 6, hub: 12,
  };
  const byType = new Map<string, typeof kb.entities>();
  for (const e of kb.entities) {
    if (!byType.has(e.type)) byType.set(e.type, []);
    byType.get(e.type)!.push(e);
  }
  for (const [type, ents] of byType) {
    const top = ents.slice(0, TOP_N[type] ?? 6);
    for (let i = 0; i < top.length; i++) {
      for (let j = i + 1; j < top.length; j++) {
        const aSku = top[i].sku ?? top[i].id;
        const bSku = top[j].sku ?? top[j].id;
        urls.push({
          loc: `${SITE}/smart-home/compare/${aSku}-vs-${bSku}/`,
          priority: "0.5",
        });
      }
    }
  }

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        ({ loc, priority }) =>
          `  <url>\n` +
          `    <loc>${loc}</loc>\n` +
          `    <lastmod>${today}</lastmod>\n` +
          `    <priority>${priority}</priority>\n` +
          `  </url>`,
      )
      .join("\n") +
    `\n</urlset>\n`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
