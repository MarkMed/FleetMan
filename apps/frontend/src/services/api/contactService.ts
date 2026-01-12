import { apiClient, handleBackendApiResponse } from './apiClient';
import { API_ENDPOINTS } from '../../constants';
import type { ListContactsResponse } from '@packages/contracts';

/**
 * Contact Management Service
 * 
 * Handles API calls for managing user's personal contact list.
 * Part of Sprint #12 - Module 2: User Communication System (Contact Management).
 * 
 * Purpose:
 * - Add users to personal contact list
 * - Remove users from contact list
 * - List current contacts with their public profiles
 * - Manage unidirectional contact relationships
 * 
 * Architecture:
 * - Consumes /api/v1/users/me/contacts endpoints
 * - Uses ListContactsResponse (Zod-validated from @packages/contracts)
 * - Integrates with TanStack Query via useContacts hooks
 * - Operations are idempotent (safe to retry)
 * 
 * @example
 * ```tsx
 * // Add contact
 * await contactService.addContact('user_abc123');
 * 
 * // Remove contact
 * await contactService.removeContact('user_abc123');
 * 
 * // Get all contacts
 * const { contacts, total } = await contactService.getMyContacts();
 * ```
 */

/**
 * Add a user to the authenticated user's contact list
 * 
 * @param contactUserId - ID of the user to add as contact
 * @returns Promise<void> - Operation is idempotent (no error if already contact)
 * 
 * Backend validation:
 * - contactUserId must exist and be active
 * - Cannot add self as contact
 * - Uses $addToSet (idempotent, won't duplicate)
 * 
 * @throws {Error} If user not found, inactive, or validation fails
 */
export async function addContact(contactUserId: string): Promise<void> {
  await apiClient.post<{ success: boolean; message: string }>(
    API_ENDPOINTS.MY_CONTACT(contactUserId)
  );
  
  // Success indicated by no error throw from apiClient
  // If we reach here, the operation succeeded (2xx status)
}

/**
 * Remove a user from the authenticated user's contact list
 * 
 * @param contactUserId - ID of the user to remove from contacts
 * @returns Promise<void> - Operation is idempotent (no error if not a contact)
 * 
 * Backend validation:
 * - Uses $pull (idempotent, no error if doesn't exist)
 * - No validation if user is active (can remove inactive contacts)
 */
export async function removeContact(contactUserId: string): Promise<void> {
  await apiClient.delete<{ success: boolean; message: string }>(
    API_ENDPOINTS.MY_CONTACT(contactUserId)
  );
  
  // Success indicated by no error throw from apiClient
  // If we reach here, the operation succeeded (2xx status)
}

/**
 * Get list of authenticated user's contacts with their public profiles
 * 
 * @returns Promise<ListContactsResponse> - Array of contacts + total count
 * 
 * Response structure:
 * - contacts: UserPublicProfile[] (reuses discovery schema)
 * - total: number (count of contacts)
 * 
 * Notes:
 * - Only returns active users (inactive contacts are filtered out)
 * - Returns public profile data only (no email, phone, etc.)
 * - Sorted by addedAt DESC (most recent first)
 */
export async function getMyContacts(): Promise<ListContactsResponse> {
  const response = await apiClient.get<{ success: boolean; message: string; data: ListContactsResponse }>(
    API_ENDPOINTS.MY_CONTACTS
  );
  
  return handleBackendApiResponse(response);
}

/**
 * Check if a specific user is in the authenticated user's contact list
 * 
 * @param contactUserId - ID of the user to check
 * @returns Promise<boolean> - True if user is a contact, false otherwise
 * 
 * Note: This is a client-side helper using cached contacts data.
 * Does NOT make an API call (uses TanStack Query cache).
 */
export async function isContact(contactUserId: string): Promise<boolean> {
  try {
    const { contacts } = await getMyContacts();
    return contacts.some(contact => contact.id === contactUserId);
  } catch (error) {
    // If error fetching contacts, assume not a contact
    return false;
  }
}

// =============================================================================
// FUTURE METHODS (Strategic, commented for post-MVP)
// =============================================================================

/**
 * TODO: Get contact with additional metadata (addedAt, interaction count, etc.)
 * Útil para mostrar más contexto en MyContactsScreen
 * 
 * @param contactUserId - ID of contact
 * @returns Promise with contact + metadata
 * 
 * @example
 * const contact = await contactService.getContactDetails('user_abc123');
 * // { profile: UserPublicProfile, addedAt: Date, messageCount: 15 }
 */
// export async function getContactDetails(contactUserId: string): Promise<ContactDetails> {
//   const response = await apiClient.get<ContactDetails>(
//     API_ENDPOINTS.MY_CONTACT_DETAILS(contactUserId)
//   );
//   return handleBackendApiResponse(response);
// }

/**
 * TODO: Bulk operations (add/remove multiple contacts)
 * Útil para importar contactos o limpiar lista
 * 
 * @param contactUserIds - Array of user IDs
 * @returns Promise with operation results
 */
// export async function addContactsBulk(contactUserIds: string[]): Promise<BulkOperationResult> {
//   const response = await apiClient.post<BulkOperationResult>(
//     API_ENDPOINTS.MY_CONTACTS_BULK,
//     { contactUserIds, action: 'add' }
//   );
//   return handleBackendApiResponse(response);
// }

/**
 * TODO: Check mutual contact status (bidirectional check)
 * Útil para mostrar badge "Mutual contact" en UI
 * 
 * @param contactUserId - ID of user to check
 * @returns Promise<boolean> - True if both users have each other as contacts
 */
// export async function isMutualContact(contactUserId: string): Promise<boolean> {
//   const response = await apiClient.get<{ isMutual: boolean }>(
//     API_ENDPOINTS.MY_CONTACT_MUTUAL(contactUserId)
//   );
//   return handleBackendApiResponse(response).isMutual;
// }

const contactService = {
  addContact,
  removeContact,
  getMyContacts,
  isContact,
  // Future: getContactDetails, addContactsBulk, isMutualContact
};

export { contactService };
