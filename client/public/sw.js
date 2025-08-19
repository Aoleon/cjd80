// Service Worker avec stratégies de cache optimisées pour 2025
const CACHE_NAME = 'cjd-amiens-v1.0.0';
const API_CACHE = 'cjd-api-cache-v1';
const STATIC_CACHE = 'cjd-static-v1';
const FONTS_CACHE = 'cjd-fonts-v1';
const IMAGES_CACHE = 'cjd-images-v1';

// Assets critiques à précharger
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installation en cours...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Préchargement des assets critiques');
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation terminée');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Erreur lors de l\'installation:', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activation en cours...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        const oldCaches = cacheNames.filter(name => 
          name !== CACHE_NAME && 
          name !== API_CACHE && 
          name !== STATIC_CACHE && 
          name !== FONTS_CACHE && 
          name !== IMAGES_CACHE
        );
        
        return Promise.all(
          oldCaches.map(cacheName => {
            console.log('[SW] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation terminée');
        return self.clients.claim();
      })
  );
});

// Gestion des requêtes avec stratégies optimisées
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) return;
  
  event.respondWith(handleRequest(request, url));
});

async function handleRequest(request, url) {
  try {
    // 1. Stratégie Cache-First pour les polices Google
    if (url.hostname === 'fonts.gstatic.com') {
      return await cacheFirst(request, FONTS_CACHE, 365 * 24 * 60 * 60 * 1000); // 1 an
    }
    
    // 2. Stratégie StaleWhileRevalidate pour les CSS de polices
    if (url.hostname === 'fonts.googleapis.com') {
      return await staleWhileRevalidate(request, FONTS_CACHE);
    }
    
    // 3. Stratégie NetworkFirst pour les APIs avec fallback
    if (url.pathname.startsWith('/api/')) {
      return await networkFirstWithFallback(request, url);
    }
    
    // 4. Stratégie CacheFirst pour les images
    if (request.destination === 'image' || /\.(png|jpg|jpeg|svg|gif|webp|avif)$/i.test(url.pathname)) {
      return await cacheFirst(request, IMAGES_CACHE, 30 * 24 * 60 * 60 * 1000); // 30 jours
    }
    
    // 5. Stratégie StaleWhileRevalidate pour les assets statiques
    if (request.destination === 'script' || request.destination === 'style' || 
        /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname)) {
      return await staleWhileRevalidate(request, STATIC_CACHE);
    }
    
    // 6. Stratégie NetworkFirst pour les pages HTML
    if (request.destination === 'document' || 
        request.headers.get('accept')?.includes('text/html')) {
      return await networkFirstForPages(request);
    }
    
    // 7. Stratégie par défaut : NetworkFirst
    return await networkFirst(request, CACHE_NAME);
    
  } catch (error) {
    console.error('[SW] Erreur dans handleRequest:', error);
    return await handleOfflineFallback(request);
  }
}

// Stratégie Cache-First avec expiration
async function cacheFirst(request, cacheName, maxAge = null) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Vérifier l'expiration si maxAge est défini
    if (maxAge) {
      const cachedDate = new Date(cachedResponse.headers.get('sw-cached-date') || 0);
      const now = new Date();
      if (now - cachedDate > maxAge) {
        console.log('[SW] Cache expiré, récupération réseau');
        return await fetchAndCache(request, cache);
      }
    }
    return cachedResponse;
  }
  
  return await fetchAndCache(request, cache);
}

// Stratégie Network-First optimisée
async function networkFirst(request, cacheName, timeout = 3000) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), timeout)
      )
    ]);
    
    if (networkResponse.ok) {
      await cacheResponse(cache, request, networkResponse.clone());
    }
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] Network failed, utilisation du cache:', error.message);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;
    
    throw error;
  }
}

// Stratégie Network-First spécialisée pour les APIs
async function networkFirstWithFallback(request, url) {
  // Jamais de cache pour l'admin (sécurité)
  if (url.pathname.startsWith('/api/admin/')) {
    return fetch(request);
  }
  
  const cache = await caches.open(API_CACHE);
  const timeout = getApiTimeout(url.pathname);
  
  try {
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), timeout)
      )
    ]);
    
    if (networkResponse.ok && request.method === 'GET') {
      const responseToCache = networkResponse.clone();
      // Ajouter timestamp pour invalidation
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-date', new Date().toISOString());
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      await cache.put(request, cachedResponse);
    }
    return networkResponse;
    
  } catch (error) {
    if (request.method === 'GET') {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log('[SW] API cache utilisé pour:', url.pathname);
        return cachedResponse;
      }
    }
    
    // Fallback pour APIs critiques
    return createApiErrorResponse(url.pathname);
  }
}

// Stratégie StaleWhileRevalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Réponse immédiate du cache si disponible
  const fetchPromise = fetchAndCache(request, cache);
  
  return cachedResponse || await fetchPromise;
}

// Stratégie spécialisée pour les pages HTML
async function networkFirstForPages(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    return cachedResponse || await cache.match('/');
  }
}

// Utilitaires
async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cacheResponse(cache, request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Erreur fetch:', error);
    throw error;
  }
}

async function cacheResponse(cache, request, response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cached-date', new Date().toISOString());
  
  const cachedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
  
  await cache.put(request, cachedResponse);
}

function getApiTimeout(pathname) {
  if (pathname.includes('/votes') || pathname.includes('/inscriptions')) {
    return 5000; // 5s pour les actions utilisateur
  }
  if (pathname.includes('/ideas') || pathname.includes('/events')) {
    return 3000; // 3s pour le contenu principal
  }
  return 8000; // 8s par défaut
}

function createApiErrorResponse(pathname) {
  const errorData = {
    success: false,
    error: 'Application hors ligne',
    message: 'Cette fonctionnalité nécessite une connexion internet',
    offline: true
  };
  
  return new Response(JSON.stringify(errorData), {
    status: 503,
    statusText: 'Service Unavailable',
    headers: {
      'Content-Type': 'application/json',
      'sw-fallback': 'true'
    }
  });
}

async function handleOfflineFallback(request) {
  if (request.destination === 'document') {
    const cache = await caches.open(CACHE_NAME);
    return await cache.match('/') || new Response('Application hors ligne', {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  return new Response('Ressource indisponible hors ligne', {
    status: 503,
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Gestion des messages du client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    getCacheStatus().then(status => {
      event.ports[0].postMessage(status);
    });
  }
});

async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[cacheName] = keys.length;
  }
  
  return status;
}

console.log('[SW] Service Worker CJD Amiens chargé - Version 1.0.0');