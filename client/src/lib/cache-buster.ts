// Utilitaire pour forcer le rechargement après déploiement
export const cacheBuster = {
  // Version basée sur le timestamp de build
  version: `v${Date.now()}`,
  
  // Fonction pour ajouter le paramètre de version aux URL
  appendVersion: (url: string): string => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_v=${cacheBuster.version}`;
  },
  
  // Fonction pour vérifier si une nouvelle version est disponible
  checkForUpdates: async (): Promise<boolean> => {
    try {
      const response = await fetch('/deploy-info.json', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.warn('Impossible de parser deploy-info.json:', parseError);
          return false;
        }
        
        if (data && data.deployedAt) {
          const storedVersion = localStorage.getItem('app-version');
          
          if (storedVersion && storedVersion !== data.deployedAt) {
            localStorage.setItem('app-version', data.deployedAt);
            return true;
          }
          
          if (!storedVersion) {
            localStorage.setItem('app-version', data.deployedAt);
          }
        }
      } else {
        console.warn('deploy-info.json non accessible, code:', response.status);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de mise à jour:', error);
    }
    
    return false;
  },
  
  // Fonction pour forcer le rechargement complet
  forceReload: (): void => {
    // Nettoyer tous les caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Nettoyer le localStorage sauf les données utilisateur importantes
    const keysToKeep = ['user-token', 'user-preferences'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    // Recharger la page en ignorant le cache
    window.location.reload();
  }
};

// Vérifier automatiquement les mises à jour toutes les 5 minutes
if (typeof window !== 'undefined') {
  setInterval(async () => {
    const hasUpdate = await cacheBuster.checkForUpdates();
    if (hasUpdate) {
      console.log('Nouvelle version détectée, rechargement...');
      cacheBuster.forceReload();
    }
  }, 5 * 60 * 1000); // 5 minutes
  
  // Vérifier immédiatement au chargement
  cacheBuster.checkForUpdates().then(hasUpdate => {
    if (hasUpdate) {
      console.log('Nouvelle version détectée au chargement');
    }
  });
}