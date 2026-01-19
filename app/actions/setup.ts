'use server'

/**
 * Server Actions pour le setup/onboarding initial
 * Phase 7: Setup
 */

import type { ActionResult } from './utils/errors'

export async function createFirstAdmin(
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  throw new Error('Not implemented yet - Phase 7')
}

export async function testEmailConfiguration(): Promise<
  ActionResult<{ success: boolean; message: string }>
> {
  throw new Error('Not implemented yet - Phase 7')
}

export async function generateConfigFile(): Promise<
  ActionResult<{ configPath: string }>
> {
  throw new Error('Not implemented yet - Phase 7')
}
