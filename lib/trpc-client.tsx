/**
 * tRPC Client - Pour Client Components
 *
 * Setup tRPC avec React Query pour Client Components
 * Type-safe end-to-end avec AppRouter backend
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { useState } from 'react'
import superjson from 'superjson'
import type { AppRouter } from '../server/src/trpc/trpc-router'

/**
 * tRPC React Client
 *
 * Usage dans Client Components:
 * ```tsx
 * const utils = trpc.useUtils()
 * const { data } = trpc.ideas.convertToEvent.useMutation()
 * ```
 */
export const trpc = createTRPCReact<AppRouter>()

/**
 * tRPC Provider - Wrap app avec ce provider
 *
 * @param children - React children
 */
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Éviter refetch automatique pour meilleure UX
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: process.env.NEXT_PUBLIC_TRPC_URL || 'http://localhost:3000/api/trpc',
          // Forward cookies automatiquement
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include',
            })
          },
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}

/**
 * Export type pour utilisation
 */
export type { AppRouter }
