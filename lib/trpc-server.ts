/**
 * tRPC Server Client - Pour Server Actions
 *
 * Client tRPC utilisé dans Server Actions et Server Components (RSC)
 * Type-safe end-to-end avec AppRouter backend
 */

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { cookies } from 'next/headers'
import superjson from 'superjson'
import type { AppRouter } from '../server/src/trpc/trpc-router'

/**
 * Client tRPC pour Server Actions
 *
 * Features:
 * - Type-safe avec AppRouter
 * - Forward auth cookies automatiquement
 * - Batch requests
 * - Transformer superjson (support Date, Map, Set)
 */
export const trpcServer = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: process.env.TRPC_SERVER_URL || 'http://localhost:3000/api/trpc',
      async headers() {
        const cookieStore = await cookies()
        return {
          cookie: cookieStore.toString(),
        }
      },
    }),
  ],
})

/**
 * Export type pour utilisation
 */
export type { AppRouter }
