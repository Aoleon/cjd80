/**
 * PKCE (Proof Key for Code Exchange) Utilities
 *
 * Implements RFC 7636 for OAuth 2.0 authorization code flow with PKCE.
 * Provides additional security for mobile and SPA applications.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7636
 * @see https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-proof-key-for-code-exchange-pkce
 */

/**
 * Generate cryptographically secure random string
 *
 * @param length - Length of random string (default: 128)
 * @returns Base64URL-encoded random string
 */
function generateRandomString(length: number = 128): string {
  // Use Web Crypto API (available in modern browsers and Node.js 15+)
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  // Convert to base64url encoding
  return base64UrlEncode(array);
}

/**
 * Base64URL encode (without padding)
 *
 * Standard base64 uses +, /, and = which are not URL-safe.
 * Base64URL uses -, _, and no padding.
 *
 * @param buffer - Byte array to encode
 * @returns Base64URL-encoded string
 */
function base64UrlEncode(buffer: Uint8Array): string {
  // Convert buffer to base64
  const base64 = btoa(String.fromCharCode(...buffer));

  // Convert to base64url: replace + with -, / with _, remove =
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate SHA-256 hash of input string
 *
 * @param input - String to hash
 * @returns Promise resolving to SHA-256 hash as Uint8Array
 */
async function sha256(input: string): Promise<Uint8Array> {
  // Encode string as UTF-8
  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  // Compute SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  return new Uint8Array(hashBuffer);
}

/**
 * Generate PKCE code verifier
 *
 * A code verifier is a cryptographically random string between 43-128 characters.
 * It uses unreserved characters: [A-Z] [a-z] [0-9] - . _ ~
 *
 * @returns Code verifier (base64url-encoded random string)
 */
export function generateCodeVerifier(): string {
  return generateRandomString(128);
}

/**
 * Generate PKCE code challenge from code verifier
 *
 * Two methods supported:
 * - S256 (SHA-256, recommended): challenge = BASE64URL(SHA256(verifier))
 * - plain (not recommended): challenge = verifier
 *
 * @param codeVerifier - Code verifier string
 * @param method - Challenge method ('S256' or 'plain')
 * @returns Promise resolving to code challenge
 */
export async function generateCodeChallenge(
  codeVerifier: string,
  method: 'S256' | 'plain' = 'S256',
): Promise<string> {
  if (method === 'plain') {
    // Plain method: challenge = verifier (NOT RECOMMENDED)
    return codeVerifier;
  }

  // S256 method (recommended): challenge = BASE64URL(SHA256(verifier))
  const hashed = await sha256(codeVerifier);
  return base64UrlEncode(hashed);
}

/**
 * PKCE Parameters for OAuth Authorization Request
 */
export interface PkceParams {
  /** Code verifier (store securely, send in token request) */
  codeVerifier: string;
  /** Code challenge (send in authorization request) */
  codeChallenge: string;
  /** Challenge method used (always 'S256') */
  codeChallengeMethod: 'S256';
}

/**
 * Generate PKCE parameters for OAuth flow
 *
 * Usage:
 * ```typescript
 * const pkce = await generatePkceParams();
 *
 * // Store code verifier securely (sessionStorage or memory)
 * sessionStorage.setItem('pkce_verifier', pkce.codeVerifier);
 *
 * // Include code challenge in authorization URL
 * const authUrl = `${oauthUrl}?code_challenge=${pkce.codeChallenge}&code_challenge_method=${pkce.codeChallengeMethod}`;
 * ```
 *
 * @returns Promise resolving to PKCE parameters
 */
export async function generatePkceParams(): Promise<PkceParams> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier, 'S256');

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256',
  };
}

/**
 * Store PKCE verifier securely
 *
 * Options:
 * - sessionStorage (recommended): Cleared when tab closes
 * - localStorage (less secure): Persists across sessions
 * - Memory (most secure): Cleared on page refresh
 *
 * @param codeVerifier - Code verifier to store
 * @param storage - Storage type ('session' or 'local')
 */
export function storePkceVerifier(
  codeVerifier: string,
  storage: 'session' | 'local' = 'session',
): void {
  const key = 'oauth_pkce_verifier';

  if (storage === 'session') {
    sessionStorage.setItem(key, codeVerifier);
  } else {
    localStorage.setItem(key, codeVerifier);
  }
}

/**
 * Retrieve PKCE verifier from storage
 *
 * @param storage - Storage type ('session' or 'local')
 * @returns Code verifier or null if not found
 */
export function retrievePkceVerifier(
  storage: 'session' | 'local' = 'session',
): string | null {
  const key = 'oauth_pkce_verifier';

  if (storage === 'session') {
    return sessionStorage.getItem(key);
  } else {
    return localStorage.getItem(key);
  }
}

/**
 * Clear PKCE verifier from storage
 *
 * Always call this after successful token exchange to prevent reuse.
 *
 * @param storage - Storage type ('session' or 'local')
 */
export function clearPkceVerifier(
  storage: 'session' | 'local' = 'session',
): void {
  const key = 'oauth_pkce_verifier';

  if (storage === 'session') {
    sessionStorage.removeItem(key);
  } else {
    localStorage.removeItem(key);
  }
}

/**
 * Validate code verifier format
 *
 * RFC 7636 requirements:
 * - Length: 43-128 characters
 * - Characters: [A-Z] [a-z] [0-9] - . _ ~
 *
 * @param codeVerifier - Code verifier to validate
 * @returns True if valid, false otherwise
 */
export function isValidCodeVerifier(codeVerifier: string): boolean {
  // Check length
  if (codeVerifier.length < 43 || codeVerifier.length > 128) {
    return false;
  }

  // Check characters (base64url alphabet)
  const validChars = /^[A-Za-z0-9\-._~]+$/;
  return validChars.test(codeVerifier);
}
