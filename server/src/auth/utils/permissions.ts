/**
 * Utilitaire pour vérifier les permissions des utilisateurs
 * Implémentation locale car @robinswood/auth-unified n'exporte pas hasPermission
 */

/**
 * Vérifie si un rôle possède une permission donnée
 * @param role - Le rôle de l'utilisateur
 * @param permission - La permission à vérifier
 * @param rolePermissionsMap - Map des permissions par rôle
 * @returns true si le rôle possède la permission, false sinon
 */
export function hasPermission(
  role: string,
  permission: string,
  rolePermissionsMap: Record<string, string[]>
): boolean {
  const rolePermissions = rolePermissionsMap[role];
  if (!rolePermissions) {
    return false;
  }
  return rolePermissions.includes(permission);
}
