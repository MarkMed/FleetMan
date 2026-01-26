import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { dashboardService } from '@services/api/dashboardService';
import { QUERY_KEYS } from '@constants';
import type {
  RecentQuickCheckDTO,
  RecentMachineEventDTO,
  GetRecentQuickChecksResponse,
  GetRecentMachineEventsResponse,
} from '@packages/contracts';

/**
 * useDashboard - Sprint #12 (Bundle 12)
 * 
 * Custom hook para gestionar datos del dashboard con:
 * - Carga inicial de QuickChecks y Eventos recientes
 * - Paginación incremental acumulativa ("Load More" pattern)
 * - Cache optimizado con TanStack Query usando cache key fija
 * - Estados de loading/error por separado
 * 
 * Arquitectura:
 * - Usa cache key FIJA (sin offset) para acumular datos en la misma entrada de cache
 * - Mutations actualizan el cache principal acumulando nuevas páginas
 * - StaleTime de 2 mins (dashboard se actualiza frecuentemente)
 * 
 * @example
 * const {
 *   quickChecks,
 *   events,
 *   loadMoreQuickChecks,
 *   loadMoreEvents,
 *   isLoadingQuickChecks,
 *   isLoadingEvents,
 * } = useDashboard();
 */

const INITIAL_LIMIT = 5; // Cantidad inicial de items a mostrar
const LOAD_MORE_LIMIT = 5; // Cantidad a cargar con "Ver más"

export const useDashboard = () => {
  const queryClient = useQueryClient();

  // Estado local para paginación (offset tracking)
  const [quickChecksOffset, setQuickChecksOffset] = useState(0);
  const [eventsOffset, setEventsOffset] = useState(0);

  // Query: Obtener QuickChecks recientes (carga inicial con cache key fija)
  const {
    data: quickChecksData,
    isLoading: isLoadingQuickChecks,
    error: quickChecksError,
    refetch: refetchQuickChecks,
  } = useQuery<GetRecentQuickChecksResponse>({
    queryKey: QUERY_KEYS.DASHBOARD_RECENT_QUICKCHECKS,
    queryFn: () => dashboardService.getRecentQuickChecks(INITIAL_LIMIT, 0),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos (antes cacheTime)
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });

  // Query: Obtener Eventos recientes (carga inicial con cache key fija)
  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents,
  } = useQuery<GetRecentMachineEventsResponse>({
    queryKey: QUERY_KEYS.DASHBOARD_RECENT_EVENTS,
    queryFn: () => dashboardService.getRecentEvents(INITIAL_LIMIT, 0),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });

  // Mutation: Cargar más QuickChecks (botón "+ Más")
  // Acumula datos en la MISMA cache key (sin offset en key)
  const loadMoreQuickChecksMutation = useMutation({
    mutationFn: async () => {
      const newOffset = quickChecksOffset + LOAD_MORE_LIMIT;
      const newData = await dashboardService.getRecentQuickChecks(LOAD_MORE_LIMIT, newOffset);
      
      // Actualizar cache con cache key FIJA (acumulación correcta)
      queryClient.setQueryData<GetRecentQuickChecksResponse>(
        QUERY_KEYS.DASHBOARD_RECENT_QUICKCHECKS,
        (old: GetRecentQuickChecksResponse | undefined) => {
          if (!old) return newData;
          
          // Acumular nuevos items a los existentes
          return {
            ...old, // Mantener metadata original (total, limit inicial)
            data: [...old.data, ...newData.data], // ✅ Acumulación
            offset: newOffset, // Actualizar offset para próxima carga
            hasMore: newData.hasMore, // Actualizar flag hasMore
          };
        }
      );

      return newOffset;
    },
    onSuccess: (newOffset) => {
      setQuickChecksOffset(newOffset);
    },
  });

  // Mutation: Cargar más Eventos (botón "+ Más")
  // Acumula datos en la MISMA cache key (sin offset en key)
  const loadMoreEventsMutation = useMutation({
    mutationFn: async () => {
      const newOffset = eventsOffset + LOAD_MORE_LIMIT;
      const newData = await dashboardService.getRecentEvents(LOAD_MORE_LIMIT, newOffset);
      
      // Actualizar cache con cache key FIJA (acumulación correcta)
      queryClient.setQueryData<GetRecentMachineEventsResponse>(
        QUERY_KEYS.DASHBOARD_RECENT_EVENTS,
        (old: GetRecentMachineEventsResponse | undefined) => {
          if (!old) return newData;
          
          // Acumular nuevos items a los existentes
          return {
            ...old, // Mantener metadata original (total, limit inicial)
            data: [...old.data, ...newData.data], // ✅ Acumulación
            offset: newOffset, // Actualizar offset para próxima carga
            hasMore: newData.hasMore, // Actualizar flag hasMore
          };
        }
      );

      return newOffset;
    },
    onSuccess: (newOffset) => {
      setEventsOffset(newOffset);
    },
  });

  // Helpers para manejo de estados
  const quickChecks: RecentQuickCheckDTO[] = quickChecksData?.data || [];
  const events: RecentMachineEventDTO[] = eventsData?.data || [];

  const hasMoreQuickChecks = quickChecksData?.hasMore || false;
  const hasMoreEvents = eventsData?.hasMore || false;

  const totalQuickChecks = quickChecksData?.total || 0;
  const totalEvents = eventsData?.total || 0;

  return {
    // Data
    quickChecks,
    events,
    totalQuickChecks,
    totalEvents,

    // Pagination flags
    hasMoreQuickChecks,
    hasMoreEvents,

    // Loading states
    isLoadingQuickChecks,
    isLoadingEvents,
    isLoadingMoreQuickChecks: loadMoreQuickChecksMutation.isPending,
    isLoadingMoreEvents: loadMoreEventsMutation.isPending,

    // Error states
    quickChecksError,
    eventsError,

    // Actions
    loadMoreQuickChecks: loadMoreQuickChecksMutation.mutate,
    loadMoreEvents: loadMoreEventsMutation.mutate,
    refetchQuickChecks,
    refetchEvents,

    // Reset function (útil cuando el usuario navega a otra sección y vuelve)
    resetPagination: () => {
      setQuickChecksOffset(0);
      setEventsOffset(0);
      queryClient.invalidateQueries({
        queryKey: ['dashboard'], // Invalida todas las queries de dashboard
      });
    },
  };
};

/**
 * Future Enhancement: useInfiniteQuery approach
 * 
 * Para mejor UX con infinite scroll automático (sin botón "Ver más"),
 * considerar migrar a useInfiniteQuery:
 * 
 * const {
 *   data: quickChecksPages,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage,
 * } = useInfiniteQuery({
 *   queryKey: QUERY_KEYS.DASHBOARD_RECENT_QUICKCHECKS,
 *   queryFn: ({ pageParam = 0 }) => dashboardService.getRecentQuickChecks(5, pageParam),
 *   getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.offset + 5 : undefined,
 *   initialPageParam: 0,
 * });
 * 
 * Ventajas:
 * - TanStack Query gestiona paginación automáticamente
 * - Mejor integración con Intersection Observer (scroll infinito)
 * - Cache por página individual
 * 
 * Desventajas:
 * - Menos control sobre acumulación de datos
 * - Estructura de datos más compleja (pages array)
 */
