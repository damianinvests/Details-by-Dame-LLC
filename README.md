# Details by Dame — Stage 1 (static site for Cloudflare Pages)

## What is in this stage
- `index.html` (home: hero, services, 3D scroll process, credentials, areas, quote form)
- `paint-correction-orlando/index.html` (the deepest page: defects, swirl simulator, cost, FAQ, case-study links)
- `privacy/index.html` (DRAFT, have it reviewed), `404.html`
- `assets/css/site.css` (design tokens at the top), `assets/js/site.js` (menu, 3D story, simulator, form)
- `functions/api/lead.js` (quote form backend), `_headers`, `_redirects`, `robots.txt`, `sitemap.xml`

Not built yet (Stage 2): ceramic coating, mobile detailing, exterior/interior, pricing, reviews, about, FAQs, blog, the three case studies, Union Park and Winter Springs pages, plus new Oviedo / Winter Park / dealer pages. The links to them are already in place and use your **existing live URLs**, so they will 404 on the preview until Stage 2.

## DO NOT point detailsbydame.com at this yet
Your live WordPress site has ~25 URLs that Google already knows. Going live with only these pages would turn the rest into 404s and hurt rankings. Launch only when every existing URL is rebuilt at the same path (or redirected one-to-one in `_redirects`). Paste the transfer into WordPress only if you decide to stay on WordPress.

## Deploy the preview
1. Create a GitHub repo and upload this folder's contents (not the folder itself) to the repo root.
2. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git > pick the repo. Framework: None. Build command: empty. Output directory: `/`.
3. Open the `*.pages.dev` URL. `_headers` marks every preview noindex automatically.
4. To update: edit files in GitHub; Cloudflare redeploys in about a minute.

## Make the quote form real (needed before launch)
Pages > Settings > Variables and Secrets (production): `RESEND_API_KEY`, `LEAD_TO` (your inbox), `LEAD_FROM` (a verified Resend sender). Optional spam layer: add Cloudflare Turnstile and set `TURNSTILE_SECRET` (the widget must also be added to the form). Until configured, the form falls back to opening an email draft. Never put keys in the HTML or JS.

## Replace before launch
- **Hero photo (LCP):** the hero currently uses your Corvette image from the live site as a stand-in. Replace with a foaming-the-car photo: ~1600px wide JPG/WebP/AVIF under ~150 KB, keep `width`, `height`, `fetchpriority="high"`, and the `<link rel="preload">`.
- **3D scroll photos:** six slots on the home page labeled "Add job photo here". Use one job, one photo per step (foam, iron/clay, compound, polish, wipe-down, coating), same crop, ~1200px wide. Step 6 needs a before photo and an after photo.
- **Logo and brand color:** I could not read your logo (Google blocks automated access to the Business Profile). Upload the file and set `--accent` in `site.css`. The brass is a placeholder.
- **Hours:** shown as 9 AM to 5 PM; add the days you work.
- **Reviews:** "60+ five-star Google reviews" is a safe rounding of 68. Update when you pass 70.
- **Privacy policy:** draft only; confirm analytics wording.
- **Analytics:** none installed. Recommended: Cloudflare Web Analytics (no cookies, no banner needed for it). Keep Search Console as your SEO source.

## Fix the duplicate-URL problem (from your Search Console data)
Search Console shows `http://`, `https://` and `www` versions of the homepage splitting impressions. In Cloudflare: SSL/TLS > Edge Certificates > turn on **Always Use HTTPS**; Rules > Redirect Rules > redirect `www.detailsbydame.com/*` to `https://detailsbydame.com/$1` (301). Add a Domain property in Search Console.

## Testing report (what was actually run)
Done: JS syntax check; HTML parsed (one H1 per page, no duplicate IDs, all anchors resolve, all images have alt/dimensions); JSON-LD parses; headless Chromium render of home and paint-correction pages at 1280 and 390 px; 3D story verified live and reverts to a plain list under reduced motion; simulator polish tested (progress rose to 30–41% after a test swipe); no horizontal overflow at 390 px.
Not done: Lighthouse/PageSpeed (no internet in my environment), real-device touch testing, screen-reader testing, contrast audit tooling, form delivery (needs your keys), Google Rich Results test. Fonts and the hero image could not load in my sandbox, so real load time is unmeasured. Do not treat this as WCAG certification.

## Page checklist (Stage 1)
Home: title/description set, one H1, LocalBusiness + WebSite schema, canonical, preload on LCP image. Paint correction: unique title/description, one H1, Service + Breadcrumb schema, 4 visible FAQs (no FAQ schema; rich results are restricted), internal links to ceramic, mobile detailing, case studies, pricing, reviews, FAQs.
