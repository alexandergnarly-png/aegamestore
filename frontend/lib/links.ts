import { siteConfig } from "@/lib/site";

export function buildCheckoutUrl(game: string) {
  const query = new URLSearchParams({
    game: game || "",
  });

  return `${siteConfig.links.home}/?${query.toString()}`;
}

export function buildResultUrl() {
  return siteConfig.links.result;
}

export function buildSupportUrl() {
  return siteConfig.links.support;
}