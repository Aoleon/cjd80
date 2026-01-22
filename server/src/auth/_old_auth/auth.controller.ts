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
  BadRequestException
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard, User } from '@robinswood/auth';
import { PasswordResetService } from './password-reset.service';
import { logger } from '../../lib/logger';
import { z } from 'zod';
import passport from 'passport';

// Type pour Request avec méthodes Passport (sans extends pour éviter conflit de signature)
type PassportRequest = Request & {
  logIn(user: any, callback: (err: any) => void): void;
  logout(callback: (err: any) => void): void;
}

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
  ) {}

  // ================================
  // ROUTES LOGIN LOCAL (Formulaire)
  // ================================

  /**
   * Route login - authentification email/password
   * POST /api/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request, @Res() res: Response, @Body() body: any) {
    try {
      const validatedData = loginSchema.parse(body);

      // Utiliser la stratégie locale via Passport (depuis SharedAuthModule)
      return new Promise<void>((resolve) => {
        passport.authenticate('local', (err: any, user: any, info: any) => {
          if (err) {
            // Gérer les UnauthorizedException de la stratégie Passport
            if (err.status === 401 || err.name === 'UnauthorizedException' || err.response?.statusCode === 401) {
              logger.warn('[Auth] Authentification échouée', { email: validatedData.email, message: err.message });
              return res.status(401).json({ message: err.message || 'Identifiants invalides' });
            }
            logger.error('[Auth] Erreur authentification locale', { error: err });
            return res.status(500).json({ message: 'Erreur serveur' });
          }

          if (!user) {
            logger.warn('[Auth] Authentification échouée', { email: validatedData.email });
            return res.status(401).json({ message: info?.message || 'Identifiants invalides' });
          }

          (req as PassportRequest).logIn(user, (loginErr: any) => {
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
   * POST /api/auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response) {
    return new Promise<void>((resolve) => {
      (req as PassportRequest).logout((err: any) => {
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
   * GET /api/auth/user
   */
  @Get('user')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@User() user: any) {
    return this.authService.getUserWithoutPassword(user);
  }
}
