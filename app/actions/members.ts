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

import { revalidateMembers, revalidateMember } from './utils/revalidate'
import { requireAuth } from './utils/auth'
import type { ActionResult } from './utils/errors'

/**
 * Phase 1: Proposer un nouveau membre (public)
 */
export async function proposeMember(
  prevState: any,
  formData: FormData
): Promise<ActionResult<any>> {
  // TODO: Implémenter Phase 1
  throw new Error('Not implemented yet - Phase 1')
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
