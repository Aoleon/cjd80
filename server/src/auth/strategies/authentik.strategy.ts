import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { logger } from '../../../lib/logger';
import { StorageService } from '../../common/storage/storage.service';
import { UserSyncService } from '../user-sync.service';

@Injectable()
export class AuthentikStrategy extends PassportStrategy(OAuth2Strategy, 'authentik') {
  constructor(
    private configService: ConfigService,
    private storageService: StorageService,
    private userSyncService: UserSyncService,
  ) {
    const authentikBaseUrl = configService.get<string>('AUTHENTIK_BASE_URL') || 'http://localhost:9002';
    const clientID = configService.get<string>('AUTHENTIK_CLIENT_ID') || '';
    const clientSecret = configService.get<string>('AUTHENTIK_CLIENT_SECRET') || '';
    const redirectURI = configService.get<string>('AUTHENTIK_REDIRECT_URI') || 'http://localhost:5000/api/auth/authentik/callback';

    if (!clientID || !clientSecret) {
      logger.warn('[Auth] AUTHENTIK_CLIENT_ID ou AUTHENTIK_CLIENT_SECRET non configuré. L\'authentification OAuth2 ne fonctionnera pas.');
    }

    super({
      authorizationURL: `${authentikBaseUrl}/application/o/authorize/`,
      tokenURL: `${authentikBaseUrl}/application/o/token/`,
      clientID,
      clientSecret,
      callbackURL: redirectURI,
      scope: ['openid', 'profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    try {
      logger.info('[Auth] Callback OAuth2 reçu', { hasAccessToken: !!accessToken });

      const authentikBaseUrl = this.configService.get<string>('AUTHENTIK_BASE_URL') || 'http://localhost:9002';
      
      // Récupérer les informations utilisateur depuis l'API Authentik avec l'accessToken
      let userProfile: any = {};
      
      try {
        // Récupérer les informations utilisateur
        const userInfoResponse = await fetch(`${authentikBaseUrl}/api/v3/core/users/me/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (userInfoResponse.ok) {
          userProfile = await userInfoResponse.json();
          logger.info('[Auth] Profil utilisateur récupéré depuis Authentik', { email: userProfile.email });
          
          // Récupérer les groupes de l'utilisateur
          if (userProfile.pk) {
            try {
              const groupsResponse = await fetch(`${authentikBaseUrl}/api/v3/core/users/${userProfile.pk}/groups/`, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              });

              if (groupsResponse.ok) {
                const groupsData = await groupsResponse.json() as { results?: Array<{ name: string }> };
                userProfile.groups = groupsData.results?.map((g) => g.name) || [];
                logger.info('[Auth] Groupes utilisateur récupérés', { groups: userProfile.groups });
              }
            } catch (groupsError) {
              logger.warn('[Auth] Impossible de récupérer les groupes', { error: groupsError });
            }
          }
        } else {
          logger.warn('[Auth] Impossible de récupérer le profil utilisateur depuis Authentik', {
            status: userInfoResponse.status,
          });
          userProfile = profile || {};
        }
      } catch (error) {
        logger.error('[Auth] Erreur lors de la récupération du profil depuis Authentik', { error });
        userProfile = profile || {};
      }

      // Synchroniser l'utilisateur
      const syncResult = await this.userSyncService.getOrCreateUserFromOAuth2(userProfile);

      if (!syncResult.success || !syncResult.user) {
        logger.error('[Auth] Erreur lors de la synchronisation de l\'utilisateur', {
          error: syncResult.error,
          profile: profile?.email || profile?.preferred_username,
        });
        throw new UnauthorizedException(syncResult.error?.message || 'Erreur lors de la synchronisation de l\'utilisateur');
      }

      const user = syncResult.user;

      if (user.status === 'pending') {
        logger.warn('[Auth] Tentative de connexion avec un compte en attente', { email: user.email });
        throw new UnauthorizedException('Votre compte est en attente de validation par un administrateur');
      }

      if (user.status === 'inactive') {
        logger.warn('[Auth] Tentative de connexion avec un compte inactif', { email: user.email });
        throw new UnauthorizedException('Votre compte a été désactivé');
      }

      logger.info('[Auth] Utilisateur authentifié avec succès', { email: user.email, role: user.role });
      return user;
    } catch (error) {
      logger.error('[Auth] Erreur dans la stratégie OAuth2', { error });
      throw error;
    }
  }
}

