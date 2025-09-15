/**
 * User Identity Management Utility
 * Manages user name and email storage in localStorage only (for privacy and security)
 * Previous version stored data in cookies which exposed personal information unnecessarily
 */

export interface UserIdentity {
  name: string;
  email: string;
  version: number;
}

const CURRENT_VERSION = 1;
const LOCALSTORAGE_NAME_KEY = 'cjdUserName';
const LOCALSTORAGE_EMAIL_KEY = 'cjdUserEmail';

/**
 * Reads user identity from localStorage only (secure approach)
 * @returns UserIdentity object or null if not found or invalid
 */
export function getIdentity(): UserIdentity | null {
  try {
    const name = localStorage.getItem(LOCALSTORAGE_NAME_KEY);
    const email = localStorage.getItem(LOCALSTORAGE_EMAIL_KEY);
    
    if (name && email) {
      const identity: UserIdentity = {
        name,
        email,
        version: CURRENT_VERSION
      };
      
      // Validate the identity before returning it
      if (isValidIdentity(identity)) {
        return identity;
      } else {
        console.warn('Invalid user identity found in localStorage, clearing it');
        clearIdentity();
      }
    }
  } catch (error) {
    console.warn('Failed to read user identity:', error);
  }

  return null;
}

/**
 * Saves user identity to localStorage only (secure approach)
 * @param identity UserIdentity object to save
 */
export function saveIdentity(identity: UserIdentity): void {
  try {
    // Validate identity before saving
    if (!isValidIdentity(identity)) {
      throw new Error('Invalid user identity provided');
    }

    // Save to localStorage only
    localStorage.setItem(LOCALSTORAGE_NAME_KEY, identity.name.trim());
    localStorage.setItem(LOCALSTORAGE_EMAIL_KEY, identity.email.trim().toLowerCase());
  } catch (error) {
    console.error('Failed to save user identity:', error);
    throw new Error('Could not save user identity');
  }
}

/**
 * Clears user identity from localStorage only (secure approach)
 */
export function clearIdentity(): void {
  try {
    localStorage.removeItem(LOCALSTORAGE_NAME_KEY);
    localStorage.removeItem(LOCALSTORAGE_EMAIL_KEY);
  } catch (error) {
    console.error('Failed to clear user identity:', error);
    throw new Error('Could not clear user identity');
  }
}


/**
 * Utility function to create a UserIdentity object
 * @param name User's name
 * @param email User's email
 * @returns UserIdentity object
 */
export function createUserIdentity(name: string, email: string): UserIdentity {
  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    version: CURRENT_VERSION
  };
}

/**
 * Validates if a UserIdentity object has valid data
 * @param identity UserIdentity object to validate
 * @returns true if valid, false otherwise
 */
export function isValidIdentity(identity: UserIdentity | null): identity is UserIdentity {
  return !!(
    identity && 
    identity.name && 
    identity.name.trim().length > 0 &&
    identity.email && 
    identity.email.trim().length > 0 &&
    identity.email.includes('@')
  );
}