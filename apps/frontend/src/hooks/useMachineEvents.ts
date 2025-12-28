import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { machineEventService, type GetEventsQuery } from '@services/api/machineEventService';
import { QUERY_KEYS } from '@constants';

export type { GetEventsQuery };

/**
 * Hook: Get paginated machine event history with filters
 * 
 * Fetches event history for a specific machine with support for:
 * - Pagination (page, limit)
 * - Filtering (typeId, isSystemGenerated, date range, search)
 * - Sorting (by createdAt, title, typeId)
 * 
 * @param machineId - Machine UUID
 * @param filters - Optional filters and pagination
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useMachineEvents('machine-123', {
 *   page: 1,
 *   limit: 20,
 *   isSystemGenerated: false, // Only manual events
 *   startDate: '2024-01-01',
 *   searchTerm: 'reparación'
 * });
 * 
 * // data structure:
 * // {
 * //   events: MachineEvent[],
 * //   pagination: { total: 45, page: 1, limit: 20, totalPages: 3 },
 * //   filters: { ... }
 * // }
 * ```
 */
export const useMachineEvents = (machineId: string | undefined, filters?: GetEventsQuery) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.MACHINE_EVENTS(machineId || ''), filters],
    queryFn: () => {
      if (!machineId) {
        throw new Error('machineId is required for fetching events');
      }
      return machineEventService.getEvents(machineId, filters);
    },
    enabled: !!machineId, // Only fetch when machineId is available
    staleTime: 2 * 60 * 1000, // 2 minutes (less real-time than notifications)
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (machine not found) or 403 (no access)
      if (error?.status === 404 || error?.status === 403) return false;
      return failureCount < 2;
    },
  });
};

/**
 * Hook: Search event types for autocomplete
 * 
 * Provides fuzzy search for event types, ordered by popularity (timesUsed DESC).
 * Case-insensitive, searches in normalizedName.
 * 
 * @param searchTerm - User input (min 2 chars recommended)
 * @param options - Query options (limit, includeSystem)
 * 
 * @example
 * ```tsx
 * const [query, setQuery] = useState('');
 * const { data: types, isLoading } = useEventTypes(query, { limit: 10 });
 * 
 * <ComboBox
 *   options={types}
 *   onInputChange={setQuery}
 *   isLoading={isLoading}
 * />
 * ```
 */
export const useEventTypes = (searchTerm: string | undefined, options?: { limit?: number; includeSystem?: boolean }) => {
  return useQuery({
    queryKey: QUERY_KEYS.EVENT_TYPES_SEARCH(searchTerm || ''),
    queryFn: () => {
      if (!searchTerm || searchTerm.length < 1) {
        // Return empty array for empty search (don't call API)
        return [];
      }
      return machineEventService.searchEventTypes({
        q: searchTerm,
        limit: options?.limit || 10,
        includeSystem: options?.includeSystem ?? true,
      });
    },
    enabled: !!searchTerm && searchTerm.length >= 1, // Only search with input
    staleTime: 60 * 60 * 1000, // 1 hour (types are relatively stable)
    gcTime: 2 * 60 * 60 * 1000, // 2 hours cache
  });
};

/**
 * Hook: Get event types (for dropdown selection UI)
 * 
 * Returns event types, by default filtering out system-generated types.
 * Useful for showing user-created types in dropdowns.
 * 
 * @param limit - Max results (default: 100)
 * @param systemGenerated - Include system types (default: false)
 * 
 * @example
 * ```tsx
 * const { data: eventTypes } = usePopularEventTypes(100);
 * 
 * <EventTypeSelect
 *   eventTypes={eventTypes}
 *   onChange={handleSelect}
 * />
 * ```
 */
export const usePopularEventTypes = (limit: number = 100, systemGenerated: boolean = false) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.EVENT_TYPES, 'list', limit, systemGenerated],
    queryFn: () => machineEventService.getPopularEventTypes(limit, systemGenerated),
    staleTime: 60 * 60 * 1000, // 1 hour (types are relatively stable)
    gcTime: 2 * 60 * 60 * 1000, // 2 hours cache
  });
};

/**
 * Hook: Create machine event (manual report by user)
 * 
 * Mutation for reporting a new event on a machine.
 * Automatically invalidates related queries on success.
 * 
 * @param machineId - Machine UUID
 * 
 * @example
 * ```tsx
 * const createEvent = useCreateMachineEvent('machine-123');
 * 
 * const handleSubmit = (formData) => {
 *   createEvent.mutate({
 *     typeId: formData.typeId,
 *     title: formData.title,
 *     description: formData.description,
 *     metadata: { cost: 5000 }
 *   }, {
 *     onSuccess: () => {
 *       toast.success('Event reported successfully');
 *       closeModal();
 *     },
 *     onError: (error) => {
 *       toast.error('Failed to report event');
 *     }
 *   });
 * };
 * ```
 */
export const useCreateMachineEvent = (machineId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { typeId: string; title: string; description?: string; metadata?: Record<string, any> }) => {
      if (!machineId) {
        throw new Error('machineId is required for creating event');
      }
      return machineEventService.createEvent(machineId, payload);
    },
    onSuccess: () => {
      // Invalidate machine events list (refetch)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MACHINE_EVENTS(machineId || '') });
      
      // Invalidate machine details (may have "last event" display)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MACHINE(machineId || '') });

      // TODO: Strategic - Invalidate machine stats if we have event count dashboard
      // queryClient.invalidateQueries({ queryKey: ['machineStats', machineId] });
    },
    onError: (error) => {
      console.error('[useCreateMachineEvent] Failed to create event:', error);
    },
  });
};

/**
 * Hook: Create event type (crowdsourcing)
 * 
 * Mutation for creating a new event type.
 * Backend implements get-or-create pattern (returns existing if duplicate).
 * Invalidates event type searches on success.
 * 
 * @example
 * ```tsx
 * const createType = useCreateEventType();
 * 
 * const handleCreateNew = (name: string) => {
 *   createType.mutate({ name, language: 'es' }, {
 *     onSuccess: (newType) => {
 *       // Use the new/existing type
 *       setSelectedTypeId(newType.id);
 *     }
 *   });
 * };
 * ```
 */
export const useCreateEventType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; language?: string }) =>
      machineEventService.createEventType(payload),
    onSuccess: (newType) => {
      // Invalidate all event type queries (new type available)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EVENT_TYPES });

      console.log('[useCreateEventType] Created/found event type:', newType.name);
    },
    onError: (error) => {
      console.error('[useCreateEventType] Failed to create event type:', error);
    },
  });
};

// TODO: Strategic feature - Delete event mutation
// export const useDeleteMachineEvent = (machineId: string | undefined) => {
//   const queryClient = useQueryClient();
//
//   return useMutation({
//     mutationFn: (eventId: string) => {
//       if (!machineId) throw new Error('machineId required');
//       return machineEventService.deleteEvent(machineId, eventId);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MACHINE_EVENTS(machineId || '') });
//     }
//   });
// };

// TODO: Strategic feature - Update event metadata mutation
// export const useUpdateEventMetadata = (machineId: string | undefined) => {
//   const queryClient = useQueryClient();
//
//   return useMutation({
//     mutationFn: ({ eventId, metadata }: { eventId: string; metadata: Record<string, any> }) => {
//       if (!machineId) throw new Error('machineId required');
//       return machineEventService.updateEventMetadata(machineId, eventId, metadata);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MACHINE_EVENTS(machineId || '') });
//     }
//   });
// };
