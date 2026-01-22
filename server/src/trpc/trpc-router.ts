/**
 * tRPC Router Principal
 *
 * Configure tRPC avec:
 * - Context type
 * - Middlewares (auth, logging, error handling)
 * - Procedures (public, protected)
 * - Router principal (merge tous les sub-routers)
 */

import { initTRPC, TRPCError } from '@trpc/server'
import type { Context } from './trpc-context'
import superjson from 'superjson'
import { ideasRouter } from '../ideas/ideas.trpc'

/**
 * Initialize tRPC avec Context type
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson, // Support Date, Map, Set, etc.
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error && error.cause.name === 'ZodError'
            ? error.cause
            : null,
      },
    }
  },
})

/**
 * Export router, procedures, middlewares
 */
export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware

/**
 * Auth Middleware - Vérifier utilisateur authentifié
 */
const isAuthenticated = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentification requise',
    })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Type narrowing: user is defined
    },
  })
})

/**
 * Protected Procedure - Nécessite authentification
 */
export const protectedProcedure = publicProcedure.use(isAuthenticated)

/**
 * Admin Middleware - Vérifier rôle admin
 */
const isAdmin = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentification requise',
    })
  }

  if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Accès admin requis',
    })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

/**
 * Admin Procedure - Nécessite rôle admin
 */
export const adminProcedure = publicProcedure.use(isAdmin)

/**
 * Router Principal
 *
 * Merge tous les sub-routers par feature
 * Import will be added as we create feature routers
 */
export const appRouter = router({
  // Health check
  health: publicProcedure.query(() => ({
    status: 'ok',
    timestamp: new Date(),
  })),

  // Feature routers
  ideas: ideasRouter,
  // events: eventsRouter,
  // members: membersRouter,
  // etc.
})

/**
 * Export type pour client tRPC
 */
export type AppRouter = typeof appRouter
