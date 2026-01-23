import React, { useState } from "react";
import { Heading1, BodyText, Button, Card, Input, Modal } from "@components/ui";
import {
  Search,
  AlertCircle,
  MessageSquare,
  UserPlus,
  MoreVertical,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConversationPreview } from "@components/messaging";
import { useConversationsListViewModel } from "../../viewModels/messaging/useConversationsListViewModel";
import { ROUTES } from "@constants";

/**
 * ConversationsListScreen (View Layer - MVVM)
 *
 * Sprint #13 - Recent Conversations Inbox Feature
 *
 * Purpose:
 * - Display list of recent conversations with last message preview
 * - Filter by contact status (All/Contacts/Non-Contacts)
 * - Search conversations by display name
 * - Navigate to specific chat
 *
 * Architecture Changes (Sprint #13):
 * - REPLACED: Contact-based list → Conversation-based list
 * - ADDED: Last message preview and timestamp
 * - ADDED: Sidebar with filters (3-column grid layout)
 * - ADDED: Backend-driven filtering and search
 * - IMPROVED: Shows conversations with non-contacts too
 *
 * MVP Scope:
 * - ✅ Show all conversations ordered by most recent
 * - ✅ Last message preview with timestamp
 * - ✅ Filter: All / Contacts / Non-Contacts
 * - ✅ Search by display name
 * - ✅ Pagination with backend
 * - ❌ NO unread count from backend (uses client Zustand)
 *
 * Layout Pattern:
 * - Imitates UserDiscoveryScreen.tsx 3-column grid:
 *   - Left sidebar (1 col): Filters and search
 *   - Main content (2 cols): Conversations list + pagination
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

  // Modal state
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  // Modal handlers
  const handleOpenOptionsModal = () => setIsOptionsModalOpen(true);
  const handleCloseOptionsModal = () => setIsOptionsModalOpen(false);
  const handleNavigateToMyContacts = () => {
    handleCloseOptionsModal();
    navigate(ROUTES.MY_CONTACTS);
  };
  const handleNavigateToDiscovery = () => {
    handleCloseOptionsModal();
    navigate(ROUTES.CONTACT_DISCOVERY);
  };

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
            {vm.t("common.error")}
          </BodyText>
          <BodyText size="small" className="text-muted-foreground">
            {vm.state.error?.message ||
              vm.t("messages.loadError", "Error al cargar conversaciones")}
          </BodyText>
          <Button variant="outline" onPress={vm.actions.handleRetry}>
            {vm.t("common.retry")}
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
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  // ========================
  // EMPTY STATE
  // ========================
  else if (vm.state.isEmpty) {
    // Determine empty message based on filters
    let emptyMessage = vm.t(
      "messages.noConversations",
      "No hay conversaciones aún"
    );
    let emptyDescription = vm.t(
      "messages.noConversationsDescription",
      "Comienza enviando un mensaje a uno de tus contactos"
    );

    if (vm.filters.contactFilter === true) {
      emptyMessage = vm.t(
        "messages.noContactConversations",
        "No hay conversaciones con contactos"
      );
      emptyDescription = vm.t(
        "messages.noContactConversationsDescription",
        "Envía mensajes a tus contactos para que aparezcan aquí"
      );
    } else if (vm.filters.contactFilter === false) {
      emptyMessage = vm.t(
        "messages.noNonContactConversations",
        "No hay conversaciones con no-contactos"
      );
      emptyDescription = vm.t(
        "messages.noNonContactConversationsDescription",
        "Las conversaciones con usuarios que no son contactos aparecerán aquí"
      );
    }

    if (vm.state.hasActiveFilters && vm.filters.searchTerm) {
      emptyMessage = vm.t("messages.noSearchResults", "Sin resultados");
      emptyDescription = vm.t(
        "messages.noSearchResultsDescription",
        "No se encontraron conversaciones que coincidan con tu búsqueda"
      );
    }

    content = (
      <Card className="p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <MessageSquare className="h-16 w-16 text-muted-foreground" />
          <Heading1 size="medium" className="text-muted-foreground">
            {emptyMessage}
          </Heading1>
          <BodyText className="text-muted-foreground max-w-md">
            {emptyDescription}
          </BodyText>
          {vm.state.hasActiveFilters ? (
            <Button variant="outline" onPress={vm.actions.handleClearFilters}>
              {vm.t("messages.clearFilters", "Limpiar filtros")}
            </Button>
          ) : (
            <Button
              variant="filled"
              onPress={() => navigate(ROUTES.CONTACT_DISCOVERY)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {vm.t("messages.discoverUsers", "Descubrir usuarios")}
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // ========================
  // CONVERSATIONS LIST
  // ========================
  else {
    content = (
      <div className="space-y-4">
        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <BodyText size="small" className="text-muted-foreground">
            {vm.t("messages.resultsCount", {
              start: vm.data.pagination.rangeStart,
              end: vm.data.pagination.rangeEnd,
              total: vm.data.total,
              defaultValue: `Mostrando {{start}}-{{end}} de {{total}} conversaciones`,
            })}
          </BodyText>

          {vm.state.hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onPress={vm.actions.handleClearFilters}
            >
              {vm.t("messages.clearFilters", "Limpiar filtros")}
            </Button>
          )}
        </div>

        {/* Conversations List */}
        <div className="flex flex-col gap-3">
          {vm.data.conversations.map((conversation) => (
            <ConversationPreview
              key={conversation.otherUserId}
              conversation={conversation}
              unreadCount={vm.data.unreadCounts[conversation.otherUserId] || 0}
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
              {vm.t("common.previous", "Anterior")}
            </Button>

            <BodyText size="small" className="text-muted-foreground px-4">
              {vm.t("messages.pageInfo", {
                current: vm.data.currentPage,
                total: vm.data.totalPages,
                defaultValue: "Página {{current}} de {{total}}",
              })}
            </BodyText>

            <Button
              variant="outline"
              size="sm"
              onPress={vm.actions.handleNextPage}
              disabled={!vm.data.pagination.canGoNext}
            >
              {vm.t("common.next", "Siguiente")}
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
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Heading1
              size="headline"
              className="tracking-tight text-foreground"
            >
              {vm.t("messages.title", "Mensajes")}
            </Heading1>
            <div className="flex items-center gap-3 mt-1">
              <BodyText className="text-muted-foreground">
                {vm.t("messages.subtitle", "Tus conversaciones recientes")}
              </BodyText>
              {vm.data.totalUnread > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/20 rounded-full border border-blue-200 dark:border-blue-800">
                  <BodyText
                    weight="bold"
                    className="text-blue-600 dark:text-blue-400"
                  >
                    {vm.data.totalUnread}
                  </BodyText>
                  <BodyText className="text-muted-foreground">
                    {vm.t("messages.unread", "sin leer")}
                  </BodyText>
                </div>
              )}
            </div>
          </div>

          {/* Options Button */}
          <Button
            variant="outline"
            size="lg"
            onPress={handleOpenOptionsModal}
            className="flex items-center gap-2 border-white/10 hover:border-white"
          >
            <MoreVertical className="w-4 h-4" />

            <BodyText weight="medium">
              {vm.t("messages.options", "Opciones")}
            </BodyText>
          </Button>
        </div>
      </div>

      {/* Grid Layout: Sidebar (1 col) + Content (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ======================== */}
        {/* SIDEBAR: Filters (Left - 1 column) */}
        {/* ======================== */}
        <aside className="lg:col-span-1">
          <div className="p-4 space-y-4 lg:sticky lg:top-36">
            {/* Search Section */}
            <div className="space-y-2">
              <BodyText
                weight="medium"
                size="small"
                className="text-foreground"
              >
                {vm.t("messages.searchTitle", "Buscar")}
              </BodyText>
              <div className="flex gap-2">
                <Input
                  value={vm.filters.searchInput}
                  onChange={(e) =>
                    vm.actions.handleSearchInputChange(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      vm.actions.handleSearch();
                    }
                  }}
                  placeholder={vm.t(
                    "messages.searchPlaceholder",
                    "Buscar por nombre..."
                  )}
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

            {/* Contact Filter Section */}
            <div className="space-y-2">
              <BodyText
                weight="medium"
                size="small"
                className="text-foreground"
              >
                {vm.t("messages.filterByType", "Filtrar por tipo")}
              </BodyText>
              <div className="flex flex-col gap-2">
                <Button
                  variant={
                    vm.filters.contactFilter === undefined
                      ? "filled"
                      : "outline"
                  }
                  size="sm"
                  onPress={() =>
                    vm.actions.handleContactFilterChange(undefined)
                  }
                  className="w-full justify-start"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {vm.t("messages.filterAll", "Todas las conversaciones")}
                </Button>
                <Button
                  variant={
                    vm.filters.contactFilter === true ? "filled" : "outline"
                  }
                  size="sm"
                  onPress={() => vm.actions.handleContactFilterChange(true)}
                  className="w-full justify-start"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {vm.t("messages.filterContacts", "Solo contactos")}
                </Button>
                <Button
                  variant={
                    vm.filters.contactFilter === false ? "filled" : "outline"
                  }
                  size="sm"
                  onPress={() => vm.actions.handleContactFilterChange(false)}
                  className="w-full justify-start"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {vm.t("messages.filterNonContacts", "Solo no-contactos")}
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
                  {vm.t("messages.clearFilters", "Limpiar filtros")}
                </Button>
              </>
            )}
          </div>
        </aside>

        {/* ======================== */}
        {/* MAIN CONTENT: Conversations List (Right - 2 columns) */}
        {/* ======================== */}
        <main className="lg:col-span-2">{content}</main>
      </div>

      {/* Options Modal */}
      <Modal
        open={isOptionsModalOpen}
        onOpenChange={setIsOptionsModalOpen}
        title={vm.t("messages.options", "Opciones")}
        showCloseButton={true}
      >
        <div className="flex flex-col gap-2 p-4">
          {/* My Contacts Option */}
          <Button
            variant="outline"
            onPress={handleNavigateToMyContacts}
            className="h-auto py-4 px-4 justify-start text-left bg-[hsl(var(--color-card))] hover:bg-accent"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="mt-0.5">
                <Users className="h-7 w-7" />
              </div>
              <div className="flex flex-col">
                <BodyText weight="medium" size="medium">
                  {vm.t("messages.myContacts", "Mis Contactos")}
                </BodyText>
                <BodyText size="regular" className="text-muted-foreground">
                  {vm.t(
                    "messages.myContactsDesc",
                    "Ver y gestionar mis contactos"
                  )}
                </BodyText>
              </div>
            </div>
          </Button>

          {/* Discover Contacts Option */}
          <Button
            variant="outline"
            onPress={handleNavigateToDiscovery}
            className="h-auto py-4 px-4 justify-start text-left bg-[hsl(var(--color-card))] hover:bg-accent"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="mt-0.5">
                <UserPlus className="h-7 w-7" />
              </div>
              <div className="flex flex-col">
                <BodyText weight="medium" size="medium">
                  {vm.t("messages.discoverUsers", "Descubrir Contactos")}
                </BodyText>
                <BodyText size="regular" className="text-muted-foreground">
                  {vm.t(
                    "messages.discoverUsersDesc",
                    "Buscar nuevos contactos"
                  )}
                </BodyText>
              </div>
            </div>
          </Button>
        </div>
      </Modal>
    </div>
  );
}
