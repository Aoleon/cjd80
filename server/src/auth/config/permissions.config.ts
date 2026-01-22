import { ADMIN_ROLES } from '../../../../shared/schema';

/**
 * Permissions CJD80
 * Configuration des permissions pour @robinswood/auth
 */
const CJD80_PERMISSIONS = {
  SUPER_ADMIN: 'admin:super',
  READ_ALL: 'admin:read_all',
  WRITE_ALL: 'admin:write_all',
} as const;

/**
 * Mapping des rôles CJD80 vers les permissions
 * Utilisé par AuthUnifiedModule de @robinswood/auth
 */
export const CJD80_ROLE_PERMISSIONS: Record<string, string[]> = {
  [ADMIN_ROLES.SUPER_ADMIN]: [
    CJD80_PERMISSIONS.SUPER_ADMIN, // Accès complet
  ],

  [ADMIN_ROLES.IDEAS_MANAGER]: [
    CJD80_PERMISSIONS.READ_ALL,
    CJD80_PERMISSIONS.WRITE_ALL,
    'ideas:read',
    'ideas:write',
    'ideas:approve',
    'ideas:reject',
  ],

  [ADMIN_ROLES.IDEAS_READER]: [
    CJD80_PERMISSIONS.READ_ALL,
    'ideas:read',
  ],

  [ADMIN_ROLES.EVENTS_MANAGER]: [
    CJD80_PERMISSIONS.READ_ALL,
    CJD80_PERMISSIONS.WRITE_ALL,
    'events:read',
    'events:write',
    'events:publish',
    'events:cancel',
  ],

  [ADMIN_ROLES.EVENTS_READER]: [
    CJD80_PERMISSIONS.READ_ALL,
    'events:read',
  ],
};
