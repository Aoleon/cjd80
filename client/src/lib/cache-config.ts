// Configuration optimisée du cache pour TanStack Query
export const queryConfig = {
  // Configuration globale des requêtes
  defaultOptions: {
    queries: {
      // Cache les données pendant 5 minutes
      staleTime: 5 * 60 * 1000,
      // Garde les données en cache pendant 10 minutes
      gcTime: 10 * 60 * 1000,
      // Refetch automatiquement si la fenêtre regagne le focus
      refetchOnWindowFocus: false,
      // Ne pas refetch automatiquement en arrière-plan
      refetchOnReconnect: true,
      // Réessayer 2 fois en cas d'échec
      retry: 2,
      // Délai entre les tentatives
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Réessayer 1 fois en cas d'échec
      retry: 1,
    },
  },
};

// Configuration spécifique par type de données
export const cacheConfig = {
  // Les idées changent moins souvent
  ideas: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
  // Les événements peuvent changer plus souvent
  events: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  // Les stats admin doivent être fraîches
  adminStats: {
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 60 * 1000, // 1 minute
  },
  // Les données utilisateur doivent être toujours fraîches
  user: {
    staleTime: 0, // Toujours considéré comme périmé
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
};