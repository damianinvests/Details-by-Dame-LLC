# Details by Dame — definitive URL migration map

**Review date:** 6 November 2026  
**Current sitemap:** 34 canonical HTTPS routes. This document records URL decisions; Cloudflare redirect behavior still requires live response testing.

## Preserve or rebuild at the same URL

| URL | Decision | Notes |
|---|---|---|
| / | Rebuilt homepage | H1: “East Orlando Paint Correction. Results You Can See.” Paint correction → ceramic coating → mobile detailing. |
| /about/ | Rebuilt | Owner experience, Detail Garage background, process, and trust information. |
| /services/ | Rebuilt | Service hub that preserves the service hierarchy. |
| /paint-correction-orlando/ | Rebuilt | Primary service page and first service priority. |
| /ceramic-coating-orlando/ | Rebuilt | Second service priority; preparation and limitations explained. |
| /mobile-detailing-orlando/ | Rebuilt | Third service priority; interior and exterior maintenance. |
| /mobile-detailing-union-park-fl/ | Rebuilt | Core home-base location page; address and property access confirmed before booking. |
| /mobile-detailing-winter-springs-fl/ | Rebuilt | Coverage confirmed by exact address and appointment availability. |
| /service-areas/ | Rebuilt | Hub for the initial East Orlando service-area cluster. |
| /mobile-detailing-winter-park-fl/ | Rebuilt | Exact-address confirmation. |
| /mobile-detailing-lake-nona-fl/ | Rebuilt | Exact-address confirmation. |
| /mobile-detailing-waterford-lakes-fl/ | Rebuilt | Exact-address confirmation. |
| /mobile-detailing-avalon-park-fl/ | Rebuilt | Exact-address confirmation. |
| /mobile-detailing-oviedo-fl/ | Rebuilt | Exact-address confirmation. |
| /mobile-detailing-alafaya-fl/ | Rebuilt | Exact-address confirmation. |
| /interior-car-detailing-orlando/ | Rebuilt | Interior detailing subsection of mobile detailing. |
| /exterior-car-detailing-orlando/ | Rebuilt | Exterior detailing subsection of mobile detailing. |
| /contact/ | Rebuilt | Contact details and provisional quote form; form work remains deferred. |
| /pricing/ | Rebuilt | Pricing information is centralized here. |
| /faqs/ | Rebuilt as canonical FAQ | The older /faq/ spelling redirects here. |
| /reviews/ | Rebuilt | Links to current Google reviews; no fabricated review text or stale hard-coded rating count. |
| /privacy/ | Rebuilt | Privacy notice for website contact and quote requests. |
| /blog/ | Rebuilt as content hub | Lists project stories and useful car-care guides. |
| /mercedes-e350-paint-correction-ceramic-coating-oviedo/ | Rebuilt project story | Black Mercedes-Benz E350, Oviedo; multi-stage correction and ceramic coating. |
| /porsche-panamera-paint-correction-waterford-lakes/ | Rebuilt project story | Black Panamera, Waterford Lakes; original photo files are not in this repository, so no unrelated image is used. |
| /corvette-c8-r-edition-ceramic-coating-orlando/ | Rebuilt project story | 2023 C8.R; project location corrected to Winter Springs while preserving the historical URL slug. |
| /tesla-model-x-paint-correction-in-orlando-fl/ | Rebuilt project story | Orlando paint-correction story; original Tesla photo files are not in this repository, so no unrelated image is used. |
| /porsche-cayman-s-paint-correction-orlando/ | Rebuilt verified project story | The repository’s black Porsche before/after image is a Cayman S, not a Panamera. Keep this story and image correctly labeled. |
| /best-mobile-detailing-in-orlando/ | Retain as buyer guide | Distinct intent: how to compare providers and confirm mobile-service requirements. |
| /paint-correction-and-ceramic-coating/ | Retain as process guide | Explains the difference between correction and coating and why preparation comes first. |
| /ceramic-coating-near-me-is-it-worth-it/ | Retain as decision guide | Balanced benefits, limits, preparation, and maintenance. |
| /how-does-floridas-salty-air-affect-my-cars-paint-and-interior-central-florida-edition/ | Retain and rewrite | Covers UV exposure, humidity, mineral deposits, contamination, correction, coating, and maintenance. It explicitly does not claim ceramic coating protects brakes, suspension, underbody, or mechanical components. |
| /car-wash-damage-vs-mobile-detailing-orlando/ | Retain as wash-method guide | Nuanced comparison: automatic washes are not all identical, and poor hand-wash technique can also mar paint. |
| /summer-car-detailing-orlando/ | Retain as seasonal guide | Summer-specific sun, rain, bugs, pollen, sprinkler deposits, and maintenance. |

The six guides answer different questions and do not need to be consolidated into the service pages. Keep them distinct, cross-link them to the relevant service pages, and avoid repeating the same generic sales copy.

## 301 redirects configured in the repository _redirects file

Both slash and no-slash variants are present for each path below.

| Old URL | Destination | Reason |
|---|---|---|
| /faq/ | /faqs/ | Consolidate the duplicate/older FAQ spelling into one canonical FAQ page. |
| /mercedes-benz-paint-correction-ceramic-coating-oviedo/ | /mercedes-e350-paint-correction-ceramic-coating-oviedo/ | Preserve one canonical Mercedes project URL. |
| /luxury-detailing-services/ | /services/ | Relevant service-hub replacement; remove the outdated “luxury” positioning. |
| /car-detailing-orlando/ | /mobile-detailing-orlando/ | The current service taxonomy uses mobile detailing for this service. |
| /car-detailing-union-park-fl/ | /mobile-detailing-union-park-fl/ | Preserve the relevant Union Park destination under the current mobile-detailing URL. |

The old /car-detailing-orlando/ and /car-detailing-union-park-fl/ HTML stubs are removed from the replacement route tree so a failed redirect cannot expose duplicate, self-canonical pages. Keep the 301 rules and test them against the deployed Worker before launch.

## Host canonicalization still requires Cloudflare configuration

- Canonical host: https://detailsbydame.com
- Redirect http://detailsbydame.com/* to the matching HTTPS path.
- Redirect https://www.detailsbydame.com/* to the matching apex HTTPS path.
- Redirect http://www.detailsbydame.com/* to the matching apex HTTPS path.
- Preserve the path and query string where appropriate.
- These are zone/host-level rules; the repository _redirects file handles path redirects, not domain-level canonicalization.
- Do not change DNS, nameservers, custom-domain routing, GoDaddy hosting, or email routing without explicit production approval.

## Do not recreate as indexable pages

- /category/blogging/
- Thin /tag/ archive URLs
- WordPress image-attachment HTML pages

Do not blanket-redirect categories, tags, or attachment pages to the homepage. If an exact archive URL has meaningful impressions or backlinks, decide individually whether it has a relevant replacement. For image attachment URLs, redirect only to the actual image asset or a genuinely relevant content page after inspecting the exact URL. Otherwise return a proper 404/410. Keep the underlying image files available at stable asset paths.

## Indexing and preview safety

- The current sitemap contains 34 canonical HTTPS content routes. It does not include /faq/, /car-detailing-* redirects, category archives, tag archives, or image-attachment pages.
- robots.txt points to the canonical production sitemap.
- worker.js adds X-Robots-Tag: noindex, nofollow only when the request host ends in .workers.dev. The root _headers file contains security headers only.
- Do not remove the preview-only noindex behavior until a separate production-release review confirms the custom-domain behavior.
- The preview response header and the redirect responses have not been verified live in this review because the workers.dev preview was unreachable from the available inspection environment.

## Remaining migration acceptance checks

1. Deploy the review branch only to the existing workers.dev preview, if Cloudflare access is available; do not attach the production domain.
2. Confirm the preview returns X-Robots-Tag: noindex, nofollow and production-host requests will not inherit that header.
3. Test all 34 sitemap routes, nested assets, trailing-slash behavior, 404 behavior, and every 301 path redirect.
4. Confirm the sitemap, canonicals, metadata, structured data, internal links, and image references in a browser.
5. Complete desktop/mobile browser QA, scroll-scrub tests, accessibility review, and PageSpeed Insights/Core Web Vitals testing. Do not claim performance scores without running the tests.
6. Defer quote-form replacement and live submission testing to the final conversion pass, before accepting production leads.
7. Only after explicit approval, prepare the production release, configure host-level redirects, and plan DNS migration. Keep GoDaddy and email routing unchanged until then.
