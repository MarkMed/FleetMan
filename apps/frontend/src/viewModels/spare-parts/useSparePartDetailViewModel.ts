import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  useSparePartById,
  useUpdateSparePart,
  useDeleteSparePart,
} from '@hooks/useSpareParts';
import { useToast } from '@hooks/useToast';
import type { UpdateSparePartRequest } from '@contracts';

/**
 * Type for spare part entity from backend
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
 * ViewModel: SparePartDetailScreen Business Logic
 * 
 * Responsibilities:
 * - Fetch single spare part details by ID
 * - Handle edit/delete actions
 * - Manage modals state (edit, options, delete confirm)
 * - Navigate back to list after delete
 * - Provide i18n access for View
 * 
 * Pattern:
 * - View (SparePartDetailScreen.tsx) calls this hook
 * - ViewModel returns { state, data, modals, actions, t }
 * - View renders based on ViewModel output
 * 
 * @param sparePartId - Spare part UUID from URL params
 * 
 * @example
 * ```tsx
 * function SparePartDetailScreen() {
 *   const { sparePartId } = useParams();
 *   const vm = useSparePartDetailViewModel(sparePartId);
 *   
 *   if (vm.state.isLoading) return <Loading />;
 *   if (vm.state.error) return <Error />;
 *   if (!vm.data.sparePart) return <NotFound />;
 *   
 *   return (
 *     <div>
 *       <SparePartInfo sparePart={vm.data.sparePart} />
 *       <Button onClick={vm.actions.handleEdit}>Edit</Button>
 *       <Button onClick={vm.actions.handleOpenOptions}>Options</Button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSparePartDetailViewModel(
  machineId: string | undefined,
  sparePartId: string | undefined
) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  // ========================
  // STATE MANAGEMENT
  // ========================
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // ========================
  // DATA FETCHING
  // ========================
  
  const { data, isLoading, error, refetch } = useSparePartById(machineId, sparePartId);
  const updateMutation = useUpdateSparePart();
  const deleteMutation = useDeleteSparePart();

  const sparePart = data?.data as SparePart | undefined;

  // ========================
  // BUSINESS LOGIC ACTIONS
  // ========================
  
  /**
   * Open edit modal
   */
  const handleEdit = () => {
    setIsEditModalOpen(true);
    setIsOptionsModalOpen(false); // Close options if open
  };
  
  /**
   * Open options modal
   */
  const handleOpenOptions = () => {
    setIsOptionsModalOpen(true);
  };
  
  /**
   * Open delete confirmation modal
   */
  const handleOpenDeleteConfirm = () => {
    setIsDeleteConfirmOpen(true);
    setIsOptionsModalOpen(false); // Close options if open
  };
  
  /**
   * Update spare part
   */
  const handleUpdate = async (
    sparePartId: string,
    updates: UpdateSparePartRequest
  ) => {
    try {
      await updateMutation.mutateAsync({
        sparePartId,
        updates,
        machineId: machineId!, // For cache invalidation
      });
      
      toast({
        title: t('spareParts.notifications.updated'),
        variant: 'success',
      });
      
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error('[useSparePartDetailViewModel] Error updating part:', error);
      
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
   * Delete spare part and navigate back to list
   */
  const handleConfirmDelete = async () => {
    if (!sparePart || !machineId) return;
    
    try {
      await deleteMutation.mutateAsync({
        machineId,
        sparePartId: sparePart.id,
      });
      
      toast({
        title: t('spareParts.notifications.deleted'),
        variant: 'success',
      });
      
      // Navigate back to spare parts list
      navigate(`/machines/${machineId}/spare-parts`);
    } catch (error: any) {
      console.error('[useSparePartDetailViewModel] Error deleting part:', error);
      
      toast({
        title: t('common.error'),
        description: error.message || t('spareParts.notifications.deleteError'),
        variant: 'destructive',
      });
      
      setIsDeleteConfirmOpen(false);
    }
  };
  
  /**
   * Navigate back to spare parts list
   */
  const handleBack = () => {
    navigate(`/machines/${machineId}/spare-parts`);
  };
  
  /**
   * Retry fetching spare part after error
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
      sparePartId,
      machineId,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
    },
    
    // Data
    data: {
      sparePart,
    },
    
    // Modals configuration
    modals: {
      edit: {
        isOpen: isEditModalOpen,
        onClose: () => setIsEditModalOpen(false),
        sparePart,
        machineId,
        onUpdate: handleUpdate,
      },
      options: {
        open: isOptionsModalOpen,
        onOpenChange: (open: boolean) => setIsOptionsModalOpen(open),
        onEdit: handleEdit,
        onDelete: handleOpenDeleteConfirm,
      },
      deleteConfirm: {
        open: isDeleteConfirmOpen,
        onOpenChange: (open: boolean) => setIsDeleteConfirmOpen(open),
        onConfirm: handleConfirmDelete,
        sparePart: sparePart || null,
        isDeleting: deleteMutation.isPending,
      },
    },
    
    // Actions
    actions: {
      handleEdit,
      handleOpenOptions,
      handleOpenDeleteConfirm,
      handleBack,
      handleRetry,
    },
    
    // i18n
    t,
  };
}

// 🔮 POST-MVP: Strategic enhancements (commented for future implementation)

/**
 * TODO (v0.0.2): Add usage history
 * - Track when part was used in maintenance
 * - Link to maintenance alarms/events
 * - Show usage frequency chart
 * 
 * Data fetching:
 * const { data: usageHistory } = useSparePartUsageHistory(sparePartId);
 */

/**
 * TODO (v0.0.3): Add related parts suggestions
 * - Suggest compatible parts (same machine type)
 * - Show frequently co-used parts
 * - Quick add to inventory
 * 
 * Data fetching:
 * const { data: relatedParts } = useRelatedSpareParts(sparePartId);
 */

/**
 * TODO (v0.0.4): Add part photo upload
 * - Upload part photo
 * - View photo gallery
 * - QR code generation for physical inventory
 * 
 * Mutation:
 * const uploadPhotoMutation = useUploadSparePartPhoto();
 */
