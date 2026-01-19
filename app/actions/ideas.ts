'use server'

/**
 * Server Actions pour la gestion des idées et votes
 *
 * Phase 1: Routes publiques core
 * - createIdea() - POST /api/ideas
 * - createVote() - POST /api/votes
 *
 * Phase 2: Admin ideas management
 * - deleteIdea(id)
 * - updateIdeaStatus(id, status)
 * - updateIdea(id, data)
 * - toggleIdeaFeatured(id)
 * - convertIdeaToEvent(id)
 */

import { headers } from 'next/headers'
import { db, runDbQuery } from '../../server/db'
import { ideas, votes, insertIdeaSchema, insertVoteSchema, type Idea, type Vote } from '@shared/schema'
import { revalidateIdeas } from './utils/revalidate'
import { requireAuth } from './utils/auth'
import { rateLimit } from './utils/rate-limit'
import type { ActionResult } from './utils/errors'
import { createSuccess, createError, formatZodError } from './utils/errors'
import { eq, and } from 'drizzle-orm'

/**
 * Phase 1: Créer une nouvelle idée
 *
 * @param prevState - État précédent (pour useActionState)
 * @param formData - Données du formulaire
 * @returns Résultat avec succès ou erreur
 */
export async function createIdea(
  prevState: any,
  formData: FormData
): Promise<ActionResult<Idea>> {
  try {
    // 1. Rate limiting (20 req / 15min comme NestJS)
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const allowed = await rateLimit(ip, 'create-idea', 20, 15 * 60)

    if (!allowed) {
      return createError('Trop de requêtes. Veuillez patienter quelques instants.')
    }

    // 2. Validation avec schema Zod existant
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      proposedBy: formData.get('proposedBy'),
      proposedByEmail: formData.get('proposedByEmail'),
      company: formData.get('company'),
      phone: formData.get('phone'),
      deadline: formData.get('deadline'),
    }

    const result = insertIdeaSchema.safeParse(rawData)

    if (!result.success) {
      return formatZodError(result.error)
    }

    // 2.5. Transformation types Zod → Drizzle (TypeScript strict)
    // Zod retourne string datetime, Drizzle attend Date
    const ideaData = {
      ...result.data,
      deadline: result.data.deadline ? new Date(result.data.deadline) : undefined,
    }

    // 3. Insert database avec Drizzle
    const [idea] = await runDbQuery(
      async () =>
        db
          .insert(ideas)
          .values([ideaData])
          .returning(),
      'complex'
    )

    if (!idea) {
      return createError('Erreur lors de la création de l\'idée')
    }

    // 4. Revalidation cache Next.js
    await revalidateIdeas()

    // TODO Phase 1.1: Notifications (push + email) - à implémenter après

    return createSuccess(idea, 'Idée créée avec succès')
  } catch (error) {
    console.error('createIdea error:', error)
    return createError('Erreur lors de la création de l\'idée')
  }
}

/**
 * Phase 1: Voter pour une idée
 *
 * @param prevState - État précédent
 * @param formData - Données du formulaire (ideaId, voterName, voterEmail)
 * @returns Résultat avec succès ou erreur
 */
export async function createVote(
  prevState: any,
  formData: FormData
): Promise<ActionResult<Vote>> {
  try {
    // 1. Rate limiting (10 req / 60s comme NestJS)
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const allowed = await rateLimit(ip, 'create-vote', 10, 60)

    if (!allowed) {
      return createError('Trop de requêtes. Veuillez patienter quelques instants.')
    }

    // 2. Validation avec schema Zod existant
    const rawData = {
      ideaId: formData.get('ideaId'),
      voterName: formData.get('voterName'),
      voterEmail: formData.get('voterEmail'),
    }

    const result = insertVoteSchema.safeParse(rawData)

    if (!result.success) {
      return formatZodError(result.error)
    }

    // 3. Vérifier si l'utilisateur a déjà voté
    const existingVote = await runDbQuery(
      async () =>
        db
          .select()
          .from(votes)
          .where(
            and(
              eq(votes.ideaId, result.data.ideaId),
              eq(votes.voterEmail, result.data.voterEmail)
            )
          )
          .limit(1),
      'quick'
    )

    if (existingVote.length > 0) {
      return createError('Vous avez déjà voté pour cette idée')
    }

    // 4. Insert vote
    const [vote] = await runDbQuery(
      async () =>
        db
          .insert(votes)
          .values([result.data])
          .returning(),
      'complex'
    )

    if (!vote) {
      return createError('Erreur lors de l\'enregistrement du vote')
    }

    // 5. Revalidation cache
    await revalidateIdeas()

    return createSuccess(vote, 'Vote enregistré avec succès')
  } catch (error) {
    console.error('createVote error:', error)
    return createError('Erreur lors de l\'enregistrement du vote')
  }
}

/**
 * Phase 2: Supprimer une idée (admin)
 */
export async function deleteIdea(ideaId: string): Promise<ActionResult<void>> {
  // TODO: Implémenter Phase 2
  throw new Error('Not implemented yet - Phase 2')
}

/**
 * Phase 2: Mettre à jour le statut d'une idée (admin)
 */
export async function updateIdeaStatus(
  ideaId: string,
  status: string
): Promise<ActionResult<any>> {
  // TODO: Implémenter Phase 2
  throw new Error('Not implemented yet - Phase 2')
}

/**
 * Phase 2: Mettre à jour une idée (admin)
 */
export async function updateIdea(
  ideaId: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  // TODO: Implémenter Phase 2
  throw new Error('Not implemented yet - Phase 2')
}

/**
 * Phase 2: Toggle featured status (admin)
 */
export async function toggleIdeaFeatured(
  ideaId: string
): Promise<ActionResult<any>> {
  // TODO: Implémenter Phase 2
  throw new Error('Not implemented yet - Phase 2')
}

/**
 * Phase 2: Convertir une idée en événement (admin)
 */
export async function convertIdeaToEvent(
  ideaId: string
): Promise<ActionResult<any>> {
  // TODO: Implémenter Phase 2
  throw new Error('Not implemented yet - Phase 2')
}
