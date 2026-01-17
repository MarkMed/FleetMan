import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecentConversations } from '@hooks/useMessages';
import { useMessagingStore } from '@store';
import type { RecentConversationsQuery } from '@packages/contracts';

/**
 * ViewModel: ConversationsListScreen Business Logic
 * 
 * Sprint #13 - Recent Conversations Inbox Feature
 * 
 * Responsibilities (MVVM-lite):
 * - Fetch recent conversations with last message preview
 * - Handle search/filter for conversations (onlyContacts, search term)
 * - Manage pagination state
 * - Navigate to specific chat
 * - Provide i18n access for View
 * 
 * Architecture Changes (Sprint #13):
 * - REPLACED: useMyContacts() → useRecentConversations()
 * - ADDED: Backend-driven filtering (onlyContacts query param)
 * - ADDED: Backend search by displayName
 * - ADDED: Last message preview and timestamp
 * - IMPROVED: Shows ALL conversations (contacts + non-contacts with messages)
 * 
 * MVP Scope:
 * - ✅ Show conversations ordered by most recent message
 * - ✅ Display last message preview with timestamp
 * - ✅ Filter by contact status (All/Contacts/Non-Contacts)
 * - ✅ Search by user display name
 * - ✅ Pagination (backend-driven)
 * - ✅ Real-time updates via SSE
 * - ❌ NO unread count (MVP - uses client-side store only)
 * 
 * Pattern (Updated):
 * - Backend returns conversations with isContact flag
 * - All filtering/searching done by backend (no client-side filtering)
 * - Pagination handled by backend with totalPages calculation
 * - View renders based on ViewModel output
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
 *       <SearchBar value={vm.filters.searchInput} onChange={vm.actions.handleSearchInputChange} onSearch={vm.actions.handleSearch} />
 *       <FilterTabs value={vm.filters.contactFilter} onChange={vm.actions.handleContactFilterChange} />
 *       {vm.data.conversations.map(convo => (
 *         <ConversationPreview key={convo.otherUserId} conversation={convo} />
 *       ))}
 *       <Pagination {...vm.data.pagination} {...vm.actions} />
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
  
  // Search input (controlled by user typing)
  const [searchInput, setSearchInput] = useState<string>('');
  
  // Search term (applied to query when user presses Search button or Enter)
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Contact filter (undefined = All, true = Contacts only, false = Non-contacts only)
  const [contactFilter, setContactFilter] = useState<boolean | undefined>(undefined);
  
  // Pagination (current page)
  const [page, setPage] = useState(1);
  
  // Items per page (default 20, max 50)
  const limit = 20;

  // ========================
  // DATA FETCHING
  // ========================
  
  // Build query params
  const query: RecentConversationsQuery = useMemo(() => {
    const params: RecentConversationsQuery = {
      page,
      limit,
    };
    
    // Add onlyContacts filter if selected (undefined = show all)
    if (contactFilter !== undefined) {
      params.onlyContacts = contactFilter;
    }
    
    // Add search term if it has at least 1 character (defensive check for undefined)
    const trimmedSearch = searchTerm?.trim() || '';
    if (trimmedSearch.length > 0) {
      params.search = trimmedSearch;
    }
    
    return params;
  }, [page, limit, contactFilter, searchTerm]);
  
  // Fetch conversations from API
  const {
    data: conversationsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useRecentConversations(query);
  
  // Access unread counters from Zustand (still used for badges)
  const { unreadCounts, totalUnread } = useMessagingStore();

  // ========================
  // DERIVED DATA
  // ========================
  
  const conversations = conversationsData?.conversations || [];
  const isEmpty = conversations.length === 0;
  const total = conversationsData?.total || 0;
  const totalPages = conversationsData?.totalPages || 0;
  
  // Check if any filters are active (useful for showing "Clear filters" button)
  const hasActiveFilters = (searchTerm?.trim() || '').length > 0 || contactFilter !== undefined;
  
  // Calculate pagination ranges for display
  const rangeStart = conversations.length > 0 ? (page - 1) * limit + 1 : 0;
  const rangeEnd = rangeStart + conversations.length - 1;
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  // ========================
  // BUSINESS LOGIC ACTIONS
  // ========================
  
  /**
   * Handle search input change (user typing)
   * Updates local input state without triggering API call
   */
  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
  };

  /**
   * Execute search (when user presses Search button or Enter key)
   * Updates searchTerm which triggers API call via query dependency
   * Resets to page 1 when search executes
   */
  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(1); // Reset to first page on search
  };

  /**
   * Handle contact filter change
   * undefined = All, true = Contacts only, false = Non-contacts only
   * Resets to page 1 when filter changes
   */
  const handleContactFilterChange = (filter: boolean | undefined) => {
    setContactFilter(filter);
    setPage(1); // Reset to first page on filter change
  };

  /**
   * Clear all filters and reset to initial state
   * Clears both input field and applied search term
   */
  const handleClearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setContactFilter(undefined);
    setPage(1);
  };
  
  /**
   * Handle pagination - next page
   */
  const handleNextPage = () => {
    if (canGoNext) {
      setPage(prev => prev + 1);
    }
  };
  
  /**
   * Handle pagination - previous page
   */
  const handlePreviousPage = () => {
    if (canGoPrevious) {
      setPage(prev => prev - 1);
    }
  };
  
  /**
   * Retry fetching conversations (on error)
   */
  const handleRetry = () => {
    refetch();
  };

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
      hasActiveFilters,
    },
    
    // Data for rendering
    data: {
      conversations,
      unreadCounts, // Still from Zustand for MVP
      totalUnread,
      total,
      totalPages,
      currentPage: page,
      pagination: {
        rangeStart,
        rangeEnd,
        canGoPrevious,
        canGoNext,
      },
    },
    
    // Filters
    filters: {
      searchInput,
      searchTerm,
      contactFilter,
    },
    
    // Actions
    actions: {
      handleSearchInputChange,
      handleSearch,
      handleContactFilterChange,
      handleClearFilters,
      handleNextPage,
      handlePreviousPage,
      handleRetry,
    },
    
    // i18n helper
    t,
  };
}

// Strategic future enhancements (commented for reference)

/**
 * Real-time unread count from backend (Future Feature)
 * 
 * Sprint #13 MVP uses client-side unreadCounts from Zustand.
 * Future: Backend can return unreadCount per conversation in ConversationSummary schema.
 * 
 * Benefits:
 * - Accurate unread count across devices
 * - No client-side state management needed
 * - Survives browser refresh
 * 
 * Implementation:
 * - Backend adds unreadCount field to ConversationSummarySchema
 * - Frontend uses data.conversations[i].unreadCount instead of unreadCounts[userId]
 * - Remove useMessagingStore dependency
 * 
 * @future Sprint #14 - Read Receipts & Unread Tracking
 */
// const unreadCount = conversation.unreadCount; // From backend instead of Zustand

/**
 * Debounced search (Future Feature)
 * 
 * Auto-search as user types instead of requiring Search button click.
 * 
 * Benefits:
 * - Faster search experience
 * - No button click needed
 * - Real-time filtering
 * 
 * Implementation:
 * - Use useDebouncedValue hook (300-500ms delay)
 * - Apply debounced value to searchTerm directly
 * - Remove Search button (optional, keep for accessibility)
 * 
 * @future Sprint #14 - UX Improvements
 */
// const debouncedSearch = useDebouncedValue(searchInput, 300);
// useEffect(() => {
//   setSearchTerm(debouncedSearch);
// }, [debouncedSearch]);
