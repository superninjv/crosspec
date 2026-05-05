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

function bulkCartURL(asins: string[], tag: string): string {
  const params = new URLSearchParams();
  if (tag) params.set("AssociateTag", tag);
  asins.forEach((a, i) => {
    params.set(`ASIN.${i + 1}`, a);
    params.set(`Quantity.${i + 1}`, "1");
  });
  return `https://www.amazon.com/gp/aws/cart/add.html?${params.toString()}`;
}

function searchFallback(skus: string[], tag: string): string {
  const query = skus.map((s) => s.replace(/_/g, " ")).join(" OR ");
  const base = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
  return tag ? `${base}&tag=${encodeURIComponent(tag)}` : base;
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

  const tag = env.MERCHANT_TAG_AMAZON ?? "";
  const asins = skus
    .map((sku) => affiliates.products[sku]?.asin)
    .filter((a): a is string => Boolean(a));

  const target =
    asins.length === skus.length && asins.length > 0
      ? bulkCartURL(asins, tag)
      : searchFallback(skus, tag);

  return Response.redirect(target, 302);
};

export const onRequestGet = handler;
export const onRequestHead = handler;
