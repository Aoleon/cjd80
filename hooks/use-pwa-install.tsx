import { useState, useEffect } from 'react';
import { PWAUtils } from '@/lib/pwa-utils';
import { getShortAppName } from '@/config/branding';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installResult, setInstallResult] = useState<'pending' | 'success' | 'dismissed' | 'error' | null>(null);

  const operatingSystem = PWAUtils.getOperatingSystem();
  const canInstall = PWAUtils.canInstallPWA();
  const browserInfo = PWAUtils.getBrowserInfo();
  const installInstructions = PWAUtils.getInstallInstructions();

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    setIsInstalled(PWAUtils.isAppInstalled());

    // Gérer l'événement beforeinstallprompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);
      setIsInstallable(true);
      
      // Afficher automatiquement le prompt sur mobile (après 3 secondes)
      if (PWAUtils.isMobileDevice()) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    };

    // Gérer l'installation réussie
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallable(false);
      setShowPrompt(false);
      setInstallResult('success');
      
      // Notification de succès
      PWAUtils.showNotification('Application installée !', {
        body: `${getShortAppName()} est maintenant disponible sur votre écran d'accueil`,
        icon: '/icon-192.svg'
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Fonction pour déclencher l'installation
  const installApp = async (): Promise<void> => {
    if (!deferredPrompt) {
      // Pour iOS ou si pas de prompt disponible, afficher les instructions
      setShowPrompt(true);
      return;
    }

    setInstallResult('pending');

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setInstallResult('success');
        setShowPrompt(false);
      } else {
        setInstallResult('dismissed');
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Erreur lors de l\'installation PWA:', error);
      setInstallResult('error');
    }
  };

  // Fonction pour afficher manuellement le prompt
  const showInstallPrompt = () => {
    setShowPrompt(true);
  };

  // Fonction pour masquer le prompt
  const hideInstallPrompt = () => {
    setShowPrompt(false);
    setInstallResult(null);
  };

  // Vérifier si on doit afficher le prompt automatiquement
  const shouldShowAutoPrompt = (): boolean => {
    // Ne pas afficher si déjà installé
    if (isInstalled) return false;
    
    // Ne pas afficher si le navigateur ne supporte pas
    if (!browserInfo.supportsInstall) return false;
    
    // Afficher si c'est mobile et qu'on peut installer
    if (PWAUtils.isMobileDevice() && canInstall) {
      // Vérifier si l'utilisateur n'a pas déjà refusé (localStorage)
      const hasDeclined = localStorage.getItem('pwa-install-declined');
      return !hasDeclined;
    }
    
    return false;
  };

  // Marquer comme refusé (ne plus proposer)
  const declineInstall = () => {
    localStorage.setItem('pwa-install-declined', 'true');
    hideInstallPrompt();
  };

  return {
    // État
    isInstallable,
    isInstalled,
    showPrompt,
    installResult,
    
    // Informations système
    operatingSystem,
    canInstall,
    browserInfo,
    installInstructions,
    
    // Actions
    installApp,
    showInstallPrompt,
    hideInstallPrompt,
    declineInstall,
    shouldShowAutoPrompt,
    
    // Utilitaires
    isMobile: PWAUtils.isMobileDevice(),
    hasPromptEvent: !!deferredPrompt
  };
}