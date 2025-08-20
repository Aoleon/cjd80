// Script pour vider complètement le cache de l'application CJD Amiens
console.log('🧹 Nettoyage du cache de l\'application...');

(async function clearAllCaches() {
  try {
    // 1. Vider le cache du service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        console.log('🔄 Suppression du service worker...');
        await registration.unregister();
      }
    }

    // 2. Vider tous les caches de l'API Cache
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('📦 Suppression des caches:', cacheNames);
      
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log(`🗑️ Suppression du cache: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
    }

    // 3. Vider le localStorage et sessionStorage
    if (typeof(Storage) !== "undefined") {
      console.log('🗄️ Nettoyage du stockage local...');
      localStorage.clear();
      sessionStorage.clear();
    }

    // 4. Vider les cookies (si possible)
    try {
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      console.log('🍪 Cookies supprimés');
    } catch (e) {
      console.log('⚠️ Impossible de supprimer tous les cookies');
    }

    // 5. Forcer le rechargement complet
    console.log('✅ Cache vidé avec succès!');
    console.log('🔄 Rechargement de l\'application...');
    
    setTimeout(() => {
      window.location.reload(true);
    }, 1000);
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage du cache:', error);
  }
})();