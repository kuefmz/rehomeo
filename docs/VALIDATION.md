# Validation record

Prepared 12 October 2026. Repository initially contained only `README.md`; no existing application, AGENTS instructions or hosting configuration was present.

## Completed automated checks

- Astro strict TypeScript check: no errors, warnings or hints.
- Four complete site and form dictionaries; 11 core routes per language.
- 15 distinct topics, each with four translated Markdown articles, practical checklists, examples, decision guidance, authoritative environmental source links, service CTAs and related reading.
- Production build: 105 HTML pages (root + 44 core pages + 60 articles).
- 97 unique indexable sitemap entries; eight privacy/business drafts are noindex.
- All internal links resolve; translated page and article alternatives exist and are reciprocal. Canonical links match their own rendered route on the configured domain.
- Unique titles/descriptions, one H1 per page and parseable Organization, Service, BreadcrumbList and Article JSON-LD. No fabricated publication date in Article data.
- Adapter unit tests cover missing configuration, server validation, privacy acknowledgement, known payload mapping, consented allowlisted campaign attribution, explicit successful acknowledgement, duplicate requests, HTML HTTP 200, negative acknowledgement and network failure.

## Browser and review scope

The committed Chromium suite checks all 105 routes at 360px, all four home/contact layouts at 390px, desktop homepages, keyboard skip links, mobile navigation, translated language-switch targets, required fields, flexible date, optional photos and mock loading/success/error states. Synthetic mock requests are clearly labelled and do not reach Websiteli. Screenshots are generated in ignored `test-results/` and retained as a CI artifact.

Live Websiteli delivery is not verified. Routing, backend source and acknowledgement contract remain required; online submission is disabled. DNS, hosting, HTTPS redirects, public service operations, legal compliance and real field Core Web Vitals are not verified by local tests.
