# Rehomeo

A mobile-first, statically rendered Astro + TypeScript website for apartment clearance and furniture/household-item pickup. German, English, French and Italian have equivalent translated routes, forms, metadata and 15 guides each (60 article pages). No existing application or deployment instructions were present; the repository initially contained only this README heading.

## Local setup

Use Node 24 LTS. `npm ci`, `npm run dev` (Astro development server), `npm run check`, `npm test`, `npm run build`, `npm run preview`. For the optional Node delivery adapter, build first and use `node --env-file=.env server/index.mjs` after copying `.env.example` to `.env`. Keep `.env` untracked. The static preview does not provide `/api/quote`.

`npm run test:browser` runs Chromium checks against a local production build; install Chromium first with `npx playwright install chromium`. CI installs its OS dependencies as well. No production secrets are needed by tests.

## Architecture

- `src/data/site.json`: complete translated service copy, route names and navigation.
- `src/data/form.json`: translated labels, validation and delivery states.
- `src/content/articles/{de,en,fr,it}/*.md`: editable article sources; validated by `src/content.config.ts`. A shared translation key maps equivalent articles, independently of translated slugs.
- `src/layouts/Layout.astro`: rendered HTML, navigation, canonical/hreflang and truthful JSON-LD. No advertised established nationwide network, donor partners, prices or statistics.
- `src/components`: home, service content, quote form and reusable CTA.
- `src/pages/[...route].astro`: static core and article routes; root is a language choice without location redirects. German is the fallback.
- `server/quote.mjs`: validated server-only Websiteli adapter. `server/index.mjs` serves `dist` and the optional same-origin API. The static site also works on any static host with enquiries disabled.
- `scripts/validate-content.mjs` and `scripts/audit-build.mjs`: coverage, article length, translated keys, broken internal links, sitemap, unique metadata, JSON-LD, canonical and reciprocal language checks.

Editable Markdown/JSON are authoritative; builds never regenerate or overwrite editorial content. Images are small custom SVG illustrations of furniture, not photographs or evidence of collections or beneficiaries. No remote fonts or client UI framework are loaded. Only the contact page requires JavaScript.

## Configuration and delivery

See [form integration findings](docs/FORM-INTEGRATION.md) and [launch checklist](docs/LAUNCH.md). The form is **intentionally disabled** by default and clearly says that nothing was sent. All requested fields are present. Photos are optional, and the UI explains that they can be arranged later; unsupported attachments are never sent.

`PUBLIC_QUOTE_ENABLED` controls the built UI. `QUOTE_ENABLED`, endpoint, acknowledgement contract, operator review and privacy version independently gate the server. Both flags must be set only after review and an authorised successful delivery test. Enquiry content goes into the existing `message` field rather than guessing unsupported top-level fields. No secret belongs in a `PUBLIC_` variable.

The bundled server provides validation, honeypot rejection, a minimum fill time, same-origin checks, bounded bodies, a basic rate limit, and persistent request deduplication. SQLite stores only request IDs, content digests and delivery state; it does not store names, emails or messages. Digests still warrant access controls and a retention policy. Persist `var/` on a private durable volume. Unconfirmed delivery is retained and never blindly resent. The operator must investigate it before permitting another submission. Limit the server to one process; configure reliable reverse-proxy rate limits before public use. If deploying multiple API instances, replace SQLite deduplication with a shared transactional store. The local rate limit sees the proxy's address and intentionally does not trust arbitrary forwarded headers.

No analytics, tracking cookies, browser PII logging or external marketing scripts are included. Campaign attribution is opt-in and only approved codes in `CAMPAIGN_CODES` can reach the payload. Arbitrary query strings, referrers and click IDs are excluded.

## Deployment and domain

No host or paid service was created. `npm run build` produces `dist/`, ready for static hosting. Static-only deployment must keep the form disabled until an independently deployed same-origin API is available. Alternatively run the included Node 24 server behind an HTTPS reverse proxy with a persistent private `var/` volume and restart supervision. Do not use the Astro dev server in production.

The default canonical origin is `https://rehomeo.ch`. Set `SITE_URL` at build time for the final canonical origin; use a non-indexable preview domain while testing. Set it consistently on the API server too. DNS values depend on your chosen host: obtain its exact A/AAAA/CNAME targets, configure the apex, verify ownership and provision HTTPS. Redirect HTTP and `www.rehomeo.ch` permanently to the HTTPS apex while preserving paths. Enforce one trailing slash for page URLs; the bundled server handles slashless page redirects. Host-specific redirects must be tested before release. No DNS records are guessed here.

Verify the domain in Google Search Console using its provided TXT record, submit `/sitemap.xml`, inspect one homepage, service page and article per language and monitor indexing and Core Web Vitals. Structured data and clear answers do not guarantee rankings or AI citations. Privacy/business drafts are `noindex` and excluded from the sitemap until completed and reviewed. See the launch checklist for removing that draft state. The sitemap currently includes all 97 indexable URLs.

## Editorial status and owner decisions

The 60 complete article drafts were prepared on **12 October 2026**. The visible status and metadata distinguish preparation from publication. There is no invented external author or historical publication date. When actually published, record `publishedAt`, any genuine `updatedAt`, update the visible byline and submit a rebuilt sitemap. Environmental context cites FOEN/BAFU/OFEV/UFAM circular-economy and preparation-for-reuse guidance with limitations; practical advice is editorial guidance, not unverified municipal regulation.

Before launch, provide verified operator name, legal form, address and contact details; complete privacy/controller/processor/retention information and legal review; confirm quote terms, cancellation, payment, acceptance/exclusion policy, resale disclosure, recycling/disposal arrangements and actual coverage. No Rehomeo operator details can be inferred from the GitHub account or Websiteli business identity.
