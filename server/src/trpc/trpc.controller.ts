/**
 * tRPC Controller - Expose endpoint /api/trpc
 *
 * Gère toutes les requêtes tRPC via un seul endpoint
 */

import { All, Controller, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { TRPCService } from './trpc.service'

@Controller('api/trpc')
export class TRPCController {
  constructor(private readonly trpcService: TRPCService) {}

  /**
   * Handle all tRPC requests
   *
   * @param req - Express Request
   * @param res - Express Response
   */
  @All('*')
  async handleTRPC(@Req() req: Request, @Res() res: Response) {
    return await this.trpcService.handleRequest(req, res)
  }
}
