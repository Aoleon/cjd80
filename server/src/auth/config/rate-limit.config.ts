import { ThrottlerModuleOptions } from '@nestjs/throttler';

/**
 * Rate Limiting Configuration
 *
 * Protects OAuth endpoints from:
 * - Brute force attacks (login/token endpoints)
 * - DoS attacks (excessive requests)
 * - Credential stuffing (automated login attempts)
 * - Token harvesting (excessive refresh attempts)
 *
 * Uses sliding window algorithm with @nestjs/throttler
 *
 * @see https://github.com/nestjs/throttler
 */

/**
 * Default Rate Limits (Conservative)
 *
 * Apply to all endpoints unless overridden
 */
export const defaultRateLimit: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'short', // Short window (1 minute)
      ttl: 60000, // 60 seconds
      limit: 20, // 20 requests per minute
    },
    {
      name: 'medium', // Medium window (15 minutes)
      ttl: 900000, // 15 minutes
      limit: 100, // 100 requests per 15 minutes
    },
    {
      name: 'long', // Long window (1 hour)
      ttl: 3600000, // 1 hour
      limit: 300, // 300 requests per hour
    },
  ],
};

/**
 * OAuth Endpoints Rate Limits (Strict)
 *
 * More aggressive limits for auth-related endpoints
 */
export const oauthRateLimits = {
  /**
   * Login endpoints (password-based)
   * Protect against brute force attacks
   */
  login: {
    ttl: 60000, // 1 minute
    limit: 5, // 5 login attempts per minute
  },

  /**
   * OAuth initiation endpoints (redirect to provider)
   * Prevent excessive redirects
   */
  oauthInitiate: {
    ttl: 60000, // 1 minute
    limit: 10, // 10 OAuth initiations per minute
  },

  /**
   * OAuth callback endpoints (receive token from provider)
   * Limit callback processing
   */
  oauthCallback: {
    ttl: 60000, // 1 minute
    limit: 10, // 10 callbacks per minute
  },

  /**
   * Token refresh endpoints
   * Prevent token harvesting
   */
  refreshToken: {
    ttl: 60000, // 1 minute
    limit: 10, // 10 refresh attempts per minute
  },

  /**
   * Registration endpoints
   * Prevent mass account creation
   */
  register: {
    ttl: 3600000, // 1 hour
    limit: 3, // 3 registrations per hour per IP
  },

  /**
   * Password reset endpoints
   * Prevent email flooding
   */
  passwordReset: {
    ttl: 3600000, // 1 hour
    limit: 3, // 3 reset requests per hour per IP
  },
};

/**
 * IP Whitelist (Optional)
 *
 * IPs that bypass rate limiting (e.g., trusted services, monitoring)
 */
export const rateLimitWhitelist: string[] = [
  // '127.0.0.1', // Localhost (development)
  // '10.0.0.0/8', // Internal network
];

/**
 * Custom Error Message
 *
 * Shown when rate limit exceeded
 */
export const rateLimitExceededMessage = {
  statusCode: 429,
  message: 'Too many requests',
  error: 'ThrottlerException',
  hint: 'Please wait before trying again',
};

/**
 * Rate Limit Headers
 *
 * Include rate limit info in response headers
 */
export const rateLimitHeaders = {
  includeHeaders: true, // Add X-RateLimit-* headers
  headerPrefix: 'X-RateLimit', // Header prefix
};

/**
 * Per-User Rate Limiting (Advanced)
 *
 * Apply rate limits per authenticated user instead of per IP
 * Useful for APIs with authenticated requests
 */
export const perUserRateLimit = {
  enabled: true,
  extractUserIdFromRequest: (req: any): string | undefined => {
    // Extract user ID from JWT (if authenticated)
    return req.user?.id;
  },
};

/**
 * Storage Options
 *
 * Choose storage backend for rate limit tracking
 */
export const rateLimitStorage = {
  /**
   * Memory (default)
   * - Simple, no dependencies
   * - Lost on server restart
   * - Doesn't work with load balancer (each instance has own memory)
   */
  type: 'memory' as const,

  /**
   * Redis (recommended for production)
   * - Persistent
   * - Shared across instances (load balancer compatible)
   * - Better performance for high traffic
   */
  // type: 'redis' as const,
  // redis: {
  //   host: process.env.REDIS_HOST || 'localhost',
  //   port: parseInt(process.env.REDIS_PORT || '6379'),
  //   db: parseInt(process.env.REDIS_DB || '0'),
  // },
};

/**
 * Development Mode
 *
 * Disable rate limiting in development
 */
export const disableInDevelopment = process.env.NODE_ENV !== 'production';
