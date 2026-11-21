const DATA_CACHE = "prm393-data-v1";
const IMAGE_CACHE = "prm393-images-v1";

const PRECACHE_URLS = [
  "/data/questions.json",
  "/data/TAI_LIEU_ON_TAP_PRM393.md",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(DATA_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== DATA_CACHE && k !== IMAGE_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (
    url.pathname.startsWith("/@") ||
    url.pathname.startsWith("/src/") ||
    url.pathname.startsWith("/node_modules/")
  ) {
    return;
  }

  // Ảnh đề gốc: Cache-First ngay trên máy người dùng
  if (url.pathname.startsWith("/images/")) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        const fresh = await fetch(req);
        if (fresh && fresh.ok) {
          cache.put(req, fresh.clone());
        }
        return fresh;
      })
    );
    return;
  }

  // Ngân hàng câu hỏi & tài liệu ôn tập: Stale-While-Revalidate
  if (
    url.pathname === "/data/questions.json" ||
    url.pathname === "/data/TAI_LIEU_ON_TAP_PRM393.md"
  ) {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const networkPromise = fetch(req)
          .then((fresh) => {
            if (fresh && fresh.ok) {
              cache.put(req, fresh.clone());
            }
            return fresh;
          })
          .catch(() => cached);
        return cached || networkPromise;
      })
    );
  }
});
