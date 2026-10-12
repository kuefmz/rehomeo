import test from "node:test";
import assert from "node:assert/strict";
import { payloadFor, sendEnquiry, endpoint } from "../src/lib/websiteli.ts";
const d = {
  name: "[TEST ONLY]",
  email: "test@example.invalid",
  phone: "",
  country: "CH",
  postcode: "8000",
  town: "Test",
  date: "",
  flexible: "yes",
  floor: "1",
  lift: "yes",
  dismantling: "no",
  description: "[TEST ONLY] Do not collect",
  service: "clearance",
  privacy: "yes",
  language: "en",
  sourcePage: "/en/request-a-quote/",
};
const p = payloadFor(d, {
  pageUrl: "https://kuefmz.github.io/rehomeo/en/request-a-quote/",
  privacyUrl: "https://kuefmz.github.io/rehomeo/en/privacy/",
});
test("browser adapter preserves observed Websiteli contract without unsupported fields", () => {
  assert.equal(p.type, "form");
  assert.equal(p.metadata.source, "rehomeo.ch");
  assert.equal(p.metadata.language, "en");
  assert(!("photos" in p));
  assert(!("userAgent" in p.metadata));
  assert(!("campaignCode" in p));
});
test("only explicit observed ok:true acknowledgement succeeds", async () => {
  let called = false;
  assert.equal(
    await sendEnquiry(p, async (url, options) => {
      called = true;
      assert.equal(url, endpoint);
      assert.equal(options.mode, "cors");
      assert.equal(options.headers["Content-Type"], "text/plain;charset=utf-8");
      return new Response('{"ok":true}');
    }),
    true,
  );
  assert(called);
});
test("HTML, negative, missing acknowledgement and failures cannot succeed", async () => {
  for (const body of ["<html>ok</html>", '{"ok":false}', "{}"])
    await assert.rejects(sendEnquiry(p, async () => new Response(body)));
  await assert.rejects(
    sendEnquiry(p, async () => {
      throw Error("network");
    }),
  );
  await assert.rejects(
    sendEnquiry(p, async () => new Response('{"ok":true}', { status: 500 })),
  );
});
