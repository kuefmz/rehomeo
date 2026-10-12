import type { APIRoute } from "astro";
import { absolute } from "../data/routes";
export const GET: APIRoute = () =>
  new Response(
    `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${absolute("/sitemap.xml")}\n`,
    { headers: { "Content-Type": "text/plain" } },
  );
