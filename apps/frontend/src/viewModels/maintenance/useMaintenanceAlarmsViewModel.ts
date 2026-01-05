import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMaintenanceAlarms, useDeleteMaintenanceAlarm } from '@hooks';
import { useToast } from '@hooks/useToast';
import type { MaintenanceAlarm } from '@contracts';

/**
 * ViewModel: MaintenanceAlarmsListScreen Business Logic
 * 
 * Responsibilities (MVVM-lite):
 * - Manage local state (modals, selected alarm)
 * - Fetch alarms data from API via hooks
 * - Handle user actions (create, edit, view details)
 * - Compute derived data (isEmpty, currentOperatingHours)
 * - Provide i18n access for View
 * 
 * Pattern:
 * - View (MaintenanceAlarmsListScreen.tsx) calls this hook
 * - ViewModel returns { state, data, modals, actions, t }
 * - View renders based on ViewModel output (no business logic in View)
 * 
 * @param machineId - Machine UUID
 * 
 * @example
 * ```tsx
 * function MaintenanceAlarmsListScreen() {
 *   const { id: machineId } = useParams();
 *   const vm = useMaintenanceAlarmsViewModel(machineId);
 *   
 *   if (vm.state.isLoading) return <Loading />;
 *   if (vm.state.error) return <Error onRetry={vm.actions.handleRetry} />;
 *   if (vm.data.isEmpty) return <EmptyState onCreate={vm.actions.handleCreateAlarm} />;
 *   
 *   return (
 *     <div>
 *       <AlarmsList alarms={vm.data.alarms} onView={vm.actions.handleViewDetails} />
 *       <CreateEditAlarmModal {...vm.modals.create} />
 *       <AlarmDetailModal {...vm.modals.detail} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useMaintenanceAlarmsViewModel(machineId: string | undefined) {
  const { t } = useTranslation();
  const { toast } = useToast();

  // ========================
  // STATE MANAGEMENT
  // ========================
  
  // Selected alarm for detail modal
  const [selectedAlarm, setSelectedAlarm] = useState<MaintenanceAlarm | null>(null);
  
  // Create/Edit modal state
  // null = create mode, alarm object = edit mode
  const [editingAlarm, setEditingAlarm] = useState<MaintenanceAlarm | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ========================
  // DATA FETCHING
  // ========================
  
  // Fetch alarms from API (connected to real backend)
  const { data, isLoading, error, refetch } = useMaintenanceAlarms(
    machineId,
    false // Get all alarms (no filter by active)
  );

  // Delete mutation
  const deleteMutation = useDeleteMaintenanceAlarm(machineId);

  // ========================
  // DERIVED STATE
  // ========================
  
  const alarms = data?.alarms || [];
  const isEmpty = alarms.length === 0;
  
  // TODO Sprint #12: Get from machine data instead of mock
  // This will come from machine.specs.operatingHours when we have machine context
  const currentOperatingHours = 1950; // Mock value for Sprint #11

  // ========================
  // BUSINESS LOGIC ACTIONS
  // ========================
  
  /**
   * Open create alarm modal
   */
  const handleCreateAlarm = () => {
    setEditingAlarm(null);
    setIsCreateModalOpen(true);
  };

  /**
   * Open edit alarm modal with alarm data
   * @param alarm - Alarm to edit
   */
  const handleEditAlarm = (alarm: MaintenanceAlarm) => {
    setEditingAlarm(alarm);
    setIsCreateModalOpen(true);
  };

  /**
   * Open alarm detail modal
   * @param alarm - Alarm to view
   */
  const handleViewDetails = (alarm: MaintenanceAlarm) => {
    setSelectedAlarm(alarm);
  };

  /**
   * Close create/edit modal
   */
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setEditingAlarm(null);
  };

  /**
   * Close detail modal
   */
  const handleCloseDetailModal = () => {
    setSelectedAlarm(null);
  };

  /**
   * Retry fetching alarms (error recovery)
   */
  const handleRetry = () => {
    refetch();
  };

  /**
   * Delete alarm with user feedback
   * @param alarmId - Alarm ID to delete
   */
  const handleDeleteAlarm = async (alarmId: string) => {
    try {
      await deleteMutation.mutateAsync(alarmId);
      
      // Success toast
      toast.success({
        title: t('common.success'),
        description: t('maintenance.alarms.notifications.deleted'),
      });
      
      // Close detail modal if the deleted alarm was being viewed
      if (selectedAlarm?.id === alarmId) {
        setSelectedAlarm(null);
      }
    } catch (error) {
      console.error('[ViewModel] Failed to delete alarm:', error);
      
      // Error toast
      toast.error({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('errors.unknownError'),
      });
    }
  };

  // ========================
  // RETURN ViewModel API
  // ========================
  
  return {
    // STATE: Loading, error, machineId
    state: {
      isLoading,
      error,
      machineId,
    },
    
    // DATA: Alarms list and derived computations
    data: {
      alarms,
      isEmpty,
      currentOperatingHours,
      total: data?.total || 0,
      activeCount: data?.activeCount || 0,
    },
    
    // MODALS: State for create/edit and detail modals
    modals: {
      create: {
        isOpen: isCreateModalOpen || !!editingAlarm,
        alarm: editingAlarm, // null = create, object = edit
        machineId,
        onClose: handleCloseCreateModal,
      },
      detail: {
        isOpen: !!selectedAlarm,
        alarm: selectedAlarm,
        currentOperatingHours,
        machineId,
        onClose: handleCloseDetailModal,
        onEdit: handleEditAlarm,
      },
    },
    
    // ACTIONS: User interaction handlers
    actions: {
      handleCreateAlarm,
      handleEditAlarm,
      handleViewDetails,
      handleRetry,
      handleDeleteAlarm,
    },
    
    // i18n: Translation function
    t,
  };
}

/**
 * ViewModel Return Type (for type safety in View)
 */
export type MaintenanceAlarmsViewModel = ReturnType<typeof useMaintenanceAlarmsViewModel>;

// ============================================
// POST-MVP: Strategic Features (Commented)
// ============================================

/**
 * Filter by active/inactive status
 * Currently shows all alarms. Add filter UI in future.
 * 
 * Implementation:
 * - Add state: const [onlyActive, setOnlyActive] = useState(false);
 * - Pass to useMaintenanceAlarms(machineId, onlyActive)
 * - Add filter buttons in View
 */
// const [onlyActive, setOnlyActive] = useState<boolean | undefined>(undefined);
// const handleFilterChange = (filter: 'all' | 'active' | 'inactive') => { }

/**
 * Sort alarms by interval, times triggered, last triggered
 * Currently no sorting. Add sort UI in future.
 * 
 * Implementation:
 * - Add state: const [sortBy, setSortBy] = useState<'interval' | 'timesTriggered' | 'lastTriggered'>('interval');
 * - Add useMemo for sorted alarms
 * - Add sort dropdown in View
 */
// const [sortBy, setSortBy] = useState<'interval' | 'timesTriggered'>('interval');
// const sortedAlarms = useMemo(() => { }, [alarms, sortBy]);

/**
 * Search alarms by title or related parts
 * Currently no search. Add search input in future.
 * 
 * Implementation:
 * - Add state: const [searchTerm, setSearchTerm] = useState('');
 * - Add useDebounce for search
 * - Filter alarms locally or add backend query param
 */
// const [searchTerm, setSearchTerm] = useState('');
// const debouncedSearch = useDebounce(searchTerm, 300);
// const filteredAlarms = useMemo(() => { }, [alarms, debouncedSearch]);

/**
 * Bulk actions (activate/deactivate/delete multiple alarms)
 * Currently single alarm actions only. Add bulk selection in future.
 * 
 * Implementation:
 * - Add state: const [selectedAlarmIds, setSelectedAlarmIds] = useState<string[]>([]);
 * - Add checkbox in AlarmCard
 * - Add floating action bar with bulk actions
 * - Create mutations: useBulkToggleAlarms, useBulkDeleteAlarms
 */
// const [selectedAlarmIds, setSelectedAlarmIds] = useState<string[]>([]);
// const handleBulkToggle = (isActive: boolean) => { }
// const handleBulkDelete = () => { }

/**
 * Alarm statistics and analytics
 * Show aggregate data: most triggered, overdue count, avg interval
 * 
 * Implementation:
 * - Add computed stats in data object
 * - Display in stats cards above alarm list
 * - Useful for fleet managers with many alarms
 */
// const stats = useMemo(() => ({
//   totalAlarms: alarms.length,
//   activeAlarms: alarms.filter(a => a.isActive).length,
//   overdueAlarms: alarms.filter(a => isOverdue(a, currentOperatingHours)).length,
//   avgInterval: alarms.reduce((sum, a) => sum + a.intervalHours, 0) / alarms.length,
//   mostTriggered: alarms.sort((a, b) => b.timesTriggered - a.timesTriggered)[0],
// }), [alarms, currentOperatingHours]);

/**
 * Get currentOperatingHours from machine context
 * Currently using mock value. Should read from machine data.
 * 
 * Implementation:
 * - Option 1: Pass as prop from parent (MachineDetailsScreen has machine data)
 * - Option 2: Fetch machine data in ViewModel: useMachine(machineId)
 * - Option 3: Use global machine context if available
 * 
 * Preferred: Option 1 (prop drilling) for now, migrate to context later
 */
// const { data: machine } = useMachine(machineId);
// const currentOperatingHours = machine?.specs.operatingHours || 0;
