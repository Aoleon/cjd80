/**
 * Tests tRPC - Validation setup Phase 1.5
 *
 * Server Actions de test pour valider:
 * - Connection tRPC server
 * - Type inference
 * - Procedures queries et mutations
 */

'use server'

import type { ActionResult } from '../utils/errors'
import { createSuccess, createError } from '../utils/errors'

/**
 * Test 1: Health check tRPC
 *
 * Valide que le endpoint /api/trpc est accessible
 */
export async function testTRPCHealth(): Promise<ActionResult<any>> {
  try {
    // Phase 1.5: stub - implémentation complète en Phase 2
    return createSuccess(null, 'tRPC health stub')
  } catch (error) {
    console.error('testTRPCHealth error:', error)
    return createError(
      error instanceof Error ? error.message : 'tRPC health failed'
    )
  }
}

/**
 * Test 2: Get idea by ID (query simple)
 *
 * Valide:
 * - Query tRPC
 * - Type inference
 * - Error handling
 */
export async function testTRPCGetIdea(
  ideaId: string
): Promise<ActionResult<any>> {
  try {
    // Phase 1.5: stub - implémentation complète en Phase 2
    return createSuccess(null, 'Idée stub')
  } catch (error) {
    console.error('testTRPCGetIdea error:', error)
    return createError(
      error instanceof Error ? error.message : 'tRPC getIdea failed'
    )
  }
}

/**
 * Test 3: Convert idea to event (mutation complexe)
 *
 * Valide:
 * - Mutation tRPC
 * - Type inference
 * - Protected procedure (auth)
 * - Business logic call
 *
 * NOTE: Phase 1.5 = stub, Phase 2 = implémentation complète
 */
export async function testTRPCConvertToEvent(
  ideaId: string,
  userId: string
): Promise<ActionResult<any>> {
  try {
    // Phase 1.5: stub - implémentation complète en Phase 2
    return createSuccess(null, 'Conversion stub')
  } catch (error) {
    console.error('testTRPCConvertToEvent error:', error)
    return createError(
      error instanceof Error ? error.message : 'tRPC convertToEvent failed'
    )
  }
}
