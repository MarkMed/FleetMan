import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDiscoverUsers } from '@hooks/useUserDiscovery';
import { useAddContact, useMyContacts } from '@hooks/useContacts';
import { useUserStats } from '@hooks/useUserStats';
import type { DiscoverUsersQuery, UserPublicProfile } from '@packages/contracts';

/**
 * ViewModel: UserDiscoveryScreen Business Logic
 * 
 * Responsibilities (MVVM-lite):
 * - Manage local state (search term, filters, pagination)
 * - Fetch users data from API via hooks
 * - Handle user actions (search, filter, pagination)
 * - Compute derived data (isEmpty, hasFilters, displayedUsers)
 * - Provide i18n access for View
 * 
 * Pattern:
 * - View (UserDiscoveryScreen.tsx) calls this hook
 * - ViewModel returns { state, data, filters, actions, t }
 * - View renders based on ViewModel output (no business logic in View)
 * 
 * Sprint #12 - Module 1: User Communication System (User Discovery)
 * Purpose: Allow users to explore other registered users before adding as contacts
 * MVP: Read-only discovery (no interaction, no add contact - that's Module 2)
 * 
 * @example
 * ```tsx
 * function UserDiscoveryScreen() {
 *   const vm = useUserDiscoveryViewModel();
 *   
 *   if (vm.state.isLoading) return <Loading />;
 *   if (vm.state.error) return <Error onRetry={vm.actions.handleRetry} />;
 *   if (vm.data.isEmpty) return <EmptyState message={vm.t('users.discovery.noUsers')} />;
 *   
 *   return (
 *     <div>
 *       <SearchBar 
 *         value={vm.filters.searchInput} 
 *         onChange={vm.actions.handleSearchInputChange}
 *         onSearch={vm.actions.handleSearch}
 *       />
 *       <TypeFilter 
 *         value={vm.filters.userType} 
 *         onChange={vm.actions.handleTypeFilterChange} 
 *       />
 *       <UsersList users={vm.data.users} />
 *       <Pagination {...vm.data.pagination} {...vm.actions} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useUserDiscoveryViewModel() {
  const { t } = useTranslation();

  // ========================
  // STATE MANAGEMENT
  // ========================
  
  // Search input (controlled by user typing, NOT used in query yet)
  const [searchInput, setSearchInput] = useState<string>('');
  
  // Search term (applied to query when user presses Search button)
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // User type filter (CLIENT | PROVIDER | undefined for all)
  const [userType, setUserType] = useState<'CLIENT' | 'PROVIDER' | undefined>(undefined);
  
  // Pagination (current page)
  const [page, setPage] = useState(1);
  
  // Items per page (default 20, max 50)
  const limit = 20;
  
  // Hide saved contacts filter (Module 2: Filter Enhancement)
  // Persisted in localStorage so user doesn't have to toggle each session
  // Default: false (show all users for better discovery)
  const [hideContacts, setHideContacts] = useState<boolean>(() => {
    const stored = localStorage.getItem('discovery.hideContacts');
    return stored === 'true';
  });

  // ========================
  // DATA FETCHING
  // ========================
  
  // Build query params
  const query: DiscoverUsersQuery = useMemo(() => {
    const params: DiscoverUsersQuery = {
      page,
      limit,
    };
    
    // Only add searchTerm if it has at least 1 character (backend validation)
    if (searchTerm.trim().length > 0) {
      params.searchTerm = searchTerm.trim();
    }
    
    // Only add type filter if selected
    if (userType) {
      params.type = userType;
    }
    
    return params;
  }, [page, limit, searchTerm, userType]);
  
  // Fetch users from API
  const { data, isLoading, error, refetch } = useDiscoverUsers(query);
  
  // Pre-fetch contacts (Module 2: Fix Rules of Hooks violation)
  // This ensures contact data is available on first render of Discovery screen
  // and provides O(1) lookup performance with Set
  const { data: contactsData } = useMyContacts({ enabled: true });
  
  // Fetch user statistics (Sprint #12 - User Stats Feature)
  // Shows ecosystem size to stimulate networking and internal business
  const { data: userStatsData, isLoading: isLoadingStats } = useUserStats();
  
  // Add contact mutation (Module 2: Connect button to backend)
  const addContactMutation = useAddContact();

  // ========================
  // DERIVED STATE
  // ========================
  
  const users = data?.profiles || [];
  const isEmpty = users.length === 0;
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;
  
  // Create Set of contact IDs for O(1) lookup performance
  // Used in View to check if discovered users are already contacts
  const contactIds = useMemo(() => {
    const ids = new Set<string>();
    contactsData?.contacts.forEach(contact => ids.add(contact.id));
    return ids;
  }, [contactsData?.contacts]);
  
  // Filter users client-side to hide saved contacts (Module 2: Filter Enhancement)
  // NOTE: Client-side filtering for MVP - see TODO below for server-side migration
  const displayedUsers = useMemo(() => {
    if (!hideContacts) return users; // Show all if filter not active
    return users.filter(user => !contactIds.has(user.id));
  }, [users, hideContacts, contactIds]);
  
  // Count how many contacts are hidden (for badge feedback)
  const hiddenCount = useMemo(() => {
    if (!hideContacts) return 0;
    return users.length - displayedUsers.length;
  }, [hideContacts, users.length, displayedUsers.length]);
  
  // Check if any filters are active (useful for showing "Clear filters" button)
  const hasActiveFilters = searchTerm.trim().length > 0 || userType !== undefined || hideContacts;

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
   * Handle user type filter change
   * Resets to page 1 when filter changes
   */
  const handleTypeFilterChange = (type: 'CLIENT' | 'PROVIDER' | undefined) => {
    setUserType(type);
    setPage(1); // Reset to first page on filter change
  };

  /**
   * Clear all filters and reset to initial state
   * Clears both input field and applied search term
   */
  const handleClearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setUserType(undefined);
    setHideContacts(false); // Also reset hide contacts filter
    localStorage.setItem('discovery.hideContacts', 'false');
    setPage(1);
  };
  
  /**
   * Toggle hide saved contacts filter
   * Persists preference in localStorage for future sessions
   * Resets to page 1 when filter changes (like other filters)
   * 
   * Module 2: Filter Enhancement
   * MVP: Client-side filtering
   * Post-MVP: Consider server-side when user base > 1000 (see TODO below)
   */
  const handleToggleHideContacts = () => {
    setHideContacts(prev => {
      const newValue = !prev;
      localStorage.setItem('discovery.hideContacts', String(newValue));
      return newValue;
    });
    setPage(1); // Reset to first page when filter changes
  };

  /**
   * Navigate to next page
   */
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  /**
   * Navigate to previous page
   */
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  /**
   * Navigate to specific page
   */
  const handleGoToPage = (targetPage: number) => {
    if (targetPage >= 1 && targetPage <= totalPages) {
      setPage(targetPage);
    }
  };

  /**
   * Retry fetching data (useful for error states)
   */
  const handleRetry = () => {
    refetch();
  };

  /**
   * Handle adding a user as contact
   * 
   * Module 2 Implementation: Calls addContactMutation with userId
   * Shows success/error toast (handled by useAddContact hook)
   * Invalidates caches to update UI state
   * 
   * @param userId - The ID of the user to add as contact
   */
  const handleAddContact = (userId: string) => {
    // Get user's company name for toast
    const user = users.find(u => u.id === userId);
    const companyName = user?.profile.companyName || t('users.discovery.noCompanyName');
    
    addContactMutation.mutate({ userId, companyName }, {
      onError: (error) => {
        // Error toast handled by useAddContact hook
        console.error('❌ [User Discovery] Failed to add contact:', error);
      },
      onSuccess: () => {
        // Success toast handled by useAddContact hook
        console.log('✅ [User Discovery] Contact added successfully:', userId);
      }
    });
  };

  // ========================
  // VIEW MODEL OUTPUT
  // ========================

  return {
    // State flags
    state: {
      isLoading,
      error: error as Error | null,
      isEmpty: !isLoading && displayedUsers.length === 0, // Use displayedUsers for empty check (respects filter)
      hasActiveFilters,
      isAddingContact: addContactMutation.isPending, // Module 2: Track add contact loading
      isLoadingStats, // Sprint #12: User Stats Feature
    },
    
    // Data for rendering
    data: {
      users: displayedUsers, // Module 2: Return filtered users instead of raw users
      allUsersCount: users.length, // Original count before filtering (for counters)
      hiddenContactsCount: hiddenCount, // How many contacts are hidden by filter
      totalRegisteredUsers: userStatsData?.totalUsers, // Sprint #12: Total users in ecosystem
      total,
      currentPage: page,
      totalPages,
      limit,
      contactIds, // Module 2: Set of contact IDs for O(1) lookup in View (fixes Rules of Hooks violation)
      
      // Pagination helpers
      pagination: {
        canGoNext: page < totalPages,
        canGoPrevious: page > 1,
        rangeStart: isEmpty ? 0 : (page - 1) * limit + 1,
        rangeEnd: Math.min(page * limit, total),
      },
    },
    
    // Current filters (for controlled inputs)
    filters: {
      searchInput, // Current value in search input (controlled)
      searchTerm, // Applied search term in query (read-only for display)
      userType,
      hideContacts, // Module 2: Hide saved contacts filter
    },
    
    // User actions
    actions: {
      handleSearchInputChange, // Update search input (no API call)
      handleSearch, // Execute search (triggers API call)
      handleTypeFilterChange,
      handleClearFilters,
      handleToggleHideContacts, // Module 2: Toggle hide contacts filter
      handleNextPage,
      handlePreviousPage,
      handleGoToPage,
      handleRetry,
      handleAddContact, // Module 2: Add as contact (integrated with backend)
    },
    
    // i18n helper
    t,
  };
}

// ========================
// TYPE EXPORTS
// ========================

export type UserDiscoveryViewModel = ReturnType<typeof useUserDiscoveryViewModel>;

// =============================================================================
// FUTURE ENHANCEMENTS (Strategic, commented for post-MVP)
// =============================================================================

// TODO: Optimistic UI updates with contactIds
// When user adds contact, immediately update local contactIds Set
// without waiting for backend response - better perceived performance
//
// Example implementation:
// const [optimisticContactIds, setOptimisticContactIds] = useState<Set<string>>(new Set());
// const mergedContactIds = useMemo(() => {
//   const merged = new Set(contactIds);
//   optimisticContactIds.forEach(id => merged.add(id));
//   return merged;
// }, [contactIds, optimisticContactIds]);
//
// const handleAddContact = (userId: string) => {
//   setOptimisticContactIds(prev => new Set(prev).add(userId));
//   addContactMutation.mutate(userId, {
//     onError: () => {
//       setOptimisticContactIds(prev => {
//         const next = new Set(prev);
//         next.delete(userId);
//         return next;
//       });
//     }
//   });
// };

// TODO: Contact metadata enrichment
// Store additional metadata about contacts for richer UI
// Example: lastInteractionDate, mutualContactCount, tags
//
// type ContactMetadata = {
//   userId: string;
//   addedAt: Date;
//   isMutual: boolean;
//   mutualContactCount: number;
//   tags: string[];
// };
//
// const contactMetadata = useMemo(() => {
//   const map = new Map<string, ContactMetadata>();
//   contactsData?.contacts.forEach(contact => {
//     map.set(contact.id, {
//       userId: contact.id,
//       addedAt: new Date(), // From backend
//       isMutual: false, // TODO: Backend endpoint
//       mutualContactCount: 0,
//       tags: []
//     });
//   });Server-side "Hide Contacts" filter (Post-MVP Migration)
// Current: Client-side filtering (MVP approach)
// When: User base > 1000 OR if >70% of users enable this filter
// Why migrate:
//   1. Performance: Large user lists slow client-side filter
//   2. Data efficiency: Don't fetch contacts if user always hides them
//   3. Pagination accuracy: Current approach breaks counts (shows "50 of 100" but only 30 visible)
//
// Implementation plan:
//   - Backend: Add `excludeContacts` query param to /users/discover endpoint
//   - Backend: Filter SQL query with NOT IN (SELECT contact_id FROM contacts WHERE user_id = ?)
//   - Frontend: Pass excludeContacts to useDiscoverUsers({ excludeContacts: true })
//   - Frontend: Remove client-side filter logic (keep localStorage for preference)
//   - Metrics: Track usage % in analytics to justify migration
//
// Decision criteria:
//   - <30% usage = Keep client-side (not worth backend complexity)
//   - 30-70% usage = Evaluate based on user base size
//   - >70% usage = Migrate to server-side (most users expect this)

// TODO: 
//   return map;
// }, [contactsData]);

// TODO: Future enhancements (commented for post-MVP)
// - Sort options (by companyName, type, etc.)
// - Advanced filters (isVerified, serviceAreas for providers)
// - Infinite scroll instead of pagination
// - User detail modal (show more info before adding contact)
// - Favorite/bookmark users for quick access
// - Recent searches history (localStorage)
// - Saved filter presets
