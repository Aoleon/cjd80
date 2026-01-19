'use server'

/**
 * Rate limiting simple en mémoire pour Server Actions
 *
 * Note: Pour production, utiliser Redis ou équivalent pour rate limiting distribué
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Cache en mémoire (temporaire - à remplacer par Redis en production)
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Vérifie si une requête est autorisée selon les limites de rate limiting
 *
 * @param identifier - Identifiant unique (IP, user ID, etc.)
 * @param action - Nom de l'action (pour séparer les limites)
 * @param maxRequests - Nombre maximum de requêtes autorisées
 * @param windowSeconds - Fenêtre de temps en secondes
 * @returns true si autorisé, false si limite dépassée
 */
export async function rateLimit(
  identifier: string,
  action: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const key = `${action}:${identifier}`
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  const entry = rateLimitStore.get(key)

  // Pas d'entrée ou fenêtre expirée - créer nouvelle entrée
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    })
    return true
  }

  // Fenêtre active - incrémenter compteur
  if (entry.count < maxRequests) {
    entry.count++
    rateLimitStore.set(key, entry)
    return true
  }

  // Limite dépassée
  return false
}

/**
 * Nettoie les entrées expirées du cache (à appeler périodiquement)
 */
export async function cleanupExpiredEntries(): Promise<void> {
  const now = Date.now()

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Réinitialise toutes les entrées de rate limiting
 * (Uniquement pour tests)
 */
export async function resetRateLimit(): Promise<void> {
  rateLimitStore.clear()
}

/**
 * Obtient le nombre de requêtes restantes pour un identifiant
 *
 * @param identifier - Identifiant unique
 * @param action - Nom de l'action
 * @param maxRequests - Nombre maximum de requêtes autorisées
 * @returns Nombre de requêtes restantes
 */
export async function getRemainingRequests(
  identifier: string,
  action: string,
  maxRequests: number
): Promise<number> {
  const key = `${action}:${identifier}`
  const entry = rateLimitStore.get(key)

  if (!entry || Date.now() > entry.resetAt) {
    return maxRequests
  }

  return Math.max(0, maxRequests - entry.count)
}
