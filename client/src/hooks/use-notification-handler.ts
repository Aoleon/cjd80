import { useEffect } from 'react';
import { useLocation } from 'wouter';

export function useNotificationHandler() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        const { targetUrl } = event.data;
        if (targetUrl) {
          // Extraire pathname et search
          const urlObj = new URL(targetUrl, window.location.origin);
          const pathname = urlObj.pathname;
          const search = urlObj.search;
          
          // Naviguer
          setLocation(pathname + search);
          
          if (import.meta.env.DEV) {
            console.log('[Notification] Navigation vers:', pathname + search);
          }
        }
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    // Cleanup pour éviter les memory leaks
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [setLocation]);
}
