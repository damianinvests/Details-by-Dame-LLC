export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
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
