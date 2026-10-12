import { readFile, writeFile, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
const base = "";
const origin = "https://rehomeo.ch";
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory() ? walk(dir + "/" + e.name) : [dir + "/" + e.name],
      ),
    )
  ).flat();
}
const files = await walk("dist");
for (const file of files.filter((f) => /\.(html|xml|txt)$/.test(f))) {
  let s = await readFile(file, "utf8");
  s = s.replaceAll("https://kuefmz.github.io/rehomeo/", origin + "/");
  if (file.endsWith(".html"))
    s = s.replace(
      /\b(href|src|action)="\/(?!\/)([^"]*)"/g,
      (_, attr, p) => `${attr}="${base}/${p}"`,
    );
  await writeFile(file, s);
}
const routes = new Set(
  files
    .filter((f) => f.endsWith("index.html"))
    .map((f) => base + "/" + f.slice(5).replace(/index\.html$/, "")),
);
for (const file of files.filter((f) => f.endsWith(".html"))) {
  const s = await readFile(file, "utf8");
  for (const m of s.matchAll(/href="(\/[^"]*)"/g)) {
    const p = m[1].split(/[?#]/)[0];
    assert(
      routes.has(p) || files.includes("dist" + p.slice(base.length)),
      `Broken Pages link: ${p}`,
    );
  }
  assert(s.includes(`href="${origin + base}/`), "Pages canonical missing");
}
await writeFile("dist/CNAME", "rehomeo.ch\n");
await writeFile("dist/.nojekyll", "");
console.log(
  `GitHub Pages package verified: ${routes.size} routes at ${origin}${base}/`,
);
