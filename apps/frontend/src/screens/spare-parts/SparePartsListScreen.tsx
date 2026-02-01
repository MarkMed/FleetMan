import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heading1, BodyText, Button, Card, Input } from "@components/ui";
import { Plus, AlertCircle, Package, Search, ArrowLeft, X } from "lucide-react";
import {
  SparePartCard,
  CreateEditSparePartModal,
  SparePartOptionsModal,
  DeleteConfirmModal,
} from "@components/spare-parts";
import { useSparePartsViewModel } from "../../viewModels/spare-parts";

/**
 * SparePartsListScreen (View Layer - MVVM)
 *
 * Sprint #15/16 Task 7.1: Displays spare parts inventory for a specific machine.
 * Shows part cards with name, serialId, and amount.
 * Allows creating, viewing, editing, and deleting parts.
 *
 * Architecture:
 * - View Layer: Only rendering and UI structure (this file)
 * - Business Logic: Handled by useSparePartsViewModel
 * - Data Layer: API calls via sparePartService
 *
 * Search Strategy (per user requirement):
 * - Client-side filtering for inventories < 50 parts
 * - Server-side search for large inventories >= 50 parts
 * - Automatic detection and switching in ViewModel
 *
 * Pattern:
 * - Consumes ViewModel via useSparePartsViewModel(machineId)
 * - NO business logic in this component
 * - Renders based on ViewModel state/data/actions
 *
 * @example
 * ```tsx
 * // Route: /machines/:id/spare-parts
 * <Route path="/machines/:id/spare-parts" element={<SparePartsListScreen />} />
 * ```
 */
const stickyClassStyles = "sticky top-[60px] z-10 backdrop-blur-sm";
export function SparePartsListScreen() {
  const { id: machineId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ========================
  // ViewModel (Business Logic)
  // ========================

  const vm = useSparePartsViewModel(machineId);

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
      <div className="space-y-8">
        <Heading1 size="headline">{vm.t("spareParts.title")}</Heading1>
        <Card className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <BodyText className="text-destructive">
              {vm.t("common.error")}
            </BodyText>
            <BodyText size="small" className="text-muted-foreground">
              {vm.state.error}
            </BodyText>
            <Button variant="outline" onPress={vm.actions.handleRetry}>
              {vm.t("common.retry")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ========================
  // LOADING STATE
  // ========================
  else if (vm.state.isLoading) {
    content = (
      <div className="space-y-8">
        <Heading1 size="headline">{vm.t("spareParts.title")}</Heading1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // ========================
  // EMPTY STATE
  // ========================
  else if (vm.data.isEmpty) {
    content = (
      <div className={`space-y-4 ${stickyClassStyles}`}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/machines" className="hover:text-foreground">
            {vm.t("machines.breadcrumb.machines")}
          </Link>
          <span>/</span>
          <Link to={`/machines/${machineId}`} className="hover:text-foreground">
            {vm.t("machines.breadcrumb.detail")}
          </Link>
          <span>/</span>
          <span className="text-foreground">
            {vm.t("spareParts.breadcrumb")}
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
          <div>
            <Heading1
              size="headline"
              className="tracking-tight text-foreground"
            >
              {vm.t("spareParts.title")}
            </Heading1>
            <BodyText className="text-muted-foreground">
              {vm.t("spareParts.subtitle")}
            </BodyText>
          </div>
        </div>

        {/* Empty State Card */}
        <Card className="p-12">
          <div className="flex flex-col items-center text-center space-y-4 max-w-md mx-auto">
            <div className="rounded-full bg-primary/10 p-6">
              <Package className="h-16 w-16 text-primary" />
            </div>
            <Heading1 size="headline" className="text-foreground">
              {vm.t("spareParts.empty.title")}
            </Heading1>
            <BodyText className="text-muted-foreground">
              {vm.t("spareParts.empty.description")}
            </BodyText>
            <Button
              variant="filled"
              onPress={vm.actions.handleCreateNew}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              {vm.t("spareParts.empty.action")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ========================
  // MAIN RENDER (Spare Parts List)
  // ========================
  else {
    content = (
      <div className={`space-y-4`}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/machines" className="hover:text-foreground">
            {vm.t("machines.breadcrumb.machines")}
          </Link>
          <span>/</span>
          <Link to={`/machines/${machineId}`} className="hover:text-foreground">
            {vm.t("machines.breadcrumb.detail")}
          </Link>
          <span>/</span>
          <span className="text-foreground">
            {vm.t("spareParts.breadcrumb")}
          </span>
        </div>
        
        {/* Header, Search Bar, and Actions */}
        <div className={`space-y-4 ${stickyClassStyles}`}>
          {/* Header with Stats and Create Button */}
          <div
            className={`flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4`}
          >
            <div>
              <Heading1
                size="headline"
                className="tracking-tight text-foreground"
              >
                {vm.t("spareParts.title")}
              </Heading1>
              <BodyText className="text-muted-foreground">
                {vm.t("spareParts.showing", {
                  count: vm.data.displayCount,
                  total: vm.data.total,
                })}
              </BodyText>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 w-full">
              <Button
                variant="outline"
                onPress={() => navigate(`/machines/${machineId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {vm.t("common.back")}
              </Button>
              <Button variant="filled" onPress={vm.actions.handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                {vm.t("spareParts.createNew")}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <Input
              value={vm.state.searchInput}
              onChange={(e) =>
                vm.actions.handleSearchInputChange(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  vm.actions.handleSearch();
                }
              }}
              placeholder={vm.t("spareParts.searchPlaceholder")}
              className="flex-1"
            />
            {/* Show Search button when: no active search OR input changed */}
            {(!vm.state.searchQuery || vm.state.searchInput !== vm.state.searchQuery) && (
              <Button
                variant="outline"
                size="sm"
                onPress={vm.actions.handleSearch}
                disabled={vm.state.isLoading}
                className="px-3 bg-blue-500/10"
              >
                <Search className="w-4 h-4 mr-1" />
                {vm.t("common.search")}
              </Button>
            )}
            {/* Show Clear button when: active search AND input hasn't changed */}
            {vm.state.searchQuery && vm.state.searchInput === vm.state.searchQuery && (
              <Button
                variant="destructive"
                size="sm"
                onPress={vm.actions.handleClearSearch}
                disabled={vm.state.isLoading}
                className="px-3 opacity-80"
              >
                <X className="w-4 h-4" />
                {vm.t("common.clear")}
              </Button>
            )}
          </div>
        </div>

        {/* Spare Parts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vm.data.filteredParts.map((part: any) => (
            <SparePartCard
              key={part.id}
              sparePart={part}
              onView={vm.actions.handleViewPart}
              onOptions={vm.actions.handleOpenOptions}
            />
          ))}
        </div>

        {/* No Results Message (when search filters all parts) */}
        {vm.state.searchQuery && vm.data.displayCount === 0 && (
          <Card className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <Search className="h-12 w-12 text-muted-foreground" />
              <BodyText className="text-muted-foreground">
                {vm.t("spareParts.noResults", { query: vm.state.searchQuery })}
              </BodyText>
            </div>
          </Card>
        )}
      </div>
    );
  }

  // ========================
  // RETURN MAIN LAYOUT
  // ========================

  return (
    <div className="space-y-6">
      {content}

      {/* Modals */}
      <CreateEditSparePartModal {...vm.modals.createEdit} />
      <SparePartOptionsModal {...vm.modals.options} />
      <DeleteConfirmModal {...vm.modals.deleteConfirm} />
    </div>
  );
}

// 🔮 POST-MVP: Strategic enhancements (commented)

/**
 * TODO (v0.0.2): Add low stock filter button
 * - Quick filter to show only low stock parts
 * - Badge with count on button
 * - Visual prominence for inventory management
 *
 * UI Addition (in header):
 * <Button
 *   variant={showLowStockOnly ? 'filled' : 'outline'}
 *   onPress={() => setShowLowStockOnly(!showLowStockOnly)}
 * >
 *   <AlertTriangle className="h-4 w-4 mr-2" />
 *   {vm.t('spareParts.lowStock')}
 *   {lowStockCount > 0 && (
 *     <Badge variant="destructive" className="ml-2">{lowStockCount}</Badge>
 *   )}
 * </Button>
 */

/**
 * TODO (v0.0.3): Add sort dropdown
 * - Sort by: Name, Serial ID, Amount, Date Added
 * - Ascending/Descending toggle
 * - Persist preference in localStorage
 *
 * UI Addition (in header):
 * <Select value={sortBy} onValueChange={setSortBy}>
 *   <SelectTrigger className="w-48">
 *     <SelectValue placeholder={vm.t('spareParts.sortBy')} />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="name">{vm.t('spareParts.sortName')}</SelectItem>
 *     <SelectItem value="serialId">{vm.t('spareParts.sortSerialId')}</SelectItem>
 *     <SelectItem value="amount">{vm.t('spareParts.sortAmount')}</SelectItem>
 *     <SelectItem value="createdAt">{vm.t('spareParts.sortDate')}</SelectItem>
 *   </SelectContent>
 * </Select>
 */

/**
 * TODO (v0.0.4): Add export to CSV button
 * - Export current filtered/sorted list
 * - Include all fields (name, serialId, amount, dates)
 * - Auto-download with machine serial number in filename
 *
 * UI Addition (in header):
 * <Button variant="outline" onPress={vm.actions.handleExportCSV}>
 *   <Download className="h-4 w-4 mr-2" />
 *   {vm.t('spareParts.export')}
 * </Button>
 */

/**
 * TODO (v0.0.5): Add bulk selection mode
 * - Select multiple parts for bulk operations
 * - Bulk delete, bulk amount adjustment
 * - Toolbar appears when parts selected
 *
 * UI Addition:
 * {isBulkMode && (
 *   <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border rounded-lg shadow-lg p-4">
 *     <div className="flex items-center gap-4">
 *       <BodyText>{vm.t('spareParts.selected', { count: selectedCount })}</BodyText>
 *       <Button variant="outline" onPress={vm.actions.handleDeselectAll}>
 *         {vm.t('common.deselectAll')}
 *       </Button>
 *       <Button variant="destructive" onPress={vm.actions.handleBulkDelete}>
 *         {vm.t('common.deleteSelected')}
 *       </Button>
 *     </div>
 *   </div>
 * )}
 */

/**
 * TODO (v0.0.6): Add grid/list view toggle
 * - Switch between grid cards and table rows
 * - Table view shows more details (dates, etc.)
 * - Persist preference
 *
 * UI Addition (in header):
 * <div className="flex gap-1 border rounded-lg">
 *   <Button
 *     variant={viewMode === 'grid' ? 'filled' : 'ghost'}
 *     size="sm"
 *     onPress={() => setViewMode('grid')}
 *   >
 *     <Grid className="h-4 w-4" />
 *   </Button>
 *   <Button
 *     variant={viewMode === 'list' ? 'filled' : 'ghost'}
 *     size="sm"
 *     onPress={() => setViewMode('list')}
 *   >
 *     <List className="h-4 w-4" />
 *   </Button>
 * </div>
 */
