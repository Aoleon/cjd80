'use server'

/**
 * Server Actions pour la gestion des prêts (loan items)
 *
 * Phase 1: Routes publiques
 * - createLoanItemRequest() - POST /api/loan-items
 *
 * Phase 2: Admin loan items
 * - updateLoanItem(id, data)
 * - updateLoanItemStatus(id, status)
 * - deleteLoanItem(id)
 * - uploadLoanItemPhoto(id, file)
 */

import type { ActionResult } from './utils/errors'

export async function createLoanItemRequest(
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  throw new Error('Not implemented yet - Phase 1')
}

export async function updateLoanItem(
  loanItemId: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  throw new Error('Not implemented yet - Phase 2')
}

export async function updateLoanItemStatus(
  loanItemId: string,
  status: string
): Promise<ActionResult<any>> {
  throw new Error('Not implemented yet - Phase 2')
}

export async function deleteLoanItem(
  loanItemId: string
): Promise<ActionResult<void>> {
  throw new Error('Not implemented yet - Phase 2')
}

export async function uploadLoanItemPhoto(
  loanItemId: string,
  formData: FormData
): Promise<ActionResult<{ photoUrl: string }>> {
  throw new Error('Not implemented yet - Phase 2')
}
