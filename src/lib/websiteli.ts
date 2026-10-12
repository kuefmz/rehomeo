// Public endpoint and form contract observed in kuefmz/websiteli.
// Two labelled synthetic tests on 12 October 2026 returned HTTP 200 {ok:true}.
export const endpoint =
  "https://script.google.com/macros/s/AKfycbyAMZy4vPe56lUmFA8-Q_MDJ-AS4aJJb0vOeiViGPneWtkYn9LKXla2BmSWflsvuE-lyw/exec";
export function payloadFor(
  d: Record<string, string>,
  context: { pageUrl: string; privacyUrl: string; campaignCode?: string },
) {
  const message = [
    `Country: ${d.country}`,
    `Postcode / town: ${d.postcode} ${d.town}`,
    `Preferred date: ${d.date || "not specified"}; flexible: ${d.flexible === "yes"}`,
    `Floor / access: ${d.floor}`,
    `Lift: ${d.lift}`,
    `Dismantling: ${d.dismantling}`,
    "",
    "Items:",
    d.description,
  ].join("\n");
  return {
    type: "form",
    name: d.name,
    email: d.email,
    phone: d.phone || "",
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
      pageUrl: context.pageUrl,
      inquiryIntent: "quote-request",
      privacyPolicyAccepted: d.privacy === "yes",
      privacyPolicyVersion: "2026-10-12-draft-operator-details-pending",
      privacyPolicyUrl: context.privacyUrl,
      timestamp: new Date().toISOString(),
      ...(context.campaignCode ? { utm_campaign: context.campaignCode } : {}),
    },
  };
}
export async function sendEnquiry(
  payload: ReturnType<typeof payloadFor>,
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher(endpoint, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20000),
  });
  // An opaque response, HTML 200, negative acknowledgement or network failure is never success.
  const ack = await response.json();
  if (!response.ok || response.type === "opaque" || ack?.ok !== true)
    throw new Error("delivery-unconfirmed");
  return true;
}
