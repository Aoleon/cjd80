'use server'

/**
 * Server Actions pour l'authentification
 * Phase 7: Auth
 *
 * Note: OAuth Authentik flow reste en API routes (webhooks externes)
 * Ces actions sont pour login/register/logout classique si besoin
 */

import type { ActionResult } from './utils/errors'

export async function loginWithCredentials(
  prevState: any,
  formData: FormData
): Promise<ActionResult<{ token: string; user: any }>> {
  throw new Error('Not implemented yet - Phase 7')
}

export async function registerUser(
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  throw new Error('Not implemented yet - Phase 7')
}

export async function logout(): Promise<ActionResult<void>> {
  throw new Error('Not implemented yet - Phase 7')
}
