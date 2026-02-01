import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sparePartService } from '@services/api/sparePartService';
import type {
  CreateSparePartRequest,
  UpdateSparePartRequest,
  CreateSparePartResponse,
  GetSparePartResponse,
  ListSparePartsResponse,
  UpdateSparePartResponse,
  DeleteSparePartResponse,
} from '@contracts';

/**
 * TanStack Query keys for spare parts
 * Scoped by machineId since parts are machine-specific (via machineId reference)
 */
export const SPARE_PART_KEYS = {
  all: ['spareParts'] as const,
  byMachine: (machineId: string) => ['spareParts', machineId] as const,
  detail: (sparePartId: string) => ['spareParts', 'detail', sparePartId] as const,
  // 🔮 POST-MVP: Additional query keys for advanced features
  // lowStock: (machineId: string) => ['spareParts', machineId, 'lowStock'] as const,
  // search: (machineId: string, query: string) => ['spareParts', machineId, 'search', query] as const,
};

/**
 * Hook: Get spare parts for a machine
 * 
 * Configured for fresh data on mount and window focus.
 * Enables real-time inventory tracking across tabs/devices.
 * 
 * Sprint #15/16 Task 7.1: Connected to real backend API
 * 
 * @param machineId - Machine UUID
 * @returns Query result with parts list
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useSpareParts(machineId);
 * const parts = data?.spareParts || [];
 * const total = data?.total || 0;
 * ```
 */
export function useSpareParts(machineId: string | undefined) {
  return useQuery({
    queryKey: SPARE_PART_KEYS.byMachine(machineId!),
    queryFn: () => sparePartService.getSpareParts(machineId!),
    enabled: !!machineId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    
    // 🔮 POST-MVP: Possible optimizations
    // - Add pagination for machines with 100+ parts
    //   API: GET /spare-parts/machine/:machineId?page=1&limit=20
    //   UI: Infinite scroll or paginated table
    //   Benefits: Faster load times, reduced memory usage
    // 
    // - Server-side search for large inventories
    //   API: GET /spare-parts/machine/:machineId/search?q=filter
    //   Trigger: When parts.length > 50 (user requirement)
    //   Benefits: Faster filtering, reduced client-side processing
    // 
    // - Add refetchInterval for real-time inventory tracking
    //   Example: refetchInterval: 2 * 60 * 1000 (every 2 minutes)
    //   Use case: Multi-user inventory management
  });
}

/**
 * Hook: Get single spare part by ID
 * 
 * Used for SparePartDetailScreen to fetch specific part when accessed via URL
 * Enables deep-linking: /machines/:machineId/spare-parts/:sparePartId
 * 
 * @param machineId - Machine UUID (for RESTful route)
 * @param sparePartId - Spare part UUID
 * @returns Query result with single part or undefined if not found
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useSparePartById(machineId, sparePartId);
 * 
 * if (isLoading) return <Loading />;
 * if (error) return <Error />;
 * if (!data) return <NotFound />;
 * 
 * return <SparePartDetail sparePart={data.sparePart} />;
 * ```
 */
export function useSparePartById(machineId: string | undefined, sparePartId: string | undefined) {
  return useQuery({
    queryKey: SPARE_PART_KEYS.detail(sparePartId!),
    queryFn: () => sparePartService.getSparePartById(machineId!, sparePartId!),
    enabled: !!machineId && !!sparePartId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook: Create spare part
 * 
 * Mutation for adding new parts to machine inventory.
 * Invalidates machine's parts list on success.
 * 
 * @returns Mutation object with mutateAsync function
 * 
 * @example
 * ```tsx
 * const createMutation = useCreateSparePart();
 * 
 * try {
 *   const newPart = await createMutation.mutateAsync({
 *     name: 'Filtro de aceite',
 *     serialId: 'FO-001',
 *     amount: 5,
 *     machineId: 'machine-uuid'
 *   });
 *   toast({ title: 'Parte creada', variant: 'success' });
 * } catch (error) {
 *   toast({ title: 'Error', description: error.message, variant: 'destructive' });
 * }
 * ```
 */
export function useCreateSparePart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ machineId, data }: { 
      machineId: string;
      data: Omit<CreateSparePartRequest, 'machineId'> 
    }) => sparePartService.createSparePart(machineId, data),
    onSuccess: (newPart: CreateSparePartResponse, variables) => {
      console.log('[useCreateSparePart] Spare part created:', newPart);
      
      // Invalidate machine's parts list to refetch with new part
      queryClient.invalidateQueries({ 
        queryKey: SPARE_PART_KEYS.byMachine(variables.machineId) 
      });
      
      // 🔮 POST-MVP: Optimistic update to avoid refetch delay
      // queryClient.setQueryData(
      //   SPARE_PART_KEYS.byMachine(variables.machineId),
      //   (oldData) => ({
      //     ...oldData,
      //     spareParts: [...oldData.spareParts, newPart],
      //     total: oldData.total + 1
      //   })
      // );
    },
    onError: (error) => {
      console.error('[useCreateSparePart] Error creating spare part:', error);
    }
  });
}

/**
 * Hook: Update spare part
 * 
 * Mutation for modifying existing parts.
 * Note: machineId cannot be changed (business rule enforced by backend)
 * 
 * @returns Mutation object with mutateAsync function
 * 
 * @example
 * ```tsx
 * const updateMutation = useUpdateSparePart();
 * 
 * await updateMutation.mutateAsync({
 *   sparePartId: 'part-uuid',
 *   updates: { amount: 10 }
 * });
 * ```
 */
export function useUpdateSparePart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      machineId,
      sparePartId, 
      updates
    }: { 
      machineId: string;
      sparePartId: string; 
      updates: UpdateSparePartRequest;
    }) => sparePartService.updateSparePart(machineId, sparePartId, updates),
    onSuccess: (updatedPart: UpdateSparePartResponse, variables) => {
      console.log('[useUpdateSparePart] Spare part updated:', updatedPart);
      
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ 
        queryKey: SPARE_PART_KEYS.byMachine(variables.machineId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: SPARE_PART_KEYS.detail(variables.sparePartId) 
      });
      
      // 🔮 POST-MVP: Optimistic update for instant UI response
      // queryClient.setQueryData(
      //   SPARE_PART_KEYS.detail(variables.sparePartId),
      //   (oldData) => ({ ...oldData, sparePart: updatedPart })
      // );
    },
    onError: (error) => {
      console.error('[useUpdateSparePart] Error updating spare part:', error);
    }
  });
}

/**
 * Hook: Delete spare part
 * 
 * Mutation for permanently removing parts from inventory.
 * Invalidates machine's parts list on success.
 * 
 * @returns Mutation object with mutateAsync function
 * 
 * @example
 * ```tsx
 * const deleteMutation = useDeleteSparePart();
 * 
 * await deleteMutation.mutateAsync({
 *   sparePartId: 'part-uuid',
 *   machineId: 'machine-uuid'
 * });
 * ```
 */
export function useDeleteSparePart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      machineId,
      sparePartId
    }: { 
      machineId: string;
      sparePartId: string;
    }) => sparePartService.deleteSparePart(machineId, sparePartId),
    onSuccess: (response: DeleteSparePartResponse, variables) => {
      console.log('[useDeleteSparePart] Spare part deleted:', response);
      
      // Invalidate machine's parts list to refetch without deleted part
      queryClient.invalidateQueries({ 
        queryKey: SPARE_PART_KEYS.byMachine(variables.machineId) 
      });
      
      // Remove detail query from cache
      queryClient.removeQueries({ 
        queryKey: SPARE_PART_KEYS.detail(variables.sparePartId) 
      });
      
      // 🔮 POST-MVP: Optimistic update for instant UI response
      // queryClient.setQueryData(
      //   SPARE_PART_KEYS.byMachine(variables.machineId),
      //   (oldData) => ({
      //     ...oldData,
      //     spareParts: oldData.spareParts.filter(p => p.id !== variables.sparePartId),
      //     total: oldData.total - 1
      //   })
      // );
    },
    onError: (error) => {
      console.error('[useDeleteSparePart] Error deleting spare part:', error);
    }
  });
}

// 🔮 POST-MVP: Strategic hooks (commented for future implementation)

/**
 * TODO (v0.0.2): Hook for fetching low stock parts
 * Useful for proactive inventory alerts
 */
// export function useLowStockParts(machineId: string | undefined, threshold: number = 5) {
//   return useQuery({
//     queryKey: SPARE_PART_KEYS.lowStock(machineId!),
//     queryFn: () => sparePartService.getLowStockParts(machineId!, threshold),
//     enabled: !!machineId,
//     staleTime: 10 * 60 * 1000, // 10 minutes
//   });
// }

/**
 * TODO (v0.0.3): Hook for bulk updating part amounts
 * Useful for adjusting inventory after maintenance tasks
 */
// export function useBulkUpdateAmounts() {
//   const queryClient = useQueryClient();
//   
//   return useMutation({
//     mutationFn: (updates: Array<{ sparePartId: string; amount: number }>) =>
//       sparePartService.bulkUpdateAmounts(updates),
//     onSuccess: (_, variables) => {
//       // Invalidate all affected parts' lists
//       const machineIds = new Set(variables.map(u => u.machineId));
//       machineIds.forEach(machineId => {
//         queryClient.invalidateQueries({ queryKey: SPARE_PART_KEYS.byMachine(machineId) });
//       });
//     }
//   });
// }
