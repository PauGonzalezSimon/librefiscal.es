// Service Worker para caché de larga duración en GitHub Pages
// Cachea durante 1 año fuentes locales, logo WebP y assets estáticos

const CACHE_NAME = 'librefiscal-v1';
const ASSETS_TO_CACHE = [
    '/fonts/font-0.woff2',
    '/fonts/font-5.woff2',
    '/logo-icono.webp',
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(function () {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (name) {
                    return name !== CACHE_NAME;
                }).map(function (name) {
                    return caches.delete(name);
                })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function (event) {
    const url = new URL(event.request.url);
    // Solo interceptar assets propios: fuentes y logo
    if (ASSETS_TO_CACHE.some(a => url.pathname === a)) {
        event.respondWith(
            caches.match(event.request).then(function (cached) {
                if (cached) return cached;
                return fetch(event.request).then(function (response) {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                    }
                    return response;
                });
            })
        );
    }
});
