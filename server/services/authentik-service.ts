import { logger } from "../lib/logger";

export interface AuthentikUser {
  email: string;
  firstName?: string;
  lastName?: string;
  groups: string[];
  attributes?: Record<string, any>;
}

export interface AuthentikGroup {
  name: string;
  pk: string;
}

interface AuthentikAPIUser {
  email?: string;
  name?: string;
  pk: string;
  attributes?: Record<string, any>;
}

interface AuthentikAPIResponse {
  results: AuthentikAPIUser[];
}

interface AuthentikGroupsResponse {
  results: AuthentikGroup[];
}

/**
 * Service pour interagir avec l'API Authentik
 * Utilisé pour récupérer les informations utilisateur, groupes, etc.
 */
export class AuthentikService {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = process.env.AUTHENTIK_BASE_URL || "http://localhost:9002";
    this.token = process.env.AUTHENTIK_TOKEN || "";
  }

  /**
   * Récupère les informations d'un utilisateur depuis Authentik via l'API
   * Note: Cette méthode nécessite un token d'API Authentik
   */
  async getUserInfo(userEmail: string): Promise<AuthentikUser | null> {
    if (!this.token) {
      logger.warn("[Authentik] AUTHENTIK_TOKEN non configuré, impossible de récupérer les infos utilisateur");
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v3/core/users/?email=${encodeURIComponent(userEmail)}`, {
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        logger.error("[Authentik] Erreur lors de la récupération de l'utilisateur", {
          status: response.status,
          email: userEmail,
        });
        return null;
      }

      const data = await response.json() as AuthentikAPIResponse;
      if (data.results && data.results.length > 0) {
        const user = data.results[0];
        
        // Récupérer les groupes de l'utilisateur
        const groupsResponse = await fetch(`${this.baseUrl}/api/v3/core/users/${user.pk}/groups/`, {
          headers: {
            "Authorization": `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        });

        let groups: string[] = [];
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json() as AuthentikGroupsResponse;
          groups = groupsData.results?.map((g: AuthentikGroup) => g.name) || [];
        }

        return {
          email: user.email || userEmail,
          firstName: user.name?.split(" ")[0] || user.attributes?.firstName,
          lastName: user.name?.split(" ").slice(1).join(" ") || user.attributes?.lastName,
          groups,
          attributes: user.attributes,
        };
      }

      return null;
    } catch (error) {
      logger.error("[Authentik] Erreur lors de la récupération de l'utilisateur", { error, email: userEmail });
      return null;
    }
  }

  /**
   * Mappe un groupe Authentik vers un rôle de l'application
   * Les groupes Authentik doivent correspondre aux noms de rôles en minuscules
   */
  mapGroupToRole(groupName: string): string | null {
    const groupToRoleMap: Record<string, string> = {
      "super_admin": "super_admin",
      "ideas_reader": "ideas_reader",
      "ideas_manager": "ideas_manager",
      "events_reader": "events_reader",
      "events_manager": "events_manager",
    };

    return groupToRoleMap[groupName.toLowerCase()] || null;
  }

  /**
   * Détermine le rôle principal d'un utilisateur depuis ses groupes Authentik
   * Priorité: super_admin > managers > readers
   */
  determineUserRole(groups: string[]): string {
    // Import AdminRole ici pour éviter les dépendances circulaires
    type AdminRole = "super_admin" | "ideas_reader" | "ideas_manager" | "events_reader" | "events_manager";
    const roles = groups
      .map((group) => this.mapGroupToRole(group))
      .filter((role): role is string => role !== null);

    if (roles.includes("super_admin")) {
      return "super_admin";
    }
    if (roles.includes("ideas_manager") || roles.includes("events_manager")) {
      // Si l'utilisateur a plusieurs rôles manager, on prend le premier trouvé
      return roles.find((r) => r.includes("_manager")) || roles[0];
    }
    // Par défaut, retourner le premier rôle trouvé ou "ideas_reader"
    return roles[0] || "ideas_reader";
  }

  /**
   * Valide qu'un token OAuth2 est valide (optionnel, pour validation supplémentaire)
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v3/core/users/me/`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      logger.error("[Authentik] Erreur lors de la validation du token", { error });
      return false;
    }
  }
}

// Singleton instance
let authentikServiceInstance: AuthentikService | null = null;

export function getAuthentikService(): AuthentikService {
  if (!authentikServiceInstance) {
    authentikServiceInstance = new AuthentikService();
  }
  return authentikServiceInstance;
}

