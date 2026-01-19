'use server'

import { revalidatePath } from 'next/cache'

/**
 * Helpers pour revalidation intelligente du cache Next.js
 */

/**
 * Revalide les pages liées aux idées
 */
export async function revalidateIdeas() {
  revalidatePath('/(public)/ideas', 'page')
  revalidatePath('/(admin)/admin/ideas', 'page')
  revalidatePath('/', 'page') // Homepage peut afficher des idées featured
}

/**
 * Revalide les pages liées aux événements
 */
export async function revalidateEvents() {
  revalidatePath('/(public)/events')
  revalidatePath('/(admin)/admin/events')
  revalidatePath('/')
}

/**
 * Revalide les pages liées aux membres
 */
export async function revalidateMembers() {
  revalidatePath('/(admin)/admin/members')
}

/**
 * Revalide une page membre spécifique
 */
export async function revalidateMember(memberEmail: string) {
  revalidatePath(`/(admin)/admin/members/${memberEmail}`)
  revalidatePath('/(admin)/admin/members')
}

/**
 * Revalide les pages liées aux patrons
 */
export async function revalidatePatrons() {
  revalidatePath('/(public)/patrons')
  revalidatePath('/(admin)/admin/patrons')
}

/**
 * Revalide un patron spécifique
 */
export async function revalidatePatron(patronId: string) {
  revalidatePath(`/(admin)/admin/patrons/${patronId}`)
  revalidatePath('/(admin)/admin/patrons')
}

/**
 * Revalide les pages liées aux prêts
 */
export async function revalidateLoans() {
  revalidatePath('/(public)/loan-items')
  revalidatePath('/(admin)/admin/loan-items')
}

/**
 * Revalide les pages financières
 */
export async function revalidateFinancial() {
  revalidatePath('/(admin)/admin/finance') // Revalide tout le layout finance
}

/**
 * Revalide les dashboards (home admin, analytics, etc.)
 */
export async function revalidateDashboards() {
  revalidatePath('/(admin)/admin')
  revalidatePath('/(admin)/admin/analytics')
}

/**
 * Revalide la configuration (branding, features, email)
 */
export async function revalidateConfig() {
  revalidatePath('/(admin)/admin/settings')
}

/**
 * Revalidation complète (à utiliser avec parcimonie)
 */
export async function revalidateAll() {
  revalidatePath('/') // Revalide tout depuis la racine
}
