import { createHash } from "node:crypto";
export const verifiedEndpoint =
  "https://script.google.com/macros/s/AKfycbyAMZy4vPe56lUmFA8-Q_MDJ-AS4aJJb0vOeiViGPneWtkYn9LKXla2BmSWflsvuE-lyw/exec";
export function validate(input, now = Date.now()) {
  const errors = {};
  const data = {};
  if (!input || typeof input !== "object" || Array.isArray(input))
    return { errors: { form: "invalid" }, data };
  const limits = {
    name: 120,
    email: 254,
    phone: 80,
    postcode: 16,
    town: 120,
    date: 10,
    description: 8000,
    floor: 120,
    sourcePage: 220,
    campaignCode: 80,
    requestId: 36,
    website: 200,
  };
  for (const [k, n] of Object.entries(limits)) {
    const v = input[k];
    if (v !== undefined && typeof v !== "string") {
      errors[k] = "invalid";
      continue;
    }
    data[k] = (v || "").trim();
    if (data[k].length > n) errors[k] = "length";
  }
  for (const k of ["name", "email", "postcode", "town", "description", "floor"])
    if (!data[k]) errors[k] = "required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || ""))
    errors.email = "invalid";
  for (const [k, values] of Object.entries({
    country: ["CH", "DE"],
    service: ["clearance", "selected"],
    lift: ["yes", "no", "unknown"],
    dismantling: ["yes", "no", "unknown"],
    language: ["de", "en", "fr", "it"],
  })) {
    data[k] = input[k];
    if (!values.includes(data[k])) errors[k] = "invalid";
  }
  if (
    !(data.country === "CH" ? /^\d{4}$/ : /^\d{5}$/).test(data.postcode || "")
  )
    errors.postcode = "invalid";
  data.flexible = input.flexible === "yes";
  data.privacy = input.privacy === "yes";
  data.campaignConsent = input.campaignConsent === "yes";
  if (!data.privacy) errors.privacy = "required";
  const today = new Date(now).toLocaleDateString("sv-SE", {
    timeZone: "Europe/Zurich",
  });
  if (
    (!data.date && !data.flexible) ||
    (data.date &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
        Number.isNaN(Date.parse(data.date)) ||
        new Date(data.date).toISOString().slice(0, 10) !== data.date ||
        data.date < today))
  )
    errors.date = "invalid";
  if (
    !/^\/[a-z]{2}\/[a-z0-9\-/]*$/.test(data.sourcePage || "") ||
    !data.sourcePage?.startsWith("/" + data.language + "/")
  )
    errors.sourcePage = "invalid";
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      data.requestId || "",
    )
  )
    errors.requestId = "invalid";
  if (data.website) errors.website = "spam";
  if (
    typeof input.startedAt !== "number" ||
    now - input.startedAt < 2000 ||
    now - input.startedAt > 86400000
  )
    errors.form = "timing";
  return { errors, data };
}
export function toWebsiteliPayload(d, env = {}) {
  const message = [
    `Country: ${d.country}`,
    `Postcode / town: ${d.postcode} ${d.town}`,
    `Preferred date: ${d.date || "not specified"}; flexible: ${d.flexible}`,
    `Floor / access: ${d.floor}`,
    `Lift: ${d.lift}`,
    `Dismantling: ${d.dismantling}`,
    "",
    "Items:",
    d.description,
  ].join("\n");
  const approved = (env.CAMPAIGN_CODES || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return {
    type: "form",
    name: d.name,
    email: d.email,
    phone: d.phone,
    company: "",
    need:
      d.service === "clearance"
        ? "Complete apartment clearance"
        : "Selected furniture / household items",
    message,
    metadata: {
      language: d.language,
      country: d.country,
      source: "rehomeo.ch",
      sourcePage: d.sourcePage,
      sourcePath: d.sourcePage,
      pageUrl: "https://rehomeo.ch" + d.sourcePage,
      inquiryIntent: "quote-request",
      privacyPolicyAccepted: true,
      privacyPolicyVersion: "owner-review-required",
      timestamp: new Date().toISOString(),
      ...(d.campaignConsent && approved.includes(d.campaignCode)
        ? { utm_campaign: d.campaignCode }
        : {}),
    },
  };
}
export function createQuoteHandler({
  env = process.env,
  fetchImpl = fetch,
  db,
  now = Date.now,
}) {
  db.exec(
    "CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, digest TEXT NOT NULL, state TEXT NOT NULL, created INTEGER NOT NULL)",
  );
  return async function handle(input) {
    const { errors, data } = validate(input, now());
    if (Object.keys(errors).length)
      return { status: 422, body: { delivered: false, errors } };
    const endpoint = env.WEBSITELI_ENDPOINT;
    if (
      env.QUOTE_ENABLED !== "true" ||
      endpoint !== verifiedEndpoint ||
      !env.WEBSITELI_ACK_FIELD ||
      !env.WEBSITELI_ACK_VALUE
    )
      return {
        status: 503,
        body: { delivered: false, code: "configuration-required" },
      };
    const payload = toWebsiteliPayload(data, env);
    payload.metadata.privacyPolicyVersion = env.PRIVACY_POLICY_VERSION;
    const privacySlugs = {
      de: "datenschutz",
      en: "privacy",
      fr: "confidentialite",
      it: "privacy",
    };
    payload.metadata.privacyPolicyUrl = `https://rehomeo.ch/${data.language}/${privacySlugs[data.language]}/`;
    if (
      !env.PRIVACY_POLICY_VERSION ||
      !env.OPERATOR_REVIEWED ||
      env.OPERATOR_REVIEWED !== "true"
    )
      return {
        status: 503,
        body: { delivered: false, code: "operator-review-required" },
      };
    // Retain only a digest and delivery state, never enquiry content in this store.
    const digest = createHash("sha256")
      .update(
        JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          country: data.country,
          postcode: data.postcode,
          town: data.town,
          date: data.date,
          flexible: data.flexible,
          service: data.service,
          description: data.description,
          floor: data.floor,
          lift: data.lift,
          dismantling: data.dismantling,
        }),
      )
      .digest("hex");
    const existing = db
      .prepare("SELECT state,digest FROM submissions WHERE id=?")
      .get(data.requestId);
    if (existing)
      return existing.state === "delivered" && existing.digest === digest
        ? { status: 200, body: { delivered: true } }
        : {
            status: 409,
            body: { delivered: false, code: "duplicate-or-unconfirmed" },
          };
    const recent = db
      .prepare("SELECT state FROM submissions WHERE digest=? AND created>?")
      .get(digest, now() - 86400000);
    if (recent)
      return {
        status: 409,
        body: { delivered: false, code: "duplicate-or-unconfirmed" },
      };
    db.prepare("INSERT INTO submissions VALUES (?,?,?,?)").run(
      data.requestId,
      digest,
      "pending",
      now(),
    );
    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
          ...(env.WEBSITELI_BEARER_TOKEN
            ? { Authorization: `Bearer ${env.WEBSITELI_BEARER_TOKEN}` }
            : {}),
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });
      const ack = await response.json();
      if (
        !response.ok ||
        String(ack?.[env.WEBSITELI_ACK_FIELD]) !== env.WEBSITELI_ACK_VALUE
      )
        throw new Error("unconfirmed");
      db.prepare("UPDATE submissions SET state=? WHERE id=?").run(
        "delivered",
        data.requestId,
      );
      return { status: 200, body: { delivered: true } };
    } catch {
      db.prepare("UPDATE submissions SET state=? WHERE id=?").run(
        "unconfirmed",
        data.requestId,
      );
      return {
        status: 502,
        body: { delivered: false, code: "delivery-unconfirmed" },
      };
    }
  };
}
