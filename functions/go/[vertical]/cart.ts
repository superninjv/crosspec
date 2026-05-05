import smartHomeAffiliates from "../../../verticals/smart-home/affiliates.json";

interface ProductEntry {
  merchant: string;
  merchant_sku?: string;
  asin?: string;
}

interface AffiliatesFile {
  products: Record<string, ProductEntry>;
  fallback: string;
}

const VERTICALS: Record<string, AffiliatesFile> = {
  "smart-home": smartHomeAffiliates as AffiliatesFile,
};

interface Env {
  MERCHANT_TAG_AMAZON?: string;
}

function bulkCartURL(asins: string[], tag: string, ref: string): string {
  const params = new URLSearchParams();
  if (tag) params.set("AssociateTag", tag);
  asins.forEach((a, i) => {
    params.set(`ASIN.${i + 1}`, a);
    params.set(`Quantity.${i + 1}`, "1");
  });
  if (ref) params.set("ascsubtag", ref);
  return `https://www.amazon.com/gp/aws/cart/add.html?${params.toString()}`;
}

function searchFallback(skus: string[], tag: string, ref: string): string {
  const query = skus.map((s) => s.replace(/_/g, " ")).join(" OR ");
  const base = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
  const parts: string[] = [];
  if (tag) parts.push(`tag=${encodeURIComponent(tag)}`);
  if (ref) parts.push(`ascsubtag=${encodeURIComponent(ref)}`);
  return parts.length ? `${base}&${parts.join("&")}` : base;
}

function sanitizeRef(raw: string | null): string {
  if (!raw) return "";
  const m = raw.match(/^[A-Za-z0-9_-]{1,32}$/);
  return m ? m[0] : "";
}

const handler: PagesFunction<Env> = async ({ params, request, env }) => {
  const vertical = String(params.vertical ?? "");
  const affiliates = VERTICALS[vertical];
  if (!affiliates) return new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  const skuParam = url.searchParams.get("skus") ?? "";
  const skus = skuParam.split(",").map((s) => s.trim()).filter(Boolean);
  if (skus.length === 0) {
    return new Response("?skus= required", { status: 400 });
  }

  const ref = sanitizeRef(url.searchParams.get("ref"));
  const tag = env.MERCHANT_TAG_AMAZON ?? "";
  const asins = skus
    .map((sku) => affiliates.products[sku]?.asin)
    .filter((a): a is string => Boolean(a));

  const target =
    asins.length === skus.length && asins.length > 0
      ? bulkCartURL(asins, tag, ref)
      : searchFallback(skus, tag, ref);

  return Response.redirect(target, 302);
};

export const onRequestGet = handler;
export const onRequestHead = handler;
