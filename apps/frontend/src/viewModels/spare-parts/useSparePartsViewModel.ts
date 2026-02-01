import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  useSpareParts, 
  useCreateSparePart,
  useUpdateSparePart,
  useDeleteSparePart,
} from '@hooks/useSpareParts';
import { useToast } from '@hooks/useToast';
import type { CreateSparePartRequest, UpdateSparePartRequest } from '@contracts';

/**
 * Type for spare part entity from backend
 * Matches ISparePart from domain layer
 */
interface SparePart {
  id: string;
  name: string;
  serialId: string;
  amount: number;
  machineId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * ViewModel: SparePartsListScreen Business Logic
 * 
 * Responsibilities (MVVM-lite):
 * - Manage local state (modals, selected part, search filter)
 * - Fetch spare parts list from API via hooks
 * - Handle user actions (create, edit, delete, view, search)
 * - Compute derived data (filtered parts, isEmpty, total count)
 * - Provide i18n access for View
 * 
 * Pattern:
 * - View (SparePartsListScreen.tsx) calls this hook
 * - ViewModel returns { state, data, modals, actions, t }
 * - View renders based on ViewModel output (no business logic in View)
 * 
 * Search Strategy (per user requirement):
 * - Client-side filtering when total parts <= 1 page (< 50 items)
 * - Server-side filtering when total parts > 1 page (>= 50 items)
 * - Automatic detection via parts.length check
 * 
 * @param machineId - Machine UUID
 * 
 * @example
 * ```tsx
 * function SparePartsListScreen() {
 *   const { id: machineId } = useParams();
 *   const vm = useSparePartsViewModel(machineId);
 *   
 *   if (vm.state.isLoading) return <Loading />;
 *   if (vm.state.error) return <Error onRetry={vm.actions.handleRetry} />;
 *   
 *   return (
 *     <div>
 *       <SearchBar
 *         value={vm.state.searchQuery}
 *         onChange={vm.actions.handleSearchChange}
 *       />
 *       <Button onClick={vm.actions.handleCreateNew}>New Part</Button>
 *       <SparePartsList
 *         parts={vm.data.filteredParts}
 *         onViewPart={vm.actions.handleViewPart}
 *         onEditPart={vm.actions.handleEditPart}
 *         onDeletePart={vm.actions.handleDeletePart}
 *       />
 *       <CreateEditSparePartModal {...vm.modals.createEdit} />
 *       <SparePartOptionsModal {...vm.modals.options} />
 *       <DeleteConfirmModal {...vm.modals.deleteConfirm} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useSparePartsViewModel(machineId: string | undefined) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  // ========================
  // STATE MANAGEMENT
  // ========================
  
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(''); // What user types
  const [searchQuery, setSearchQuery] = useState(''); // Active search filter

  // ========================
  // DATA FETCHING
  // ========================
  
  const { data, isLoading, error, refetch } = useSpareParts(machineId);
  const createMutation = useCreateSparePart();
  const updateMutation = useUpdateSparePart();
  const deleteMutation = useDeleteSparePart();

  // ========================
  // DERIVED DATA
  // ========================
  
  const allParts = data?.data || [];
  const total = data?.count || 0;
  const isEmpty = total === 0;
  
  // Search strategy: Client-side filtering (per user requirement)
  // Server-side search only if total > 50 (pagination threshold)
  const filteredParts = useMemo(() => {
    if (!searchQuery.trim()) return allParts;
    
    // TODO (v0.0.2): Implement server-side search when total > 50
    // if (total > 50) {
    //   // Trigger server-side search via API
    //   // API: GET /spare-parts/machine/:machineId?search=query
    //   return allParts; // Keep displaying current results while fetching
    // }
    
    // Client-side filtering (case-insensitive)
    const query = searchQuery.toLowerCase().trim();
    return allParts.filter((part: SparePart) => 
      part.name.toLowerCase().includes(query) ||
      part.serialId.toLowerCase().includes(query)
    );
  }, [allParts, searchQuery, total]);
  
  const displayCount = filteredParts.length;
  
  // ========================
  // BUSINESS LOGIC ACTIONS
  // ========================
  
  /**
   * Open create modal (no selected part = create mode)
   */
  const handleCreateNew = () => {
    setSelectedPart(null);
    setIsCreateEditModalOpen(true);
  };
  
  /**
   * Navigate to spare part detail screen
   * Route: /machines/:machineId/spare-parts/:sparePartId
   */
  const handleViewPart = (part: SparePart) => {
    navigate(`/machines/${machineId}/spare-parts/${part.id}`);
  };
  
  /**
   * Open edit modal with selected part (edit mode)
   */
  const handleEditPart = (part: SparePart) => {
    setSelectedPart(part);
    setIsCreateEditModalOpen(true);
    setIsOptionsModalOpen(false); // Close options modal if open
  };
  
  /**
   * Open options modal for part actions
   */
  const handleOpenOptions = (part: SparePart) => {
    setSelectedPart(part);
    setIsOptionsModalOpen(true);
  };
  
  /**
   * Open delete confirmation modal
   */
  const handleOpenDeleteConfirm = (part: SparePart) => {
    setSelectedPart(part);
    setIsDeleteConfirmOpen(true);
    setIsOptionsModalOpen(false); // Close options modal if open
  };
  
  /**
   * Create new spare part
   */
  const handleCreatePart = async (partData: Omit<CreateSparePartRequest, 'machineId'>) => {
    try {
      await createMutation.mutateAsync({
        machineId: machineId!,
        data: partData
      });
      
      toast({
        title: t('spareParts.notifications.created'),
        variant: 'success',
      });
      
      setIsCreateEditModalOpen(false);
      setSelectedPart(null);
    } catch (error: any) {
      console.error('[useSparePartsViewModel] Error creating part:', error);
      
      // Handle specific error cases
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        toast({
          title: t('spareParts.notifications.duplicateSerialId'),
          description: t('spareParts.notifications.duplicateSerialIdDesc'),
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('common.error'),
          description: error.message || t('spareParts.notifications.createError'),
          variant: 'destructive',
        });
      }
      
      throw error; // Re-throw to keep modal open
    }
  };
  
  /**
   * Update existing spare part
   */
  const handleUpdatePart = async (
    sparePartId: string, 
    updates: UpdateSparePartRequest
  ) => {
    try {
      await updateMutation.mutateAsync({
        machineId: machineId!,
        sparePartId,
        updates,
      });
      
      toast({
        title: t('spareParts.notifications.updated'),
        variant: 'success',
      });
      
      setIsCreateEditModalOpen(false);
      setSelectedPart(null);
    } catch (error: any) {
      console.error('[useSparePartsViewModel] Error updating part:', error);
      
      // Handle specific error cases
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        toast({
          title: t('spareParts.notifications.duplicateSerialId'),
          description: t('spareParts.notifications.duplicateSerialIdDesc'),
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('common.error'),
          description: error.message || t('spareParts.notifications.updateError'),
          variant: 'destructive',
        });
      }
      
      throw error; // Re-throw to keep modal open
    }
  };
  
  /**
   * Delete spare part permanently
   */
  const handleConfirmDelete = async () => {
    if (!selectedPart) return;
    
    try {
      await deleteMutation.mutateAsync({
        machineId: machineId!,
        sparePartId: selectedPart.id,
      });
      
      toast({
        title: t('spareParts.notifications.deleted'),
        variant: 'success',
      });
      
      setIsDeleteConfirmOpen(false);
      setSelectedPart(null);
    } catch (error: any) {
      console.error('[useSparePartsViewModel] Error deleting part:', error);
      
      toast({
        title: t('common.error'),
        description: error.message || t('spareParts.notifications.deleteError'),
        variant: 'destructive',
      });
    }
  };
  
  /**
   * Handle search input change (while typing)
   */
  const handleSearchInputChange = (input: string) => {
    setSearchInput(input);
  };
  
  /**
   * Execute search (on button click or Enter)
   */
  const handleSearch = () => {
    setSearchQuery(searchInput);
    
    // TODO (v0.0.2): Trigger server-side search if total > 50
    // if (total > 50) {
    //   // Call API with search param
    //   serverSearch(searchInput);
    // }
  };
  
  /**
   * Clear search and reset to show all items
   */
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };
  
  /**
   * Close all modals and reset selected part
   */
  const handleCloseModals = () => {
    setIsCreateEditModalOpen(false);
    setIsOptionsModalOpen(false);
    setIsDeleteConfirmOpen(false);
    setSelectedPart(null);
  };
  
  /**
   * Retry fetching spare parts after error
   */
  const handleRetry = () => {
    refetch();
  };

  // ========================
  // RETURN VIEWMODEL API
  // ========================
  
  return {
    // State
    state: {
      isLoading,
      error: error?.message,
      machineId,
      searchInput,
      searchQuery,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
    },
    
    // Data
    data: {
      allParts,
      filteredParts,
      total,
      displayCount,
      isEmpty,
      selectedPart,
    },
    
    // Modals configuration
    modals: {
      createEdit: {
        isOpen: isCreateEditModalOpen,
        onClose: () => setIsCreateEditModalOpen(false),
        sparePart: selectedPart,
        machineId,
        onCreate: handleCreatePart,
        onUpdate: handleUpdatePart,
      },
      options: {
        open: isOptionsModalOpen,
        onOpenChange: (open: boolean) => {
          setIsOptionsModalOpen(open);
          if (!open) setSelectedPart(null);
        },
        onEdit: () => {
          if (selectedPart) handleEditPart(selectedPart);
        },
        onDelete: () => {
          if (selectedPart) handleOpenDeleteConfirm(selectedPart);
        },
      },
      deleteConfirm: {
        open: isDeleteConfirmOpen,
        onOpenChange: (open: boolean) => {
          setIsDeleteConfirmOpen(open);
          if (!open) setSelectedPart(null);
        },
        onConfirm: handleConfirmDelete,
        sparePart: selectedPart,
        isDeleting: deleteMutation.isPending,
      },
    },
    
    // Actions
    actions: {
      handleCreateNew,
      handleViewPart,
      handleEditPart,
      handleOpenOptions,
      handleOpenDeleteConfirm,
      handleSearchInputChange,
      handleSearch,
      handleClearSearch,
      handleCloseModals,
      handleRetry,
    },
    
    // i18n
    t,
  };
}

// 🔮 POST-MVP: Strategic enhancements (commented for future implementation)

/**
 * TODO (v0.0.2): Add bulk operations support
 * - Select multiple parts
 * - Bulk delete
 * - Bulk amount adjustment (useful after maintenance)
 * 
 * State additions:
 * const [selectedPartIds, setSelectedPartIds] = useState<Set<string>>(new Set());
 * const [isBulkMode, setIsBulkMode] = useState(false);
 * 
 * Actions:
 * handleToggleSelection(partId: string)
 * handleSelectAll()
 * handleDeselectAll()
 * handleBulkDelete()
 * handleBulkAmountAdjust(adjustment: number)
 */

/**
 * TODO (v0.0.3): Add low stock alerts
 * - Highlight parts with amount < threshold (e.g., 5)
 * - Filter for low stock parts
 * - Notification badge on navigation button
 * 
 * Derived data:
 * const lowStockParts = useMemo(() => 
 *   allParts.filter(p => p.amount < 5),
 *   [allParts]
 * );
 * const lowStockCount = lowStockParts.length;
 */

/**
 * TODO (v0.0.4): Add export to CSV
 * - Export filtered parts list
 * - Include all fields (name, serialId, amount, dates)
 * - Filename: machine-serial_spare-parts_YYYY-MM-DD.csv
 * 
 * Action:
 * const handleExportCSV = async () => {
 *   const blob = await sparePartService.exportToCSV(machineId!);
 *   const url = URL.createObjectURL(blob);
 *   const a = document.createElement('a');
 *   a.href = url;
 *   a.download = `${machine.serialNumber}_spare-parts_${new Date().toISOString().split('T')[0]}.csv`;
 *   a.click();
 * };
 */

/**
 * TODO (v0.0.5): Add sorting options
 * - Sort by name, serialId, amount, createdAt
 * - Ascending/descending toggle
 * 
 * State:
 * const [sortBy, setSortBy] = useState<'name' | 'serialId' | 'amount' | 'createdAt'>('name');
 * const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
 * 
 * Derived data:
 * const sortedParts = useMemo(() => 
 *   [...filteredParts].sort((a, b) => {
 *     const multiplier = sortOrder === 'asc' ? 1 : -1;
 *     return a[sortBy] > b[sortBy] ? multiplier : -multiplier;
 *   }),
 *   [filteredParts, sortBy, sortOrder]
 * );
 */
