/**
 * Types de résultats pour Server Actions
 * Note: Ce fichier ne contient pas de Server Actions, donc pas de 'use server'
 */

export type ActionSuccess<T> = {
  success: true
  data: T
  message?: string
}

export type ActionError = {
  success: false
  error: string
  field?: string
  code?: string
}

export type ActionResult<T> = ActionSuccess<T> | ActionError

/**
 * Crée un résultat de succès pour Server Action
 */
export function createSuccess<T>(data: T, message?: string): ActionSuccess<T> {
  return { success: true, data, message }
}

/**
 * Crée un résultat d'erreur pour Server Action
 */
export function createError(
  error: string,
  field?: string,
  code?: string
): ActionError {
  return { success: false, error, field, code }
}

/**
 * Wrapper pour gérer les erreurs des Server Actions de manière uniforme
 */
export async function handleActionError<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn()
    return createSuccess(data)
  } catch (error) {
    console.error('Server Action error:', error)

    if (error instanceof Error) {
      return createError(error.message)
    }

    return createError('Une erreur inattendue est survenue')
  }
}

/**
 * Erreurs métier courantes
 */
export class NotFoundError extends Error {
  constructor(resource: string, id?: string) {
    super(id ? `${resource} ${id} introuvable` : `${resource} introuvable`)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Non autorisé') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Trop de requêtes, veuillez patienter') {
    super(message)
    this.name = 'RateLimitError'
  }
}

/**
 * Convertit une erreur Zod en message utilisateur
 */
export function formatZodError(error: any): ActionError {
  if (error.errors && error.errors.length > 0) {
    const firstError = error.errors[0]
    return createError(
      firstError.message,
      firstError.path?.[0] as string | undefined
    )
  }

  return createError('Données invalides')
}
