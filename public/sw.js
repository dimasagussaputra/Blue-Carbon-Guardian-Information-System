self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response(
        JSON.stringify({ error: "Anda sedang offline. Silakan coba lagi nanti." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    })
  );
});
