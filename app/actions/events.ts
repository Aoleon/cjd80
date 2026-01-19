'use server'

/**
 * Server Actions pour la gestion des événements et inscriptions
 *
 * Phase 1: Routes publiques
 * - registerForEvent() - POST /api/inscriptions
 * - unsubscribeFromEvent() - POST /api/unsubscriptions
 *
 * Phase 2: Admin events management
 * - createEvent(data)
 * - updateEvent(id, data)
 * - deleteEvent(id)
 * - updateEventStatus(id, status)
 * - createInscription(eventId, data)
 * - deleteInscription(id)
 * - bulkImportInscriptions(eventId, data[])
 */

import { headers } from 'next/headers'
import { db, runDbQuery } from '../../server/db'
import {
  events,
  inscriptions,
  unsubscriptions,
  insertInscriptionSchema,
  type Inscription,
} from '@shared/schema'
import { revalidateEvents } from './utils/revalidate'
import { requireAuth } from './utils/auth'
import { rateLimit } from './utils/rate-limit'
import type { ActionResult } from './utils/errors'
import { createSuccess, createError, formatZodError } from './utils/errors'
import { eq, and } from 'drizzle-orm'

/**
 * Phase 1: S'inscrire à un événement
 */
export async function registerForEvent(
  prevState: any,
  formData: FormData
): Promise<ActionResult<Inscription>> {
  try {
    // 1. Rate limiting
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const allowed = await rateLimit(ip, 'register-event', 10, 60)

    if (!allowed) {
      return createError('Trop de requêtes. Veuillez patienter quelques instants.')
    }

    // 2. Validation
    const rawData = {
      eventId: formData.get('eventId'),
      name: formData.get('name'),
      email: formData.get('email'),
      company: formData.get('company'),
      phone: formData.get('phone'),
      comments: formData.get('comments'),
    }

    const result = insertInscriptionSchema.safeParse(rawData)

    if (!result.success) {
      return formatZodError(result.error)
    }

    // 3. Vérifier si déjà inscrit
    const existing = await runDbQuery(
      async () =>
        db
          .select()
          .from(inscriptions)
          .where(
            and(
              eq(inscriptions.eventId, result.data.eventId),
              eq(inscriptions.email, result.data.email)
            )
          )
          .limit(1),
      'quick'
    )

    if (existing.length > 0) {
      return createError('Vous êtes déjà inscrit à cet événement')
    }

    // 4. Insert inscription
    const [inscription] = await runDbQuery(
      async () =>
        db
          .insert(inscriptions)
          .values([result.data])
          .returning(),
      'complex'
    )

    if (!inscription) {
      return createError('Erreur lors de la création de l\'inscription')
    }

    // 5. Revalidation
    await revalidateEvents()

    return createSuccess(inscription, 'Inscription enregistrée avec succès')
  } catch (error) {
    console.error('registerForEvent error:', error)
    return createError('Erreur lors de l\'inscription')
  }
}

/**
 * Phase 1: Se désinscrire d'un événement
 */
export async function unsubscribeFromEvent(
  prevState: any,
  formData: FormData
): Promise<ActionResult<void>> {
  try {
    // 1. Rate limiting
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const allowed = await rateLimit(ip, 'unsubscribe-event', 10, 60)

    if (!allowed) {
      return createError('Trop de requêtes. Veuillez patienter quelques instants.')
    }

    const eventId = formData.get('eventId') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const comments = formData.get('comments') as string

    if (!eventId || !email || !name) {
      return createError('Données manquantes')
    }

    // 2. Insert unsubscription
    await runDbQuery(
      async () =>
        db
          .insert(unsubscriptions)
          .values({
            eventId,
            name,
            email,
            comments,
          })
          .returning(),
      'complex'
    )

    // 3. Revalidation
    await revalidateEvents()

    return createSuccess(undefined, 'Désinscription enregistrée')
  } catch (error) {
    console.error('unsubscribeFromEvent error:', error)
    return createError('Erreur lors de la désinscription')
  }
}

/**
 * Phase 2: Créer un événement (admin)
 */
export async function createEvent(
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  // TODO: Implémenter Phase 2
  throw new Error('Not implemented yet - Phase 2')
}

/**
 * Phase 2: Mettre à jour un événement (admin)
 */
export async function updateEvent(
  eventId: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  // TODO: Implémenter Phase 2
  throw new Error('Not implemented yet - Phase 2')
}

/**
 * Phase 2: Supprimer un événement (admin)
 */
export async function deleteEvent(eventId: string): Promise<ActionResult<void>> {
  // TODO: Implémenter Phase 2
  throw new Error('Not implemented yet - Phase 2')
}

/**
 * Phase 2: Mettre à jour le statut d'un événement (admin)
 */
export async function updateEventStatus(
  eventId: string,
  status: string
): Promise<ActionResult<any>> {
  // TODO: Implémenter Phase 2
  throw new Error('Not implemented yet - Phase 2')
}

/**
 * Phase 2: Créer une inscription manuellement (admin)
 */
export async function createInscription(
  eventId: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  // TODO: Implémenter Phase 2
  throw new Error('Not implemented yet - Phase 2')
}

/**
 * Phase 2: Supprimer une inscription (admin)
 */
export async function deleteInscription(
  inscriptionId: string
): Promise<ActionResult<void>> {
  // TODO: Implémenter Phase 2
  throw new Error('Not implemented yet - Phase 2')
}

/**
 * Phase 2: Import en masse d'inscriptions (admin)
 */
export async function bulkImportInscriptions(
  eventId: string,
  inscriptions: any[]
): Promise<ActionResult<{ imported: number; errors: any[] }>> {
  // TODO: Implémenter Phase 2
  throw new Error('Not implemented yet - Phase 2')
}
