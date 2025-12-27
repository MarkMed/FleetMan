import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMachineEvents, useCreateMachineEvent } from '@hooks/useMachineEvents';
import type { MachineEvent, GetEventsQuery } from '@services/api/machineEventService';

/**
 * ViewModel: MachineEventsScreen Business Logic
 * 
 * Responsibilities (MVVM-lite):
 * - Manage local state (filters, pagination, selected event)
 * - Fetch event history from API via hooks
 * - Handle user actions (filter change, load more, report event)
 * - Compute derived data (hasMore, isEmpty, formatted counts)
 * - Provide i18n access for View
 * 
 * Pattern:
 * - View (MachineEventsScreen.tsx) calls this hook
 * - ViewModel returns { state, data, actions, t }
 * - View renders based on ViewModel output (no business logic in View)
 * 
 * @param machineId - Machine UUID
 * 
 * @example
 * ```tsx
 * function MachineEventsScreen() {
 *   const { id: machineId } = useParams();
 *   const vm = useMachineEventsViewModel(machineId);
 *   
 *   if (vm.state.isLoading) return <Loading />;
 *   if (vm.state.error) return <Error onRetry={vm.actions.handleRetry} />;
 *   
 *   return (
 *     <div>
 *       <EventFilters
 *         filters={vm.state.filters}
 *         onFilterChange={vm.actions.handleFilterChange}
 *       />
 *       <EventsList
 *         events={vm.data.events}
 *         onEventClick={vm.actions.handleEventClick}
 *       />
 *       {vm.data.hasMore && (
 *         <Button onClick={vm.actions.handleLoadMore}>Load More</Button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMachineEventsViewModel(machineId: string | undefined) {
  const { t } = useTranslation();

  // ========================
  // STATE MANAGEMENT
  // ========================
  
  const [filters, setFilters] = useState<GetEventsQuery>({
    page: 1,
    limit: 20,
    typeId: undefined,
    isSystemGenerated: undefined,
    startDate: undefined,
    endDate: undefined,
    searchTerm: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  
  const [selectedEvent, setSelectedEvent] = useState<MachineEvent | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // ========================
  // DATA FETCHING
  // ========================
  
  const { data, isLoading, error, refetch } = useMachineEvents(machineId, filters);
  const createEventMutation = useCreateMachineEvent(machineId);

  // ========================
  // DERIVED STATE
  // ========================
  console.log('MachineEventsViewModel - data:', data);
  const events = data?.events || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 };
  const hasMore = pagination.page < pagination.totalPages;
  const isEmpty = events.length === 0 && !isLoading;
  const isFirstPageLoading = isLoading && filters.page === 1;

  // Compute stats
  const totalCount = pagination.total;
  const manualCount = events.filter(e => !e.isSystemGenerated).length;
  const systemCount = events.filter(e => e.isSystemGenerated).length;

  // ========================
  // BUSINESS LOGIC ACTIONS
  // ========================
  
  /**
   * Handle filter change: update filters and reset pagination
   * @param key - Filter key
   * @param value - Filter value
   */
  const handleFilterChange = (key: keyof GetEventsQuery, value: any) => {
    setFilters((prev: GetEventsQuery) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to page 1 when filters change
    }));
  };

  /**
   * Handle multiple filters at once (for UI convenience)
   * @param newFilters - Partial filter object
   */
  const handleFiltersChange = (newFilters: Partial<GetEventsQuery>) => {
    setFilters((prev: GetEventsQuery) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to page 1
    }));
  };

  /**
   * Clear all filters (reset to defaults)
   */
  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      typeId: undefined,
      isSystemGenerated: undefined,
      startDate: undefined,
      endDate: undefined,
      searchTerm: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  /**
   * Handle load more action: increment page number
   */
  const handleLoadMore = () => {
    setFilters((prev: GetEventsQuery) => ({
      ...prev,
      page: prev.page! + 1,
    }));
  };

  /**
   * Handle event click: open detail modal
   * @param event - Event object
   */
  const handleEventClick = (event: MachineEvent) => {
    setSelectedEvent(event);
  };

  /**
   * Close event detail modal
   */
  const handleCloseDetail = () => {
    setSelectedEvent(null);
  };

  /**
   * Open report event modal
   */
  const handleOpenReportModal = () => {
    setIsReportModalOpen(true);
  };

  /**
   * Close report event modal
   */
  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
  };

  /**
   * Handle retry action: refetch data
   */
  const handleRetry = () => {
    refetch();
  };

  // TODO: Strategic feature - Delete event (only manual events by creator)
  // const handleDeleteEvent = async (eventId: string) => {
  //   if (!window.confirm(t('machines.events.confirmDelete'))) return;
  //   
  //   try {
  //     await deleteEventMutation.mutateAsync(eventId);
  //     toast.success(t('machines.events.deleteSuccess'));
  //     handleCloseDetail(); // Close modal after delete
  //   } catch (error) {
  //     toast.error(t('machines.events.deleteError'));
  //   }
  // };

  // TODO: Strategic feature - Export history
  // const handleExport = async (format: 'csv' | 'pdf') => {
  //   try {
  //     const blob = await machineEventService.exportHistory(machineId!, format, filters);
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = `machine-${machineId}-events.${format}`;
  //     a.click();
  //     URL.revokeObjectURL(url);
  //     toast.success(t('machines.events.exportSuccess'));
  //   } catch (error) {
  //     toast.error(t('machines.events.exportError'));
  //   }
  // };

  // TODO: Strategic feature - Real-time updates via SSE
  // useEffect(() => {
  //   // Subscribe to SSE for machine events
  //   const unsubscribe = sseClient.subscribe((event) => {
  //     if (event.sourceType === 'MACHINE_EVENT' && event.machineId === machineId) {
  //       // Invalidate queries to refetch
  //       refetch();
  //     }
  //   });
  //   return unsubscribe;
  // }, [machineId, refetch]);

  // ========================
  // RETURN VIEWMODEL API
  // ========================
  
  return {
    // State
    state: {
      filters,
      isLoading,
      isFirstPageLoading,
      error,
      selectedEvent,
      isReportModalOpen,
      isEmpty,
    },
    
    // Data
    data: {
      events,
      pagination,
      hasMore,
      totalCount,
      manualCount,
      systemCount,
    },
    
    // Actions
    actions: {
      handleFilterChange,
      handleFiltersChange,
      handleClearFilters,
      handleLoadMore,
      handleEventClick,
      handleCloseDetail,
      handleOpenReportModal,
      handleCloseReportModal,
      handleRetry,
      // handleDeleteEvent, // TODO
      // handleExport, // TODO
    },
    
    // Mutations (expose for ReportEventModal)
    mutations: {
      createEvent: createEventMutation,
    },
    
    // i18n
    t,
  };
}
