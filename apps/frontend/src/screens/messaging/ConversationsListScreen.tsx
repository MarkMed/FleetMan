import React from 'react';
import { Heading1, BodyText, Button, Card, Input } from '@components/ui';
import { Search, AlertCircle, MessageSquare, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConversationPreview } from '@components/messaging';
import { useConversationsListViewModel } from '../../viewModels/messaging/useConversationsListViewModel';
import { ROUTES } from '@constants';
import type { UserPublicProfile } from '@packages/contracts';

/**
 * ConversationsListScreen (View Layer - MVVM)
 * 
 * Sprint #12 - Module 3: User Communication System (Messaging)
 * 
 * Purpose:
 * - Display list of conversations (all contacts)
 * - Show unread message badges
 * - Search/filter conversations
 * - Navigate to specific chat
 * 
 * MVP Scope:
 * - ✅ Show ALL contacts as conversations
 * - ✅ Client-side unread badges
 * - ❌ NO last message preview (no backend endpoint)
 * - ❌ NO last activity sorting
 * 
 * Architecture:
 * - View Layer: Only rendering and UI structure (this file)
 * - Business Logic: Handled by useConversationsListViewModel
 * - Data Layer: API calls via contactService
 * 
 * Pattern:
 * - Consumes ViewModel via useConversationsListViewModel()
 * - NO business logic in this component
 * - Renders based on ViewModel state/data/actions
 * 
 * @example
 * ```tsx
 * // Route: /messages
 * <Route path="/messages" element={<ConversationsListScreen />} />
 * ```
 */
export function ConversationsListScreen() {
  const navigate = useNavigate();
  
  // ========================
  // ViewModel (Business Logic)
  // ========================
  
  const vm = useConversationsListViewModel();

  // ========================
  // RENDER SECTIONS
  // ========================

  // Determine which content to show based on state
  let content;

  // ========================
  // ERROR STATE
  // ========================

  if (vm.state.isError) {
    content = (
      <Card className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <BodyText className="text-destructive">
            {vm.t('common.error')}
          </BodyText>
          <BodyText size="small" className="text-muted-foreground">
            {vm.state.error?.message || vm.t('messages.loadError')}
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
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  // ========================
  // EMPTY STATE - NO CONTACTS
  // ========================

  else if (vm.state.hasNoContacts) {
    content = (
      <Card className="p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <MessageSquare className="h-16 w-16 text-muted-foreground" />
          <Heading1 size="medium" className="text-muted-foreground">
            {vm.t('messages.noContacts')}
          </Heading1>
          <BodyText className="text-muted-foreground max-w-md">
            {vm.t('messages.noContactsDescription', 'Aún no tienes contactos. Agrega usuarios desde la sección de descubrimiento para empezar a conversar.')}
          </BodyText>
          <Button 
            variant="filled" 
            onPress={() => navigate(ROUTES.CONTACT_DISCOVERY)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {vm.t('messages.discoverUsers', 'Descubrir usuarios')}
          </Button>
        </div>
      </Card>
    );
  }

  // ========================
  // EMPTY STATE - NO SEARCH RESULTS
  // ========================

  else if (vm.state.hasNoResults) {
    content = (
      <Card className="p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <Search className="h-16 w-16 text-muted-foreground" />
          <Heading1 size="medium" className="text-muted-foreground">
            {vm.t('messages.noSearchResults')}
          </Heading1>
          <BodyText className="text-muted-foreground max-w-md">
            {vm.t('messages.noSearchResultsDescription', 'No se encontraron contactos que coincidan con tu búsqueda.')}
          </BodyText>
          <Button 
            variant="outline" 
            onPress={vm.actions.handleClearSearch}
          >
            {vm.t('common.clearSearch', 'Limpiar búsqueda')}
          </Button>
        </div>
      </Card>
    );
  }

  // ========================
  // CONVERSATIONS LIST
  // ========================

  else {
    content = (
      <div className="space-y-3">
        {vm.data.conversations.map((contact: UserPublicProfile) => (
          <ConversationPreview
            key={contact.id}
            contact={contact}
            unreadCount={vm.data.unreadCounts[contact.id] || 0}
          />
        ))}
      </div>
    );
  }

  // ========================
  // MAIN RENDER
  // ========================

  return (
    <div className="container mx-auto max-w-4xl py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading1 size="large">
            {vm.t('messages.title', 'Mensajes')}
          </Heading1>
          <BodyText className="text-muted-foreground mt-1">
            {vm.t('messages.subtitle', 'Conversa con tus contactos')}
          </BodyText>
        </div>
        
        {/* Total Unread Badge */}
        {vm.data.totalUnread > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
            <MessageSquare className="h-4 w-4 text-primary" />
            <BodyText weight="medium" className="text-primary">
              {vm.data.totalUnread > 99 ? '99+' : vm.data.totalUnread}
            </BodyText>
          </div>
        )}
      </div>

      {/* Search Bar */}
      {!vm.state.hasNoContacts && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder={vm.t('messages.searchPlaceholder', 'Buscar contactos...')}
            value={vm.filters.searchInput}
            onChange={(e) => vm.actions.handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Content (state-dependent) */}
      {content}

      {/* Footer Info */}
      {!vm.state.isEmpty && (
        <div className="text-center">
          <BodyText size="small" className="text-muted-foreground">
            {vm.t('messages.totalContacts', { count: vm.data.total, defaultValue: `${vm.data.total} contactos en total` })}
          </BodyText>
        </div>
      )}
    </div>
  );
}
