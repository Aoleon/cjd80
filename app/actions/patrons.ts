'use server'

/**
 * Server Actions pour la gestion des patrons et sponsorships
 * Phase 4: Admin patrons
 */

import type { ActionResult } from './utils/errors'

export async function createPatron(
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  throw new Error('Not implemented yet - Phase 4')
}

export async function updatePatron(
  patronId: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  throw new Error('Not implemented yet - Phase 4')
}

export async function deletePatron(patronId: string): Promise<ActionResult<void>> {
  throw new Error('Not implemented yet - Phase 4')
}

export async function createPatronDonation(
  patronId: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  throw new Error('Not implemented yet - Phase 4')
}

export async function createEventSponsorship(
  patronId: string,
  eventId: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  throw new Error('Not implemented yet - Phase 4')
}
