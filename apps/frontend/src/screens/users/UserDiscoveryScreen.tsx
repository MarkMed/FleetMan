import React from 'react';
import { Heading1, BodyText, Button, Card, Input, Checkbox } from '@components/ui';
import { Search, AlertCircle, Users } from 'lucide-react';
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
      <div className="flex flex-col gap-3">
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
            {vm.filters.hideContacts && vm.data.hiddenContactsCount > 0 ? (
              
              // Show filtered count when hiding contacts
              vm.t('users.discovery.showingFiltered', {
                shown: vm.data.users.length,
                total: vm.data.allUsersCount,
                hidden: vm.data.hiddenContactsCount,
              })
            ) : (
              // Normal count
              vm.t('users.discovery.resultsCount', {
                start: vm.data.pagination.rangeStart,
                end: vm.data.pagination.rangeEnd,
                total: vm.data.total,
              })
            )}
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
          {vm.data.users.map((user) => {
            // O(1) lookup: Check if user is already a contact using Set
            // Fixes Rules of Hooks violation (was calling hook inside loop)
            const isContact = vm.data.contactIds.has(user.id);
            
            return (
              <UserCard
                key={user.id}
                user={user}
                isContact={isContact}
                isAddingContact={vm.state.isAddingContact}
                onAddContact={vm.actions.handleAddContact}
              />
            );
          })}
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 lg:sticky lg:top-20">
        <Heading1 size="headline" className="tracking-tight text-foreground">
          {vm.t('users.discovery.title')}
        </Heading1>
        <div className="flex items-center gap-3 mt-1">
          <BodyText className="text-muted-foreground">
            {vm.t('users.discovery.subtitle')}
          </BodyText>
        </div>
      </div>

      {/* Grid Layout: Sidebar (1 col) + Content (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ======================== */}
        {/* SIDEBAR: Filters (Left - 1 column) */}
        {/* ======================== */}
        <aside className="lg:col-span-1">
          <div className="p-4 space-y-4 lg:sticky lg:top-36">
          {/* User Stats Badge (Sprint #12 - Strategic Feature) */}
          {vm.data.totalRegisteredUsers !== undefined && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/20 rounded-full border border-green-200 dark:border-green-800">
              <BodyText className="text-muted-foreground">
                {vm.t('users.discovery.totalRegisteredShort')}:
              </BodyText>
              <BodyText weight="bold" className="text-green-600 dark:text-green-400">
                {vm.data.totalRegisteredUsers.toLocaleString()}
              </BodyText>
            </div>
          )}
          {vm.state.isLoadingStats && (
            <div className="h-6 w-32 bg-muted animate-pulse rounded-full" />
          )}
            {/* Search Section */}
            <div className="space-y-2">
              <BodyText weight="medium" size="small" className="text-foreground">
                {vm.t('users.discovery.searchTitle')}
              </BodyText>
              <div className="flex gap-2">
                <Input
                  value={vm.filters.searchInput}
                  onChange={(e) => vm.actions.handleSearchInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      vm.actions.handleSearch();
                    }
                  }}
                  placeholder={vm.t('users.discovery.searchPlaceholder')}
                  className="flex-1"
                />
                <Button
                  variant="filled"
                  size="sm"
                  onPress={vm.actions.handleSearch}
                  disabled={vm.state.isLoading}
                  className="px-3"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Hide Contacts Filter Section (Module 2: Filter Enhancement) */}
            <div className="space-y-2">
              <BodyText weight="medium" size="small" className="text-foreground">
                {vm.t('users.discovery.visibility')}
              </BodyText>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="hideContacts"
                  checked={vm.filters.hideContacts}
                  onCheckedChange={vm.actions.handleToggleHideContacts}
                  aria-label={vm.t('users.discovery.hideContacts')}
                />
                <label
                  htmlFor="hideContacts"
                  className="text-sm cursor-pointer select-none leading-tight"
                >
                  {vm.t('users.discovery.hideContacts')}
                  {vm.data.hiddenContactsCount > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {vm.t('users.discovery.contactsHidden', { count: vm.data.hiddenContactsCount })}
                    </span>
                  )}
                </label>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Type Filter Section */}
            <div className="space-y-2">
              <BodyText weight="medium" size="small" className="text-foreground">
                {vm.t('users.discovery.filterByType')}
              </BodyText>
              <div className="flex flex-col gap-2">
                <Button
                  variant={vm.filters.userType === undefined ? 'filled' : 'outline'}
                  size="sm"
                  onPress={() => vm.actions.handleTypeFilterChange(undefined)}
                  className="w-full justify-start"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {vm.t('users.discovery.filterAll')}
                </Button>
                <Button
                  variant={vm.filters.userType === 'CLIENT' ? 'filled' : 'outline'}
                  size="sm"
                  onPress={() => vm.actions.handleTypeFilterChange('CLIENT')}
                  className="w-full justify-start"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {vm.t('users.type.client')}
                </Button>
                <Button
                  variant={vm.filters.userType === 'PROVIDER' ? 'filled' : 'outline'}
                  size="sm"
                  onPress={() => vm.actions.handleTypeFilterChange('PROVIDER')}
                  className="w-full justify-start"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {vm.t('users.type.provider')}
                </Button>
              </div>
            </div>

            {/* Clear Filters (only show if active) */}
            {vm.state.hasActiveFilters && (
              <>
                <div className="border-t" />
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={vm.actions.handleClearFilters}
                  className="w-full"
                >
                  {vm.t('users.discovery.clearFilters')}
                </Button>
              </>
            )}
          </div>
        </aside>

        {/* ======================== */}
        {/* MAIN CONTENT: Users List (Right - 2 columns) */}
        {/* ======================== */}
        <main className="lg:col-span-2">
          {content}
        </main>
      </div>

      {/* TODO POST-MVP: Add more features (Module 2+) */}
      {/* - View full profile modal */}
      {/* - Sort options (by company name, type, etc.) */}
      {/* - Advanced filters (verified, service areas) */}
      {/* - Infinite scroll instead of pagination */}
      {/* - Export to CSV/PDF */}
    </div>
  );
}
