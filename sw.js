// --- Amadeus PWA Service Worker ---
// Bumpa version när du ändrar filer så att nya caches triggas
const VERSION = "amadeus-v1.0.0";
const CACHE_STATIC  = `static-${VERSION}`;
const CACHE_DYNAMIC = `dynamic-${VERSION}`;

// App-skalet (lägg till fler filer här om du bryter ut CSS/JS)
const ASSETS = [
  "./",               // viktigt på GitHub Pages
  "./index.html",
  "./manifest.json",
  "./192.png",
  "./512.png",
  "./1024.png",
  // "./Maskable_192.png",
  // "./Maskable_512.png",
  // "./Maskable_1024.png",
];

// Install: lägg allt i statiska cachen
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: städa bort gamla caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_STATIC && k !== CACHE_DYNAMIC)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: offline-stöd + smart cache-strategi
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Bara GET hanteras av SW
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // HTML-navigationer: nät först, annars offline-fallback
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Egna statiska tillgångar: cache-first
  if (sameOrigin && ASSETS.some((p) => url.pathname.endsWith(p.replace("./", "/")))) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
    return;
  }

  // Övriga GET (bilder, fonter, ev. CDN) – stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          // Klona svar innan cache-put
          const resClone = res.clone();
          caches.open(CACHE_DYNAMIC).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => cached); // offline → använd cache om den finns
      return cached || fetchPromise;
    })
  );
});

// Valfritt: möjliggör "skipWaiting" via postMessage
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
