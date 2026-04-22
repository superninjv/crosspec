import smartHomeAffiliates from "../../../verticals/smart-home/affiliates.json";

interface Merchant {
  name: string;
  network: string;
  link_template: string;
  tag: string;
}

interface ProductEntry {
  merchant: string;
  merchant_sku?: string;
}

interface AffiliatesFile {
  merchants: Record<string, Merchant>;
  products: Record<string, ProductEntry>;
  fallback: string;
}

const VERTICALS: Record<string, AffiliatesFile> = {
  "smart-home": smartHomeAffiliates as AffiliatesFile,
};

interface Env {
  MERCHANT_TAG_AMAZON?: string;
  MERCHANT_TAG_SWITCHBOT?: string;
  MERCHANT_TAG_TAPO?: string;
  MERCHANT_TAG_GOVEE?: string;
  MERCHANT_TAG_HUE?: string;
  MERCHANT_TAG_AQARA?: string;
}

function resolveTag(merchantKey: string, env: Env): string {
  const map: Record<string, string | undefined> = {
    amazon_associates: env.MERCHANT_TAG_AMAZON,
    switchbot: env.MERCHANT_TAG_SWITCHBOT,
    tapo: env.MERCHANT_TAG_TAPO,
    govee: env.MERCHANT_TAG_GOVEE,
    hue: env.MERCHANT_TAG_HUE,
    aqara: env.MERCHANT_TAG_AQARA,
  };
  return map[merchantKey] ?? "";
}

function amazonFallback(sku: string, tag: string): string {
  const query = sku.replace(/_/g, "+");
  const base = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
  return tag ? `${base}&tag=${encodeURIComponent(tag)}` : base;
}

function renderTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const vertical = String(params.vertical ?? "");
  const sku = String(params.sku ?? "");
  const affiliates = VERTICALS[vertical];

  if (!affiliates || !sku) {
    return new Response("Not found", { status: 404 });
  }

  const product = affiliates.products[sku];
  let target: string | null = null;

  if (product) {
    const merchant = affiliates.merchants[product.merchant];
    if (merchant && merchant.link_template) {
      target = renderTemplate(merchant.link_template, {
        merchant_sku: product.merchant_sku ?? sku,
        affiliate_tag: resolveTag(product.merchant, env),
      });
    }
  }

  if (!target) {
    const fallbackKey = affiliates.fallback;
    const fallback = affiliates.merchants[fallbackKey];
    if (fallback && fallback.link_template && fallbackKey === "amazon_associates") {
      target = amazonFallback(sku, resolveTag(fallbackKey, env));
    } else {
      target = amazonFallback(sku, "");
    }
  }

  return Response.redirect(target, 302);
};
