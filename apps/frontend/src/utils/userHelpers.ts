import type { CreateUserResponse } from '@contracts';

/**
 * User Helper Utilities
 * 
 * Centralized functions for user-related UI logic.
 * Extracted from UserProfileButton and NavigationDrawer to follow DRY principle.
 */

/**
 * Extract avatar letter from user email
 * Returns the first character of the email in uppercase
 * 
 * @param email - User's email address
 * @returns Single uppercase letter, or '?' if email is empty/invalid
 * 
 * @example
 * ```ts
 * getAvatarLetter('john@example.com') // 'J'
 * getAvatarLetter('') // '?'
 * getAvatarLetter(undefined) // '?'
 * ```
 */
export function getAvatarLetter(email: string | undefined): string {
  if (!email || email.length === 0) {
    return '?';
  }
  return email[0].toUpperCase();
}

/**
 * Get user display name with fallback strategy
 * Priority: companyName > email username > email
 * 
 * @param user - User object from auth store
 * @returns Display name string
 * 
 * @example
 * ```ts
 * getUserDisplayName({ email: 'john@example.com', profile: { companyName: 'ACME Corp' } })
 * // Returns: 'ACME Corp'
 * 
 * getUserDisplayName({ email: 'john@example.com', profile: {} })
 * // Returns: 'john'
 * 
 * getUserDisplayName({ email: 'john@example.com' })
 * // Returns: 'john'
 * ```
 */
export function getUserDisplayName(user: CreateUserResponse | null): string {
  if (!user) {
    return '';
  }
  
  // Priority 1: Company name if available
  if (user.profile?.companyName) {
    return user.profile.companyName;
  }
  
  // Priority 2: Extract username from email (before @)
  if (user.email && user.email.includes('@')) {
    return user.email.split('@')[0];
  }
  
  // Priority 3: Full email as fallback
  return user.email || '';
}
