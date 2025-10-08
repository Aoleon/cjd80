// Service Worker optimisé CJD Amiens - Version Production 2025
const CACHE_VERSION = '1.1.28';
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
      timestamp: Date.now(),
      actions: data.actions || []
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
        // Construire l'URL cible selon l'action
        let targetUrl = '/';
        
        if (action === 'vote') {
          targetUrl = '/?action=vote';
        } else if (action === 'register') {
          targetUrl = '/?action=register';
        } else if (action === 'view' || !action) {
          // Clic sur notification ou bouton "Voir"
          if (data.type === 'new_idea') {
            targetUrl = '/?tab=ideas';
          } else if (data.type === 'new_event') {
            targetUrl = '/?tab=events';
          }
        }
        
        // Si l'app est déjà ouverte, la focuser et naviguer vers l'URL
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              action: action,
              targetUrl: targetUrl,
              data: data
            });
            return client.focus();
          }
        }
        
        // Sinon, ouvrir une nouvelle fenêtre avec l'URL cible
        if (clients.openWindow) {
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
  
  if (event.tag === 'sync-queue') {
    event.waitUntil(syncOfflineQueue());
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

// IndexedDB configuration for offline queue
const DB_NAME = 'cjd-offline-queue';
const DB_VERSION = 1;
const STORE_NAME = 'actions';
const MAX_RETRY_COUNT = 3;

// Open IndexedDB
async function openOfflineQueueDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: false
        });
        
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        objectStore.createIndex('status', 'status', { unique: false });
        objectStore.createIndex('type', 'type', { unique: false });
      }
    };
  });
}

// Get actions by status from IndexedDB
async function getActionsByStatus(db, status) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('status');
    const request = index.getAll(status);
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = () => {
      reject(new Error(`Failed to get actions: ${request.error?.message}`));
    };
  });
}

// Update action status in IndexedDB
async function updateActionStatus(db, id, status, retryCount) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const action = getRequest.result;
      if (action) {
        action.status = status;
        if (retryCount !== undefined) {
          action.retryCount = retryCount;
        }
        
        const updateRequest = store.put(action);
        
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(new Error(`Failed to update action: ${updateRequest.error?.message}`));
      } else {
        resolve();
      }
    };
    
    getRequest.onerror = () => {
      reject(new Error(`Failed to get action: ${getRequest.error?.message}`));
    };
  });
}

// Remove action from IndexedDB
async function removeAction(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to remove action: ${request.error?.message}`));
  });
}

// Notify all clients
async function notifyClients(message) {
  const clientsList = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  clientsList.forEach(client => {
    client.postMessage(message);
  });
}

// Synchronize offline queue
async function syncOfflineQueue() {
  console.log('[SW] Starting offline queue synchronization...');
  
  try {
    const db = await openOfflineQueueDB();
    const pendingActions = await getActionsByStatus(db, 'pending');
    
    if (pendingActions.length === 0) {
      console.log('[SW] No pending actions to sync');
      db.close();
      return;
    }
    
    console.log(`[SW] Found ${pendingActions.length} pending actions to sync`);
    
    let syncedCount = 0;
    let failedCount = 0;
    
    for (const action of pendingActions) {
      try {
        // Mark as syncing
        await updateActionStatus(db, action.id, 'syncing');
        console.log(`[SW] Syncing action ${action.id}: ${action.type}`);
        
        // Make the actual API request
        const response = await fetch(action.endpoint, {
          method: action.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: action.data ? JSON.stringify(action.data) : undefined,
          credentials: 'include',
        });
        
        if (response.ok) {
          // Success - remove from queue
          await removeAction(db, action.id);
          syncedCount++;
          console.log(`[SW] ✓ Successfully synced action ${action.id}`);
        } else {
          // Failed - increment retry count
          const newRetryCount = (action.retryCount || 0) + 1;
          
          if (newRetryCount >= MAX_RETRY_COUNT) {
            // Max retries reached - mark as failed
            await updateActionStatus(db, action.id, 'failed', newRetryCount);
            failedCount++;
            console.error(`[SW] ✗ Action ${action.id} failed after ${newRetryCount} attempts (HTTP ${response.status})`);
          } else {
            // Mark back as pending for next sync attempt
            await updateActionStatus(db, action.id, 'pending', newRetryCount);
            console.warn(`[SW] ⚠ Action ${action.id} failed (attempt ${newRetryCount}/${MAX_RETRY_COUNT}, HTTP ${response.status})`);
          }
        }
      } catch (error) {
        // Network or other error - increment retry count
        const newRetryCount = (action.retryCount || 0) + 1;
        
        if (newRetryCount >= MAX_RETRY_COUNT) {
          await updateActionStatus(db, action.id, 'failed', newRetryCount);
          failedCount++;
          console.error(`[SW] ✗ Action ${action.id} error after ${newRetryCount} attempts:`, error.message);
        } else {
          await updateActionStatus(db, action.id, 'pending', newRetryCount);
          console.warn(`[SW] ⚠ Action ${action.id} error (attempt ${newRetryCount}/${MAX_RETRY_COUNT}):`, error.message);
        }
      }
    }
    
    db.close();
    
    // Notify clients of sync results
    await notifyClients({
      type: 'SYNC_COMPLETE',
      synced: syncedCount,
      failed: failedCount
    });
    
    console.log(`[SW] Sync complete: ${syncedCount} synced, ${failedCount} failed`);
  } catch (error) {
    console.error('[SW] Error during offline queue sync:', error);
    
    // Notify clients of error
    await notifyClients({
      type: 'SYNC_ERROR',
      error: error.message
    });
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