import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import assert from "node:assert/strict";
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
      ),
    )
  ).flat();
}
const files = await walk("dist");
const html = files.filter((f) => f.endsWith(".html"));
const pages = new Map();
const titles = new Set();
const descriptions = new Set();
const origin = (process.env.SITE_URL || "https://rehomeo.ch").replace(
  /\/$/,
  "",
);
const attr = (s, k) => new RegExp(`${k}="([^"]*)"`).exec(s)?.[1];
for (const f of html) {
  const route = "/" + f.slice(5).replace(/index\.html$/, "");
  const text = await readFile(f, "utf8");
  pages.set(route, text);
  assert.equal((text.match(/<h1\b/g) || []).length, 1, route);
  const title = /<title>(.*?)<\/title>/s.exec(text)?.[1];
  assert(title && !titles.has(title), "duplicate title " + route);
  titles.add(title);
  const desc = [...text.matchAll(/<meta\b[^>]*>/g)].find(
    (x) => attr(x[0], "name") === "description",
  );
  const d = attr(desc?.[0] || "", "content");
  assert(d && !descriptions.has(d), "duplicate description " + route);
  descriptions.add(d);
  const canonical = [...text.matchAll(/<link\b[^>]*>/g)].find(
    (x) => attr(x[0], "rel") === "canonical",
  );
  assert.equal(
    attr(canonical?.[0] || "", "href"),
    origin + route,
    route + " canonical",
  );
  for (const s of text.matchAll(
    /<script type="application\/ld\+json">(.*?)<\/script>/gs,
  )) {
    const json = JSON.parse(s[1]);
    assert.equal(json["@context"], "https://schema.org");
  }
  assert(
    !/Lorem ipsum|example@example|carbon neutral|100% sustainable/i.test(text),
    "placeholder or claim " + route,
  );
}
assert.equal(html.length, 105, "Expected root + 44 core + 60 articles");
for (const [route, text] of pages) {
  for (const a of text.matchAll(/<a\b[^>]*>/g)) {
    const href = attr(a[0], "href");
    if (href?.startsWith("/") && !href.startsWith("//")) {
      const dest = href.split(/[?#]/)[0];
      assert(
        pages.has(dest) || files.includes("dist" + dest),
        `${route}: broken link ${href}`,
      );
    }
  }
  const alts = [...text.matchAll(/<link\b[^>]*>/g)].filter(
    (x) => attr(x[0], "rel") === "alternate",
  );
  assert.equal(alts.length, 5, route + " alternates");
  for (const alt of alts) {
    const href = attr(alt[0], "href");
    assert(href.startsWith(origin));
    const target = pages.get(href.slice(origin.length));
    assert(target, route + " alternate target");
    if (attr(alt[0], "hreflang") !== "x-default") {
      assert(
        target.includes(`href="${origin + route}"`),
        route + " reciprocal alternate",
      );
    }
  }
}
const xml = await readFile("dist/sitemap.xml", "utf8");
const locations = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((x) => x[1]);
assert.equal(locations.length, 97);
assert.equal(new Set(locations).size, 97);
for (const [route, text] of pages) {
  const indexed = !text.includes("noindex");
  assert.equal(locations.includes(origin + route), indexed, route + " sitemap");
}
assert(
  (await readFile("dist/robots.txt", "utf8")).includes(origin + "/sitemap.xml"),
);
console.log(
  `Build audit passed: ${html.length} HTML pages; 97 sitemap entries; links, unique metadata, canonical and reciprocal hreflang checked.`,
);
