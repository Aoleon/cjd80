import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark routes as public (bypass JWT authentication)
 *
 * Usage:
 * ```typescript
 * @Public()
 * @Get('public-endpoint')
 * publicRoute() {
 *   return { message: 'This is public' };
 * }
 * ```
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
