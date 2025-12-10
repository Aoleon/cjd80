import { 
  Controller, 
  Get, 
  Post, 
  Body,
  Query,
  UseGuards, 
  Req, 
  Res, 
  HttpCode, 
  HttpStatus,
  Inject,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { User } from './decorators/user.decorator';
import { logger } from '../../lib/logger';
import { JwtAuthGuard } from './guards/auth.guard';
import { z } from 'zod';

// Schémas de validation
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private passwordResetService: PasswordResetService,
    @Inject('AUTH_MODE') private authMode: string,
  ) {}

  // ================================
  // ROUTES OAUTH2 (Authentik)
  // ================================

  /**
   * Route pour initier le flow OAuth2
   * GET /api/auth/authentik
   */
  @Get('authentik')
  @UseGuards(AuthGuard('authentik'))
  async authenticate() {
    // Cette méthode ne sera jamais appelée car AuthGuard redirige vers Authentik
  }

  /**
   * Route callback OAuth2
   * GET /api/auth/authentik/callback
   */
  @Get('authentik/callback')
  @UseGuards(AuthGuard('authentik'))
  async callback(@Req() req: Request, @Res() res: Response, @User() user: any) {
    if (!user) {
      logger.warn('[Auth] Authentification OAuth2 échouée');
      return res.redirect('/auth?error=authentication_failed');
    }

    return new Promise<void>((resolve) => {
      (req as any).logIn(user, (loginErr: any) => {
        if (loginErr) {
          logger.error('[Auth] Erreur session OAuth2', { error: loginErr });
          return res.redirect('/auth?error=session_failed');
        }

        const redirectTo = (req.session as any)?.returnTo || '/admin';
        delete (req.session as any)?.returnTo;
        res.redirect(redirectTo);
        resolve();
      });
    });
  }

  // ================================
  // ROUTES LOGIN LOCAL (Formulaire)
  // ================================

  /**
   * Route login - formulaire ou redirection OAuth2
   * POST /api/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request, @Res() res: Response, @Body() body: any) {
    // Mode OAuth2 : redirection vers Authentik
    if (this.authMode === 'oauth') {
      if (body?.returnTo) {
        (req.session as any).returnTo = body.returnTo;
      }
      return res.redirect('/api/auth/authentik');
    }

    // Mode Local : authentification par formulaire
    try {
      const validatedData = loginSchema.parse(body);
      
      // Utiliser la stratégie locale via Passport
      return new Promise<void>((resolve, reject) => {
        // Import dynamique pour éviter les erreurs si la stratégie n'est pas chargée
        const passport = require('passport');
        
        passport.authenticate('local', (err: any, user: any, info: any) => {
          if (err) {
            logger.error('[Auth] Erreur authentification locale', { error: err });
            return res.status(500).json({ message: 'Erreur serveur' });
          }
          
          if (!user) {
            logger.warn('[Auth] Authentification échouée', { email: validatedData.email });
            return res.status(401).json({ message: info?.message || 'Identifiants invalides' });
          }

          (req as any).logIn(user, (loginErr: any) => {
            if (loginErr) {
              logger.error('[Auth] Erreur établissement session', { error: loginErr });
              return res.status(500).json({ message: 'Erreur lors de la connexion' });
            }

            logger.info('[Auth] Connexion locale réussie', { email: user.email });
            res.json(this.authService.getUserWithoutPassword(user));
            resolve();
          });
        })(req, res);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      throw error;
    }
  }

  // ================================
  // ROUTES RESET MOT DE PASSE
  // ================================

  /**
   * Demande de réinitialisation de mot de passe
   * POST /api/auth/forgot-password
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: any) {
    try {
      const validatedData = forgotPasswordSchema.parse(body);
      
      await this.passwordResetService.requestPasswordReset(validatedData.email);
      
      // Toujours retourner un succès pour ne pas révéler si l'email existe
      return { 
        message: 'Si cette adresse email est associée à un compte, vous recevrez un email de réinitialisation.' 
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException(error.errors[0].message);
      }
      throw error;
    }
  }

  /**
   * Vérification de validité d'un token
   * GET /api/auth/reset-password/validate?token=xxx
   */
  @Get('reset-password/validate')
  async validateResetToken(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token requis');
    }

    const result = await this.passwordResetService.validateToken(token);
    return result;
  }

  /**
   * Réinitialisation du mot de passe
   * POST /api/auth/reset-password
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: any) {
    try {
      const validatedData = resetPasswordSchema.parse(body);
      
      await this.passwordResetService.resetPassword(
        validatedData.token,
        validatedData.password
      );
      
      return { message: 'Mot de passe réinitialisé avec succès' };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException(error.errors[0].message);
      }
      throw error;
    }
  }

  // ================================
  // ROUTES COMMUNES
  // ================================

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
            logger.error('[Auth] Erreur destruction session', { error: destroyErr });
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
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@User() user: any) {
    return this.authService.getUserWithoutPassword(user);
  }

  /**
   * Route pour obtenir le mode d'authentification
   * GET /api/auth/mode
   */
  @Get('mode')
  getAuthMode() {
    return { mode: this.authMode };
  }
}
