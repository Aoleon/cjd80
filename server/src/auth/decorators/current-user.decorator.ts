import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract current authenticated user from request
 *
 * Usage:
 * ```typescript
 * @Get('me')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: any) {
 *   return user; // { id, email, role }
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
