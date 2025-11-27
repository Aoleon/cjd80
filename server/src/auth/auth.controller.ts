import { Controller, Get, Post, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { User } from './decorators/user.decorator';
import { logger } from '../../lib/logger';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Route pour initier le flow OAuth2
   * GET /api/auth/authentik
   */
  @Get('authentik')
  @UseGuards(AuthGuard('authentik'))
  async authenticate() {
    // Cette méthode ne sera jamais appelée car AuthGuard redirige vers Authentik
    // Elle est nécessaire pour la configuration de la route
  }

  /**
   * Route callback OAuth2
   * GET /api/auth/authentik/callback
   */
  @Get('authentik/callback')
  @UseGuards(AuthGuard('authentik'))
  async callback(@Req() req: Request, @Res() res: Response, @User() user: any) {
    if (!user) {
      logger.warn('[Auth] Authentification échouée dans callback');
      return res.redirect('/auth?error=authentication_failed');
    }

    // Établir la session
    return new Promise<void>((resolve) => {
      (req as any).logIn(user, (loginErr: any) => {
        if (loginErr) {
          logger.error('[Auth] Erreur lors de l\'établissement de session', { error: loginErr });
          return res.redirect('/auth?error=session_failed');
        }

        // Rediriger vers la page d'administration ou la page d'accueil
        const redirectTo = (req.session as any)?.returnTo || '/admin';
        delete (req.session as any)?.returnTo;
        res.redirect(redirectTo);
        resolve();
      });
    });
  }

  /**
   * Route login - redirige vers Authentik
   * POST /api/login
   */
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response) {
    // Sauvegarder l'URL de retour si fournie
    if (req.body?.returnTo) {
      (req.session as any).returnTo = req.body.returnTo;
    }
    // Rediriger vers le flow OAuth2
    res.redirect('/api/auth/authentik');
  }

  /**
   * Route logout - détruit la session
   * POST /api/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response) {
    return new Promise<void>((resolve) => {
      (req as any).logout((err: any) => {
        if (err) {
          logger.error('[Auth] Erreur lors de la déconnexion', { error: err });
          return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
        }
        req.session?.destroy((destroyErr) => {
          if (destroyErr) {
            logger.error('[Auth] Erreur lors de la destruction de session', { error: destroyErr });
            return res.status(500).json({ message: 'Erreur lors de la destruction de session' });
          }
          res.clearCookie('connect.sid');
          res.sendStatus(200);
          resolve();
        });
      });
    });
  }

  /**
   * Route pour obtenir l'utilisateur actuel
   * GET /api/user
   */
  @Get('user')
  @UseGuards(AuthGuard('authentik'))
  getCurrentUser(@User() user: any) {
    return this.authService.getUserWithoutPassword(user);
  }
}

