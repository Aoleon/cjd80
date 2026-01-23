import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useNotificationHandler() {
  const router = useRouter();

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
          router.push(pathname + search);

          if (process.env.NODE_ENV === 'development') {
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
  }, [router]);
}
