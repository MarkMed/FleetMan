import React from "react";
import { Heading1, BodyText, Button, Card } from "@components/ui";
import { Users, AlertCircle, UserPlus } from "lucide-react";
import { ContactCard } from "@components/users/ContactCard";
import { useMyContactsViewModel } from "../../viewModels/users/useMyContactsViewModel";
import { modal } from "@helpers/modal";

/**
 * MyContactsScreen (View Layer - MVVM)
 *
 * Sprint #12 - Module 2: User Communication System (Contact Management)
 *
 * Purpose:
 * - Display user's personal contact list
 * - Allow removing contacts (with confirmation)
 * - Placeholder for messaging (Module 3)
 * - Navigate to discovery screen when empty
 *
 * Features:
 * - List of contacts (ContactCard components)
 * - Empty state with call-to-action
 * - Remove confirmation modal
 * - Loading and error states
 * - Total contacts counter
 *
 * Architecture:
 * - View Layer: Only rendering and UI structure (this file)
 * - Business Logic: Handled by useMyContactsViewModel
 * - Data Layer: API calls via contactService
 *
 * Pattern:
 * - Consumes ViewModel via useMyContactsViewModel()
 * - NO business logic in this component
 * - Renders based on ViewModel state/data/actions/modals
 *
 * @example
 * ```tsx
 * // Route: /contacts
 * <Route path="/contacts" element={<MyContactsScreen />} />
 * ```
 */
export function MyContactsScreen() {
  // ========================
  // ViewModel (Business Logic)
  // ========================

  const vm = useMyContactsViewModel();

  // ========================
  // RENDER SECTIONS
  // ========================

  // Determine which content to show based on state
  let content;

  /**
   * Show confirmation modal for contact removal
   * Uses global modal to avoid duplicate modal components (DRY principle)
   * 
   * @param contactId - ID of contact to remove
   */
  const handleRemoveContact = (contactId: string) => {
    modal.show({
      title: vm.t('users.contacts.confirmRemoveTitle'),
      description: vm.t('users.contacts.confirmRemoveMessage', { 
        companyName: vm.data.contacts.find(c => c.id === contactId)?.profile.companyName || 'Sin nombre'
      }),
      showConfirm: true,
      showCancel: true,
      confirmText: vm.t('users.contacts.confirmRemoveButton'),
      cancelText: vm.t('users.contacts.cancelRemoveButton'),
      variant: "warning",
	  confirmButtonVariant: "ghost",
      confirmButtonClassName: "bg-transparent hover:bg-warning/10 text-warning border-warning border",
      onConfirm: async () => {
        // Call ViewModel's remove handler directly with the contactId
        await vm.actions.handleRemoveContactDirect(contactId);
        // Modal closes automatically after onConfirm completes
      },
    });
  };

  // ========================
  // ERROR STATE
  // ========================

  if (vm.state.error) {
    content = (
      <Card className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <BodyText className="text-destructive">
            {vm.t("common.error")}
          </BodyText>
          <BodyText size="small" className="text-muted-foreground">
            {vm.state.error.message}
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
          <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
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
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>

          <div className="space-y-2 flex flex-col items-center justify-center">
            <Heading1 size="medium" className="text-foreground">
              {vm.t("users.contacts.noContacts")}
            </Heading1>
            <BodyText className="text-muted-foreground max-w-md text-center">
              {vm.t("users.contacts.noContactsDescription")}
            </BodyText>
          </div>

          <Button
            variant="filled"
            onPress={vm.actions.handleExploreUsers}
            className="mt-2"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {vm.t("users.contacts.exploreUsers")}
          </Button>
        </div>
      </Card>
    );
  }

  // ========================
  // CONTACTS LIST
  // ========================
  else {
    content = (
      <div className="space-y-4">
        {/* Contacts Counter */}
        <div className="flex items-center justify-between">
          <BodyText size="small" className="text-muted-foreground">
            {vm.t("users.contacts.totalCount", { count: vm.data.total })}
          </BodyText>
        </div>

        {/* Contacts List (vertical layout) */}
        <div className="flex flex-col gap-3">
          {vm.data.contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              user={contact}
              onSendMessage={vm.actions.handleSendMessage}
              onRemove={() => handleRemoveContact(contact.id)}
            />
          ))}
        </div>
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
        <Heading1 size="headline" className="tracking-tight text-foreground">
          {vm.t("users.contacts.title")}
        </Heading1>
        <BodyText className="text-muted-foreground">
          {vm.t("users.contacts.subtitle")}
        </BodyText>
      </div>

      {/* Content (dynamic based on state) */}
      {content}

      {/* Note: Using global modal for confirmations (DRY principle) */}
      {/* Old: <ConfirmRemoveContactModal /> - Removed to avoid duplicate modal logic */}

      {/* TODO POST-MVP: Add more features (Module 3+) */}
      {/* - Search/filter contacts */}
      {/* - Sort by name, date added, type, last interaction */}
      {/* - Bulk actions (remove multiple, export list) */}
      {/* - Contact groups/tags */}
      {/* - Favorite contacts (pin to top) */}
      {/* - Contact statistics modal (interaction history) */}
    </div>
  );
}

// =============================================================================
// FUTURE ENHANCEMENTS (Strategic, commented for post-MVP)
// =============================================================================

/**
 * TODO: Add search bar for filtering contacts
 * Útil cuando usuario tiene muchos contactos
 *
 * @example
 * <Input
 *   value={searchTerm}
 *   onChange={(e) => setSearchTerm(e.target.value)}
 *   placeholder="Buscar contactos..."
 * />
 */

/**
 * TODO: Add sorting dropdown (by name, date, type, last interaction)
 * Útil para organizar lista
 *
 * @example
 * <Select value={sortBy} onValueChange={setSortBy}>
 *   <SelectItem value="name">Nombre</SelectItem>
 *   <SelectItem value="date">Fecha agregado</SelectItem>
 *   <SelectItem value="type">Tipo</SelectItem>
 * </Select>
 */

/**
 * TODO: Add filter chips (by user type, verified status, etc.)
 * Similar a UserDiscoveryScreen filters
 *
 * @example
 * <div className="flex gap-2">
 *   <Button variant={filter === 'ALL' ? 'filled' : 'outline'}>
 *     Todos
 *   </Button>
 *   <Button variant={filter === 'CLIENT' ? 'filled' : 'outline'}>
 *     Clientes
 *   </Button>
 * </div>
 */

/**
 * TODO: Add pagination (if contacts > 50)
 * Similar a UserDiscoveryScreen pagination
 *
 * @example
 * <div className="flex items-center justify-center gap-2 mt-6">
 *   <Button disabled={!canGoPrevious} onClick={handlePreviousPage}>
 *     Anterior
 *   </Button>
 *   <BodyText>Página {page} de {totalPages}</BodyText>
 *   <Button disabled={!canGoNext} onClick={handleNextPage}>
 *     Siguiente
 *   </Button>
 * </div>
 */

/**
 * TODO: Add bulk selection mode (checkbox on each card)
 * Útil para eliminar múltiples contactos
 *
 * @example
 * const [selectedIds, setSelectedIds] = useState<string[]>([]);
 * const [isBulkMode, setIsBulkMode] = useState(false);
 *
 * {isBulkMode && (
 *   <Button variant="destructive" onClick={handleBulkRemove}>
 *     Eliminar {selectedIds.length} contactos
 *   </Button>
 * )}
 */

/**
 * TODO: Add contact groups/categories section
 * Útil para organizar contactos por proyecto, región, etc.
 *
 * @example
 * <Tabs value={selectedGroup} onValueChange={setSelectedGroup}>
 *   <TabsList>
 *     <TabsTrigger value="all">Todos</TabsTrigger>
 *     <TabsTrigger value="favorites">Favoritos</TabsTrigger>
 *     <TabsTrigger value="providers">Proveedores</TabsTrigger>
 *   </TabsList>
 * </Tabs>
 */
