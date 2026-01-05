import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMaintenanceAlarm, useDeleteMaintenanceAlarm, useResetMaintenanceAlarm } from '@hooks';
import { useToast } from '@hooks/useToast';
import { modal } from '@helpers/modal';

/**
 * ViewModel: AlarmDetailScreen Business Logic
 * 
 * Responsibilities (MVVM-lite):
 * - Extract route params (machineId, alarmId) from URL
 * - Fetch single alarm data from API via useMaintenanceAlarm hook
 * - Handle user actions (edit, delete, back navigation)
 * - Provide i18n access for View
 * - Compute derived data (progress, warnings, stats)
 * 
 * Pattern:
 * - View (AlarmDetailScreen.tsx) calls this hook
 * - ViewModel returns { state, data, actions, t }
 * - View renders based on ViewModel output (no business logic in View)
 * 
 * URL Structure: /machines/:machineId/maintenance-alarms/:alarmId
 * 
 * @example
 * ```tsx
 * function AlarmDetailScreen() {
 *   const vm = useAlarmDetailViewModel();
 *   
 *   if (vm.state.isLoading) return <Loading />;
 *   if (vm.state.error) return <Error onRetry={vm.actions.handleRetry} />;
 *   if (!vm.data.alarm) return <NotFound />;
 *   
 *   return (
 *     <div>
 *       <Breadcrumbs machineId={vm.state.machineId} alarmTitle={vm.data.alarm.title} />
 *       <AlarmDetails alarm={vm.data.alarm} stats={vm.data.stats} />
 *       <ActionButtons onEdit={vm.actions.handleEdit} onDelete={vm.actions.handleDelete} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useAlarmDetailViewModel() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  // ========================
  // ROUTE PARAMS
  // ========================
  
  const { id: machineId, alarmId } = useParams<{ id: string; alarmId: string }>();

  // ========================
  // LOCAL STATE
  // ========================
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Action menu modal state
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  // ========================
  // DATA FETCHING
  // ========================
  
  // Fetch single alarm data
  const { data: alarm, isLoading, error, refetch } = useMaintenanceAlarm(machineId, alarmId);

  // Delete mutation
  const deleteMutation = useDeleteMaintenanceAlarm(machineId);
  
  // Reset mutation
  const resetMutation = useResetMaintenanceAlarm(machineId);

  // ========================
  // DERIVED STATE
  // ========================
  
  // TODO Sprint #12: Get from machine data instead of mock
  // This will come from machine.specs.operatingHours when we have machine context
  const currentOperatingHours = 1950; // Mock value for Sprint #11

  // Calculate progress and warnings (only if alarm exists)
  let hoursRemaining = 0;
  let isOverdue = false;
  let isApproaching = false;
  let lastTriggeredDate = '';
  let needsAttention = false;

  if (alarm) {
    hoursRemaining = alarm.intervalHours - alarm.accumulatedHours;
    isOverdue = hoursRemaining < 0;
    isApproaching = hoursRemaining <= alarm.intervalHours * 0.3; // 30% threshold
    needsAttention = hoursRemaining === 0 || hoursRemaining <= alarm.intervalHours * 0.1; // 10% threshold

    lastTriggeredDate = alarm.lastTriggeredAt
      ? new Date(alarm.lastTriggeredAt).toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : t('maintenance.alarms.neverTriggered');
  }

  // ========================
  // BUSINESS LOGIC ACTIONS
  // ========================

  /**
   * Navigate back to alarms list screen
   */
  const handleBack = () => {
    navigate(`/machines/${machineId}/alarms`);
  };

  /**
   * Open edit modal with current alarm data
   * Pattern: Modal-based editing preserves screen context
   * User can edit without leaving detail view
   */
  const handleEdit = () => {
    if (!alarm) return;
    setIsEditModalOpen(true);
  };

  /**
   * Close edit modal
   */
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  /**
   * Open action menu modal
   */
  const handleOpenActionMenu = () => {
    setIsActionMenuOpen(true);
  };

  /**
   * Close action menu modal
   */
  const handleCloseActionMenu = () => {
    setIsActionMenuOpen(false);
  };

  /**
   * Contact provider (Coming soon)
   */
  const handleContactProvider = () => {
    toast.info({
      title: t('common.comingSoon'),
      description: t('common.featureComingSoon'),
    });
  };

  /**
   * Postpone alarm (Coming soon)
   */
  const handlePostpone = () => {
    toast.info({
      title: t('common.comingSoon'),
      description: t('common.featureComingSoon'),
    });
  };

  /**
   * Mark alarm as completed (reset counter)
   * Calls reset endpoint to set accumulatedHours to 0
   */
  const handleMarkCompleted = async () => {
    if (!alarm) return;

    try {
      await resetMutation.mutateAsync(alarm.id);

      // Success toast
      toast.success({
        title: t('common.success'),
        description: t('maintenance.alarms.notifications.updated'),
      });
    } catch (error) {
      console.error('[useAlarmDetailViewModel] Failed to reset alarm:', error);

      // Error toast
      toast.error({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('errors.unknownError'),
      });
    }
  };

  /**
   * Stop machine (Coming soon)
   */
  const handleStopMachine = () => {
    toast.info({
      title: t('common.comingSoon'),
      description: t('common.featureComingSoon'),
    });
  };

  /**
   * Delete alarm with modal confirmation and user feedback
   * Uses global modal system with danger variant
   * Navigates back to list on success
   */
  const handleDelete = async () => {
    if (!alarm) return;

    // Show confirmation modal (danger variant for destructive action)
    const confirmed = await modal.confirm({
      title: t('maintenance.alarms.deleteAlarm'),
      description: t('maintenance.alarms.confirmDelete'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      action: 'danger',
    });

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(alarm.id);

      // Success toast
      toast.success({
        title: t('common.success'),
        description: t('maintenance.alarms.notifications.deleted'),
      });

      // Navigate back to list
      handleBack();
    } catch (error) {
      console.error('[useAlarmDetailViewModel] Failed to delete alarm:', error);

      // Error toast
      toast.error({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('errors.unknownError'),
      });
    }
  };

  /**
   * Retry fetching alarm (error recovery)
   */
  const handleRetry = () => {
    refetch();
  };

  // ========================
  // RETURN ViewModel API
  // ========================
  
  return {
    // STATE: Loading, error, route params
    state: {
      isLoading,
      error,
      machineId,
      alarmId,
    },

    // DATA: Alarm and derived computations
    data: {
      alarm,
      currentOperatingHours,
      
      // Progress calculations
      hoursRemaining,
      isOverdue,
      isApproaching,
      needsAttention,
      
      // Stats for display
      stats: {
        intervalHours: alarm?.intervalHours || 0,
        timesTriggered: alarm?.timesTriggered || 0,
        lastTriggeredDate,
        accumulatedHours: alarm?.accumulatedHours || 0,
      },
    },

    // MODALS: State for edit modal
    modals: {
      edit: {
        isOpen: isEditModalOpen,
        alarm: alarm,
        machineId: machineId,
        onClose: handleCloseEditModal,
      },
      actionMenu: {
        isOpen: isActionMenuOpen,
        onOpenChange: setIsActionMenuOpen,
        onContactProvider: handleContactProvider,
        onPostpone: handlePostpone,
        onEditAlarm: handleEdit,
        onMarkCompleted: handleMarkCompleted,
        onStopMachine: handleStopMachine,
      },
    },

    // ACTIONS: User interaction handlers
    actions: {
      handleBack,
      handleEdit,
      handleDelete,
      handleRetry,
      handleCloseEditModal,
      handleOpenActionMenu,
      handleCloseActionMenu,
      handleContactProvider,
      handlePostpone,
      handleMarkCompleted,
      handleStopMachine,
    },

    // i18n: Translation function
    t,
  };
}

/**
 * ViewModel Return Type (for type safety in View)
 */
export type AlarmDetailViewModel = ReturnType<typeof useAlarmDetailViewModel>;

// ============================================
// POST-MVP: Strategic Features (Commented)
// ============================================

/**
 * Optimistic UI updates for edit/delete
 * Update UI immediately before API response
 * Rollback on error for better perceived performance
 * 
 * Implementation:
 * - Use TanStack Query's optimistic updates API
 * - In handleDelete: Update cache before mutateAsync
 * - In edit modal: Update cache on submit, revert on error
 * - Benefits: Instant feedback, perceived speed improvement
 * 
 * Example:
 * ```typescript
 * const handleOptimisticDelete = async () => {
 *   const previousAlarm = alarm;
 *   queryClient.setQueryData(['alarm', alarmId], null);
 *   
 *   try {
 *     await deleteMutation.mutateAsync(alarmId);
 *   } catch (error) {
 *     queryClient.setQueryData(['alarm', alarmId], previousAlarm);
 *     toast.error('Failed to delete');
 *   }
 * };
 * ```
 */

/**
 * Keyboard shortcuts for actions
 * Power user feature: Quick actions via keyboard
 * 
 * Implementation:
 * - Use useKeyPress or useHotkeys hook
 * - Shortcuts: 'e' = edit, 'd' = delete (with confirm), 'Esc' = back
 * - Display shortcuts in tooltip on buttons
 * - Toggle with user preference setting
 * 
 * Example:
 * ```typescript
 * useKeyPress('e', handleEdit, { ctrl: true });
 * useKeyPress('Delete', handleDelete);
 * useKeyPress('Escape', handleBack);
 * ```
 */

/**
 * Alarm status toggle (activate/deactivate)
 * Quick toggle without opening edit modal
 * Useful for temporarily disabling alarms
 * 
 * Implementation:
 * - Add useToggleAlarmStatus mutation
 * - Add toggle button in header next to Edit/Delete
 * - Show confirmation for deactivate action
 * - Update badge color on success
 * 
 * Benefits: Quick seasonal adjustments, temporary disable
 */
// const toggleMutation = useToggleAlarmStatus(machineId);
// const handleToggleStatus = async () => {
//   const confirmed = await modal.confirm({
//     title: alarm.isActive ? t('maintenance.alarms.deactivate') : t('maintenance.alarms.activate'),
//     description: alarm.isActive 
//       ? t('maintenance.alarms.confirmDeactivate') 
//       : t('maintenance.alarms.confirmActivate'),
//     action: alarm.isActive ? 'warning' : 'default',
//   });
//   if (confirmed) await toggleMutation.mutateAsync({ alarmId, isActive: !alarm.isActive });
// };

/**
 * Dual navigation: Modal + Screen
 * Allow opening alarm detail as modal OR navigating to dedicated screen
 * Use case: Quick preview from list (modal) vs deep-link from notification (screen)
 * 
 * Implementation:
 * - Add query param: ?modal=true
 * - Render different layout based on param
 * - Modal: No breadcrumbs, close button, smaller width
 * - Screen: Full breadcrumbs, back button, full width
 */
// const searchParams = new URLSearchParams(window.location.search);
// const isModalView = searchParams.get('modal') === 'true';

/**
 * Alarm trigger timeline
 * Show historical timeline of when alarm was triggered
 * Displays all MachineEvents created by this alarm
 * 
 * Implementation:
 * - Create hook: useAlarmHistory(machineId, alarmId)
 * - Fetch MachineEvents filtered by metadata.alarmId
 * - Display in timeline component with dates and context
 * - Useful for maintenance pattern analysis
 */
// const { data: triggerHistory } = useAlarmHistory(machineId, alarmId);

/**
 * Edit alarm in-place (inline editing)
 * Allow editing alarm directly on detail screen instead of modal
 * Toggle between view mode and edit mode
 * 
 * Implementation:
 * - Add state: const [isEditing, setIsEditing] = useState(false);
 * - Conditional render: isEditing ? <AlarmForm /> : <AlarmDetails />
 * - Handle save/cancel actions
 * - Better UX for quick edits without navigation
 */
// const [isEditing, setIsEditing] = useState(false);
// const handleToggleEdit = () => setIsEditing(!isEditing);

/**
 * Related machine events
 * Show recent MachineEvents that might be related to this alarm
 * Filter by category (maintenance) and time proximity to alarm triggers
 * 
 * Implementation:
 * - Fetch recent maintenance events: useMachineEvents(machineId, { category: 'maintenance' })
 * - Display in sidebar or below alarm details
 * - Link to event detail for more context
 */
// const { data: relatedEvents } = useMachineEvents(machineId, { 
//   category: 'maintenance', 
//   limit: 5 
// });

/**
 * Get currentOperatingHours from machine context
 * Currently using mock value. Should read from machine data.
 * 
 * Implementation:
 * - Option 1: Fetch machine data: const { data: machine } = useMachine(machineId);
 * - Option 2: Use global machine context if available
 * - Option 3: Get from parent route loader (React Router v6 data API)
 * 
 * Preferred: Option 1 for now, migrate to context or route loader later
 */
// const { data: machine } = useMachine(machineId);
// const currentOperatingHours = machine?.specs.operatingHours || 0;

/**
 * URL query params for state management
 * Use URL to manage UI state (tab, section scroll, etc.)
 * Benefits: Shareable links, browser back/forward, bookmarks
 * 
 * Example use cases:
 * - ?tab=history - Open history tab by default
 * - ?section=stats - Auto-scroll to stats section
 * - ?edit=true - Open in edit mode directly
 */
// const [searchParams, setSearchParams] = useSearchParams();
// const activeTab = searchParams.get('tab') || 'details';
// const handleTabChange = (tab: string) => setSearchParams({ tab });
