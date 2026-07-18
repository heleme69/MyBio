export default {
  async fetch(request, env) {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Content-Type": "application/json",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const url = new URL(request.url);
    if (url.pathname === "/favicon.ico") {
      return new Response(null, { status: 204 }); // Return "No Content" immediately
    }

    const key = "site-views";
    let count = parseInt(await env.VIEW_KV.get(key)) || 0;
    count += 1;
    await env.VIEW_KV.put(key, count.toString());

    return new Response(JSON.stringify({ count }), { headers });
  },
};