# Websiteli integration evidence and launch gate

Inspected authorised repository `kuefmz/websiteli`, commit `2e6c9b6fbeb7b8b0ebaac53d61f16256ee00db92`, especially `src/components/CTASection.astro`, `src/components/AttributionRuntime.astro` and code search for the endpoint and `doPost` across authorised `kuefmz` repositories.

The existing client posts JSON as `text/plain;charset=utf-8` to:

`https://script.google.com/macros/s/AKfycbyAMZy4vPe56lUmFA8-Q_MDJ-AS4aJJb0vOeiViGPneWtkYn9LKXla2BmSWflsvuE-lyw/exec`

Observed payload: `type: "form"`, `name`, `email`, `phone`, `company`, `need`, `message`, and `metadata`. Metadata includes language, country, source, source page/path, enquiry intent and privacy acknowledgement/version/URL. The existing client also sends broader marketing attribution and user-agent/referrer data; Rehomeo deliberately minimises this to consented, allowlisted campaign codes. Furniture/access/date information is encoded into the documented message field rather than inventing endpoint fields.

The existing client has a `website` honeypot, client validation and privacy acknowledgement. Its delivery call uses `mode: "no-cors"` and then shows success without checking an acknowledgement. That is an opaque browser response, not evidence of successful delivery. Rehomeo must not inherit that success behaviour.

No source for this particular Apps Script backend, recipient routing rules, authentication requirements, idempotency protocol or upload capability was found in the searched repositories. Other Apps Scripts found by `doPost` search belong to different applications and were not reused. No credentials were retrieved or committed.

## Exact owner/backend inputs required

1. Confirm this deployment is intended to receive **Rehomeo** enquiries, and how `metadata.source: "rehomeo.ch"` reaches the correct recipients. The existing `source` field is reused; no unsupported routing field is invented.
2. Supply or make available the backend source/contract. Confirm authentication, any anti-spam verification and origin restrictions. A server-only optional Bearer variable exists but must remain unset unless that mechanism is documented. Add a different mechanism only from verified requirements.
3. Confirm the actual response body **after durable acceptance/delivery**. Set `WEBSITELI_ACK_FIELD` and `WEBSITELI_ACK_VALUE` from that contract. A generic HTTP 200, HTML page, timeout or false acknowledgement will never produce success. The adapter currently expects a top-level JSON field; change it if the verified contract requires a different shape.
4. Confirm upload support and limits. None was observed, so there is no photo file input and no attachment transmission. The customer is told to arrange optional photos afterwards. Specify a supported secure channel before adding uploads.
5. Provide an authorised test mode/test recipient and a way to verify the resulting record/email. Use synthetic data labelled `[TEST ONLY] Rehomeo integration – do not arrange collection`. Do not send a live test until correct routing and recipient are established. Record status and receipt without copying personal data into the repository.
6. Complete operator/privacy review, then set `OPERATOR_REVIEWED=true`, a genuine `PRIVACY_POLICY_VERSION`, `QUOTE_ENABLED=true` and rebuild with `PUBLIC_QUOTE_ENABLED=true`.

## Verification completed

Synthetic mocked responses exercise the real adapter: successful explicit acknowledgement, duplicate requests, invalid input, missing configuration, HTML HTTP 200, negative acknowledgements and network failures. No live endpoint submission has been made, because routing and a verifiable acknowledgement are unavailable. This is **not** a claim that live delivery works.

Deduplication is local and persistent on one server with its volume. On timeout, the endpoint might have accepted a request even though the reply was lost. The adapter records `unconfirmed` and does not resend automatically. Exact-once delivery across failures ultimately requires backend-supported idempotency; no undocumented request-id payload has been invented. Owner investigation and a documented retention/unconfirmed-request procedure are launch inputs.
