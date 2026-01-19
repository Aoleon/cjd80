'use server'

/**
 * Server Actions pour la gestion CRM des membres
 *
 * Phase 1: Routes publiques
 * - proposeMember() - POST /api/members/propose
 *
 * Phase 3: Admin CRM members
 * - updateMember(email, data)
 * - deleteMember(email)
 * - createMemberSubscription(email, data)
 * - createTag(data)
 * - assignTagToMember(email, tagId)
 * - removeTagFromMember(email, tagId)
 * - createMemberTask(email, data)
 * - updateMemberTask(id, data)
 * - createMemberRelation(email, data)
 * - deleteMemberRelation(id)
 */

import { headers } from 'next/headers'
import { db, runDbQuery } from '../../server/db'
import { members, insertMemberSchema, type Member } from '@shared/schema'
import { revalidateMembers, revalidateMember } from './utils/revalidate'
import { requireAuth } from './utils/auth'
import { rateLimit } from './utils/rate-limit'
import type { ActionResult } from './utils/errors'
import { createSuccess, createError, formatZodError } from './utils/errors'
import { eq } from 'drizzle-orm'

/**
 * Phase 1: Proposer un nouveau membre (public)
 */
export async function proposeMember(
  prevState: any,
  formData: FormData
): Promise<ActionResult<Member>> {
  try {
    // 1. Rate limiting
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const allowed = await rateLimit(ip, 'propose-member', 10, 60)

    if (!allowed) {
      return createError('Trop de requêtes. Veuillez patienter quelques instants.')
    }

    // 2. Validation
    const rawData = {
      email: formData.get('email'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      company: formData.get('company'),
      phone: formData.get('phone'),
      role: formData.get('role'),
      notes: formData.get('notes'),
      proposedBy: formData.get('proposedBy'),
      status: 'proposed', // Membres proposés doivent être validés
    }

    const result = insertMemberSchema.safeParse(rawData)

    if (!result.success) {
      return formatZodError(result.error)
    }

    // 3. Vérifier si membre existe déjà
    const existing = await runDbQuery(
      async () => db.select().from(members).where(eq(members.email, result.data.email)).limit(1),
      'quick'
    )

    if (existing.length > 0) {
      return createError('Ce membre existe déjà')
    }

    // 4. Insert membre avec firstSeenAt et lastActivityAt
    const now = new Date()
    const [member] = await runDbQuery(
      async () =>
        db
          .insert(members)
          .values({
            ...result.data,
            firstSeenAt: now,
            lastActivityAt: now,
            activityCount: 0,
            engagementScore: 0,
          })
          .returning(),
      'complex'
    )

    if (!member) {
      return createError('Erreur lors de la proposition de membre')
    }

    // 5. Revalidation
    await revalidateMembers()

    return createSuccess(member, 'Proposition de membre enregistrée')
  } catch (error) {
    console.error('proposeMember error:', error)
    return createError('Erreur lors de la proposition')
  }
}

/**
 * Phase 3: Mettre à jour un membre (admin)
 */
export async function updateMember(
  memberEmail: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  // TODO: Implémenter Phase 3
  throw new Error('Not implemented yet - Phase 3')
}

/**
 * Phase 3: Supprimer un membre (admin)
 */
export async function deleteMember(
  memberEmail: string
): Promise<ActionResult<void>> {
  // TODO: Implémenter Phase 3
  throw new Error('Not implemented yet - Phase 3')
}

/**
 * Phase 3: Créer un tag (admin)
 */
export async function createTag(
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  // TODO: Implémenter Phase 3
  throw new Error('Not implemented yet - Phase 3')
}

/**
 * Phase 3: Assigner un tag à un membre (admin)
 */
export async function assignTagToMember(
  memberEmail: string,
  tagId: string
): Promise<ActionResult<void>> {
  // TODO: Implémenter Phase 3
  throw new Error('Not implemented yet - Phase 3')
}

/**
 * Phase 3: Retirer un tag d'un membre (admin)
 */
export async function removeTagFromMember(
  memberEmail: string,
  tagId: string
): Promise<ActionResult<void>> {
  // TODO: Implémenter Phase 3
  throw new Error('Not implemented yet - Phase 3')
}

/**
 * Phase 3: Créer une tâche pour un membre (admin)
 */
export async function createMemberTask(
  memberEmail: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  // TODO: Implémenter Phase 3
  throw new Error('Not implemented yet - Phase 3')
}

/**
 * Phase 3: Mettre à jour une tâche (admin)
 */
export async function updateMemberTask(
  taskId: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  // TODO: Implémenter Phase 3
  throw new Error('Not implemented yet - Phase 3')
}

/**
 * Phase 3: Créer une relation entre membres (admin)
 */
export async function createMemberRelation(
  memberEmail: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  // TODO: Implémenter Phase 3
  throw new Error('Not implemented yet - Phase 3')
}

/**
 * Phase 3: Supprimer une relation (admin)
 */
export async function deleteMemberRelation(
  relationId: string
): Promise<ActionResult<void>> {
  // TODO: Implémenter Phase 3
  throw new Error('Not implemented yet - Phase 3')
}
