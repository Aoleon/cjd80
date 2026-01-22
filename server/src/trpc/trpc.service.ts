/**
 * tRPC Service - Gestion des requêtes tRPC
 *
 * Crée le handler tRPC avec context et router
 */

import { Injectable } from '@nestjs/common'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import type { Request, Response } from 'express'
import { appRouter } from './trpc-router'
import { createTRPCContext } from './trpc-context'
import { IdeasService } from '../ideas/ideas.service'
import { EventsService } from '../events/events.service'

@Injectable()
export class TRPCService {
  private expressMiddleware: ReturnType<typeof createExpressMiddleware>

  constructor(
    private readonly ideasService: IdeasService,
    private readonly eventsService: EventsService
  ) {
    // Créer Express middleware tRPC
    this.expressMiddleware = createExpressMiddleware({
      router: appRouter,
      createContext: async ({ req, res }) => {
        const baseContext = await createTRPCContext({ req, res })

        // Injecter services NestJS dans context
        return {
          ...baseContext,
          services: {
            ideasService: this.ideasService,
            eventsService: this.eventsService,
          },
        }
      },
    })
  }

  /**
   * Handle tRPC request
   *
   * @param req - Express Request
   * @param res - Express Response
   */
  async handleRequest(req: Request, res: Response) {
    return this.expressMiddleware(req, res)
  }
}
