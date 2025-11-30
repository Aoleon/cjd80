import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { setupVite } from '../../../vite';
import type { Express } from 'express';
import type { Server } from 'http';

@Injectable()
export class ViteMiddleware implements NestMiddleware {
  private viteSetup: ((app: Express, server: Server) => Promise<void>) | null = null;

  async use(req: Request, res: Response, next: NextFunction) {
    // Le setup Vite sera fait dans main.ts après le bootstrap
    // car il nécessite l'instance HTTP server
    next();
  }

  static async setup(app: Express, server: Server) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      await setupVite(app, server);
    }
  }
}

