import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { logger } from '../../../lib/logger';

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

/**
 * Service NestJS pour interagir avec l'API Authentik
 * Utilisé pour récupérer les informations utilisateur, groupes, etc.
 */
@Injectable()
export class AuthentikService {
  private baseUrl: string;
  private token: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('AUTHENTIK_BASE_URL') || 'http://localhost:9002';
    this.token = this.configService.get<string>('AUTHENTIK_TOKEN') || '';
  }

  /**
   * Récupère les informations d'un utilisateur depuis Authentik via l'API
   * Note: Cette méthode nécessite un token d'API Authentik
   */
  async getUserInfo(userEmail: string): Promise<AuthentikUser | null> {
    if (!this.token) {
      logger.warn('[Authentik] AUTHENTIK_TOKEN non configuré, impossible de récupérer les infos utilisateur');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v3/core/users/?email=${encodeURIComponent(userEmail)}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        logger.error('[Authentik] Erreur lors de la récupération de l\'utilisateur', {
          status: response.status,
          email: userEmail,
        });
        return null;
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const user = data.results[0];
        
        // Récupérer les groupes de l'utilisateur
        const groupsResponse = await fetch(`${this.baseUrl}/api/v3/core/users/${user.pk}/groups/`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });

        let groups: string[] = [];
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json();
          groups = groupsData.results?.map((g: AuthentikGroup) => g.name) || [];
        }

        return {
          email: user.email || userEmail,
          firstName: user.name?.split(' ')[0] || user.attributes?.firstName,
          lastName: user.name?.split(' ').slice(1).join(' ') || user.attributes?.lastName,
          groups,
          attributes: user.attributes,
        };
      }

      return null;
    } catch (error) {
      logger.error('[Authentik] Erreur lors de la récupération de l\'utilisateur', { error, email: userEmail });
      return null;
    }
  }

  /**
   * Mappe un groupe Authentik vers un rôle de l'application
   * Les groupes Authentik doivent correspondre aux noms de rôles en minuscules
   */
  mapGroupToRole(groupName: string): string | null {
    const groupToRoleMap: Record<string, string> = {
      'super_admin': 'super_admin',
      'ideas_reader': 'ideas_reader',
      'ideas_manager': 'ideas_manager',
      'events_reader': 'events_reader',
      'events_manager': 'events_manager',
    };

    return groupToRoleMap[groupName.toLowerCase()] || null;
  }

  /**
   * Détermine le rôle d'un utilisateur basé sur ses groupes Authentik
   * Priorise super_admin, puis les autres rôles
   */
  determineUserRole(groups: string[]): string {
    // Vérifier d'abord super_admin
    if (groups.some(g => this.mapGroupToRole(g) === 'super_admin')) {
      return 'super_admin';
    }

    // Sinon, prendre le premier rôle valide trouvé
    for (const group of groups) {
      const role = this.mapGroupToRole(group);
      if (role) {
        return role;
      }
    }

    // Par défaut, aucun rôle
    return 'ideas_reader';
  }
}


