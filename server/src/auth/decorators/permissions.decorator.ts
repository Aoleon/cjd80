import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

/**
 * Décorateur pour spécifier la permission requise pour une route
 * Usage: @Permissions('admin.view')
 */
export const Permissions = (permission: string) => SetMetadata(PERMISSION_KEY, permission);

