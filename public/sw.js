const DATA_CACHE = "quiz-data-v5";
const IMAGE_CACHE = "prm393-images-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
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

  // Ảnh đề gốc: Cache-First ngay trên máy người dùng (ảnh không thay đổi)
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

  // Ngân hàng câu hỏi & tài liệu lý thuyết: Network-First để luôn nhận bản mới nhất, mất mạng mới dùng cache
  if (url.pathname.startsWith("/data/")) {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        try {
          const fresh = await fetch(req, { cache: "no-cache" });
          if (fresh && fresh.ok) {
            cache.put(url.pathname, fresh.clone());
          }
          return fresh;
        } catch {
          const cached = await cache.match(url.pathname);
          if (cached) return cached;
          throw new Error("Offline and no cached data available");
        }
      })
    );
  }
});
