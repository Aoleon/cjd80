import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAHookReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  installApp: () => Promise<void>;
  updateAvailable: boolean;
  updateApp: () => void;
  shareApp: () => Promise<void>;
}

export function usePWA(): PWAHookReturn {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      
      setIsInstalled(isStandalone || (isIOS && isInWebAppiOS));
    };

    // Gérer l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setIsInstallable(true);
    };

    // Gérer les changements de connexion
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Enregistrer le Service Worker
    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          
          setRegistration(reg);
          
          // Vérifier les mises à jour
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });

          console.log('[PWA] Service Worker enregistré');
        } catch (error) {
          console.error('[PWA] Erreur enregistrement SW:', error);
        }
      }
    };

    // Événements
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialisation
    checkInstalled();
    registerSW();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async (): Promise<void> => {
    if (!deferredPrompt) {
      throw new Error('Installation non disponible');
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] App installée');
        setIsInstalled(true);
      } else {
        console.log('[PWA] Installation refusée');
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('[PWA] Erreur installation:', error);
      throw error;
    }
  };

  const updateApp = (): void => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const shareApp = async (): Promise<void> => {
    const shareData = {
      title: 'CJD Amiens - Boîte à Kiffs',
      text: 'Découvrez l\'application collaborative du Centre des Jeunes Dirigeants d\'Amiens',
      url: window.location.origin
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copier l'URL
        await navigator.clipboard.writeText(window.location.origin);
        console.log('[PWA] URL copiée dans le presse-papier');
      }
    } catch (error) {
      console.error('[PWA] Erreur partage:', error);
      throw error;
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOffline,
    installApp,
    updateAvailable,
    updateApp,
    shareApp
  };
}