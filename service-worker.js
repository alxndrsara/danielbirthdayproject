const CACHE_NAME = "for-you-v2";

// cache
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",

  // audio
  "./audio/1-oriana.mp3",
  "./audio/2-via.mp3",
  "./audio/3-deshinta.mp3",
  "./audio/4-faris.mp3",
  "./audio/5-danilo.mp3",
  "./audio/6-abdiel.mp3",
  "./audio/7-fitri.mp3",
  "./audio/8-anet.mp3",
  "./audio/9-septi.mp3",
  "./audio/10-kezia.mp3",
  "./audio/11-paksi.mp3",
  "./audio/12-sisil.mp3",
  "./audio/13-keylie.mp3",
  "./audio/14-maria.mp3",
  "./audio/15-sara.mp3",
  "./audio/16-lauren.mp3",

  // images 
  "./images/1.jpeg",
  "./images/2.jpeg",
  "./images/4.jpeg",
  "./images/5.jpeg",
  "./images/6.jpeg",
  "./images/7.jpeg",
  "./images/8.jpeg",
  "./images/10.jpeg",
  "./images/12.jpeg",
  "./images/13.jpeg",
  "./images/15.jpeg",
  "./images/16.jpeg",
  "./images/17.jpeg",
  "./images/18.jpeg",
  "./images/19.jpeg",
  "./images/20.jpeg",
  "./images/21.jpeg",
  "./images/25.jpeg",
];

// =======================
// INSTALL
// =======================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// =======================
// ACTIVATE
// =======================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// =======================
// FETCH
// =======================
self.addEventListener("fetch", (event) => {
  const req = event.request;


  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
 
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, copy);
          });
          return res;
        })
        .catch(() => {
         
          if (req.destination === "document") {
            return caches.match("./index.html");
          }
        });
    })
  );
});

