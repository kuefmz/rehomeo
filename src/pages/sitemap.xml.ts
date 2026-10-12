import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { locales, site, path, absolute, type PageKey } from "../data/routes";
export const GET: APIRoute = async () => {
  const posts = await getCollection("articles");
  const urls = [
    "/",
    ...locales.flatMap((l) =>
      Object.keys(site[l].routes)
        .filter((k) => !["privacy", "business"].includes(k))
        .map((k) => path(l, k as PageKey)),
    ),
    ...posts.map((p) => `${path(p.data.lang, "blog")}${p.data.slug}/`),
  ];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${absolute(u)}</loc></url>`).join("")}</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
};
