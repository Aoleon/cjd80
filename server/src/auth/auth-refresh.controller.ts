import { Controller, Post, Body, Req, UseGuards, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { RefreshTokenService } from './services/refresh-token.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Refresh Token DTO
 */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

/**
 * Refresh Token Controller
 *
 * Handles refresh token operations:
 * - Token refresh (rotate old token, get new access + refresh tokens)
 * - Token revocation (logout)
 * - All user tokens revocation (security event)
 *
 * @route /auth/refresh
 */
@Controller('api/auth/refresh')
export class AuthRefreshController {
  private readonly logger = new Logger(AuthRefreshController.name);

  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  /**
   * Refresh access token using refresh token
   *
   * Security Features:
   * - Automatic token rotation (old token invalidated)
   * - Reuse detection (revokes entire family if token reused)
   * - IP and User-Agent tracking
   *
   * Request:
   * ```json
   * {
   *   "refreshToken": "abc123..."
   * }
   * ```
   *
   * Response:
   * ```json
   * {
   *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "refresh_token": "def456...",
   *   "token_type": "Bearer",
   *   "expires_in": 900
   * }
   * ```
   *
   * @route POST /auth/refresh/token
   */
  @Post('token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<{
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  }> {
    const startTime = Date.now();
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    try {
      // Rotate refresh token (validates, creates new, invalidates old)
      const tokens = await this.refreshTokenService.rotateRefreshToken(
        dto.refreshToken,
        ip,
        userAgent,
      );

      const duration = Date.now() - startTime;

      this.logger.log('Token refreshed successfully', {
        ip,
        duration,
        oldToken: dto.refreshToken.substring(0, 10) + '...',
      });

      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_type: 'Bearer',
        expires_in: 900, // 15 minutes (should match JWT expiration)
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error('Token refresh failed', {
        error: error.message,
        ip,
        duration,
        oldToken: dto.refreshToken.substring(0, 10) + '...',
      });

      throw error;
    }
  }

  /**
   * Revoke refresh token (logout)
   *
   * Requires authentication (valid JWT).
   * Revokes the provided refresh token.
   *
   * Request:
   * ```json
   * {
   *   "refreshToken": "abc123..."
   * }
   * ```
   *
   * Response:
   * ```json
   * {
   *   "message": "Token revoked successfully"
   * }
   * ```
   *
   * @route POST /auth/refresh/revoke
   */
  @Post('revoke')
  @UseGuards(JwtAuthGuard) // Requires valid JWT
  @HttpCode(HttpStatus.OK)
  async revokeToken(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const user = req.user as any; // Populated by JwtAuthGuard

    await this.refreshTokenService.revokeToken(dto.refreshToken, user.id);

    this.logger.log('Refresh token revoked', {
      userId: user.id,
      ip: req.ip,
    });

    return { message: 'Token revoked successfully' };
  }

  /**
   * Revoke all user refresh tokens (logout from all devices)
   *
   * Use cases:
   * - User requests "logout from all devices"
   * - Password changed (security measure)
   * - Account compromised (security measure)
   *
   * Requires authentication (valid JWT).
   *
   * Response:
   * ```json
   * {
   *   "message": "All tokens revoked successfully"
   * }
   * ```
   *
   * @route POST /auth/refresh/revoke-all
   */
  @Post('revoke-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revokeAllTokens(@Req() req: Request): Promise<{ message: string }> {
    const user = req.user as any;

    await this.refreshTokenService.revokeAllUserTokens(user.id, 'user_requested');

    this.logger.warn('All user tokens revoked', {
      userId: user.id,
      ip: req.ip,
      reason: 'user_requested',
    });

    return { message: 'All tokens revoked successfully' };
  }

  /**
   * Get active token count (for monitoring)
   *
   * Returns number of active (non-revoked, non-expired) refresh tokens.
   *
   * Requires authentication.
   *
   * Response:
   * ```json
   * {
   *   "activeTokens": 3
   * }
   * ```
   *
   * @route POST /auth/refresh/count
   */
  @Post('count')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getActiveTokenCount(@Req() req: Request): Promise<{ activeTokens: number }> {
    const user = req.user as any;

    const count = await this.refreshTokenService.getActiveTokenCount(user.id);

    return { activeTokens: count };
  }
}
