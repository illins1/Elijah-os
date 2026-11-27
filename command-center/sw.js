/* Network-first for the shared Briefing feed; other assets remain browser-managed. */
const BRIEFING_URL = new URL('./briefing.json', self.registration.scope).href;
const BRIEFING_CACHE = 'briefing-feed-v1';
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.href !== BRIEFING_URL) return;
  event.respondWith((async () => {
    const cache = await caches.open(BRIEFING_CACHE);
    try {
      const response = await fetch(event.request);
      if (response && response.ok) await cache.put(event.request, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      return new Response(JSON.stringify({updated:null,priority:"Offline — no saved briefing yet",cards:[]}), {
        status: 200, headers: {'Content-Type':'application/json; charset=utf-8'}
      });
    }
  })());
});
