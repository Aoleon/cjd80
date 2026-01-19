'use server'

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'

/**
 * Interface pour l'utilisateur authentifié (extrait du JWT)
 */
export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'super_admin' | 'user'
  organizationId: string
}

/**
 * Récupère l'utilisateur actuellement authentifié depuis le cookie JWT
 *
 * @returns L'utilisateur authentifié ou null si non authentifié
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('work_portal_sid')

    if (!token?.value) {
      return null
    }

    // Vérifier et décoder le JWT
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const payload = jwt.verify(token.value, secret) as any

    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as 'admin' | 'super_admin' | 'user',
      organizationId: payload.organizationId as string,
    }
  } catch (error) {
    console.error('Error verifying JWT:', error)
    return null
  }
}

/**
 * Require qu'un utilisateur soit authentifié
 * Throw une redirection vers /auth/login si non authentifié
 *
 * @returns L'utilisateur authentifié
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return user
}

/**
 * Require qu'un utilisateur ait un rôle spécifique
 *
 * @param allowedRoles - Rôles autorisés (par défaut: admin + super_admin)
 * @returns L'utilisateur authentifié avec le bon rôle
 */
export async function requireRole(
  allowedRoles: Array<'admin' | 'super_admin' | 'user'> = ['admin', 'super_admin']
): Promise<AuthenticatedUser> {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    throw new Error('Permissions insuffisantes')
  }

  return user
}

/**
 * Vérifie si l'utilisateur actuel est un admin
 *
 * @returns true si admin ou super_admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'admin' || user?.role === 'super_admin'
}

/**
 * Vérifie si l'utilisateur actuel est un super admin
 *
 * @returns true si super_admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'super_admin'
}
