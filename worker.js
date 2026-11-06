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
    let response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";

    // Install GTM once for every successful HTML page response. The GA4
    // Google tag (G-R9MP6CR3JX) is configured inside this GTM container;
    // do not also hard-code a separate gtag.js installation here.
    if (response.status < 400 && contentType.includes("text/html")) {
      response = new HTMLRewriter()
        .on("head", {
          element(element) {
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

    const url = new URL(request.url);

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
