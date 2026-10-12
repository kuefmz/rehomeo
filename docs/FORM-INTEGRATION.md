# Websiteli contact API reused for GitHub Pages

Inspected `kuefmz/websiteli`, commit `2e6c9b6fbeb7b8b0ebaac53d61f16256ee00db92`, particularly `src/components/CTASection.astro`, attribution code, deployment workflow and searches for backend source. The existing client sends JSON as `text/plain;charset=utf-8` with `type: "form"`, `name`, `email`, `phone`, `company`, `need`, `message` and `metadata`.

The public endpoint is already configured in `src/lib/websiteli.ts`:

`https://script.google.com/macros/s/AKfycbyAMZy4vPe56lUmFA8-Q_MDJ-AS4aJJb0vOeiViGPneWtkYn9LKXla2BmSWflsvuE-lyw/exec`

## Observed live test results — 12 October 2026

Two authorised, clearly labelled synthetic enquiries were sent with `[TEST ONLY]` names, `test@example.invalid`, no phone or real customer information, and explicit instructions not to quote or collect. Both returned **HTTP 200 and `{"ok":true}`**. The second included `Origin: https://kuefmz.github.io`; the initial 302 and final JSON response both returned **Access-Control-Allow-Origin: `*`**.

This establishes endpoint acknowledgement and the HTTP CORS policy needed by Pages. It does not independently verify the resulting inbox message, recipient routing or internal data retention. No operator identity or backend processing guarantees are inferred from the acknowledgement.

Unlike the existing Websiteli client's `no-cors` call, Rehomeo uses readable `cors` responses and requires `response.ok` plus the explicitly observed `ok === true` acknowledgement. Opaque responses, HTML HTTP 200, negative/missing acknowledgements and network failures never produce success. The success message says the delivery system accepted the enquiry, and explicitly says it is not a booking.

## No manual API setup for Pages

The default static client is enabled and posts directly to this existing public endpoint. No API key, secret, separate server or repository variable is needed. Name/email/optional phone are mapped to known fields; collection details go in the existing `message`. Metadata includes language, country, source brand, source page/path, query-free page URL and privacy acknowledgement/URL/draft version. No unsupported attachments, user agents, arbitrary URL parameters or analytics events are sent.

Known client honeypot measures are preserved, with validation, a minimum fill time, loading lock and session-level duplicate prevention. Only a digest and submission state are stored in sessionStorage; no enquiry text is stored there. An uncertain request is not automatically resent. Storage restrictions reduce deduplication to the active page; backend idempotency was not documented. Backend validation/anti-spam implementation was not found and is not claimed to have been audited.

Campaign capture is optional: only codes approved in `PUBLIC_CAMPAIGN_CODES` and explicitly consented by the customer are sent. With the default empty list, no attribution is sent. This configuration is not required to launch.

Photo upload support was not found. Photos remain optional and the site explains that transmission can be arranged afterwards. Operator/legal information is still labelled as awaiting verification; reuse of Websiteli's API does not establish Rehomeo's legal operator.

The optional Node adapter remains for future non-Pages hosting; its additional server configuration is not needed by the Pages deployment. Unit and browser tests mock the endpoint and do not send additional live enquiries on every CI run.
