import { siteConfig } from "@/lib/site";

type CheckoutParams = {
  game: string;
  brand?: string;
  duration?: string;
  productId?: number;
};

export function buildCheckoutUrl(params: CheckoutParams | string) {
  const checkoutParams =
    typeof params === "string"
      ? {
          game: params,
        }
      : params;

  const query = new URLSearchParams();

  if (checkoutParams.game) query.set("game", checkoutParams.game);
  if (checkoutParams.brand) query.set("brand", checkoutParams.brand);
  if (checkoutParams.duration) query.set("duration", checkoutParams.duration);
  if (checkoutParams.productId) {
    query.set("productId", String(checkoutParams.productId));
  }

  return `${siteConfig.links.home}/?${query.toString()}`;
}

export function buildResultUrl() {
  return siteConfig.links.result;
}

export function buildSupportUrl() {
  return siteConfig.links.support;
}
