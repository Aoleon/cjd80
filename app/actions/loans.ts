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

import { headers } from 'next/headers'
import { db, runDbQuery } from '@/server/db'
import { loanItems, insertLoanItemSchema, type LoanItem } from '@/shared/schema'
import { revalidateLoans } from './utils/revalidate'
import { rateLimit } from './utils/rate-limit'
import type { ActionResult } from './utils/errors'
import { createSuccess, createError, formatZodError } from './utils/errors'

export async function createLoanItemRequest(
  prevState: any,
  formData: FormData
): Promise<ActionResult<LoanItem>> {
  try {
    // 1. Rate limiting
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const allowed = await rateLimit(ip, 'create-loan-item', 10, 60)

    if (!allowed) {
      return createError('Trop de requêtes. Veuillez patienter quelques instants.')
    }

    // 2. Validation
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      lenderName: formData.get('lenderName'),
      photoUrl: formData.get('photoUrl'),
      proposedBy: formData.get('proposedBy'),
      proposedByEmail: formData.get('proposedByEmail'),
    }

    const result = insertLoanItemSchema.safeParse(rawData)

    if (!result.success) {
      return formatZodError(result.error)
    }

    // 3. Insert loan item
    const [loanItem] = await runDbQuery(
      async () =>
        db
          .insert(loanItems)
          .values(result.data)
          .returning(),
      'complex'
    )

    // 4. Revalidation
    await revalidateLoans()

    return createSuccess(loanItem, 'Demande de prêt enregistrée')
  } catch (error) {
    console.error('createLoanItemRequest error:', error)
    return createError('Erreur lors de la demande de prêt')
  }
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
