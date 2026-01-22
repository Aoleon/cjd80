import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-azure-ad-oauth2';

/**
 * Azure AD OAuth Strategy with PKCE Support
 *
 * PKCE (Proof Key for Code Exchange) for Azure AD:
 * - Enhanced security for mobile and SPA apps
 * - Prevents authorization code interception
 * - No client secret exposure in public clients
 *
 * Azure AD supports PKCE natively since MSAL 2.x
 *
 * @see https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow
 * @see https://datatracker.ietf.org/doc/html/rfc7636
 */
@Injectable()
export class AzurePkceStrategy extends PassportStrategy(Strategy, 'azure-pkce') {
  constructor(private configService: ConfigService) {
    const tenantId = configService.get<string>('AZURE_TENANT_ID');

    super({
      clientID: configService.get<string>('AZURE_CLIENT_ID'),
      clientSecret: configService.get<string>('AZURE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('AZURE_CALLBACK_URL'),
      tenant: tenantId,

      // Authorization endpoint with PKCE support
      authorizationURL: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
      tokenURL: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,

      // Requested scopes
      scope: ['openid', 'profile', 'email', 'User.Read'],

      // PKCE Configuration
      pkce: 'S256', // SHA-256 code challenge method
      state: true,  // Enable state parameter for CSRF protection

      // Response mode
      responseMode: 'query', // Use query string for callback (more compatible)

      // Passthrough request
      passReqToCallback: false,
    });
  }

  /**
   * Validate OAuth response and extract user profile
   *
   * @param accessToken - OAuth access token
   * @param refreshToken - OAuth refresh token (if requested)
   * @param profile - User profile from Azure AD
   * @param done - Callback function
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    // Azure AD profile structure
    const { oid, displayName, emails, userPrincipalName, _json } = profile;

    // Extract email (Azure AD can provide email via multiple fields)
    const email = emails?.[0]?.value || userPrincipalName || _json?.email;

    // Extract name parts
    const givenName = _json?.given_name || displayName?.split(' ')[0];
    const surname = _json?.family_name || displayName?.split(' ').slice(1).join(' ');

    // Azure AD tenant information
    const tenantId = _json?.tid;

    const user = {
      azureId: oid, // Object ID (unique user identifier)
      email,
      userPrincipalName,
      name: displayName,
      givenName,
      surname,
      tenantId,
      profilePicture: undefined, // Azure AD doesn't provide photo URL by default
    };

    done(null, user);
  }
}
