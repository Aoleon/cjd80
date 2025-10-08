import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { wrapApiRequest } from "./sync-service";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Standard API request function - makes direct requests without offline support
 * 
 * This is the default function for all API requests. It throws errors immediately
 * when requests fail, which is the expected behavior for most use cases.
 * 
 * For offline support, use `apiRequestWithOfflineSupport` as an opt-in alternative.
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

/**
 * API request with offline support (OPT-IN FEATURE)
 * 
 * This is an OPTIONAL alternative to apiRequest that provides offline functionality.
 * Only use this when you specifically need offline support for mutations.
 * 
 * Behavior:
 * - When online: Makes normal API requests (same as apiRequest)
 * - When offline: Queues mutations in IndexedDB and returns a mocked success response
 * - When connection restored: Automatically syncs queued actions
 * 
 * The mocked response has status 202 (Accepted) and includes a `queued: true` flag.
 * 
 * Usage: Replace apiRequest with this function in mutations that need offline support
 * Example:
 *   const mutation = useMutation({
 *     mutationFn: async (data) => {
 *       const res = await apiRequestWithOfflineSupport("POST", "/api/votes", data);
 *       return await res.json();
 *     },
 *     onSuccess: (result) => {
 *       if (result.queued) {
 *         // Handle queued state - show user that action will sync later
 *       }
 *     }
 *   });
 */
export async function apiRequestWithOfflineSupport(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await wrapApiRequest(method, url, data);
  
  // Only throw if not a queued response (status 202 means queued)
  if (res.status !== 202) {
    await throwIfResNotOk(res);
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const json = await res.json();
    
    // Handle backend response format {success: true, data: [...]}
    if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
      return json.data;
    }
    
    return json;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      // Cache optimisé : 5 minutes de staleTime, 10 minutes de cache
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});
