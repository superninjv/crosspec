import type { APIRoute } from "astro";
import type { KnowledgeBase } from "../../engine/solver/types.js";
import kbRaw from "../../verticals/smart-home/kb.json";

const SITE = "https://crosspec.com";

export const GET: APIRoute = () => {
  const kb = kbRaw as KnowledgeBase;
  const today = new Date().toISOString().slice(0, 10);

  const urls: Array<{ loc: string; priority: string }> = [
    { loc: `${SITE}/smart-home/`, priority: "1.0" },
    { loc: `${SITE}/about/`, priority: "0.4" },
  ];
  for (const e of kb.entities) {
    const sku = e.sku ?? e.id;
    urls.push({ loc: `${SITE}/smart-home/devices/${sku}/`, priority: "0.7" });
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
