import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import {
  validate,
  toWebsiteliPayload,
  createQuoteHandler,
  verifiedEndpoint,
} from "../server/quote.mjs";
const now = Date.parse("2026-10-12T10:00:00Z");
const data = {
  name: "[TEST ONLY] Rehomeo integration",
  email: "test@example.invalid",
  phone: "",
  country: "CH",
  postcode: "8000",
  town: "Test town",
  flexible: "yes",
  service: "clearance",
  description:
    "[TEST ONLY] Synthetic furniture enquiry. Do not arrange collection.",
  floor: "1",
  lift: "yes",
  dismantling: "no",
  privacy: "yes",
  language: "en",
  sourcePage: "/en/request-a-quote/",
  requestId: "d704f317-d63f-44ef-8d34-1c1063466ee7",
  startedAt: now - 4000,
};
const env = {
  QUOTE_ENABLED: "true",
  WEBSITELI_ENDPOINT: verifiedEndpoint,
  WEBSITELI_ACK_FIELD: "accepted",
  WEBSITELI_ACK_VALUE: "true",
  OPERATOR_REVIEWED: "true",
  PRIVACY_POLICY_VERSION: "test-only",
};
function handler(fetchImpl, override = {}) {
  return createQuoteHandler({
    env: { ...env, ...override },
    fetchImpl,
    db: new DatabaseSync(":memory:"),
    now: () => now,
  });
}
test("validates required fields, date flexibility, enums, spam and no uploads", () => {
  assert.deepEqual(validate(data, now).errors, {});
  for (const field of [
    "name",
    "email",
    "postcode",
    "town",
    "description",
    "floor",
    "privacy",
  ])
    assert(Object.keys(validate({ ...data, [field]: "" }, now).errors).length);
  assert(validate({ ...data, flexible: "", date: "" }, now).errors.date);
  assert(validate({ ...data, date: "2026-02-30" }, now).errors.date);
  assert(validate({ ...data, website: "bot" }, now).errors.website);
  assert(validate({ ...data, country: "US" }, now).errors.country);
  assert(
    validate({ ...data, sourcePage: "/en/?email=private" }, now).errors
      .sourcePage,
  );
});
test("known Websiteli contract and consented approved campaign only", () => {
  const { data: d } = validate(
    { ...data, campaignConsent: "yes", campaignCode: "approved" },
    now,
  );
  const p = toWebsiteliPayload(d, { CAMPAIGN_CODES: "approved" });
  assert.equal(p.type, "form");
  assert.equal(p.metadata.source, "rehomeo.ch");
  assert.equal(p.metadata.language, "en");
  assert.equal(p.metadata.utm_campaign, "approved");
  assert(!("photos" in p));
  assert(!("userAgent" in p.metadata));
  assert(
    !toWebsiteliPayload(
      { ...d, campaignConsent: false },
      { CAMPAIGN_CODES: "approved" },
    ).metadata.utm_campaign,
  );
});
test("disabled and incomplete configuration never sends or succeeds", async () => {
  const h = handler(
    () => {
      throw Error("must not call");
    },
    { QUOTE_ENABLED: "false" },
  );
  assert.equal((await h(data)).status, 503);
  assert.equal(
    (
      await handler(
        () => {
          throw Error("must not call");
        },
        { WEBSITELI_ACK_FIELD: "" },
      )(data)
    ).status,
    503,
  );
});
test("explicit acknowledgement required; duplicate success does not resend", async () => {
  let calls = 0;
  const h = handler(async () => {
    calls++;
    return new Response(JSON.stringify({ accepted: true }));
  });
  assert.equal((await h(data)).body.delivered, true);
  assert.equal((await h(data)).body.delivered, true);
  assert.equal(calls, 1);
  assert.equal((await h({ ...data, description: "changed" })).status, 409);
});
test("200 HTML or a false acknowledgement never succeeds", async () => {
  for (const body of ["<html>ok</html>", JSON.stringify({ accepted: false })]) {
    const h = handler(async () => new Response(body));
    assert.equal((await h(data)).status, 502);
    assert.equal((await h(data)).status, 409);
  }
});
test("network failures remain unconfirmed and do not automatically resend", async () => {
  let calls = 0;
  const h = handler(async () => {
    calls++;
    throw Error("timeout");
  });
  assert.equal((await h(data)).body.delivered, false);
  assert.equal((await h(data)).status, 409);
  assert.equal(calls, 1);
});
test("invalid input is rejected before network access", async () => {
  const h = handler(() => {
    throw Error("must not call");
  });
  assert.equal((await h({ ...data, email: "invalid" })).status, 422);
});
