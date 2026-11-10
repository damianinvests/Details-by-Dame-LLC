const GTM_CONTAINER_ID = "GTM-WLBVXM9";

const GTM_HEAD_SNIPPET = `<script>
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');
</script>`;

const GTM_BODY_NOSCRIPT = `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";

    // Keep HTML rewriting deliberately small and deterministic. The prior
    // wildcard text-replacement handler was recently introduced and is the
    // only new Worker transformation associated with the blank-page report.
    if (response.status < 400 && contentType.includes("text/html")) {
      let titleText = "";
      const normalizeBrandTitle = (value) => {
        let title = (value || "").trim();
        if (/Details by Dame, LLC/i.test(title)) return title;
        if (/Details by Dame/i.test(title)) {
          return title.replace(/Details by Dame(?!, LLC)/gi, "Details by Dame, LLC");
        }
        return title ? title + " | Details by Dame, LLC" : "Details by Dame, LLC";
      };

      response = new HTMLRewriter()
        .on("title", {
          element(element) {
            titleText = "";
            element.onEndTag(() => element.setInnerContent(normalizeBrandTitle(titleText)));
          },
          text(text) {
            titleText += text.text;
          }
        })
        .on('meta[property="og:title"]', {
          element(element) {
            element.setAttribute("content", normalizeBrandTitle(element.getAttribute("content")));
          }
        })
        .on('meta[name="twitter:title"]', {
          element(element) {
            element.setAttribute("content", normalizeBrandTitle(element.getAttribute("content")));
          }
        })
        .on("head", {
          element(element) {
            element.append('<link rel="icon" type="image/jpeg" href="/assets/details-favicon.jpg">', { html: true });
            element.append('<link rel="apple-touch-icon" href="/assets/details-favicon.jpg">', { html: true });
            element.append('<meta property="og:site_name" content="Details by Dame, LLC">', { html: true });
            element.append('<meta name="application-name" content="Details by Dame, LLC">', { html: true });
            const businessSchema = {
              "@context": "https://schema.org",
              "@type": "AutomotiveBusiness",
              "@id": "https://detailsbydame.com/#business",
              "name": "Details by Dame, LLC",
              "url": "https://detailsbydame.com/",
              "telephone": "+1-321-419-5434",
              "email": "info@detailsbydame.com",
              "image": "https://detailsbydame.com/assets/porsche-3.png",
              "logo": "https://detailsbydame.com/assets/details-logo.png",
              "hasMap": "https://www.google.com/maps/place/Details+by+Dame,+LLC/@28.5936727,-81.2407746,17z/data=!3m1!4b1!4m6!3m5!1s0x475a1e36d9fe6595:0xee178b3861e981ab!8m2!3d28.5936727!4d-81.2407746!16s%2Fg%2F11tn_138_b?entry=ttu",
              "sameAs": ["https://www.facebook.com/detailsbydame/", "https://www.instagram.com/detailsbydame/"],
              "address": { "@type": "PostalAddress", "addressLocality": "Union Park", "addressRegion": "FL", "addressCountry": "US" },
              "areaServed": ["Orlando, FL", "Union Park, FL", "Waterford Lakes, FL", "Avalon Park, FL", "Winter Springs, FL", "Oviedo, FL", "Winter Park, FL", "Lake Nona, FL", "Alafaya, FL"]
            };
            if (url.pathname !== "/") {
              element.append('<script type="application/ld+json">' + JSON.stringify(businessSchema) + '</script>', { html: true });
            } else {
              const websiteSchema = {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Details by Dame, LLC",
                "url": "https://detailsbydame.com/"
              };
              element.append('<script type="application/ld+json">' + JSON.stringify(websiteSchema) + '</script>', { html: true });
            }
            const pagePath = url.pathname.replace(/\/+$/, "") || "/";
            if (pagePath !== "/") {
              const labels = {
                "/about": "About", "/best-mobile-detailing-in-orlando": "Best Mobile Detailing in Orlando", "/blog": "Blog",
                "/car-wash-damage-vs-mobile-detailing-orlando": "Car Wash Damage vs. Mobile Detailing", "/ceramic-coating-near-me-is-it-worth-it": "Is Ceramic Coating Worth It?",
                "/ceramic-coating-orlando": "Ceramic Coating in Orlando", "/contact": "Contact", "/corvette-c8-r-edition-ceramic-coating-orlando": "Corvette C8.R Ceramic Coating",
                "/exterior-car-detailing-orlando": "Exterior Car Detailing in Orlando", "/faqs": "FAQs",
                "/how-does-floridas-salty-air-affect-my-cars-paint-and-interior-central-florida-edition": "Florida Salt Air and Vehicle Care",
                "/interior-car-detailing-orlando": "Interior Car Detailing in Orlando", "/mercedes-e350-paint-correction-ceramic-coating-oviedo": "Mercedes E350 Paint Correction and Ceramic Coating",
                "/mobile-detailing-alafaya-fl": "Mobile Detailing in Alafaya", "/mobile-detailing-avalon-park-fl": "Mobile Detailing in Avalon Park",
                "/mobile-detailing-lake-nona-fl": "Mobile Detailing in Lake Nona", "/mobile-detailing-melbourne-fl": "Mobile Detailing in Melbourne",
                "/mobile-detailing-orlando": "Mobile Detailing in Orlando", "/mobile-detailing-oviedo-fl": "Mobile Detailing in Oviedo",
                "/mobile-detailing-union-park-fl": "Mobile Detailing in Union Park", "/mobile-detailing-waterford-lakes-fl": "Mobile Detailing in Waterford Lakes",
                "/mobile-detailing-winter-park-fl": "Mobile Detailing in Winter Park", "/mobile-detailing-winter-springs-fl": "Mobile Detailing in Winter Springs",
                "/paint-correction-and-ceramic-coating": "Paint Correction and Ceramic Coating", "/paint-correction-orlando": "Paint Correction in Orlando",
                "/porsche-cayman-s-paint-correction-orlando": "Porsche Cayman S Paint Correction", "/porsche-panamera-paint-correction-waterford-lakes": "Porsche Panamera Paint Correction",
                "/pricing": "Pricing", "/privacy": "Privacy Policy", "/reviews": "Reviews", "/service-areas": "Service Areas",
                "/services": "Services", "/summer-car-detailing-orlando": "Summer Car Detailing in Orlando", "/tesla-model-x-paint-correction-in-orlando-fl": "Tesla Model X Paint Correction"
              };
              const label = labels[pagePath] || pagePath.split("/").filter(Boolean).pop().replace(/-/g, " ");
              const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://detailsbydame.com/" },
                { "@type": "ListItem", "position": 2, "name": label, "item": "https://detailsbydame.com" + pagePath + "/" }
              ] };
              if (!["/paint-correction-orlando", "/ceramic-coating-orlando", "/mobile-detailing-orlando"].includes(pagePath)) {
                element.append('<script type="application/ld+json">' + JSON.stringify(breadcrumb) + '</script>', { html: true });
              }
            }
            element.append(GTM_HEAD_SNIPPET, { html: true });
          }
        })
        .on("body", {
          element(element) {
            element.prepend(GTM_BODY_NOSCRIPT, { html: true });
          }
        })
        .transform(response);
    }

    // Keep the temporary workers.dev preview out of search results.
    // Production custom domains are intentionally indexable.
    if (url.hostname.endsWith(".workers.dev")) {
      const headers = new Headers(response.headers);
      headers.set("X-Robots-Tag", "noindex, nofollow");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    return response;
  }
};
