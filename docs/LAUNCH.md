# Owner inputs and launch procedure

## Required owner inputs

- Hosting choice and exact DNS targets for `rehomeo.ch`; confirm the preferred HTTPS apex and `www` redirect. No hosting or domain purchase has been made.
- Verified Rehomeo operator name, legal form, postal address, public email and phone, and any applicable registration information. Websiteli's details cannot be assumed to identify Rehomeo.
- Privacy review: controller/contact, purposes, legal bases where relevant, processors, hosting/storage regions, Apps Script/Google processing, transfer safeguards where needed, retention/deletion, rights and complaints information. Review the no-tracking setup and consented campaign handling. No legal compliance is claimed.
- Actual service availability, item acceptance/exclusions, dismantling responsibilities, safe access policy, recycling/disposal route, any resale policy, possible recipients/donation channels, quote/payment/cancellation terms. Collection is paid unless otherwise explicitly agreed; donation is not guaranteed.
- Backend contract, Rehomeo routing and acknowledgement configuration, required authentication/anti-spam, authorised test recipient and confirmation mechanism. See `FORM-INTEGRATION.md`.
- Secure optional-photo follow-up method, if desired. Uploads are not enabled.

## Launch steps

1. Review translations and 15 articles per language for editorial approval. Preparation date is 12 October 2026; add genuine publication dates on release. Update the article byline to show real publication/update status rather than the draft sentence. Do not manufacture earlier dates.
2. Replace the labelled privacy/business drafts with reviewed information in all four languages. Add only verified operator contacts to navigation/footer and Organization JSON-LD. Remove their `noindex` condition and add those pages to the sitemap; update the expected sitemap audit count from 97 to 105. Do not remove the gate without completing the pages.
3. Confirm operational handling and exclusions. Replace pending-policy explanations only with verified practice. Keep nationwide coverage as availability-confirmed enquiries unless a real network is established. Germany remains availability-dependent.
4. Confirm the Websiteli contract and run the authorised labelled test. Verify the actual resulting record/email, not just HTTP 200. Check malformed input, duplicate submit, error and timeout states. Enable both form flags only after this passes and privacy review is complete.
5. `npm ci && npm run check && npm test && npm run build`; install Chromium and run `npm run test:browser`. Review 390px and desktop screenshots. Test a staging deployment, including its same-origin API and proxy rate limiting.
6. Deploy `dist` and, if enabled, the documented API. Provide a private persistent `var` volume, appropriate file permissions, retention/deletion procedures and process supervision. Keep runtime secrets out of builds and logs. Test HTTPS, apex/www/HTTP redirects and slash handling. Make the preview host non-indexable through host-level robots headers.
7. Configure DNS using the selected host's supplied values. Verify HTTPS before opening the site. Verify Search Console using the actual provided TXT token, submit `/sitemap.xml` and inspect representative URLs in each language.
8. Measure real Core Web Vitals after traffic exists; do not equate a successful build with measured field performance. Review unanswered enquiries and actual reuse outcomes before making any new impact claims.

## Current limitations

The website build is complete; public launch is gated by operator/privacy information and live form-delivery confirmation. There are no verified operator contact details, no enabled photo uploads, no confirmed charity partnerships, no published prices and no established nationwide or German pickup network. Articles are complete editorial drafts and need owner publication approval. No city/canton SEO pages, analytics, special AI-inclusion guarantees or production deployment were created.
