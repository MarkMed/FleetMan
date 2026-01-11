import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMyContacts } from '@hooks/useContacts';
import { useMessagingStore } from '@store';
import type { UserPublicProfile } from '@packages/contracts';

/**
 * ViewModel: ConversationsListScreen Business Logic
 * 
 * Responsibilities (MVVM-lite):
 * - Fetch contacts list (all contacts are potential conversations)
 * - Access unread counters from Zustand
 * - Handle search/filter for contacts
 * - Navigate to specific chat
 * - Provide i18n access for View
 * 
 * MVP Scope:
 * - ✅ Show ALL contacts as conversations
 * - ✅ Display unread badge from client-side counter
 * - ❌ NO last message preview (no backend endpoint)
 * - ❌ NO last activity sorting
 * - ❌ NO conversation filtering (all/unread/archived)
 * 
 * Architecture:
 * - View (ConversationsListScreen.tsx) calls this hook
 * - ViewModel returns { state, data, actions, t }
 * - View renders based on ViewModel output
 * 
 * Pattern (Opción B per backend bot):
 * - No specific "active conversations" endpoint
 * - Fetch all contacts from Module 2 endpoint
 * - Display all contacts as potential conversations
 * - Show unread badge if messages exist
 * 
 * @example
 * ```tsx
 * function ConversationsListScreen() {
 *   const vm = useConversationsListViewModel();
 *   
 *   if (vm.state.isLoading) return <Loading />;
 *   if (vm.data.isEmpty) return <EmptyState />;
 *   
 *   return (
 *     <>
 *       <SearchBar value={vm.filters.search} onChange={vm.actions.handleSearchChange} />
 *       {vm.data.conversations.map(contact => (
 *         <ConversationPreview
 *           key={contact.id}
 *           contact={contact}
 *           unreadCount={vm.data.unreadCounts[contact.id]}
 *           onClick={vm.actions.handleConversationClick}
 *         />
 *       ))}
 *     </>
 *   );
 * }
 * ```
 */
export function useConversationsListViewModel() {
  const { t } = useTranslation();

  // ========================
  // STATE MANAGEMENT
  // ========================
  
  // Search input for filtering contacts by name
  const [searchInput, setSearchInput] = useState<string>('');

  // ========================
  // DATA FETCHING
  // ========================
  
  // Fetch all contacts (these become our conversations list)
  const {
    data: contactsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyContacts();
  
  // Access unread counters from Zustand
  const { unreadCounts, totalUnread } = useMessagingStore();

  // ========================
  // DERIVED DATA
  // ========================
  
  // Filter contacts by search input (local client-side filter)
  const filteredContacts = useMemo(() => {
    if (!contactsData?.contacts) {
      return [];
    }
    
    if (!searchInput.trim()) {
      return contactsData.contacts;
    }
    
    const searchLower = searchInput.toLowerCase().trim();
    
    return contactsData.contacts.filter((contact) => {
      const companyName = contact.profile.companyName?.toLowerCase() || '';
      
      return companyName.includes(searchLower);
    });
  }, [contactsData, searchInput]);
  
  // Sort conversations: Unread first, then alphabetically by company name
  const sortedConversations = useMemo(() => {
    return [...filteredContacts].sort((a, b) => {
      const aUnread = unreadCounts[a.id] || 0;
      const bUnread = unreadCounts[b.id] || 0;
      
      // First: Sort by unread (desc)
      if (aUnread !== bUnread) {
        return bUnread - aUnread;
      }
      
      // Then: Sort alphabetically by company name
      const aName = a.profile.companyName || '';
      const bName = b.profile.companyName || '';
      return aName.localeCompare(bName);
    });
  }, [filteredContacts, unreadCounts]);
  
  // Empty state flags
  const hasNoContacts = !contactsData?.contacts || contactsData.contacts.length === 0;
  const hasNoResults = !hasNoContacts && filteredContacts.length === 0;
  const isEmpty = hasNoContacts || hasNoResults;

  // ========================
  // ACTIONS
  // ========================
  
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };
  
  const handleClearSearch = () => {
    setSearchInput('');
  };
  
  const handleRetry = () => {
    refetch();
  };
  
  // Conversation click navigation (handled by ConversationPreview component)
  // No need for explicit handler here - component navigates via ROUTES.CHAT(userId)

  // ========================
  // RETURN VIEWMODEL
  // ========================
  
  return {
    // State flags
    state: {
      isLoading,
      isError,
      error: error as Error | null,
      isEmpty,
      hasNoContacts,
      hasNoResults,
    },
    
    // Data for rendering
    data: {
      conversations: sortedConversations,
      unreadCounts,
      totalUnread,
      total: contactsData?.total || 0,
    },
    
    // Filters
    filters: {
      searchInput,
    },
    
    // Actions
    actions: {
      handleSearchChange,
      handleClearSearch,
      handleRetry,
    },
    
    // i18n helper
    t,
  };
}

// Strategic future enhancements (commented for reference)

/**
 * Filter by conversation status (Future Feature)
 * 
 * Options:
 * - All conversations
 * - Unread only
 * - Archived
 * - Pinned
 * 
 * Implementation:
 * - Add conversationFilter state
 * - Filter sortedConversations based on selected filter
 * - UI: Tabs or dropdown selector
 * 
 * @future Sprint #15 - Conversation Filtering
 */
// const [conversationFilter, setConversationFilter] = useState<'all' | 'unread' | 'archived' | 'pinned'>('all');

/**
 * Sort by last activity (Future Feature)
 * 
 * Requires backend endpoint with conversation metadata:
 * - lastMessageAt timestamp
 * - Sort DESC (most recent first)
 * 
 * Implementation:
 * - Replace useMyContacts with useConversations hook
 * - Backend returns conversations with lastMessage, lastActivity
 * - Sort by lastActivity instead of unread + alphabetically
 * 
 * @future Sprint #13 - Conversation Metadata
 */
// const { data: conversationsData } = useConversations({ sortBy: 'lastActivity' });

/**
 * Pagination support (Future Feature)
 * 
 * For users with 50+ contacts, pagination improves performance.
 * 
 * Implementation:
 * - Add page state
 * - Pass page to useMyContacts (or useConversations)
 * - Render pagination controls
 * - Alternatively: Infinite scroll with useInfiniteQuery
 * 
 * @future Sprint #14 - Pagination
 */
// const [page, setPage] = useState(1);
// const { data: contactsData } = useMyContacts({ page, limit: 20 });

/**
 * Mark all as read action (Future Feature)
 * 
 * Bulk operation to clear all unread badges.
 * 
 * Implementation:
 * - Call resetUnread() from Zustand
 * - Optionally: Backend endpoint to update lastReadAt for all conversations
 * - Show toast confirmation
 * 
 * @future Sprint #13 - Read Management
 */
// const handleMarkAllAsRead = () => {
//   resetUnread();
//   toast.success({ title: t('messages.allMarkedRead') });
// };
