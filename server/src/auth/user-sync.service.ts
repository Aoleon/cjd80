import { Injectable } from '@nestjs/common';
import { StorageService } from '../common/storage/storage.service';
import { AuthentikService, AuthentikUser } from '../integrations/authentik/authentik.service';
import { logger } from '../../lib/logger';
import { ADMIN_ROLES, AdminRole } from '../../../shared/schema';

/**
 * Service NestJS pour synchroniser les utilisateurs Authentik avec la table admins
 * Lors de la première connexion via Authentik, crée ou met à jour l'utilisateur dans la DB
 */
@Injectable()
export class UserSyncService {
  constructor(
    private storageService: StorageService,
    private authentikService: AuthentikService
  ) {}

  /**
   * Synchronise un utilisateur Authentik avec la table admins
   */
  async syncUser(authentikUser: AuthentikUser): Promise<{ success: boolean; user?: any; error?: Error }> {
    try {
      // Déterminer le rôle depuis les groupes Authentik
      const role = this.authentikService.determineUserRole(authentikUser.groups) as AdminRole;
      
      // Vérifier si l'utilisateur existe déjà
      const existingUserResult = await this.storageService.instance.getUserByEmail(authentikUser.email);
      
      if (existingUserResult.success && existingUserResult.data) {
        // Mettre à jour l'utilisateur existant
        logger.info('[UserSync] Mise à jour de l\'utilisateur existant', {
          email: authentikUser.email,
          role,
        });

        if (existingUserResult.data.role !== role) {
          const roleUpdateResult = await this.storageService.instance.updateAdminRole(authentikUser.email, role);
          if (!roleUpdateResult.success) {
            const error = 'error' in roleUpdateResult ? roleUpdateResult.error : new Error('Unknown error');
            logger.error('[UserSync] Erreur lors de la mise à jour du rôle', {
              email: authentikUser.email,
              error,
            });
          }
        }

        const firstName = authentikUser.firstName || existingUserResult.data.firstName;
        const lastName = authentikUser.lastName || existingUserResult.data.lastName;
        if (firstName && lastName && 
            (existingUserResult.data.firstName !== firstName || existingUserResult.data.lastName !== lastName)) {
          const infoUpdateResult = await this.storageService.instance.updateAdminInfo(authentikUser.email, {
            firstName,
            lastName,
          });
          if (!infoUpdateResult.success) {
            const error = 'error' in infoUpdateResult ? infoUpdateResult.error : new Error('Unknown error');
            logger.error('[UserSync] Erreur lors de la mise à jour des informations', {
              email: authentikUser.email,
              error,
            });
          }
        }

        const updatedUserResult = await this.storageService.instance.getUser(authentikUser.email);
        if (updatedUserResult.success && updatedUserResult.data) {
          return { success: true, user: updatedUserResult.data };
        }
      } else {
        // Créer un nouvel utilisateur
        logger.info('[UserSync] Création d\'un nouvel utilisateur', {
          email: authentikUser.email,
          role,
        });

        const createResult = await this.storageService.instance.createUser({
          email: authentikUser.email,
          firstName: authentikUser.firstName || 'Admin',
          lastName: authentikUser.lastName || 'User',
          password: undefined,
          role,
          addedBy: 'authentik',
        });
        
        if (createResult.success && createResult.data) {
          await this.storageService.instance.updateAdminStatus(authentikUser.email, true);
          await this.storageService.instance.approveAdmin(authentikUser.email, role);
        }

        if (!createResult.success) {
          const error = 'error' in createResult ? createResult.error : new Error('Unknown error');
          logger.error('[UserSync] Erreur lors de la création de l\'utilisateur', {
            email: authentikUser.email,
            error,
          });
          return { success: false, error };
        }

        return { success: true, user: createResult.data };
      }

      return { success: false, error: new Error('Unknown error') };
    } catch (error) {
      logger.error('[UserSync] Erreur lors de la synchronisation', { error, email: authentikUser.email });
      return { success: false, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }

  /**
   * Récupère ou crée un utilisateur depuis un profil OAuth2
   */
  async getOrCreateUserFromOAuth2(userProfile: any): Promise<{ success: boolean; user?: any; error?: Error }> {
    try {
      const email = userProfile.email || userProfile.preferred_username;
      if (!email) {
        return { success: false, error: new Error('Email manquant dans le profil OAuth2') };
      }

      // Récupérer les groupes depuis le profil
      const groups = userProfile.groups || [];
      
      const authentikUser: AuthentikUser = {
        email,
        firstName: userProfile.first_name || userProfile.given_name || userProfile.name?.split(' ')[0],
        lastName: userProfile.last_name || userProfile.family_name || userProfile.name?.split(' ').slice(1).join(' '),
        groups,
        attributes: userProfile.attributes || userProfile,
      };

      return await this.syncUser(authentikUser);
    } catch (error) {
      logger.error('[UserSync] Erreur lors de la création depuis OAuth2', { error });
      return { success: false, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }
}


