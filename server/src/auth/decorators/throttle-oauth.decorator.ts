import { SetMetadata } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { oauthRateLimits } from '../config/rate-limit.config';

/**
 * Custom Rate Limit Decorators for OAuth Endpoints
 *
 * Apply specific rate limits to different OAuth operations.
 *
 * Usage:
 * ```typescript
 * @ThrottleLogin()
 * @Post('login')
 * async login() { ... }
 * ```
 */

/**
 * Rate limit for login endpoints (password-based)
 * 5 attempts per minute per IP
 */
export const ThrottleLogin = () =>
  Throttle({
    default: {
      ttl: oauthRateLimits.login.ttl,
      limit: oauthRateLimits.login.limit,
    },
  });

/**
 * Rate limit for OAuth initiation (redirect to provider)
 * 10 attempts per minute per IP
 */
export const ThrottleOAuthInitiate = () =>
  Throttle({
    default: {
      ttl: oauthRateLimits.oauthInitiate.ttl,
      limit: oauthRateLimits.oauthInitiate.limit,
    },
  });

/**
 * Rate limit for OAuth callback (receive token from provider)
 * 10 callbacks per minute per IP
 */
export const ThrottleOAuthCallback = () =>
  Throttle({
    default: {
      ttl: oauthRateLimits.oauthCallback.ttl,
      limit: oauthRateLimits.oauthCallback.limit,
    },
  });

/**
 * Rate limit for token refresh
 * 10 refresh attempts per minute per IP
 */
export const ThrottleRefreshToken = () =>
  Throttle({
    default: {
      ttl: oauthRateLimits.refreshToken.ttl,
      limit: oauthRateLimits.refreshToken.limit,
    },
  });

/**
 * Rate limit for registration
 * 3 registrations per hour per IP
 */
export const ThrottleRegister = () =>
  Throttle({
    default: {
      ttl: oauthRateLimits.register.ttl,
      limit: oauthRateLimits.register.limit,
    },
  });

/**
 * Rate limit for password reset
 * 3 reset requests per hour per IP
 */
export const ThrottlePasswordReset = () =>
  Throttle({
    default: {
      ttl: oauthRateLimits.passwordReset.ttl,
      limit: oauthRateLimits.passwordReset.limit,
    },
  });

/**
 * Skip rate limiting (for whitelisted IPs or internal endpoints)
 */
export const SkipThrottle = () => SetMetadata('skipThrottle', true);
