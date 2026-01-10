import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from './useToast';
import { contactService } from '@services/api/contactService';
import { truncateText } from '@utils';
import { QUERY_KEYS } from '@constants';
import type { ListContactsResponse, UserPublicProfile } from '@packages/contracts';

export type { ListContactsResponse, UserPublicProfile };

/**
 * Hook: Get authenticated user's contact list
 * 
 * Fetches list of contacts with their public profiles.
 * Part of Sprint #12 - Module 2: User Communication System (Contact Management).
 * 
 * Features:
 * - Returns array of UserPublicProfile (reuses discovery schema)
 * - Only includes active users (inactive filtered by backend)
 * - Cached for 5 minutes (contacts don't change frequently)
 * - Automatically refetches on window focus
 * 
 * @param options - TanStack Query options (enabled, staleTime, etc.)
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { data, isLoading, error } = useMyContacts();
 * 
 * // data structure:
 * // {
 * //   contacts: UserPublicProfile[], // Array of contact profiles
 * //   total: 5                        // Total count of contacts
 * // }
 * 
 * // Conditional fetching
 * const { data } = useMyContacts({ enabled: isAuthenticated });
 * 
 * // Manual refetch
 * const { data, refetch } = useMyContacts();
 * refetch(); // Manually refetch contacts
 * ```
 */
export const useMyContacts = (options?: { enabled?: boolean }) => {
  return useQuery<ListContactsResponse>({
    queryKey: QUERY_KEYS.CONTACTS,
    queryFn: contactService.getMyContacts,
    enabled: options?.enabled !== false,
    staleTime: 0, // CRITICAL: Always consider data stale to avoid showing outdated contacts
    gcTime: 5 * 60 * 1000, // 5 minutes cache (reduced from 15min to avoid stale data confusion)
    refetchOnMount: 'always', // CRITICAL: Always refetch on mount to ensure fresh data
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook: Add user to contact list (Mutation)
 * 
 * Adds a user to the authenticated user's personal contact list.
 * Operation is idempotent (safe to call multiple times).
 * 
 * Features:
 * - Shows success toast notification
 * - Invalidates contacts cache (triggers refetch)
 * - Invalidates user discovery cache (updates "Add Contact" button state)
 * - Handles errors with toast notifications
 * - Optimistic updates optional (commented for MVP simplicity)
 * 
 * @example
 * ```tsx
 * const addContact = useAddContact();
 * 
 * // Add contact with userId
 * addContact.mutate('user_abc123', {
 *   onSuccess: () => {
 *     console.log('Contact added successfully');
 *   },
 *   onError: (error) => {
 *     console.error('Failed to add contact:', error);
 *   }
 * });
 * 
 * // Check loading state
 * {addContact.isPending && <Spinner />}
 * 
 * // Disable button during mutation
 * <Button disabled={addContact.isPending} onClick={() => addContact.mutate(userId)}>
 *   {addContact.isPending ? 'Agregando...' : 'Agregar Contacto'}
 * </Button>
 * ```
 */
export const useAddContact = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ userId, companyName }: { userId: string; companyName: string }) => 
      contactService.addContact(userId),
    onSuccess: (_, variables) => {
      // Invalidate contacts cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTACTS });
      
      // Invalidate discovery cache to update "Add Contact" button state
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_DISCOVERY });
      
      // Show success toast with company name (truncated for readability)
      const truncatedName = truncateText(variables.companyName, 35);
      toast.success({
        title: t('users.contacts.addSuccess', { companyName: truncatedName }),
        duration: 3000,
      });
    },
    onError: (error: any) => {
      // Show error toast with message
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
      toast.error({title: t('users.contacts.addError', { message: errorMessage }), duration: 3000});
    },
    // TODO: Optimistic updates (optional - mejora UX pero agrega complejidad)
    // onMutate: async (contactUserId) => {
    //   // Cancel outgoing refetches
    //   await queryClient.cancelQueries({ queryKey: QUERY_KEYS.CONTACTS });
    //   
    //   // Snapshot previous value
    //   const previousContacts = queryClient.getQueryData<ListContactsResponse>(QUERY_KEYS.CONTACTS);
    //   
    //   // Optimistically update cache (add contact immediately)
    //   if (previousContacts) {
    //     // Need to fetch user profile to add to list - complex, skip for MVP
    //   }
    //   
    //   return { previousContacts };
    // },
    // onError: (err, variables, context) => {
    //   // Rollback on error
    //   if (context?.previousContacts) {
    //     queryClient.setQueryData(QUERY_KEYS.CONTACTS, context.previousContacts);
    //   }
    // },
  });
};

/**
 * Hook: Remove user from contact list (Mutation)
 * 
 * Removes a user from the authenticated user's personal contact list.
 * Operation is idempotent (no error if user is not a contact).
 * 
 * Features:
 * - Shows success toast notification
 * - Invalidates contacts cache (triggers refetch)
 * - Handles errors with toast notifications
 * - Optimistic updates optional (for smooth UX)
 * 
 * @example
 * ```tsx
 * const removeContact = useRemoveContact();
 * 
 * // Remove contact
 * removeContact.mutate('user_abc123', {
 *   onSuccess: () => {
 *     console.log('Contact removed');
 *   }
 * });
 * 
 * // With confirmation modal
 * const handleRemove = () => {
 *   if (confirm('¿Eliminar contacto?')) {
 *     removeContact.mutate(userId);
 *   }
 * };
 * ```
 */
export const useRemoveContact = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ userId, companyName }: { userId: string; companyName: string }) => 
      contactService.removeContact(userId),
    onSuccess: (_, variables) => {
      // Invalidate contacts cache
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTACTS });
      
      // Show success toast with company name (truncated for readability)
      const truncatedName = truncateText(variables.companyName, 35);
      toast.success({
        title: t('users.contacts.removeSuccess', { companyName: truncatedName }),
        duration: 3000,
      });
    },
    onError: (error: any) => {
      // Show error toast
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
      toast.error({title: t('users.contacts.removeErrorTitle'), description: t('users.contacts.removeError', { message: errorMessage }), duration: 3000});
    },
    // TODO: Optimistic updates (opcional - para UX más fluido)
    // onMutate: async (contactUserId) => {
    //   await queryClient.cancelQueries({ queryKey: QUERY_KEYS.CONTACTS });
    //   
    //   const previousContacts = queryClient.getQueryData<ListContactsResponse>(QUERY_KEYS.CONTACTS);
    //   
    //   // Optimistically remove from list
    //   if (previousContacts) {
    //     queryClient.setQueryData<ListContactsResponse>(QUERY_KEYS.CONTACTS, {
    //       contacts: previousContacts.contacts.filter(c => c.id !== contactUserId),
    //       total: previousContacts.total - 1
    //     });
    //   }
    //   
    //   return { previousContacts };
    // },
    // onError: (err, variables, context) => {
    //   // Rollback on error
    //   if (context?.previousContacts) {
    //     queryClient.setQueryData(QUERY_KEYS.CONTACTS, context.previousContacts);
    //   }
    // },
  });
};

/**
 * Pure Function: Check if user is in contacts array
 * 
 * This is a PURE FUNCTION (not a hook) that can be safely used inside loops,
 * conditions, or callbacks without violating React's Rules of Hooks.
 * 
 * Use this when you already have the contacts array (e.g., from useMyContacts).
 * For simple cases outside loops, use the `useIsContact` hook instead.
 * 
 * @param userId - ID of user to check
 * @param contacts - Array of contact profiles to search in
 * @returns boolean - True if userId exists in contacts array
 * 
 * Performance: O(n) linear search. For better performance with large lists,
 * use a Set of IDs (see useUserDiscoveryViewModel implementation).
 * 
 * @example
 * ```tsx
 * // ✅ Safe to use in loops (pure function, not a hook)
 * {users.map(user => {
 *   const isContact = isUserInContacts(user.id, myContacts);
 *   return <UserCard isContact={isContact} />;
 * })}
 * ```
 */
export const isUserInContacts = (userId: string, contacts: UserPublicProfile[]): boolean => {
  return contacts.some(contact => contact.id === userId);
};

/**
 * Helper Hook: Check if user is a contact (convenience wrapper)
 * 
 * This is a React Hook that fetches contacts and checks if userId exists.
 * Cannot be used inside loops, conditions, or callbacks (Rules of Hooks).
 * 
 * For loops, use the pure function `isUserInContacts(userId, contacts)` instead.
 * 
 * @param userId - ID of user to check
 * @returns boolean - True if user is in contact list
 * 
 * @example
 * ```tsx
 * // ✅ Safe: Top-level hook call
 * const isContact = useIsContact('user_abc123');
 * 
 * // ❌ WRONG: Hook inside loop (violates Rules of Hooks)
 * {users.map(user => {
 *   const isContact = useIsContact(user.id); // ❌ ERROR!
 * })}
 * ```
 */
export const useIsContact = (userId: string): boolean => {
  const { data } = useMyContacts({ enabled: true });
  return isUserInContacts(userId, data?.contacts ?? []);
};

// =============================================================================
// FUTURE HOOKS (Strategic, commented for post-MVP)
// =============================================================================

/**
 * TODO: Hook for bulk operations (add/remove multiple contacts)
 * Útil para importar/exportar contactos o limpieza masiva
 * 
 * @example
 * const addBulk = useAddContactsBulk();
 * addBulk.mutate(['user1', 'user2', 'user3']);
 */
// export const useAddContactsBulk = () => {
//   const queryClient = useQueryClient();
//   const { t } = useTranslation();
//   
//   return useMutation({
//     mutationFn: (contactUserIds: string[]) => contactService.addContactsBulk(contactUserIds),
//     onSuccess: (result) => {
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTACTS });
//       toast.success(t('users.contacts.bulkAddSuccess', { count: result.successCount }));
//     }
//   });
// };

/**
 * TODO: Hook to check mutual contact status
 * Útil para mostrar badge especial "Contacto mutuo"
 * 
 * @example
 * const isMutual = useIsMutualContact('user_abc123');
 * {isMutual && <Badge>Contacto Mutuo</Badge>}
 */
// export const useIsMutualContact = (userId: string) => {
//   return useQuery({
//     queryKey: ['contacts', 'mutual', userId],
//     queryFn: () => contactService.isMutualContact(userId),
//     staleTime: 10 * 60 * 1000, // 10 minutes
//   });
// };

/**
 * TODO: Advanced performance optimization with memoized Set
 * For large contact lists (100+ contacts), create a stable Set reference
 * that only updates when contacts array changes, preventing unnecessary re-renders
 * 
 * Implementation:
 */
// const useContactIdsSet = (): Set<string> => {
//   const { data } = useMyContacts();
//   
//   return useMemo(() => {
//     const ids = new Set<string>();
//     data?.contacts.forEach(contact => ids.add(contact.id));
//     return ids;
//   }, [data?.contacts]);
// };
//
// // Usage in component:
// const contactIds = useContactIdsSet();
// const isContact = contactIds.has(userId); // O(1) lookup

/**
 * TODO: WeakMap-based caching for contact metadata
 * Store additional computed data about contacts without causing memory leaks
 * WeakMap allows garbage collection when contact objects are no longer referenced
 * 
 * Use case: Rich contact cards with computed statistics
 */
// const contactMetadataCache = new WeakMap<UserPublicProfile, {
//   displayName: string;
//   lastInteractionDate?: Date;
//   messageCount: number;
//   isFavorite: boolean;
// }>();
//
// export const getContactMetadata = (contact: UserPublicProfile) => {
//   if (!contactMetadataCache.has(contact)) {
//     contactMetadataCache.set(contact, {
//       displayName: contact.profile.companyName || 'Unknown',
//       messageCount: 0,
//       isFavorite: false
//     });
//   }
//   return contactMetadataCache.get(contact)!;
// };

/**
 * TODO: Contact groups/tags management
 * Allow users to organize contacts into custom groups
 * 
 * Example: "Favorite Providers", "Emergency Contacts", "Regular Clients"
 */
// export const useContactGroups = () => {
//   return useQuery({
//     queryKey: ['contacts', 'groups'],
//     queryFn: () => contactService.getContactGroups(),
//     staleTime: 10 * 60 * 1000
//   });
// };
//
// export const useAddToGroup = () => {
//   const queryClient = useQueryClient();
//   
//   return useMutation({
//     mutationFn: ({ contactId, groupId }: { contactId: string; groupId: string }) =>
//       contactService.addContactToGroup(contactId, groupId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['contacts', 'groups'] });
//     }
//   });
// };
