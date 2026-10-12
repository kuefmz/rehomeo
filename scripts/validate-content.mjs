import { readFile, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
const langs = ["de", "en", "fr", "it"];
const site = JSON.parse(await readFile("src/data/site.json"));
const form = JSON.parse(await readFile("src/data/form.json"));
const ids = new Map();
let count = 0;
let min = Infinity,
  max = 0;
for (const l of langs) {
  assert.deepEqual(
    Object.keys(site[l]),
    Object.keys(site.en),
    `site keys ${l}`,
  );
  assert.deepEqual(
    Object.keys(form[l]),
    Object.keys(form.en),
    `form keys ${l}`,
  );
  assert.equal(Object.keys(site[l].routes).length, 11);
  assert.equal(new Set(Object.values(site[l].routes)).size, 11);
  const files = await readdir(`src/content/articles/${l}`);
  assert.equal(files.length, 15, `${l} article count`);
  for (const f of files) {
    const text = await readFile(`src/content/articles/${l}/${f}`, "utf8");
    const fm = text.split("---")[1];
    const meta = Object.fromEntries(
      fm
        .trim()
        .split("\n")
        .map((line) => {
          const i = line.indexOf(":");
          return [line.slice(0, i), JSON.parse(line.slice(i + 1))];
        }),
    );
    assert.equal(meta.lang, l);
    assert.equal(meta.slug, f.replace(/\.md$/, ""));
    assert(
      meta.title && meta.description && meta.excerpt && meta.sources.length,
    );
    assert.equal(meta.author, "Rehomeo");
    assert.equal(meta.preparedAt, "2026-10-12");
    assert(!meta.publishedAt, "Do not invent publication dates");
    assert(meta.related.length >= 2);
    const words = text
      .split("---")
      .slice(2)
      .join("---")
      .trim()
      .split(/\s+/).length;
    assert(words >= 300, `${l}/${f} too short: ${words}`);
    min = Math.min(min, words);
    max = Math.max(max, words);
    const set = ids.get(meta.translationKey) || new Set();
    set.add(l);
    ids.set(meta.translationKey, set);
    count++;
  }
}
assert.equal(ids.size, 15);
for (const set of ids.values()) assert.equal(set.size, 4);
console.log(
  `Content verified: ${count} articles, ${min}–${max} words; four complete site/form dictionaries.`,
);
