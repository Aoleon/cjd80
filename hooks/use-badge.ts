import { useEffect } from 'react';
import { badgeService } from '@/lib/badge-service';

export function useBadge() {
  useEffect(() => {
    // Effacer le badge quand l'app est ouverte/active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        badgeService.clearBadge();
        
        // Envoyer un message au Service Worker pour synchroniser
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CLEAR_BADGE'
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Effacer au mount
    badgeService.clearBadge();
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_BADGE'
      });
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return badgeService;
}
