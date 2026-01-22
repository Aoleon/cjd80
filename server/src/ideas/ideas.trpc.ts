/**
 * Ideas tRPC Router
 *
 * Expose procedures tRPC pour business logic Ideas
 */

import { router, publicProcedure, protectedProcedure } from '../trpc/trpc-router'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { ideas } from '../../../shared/schema'

/**
 * Ideas Router
 *
 * Procedures:
 * - getById: Get idea by ID (test simple query)
 * - convertToEvent: Convert idea to event (business logic complexe)
 */
export const ideasRouter = router({
  /**
   * Get idea by ID
   *
   * Test procedure simple pour validation setup tRPC
   */
  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const [idea] = await ctx.db
        .select()
        .from(ideas)
        .where(eq(ideas.id, input.id))
        .limit(1)

      if (!idea) {
        throw new Error('Idée introuvable')
      }

      return idea
    }),

  /**
   * Convert idea to event
   *
   * Business logic complexe:
   * - Transaction 2 tables (ideas + events)
   * - Update idea status
   * - Create event from idea
   * - Notification (future)
   *
   * NOTE: Pour Phase 1.5, implémentation simplifiée (juste retourner idea)
   * Implémentation complète en Phase 2
   */
  convertToEvent: protectedProcedure
    .input(
      z.object({
        ideaId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Phase 1.5: Validation simple
      // Get idea
      const [idea] = await ctx.db
        .select()
        .from(ideas)
        .where(eq(ideas.id, input.ideaId))
        .limit(1)

      if (!idea) {
        throw new Error('Idée introuvable')
      }

      // TODO Phase 2: Implémenter logique complète
      // - Créer event depuis idea
      // - Update idea status = 'converted_to_event'
      // - Transaction
      // - Notification

      // Pour l'instant, juste retourner idea (proof of concept)
      return {
        success: true,
        message: 'tRPC convertToEvent - Implémentation Phase 2',
        idea,
      }
    }),
})
