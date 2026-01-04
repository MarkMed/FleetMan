import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceAlarmService } from '@services/api/maintenanceAlarmService';
import type {
  MaintenanceAlarm,
  CreateMaintenanceAlarmRequest,
  UpdateMaintenanceAlarmRequest,
} from '@contracts';

/**
 * TanStack Query keys for maintenance alarms
 * Scoped by machineId since alarms are machine-specific subdocuments
 */
export const MAINTENANCE_ALARM_KEYS = {
  all: ['maintenanceAlarms'] as const,
  byMachine: (machineId: string) => ['maintenanceAlarms', machineId] as const,
  active: (machineId: string) => ['maintenanceAlarms', machineId, 'active'] as const,
  detail: (machineId: string, alarmId: string) => 
    ['maintenanceAlarms', machineId, alarmId] as const,
};

/**
 * Hook: Get maintenance alarms for a machine
 * 
 * Configured for always-fresh data:
 * - Refetches every time the screen is mounted
 * - Refetches when user returns to tab (window focus)
 * - Critical for seeing cronjob-triggered alarms in real-time
 * 
 * Sprint #11: Connected to real backend API
 * Sprint #12: Will add optimistic updates and background sync
 * 
 * @param machineId - Machine UUID
 * @param onlyActive - Filter only active alarms
 * @returns Query result with alarms list
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useMaintenanceAlarms(machineId, true);
 * const alarms = data?.alarms || [];
 * ```
 */
export function useMaintenanceAlarms(
  machineId: string | undefined,
  onlyActive: boolean = false
) {
  return useQuery({
    queryKey: onlyActive 
      ? MAINTENANCE_ALARM_KEYS.active(machineId!) 
      : MAINTENANCE_ALARM_KEYS.byMachine(machineId!),
    queryFn: () => maintenanceAlarmService.getMaintenanceAlarms(machineId!, onlyActive),
    enabled: !!machineId,
    staleTime: 5 * 60 * 1000, // is stale after 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnMount: 'always', // Always refetch when component mounts, even if data exists
    refetchOnWindowFocus: true, // Also refetch when user returns to tab (useful for cronjob updates)
    
    // 🔮 POST-MVP: Possible optimizations if performance becomes an issue:
    // - Use SSE/WebSocket for real-time updates instead of polling
    //   Implementation: Subscribe to 'maintenanceAlarm:triggered' events
    //   Benefits: Instant updates, reduce server load, better UX
    // 
    // - Add refetchInterval for periodic background sync
    //   Example: refetchInterval: 2 * 60 * 1000 (every 2 minutes when tab active)
    //   Use case: Dashboard monitoring without manual refresh
    // 
    // - Implement selective invalidation on mutations
    //   Current: invalidateQueries refetches all alarms
    //   Optimized: Update cache manually with setQueryData for single alarm changes
    //   Benefits: Instant UI updates, no loading states on edit/delete
    // 
    // - Add pagination for machines with 50+ alarms
    //   API: GET /alarms?page=1&limit=20
    //   UI: Infinite scroll or paginated table
  });
}

/**
 * Hook: Create maintenance alarm mutation
 * 
 * Sprint #11: Simulates creation with mock data
 * Sprint #12: Will call POST /api/machines/:machineId/maintenance-alarms
 * 
 * @param machineId - Machine UUID
 * @returns Mutation object
 * 
 * @example
 * ```tsx
 * const createMutation = useCreateMaintenanceAlarm(machineId);
 * 
 * const handleSubmit = (data: CreateMaintenanceAlarmRequest) => {
 *   createMutation.mutate(data, {
 *     onSuccess: (alarm) => {
 *       toast.success('Alarma creada');
 *       navigate(`/machines/${machineId}/alarms`);
 *     }
 *   });
 * };
 * ```
 */
export function useCreateMaintenanceAlarm(machineId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alarmData: CreateMaintenanceAlarmRequest) =>
      maintenanceAlarmService.createMaintenanceAlarm(machineId!, alarmData),
    onSuccess: (newAlarm) => {
      console.log('[useCreateMaintenanceAlarm] Alarm created:', newAlarm);
      
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ 
        queryKey: MAINTENANCE_ALARM_KEYS.byMachine(machineId!) 
      });
      queryClient.invalidateQueries({ 
        queryKey: MAINTENANCE_ALARM_KEYS.active(machineId!) 
      });
    },
  });
}

/**
 * Hook: Update maintenance alarm mutation
 * 
 * Sprint #11: Simulates update with mock data
 * Sprint #12: Will call PATCH /api/machines/:machineId/maintenance-alarms/:alarmId
 * 
 * @param machineId - Machine UUID
 * @returns Mutation object
 * 
 * @example
 * ```tsx
 * const updateMutation = useUpdateMaintenanceAlarm(machineId);
 * 
 * const handleEdit = (alarmId: string, changes: UpdateMaintenanceAlarmRequest) => {
 *   updateMutation.mutate({ alarmId, changes }, {
 *     onSuccess: () => toast.success('Alarma actualizada')
 *   });
 * };
 * ```
 */
export function useUpdateMaintenanceAlarm(machineId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      alarmId, 
      changes 
    }: { 
      alarmId: string; 
      changes: UpdateMaintenanceAlarmRequest;
    }) =>
      maintenanceAlarmService.updateMaintenanceAlarm(machineId!, alarmId, changes),
    onSuccess: (updatedAlarm) => {
      console.log('[useUpdateMaintenanceAlarm] Alarm updated:', updatedAlarm);
      
      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: MAINTENANCE_ALARM_KEYS.byMachine(machineId!) 
      });
      queryClient.invalidateQueries({ 
        queryKey: MAINTENANCE_ALARM_KEYS.active(machineId!) 
      });
      queryClient.invalidateQueries({ 
        queryKey: MAINTENANCE_ALARM_KEYS.detail(machineId!, updatedAlarm.id) 
      });
    },
  });
}

/**
 * Hook: Delete (soft delete) maintenance alarm mutation
 * 
 * Sprint #11: Simulates deletion (sets isActive = false)
 * Sprint #12: Will call DELETE /api/machines/:machineId/maintenance-alarms/:alarmId
 * 
 * @param machineId - Machine UUID
 * @returns Mutation object
 * 
 * @example
 * ```tsx
 * const deleteMutation = useDeleteMaintenanceAlarm(machineId);
 * 
 * const handleDelete = (alarmId: string) => {
 *   if (confirm('¿Eliminar alarma?')) {
 *     deleteMutation.mutate(alarmId, {
 *       onSuccess: () => toast.success('Alarma eliminada')
 *     });
 *   }
 * };
 * ```
 */
export function useDeleteMaintenanceAlarm(machineId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alarmId: string) =>
      maintenanceAlarmService.deleteMaintenanceAlarm(machineId!, alarmId),
    onSuccess: (_, alarmId) => {
      console.log('[useDeleteMaintenanceAlarm] Alarm deleted:', alarmId);
      
      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: MAINTENANCE_ALARM_KEYS.byMachine(machineId!) 
      });
      queryClient.invalidateQueries({ 
        queryKey: MAINTENANCE_ALARM_KEYS.active(machineId!) 
      });
    },
  });
}

/**
 * Hook: Toggle alarm active status (activate/deactivate)
 * Convenience wrapper around useUpdateMaintenanceAlarm
 * 
 * @param machineId - Machine UUID
 * @returns Mutation object
 * 
 * @example
 * ```tsx
 * const toggleMutation = useToggleAlarmStatus(machineId);
 * 
 * const handleToggle = (alarm: MaintenanceAlarm) => {
 *   toggleMutation.mutate({ 
 *     alarmId: alarm.id, 
 *     isActive: !alarm.isActive 
 *   });
 * };
 * ```
 */
export function useToggleAlarmStatus(machineId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      alarmId, 
      isActive 
    }: { 
      alarmId: string; 
      isActive: boolean;
    }) =>
      maintenanceAlarmService.updateMaintenanceAlarm(machineId!, alarmId, { isActive }),
    onSuccess: (updatedAlarm) => {
      console.log('[useToggleAlarmStatus] Alarm toggled:', updatedAlarm);
      
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ 
        queryKey: MAINTENANCE_ALARM_KEYS.byMachine(machineId!) 
      });
      queryClient.invalidateQueries({ 
        queryKey: MAINTENANCE_ALARM_KEYS.active(machineId!) 
      });
      queryClient.invalidateQueries({ 
        queryKey: MAINTENANCE_ALARM_KEYS.detail(machineId!, updatedAlarm.id) 
      });
    },
  });
}

// ============================================
// POST-MVP: Strategic Hooks (Commented)
// ============================================

/**
 * Hook: Get alarm trigger history
 * Shows all MachineEvents created by this alarm
 * Useful for analyzing maintenance patterns and alarm effectiveness
 * 
 * @param machineId - Machine UUID
 * @param alarmId - Alarm subdocument ID
 * @returns Query result with MachineEvent[] list
 * 
 * Implementation: Filter MachineEvents where metadata.alarmId === alarmId
 */
// export function useAlarmHistory(machineId: string, alarmId: string) { }

/**
 * Hook: Bulk toggle alarms
 * Activate/deactivate multiple alarms at once
 * Useful for seasonal machines (activate all when season starts)
 * 
 * @param machineId - Machine UUID
 * @returns Mutation accepting array of alarm IDs and isActive state
 */
// export function useBulkToggleAlarms(machineId: string) { }

/**
 * Hook: Clone alarm to other machines
 * Duplicate an alarm configuration to multiple machines
 * Useful for fleet management (same maintenance schedule for all forklifts)
 * 
 * @param sourceMachineId - Source machine UUID
 * @returns Mutation accepting alarmId and targetMachineIds[]
 */
// export function useCloneAlarm(sourceMachineId: string) { }

/**
 * Hook: Get alarm statistics
 * Analytics data for dashboard (most triggered, average interval, etc.)
 * 
 * @param machineId - Machine UUID
 * @returns Query result with alarm stats
 */
// export function useAlarmStatistics(machineId: string) { }
