// @ts-nocheck
/**
 * @deprecated Ce service legacy est remplacé par le service NestJS.
 * Utiliser: server/src/auth/user-sync.service.ts
 * Date de dépréciation: 2025-11-30
 */
import { logger } from "../lib/logger";
import { getAuthentikService, AuthentikUser } from "./authentik-service";
import { IStorage } from "../storage";
import { ADMIN_ROLES, ADMIN_STATUS, AdminRole } from "../../shared/schema";

/**
 * Service pour synchroniser les utilisateurs Authentik avec la table admins
 * Lors de la première connexion via Authentik, crée ou met à jour l'utilisateur dans la DB
 */
export class UserSyncService {
  constructor(private storage: IStorage) {}

  /**
   * Synchronise un utilisateur Authentik avec la table admins
   * - Si l'utilisateur n'existe pas, le crée
   * - Si l'utilisateur existe, met à jour ses informations (rôle, nom, prénom)
   * - Le champ password est laissé NULL (plus utilisé avec Authentik)
   */
  async syncUser(authentikUser: AuthentikUser): Promise<{ success: boolean; user?: any; error?: Error }> {
    try {
      const authentikService = getAuthentikService();
      
      // Déterminer le rôle depuis les groupes Authentik
      const role = authentikService.determineUserRole(authentikUser.groups) as AdminRole;
      
      // Vérifier si l'utilisateur existe déjà
      const existingUserResult = await this.storage.getUserByEmail(authentikUser.email);
      
      if (existingUserResult.success && existingUserResult.data) {
        // Mettre à jour l'utilisateur existant
        logger.info("[UserSync] Mise à jour de l'utilisateur existant", {
          email: authentikUser.email,
          role,
        });

        // Mettre à jour le rôle si nécessaire
        if (existingUserResult.data.role !== role) {
          const roleUpdateResult = await this.storage.updateAdminRole(authentikUser.email, role);
          if (!roleUpdateResult.success) {
            logger.error("[UserSync] Erreur lors de la mise à jour du rôle", {
              email: authentikUser.email,
              error: roleUpdateResult.error,
            });
          }
        }

        // Mettre à jour les informations si nécessaire
        const firstName = authentikUser.firstName || existingUserResult.data.firstName;
        const lastName = authentikUser.lastName || existingUserResult.data.lastName;
        if (firstName && lastName && 
            (existingUserResult.data.firstName !== firstName || existingUserResult.data.lastName !== lastName)) {
          const infoUpdateResult = await this.storage.updateAdminInfo(authentikUser.email, {
            firstName,
            lastName,
          });
          if (!infoUpdateResult.success) {
            logger.error("[UserSync] Erreur lors de la mise à jour des informations", {
              email: authentikUser.email,
              error: infoUpdateResult.error,
            });
          }
        }

        // Récupérer l'utilisateur mis à jour
        const updatedUserResult = await this.storage.getUser(authentikUser.email);
        if (updatedUserResult.success && updatedUserResult.data) {
          return { success: true, user: updatedUserResult.data };
        }
      } else {
        // Créer un nouvel utilisateur
        logger.info("[UserSync] Création d'un nouvel utilisateur", {
          email: authentikUser.email,
          role,
        });

        const createResult = await this.storage.createUser({
          email: authentikUser.email,
          firstName: authentikUser.firstName || "Admin",
          lastName: authentikUser.lastName || "User",
          password: undefined, // Password null car géré par Authentik
          role,
          addedBy: "authentik", // Indicateur que l'utilisateur vient d'Authentik
        });
        
        // Mettre à jour le statut après création si nécessaire
        if (createResult.success && createResult.data) {
          // Le statut par défaut est "pending", on le met à "active" pour les utilisateurs Authentik
          await this.storage.updateAdminStatus(authentikUser.email, true);
          // Approuver l'admin pour passer le statut à "active"
          await this.storage.approveAdmin(authentikUser.email, role);
        }

        if (!createResult.success) {
          logger.error("[UserSync] Erreur lors de la création de l'utilisateur", {
            email: authentikUser.email,
            error: createResult.error,
          });
          return { success: false, error: createResult.error };
        }

        return { success: true, user: createResult.data };
      }

      return { success: false, error: new Error("Erreur inconnue lors de la synchronisation") };
    } catch (error) {
      logger.error("[UserSync] Erreur lors de la synchronisation de l'utilisateur", {
        error,
        email: authentikUser.email,
      });
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  /**
   * Récupère ou crée un utilisateur depuis les informations OAuth2 d'Authentik
   * Cette méthode est appelée lors du callback OAuth2
   */
  async getOrCreateUserFromOAuth2(profile: any): Promise<{ success: boolean; user?: any; error?: Error }> {
    try {
      const authentikService = getAuthentikService();
      
      // Extraire les informations du profil OAuth2
      const email = profile.email || profile.preferred_username;
      if (!email) {
        return { success: false, error: new Error("Email manquant dans le profil OAuth2") };
      }

      // Récupérer les groupes depuis le profil (si disponibles)
      // Les groupes peuvent être dans profile.groups, profile.ak_groups, ou via une requête API séparée
      let groups: string[] = [];
      
      if (profile.groups && Array.isArray(profile.groups)) {
        groups = profile.groups.map((g: any) => typeof g === 'string' ? g : g.name || g);
      } else if (profile.ak_groups && Array.isArray(profile.ak_groups)) {
        groups = profile.ak_groups.map((g: any) => typeof g === 'string' ? g : g.name || g);
      } else if (profile.user?.groups) {
        // Si les groupes sont dans user.groups (structure Authentik)
        groups = profile.user.groups.map((g: any) => typeof g === 'string' ? g : g.name || g);
      }
      
      // Construire l'objet AuthentikUser
      const authentikUser: AuthentikUser = {
        email,
        firstName: profile.given_name || profile.first_name || profile.name?.split(" ")[0],
        lastName: profile.family_name || profile.last_name || profile.name?.split(" ").slice(1).join(" "),
        groups: Array.isArray(groups) ? groups : [],
        attributes: profile,
      };

      // Synchroniser avec la base de données
      return await this.syncUser(authentikUser);
    } catch (error) {
      logger.error("[UserSync] Erreur lors de la récupération/création de l'utilisateur depuis OAuth2", {
        error,
        profile,
      });
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
}

