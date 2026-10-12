# Launch and remaining editorial inputs

## Technical activation

1. Enable **Settings → Pages → Source: GitHub Actions**. The committed workflow builds, validates, packages and deploys to `https://kuefmz.github.io/rehomeo/`. No API credentials or configuration variables are required.
2. If the initial run preceded activation, retry Deploy GitHub Pages (the assistant can do this), or use its Run workflow button. Future pushes to main deploy automatically.
3. Open the deployed site and confirm the enquiry form shows acceptance only on the observed Websiteli acknowledgement. All automated form tests are mocked; the two labelled live tests are documented in FORM-INTEGRATION.md.

The existing public Websiteli endpoint is configured directly. GitHub Pages is static hosting; the optional Node server is not deployed or needed. Photos remain optional and are arranged separately because upload support is undocumented. Inbox receipt/routing and backend retention were not independently verified from the available repository.

## Content/legal facts still needed

These are missing business facts, not API setup requirements: verified operator name/legal form/address and public contact information; controller/processor/privacy/retention details and legal review; actual coverage and item acceptance/exclusions; dismantling/safe-access, donation/resale, recycling/disposal, payment and cancellation policies. Pages remain honest about availability and reuse limitations. Legal pages remain labelled noindex drafts and must not be described as legally complete.

On publication, record genuine article publication/update dates rather than inventing history. When legal pages have been completed and reviewed, remove their noindex condition and include them in the sitemap; update the audited expected count from 97 to 105.

## Custom domain later

The default GitHub Pages address needs no DNS setup. Connecting `rehomeo.ch` later requires domain control and the host's actual DNS/HTTPS instructions, plus updating the packaging origin/base and canonical URLs. No domain or paid service has been purchased. Verify Search Console for the active domain and submit its sitemap. Measure field Core Web Vitals when real traffic exists; build success is not a field-performance measurement.
