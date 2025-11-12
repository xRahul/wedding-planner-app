const CACHE_NAME = 'wedding-planner-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/styles/accessibility.css',
    '/storage.js',
    '/utils.js',
    '/utils/security.js',
    '/components/error-boundary.js',
    '/components/shared-components-bundle.js',
    '/components/header-component.js',
    '/components/tabs-component.js',
    '/components/dashboard-component.js',
    '/components/timeline-component.js',
    '/components/guest-components.js',
    '/components/vendor-components.js',
    '/components/budget-components.js',
    '/components/task-components.js',
    '/components/menu-components.js',
    '/components/gift-components.js',
    '/components/ritual-components.js',
    '/components/shopping-components.js',
    '/components/travel-components.js',
    '/components/setting-components.js',
    '/app.js',
    '/pwa.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install service worker and cache all resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch resources from cache or network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request because it's a one-time use stream
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest)
                    .then(response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response because it's a one-time use stream
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
            })
    );
});

// Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});