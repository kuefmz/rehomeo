import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    translationKey: z.string(),
    lang: z.enum(["de", "en", "fr", "it"]),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    excerpt: z.string(),
    author: z.literal("Rehomeo"),
    preparedAt: z.string(),
    publishedAt: z.string().optional(),
    updatedAt: z.string().optional(),
    related: z.array(z.string()).min(2),
    sources: z.array(z.object({ label: z.string(), url: z.url() })).min(1),
  }),
});
export const collections = { articles };
