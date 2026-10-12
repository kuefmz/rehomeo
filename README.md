# Rehomeo

Astro + TypeScript, statically rendered, with German, English, French and Italian routes and 15 guides per language (60 article pages). Mobile-first warm neutrals, green accents and custom furniture illustrations. No photos are presented as evidence of collections or beneficiaries.

## Publish with GitHub Pages

The deployment workflow is already configured. Open **Settings → Pages → Build and deployment → Source → GitHub Actions**. No API secrets, repository variables, additional server or domain configuration is required for the default address:

**https://kuefmz.github.io/rehomeo/**

Pushes to `main` build and deploy automatically. If the initial deployment ran before Pages was enabled, it can be retried by the assistant or through **Actions → Deploy GitHub Pages → Run workflow**. The Pages packaging script prefixes all routes/assets and changes canonical, hreflang, JSON-LD and sitemap URLs to the project address, then validates links. No CNAME is included. For a later custom domain, first configure its DNS and replace the Pages packaging origin/base; do not point canonical URLs at an unconfigured domain.

## Contact integration

The form directly reuses Websiteli's existing public Google Apps Script endpoint and observed payload. Two clearly labelled synthetic tests returned HTTP 200 `{"ok":true}`; response headers allow browser CORS. The client checks this acknowledgement and never reports success from an opaque/no-cors response, generic HTML 200 or failure. No manual API setup is required.

[Integration evidence and limitations](docs/FORM-INTEGRATION.md) document the endpoint, known fields, acknowledgement, testing and remaining backend uncertainty. An acknowledgement confirms acceptance by that endpoint; inbox receipt/routing and internal retention were not independently inspected. Photos are optional; unsupported uploads are not sent. The site has no analytics or tracking cookies and does not log personal information.

Privacy and business-information pages remain clearly labelled noindex drafts because verified Rehomeo operator details were not supplied. Do not infer Rehomeo's operator identity from Websiteli or the GitHub account, or claim legal compliance without review. The API integration does not resolve that editorial/legal gap.

## Local development

Use Node 24. `npm ci`, `npm run dev`, `npm run check`, `npm test`, `npm run build`, `npm run preview`. `npm run test:browser` runs Chromium checks; install with `npx playwright install chromium`. CI performs the same checks and retains screenshots. Restricted local environments may prevent Chromium from launching; GitHub's hosted runner has successfully run this suite. An existing binary can optionally be selected with `PLAYWRIGHT_EXECUTABLE_PATH`.

Normal builds target `https://rehomeo.ch` for future custom-domain use. `node scripts/prepare-pages.mjs` packages the build for the default GitHub Pages project address. The deploy workflow does both automatically. Do not run the packaging script twice on the same build.

## Architecture

- `src/data/site.json` and `form.json`: full translated copy, route names, labels and states.
- `src/content/articles/{de,en,fr,it}`: editable Markdown; translation keys connect equivalent articles. Preparation date is 12 October 2026, not a fabricated publication date. Set genuine publication/update dates when released.
- `src/layouts` and `src/components`: reusable rendered HTML, accessible navigation, form and service content.
- `src/lib/websiteli.ts`: static browser adapter using the verified public endpoint and observed acknowledgement.
- `server/`: optional Node hosting/adapter for future non-Pages deployments. GitHub Pages cannot execute it; it is not required for this deployment.
- `scripts/`: translation/content validation, exhaustive output audit and Pages packaging.
- `.github/workflows`: CI and automatic Pages deployment.

The build contains 105 HTML pages and 97 indexable sitemap URLs. Eight privacy/business drafts are excluded. Every page has translated metadata, canonical/hreflang, strong internal links and truthful structured data where appropriate. No invented prices, charity partnerships, testimonials, savings statistics or nationwide pickup-network claims are included.

## Domain and search setup later

The default Pages URL needs no DNS changes. Using `rehomeo.ch` later requires verified domain ownership, DNS/HTTPS and appropriate apex/www redirects. Verify Search Console with the actual provided TXT token and submit the sitemap for the active domain. Structured data and clear answers do not guarantee search rankings or AI citations.

[Launch/editorial checklist](docs/LAUNCH.md) covers verified operator/privacy information, actual coverage and item-handling policies. No paid service, domain purchase or credentials have been committed.
