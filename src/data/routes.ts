import content from "./site.json";
export const locales = ["de", "en", "fr", "it"] as const;
export type Locale = (typeof locales)[number];
export type PageKey = keyof typeof content.en.routes;
export const site = content;
export function path(lang: Locale, key: PageKey = "home") {
  const slug = site[lang].routes[key];
  return `/${lang}/${slug ? slug + "/" : ""}`;
}
export const origin = (
  import.meta.env.SITE_URL || "https://rehomeo.ch"
).replace(/\/$/, "");
export function absolute(p: string) {
  return origin + p;
}
