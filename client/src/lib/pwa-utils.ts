// Utilitaires PWA pour améliorer l'expérience utilisateur

export const PWAUtils = {
  // Vérifier si l'app est installée
  isAppInstalled(): boolean {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    return isStandalone || (isIOS && isInWebAppiOS);
  },

  // Vérifier si l'installation est supportée
  isInstallSupported(): boolean {
    return 'serviceWorker' in navigator && 'beforeinstallprompt' in window;
  },

  // Vérifier le statut de la connexion
  isOnline(): boolean {
    return navigator.onLine;
  },

  // Obtenir les informations de cache du Service Worker
  async getCacheInfo(): Promise<Record<string, number>> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data || {});
        };
        
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_CACHE_STATUS' },
          [messageChannel.port2]
        );
      });
    }
    return {};
  },

  // Forcer la mise à jour du Service Worker
  async updateServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  },

  // Nettoyer les anciens caches
  async clearOldCaches(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const currentVersion = 'v1.0.0';
      
      await Promise.all(
        cacheNames
          .filter(name => !name.includes(currentVersion))
          .map(name => caches.delete(name))
      );
    }
  },

  // Précharger des ressources critiques
  async preloadCriticalResources(urls: string[]): Promise<void> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const cache = await caches.open('cjd-amiens-v1.0.0');
      
      const preloadPromises = urls.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (error) {
          console.warn(`[PWA] Échec préchargement de ${url}:`, error);
        }
      });
      
      await Promise.allSettled(preloadPromises);
    }
  },

  // Enregistrer les métriques de performance PWA
  logPerformanceMetrics(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      // Navigation Timing
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const navigation = navigationEntries[0];
        console.log('[PWA] Métriques de navigation:', {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          ttfb: navigation.responseStart - navigation.requestStart
        });
      }

      // Resource Timing pour les assets PWA
      const resourceEntries = performance.getEntriesByType('resource');
      const pwaResources = resourceEntries.filter(entry => 
        entry.name.includes('/sw.js') || 
        entry.name.includes('/manifest.json') ||
        entry.name.includes('/icon-')
      );
      
      if (pwaResources.length > 0) {
        console.log('[PWA] Ressources PWA chargées:', pwaResources.length);
      }
    }
  },

  // Détecter les capacités de l'appareil
  getDeviceCapabilities(): {
    hasCamera: boolean;
    hasGeolocation: boolean;
    hasNotifications: boolean;
    hasVibration: boolean;
    isOnline: boolean;
    storage: string;
  } {
    return {
      hasCamera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      hasGeolocation: 'geolocation' in navigator,
      hasNotifications: 'Notification' in window,
      hasVibration: 'vibrate' in navigator,
      isOnline: navigator.onLine,
      storage: 'storage' in navigator ? `${Math.round((navigator as any).storage?.estimate?.() / 1024 / 1024)}MB` : 'Inconnu'
    };
  },

  // Gestion intelligente des notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  },

  // Afficher une notification PWA
  showNotification(title: string, options: NotificationOptions = {}): void {
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          icon: '/icon-192.svg',
          badge: '/icon-192.svg',
          tag: 'cjd-amiens-notification',
          renotify: true,
          ...options
        });
      });
    }
  }
};

// Auto-initialisation des métriques
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => PWAUtils.logPerformanceMetrics(), 1000);
  });
}