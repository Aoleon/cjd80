'use server'

/**
 * Server Actions pour la gestion financière
 * Phase 5: Financial management
 */

import type { ActionResult } from './utils/errors'

export async function createBudget(
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  throw new Error('Not implemented yet - Phase 5')
}

export async function updateBudget(
  budgetId: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  throw new Error('Not implemented yet - Phase 5')
}

export async function deleteBudget(budgetId: string): Promise<ActionResult<void>> {
  throw new Error('Not implemented yet - Phase 5')
}

export async function createExpense(
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  throw new Error('Not implemented yet - Phase 5')
}

export async function updateExpense(
  expenseId: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  throw new Error('Not implemented yet - Phase 5')
}

export async function deleteExpense(expenseId: string): Promise<ActionResult<void>> {
  throw new Error('Not implemented yet - Phase 5')
}

export async function createForecast(
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  throw new Error('Not implemented yet - Phase 5')
}

export async function generateForecasts(
  params: any
): Promise<ActionResult<{ generated: number }>> {
  throw new Error('Not implemented yet - Phase 5')
}
