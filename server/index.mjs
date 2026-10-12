import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createQuoteHandler } from "./quote.mjs";
await mkdir("var", { recursive: true });
const db = new DatabaseSync("var/requests.sqlite");
db.exec("PRAGMA journal_mode=WAL");
const handle = createQuoteHandler({ db });
const root = resolve("dist");
const rates = new Map();
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".xml": "application/xml",
  ".txt": "text/plain",
};
const send = (res, status, body) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
};
const server = createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/api/quote") {
    if (req.method !== "POST") return send(res, 405, { delivered: false });
    // Same-origin only. Reverse proxies must preserve Origin and the configured SITE_URL.
    if (req.headers.origin !== (process.env.SITE_URL || "https://rehomeo.ch"))
      return send(res, 403, { delivered: false });
    if (!req.headers["content-type"]?.startsWith("application/json"))
      return send(res, 415, { delivered: false });
    const ip = req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const r = rates.get(ip) || { start: now, count: 0 };
    if (now - r.start > 600000) {
      r.start = now;
      r.count = 0;
    }
    r.count++;
    rates.set(ip, r);
    if (r.count > 10) return send(res, 429, { delivered: false });
    // Bound memory; network rate limiting should also be configured at the reverse proxy.
    for (const [key, value] of rates)
      if (now - value.start > 600000) rates.delete(key);
    let body = "";
    let size = 0;
    try {
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 32768) {
          send(res, 413, { delivered: false });
          req.destroy();
          return;
        }
        body += chunk.toString();
      }
      const result = await handle(JSON.parse(body));
      return send(res, result.status, result.body);
    } catch {
      return send(res, 400, { delivered: false });
    }
  }
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405);
    return res.end();
  }
  if (!url.pathname.endsWith("/") && !extname(url.pathname)) {
    res.writeHead(308, { Location: url.pathname + "/" + url.search });
    return res.end();
  }
  let file;
  try {
    file = resolve(
      root,
      "." +
        decodeURIComponent(url.pathname) +
        (url.pathname.endsWith("/") ? "index.html" : ""),
    );
  } catch {
    res.writeHead(400);
    return res.end();
  }
  if (!file.startsWith(root + "/")) {
    res.writeHead(403);
    return res.end();
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": mime[extname(file)] || "application/octet-stream",
      "Cache-Control": file.includes("/_astro/")
        ? "public,max-age=31536000,immutable"
        : "public,max-age=300",
    });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      '<!doctype html><html lang="de"><title>404 | Rehomeo</title><h1>404</h1><p><a href="/">Rehomeo – Sprache wählen / Choose language</a></p></html>',
    );
  }
});
server.listen(Number(process.env.PORT || 4321), "0.0.0.0", () =>
  console.log("Rehomeo server ready"),
);
