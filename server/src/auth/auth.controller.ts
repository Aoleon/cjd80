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
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { User } from './decorators/user.decorator';
import { logger } from '../../lib/logger';
import { JwtAuthGuard } from './guards/auth.guard';
import { z } from 'zod';
import passport from 'passport';

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

@ApiTags('auth')
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
  @ApiOperation({ summary: 'Initier le flow OAuth2 avec Authentik' })
  @ApiResponse({ status: 302, description: 'Redirection vers Authentik pour authentification' })
  async authenticate() {
    // Cette méthode ne sera jamais appelée car AuthGuard redirige vers Authentik
  }

  /**
   * Route callback OAuth2
   * GET /api/auth/authentik/callback
   */
  @Get('authentik/callback')
  @UseGuards(AuthGuard('authentik'))
  @ApiOperation({ summary: 'Callback OAuth2 après authentification Authentik' })
  @ApiResponse({ status: 302, description: 'Redirection vers /admin après authentification réussie' })
  @ApiResponse({ status: 302, description: 'Redirection vers /auth?error=authentication_failed en cas d\'échec' })
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
  @ApiOperation({ summary: 'Connexion utilisateur (local ou OAuth2)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'admin@cjd-amiens.fr' },
        password: { type: 'string', format: 'password', example: 'SecurePassword123' },
        returnTo: { type: 'string', example: '/admin' }
      },
      required: ['email', 'password']
    }
  })
  @ApiResponse({ status: 200, description: 'Connexion réussie (mode local)', schema: { type: 'object', properties: { email: { type: 'string' }, role: { type: 'string' } } } })
  @ApiResponse({ status: 302, description: 'Redirection vers Authentik (mode OAuth2)' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
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
        return res.status(400).json({ message: error.issues[0].message });
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
  @ApiOperation({ summary: 'Demander un lien de réinitialisation de mot de passe' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' }
      },
      required: ['email']
    }
  })
  @ApiResponse({ status: 200, description: 'Email envoyé (si le compte existe)' })
  @ApiResponse({ status: 400, description: 'Email invalide' })
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
        throw new BadRequestException(error.issues[0].message);
      }
      throw error;
    }
  }

  /**
   * Vérification de validité d'un token
   * GET /api/auth/reset-password/validate?token=xxx
   */
  @Get('reset-password/validate')
  @ApiOperation({ summary: 'Valider un token de réinitialisation de mot de passe' })
  @ApiQuery({ name: 'token', required: true, description: 'Token de réinitialisation', example: 'abcd1234efgh5678' })
  @ApiResponse({ status: 200, description: 'Token valide', schema: { type: 'object', properties: { valid: { type: 'boolean', example: true } } } })
  @ApiResponse({ status: 400, description: 'Token manquant ou invalide' })
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
  @ApiOperation({ summary: 'Réinitialiser le mot de passe avec un token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'abcd1234efgh5678' },
        password: { type: 'string', format: 'password', minLength: 8, example: 'NewSecurePass123' }
      },
      required: ['token', 'password']
    }
  })
  @ApiResponse({ status: 200, description: 'Mot de passe réinitialisé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides ou token expiré' })
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
        throw new BadRequestException(error.issues[0].message);
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
  @ApiOperation({ summary: 'Déconnexion utilisateur' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  @ApiResponse({ status: 500, description: 'Erreur lors de la déconnexion' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir les informations de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Utilisateur connecté', schema: { type: 'object', properties: { email: { type: 'string' }, role: { type: 'string' }, permissions: { type: 'array', items: { type: 'string' } } } } })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  getCurrentUser(@User() user: any) {
    return this.authService.getUserWithoutPassword(user);
  }

  /**
   * Route pour obtenir le mode d'authentification
   * GET /api/auth/mode
   */
  @Get('mode')
  @ApiOperation({ summary: 'Obtenir le mode d\'authentification configuré' })
  @ApiResponse({ status: 200, description: 'Mode d\'authentification', schema: { type: 'object', properties: { mode: { type: 'string', enum: ['local', 'oauth'], example: 'oauth' } } } })
  getAuthMode() {
    return { mode: this.authMode };
  }
}
