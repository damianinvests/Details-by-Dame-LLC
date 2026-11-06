export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const url = new URL(request.url);
    const headers = new Headers(response.headers);

    // Keep the temporary workers.dev preview out of search results.
    // Production custom domains are intentionally indexable.
    if (url.hostname.endsWith(".workers.dev")) {
      headers.set("X-Robots-Tag", "noindex, nofollow");
    }

    const responseWithHeaders = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });

    // Install Google Tag Manager on every HTML page. The GA4 Google tag
    // (G-R9MP6CR3JX) is configured and published inside this GTM container.
    // Do not add a separate gtag.js snippet here, which could double-count.
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return responseWithHeaders;
    }

    return new HTMLRewriter()
      .on("head", {
        element(element) {
          element.append(
            `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WLBVXM9');</script>
<!-- End Google Tag Manager -->`,
            { html: true }
          );
        }
      })
      .on("body", {
        element(element) {
          element.prepend(
            `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WLBVXM9"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`,
            { html: true }
          );
        }
      })
      .transform(responseWithHeaders);
  }
};
