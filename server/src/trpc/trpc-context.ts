/**
 * tRPC Context - Données disponibles dans tous les procedures
 *
 * Context inclut:
 * - db: Instance Drizzle pour queries
 * - user: Utilisateur authentifié (si applicable)
 * - services: Services NestJS injectés
 */

import type { Request, Response } from 'express'
import { db } from '../../db'
import type { IdeasService } from '../ideas/ideas.service'
import type { EventsService } from '../events/events.service'
import type { MembersService } from '../members/members.service'

export interface TRPCContext {
  req: Request
  res: Response
  db: typeof db
  user?: {
    id: string
    email: string
    role: string
  }
  // Services NestJS (injectés via Module)
  services?: {
    ideasService?: IdeasService
    eventsService?: EventsService
    membersService?: MembersService
  }
}

/**
 * Créer le context pour chaque requête tRPC
 *
 * @param req - Express Request
 * @param res - Express Response
 * @returns Context tRPC
 */
export async function createTRPCContext({
  req,
  res,
}: {
  req: Request
  res: Response
}): Promise<TRPCContext> {
  // Extraire user depuis session/JWT (si authentifié)
  const user = await extractUserFromRequest(req)

  return {
    req,
    res,
    db,
    user,
    // Services seront injectés par le Module NestJS
    services: {},
  }
}

/**
 * Extraire utilisateur authentifié depuis cookie JWT
 *
 * @param req - Express Request
 * @returns User ou undefined
 */
async function extractUserFromRequest(
  req: Request
): Promise<TRPCContext['user']> {
  try {
    // Cookie work_portal_sid contient JWT
    const sessionCookie = req.cookies?.['work_portal_sid']
    if (!sessionCookie) return undefined

    // TODO: Implémenter vérification JWT
    // Pour l'instant, retourner undefined (sera implémenté en Phase 2)
    return undefined
  } catch (error) {
    console.error('Error extracting user from request:', error)
    return undefined
  }
}

export type Context = TRPCContext
