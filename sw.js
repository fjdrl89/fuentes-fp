/**
 * Service worker del directorio.
 *
 * Estrategia: red primero, caché de respaldo.
 * El sitio es un solo archivo que cambia cuando se actualiza el catálogo, así que
 * conviene intentar siempre la versión fresca y quedarse con la guardada solo si
 * no hay conexión. Al revés (caché primero) la gente vería el catálogo viejo.
 *
 * Sube CACHE_VERSION cuando publiques cambios para desalojar lo anterior.
 */
const CACHE_VERSION = "fuentes-fp-v2";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icono-192.png", "./icono-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Solo se gestiona la navegación y los archivos propios; los enlaces del
  // catálogo apuntan a otros dominios y deben ir siempre a la red.
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((hit) => hit ?? caches.match("./index.html"))),
  );
});
