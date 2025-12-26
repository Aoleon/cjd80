import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

interface FeatureConfig {
  featureKey: string;
  enabled: boolean;
}

interface FeatureConfigContextType {
  features: Record<string, boolean>;
  isLoading: boolean;
  isFeatureEnabled: (featureKey: string) => boolean;
  updateFeature: (featureKey: string, enabled: boolean) => Promise<void>;
  isUpdating: boolean;
}

const FeatureConfigContext = createContext<FeatureConfigContextType | undefined>(undefined);

export function FeatureConfigProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [features, setFeatures] = useState<Record<string, boolean>>({
    ideas: true,
    events: true,
    loan: true,
  });

  // Charger la configuration des fonctionnalités (endpoint public)
  const { data: featuresData, isLoading, error: featuresError } = useQuery<{ success: boolean; data: FeatureConfig[] }>({
    queryKey: ["/api/features"],
    queryFn: async () => {
      const res = await fetch("/api/features");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch feature config');
      }
      return res.json();
    },
    enabled: true, // Toujours charger pour tous les utilisateurs
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2, // Retry 2 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
  });

  // Mettre à jour le state local quand les données arrivent
  useEffect(() => {
    if (featuresData?.success && featuresData.data) {
      const featuresMap: Record<string, boolean> = {};
      featuresData.data.forEach(f => {
        featuresMap[f.featureKey] = f.enabled;
      });
      setFeatures(featuresMap);
    } else if (featuresError) {
      // En cas d'erreur, garder les valeurs par défaut (toutes activées)
      // Cela permet à l'application de continuer à fonctionner même si l'API échoue
      console.warn('Failed to load feature config, using defaults:', featuresError);
    }
  }, [featuresData, featuresError]);

  // Mutation pour mettre à jour une fonctionnalité (endpoint protégé)
  const updateMutation = useMutation({
    mutationFn: async ({ featureKey, enabled }: { featureKey: string; enabled: boolean }) => {
      const res = await fetch(`/api/features/${featureKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to update feature' }));
        throw new Error(error.error || 'Failed to update feature');
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalider et refetch la config
      queryClient.invalidateQueries({ queryKey: ["/api/features"] });
    },
  });

  const isFeatureEnabled = useCallback((featureKey: string): boolean => {
    return features[featureKey] ?? true; // Par défaut activé si non défini
  }, [features]);

  const updateFeature = useCallback(async (featureKey: string, enabled: boolean): Promise<void> => {
    await updateMutation.mutateAsync({ featureKey, enabled });
  }, [updateMutation]);

  const contextValue = useMemo(() => ({
    features,
    isLoading,
    isFeatureEnabled,
    updateFeature,
    isUpdating: updateMutation.isPending,
  }), [features, isLoading, isFeatureEnabled, updateFeature, updateMutation.isPending]);

  return (
    <FeatureConfigContext.Provider value={contextValue}>
      {children}
    </FeatureConfigContext.Provider>
  );
}

export function useFeatureConfig() {
  const context = useContext(FeatureConfigContext);
  if (context === undefined) {
    throw new Error("useFeatureConfig must be used within a FeatureConfigProvider");
  }
  return context;
}

