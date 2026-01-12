import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMyContacts, useRemoveContact } from '@hooks/useContacts';
import { ROUTES } from '@constants';
import { modal } from '@helpers/modal';
import type { UserPublicProfile } from '@packages/contracts';

/**
 * ViewModel: MyContactsScreen Business Logic
 * 
 * Responsibilities (MVVM-lite):
 * - Manage local state (modals, selected contact)
 * - Fetch contacts data from API via hooks
 * - Handle user actions (remove contact, send message)
 * - Compute derived data (isEmpty, total count)
 * - Provide i18n access for View
 * 
 * Pattern:
 * - View (MyContactsScreen.tsx) calls this hook
 * - ViewModel returns { state, data, modals, actions, t }
 * - View renders based on ViewModel output (no business logic in View)
 * 
 * Sprint #12 - Module 2: User Communication System (Contact Management)
 * Purpose: Allow users to manage their personal contact list
 * MVP: List contacts + remove contact (send message is placeholder for Module 3)
 * 
 * @example
 * ```tsx
 * function MyContactsScreen() {
 *   const vm = useMyContactsViewModel();
 *   
 *   if (vm.state.isLoading) return <Loading />;
 *   if (vm.state.error) return <Error onRetry={vm.actions.handleRetry} />;
 *   if (vm.state.isEmpty) return <EmptyState onExplore={vm.actions.handleExploreUsers} />;
 *   
 *   return (
 *     <div>
 *       <ContactsList contacts={vm.data.contacts} onRemove={vm.actions.handleRemoveContact} />
 *       <ConfirmRemoveContactModal {...vm.modals.remove} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useMyContactsViewModel() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ========================
  // STATE MANAGEMENT
  // ========================
  
  // Selected contact for removal (shown in confirmation modal)
  const [selectedContact, setSelectedContact] = useState<UserPublicProfile | null>(null);
  
  // Remove confirmation modal visibility
  const isRemoveModalOpen = selectedContact !== null;

  // ========================
  // DATA FETCHING
  // ========================
  
  // Fetch contacts from API
  const { data, isLoading, error, refetch } = useMyContacts();
  
  // Remove contact mutation
  const removeContactMutation = useRemoveContact();

  // ========================
  // DERIVED STATE
  // ========================
  
  const contacts = data?.contacts || [];
  const total = data?.total || 0;
  const isEmpty = !isLoading && contacts.length === 0;

  // ========================
  // BUSINESS LOGIC ACTIONS
  // ========================
  
  /**
   * Handle remove contact button click
   * Opens confirmation modal with selected contact
   * 
   * @param userId - ID of contact to remove
   */
  const handleRemoveContact = (userId: string) => {
    const contact = contacts.find(c => c.id === userId);
    if (contact) {
      setSelectedContact(contact);
    }
  };

  /**
   * Confirm removal of selected contact
   * Executes removeContactMutation and closes modal on success
   */
  const handleConfirmRemove = () => {
    if (!selectedContact) return;

    const companyName = selectedContact.profile.companyName || t('users.discovery.noCompanyName');
    removeContactMutation.mutate({ userId: selectedContact.id, companyName }, {
      onSuccess: () => {
        // Close modal and clear selection
        setSelectedContact(null);
        // Note: useRemoveContact hook handles toast notification and cache invalidation
      },
      onError: () => {
        // Note: useRemoveContact hook handles error toast
        // Keep modal open to allow retry
      }
    });
  };

  /**
   * Remove contact directly by ID (for global modal integration)
   * 
   * This method bypasses the selectedContact state and works directly with IDs.
   * Used when integrating with global modal system to avoid duplicate modal logic (DRY).
   * 
   * UX Flow:
   * 1. Show loading modal while processing
   * 2. On success: Hide modal (toast handled by useRemoveContact hook)
   * 3. On error: Hide loading, show error modal with retry option
   * 
   * @param contactId - ID of contact to remove
   * @returns Promise that resolves when removal completes
   */
  const handleRemoveContactDirect = async (contactId: string): Promise<void> => {
    // Get contact info for error modal
    const contact = contacts.find(c => c.id === contactId);
    const companyName = contact?.profile.companyName || t('users.discovery.noCompanyName');
    
    return new Promise((resolve, reject) => {
      // Show loading modal
      modal.showLoading(t('users.contacts.removing'));
      
      removeContactMutation.mutate({ userId: contactId, companyName }, {
        onSuccess: () => {
          
          // Note: Success toast is handled automatically by useRemoveContact hook
          // Note: Cache invalidation is handled automatically by useRemoveContact hook
          
          // Wait for modal transition to complete, then resolve
          // This ensures proper sequencing: modal closes → toast shows (from hook)
          setTimeout(() => {
          // Hide loading modal
          	modal.hide();
            resolve();
          }, 1000);
        },
        onError: (error: any) => {
          // Hide loading modal first
          modal.hide();
          
          // Extract error message
          const errorMessage = error?.response?.data?.message 
            || error?.message 
            || t('users.contacts.removeError');
          
          // Show error modal with detailed message
          setTimeout(() => {
            modal.showFeedback({
              variant: 'danger',
              title: t('users.contacts.removeErrorTitle'),
              description: t('users.contacts.removeErrorMessage', { 
                companyName,
                error: errorMessage 
              }),
              actionLabel: t('common.close'),
              showCancel: false,
            });
          }, 500); // Small delay to ensure loading modal is fully closed
          
          reject(error);
        }
      });
    });
  };

  // TODO: Optimistic UI for instant feedback (post-MVP enhancement)
  // Instead of showing loading modal, optimistically remove contact from list immediately
  // and rollback if error occurs. This provides instant feedback and better perceived performance.
  //
  // Implementation strategy:
  // 1. Immediately remove contact from local state
  // 2. Show subtle toast "Removing contact..."
  // 3. Execute mutation in background
  // 4. If success: Toast "Contact removed" (already in UI)
  // 5. If error: Restore contact to list + show error modal
  //
  // Example code:
  // const handleRemoveContactOptimistic = async (contactId: string) => {
  //   const contact = contacts.find(c => c.id === contactId);
  //   if (!contact) return;
  //   
  //   // Optimistically update cache
  //   queryClient.setQueryData(QUERY_KEYS.CONTACTS, (old) => ({
  //     contacts: old.contacts.filter(c => c.id !== contactId),
  //     total: old.total - 1
  //   }));
  //   
  //   try {
  //     await removeContactMutation.mutateAsync(contactId);
  //   } catch (error) {
  //     // Rollback on error
  //     queryClient.setQueryData(QUERY_KEYS.CONTACTS, (old) => ({
  //       contacts: [...old.contacts, contact],
  //       total: old.total + 1
  //     }));
  //     // Show error modal
  //   }
  // };

  /**
   * Cancel removal (close modal without action)
   */
  const handleCancelRemove = () => {
    setSelectedContact(null);
  };

  /**
   * Handle send message button click
   * 
   * Module 3: Navigate to chat screen
   * 
   * @param userId - ID of contact to message
   */
  const handleSendMessage = (userId: string) => {
    console.log('📨 [My Contacts] Opening chat with:', userId);
    navigate(ROUTES.CHAT(userId));
    // Or: setMessageComposerOpen(true); setMessageRecipient(userId);
  };

  /**
   * Navigate to user discovery screen
   * Called from empty state "Explore Users" button
   */
  const handleExploreUsers = () => {
    navigate(ROUTES.CONTACT_DISCOVERY);
  };

  /**
   * Retry fetching contacts (useful for error states)
   */
  const handleRetry = () => {
    refetch();
  };

  // ========================
  // VIEW MODEL OUTPUT
  // ========================
  
  return {
    // State flags
    state: {
      isLoading,
      error: error as Error | null,
      isEmpty,
      isRemovingContact: removeContactMutation.isPending,
    },
    
    // Data for rendering
    data: {
      contacts,
      total,
    },
    
    // Modal states and props
    modals: {
      remove: {
        isOpen: isRemoveModalOpen,
        contact: selectedContact,
        onConfirm: handleConfirmRemove,
        onCancel: handleCancelRemove,
        isLoading: removeContactMutation.isPending,
      },
    },
    
    // User actions
    actions: {
      handleRemoveContact, // Open confirmation modal (old pattern)
      handleConfirmRemove, // Confirm removal (old pattern with ConfirmRemoveContactModal)
      handleCancelRemove, // Cancel removal (old pattern with ConfirmRemoveContactModal)
      handleRemoveContactDirect, // Direct removal by ID (new pattern for global modal - DRY)
      handleSendMessage, // Send message to contact (Module 3 placeholder)
      handleExploreUsers, // Navigate to discovery screen
      handleRetry, // Retry fetching contacts
    },
    
    // i18n helper
    t,
  };
}

// ========================
// TYPE EXPORTS
// ========================

export type MyContactsViewModel = ReturnType<typeof useMyContactsViewModel>;

// =============================================================================
// FUTURE ENHANCEMENTS (Strategic, commented for post-MVP)
// =============================================================================

/**
 * TODO: Add search/filter functionality
 * Útil cuando usuario tiene muchos contactos (>50)
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const filteredContacts = contacts.filter(c => 
 *   c.profile.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
 * );
 */

/**
 * TODO: Add sorting options (by name, date added, type, last interaction)
 * Útil para organizar lista de contactos
 * 
 * @example
 * const [sortBy, setSortBy] = useState<'name' | 'date' | 'type'>('name');
 * const sortedContacts = [...contacts].sort((a, b) => {
 *   if (sortBy === 'name') return a.profile.companyName.localeCompare(b.profile.companyName);
 *   // ...
 * });
 */

/**
 * TODO: Add bulk actions (remove multiple contacts, export list)
 * Útil para gestión masiva de contactos
 * 
 * @example
 * const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
 * const handleBulkRemove = () => {
 *   removeBulkMutation.mutate(selectedContacts);
 * };
 */

/**
 * TODO: Add contact groups/tags (categorize contacts)
 * Útil para organizar contactos por proyecto, región, servicio, etc.
 * 
 * @example
 * const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
 * const groupedContacts = contacts.filter(c => 
 *   !selectedGroup || c.groups?.includes(selectedGroup)
 * );
 */

/**
 * TODO: Add favorite contacts (pin to top)
 * Útil para acceso rápido a contactos frecuentes
 * 
 * @example
 * const favoriteContacts = contacts.filter(c => c.isFavorite);
 * const regularContacts = contacts.filter(c => !c.isFavorite);
 */

/**
 * TODO: Add contact statistics modal (interaction history)
 * Útil para ver historial de mensajes, llamadas, etc.
 * 
 * @example
 * const [statsContact, setStatsContact] = useState<UserPublicProfile | null>(null);
 * const handleViewStats = (userId: string) => {
 *   const contact = contacts.find(c => c.id === userId);
 *   setStatsContact(contact);
 * };
 */
