'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

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
  revalidateTag('ideas')
}

/**
 * Revalide les pages liées aux événements
 */
export async function revalidateEvents() {
  revalidatePath('/(public)/events', 'page')
  revalidatePath('/(admin)/admin/events', 'page')
  revalidatePath('/', 'page')
  revalidateTag('events')
}

/**
 * Revalide les pages liées aux membres
 */
export async function revalidateMembers() {
  revalidatePath('/(admin)/admin/members', 'page')
  revalidateTag('members')
}

/**
 * Revalide une page membre spécifique
 */
export async function revalidateMember(memberEmail: string) {
  revalidatePath(`/(admin)/admin/members/${memberEmail}`, 'page')
  revalidatePath('/(admin)/admin/members', 'page')
  revalidateTag(`member-${memberEmail}`)
  revalidateTag('members')
}

/**
 * Revalide les pages liées aux patrons
 */
export async function revalidatePatrons() {
  revalidatePath('/(public)/patrons', 'page')
  revalidatePath('/(admin)/admin/patrons', 'page')
  revalidateTag('patrons')
}

/**
 * Revalide un patron spécifique
 */
export async function revalidatePatron(patronId: string) {
  revalidatePath(`/(admin)/admin/patrons/${patronId}`, 'page')
  revalidatePath('/(admin)/admin/patrons', 'page')
  revalidateTag(`patron-${patronId}`)
  revalidateTag('patrons')
}

/**
 * Revalide les pages liées aux prêts
 */
export async function revalidateLoans() {
  revalidatePath('/(public)/loan-items', 'page')
  revalidatePath('/(admin)/admin/loan-items', 'page')
  revalidateTag('loan-items')
}

/**
 * Revalide les pages financières
 */
export async function revalidateFinancial() {
  revalidatePath('/(admin)/admin/finance', 'layout') // Revalide tout le layout finance
  revalidateTag('financial')
}

/**
 * Revalide les dashboards (home admin, analytics, etc.)
 */
export async function revalidateDashboards() {
  revalidatePath('/(admin)/admin', 'page')
  revalidatePath('/(admin)/admin/analytics', 'page')
  revalidateTag('dashboard')
  revalidateTag('analytics')
}

/**
 * Revalide la configuration (branding, features, email)
 */
export async function revalidateConfig() {
  revalidatePath('/(admin)/admin/settings', 'layout')
  revalidateTag('config')
  revalidateTag('branding')
  revalidateTag('features')
}

/**
 * Revalidation complète (à utiliser avec parcimonie)
 */
export async function revalidateAll() {
  revalidatePath('/', 'layout') // Revalide tout depuis la racine
}
