import React from 'react';
import { Heading1, BodyText, Button, Card, Input } from '@components/ui';
import { Search, Filter, AlertCircle, Users } from 'lucide-react';
import { UserCard } from '@components/users/UserCard';
import { useUserDiscoveryViewModel } from '../../viewModels/users/useUserDiscoveryViewModel';

/**
 * UserDiscoveryScreen (View Layer - MVVM)
 * 
 * Sprint #12 - Module 1: User Communication System (User Discovery)
 * 
 * Purpose:
 * - Allow users to explore other registered users (clients and providers)
 * - Search by company name
 * - Filter by user type (CLIENT | PROVIDER | ALL)
 * - Paginated results for performance
 * 
 * MVP Scope:
 * - Read-only discovery (no interaction buttons yet)
 * - Module 2 will add "Add Contact" functionality
 * 
 * Architecture:
 * - View Layer: Only rendering and UI structure (this file)
 * - Business Logic: Handled by useUserDiscoveryViewModel
 * - Data Layer: API calls via userDiscoveryService
 * 
 * Pattern:
 * - Consumes ViewModel via useUserDiscoveryViewModel()
 * - NO business logic in this component
 * - Renders based on ViewModel state/data/actions
 * 
 * @example
 * ```tsx
 * // Route: /contact-discovery
 * <Route path="/contact-discovery" element={<UserDiscoveryScreen />} />
 * ```
 */
export function UserDiscoveryScreen() {
  // ========================
  // ViewModel (Business Logic)
  // ========================
  
  const vm = useUserDiscoveryViewModel();

  // ========================
  // RENDER SECTIONS
  // ========================

  // Determine which content to show based on state
  let content;

  // ========================
  // ERROR STATE
  // ========================

  if (vm.state.error) {
    content = (
      <Card className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <BodyText className="text-destructive">
            {vm.t('common.error')}
          </BodyText>
          <BodyText size="small" className="text-muted-foreground">
            {vm.state.error.message}
          </BodyText>
          <Button variant="outline" onPress={vm.actions.handleRetry}>
            {vm.t('common.retry')}
          </Button>
        </div>
      </Card>
    );
  }

  // ========================
  // LOADING STATE
  // ========================

  else if (vm.state.isLoading) {
    content = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  // ========================
  // EMPTY STATE
  // ========================

  else if (vm.state.isEmpty) {
    content = (
      <Card className="p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <Users className="h-16 w-16 text-muted-foreground" />
          <Heading1 size="medium" className="text-muted-foreground">
            {vm.state.hasActiveFilters 
              ? vm.t('users.discovery.noResults') 
              : vm.t('users.discovery.noUsers')
            }
          </Heading1>
          <BodyText className="text-muted-foreground max-w-md">
            {vm.state.hasActiveFilters
              ? vm.t('users.discovery.tryDifferentFilters')
              : vm.t('users.discovery.noUsersDescription')
            }
          </BodyText>
          {vm.state.hasActiveFilters && (
            <Button 
              variant="outline" 
              onPress={vm.actions.handleClearFilters}
            >
              {vm.t('users.discovery.clearFilters')}
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // ========================
  // USERS LIST
  // ========================

  else {
    content = (
      <div className="space-y-4">
        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <BodyText size="small" className="text-muted-foreground">
            {vm.t('users.discovery.resultsCount', {
              start: vm.data.pagination.rangeStart,
              end: vm.data.pagination.rangeEnd,
              total: vm.data.total,
            })}
          </BodyText>
          
          {vm.state.hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onPress={vm.actions.handleClearFilters}
            >
              {vm.t('users.discovery.clearFilters')}
            </Button>
          )}
        </div>

        {/* Users List (vertical layout per WBS 9.1c spec) */}
        <div className="flex flex-col gap-3">
          {vm.data.users.map(user => (
            <UserCard 
              key={user.id} 
              user={user}
              onAddContact={vm.actions.handleAddContact}
            />
          ))}
        </div>

        {/* Pagination Controls */}
        {vm.data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onPress={vm.actions.handlePreviousPage}
              disabled={!vm.data.pagination.canGoPrevious}
            >
              {vm.t('common.previous')}
            </Button>
            
            <BodyText size="small" className="text-muted-foreground px-4">
              {vm.t('users.discovery.pageInfo', {
                current: vm.data.currentPage,
                total: vm.data.totalPages,
              })}
            </BodyText>
            
            <Button
              variant="outline"
              size="sm"
              onPress={vm.actions.handleNextPage}
              disabled={!vm.data.pagination.canGoNext}
            >
              {vm.t('common.next')}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ========================
  // MAIN LAYOUT
  // ========================

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <Heading1 size="headline" className="tracking-tight text-foreground">
          {vm.t('users.discovery.title')}
        </Heading1>
        <BodyText className="text-muted-foreground">
          {vm.t('users.discovery.subtitle')}
        </BodyText>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1">
            <Input
              value={vm.filters.searchTerm}
              onChange={(e) => vm.actions.handleSearchChange(e.target.value)}
              placeholder={vm.t('users.discovery.searchPlaceholder')}
              className="w-full"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <Button
              variant={vm.filters.userType === undefined ? 'filled' : 'outline'}
              size="sm"
              onPress={() => vm.actions.handleTypeFilterChange(undefined)}
            >
              {vm.t('users.discovery.filterAll')}
            </Button>
            <Button
              variant={vm.filters.userType === 'CLIENT' ? 'filled' : 'outline'}
              size="sm"
              onPress={() => vm.actions.handleTypeFilterChange('CLIENT')}
            >
              {vm.t('users.type.client')}
            </Button>
            <Button
              variant={vm.filters.userType === 'PROVIDER' ? 'filled' : 'outline'}
              size="sm"
              onPress={() => vm.actions.handleTypeFilterChange('PROVIDER')}
            >
              {vm.t('users.type.provider')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Content (dynamic based on state) */}
      {content}

      {/* TODO POST-MVP: Add more features (Module 2+) */}
      {/* - Add Contact button in UserCard */}
      {/* - View full profile modal */}
      {/* - Sort options (by company name, type, etc.) */}
      {/* - Advanced filters (verified, service areas) */}
      {/* - Infinite scroll instead of pagination */}
    </div>
  );
}
