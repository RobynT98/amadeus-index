// --- Amadeus PWA Service Worker ---
const VERSION = "amadeus-v1.0.1";
const CACHE_STATIC  = `static-${VERSION}`;
const CACHE_DYNAMIC = `dynamic-${VERSION}`;
const DYNAMIC_MAX   = 80; // trimma efter behov

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./192.png", "./512.png", "./1024.png",
  // lägg till nya filer här:
  // "./styles.css",
  // "./app.js",
  // "./commands.json",
];

// Hjälpare: trimma dynamiska cachen
async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  // ta äldsta först
  await cache.delete(keys[0]);
  return trimCache(name, max);
}

// Installation
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_STATIC).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Aktivering
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // Navigation preload för snabbare first-load
    if ("navigationPreload" in self.registration) {
      try { await self.registration.navigationPreload.enable(); } catch {}
    }
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => k !== CACHE_STATIC && k !== CACHE_DYNAMIC)
          .map(k => caches.delete(k))
    );
  })());
  self.clients.claim();
});

// Fixa normaliserad nyckel (ignorera query för statiska)
// och lek snäll med GitHub Pages/Vercel paths
function normalizedRequest(req) {
  try {
    const url = new URL(req.url);
    // Ignorera söksträng för lokala statiska tillgångar
    const isLocal = url.origin === self.location.origin;
    if (isLocal) {
      // matcha mot exakt sökväg utan query (t.ex. style.css?v=1)
      return new Request(url.origin + url.pathname, { method: req.method, headers: req.headers, mode: req.mode, credentials: req.credentials, redirect: req.redirect });
    }
  } catch {}
  return req;
}

// Fetch
self.addEventListener("fetch", (event) => {
  const origReq = event.request;
  if (origReq.method !== "GET") return;

  const url = new URL(origReq.url);
  const sameOrigin = url.origin === self.location.origin;

  // HTML-navigation (SPA): nät först, fallback till index.html
  if (origReq.mode === "navigate") {
    event.respondWith((async () => {
      try {
        // Om navigation preload finns – använd den
        const preload = "navigationPreload" in self.registration
          ? await event.preloadResponse
          : null;
        if (preload) return preload;
        return await fetch(origReq);
      } catch {
        return caches.match("./index.html");
      }
    })());
    return;
  }

  // Cache-first för våra egna statiska tillgångar
  const normReq = normalizedRequest(origReq);
  const isStatic = sameOrigin && ASSETS.some(p =>
    url.pathname.endsWith(p.replace("./","/"))
  );

  if (isStatic) {
    event.respondWith(
      caches.match(normReq).then(cached => cached || fetch(origReq))
    );
    return;
  }

  // Stale-while-revalidate för övriga GET
  event.respondWith((async () => {
    const cached = await caches.match(normReq);
    const fetchPromise = fetch(origReq).then(async (res) => {
      // cacha bara vettiga svar
      if (res && (res.ok || res.type === "opaque")) {
        const clone = res.clone();
        const cache = await caches.open(CACHE_DYNAMIC);
        await cache.put(normReq, clone);
        trimCache(CACHE_DYNAMIC, DYNAMIC_MAX);
      }
      return res;
    }).catch(() => cached);
    return cached || fetchPromise;
  })());
});

// Valfritt API för snabb uppdatering
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
