# Details by Dame — deployment notes

## Current deployment target

The existing preview hostname is `details-by-dame-llc.damianinvests.workers.dev`. The Wrangler configuration uses the matching Worker name, `details-by-dame-llc`, and serves this repository as Cloudflare Workers Static Assets.

The repository root is the asset directory because the site already uses root-level `assets/`, `robots.txt`, `sitemap.xml`, and one `<route>/index.html` folder per content page.

## Local verification

1. Install Node.js LTS.
2. From the repository root, run `npx wrangler@latest dev`.
3. Open the local URL Wrangler prints.
4. Test the homepage, every route in `sitemap.xml`, nested CSS/images/videos, mobile navigation, the scroll-controlled video, and the 404 page.
5. Confirm the three legacy redirects in `_redirects`.

## Deploying the preview Worker

1. Run `npx wrangler@latest login` and authenticate to the Cloudflare account that owns the current `damianinvests.workers.dev` subdomain.
2. Run `npx wrangler@latest deploy`.
3. Confirm the deployment is still only on the `workers.dev` preview hostname. Do not attach `detailsbydame.com` or change DNS as part of preview testing.

The Wrangler config and deployment command have not been run from this chat because Cloudflare account credentials are not available here. Do not assume a GitHub commit alone has updated the preview deployment.

## Before connecting detailsbydame.com

- Remove the staging-only `X-Robots-Tag: noindex` line from `_headers`. Keep the other security headers.
- Verify the production hostname and HTTPS settings in Cloudflare.
- Configure host-level redirects for `www.detailsbydame.com` to `https://detailsbydame.com` and enforce HTTPS. The Workers `_redirects` file handles path redirects, not domain-level redirects.
- Test the old HTTP and www URLs and every legacy path redirect.
- Submit `https://detailsbydame.com/sitemap.xml` in Search Console only after the domain points to the new site and the sitemap is reachable.
- Keep GoDaddy hosting and email routing untouched until the new site and lead form have passed final acceptance.

## Quote form

The quote form is connected to FormSubmit's AJAX endpoint and sends submissions to detailsbydame@gmail.com. FormSubmit requires the recipient to confirm the first activation email before forwarding submissions. After deploying the preview, submit one test request, open the activation email (check Spam/Promotions), confirm the form, and submit a second test to verify delivery. The provider documents cross-origin AJAX support, spam controls, and a 30-day submissions retention window. Review its privacy terms before production. Do not put private API keys in public HTML.

## Redirect scope

The root `_redirects` file covers the known FAQ, Mercedes slug, and former luxury-services slug variants. Exact image-attachment URLs and WordPress archive URLs still need to be checked against Search Console / backlink data before any more redirects are added. Do not wildcard redirect all tags or categories to the homepage.
