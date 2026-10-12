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

## Browser results and visual review

The committed Chromium suite checks all 105 routes at 360px, all four home/contact layouts at 390px, desktop homepages, keyboard skip links, mobile navigation, translated language-switch targets, required fields, flexible date, optional photos and mock loading/success/error states. Synthetic mock requests are clearly labelled and do not reach Websiteli. Screenshots are generated in ignored `test-results/` and retained as a CI artifact.

Live Websiteli delivery is not verified. Routing, backend source and acknowledgement contract remain required; online submission is disabled. DNS, hosting, HTTPS redirects, public service operations, legal compliance and real field Core Web Vitals are not verified by local tests.

## CI evidence

GitHub Actions run [38185393767](https://github.com/kuefmz/rehomeo/actions/runs/38185393767) passed all checks, including all six Chromium tests (8.6 seconds). The browser-results artifact includes desktop/mobile screenshots in all four languages. Reviewed German desktop homepage, Italian mobile homepage and English mobile contact form for spacing, typography, hierarchy, wrapping and optional-photo messaging. A hidden skip-link screenshot artefact was corrected after this review.

Chromium could not open a page inside the restricted local workspace. Browser verification therefore ran successfully on GitHub’s hosted runner, rather than being inferred from a local build. The workflow is retained as a merge check.

## GitHub Pages/API update — 12 October 2026

The default static form now directly reuses Websiteli. Two labelled synthetic requests returned HTTP 200 `{ok:true}`. With `Origin: https://kuefmz.github.io`, both redirect and final response exposed `Access-Control-Allow-Origin: *`. This verifies endpoint acknowledgement/CORS, not independent inbox receipt or routing. Three additional adapter tests require the observed acknowledgement and reject HTML, missing/negative acknowledgements and network failures. Pages packaging validates all 105 routes and rewrites canonical/alternate/structured-data/sitemap URLs and assets for the project base. The optional Node adapter tests remain separate. Legal operator information remains unverified and labelled as a draft.
