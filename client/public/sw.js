// Service Worker optimisé CJD Amiens - Version Production 2025
const CACHE_VERSION = '1.1.7';
const CACHE_NAME = `cjd-amiens-v${CACHE_VERSION}`;
const API_CACHE = `cjd-api-v${CACHE_VERSION}`;
const STATIC_CACHE = `cjd-static-v${CACHE_VERSION}`;

// Configuration optimisée
const API_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const STATIC_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours

// Assets critiques à précharger
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(CRITICAL_ASSETS))
      .then(() => self.skipWaiting())
      .catch(error => console.error('[SW] Erreur installation:', error))
  );
});

// Activation et nettoyage
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => !name.includes(CACHE_VERSION))
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Stratégies de cache optimisées
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-HTTP et Vite HMR
  if (!request.url.startsWith('http') || url.pathname.includes('/@')) {
    return;
  }
  
  // API: Network First avec cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      networkFirstStrategy(request, API_CACHE, API_CACHE_DURATION)
    );
    return;
  }
  
  // Assets statiques: Cache First
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      cacheFirstStrategy(request, STATIC_CACHE)
    );
    return;
  }
  
  // HTML et autres: Network First
  event.respondWith(
    networkFirstStrategy(request, CACHE_NAME, STATIC_CACHE_DURATION)
  );
});

// Stratégie Network First optimisée
async function networkFirstStrategy(request, cacheName, maxAge) {
  try {
    const networkResponse = await fetch(request.clone());
    
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      const cacheDate = new Date(cachedResponse.headers.get('date'));
      const age = Date.now() - cacheDate.getTime();
      
      if (age < maxAge) {
        return cachedResponse;
      }
    }
    
    // Fallback pour les erreurs réseau
    if (request.destination === 'document') {
      return caches.match('/');
    }
    
    throw error;
  }
}

// Stratégie Cache First optimisée
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Mise à jour en arrière-plan
    fetch(request.clone())
      .then(response => {
        if (response.ok) {
          caches.open(cacheName).then(cache => {
            cache.put(request, response);
          });
        }
      })
      .catch(() => {}); // Ignorer les erreurs de mise à jour
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Retourner une réponse vide pour éviter les erreurs
    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Détection des assets statiques
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.woff', '.woff2', '.ttf', '.eot', '.ico', '.webp', '.avif'
  ];
  
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Gestion des notifications push
self.addEventListener('push', event => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192.svg',
      badge: data.badge || '/icon-192.svg',
      tag: data.tag || 'default',
      data: data.data || {},
      requireInteraction: false,
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('[SW] Erreur notification:', error);
  }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Si l'app est déjà ouverte, la focuser
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          let targetUrl = '/';
          
          if (data.type === 'new_idea') {
            targetUrl = '/?tab=ideas';
          } else if (data.type === 'new_event') {
            targetUrl = '/?tab=events';
          }
          
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Gestion de la synchronisation en arrière-plan
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // Synchroniser les données en cache avec le serveur
    const cache = await caches.open(API_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/')) {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.put(request, response);
          }
        } catch (error) {
          // Ignorer les erreurs de synchronisation
        }
      }
    }
  } catch (error) {
    console.error('[SW] Erreur synchronisation:', error);
  }
}

// Message handler pour la communication avec l'app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

// Log minimal en production
console.log('[SW] Service Worker actif - Version', CACHE_VERSION);