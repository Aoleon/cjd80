import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';

/**
 * SPA Fallback Controller
 *
 * Ce controller gère le fallback vers index.html pour les Single Page Applications (SPA)
 * en mode production uniquement. En développement, Vite gère ce comportement dans main.ts.
 *
 * Problème résolu:
 * - Les routes client-side (/, /login, /dashboard, etc.) retournaient 404 en production
 * - ServeStaticModule seul ne suffit pas car il ne fait pas de fallback automatique
 * - Cette solution est robuste et maintenue par NestJS
 */
@Controller()
export class SpaFallbackController {
  private indexHtml: string;

  constructor() {
    // Pré-charger le contenu de index.html en mémoire pour performance
    const distPath = join(process.cwd(), 'dist', 'public', 'index.html');
    try {
      this.indexHtml = readFileSync(distPath, 'utf-8');
    } catch (error) {
      // En test/développement, créer un index.html minimal plutôt que de bloquer le démarrage
      if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
        console.warn('⚠️  index.html not found, using minimal fallback for', process.env.NODE_ENV);
        this.indexHtml = '<html><head><title>CJD80</title></head><body><div id="root"></div></body></html>';
      } else {
        console.error('❌ Failed to load index.html from', distPath, error);
        this.indexHtml = '<html><body><h1>Error: index.html not found</h1></body></html>';
      }
    }
  }

  /**
   * Catch-all route qui retourne index.html pour toutes les routes non-API
   *
   * IMPORTANT: Ce controller doit être enregistré APRÈS tous les autres controllers
   * dans app.module.ts pour éviter de capturer les routes API.
   *
   * Les exclusions :
   * - /api/* → Géré par les controllers métier
   * - /assets/* → Servir directement le fichier s'il existe, sinon retourner index.html
   */
  @Get('*')
  serveSpa(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const requestPath = req.path || req.url;

    // Pour les assets et fichiers statiques, servir le fichier directement s'il existe
    if (requestPath.startsWith('/assets/') || requestPath.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|webmanifest|txt)$/)) {
      const filePath = join(process.cwd(), 'dist', 'public', requestPath);
      if (existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    }

    // Pour toutes les autres routes, retourner index.html (SPA fallback)
    res.set('Content-Type', 'text/html');
    res.send(this.indexHtml);
  }
}
