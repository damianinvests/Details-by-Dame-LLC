# Details by Dame — deployment and release notes

## Current deployment target

The intended preview hostname is details-by-dame-llc.damianinvests.workers.dev. wrangler.toml names the Worker details-by-dame-llc, enables workers_dev, and serves the repository root as Cloudflare Workers Static Assets.

The root asset directory contains assets/, robots.txt, sitemap.xml, and one <route>/index.html directory for each canonical content page. The current sitemap contains 34 canonical HTTPS routes.

## Current verification status

- The repository and current main branch were inspected before this migration follow-up.
- The replacement pages, redirects, sitemap, asset inventory, and preview-indexing logic were reviewed in GitHub.
- The supplied workers.dev preview could not be reached from the available inspection environment. A failed fetch is not proof that the Worker is down; it means live deployment and response behavior remain unverified.
- This repository has no confirmed Cloudflare deployment result from this review. A GitHub commit does not by itself prove that the preview Worker has been updated.
- No production domain, DNS, nameserver, GoDaddy, or email-routing setting has been changed.

## Local verification

1. Install Node.js LTS.
2. From the repository root, run npx wrangler@latest dev.
3. Open the local URL Wrangler prints.
4. Test the homepage, all 34 routes in sitemap.xml, nested CSS/images/videos, mobile navigation, scroll-controlled video behavior, and the 404 page.
5. Confirm every path redirect in _redirects, including both slash and no-slash variants.
6. Run python scripts/validate_site.py.

## Deploying the preview Worker

1. Authenticate with npx wrangler@latest login to the Cloudflare account that owns the current damianinvests.workers.dev subdomain.
2. Run npx wrangler@latest deploy from the intended review branch.
3. Confirm the deployed hostname is still only the existing workers.dev preview.
4. Check the preview response headers and test routes and redirects.
5. Do not attach detailsbydame.com, create a production route, or change DNS during preview testing.

Cloudflare credentials are not available in this review, so no deployment command has been run. Do not assume a GitHub change updated the live preview.

## Preview indexing behavior

The worker.js response handler adds X-Robots-Tag: noindex, nofollow only when the request hostname ends in .workers.dev. The root _headers file contains security headers only; it does not add a global noindex rule.

Before production release, test both hosts explicitly:
- The workers.dev preview must return the preview-only noindex header.
- The production hostname must not return noindex after it is deliberately routed to the Worker.

Do not remove the host-aware preview protection as a shortcut. It is designed to keep the temporary preview out of search while allowing the eventual custom domain to be indexable.

## Before connecting detailsbydame.com

- Obtain explicit approval for the production migration.
- Confirm the preview deployment and all route/asset/redirect behavior.
- Configure host-level redirects in Cloudflare so HTTP and www variants resolve to https://detailsbydame.com, preserving paths and query strings where appropriate.
- Confirm the custom domain is routed to the intended Worker before changing public DNS.
- Test HTTP, www, apex HTTPS, sitemap, canonicals, redirects, and response headers.
- Submit the canonical sitemap in Search Console only after the new production host is live and verified.
- Keep GoDaddy Managed WordPress, nameservers, DNS, and email routing unchanged until the production cutover is explicitly approved and planned.

## Quote form — deferred

The existing contact form currently references FormSubmit's AJAX endpoint. It has not been verified as an activated production lead channel in this review. The quote form is intentionally deferred to the final conversion pass and is not a blocker for reviewing site structure, URL migration, content, or SEO.

Before production leads are accepted:
- Choose the intended low-cost/free form service.
- Replace the provisional endpoint and review the provider's privacy and retention terms.
- Test successful delivery, validation errors, spam protection, and the user-facing confirmation.
- Confirm submissions reach the business inbox.

Do not treat the current FormSubmit endpoint as approved or verified.

## Media and performance notes

The repository includes dedicated smaller mobile video sources for the homepage and three primary service pages. The mobile homepage video is about 666 KB; the mobile paint-correction and ceramic-coating videos are about 225 KB and 238 KB. Their desktop counterparts are about 5.0–5.4 MB. The video script removes the source until the stage approaches the viewport and selects the mobile source on narrow screens.

The project image assets are compressed; the homepage already uses smaller mobile WebP sources for its three featured images. Content images are lazy-loaded and most have explicit dimensions. The Services page image dimensions are being corrected in the current review branch. These file-size and markup checks are not a substitute for a live PageSpeed Insights or Core Web Vitals test.

## Project-story media accuracy

- assets/porsche-3.png is a black Porsche Cayman S before/after image, not a Panamera. It belongs only to the Cayman S story and must not be used as the Panamera page's visible or Open Graph image.
- The original Panamera and Tesla project photos are not present in this repository. Their pages remain text-led until verified original images are recovered.
- The Corvette project location is Winter Springs, Florida. The historical URL slug includes “orlando”; preserve the slug but use the actual project location in page content and metadata.
- The Mercedes-Benz E350 project photo is assets/coat-mercedes.jpg; the Corvette project photo is assets/corvette-project.jpg.

## Redirect and archive scope

The root _redirects file handles the FAQ, Mercedes spelling variant, former luxury-services URL, and retired car-detailing URLs. Host-level HTTP/www canonicalization is a separate Cloudflare task.

Do not recreate /category/blogging/, thin /tag/ archives, or WordPress image-attachment HTML pages as indexable content. Do not blanket-redirect them to the homepage. Inspect exact attachment URLs against Search Console and backlink data; map a meaningful attachment page to the real image asset or relevant content only when the destination is genuinely equivalent.

## Service-area pages

The initial service-area cluster includes Union Park, Winter Springs, Winter Park, Lake Nona, Waterford Lakes, Avalon Park, Oviedo, and Alafaya, linked from /service-areas/. Pages state that availability depends on exact address, access, service, and schedule. They must not imply a staffed shop or guaranteed service in every neighborhood.
