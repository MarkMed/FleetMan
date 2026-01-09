import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDiscoverUsers } from '@hooks/useUserDiscovery';
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
 *         value={vm.filters.searchTerm} 
 *         onChange={vm.actions.handleSearchChange} 
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
  
  // Search term (local state, debounced before querying)
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // User type filter (CLIENT | PROVIDER | undefined for all)
  const [userType, setUserType] = useState<'CLIENT' | 'PROVIDER' | undefined>(undefined);
  
  // Pagination (current page)
  const [page, setPage] = useState(1);
  
  // Items per page (default 20, max 50)
  const limit = 20;

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

  // ========================
  // DERIVED STATE
  // ========================
  // TODO: Add debounce to searchTerm to reduce API calls (useDebounce hook)
  
  const users = data?.profiles || [];
  const isEmpty = users.length === 0;
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;
  
  // Check if any filters are active (useful for showing "Clear filters" button)
  const hasActiveFilters = searchTerm.trim().length > 0 || userType !== undefined;

  // ========================
  // BUSINESS LOGIC ACTIONS
  // ========================
  
  /**
   * Handle search term change
   * Resets to page 1 when search changes
   */
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
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
   */
  const handleClearFilters = () => {
    setSearchTerm('');
    setUserType(undefined);
    setPage(1);
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
   * MVP Placeholder (Module 1): Console log only
   * Module 2 Implementation: Will call addContactMutation with userId
   * 
   * @param userId - The ID of the user to add as contact
   */
  const handleAddContact = (userId: string) => {
    console.log('👥 [User Discovery] Add contact clicked:', userId);
    // TODO Module 2: Implement addContactMutation
    // addContactMutation.mutate(userId);
  };

  // ========================
  // VIEW MODEL OUTPUT
  // ========================
  
  return {
    // State flags
    state: {
      isLoading,
      error: error as Error | null,
      isEmpty: !isLoading && isEmpty,
      hasActiveFilters,
    },
    
    // Data for rendering
    data: {
      users,
      total,
      currentPage: page,
      totalPages,
      limit,
      
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
      searchTerm,
      userType,
    },
    
    // User actions
    actions: {
      handleSearchChange,
      handleTypeFilterChange,
      handleClearFilters,
      handleNextPage,
      handlePreviousPage,
      handleGoToPage,
      handleRetry,
      handleAddContact, // Module 2: Add as contact (currently placeholder)
    },
    
    // i18n helper
    t,
  };
}

// ========================
// TYPE EXPORTS
// ========================

export type UserDiscoveryViewModel = ReturnType<typeof useUserDiscoveryViewModel>;

// TODO: Future enhancements (commented for post-MVP)
// - Debounced search (useDebounce hook for searchTerm)
// - Sort options (by companyName, type, etc.)
// - Advanced filters (isVerified, serviceAreas for providers)
// - Infinite scroll instead of pagination
// - User detail modal (show more info before adding contact)
// - Favorite/bookmark users for quick access
