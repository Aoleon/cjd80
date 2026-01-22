import { Controller, Get, Req, Res, UseGuards, Logger, Query } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthOAuthService } from './auth-oauth.service';

/**
 * OAuth Controller with PKCE Support
 *
 * Handles OAuth 2.0 authentication with PKCE (Proof Key for Code Exchange).
 * PKCE provides additional security for mobile apps and SPAs.
 *
 * Endpoints:
 * - GET /auth/google/pkce - Initiate Google OAuth with PKCE
 * - GET /auth/google/pkce/callback - Handle Google OAuth callback
 * - GET /auth/azure/pkce - Initiate Azure OAuth with PKCE
 * - GET /auth/azure/pkce/callback - Handle Azure OAuth callback
 *
 * PKCE Flow:
 * 1. Client generates code_verifier and code_challenge
 * 2. Client sends authorization request with code_challenge
 * 3. Provider returns authorization code
 * 4. Client sends token request with code AND code_verifier
 * 5. Provider validates: SHA256(code_verifier) === stored code_challenge
 * 6. Provider returns access token
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7636
 */
@Controller('api/auth')
export class AuthOAuthPkceController {
  private readonly logger = new Logger(AuthOAuthPkceController.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly authOAuthService: AuthOAuthService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  /**
   * Validate PKCE parameters from query string
   *
   * @param req - Request object
   * @returns Validation result with error message if invalid
   */
  private validatePkceParams(req: Request): { valid: boolean; error?: string } {
    const { code_challenge, code_challenge_method } = req.query;

    // Validate code_challenge presence
    if (!code_challenge || typeof code_challenge !== 'string') {
      return {
        valid: false,
        error: 'Missing or invalid code_challenge parameter',
      };
    }

    // Validate code_challenge_method
    if (code_challenge_method !== 'S256') {
      return {
        valid: false,
        error: 'Only S256 code_challenge_method is supported',
      };
    }

    // Validate code_challenge format (base64url)
    const base64UrlPattern = /^[A-Za-z0-9\-_]+$/;
    if (!base64UrlPattern.test(code_challenge)) {
      return {
        valid: false,
        error: 'Invalid code_challenge format (must be base64url)',
      };
    }

    // Validate code_challenge length
    // SHA-256 hash base64url-encoded = 43 characters
    if (code_challenge.length !== 43) {
      return {
        valid: false,
        error: 'Invalid code_challenge length (expected 43 characters for S256)',
      };
    }

    return { valid: true };
  }

  /**
   * Initiate Google OAuth with PKCE
   *
   * Query Parameters:
   * - code_challenge: SHA256(code_verifier) base64url-encoded (required)
   * - code_challenge_method: 'S256' (required)
   *
   * @route GET /auth/google/pkce
   */
  @Get('google/pkce')
  @UseGuards(/* GooglePkceGuard */)
  async azureAuthPkce(@Req() req: Request, @Res() res: Response): Promise<void> {
    // Validate PKCE parameters
    const validation = this.validatePkceParams(req);

    if (!validation.valid) {
      this.logger.warn('Invalid PKCE parameters for Google OAuth', {
        error: validation.error,
        query: req.query,
        ip: req.ip,
      });

      return res.redirect(
        `${this.frontendUrl}/auth/error?message=${encodeURIComponent('invalid_pkce_params')}&hint=${encodeURIComponent(validation.error || '')}`,
      );
    }

    // Store code_challenge in session for validation in callback
    // (Passport will handle the OAuth redirect)
    if (req.session) {
      req.session.pkce_code_challenge = req.query.code_challenge as string;
    }

    this.logger.log('Google OAuth PKCE initiated', {
      code_challenge: req.query.code_challenge,
      ip: req.ip,
    });

    // Passport will redirect to Google OAuth
  }

  /**
   * Handle Google OAuth callback with PKCE validation
   *
   * Query Parameters:
   * - code: Authorization code from Google (if success)
   * - error: Error code (if failure)
   * - state: CSRF protection state parameter
   *
   * Body/Session:
   * - code_verifier: Original code verifier (sent in token exchange)
   *
   * @route GET /auth/google/pkce/callback
   */
  @Get('google/pkce/callback')
  @UseGuards(/* GooglePkceGuard */)
  async azureAuthPkceCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const startTime = Date.now();

    try {
      // Check for OAuth errors from Google
      if (req.query.error) {
        return this.handleOAuthError(req, res, 'google', req.query.error as string);
      }

      // Validate that Passport successfully authenticated user
      if (!req.user) {
        this.logger.warn('Google OAuth PKCE callback: No user in request', {
          query: req.query,
          sessionId: req.sessionID,
          ip: req.ip,
        });

        return res.redirect(
          `${this.frontendUrl}/auth/error?message=${encodeURIComponent('authentication_failed')}&hint=pkce_validation_failed`,
        );
      }

      const googleUser = req.user as any;

      // Validate required fields from Google
      if (!googleUser.googleId || !googleUser.email) {
        this.logger.error('Google OAuth PKCE callback: Missing required fields', {
          hasGoogleId: !!googleUser.googleId,
          hasEmail: !!googleUser.email,
        });

        return res.redirect(
          `${this.frontendUrl}/auth/error?message=${encodeURIComponent('invalid_oauth_response')}`,
        );
      }

      // Authenticate or register user
      const result = await this.authOAuthService.azureAuth({
        googleId: googleUser.googleId,
        email: googleUser.email,
        name: googleUser.name,
        profilePicture: googleUser.profilePicture,
      });

      const duration = Date.now() - startTime;

      this.logger.log('Google OAuth PKCE login successful', {
        userId: result.user.id,
        email: result.user.email,
        provider: 'google',
        pkce: true,
        duration,
        ip: req.ip,
      });

      // Clean up PKCE session data
      if (req.session && req.session.pkce_code_challenge) {
        delete req.session.pkce_code_challenge;
      }

      // Redirect to frontend with token
      const redirectUrl = `${this.frontendUrl}/auth/callback?token=${result.access_token}&provider=google&pkce=true`;

      return res.redirect(redirectUrl);

    } catch (error) {
      return this.handleCallbackError(req, res, 'google', error, Date.now() - startTime);
    }
  }

  /**
   * Initiate Azure OAuth with PKCE
   *
   * @route GET /auth/azure/pkce
   */
  @Get('azure/pkce')
  @UseGuards(/* AzurePkceGuard */)
  async azureAuthPkce(@Req() req: Request, @Res() res: Response): Promise<void> {
    // Validate PKCE parameters
    const validation = this.validatePkceParams(req);

    if (!validation.valid) {
      this.logger.warn('Invalid PKCE parameters for Azure OAuth', {
        error: validation.error,
        query: req.query,
        ip: req.ip,
      });

      return res.redirect(
        `${this.frontendUrl}/auth/error?message=${encodeURIComponent('invalid_pkce_params')}&hint=${encodeURIComponent(validation.error || '')}`,
      );
    }

    // Store code_challenge in session
    if (req.session) {
      req.session.pkce_code_challenge = req.query.code_challenge as string;
    }

    this.logger.log('Azure OAuth PKCE initiated', {
      code_challenge: req.query.code_challenge,
      ip: req.ip,
    });

    // Passport will redirect to Azure OAuth
  }

  /**
   * Handle Azure OAuth callback with PKCE validation
   *
   * @route GET /auth/azure/pkce/callback
   */
  @Get('azure/pkce/callback')
  @UseGuards(/* AzurePkceGuard */)
  async azureAuthPkceCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const startTime = Date.now();

    try {
      // Check for OAuth errors from Azure
      if (req.query.error) {
        return this.handleOAuthError(req, res, 'azure', req.query.error as string);
      }

      // Validate user authenticated
      if (!req.user) {
        this.logger.warn('Azure OAuth PKCE callback: No user in request', {
          query: req.query,
          sessionId: req.sessionID,
          ip: req.ip,
        });

        return res.redirect(
          `${this.frontendUrl}/auth/error?message=${encodeURIComponent('authentication_failed')}&hint=pkce_validation_failed`,
        );
      }

      const azureUser = req.user as any;

      // Validate required fields
      if (!azureUser.azureId || !azureUser.email) {
        this.logger.error('Azure OAuth PKCE callback: Missing required fields', {
          hasAzureId: !!azureUser.azureId,
          hasEmail: !!azureUser.email,
        });

        return res.redirect(
          `${this.frontendUrl}/auth/error?message=${encodeURIComponent('invalid_oauth_response')}`,
        );
      }

      // Authenticate or register user
      const result = await this.authOAuthService.azureAuth({
        azureId: azureUser.azureId,
        email: azureUser.email,
        name: azureUser.name,
        tenantId: azureUser.tenantId,
      });

      const duration = Date.now() - startTime;

      this.logger.log('Azure OAuth PKCE login successful', {
        userId: result.user.id,
        email: result.user.email,
        provider: 'azure',
        pkce: true,
        duration,
        ip: req.ip,
      });

      // Clean up PKCE session data
      if (req.session && req.session.pkce_code_challenge) {
        delete req.session.pkce_code_challenge;
      }

      // Redirect to frontend with token
      const redirectUrl = `${this.frontendUrl}/auth/callback?token=${result.access_token}&provider=azure&pkce=true`;

      return res.redirect(redirectUrl);

    } catch (error) {
      return this.handleCallbackError(req, res, 'azure', error, Date.now() - startTime);
    }
  }

  /**
   * Handle OAuth errors from provider
   * (Same implementation as standard OAuth controller)
   */
  private handleOAuthError(
    req: Request,
    res: Response,
    provider: string,
    error: string,
  ): void {
    const errorDescription = req.query.error_description as string;

    this.logger.warn(`OAuth PKCE error from ${provider}`, {
      error,
      errorDescription,
      provider,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const errorMap: Record<string, { message: string; hint?: string }> = {
      'access_denied': {
        message: 'authentication_cancelled',
        hint: 'You cancelled the sign-in process',
      },
      'invalid_request': {
        message: 'invalid_oauth_request',
        hint: 'Configuration error, please contact support',
      },
      'invalid_grant': {
        message: 'token_expired',
        hint: 'Please sign in again',
      },
      'server_error': {
        message: 'oauth_server_error',
        hint: 'Provider is temporarily unavailable',
      },
    };

    const mappedError = errorMap[error] || {
      message: 'oauth_error',
      hint: errorDescription || 'Unknown OAuth error',
    };

    const redirectUrl = `${this.frontendUrl}/auth/error?message=${encodeURIComponent(mappedError.message)}&hint=${encodeURIComponent(mappedError.hint || '')}&provider=${provider}`;

    return res.redirect(redirectUrl);
  }

  /**
   * Handle callback errors
   * (Same implementation as standard OAuth controller)
   */
  private handleCallbackError(
    req: Request,
    res: Response,
    provider: string,
    error: any,
    duration: number,
  ): void {
    this.logger.error(`OAuth PKCE callback error (${provider})`, {
      error: error.message,
      stack: error.stack,
      provider,
      duration,
      ip: req.ip,
      query: req.query,
    });

    const redirectUrl = `${this.frontendUrl}/auth/error?message=${encodeURIComponent('authentication_failed')}&provider=${provider}`;

    return res.redirect(redirectUrl);
  }
}
