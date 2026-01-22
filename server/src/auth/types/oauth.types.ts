/**
 * OAuth Type Definitions (Hardened)
 *
 * Provides strict TypeScript types for OAuth implementation with:
 * - Runtime type safety
 * - JSDoc documentation
 * - Branded types for security
 * - Discriminated unions for error handling
 *
 * @module oauth.types
 */

/**
 * OAuth Provider Types
 */
export type OAuthProvider = 'google' | 'azure';

/**
 * OAuth Error Codes
 *
 * Standard OAuth 2.0 error codes + custom application errors
 * @see https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2.1
 */
export type OAuthErrorCode =
  // Standard OAuth 2.0 errors
  | 'access_denied'
  | 'invalid_request'
  | 'unauthorized_client'
  | 'unsupported_response_type'
  | 'invalid_scope'
  | 'server_error'
  | 'temporarily_unavailable'
  | 'invalid_grant'
  // Custom application errors
  | 'state_mismatch'
  | 'authentication_failed'
  | 'account_conflict'
  | 'token_expired'
  | 'service_unavailable'
  | 'request_timeout'
  | 'invalid_oauth_response';

/**
 * OAuth Error Details
 */
export interface OAuthError {
  /** Error code */
  code: OAuthErrorCode;
  /** Human-readable error message */
  message: string;
  /** Optional hint for user */
  hint?: string;
  /** OAuth provider name */
  provider: OAuthProvider;
  /** Error description from provider */
  providerError?: string;
  /** Timestamp */
  timestamp: Date;
}

/**
 * Branded type for OAuth ID
 * Prevents accidental mixing of Google ID with Azure ID
 */
export type GoogleId = string & { __brand: 'GoogleId' };
export type AzureId = string & { __brand: 'AzureId' };
export type UserId = string & { __brand: 'UserId' };

/**
 * Helper functions to create branded types
 */
export const asGoogleId = (id: string): GoogleId => id as GoogleId;
export const asAzureId = (id: string): AzureId => id as AzureId;
export const asUserId = (id: string): UserId => id as UserId;

/**
 * Google OAuth Profile
 *
 * Data received from Google OAuth callback
 */
export interface GoogleOAuthProfile {
  /** Google user ID (sub claim) */
  googleId: GoogleId;
  /** Primary email */
  email: string;
  /** Email verified flag */
  emailVerified?: boolean;
  /** Display name */
  name?: string;
  /** Given name */
  givenName?: string;
  /** Family name */
  familyName?: string;
  /** Profile picture URL */
  profilePicture?: string;
  /** Locale */
  locale?: string;
}

/**
 * Azure OAuth Profile
 *
 * Data received from Azure AD OAuth callback
 */
export interface AzureOAuthProfile {
  /** Azure Object ID (oid claim) */
  azureId: AzureId;
  /** Primary email */
  email: string;
  /** User Principal Name */
  userPrincipalName?: string;
  /** Display name */
  name?: string;
  /** Given name */
  givenName?: string;
  /** Surname */
  surname?: string;
  /** Azure Tenant ID */
  tenantId: string;
  /** Profile picture URL (not provided by Azure AD by default) */
  profilePicture?: string;
}

/**
 * OAuth User (Discriminated Union)
 *
 * Union type for OAuth profiles with type discrimination
 */
export type OAuthUser =
  | ({ provider: 'google' } & GoogleOAuthProfile)
  | ({ provider: 'azure' } & AzureOAuthProfile);

/**
 * OAuth Authentication Result
 *
 * Returned after successful OAuth authentication
 */
export interface OAuthAuthResult {
  /** JWT access token */
  access_token: string;
  /** Token type (always "Bearer") */
  token_type: 'Bearer';
  /** Token expiration (seconds) */
  expires_in: number;
  /** User information */
  user: {
    /** User ID */
    id: UserId;
    /** Email */
    email: string;
    /** Display name */
    name: string | null;
    /** User role */
    role: string;
  };
  /** OAuth provider used */
  provider: OAuthProvider;
  /** Whether this is a new user (registered) or existing (logged in) */
  isNewUser: boolean;
}

/**
 * OAuth Link Result
 *
 * Returned after successfully linking OAuth account
 */
export interface OAuthLinkResult {
  /** Success message */
  message: string;
  /** Linked provider */
  provider: OAuthProvider;
  /** Linked OAuth ID */
  oauthId: GoogleId | AzureId;
  /** Linked email */
  linkedEmail: string;
  /** Link timestamp */
  linkedAt: Date;
}

/**
 * OAuth Unlink Result
 *
 * Returned after successfully unlinking OAuth account
 */
export interface OAuthUnlinkResult {
  /** Success message */
  message: string;
  /** Unlinked provider */
  provider: OAuthProvider;
  /** Remaining auth methods */
  remainingAuthMethods: Array<'password' | 'google' | 'azure'>;
}

/**
 * OAuth Callback Query Parameters
 *
 * Expected query params in OAuth callback URL
 */
export interface OAuthCallbackQuery {
  /** Authorization code (success) */
  code?: string;
  /** State parameter (CSRF protection) */
  state?: string;
  /** Error code (failure) */
  error?: OAuthErrorCode;
  /** Error description */
  error_description?: string;
  /** Error URI (additional info) */
  error_uri?: string;
}

/**
 * OAuth State Parameter
 *
 * Stored state for CSRF protection
 * (Managed by Passport automatically, but type defined for reference)
 */
export interface OAuthState {
  /** Random nonce */
  nonce: string;
  /** Original request URL (for redirect after auth) */
  returnTo?: string;
  /** Session ID */
  sessionId?: string;
  /** Timestamp */
  timestamp: number;
}

/**
 * OAuth Metrics
 *
 * Metrics for monitoring OAuth performance
 */
export interface OAuthMetrics {
  /** OAuth provider */
  provider: OAuthProvider;
  /** Success/failure */
  status: 'success' | 'failure';
  /** Request duration (ms) */
  duration: number;
  /** Error code (if failed) */
  errorCode?: OAuthErrorCode;
  /** User agent */
  userAgent: string;
  /** IP address */
  ip: string;
  /** Timestamp */
  timestamp: Date;
}

/**
 * OAuth Configuration
 *
 * Configuration options for OAuth strategies
 */
export interface OAuthConfig {
  /** OAuth provider */
  provider: OAuthProvider;
  /** Client ID */
  clientId: string;
  /** Client Secret */
  clientSecret: string;
  /** Callback URL */
  callbackUrl: string;
  /** Scopes */
  scopes: string[];
  /** Tenant ID (Azure only) */
  tenantId?: string;
  /** PKCE enabled */
  pkce?: boolean;
}

/**
 * User Database Record with OAuth Fields
 *
 * Extended user type with OAuth fields
 */
export interface UserWithOAuth {
  /** User ID */
  id: UserId;
  /** Email */
  email: string;
  /** Password hash (nullable for OAuth-only users) */
  password: string | null;
  /** Display name */
  name: string | null;
  /** User role */
  role: string;
  /** Active status */
  isActive: boolean;

  // Google OAuth fields
  /** Google ID */
  googleId: GoogleId | null;
  /** Google email */
  googleEmail: string | null;
  /** Google profile picture */
  googleProfilePicture: string | null;
  /** Google linked timestamp */
  googleLinkedAt: Date | null;

  // Azure OAuth fields
  /** Azure Object ID */
  azureId: AzureId | null;
  /** Azure email */
  azureEmail: string | null;
  /** Azure tenant ID */
  azureTenantId: string | null;
  /** Azure profile picture */
  azureProfilePicture: string | null;
  /** Azure linked timestamp */
  azureLinkedAt: Date | null;

  /** Created timestamp */
  createdAt: Date;
  /** Updated timestamp */
  updatedAt: Date;
}

/**
 * Type Guard: Check if user has password
 */
export function hasPassword(user: UserWithOAuth): user is UserWithOAuth & { password: string } {
  return user.password !== null && user.password.length > 0;
}

/**
 * Type Guard: Check if user has Google OAuth
 */
export function hasGoogleOAuth(user: UserWithOAuth): user is UserWithOAuth & { googleId: GoogleId } {
  return user.googleId !== null;
}

/**
 * Type Guard: Check if user has Azure OAuth
 */
export function hasAzureOAuth(user: UserWithOAuth): user is UserWithOAuth & { azureId: AzureId } {
  return user.azureId !== null;
}

/**
 * Get available auth methods for user
 */
export function getAuthMethods(user: UserWithOAuth): Array<'password' | 'google' | 'azure'> {
  const methods: Array<'password' | 'google' | 'azure'> = [];

  if (hasPassword(user)) methods.push('password');
  if (hasGoogleOAuth(user)) methods.push('google');
  if (hasAzureOAuth(user)) methods.push('azure');

  return methods;
}

/**
 * Check if user can unlink provider (has alternative auth method)
 */
export function canUnlinkProvider(
  user: UserWithOAuth,
  provider: OAuthProvider,
): { canUnlink: boolean; reason?: string } {
  const methods = getAuthMethods(user);

  // Remove current provider from list
  const remainingMethods = methods.filter(m => m !== provider);

  if (remainingMethods.length === 0) {
    return {
      canUnlink: false,
      reason: `Cannot unlink ${provider}. User must have at least one authentication method (password or another OAuth provider).`,
    };
  }

  return { canUnlink: true };
}
