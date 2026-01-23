import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { hasPermission } from "@shared/schema";

/**
 * Hook personnalisé pour les requêtes admin avec cache et permissions
 */
export function useAdminQuery<TData = unknown>(
  queryKey: (string | number | boolean | undefined)[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) {
  const { user } = useAuth();
  const hasViewPermission = user && hasPermission(user.role, 'admin.view');

  return useQuery<TData>({
    queryKey,
    queryFn,
    enabled: !!hasViewPermission && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutes de cache
    gcTime: 10 * 60 * 1000, // 10 minutes avant garbage collection
    refetchOnWindowFocus: false, // Éviter les refetch inutiles
    refetchOnReconnect: true,
    ...options,
  });
}

