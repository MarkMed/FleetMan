import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  useMachineEvents, 
  useCreateMachineEvent,
  usePopularEventTypes,
  useCreateEventType,
} from '@hooks/useMachineEvents';
import { useDebounce } from '@hooks/useDebounce';
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
  
  // Acumulador de eventos cargados (estrategia híbrida)
  const [allLoadedEvents, setAllLoadedEvents] = useState<MachineEvent[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreInBackend, setHasMoreInBackend] = useState(true);
  
  // Ref para skipear reset en primer montaje
  const isInitialMount = useRef(true);
  
  // Filtros locales (quick filters - instantáneos)
  const [localFilters, setLocalFilters] = useState({
    isSystemGenerated: undefined as boolean | undefined,
    typeId: undefined as string | undefined,
  });
  
  // Filtros backend (búsqueda, date range - requieren API call)
  const [backendFilters, setBackendFilters] = useState({
    searchTerm: undefined as string | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
    sortBy: 'createdAt' as 'createdAt' | 'title' | 'typeId',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
  
  const [selectedEvent, setSelectedEvent] = useState<MachineEvent | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // Debounce search para evitar llamadas API excesivas
  const debouncedSearchTerm = useDebounce(backendFilters.searchTerm, 500);

  // ========================
  // DATA FETCHING (BACKEND)
  // ========================
  
  // Solo fetch con backend filters (search, date range, sort)
  // Quick filters (isSystemGenerated, typeId) se aplican localmente
  const { data, isLoading, error, refetch } = useMachineEvents(machineId, {
    page: currentPage,
    limit: 30, // 30 eventos por página para balance UX/performance
    searchTerm: debouncedSearchTerm,
    startDate: backendFilters.startDate,
    endDate: backendFilters.endDate,
    sortBy: backendFilters.sortBy,
    sortOrder: backendFilters.sortOrder,
    // NO incluimos isSystemGenerated ni typeId (filtrado local)
  });
  
  const createEventMutation = useCreateMachineEvent(machineId);

  // OPTIMIZACIÓN: Precargar tipos de eventos al montar (1 llamada API única)
  // Los tipos se pasan a los componentes hijos (EventTypeSelect)
  // No hay llamadas API por keystroke durante búsqueda
  // Filtra automáticamente los tipos generados por el sistema
  const { 
    data: eventTypes = [], 
    isLoading: isLoadingEventTypes,
    error: eventTypesError,
  } = usePopularEventTypes(100, false); // false = solo tipos creados por usuarios

  const createEventTypeMutation = useCreateEventType();

  // DEBUG: Log event types state
  console.log('[useMachineEventsViewModel] Event Types State:', {
    eventTypesCount: eventTypes.length,
    isLoadingEventTypes,
    eventTypesError,
    sampleTypes: eventTypes.slice(0, 3).map(t => ({ id: t.id, name: t.name })),
  });
  
  // ========================
  // ACUMULACIÓN DE EVENTOS
  // ========================
  
  // Acumular eventos cuando llega nueva data del backend
  useEffect(() => {
    if (data?.events && data.events.length > 0) {
      setAllLoadedEvents(prev => {
        // Evitar duplicados usando Set con IDs
        const existingIds = new Set(prev.map(e => e.id));
        const newEvents = data.events.filter(e => !existingIds.has(e.id));
        
        console.log('[useMachineEventsViewModel] Acumulando eventos:', {
          prevCount: prev.length,
          newCount: newEvents.length,
          totalAfter: prev.length + newEvents.length,
          page: data.pagination.page,
        });
        
        return [...prev, ...newEvents];
      });
      
      // Actualizar flag de "hay más eventos en backend"
      setHasMoreInBackend(data.pagination.page < data.pagination.totalPages);
    }
  }, [data]);
  
  // Reset acumulador cuando cambia machineId o backend filters (search, date)
  useEffect(() => {
    // Skip reset en el primer montaje (evita limpiar eventos iniciales)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    console.log('[useMachineEventsViewModel] Resetting accumulator:', {
      machineId,
      searchTerm: debouncedSearchTerm,
      startDate: backendFilters.startDate,
      endDate: backendFilters.endDate,
    });
    
    setAllLoadedEvents([]);
    setCurrentPage(1);
    setHasMoreInBackend(true);
  }, [machineId, debouncedSearchTerm, backendFilters.startDate, backendFilters.endDate]);

  // ========================
  // FILTRADO LOCAL (QUICK FILTERS)
  // ========================
  
  // Aplicar filtros locales sobre eventos acumulados (instantáneo, sin API call)
  const filteredEvents = useMemo(() => {
    console.log('[useMachineEventsViewModel] Aplicando filtros locales:', localFilters);
    
    return allLoadedEvents.filter(event => {
      // Filtro: Sistema vs Manual
      if (localFilters.isSystemGenerated !== undefined) {
        if (event.isSystemGenerated !== localFilters.isSystemGenerated) {
          return false;
        }
      }
      
      // Filtro: Tipo de evento específico
      if (localFilters.typeId) {
        if (event.typeId !== localFilters.typeId) {
          return false;
        }
      }
      
      // TODO: Strategic feature - Filtros adicionales locales
      // - Filtrar por createdBy (eventos del usuario actual)
      // - Filtrar por rango de fechas aproximado (si ya está en memoria)
      // - Filtrar por tags/labels (si se implementa metadata estructurada)
      
      return true;
    });
  }, [allLoadedEvents, localFilters]);
  
  // Aplicar sorting local (sobre eventos ya filtrados)
  const sortedEvents = useMemo(() => {
    const sorted = [...filteredEvents];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      if (backendFilters.sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (backendFilters.sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (backendFilters.sortBy === 'typeId') {
        comparison = a.typeId.localeCompare(b.typeId);
      }
      
      return backendFilters.sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }, [filteredEvents, backendFilters.sortBy, backendFilters.sortOrder]);
  
  // ========================
  // DERIVED STATE
  // ========================
  
  const events = sortedEvents; // Eventos finales (acumulados + filtrados + ordenados)
  const pagination = data?.pagination || { total: 0, page: currentPage, limit: 30, totalPages: 0 };
  const isEmpty = events.length === 0 && !isLoading && allLoadedEvents.length === 0;
  const isFirstPageLoading = isLoading && currentPage === 1;
  
  // Compute stats sobre TODOS los eventos cargados (no filtrados)
  // Esto da contexto al usuario de cuántos eventos hay en total
  const totalLoadedCount = allLoadedEvents.length;
  const totalBackendCount = pagination.total;
  const manualCount = allLoadedEvents.filter(e => !e.isSystemGenerated).length;
  const systemCount = allLoadedEvents.filter(e => e.isSystemGenerated).length;
  
  // Mostrar "Cargar Más" si:
  // 1. Hay más en backend, O
  // 2. Hay eventos filtrados que no se muestran (edge case raro)
  const showLoadMore = hasMoreInBackend;
  
  console.log('[useMachineEventsViewModel] Estado actual:', {
    totalLoadedCount,
    totalBackendCount,
    filteredCount: events.length,
    hasMoreInBackend,
    showLoadMore,
    currentPage,
  });

  // ========================
  // BUSINESS LOGIC ACTIONS
  // ========================
  
  /**
   * Handle quick filter change (local, instantáneo)
   * Se aplica sobre eventos ya cargados sin llamar al backend
   * @param key - Filter key (isSystemGenerated, typeId)
   * @param value - Filter value
   */
  const handleQuickFilterChange = (key: 'isSystemGenerated' | 'typeId', value: any) => {
    console.log('[useMachineEventsViewModel] Quick filter change:', { key, value });
    setLocalFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  /**
   * Handle backend filter change (search, date range, sort)
   * Resetea acumulador y hace nueva llamada al backend
   * @param key - Filter key
   * @param value - Filter value
   */
  const handleBackendFilterChange = (
    key: 'searchTerm' | 'startDate' | 'endDate' | 'sortBy' | 'sortOrder',
    value: any
  ) => {
    console.log('[useMachineEventsViewModel] Backend filter change:', { key, value });
    setBackendFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    // Reset se hace automáticamente en useEffect que detecta cambios en backendFilters
  };

  /**
   * Handle filter change: update filters and reset pagination
   * DEPRECATED: Usar handleQuickFilterChange o handleBackendFilterChange
   * Mantenido por compatibilidad
   */
  const handleFilterChange = (key: keyof GetEventsQuery, value: any) => {
    console.warn('[useMachineEventsViewModel] handleFilterChange is deprecated, use handleQuickFilterChange or handleBackendFilterChange');
    handleFiltersChange({ [key]: value });
  };

  /**
   * Handle multiple filters at once (para compatibilidad con EventFilters)
   * Detecta automáticamente si son quick filters o backend filters
   * @param newFilters - Partial filter object
   */
  const handleFiltersChange = (newFilters: Partial<GetEventsQuery>) => {
    console.log('[useMachineEventsViewModel] handleFiltersChange:', newFilters);
    
    // Separar quick filters de backend filters
    const quickFilters: Partial<typeof localFilters> = {};
    const backFilters: Partial<typeof backendFilters> = {};
    
    if ('isSystemGenerated' in newFilters) {
      quickFilters.isSystemGenerated = newFilters.isSystemGenerated;
    }
    if ('typeId' in newFilters) {
      quickFilters.typeId = newFilters.typeId;
    }
    if ('searchTerm' in newFilters) {
      backFilters.searchTerm = newFilters.searchTerm;
    }
    if ('startDate' in newFilters) {
      backFilters.startDate = newFilters.startDate;
    }
    if ('endDate' in newFilters) {
      backFilters.endDate = newFilters.endDate;
    }
    if ('sortBy' in newFilters) {
      backFilters.sortBy = newFilters.sortBy as any;
    }
    if ('sortOrder' in newFilters) {
      backFilters.sortOrder = newFilters.sortOrder as any;
    }
    
    // Aplicar cambios
    if (Object.keys(quickFilters).length > 0) {
      setLocalFilters(prev => ({ ...prev, ...quickFilters }));
    }
    if (Object.keys(backFilters).length > 0) {
      setBackendFilters(prev => ({ ...prev, ...backFilters }));
    }
  };

  /**
   * Clear all filters (reset to defaults)
   */
  const handleClearFilters = () => {
    console.log('[useMachineEventsViewModel] Clearing all filters');
    setLocalFilters({
      isSystemGenerated: undefined,
      typeId: undefined,
    });
    setBackendFilters({
      searchTerm: undefined,
      startDate: undefined,
      endDate: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  /**
   * Handle load more action: incrementa página para fetch siguiente batch
   * Los nuevos eventos se acumulan automáticamente en useEffect
   */
  const handleLoadMore = () => {
    if (!isLoading && hasMoreInBackend) {
      console.log('[useMachineEventsViewModel] Loading more events, page:', currentPage + 1);
      setCurrentPage(prev => prev + 1);
    }
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

  /**
   * Handle create new event type (crowdsourcing)
   * Auto-asigna el nuevo tipo creado
   * @param name - Nombre del nuevo tipo
   * @returns Nuevo tipo creado
   */
  const handleCreateEventType = async (name: string) => {
    console.log('[useMachineEventsViewModel.handleCreateEventType] Creating type:', name);
    
    const newType = await createEventTypeMutation.mutateAsync({
      name: name.trim(),
      language: 'es', // TODO: Use i18n.language if needed
    });
    
    console.log('[useMachineEventsViewModel.handleCreateEventType] Type created/found:', newType);
    
    return newType;
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
      // Filtros expuestos para compatibilidad con EventFilters
      filters: {
        ...localFilters,
        ...backendFilters,
        page: currentPage,
        limit: 30,
      } as GetEventsQuery,
      isLoading,
      isFirstPageLoading,
      error,
      selectedEvent,
      isReportModalOpen,
      isEmpty,
      isLoadingEventTypes,
      // Nuevo: flags para UX del botón "Cargar Más"
      isLoadingMore: isLoading && currentPage > 1,
      hasMoreInBackend,
      showLoadMore,
    },
    
    // Data
    data: {
      events, // Eventos finales (acumulados + filtrados + ordenados)
      allLoadedEvents, // Todos los eventos cargados (sin filtrar)
      filteredCount: events.length,
      totalLoadedCount, // Total de eventos en memoria
      totalBackendCount, // Total de eventos en backend
      pagination,
      hasMore: showLoadMore,
      totalCount: totalBackendCount,
      manualCount,
      systemCount,
      eventTypes, // Tipos precargados para EventTypeSelect
      // TODO: Strategic - Agregar stats avanzadas
      // eventsByType: Map<string, number> - Distribución por tipo
      // eventsByMonth: Array<{month: string, count: number}> - Timeline
      // topEventTypes: Array<{typeId: string, name: string, count: number}> - Top 5
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
      handleCreateEventType, // Crear nuevo tipo (crowdsourcing)
      // handleDeleteEvent, // TODO
      // handleExport, // TODO
    },
    
    // Mutations (expose for ReportEventModal)
    mutations: {
      createEvent: createEventMutation,
      createEventType: createEventTypeMutation,
    },
    
    // i18n
    t,
  };
}
