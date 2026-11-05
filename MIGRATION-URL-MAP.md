# Details by Dame — URL migration map

This file is an internal migration checklist. It does not configure redirects by itself.

## Preserve and rebuild

| Legacy URL | New-site decision |
|---|---|
| / | Preserve as homepage |
| /about/ | Rebuilt at same URL |
| /services/ | Rebuilt as the service hub |
| /paint-correction-orlando/ | Preserve existing service page |
| /ceramic-coating-orlando/ | Preserve existing service page |
| /mobile-detailing-orlando/ | Preserve existing service page |
| /mobile-detailing-union-park-fl/ | Rebuilt at same URL |
| /mobile-detailing-winter-springs-fl/ | Rebuilt at same URL |
| /contact/ | Rebuilt at same URL |
| /pricing/ | Rebuilt at same URL |
| /faqs/ | Rebuilt as the canonical FAQ page |
| /reviews/ | Rebuilt with a direct link to current Google reviews |
| /interior-car-detailing-orlando/ | Rebuilt at same URL |
| /exterior-car-detailing-orlando/ | Rebuilt at same URL |
| /blog/ | Rebuilt as a guide index |
| /mercedes-e350-paint-correction-ceramic-coating-oviedo/ | Rebuilt as a project story |
| /porsche-panamera-paint-correction-waterford-lakes/ | Rebuilt as a project story |
| /corvette-c8-r-edition-ceramic-coating-orlando/ | Rebuilt as a project story |
| /tesla-model-x-paint-correction-in-orlando-fl/ | Rebuilt as a project story; do not attach an unverified image |
| /best-mobile-detailing-in-orlando/ | Retain and rewrite as a useful buyer guide |
| /paint-correction-and-ceramic-coating/ | Retain as an explanatory guide |
| /ceramic-coating-near-me-is-it-worth-it/ | Retain as a balanced decision guide |
| /how-does-floridas-salty-air-affect-my-cars-paint-and-interior-central-florida-edition/ | Retain and rewrite with accurate Florida climate/paint-care guidance |
| /car-wash-damage-vs-mobile-detailing-orlando/ | Retain and rewrite around wash technique and paint marring |
| /summer-car-detailing-orlando/ | Retain as a seasonal maintenance guide |
| /car-detailing-orlando/ | Restore: this URL has meaningful historical Search Console impressions |
| /car-detailing-union-park-fl/ | Restore: this URL has meaningful historical Search Console impressions |

## Redirects to configure after confirming the Cloudflare Worker/static-assets routing

| Old URL or variant | Intended destination | Notes |
|---|---|---|
| /faq/ | /faqs/ | 301 after confirming it is the duplicate/older FAQ URL |
| /mercedes-benz-paint-correction-ceramic-coating-oviedo/ | /mercedes-e350-paint-correction-ceramic-coating-oviedo/ | Search Console has historical impressions for this spelling variant; preserve one canonical project URL |
| /luxury-detailing-services/ | /services/ | Relevant service-hub replacement; avoid carrying forward the old “luxury” positioning |
| http://detailsbydame.com/* and www host variants | https://detailsbydame.com/* | Host-level canonicalization; retain paths where valid |

Do not add redirect rules until the deployed Cloudflare Worker/static-assets configuration is confirmed. The current repository has no checked-in Wrangler config or Worker entrypoint, so the correct redirect mechanism cannot yet be verified.

## Do not recreate as indexable content

- /category/blogging/
- Thin /tag/ archive URLs
- WordPress image attachment HTML pages

Do not redirect every tag/category archive to the homepage. If an archive has no genuinely equivalent replacement, let it return a proper 404/410 and keep it out of the sitemap. Keep the actual image files available under stable media URLs. For an attachment URL with meaningful links or impressions, choose a specific redirect to the actual image file or the most relevant content page after inspecting that URL.

## Launch checks still required

- Confirm every URL in sitemap.xml resolves with a 200 response.
- Confirm canonical tags point to the final HTTPS URLs.
- Confirm the live Worker serves nested directory index files as expected.
- Implement and test the 301 redirect table above.
- Validate all internal links and image paths.
- Test mobile layout, scroll-scrub behavior, LCP, image loading, and accessibility.
- Connect the quote form to the selected form service before launch.
- Do not change production DNS, GoDaddy hosting, or email routing until explicit approval.
