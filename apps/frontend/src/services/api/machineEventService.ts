import { apiClient, handleApiResponse } from './apiClient';
import { API_ENDPOINTS } from '../../constants';

/**
 * Machine Event Service
 * 
 * Handles API calls for machine events (history tracking) and event types (crowdsourcing).
 * 
 * Architecture:
 * - Machine Events: Instances of events that happened to a machine (manual or system-generated)
 * - Event Types: Catalog of event types (crowdsourced, similar to MachineType pattern)
 * 
 * @example
 * ```tsx
 * // Get machine event history
 * const events = await machineEventService.getEvents(machineId, { page: 1, limit: 20 });
 * 
 * // Report manual event
 * await machineEventService.createEvent(machineId, {
 *   typeId: 'abc123',
 *   title: 'Reparación completada',
 *   description: 'Se reemplazó motor principal'
 * });
 * 
 * // Search event types for autocomplete
 * const types = await machineEventService.searchEventTypes('manteni');
 * ```
 */

/**
 * Query parameters for listing machine events
 * Supports pagination, filtering, and sorting
 */
export interface GetEventsQuery {
  /** Filter by specific event type ID */
  typeId?: string;
  
  /** Filter by system-generated vs manual events */
  isSystemGenerated?: boolean;
  
  /** Filter events after this date (ISO string) */
  startDate?: string;
  
  /** Filter events before this date (ISO string) */
  endDate?: string;
  
  /** Search in title and description */
  searchTerm?: string;
  
  /** Page number (1-indexed) */
  page?: number;
  
  /** Items per page (default: 20, max: 100) */
  limit?: number;
  
  /** Sort field */
  sortBy?: 'createdAt' | 'title' | 'typeId';
  
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Machine Event entity
 */
export interface MachineEvent {
  id: string;
  machineId: string;
  typeId: string;
  title: string;
  description: string;
  metadata: Record<string, any> | null;
  createdAt: string;
  createdBy: string | null;
  isSystemGenerated: boolean;
  
  // Populated fields (if backend includes them)
  type?: EventType;
  creator?: { id: string; name: string };
}

/**
 * Event Type entity (crowdsourced catalog)
 */
export interface EventType {
  id: string;
  name: string;
  normalizedName: string;
  languages: string[];
  systemGenerated: boolean;
  timesUsed: number;
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
}

/**
 * Paginated response for event listing
 */
export interface GetEventsResponse {
  events: MachineEvent[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: GetEventsQuery;
}

/**
 * Request payload for creating a machine event
 */
export interface CreateEventRequest {
  /** Event type ID (required) */
  typeId: string;
  
  /** Event title (3-200 chars) */
  title: string;
  
  /** Event description (10-2000 chars, optional) */
  description?: string;
  
  /** Flexible JSON metadata (optional) */
  metadata?: Record<string, any>;
}

/**
 * Response after creating event
 */
export interface CreateEventResponse {
  eventId: string;
  machineId: string;
}

/**
 * Query parameters for searching event types
 */
export interface SearchEventTypesQuery {
  /** Search term */
  q: string;
  
  /** Max results (default: 10, max: 50) */
  limit?: number;
  
  /** Include system-generated types (default: true) */
  includeSystem?: boolean;
}

/**
 * Request payload for creating event type (crowdsourcing)
 */
export interface CreateEventTypeRequest {
  /** Type name (2-100 chars) */
  name: string;
  
  /** Language code (ISO 639-1, default: 'es') */
  language?: string;
}

class MachineEventService {
  /**
   * Get paginated event history for a machine
   * 
   * IMPORTANT: Query Params Serialization Strategy
   * -----------------------------------------------
   * URL query params are ALWAYS strings (per HTTP spec).
   * Backend MUST use z.coerce.number() for numeric params to auto-convert.
   * 
   * If backend validation fails with "Expected number, received string":
   * 
   * Solution 1 (RECOMMENDED): Fix backend validation schema
   * ```ts
   * // In backend controller/route validation:
   * page: z.coerce.number().int().positive().default(1),
   * limit: z.coerce.number().int().positive().max(100).default(20)
   * ```
   * 
   * Solution 2: Update apiClient to support non-string params
   * - Change buildUrl signature to accept Record<string, any>
   * - Serialize numbers/booleans appropriately
   * - More complex but maintains type safety
   * 
   * Solution 3 (NOT RECOMMENDED): Use POST with JSON body
   * - Breaks RESTful conventions for list operations
   * - Disables HTTP caching
   * - Harder to debug (no URL visibility)
   * 
   * @param machineId - Machine UUID
   * @param query - Filters, pagination, sorting
   * @returns Paginated list of events
   * 
   * @example
   * ```tsx
   * const history = await machineEventService.getEvents('machine-123', {
   *   page: 1,
   *   limit: 20,
   *   isSystemGenerated: false, // Only manual events
   *   startDate: '2024-01-01',
   *   searchTerm: 'reparación'
   * });
   * ```
   */
  async getEvents(machineId: string, query?: GetEventsQuery): Promise<GetEventsResponse> {
    const params: Record<string, string> = {};
    
    if (query) {
      if (query.typeId) params.typeId = query.typeId;
      if (query.isSystemGenerated !== undefined) params.isSystemGenerated = String(query.isSystemGenerated);
      if (query.startDate) params.startDate = query.startDate;
      if (query.endDate) params.endDate = query.endDate;
      if (query.searchTerm) params.searchTerm = query.searchTerm;
      // Keep page and limit as numbers in params - axios/fetch will serialize correctly
      if (query.page !== undefined) params.page = String(query.page);
      if (query.limit !== undefined) params.limit = String(query.limit);
      if (query.sortBy) params.sortBy = query.sortBy;
      if (query.sortOrder) params.sortOrder = query.sortOrder;
    }

    const response = await apiClient.get<{ success: boolean; message?: string; data: GetEventsResponse }>(
      API_ENDPOINTS.MACHINE_EVENTS(machineId),
      params
    );

    const processed = handleApiResponse(response);
    return (processed as any).data ?? processed;
  }

  /**
   * Create a machine event (manual report by user)
   * 
   * Backend validates:
   * - User has access to machine (owner or assigned provider)
   * - Event type exists
   * - Title: 3-200 chars
   * - Description: 10-2000 chars (if provided)
   * 
   * @param machineId - Machine UUID
   * @param payload - Event data
   * @returns Created event IDs
   * 
   * @example
   * ```tsx
   * await machineEventService.createEvent('machine-123', {
   *   typeId: 'type-abc',
   *   title: 'Motor reemplazado',
   *   description: 'Se instaló motor nuevo marca XYZ',
   *   metadata: { partNumber: 'MOT-12345', cost: 5000 }
   * });
   * ```
   */
  async createEvent(machineId: string, payload: CreateEventRequest): Promise<CreateEventResponse> {
    console.log('[machineEventService.createEvent] Creating event for machine:', machineId);
    console.log('[machineEventService.createEvent] Payload:', payload);

    const response = await apiClient.post<{ success: boolean; message?: string; data: CreateEventResponse }>(
      API_ENDPOINTS.MACHINE_EVENTS(machineId),
      payload
    );

    console.log('[machineEventService.createEvent] Raw response:', response);

    const processed = handleApiResponse(response);
    const result = (processed as any).data ?? processed;
    
    console.log('[machineEventService.createEvent] Event created:', result);
    
    return result;
  }

  /**
   * Search event types for autocomplete (fuzzy search)
   * 
   * Returns types matching the search term, ordered by popularity (timesUsed DESC).
   * Case-insensitive, searches in normalizedName.
   * 
   * @param query - Search parameters
   * @returns List of matching event types
   * 
   * @example
   * ```tsx
   * // User types "mante" in autocomplete
   * const types = await machineEventService.searchEventTypes({ q: 'mante', limit: 10 });
   * // Returns: ["Mantenimiento Preventivo", "Mantenimiento Correctivo", ...]
   * ```
   */
  async searchEventTypes(query: SearchEventTypesQuery): Promise<EventType[]> {
    const params: Record<string, string> = {
      q: query.q,
    };
    
    if (query.limit) params.limit = String(query.limit);
    if (query.includeSystem !== undefined) params.includeSystem = String(query.includeSystem);

    const response = await apiClient.get<{ success: boolean; message?: string; data: { types: EventType[] } }>(
      API_ENDPOINTS.EVENT_TYPES_SEARCH,
      params
    );

    console.log('[machineEventService.searchEventTypes] Raw response:', response);

    const processed = handleApiResponse(response);
    const data = (processed as any).data ?? processed;
    
    console.log('[machineEventService.searchEventTypes] Found types:', data.types?.length || 0);
    
    // Fallback: React Query requiere que no se retorne undefined
    return data.types || [];
  }

  /**
   * Get event types (catalog)
   * 
   * Returns event types with optional filters.
   * By default filters out system-generated types.
   * 
   * @param limit - Max results (default: 100)
   * @param systemGenerated - Include system types (default: false)
   * @param language - Filter by language (e.g., 'es', 'en')
   * @returns List of event types
   * 
   * @example
   * ```tsx
   * // Get user-created types only for Spanish
   * const types = await machineEventService.getPopularEventTypes(100, false, 'es');
   * ```
   */
  async getPopularEventTypes(
    limit: number = 100, 
    systemGenerated: boolean = false,
    language?: string
  ): Promise<EventType[]> {
    const params: Record<string, string> = {
      limit: String(limit),
      systemGenerated: String(systemGenerated),
    };

    if (language) {
      params.language = language;
    }

    console.log('[machineEventService.getPopularEventTypes] Fetching event types, params:', params);

    const response = await apiClient.get<{ success: boolean; message?: string; data: { types: EventType[] } }>(
      API_ENDPOINTS.EVENT_TYPES,
      params
    );

    console.log('[machineEventService.getPopularEventTypes] Raw response:', response);

    const processed = handleApiResponse(response);
    const data = (processed as any).data ?? processed;
    
    console.log('[machineEventService.getPopularEventTypes] Processed data:', data);
    console.log('[machineEventService.getPopularEventTypes] Returning types:', data.types?.length || 0, 'types');
    
    // Fallback: React Query requiere que no se retorne undefined
    return data.types || [];
  }

  /**
   * Create event type (crowdsourcing pattern)
   * 
   * Backend implements get-or-create:
   * - If type exists (case-insensitive), adds language if new
   * - If doesn't exist, creates new type
   * 
   * This enables organic catalog growth by users.
   * 
   * @param payload - Type name and language
   * @returns Created or existing event type
   * 
   * @example
   * ```tsx
   * // User types new type in autocomplete: "Limpieza Profunda"
   * const type = await machineEventService.createEventType({
   *   name: 'Limpieza Profunda',
   *   language: 'es'
   * });
   * // Now all users can use this type
   * ```
   */
  async createEventType(payload: CreateEventTypeRequest): Promise<EventType> {
    console.log('[machineEventService.createEventType] Creating type:', payload);

    const response = await apiClient.post<{ success: boolean; message?: string; data: EventType }>(
      API_ENDPOINTS.EVENT_TYPES,
      payload
    );

    console.log('[machineEventService.createEventType] Raw response:', response);

    const processed = handleApiResponse(response);
    const data = (processed as any).data ?? processed;
    
    console.log('[machineEventService.createEventType] Created/found type:', data);
    
    return data;
  }

  // TODO: Strategic feature - Delete event (only manual events by creator)
  // async deleteEvent(machineId: string, eventId: string): Promise<void> {
  //   await apiClient.delete(`/machines/${machineId}/events/${eventId}`);
  // }

  // TODO: Strategic feature - Update event metadata (post-creation edit)
  // async updateEventMetadata(machineId: string, eventId: string, metadata: Record<string, any>): Promise<void> {
  //   await apiClient.patch(`/machines/${machineId}/events/${eventId}`, { metadata });
  // }

  // TODO: Strategic feature - Export history to CSV/PDF
  // async exportHistory(machineId: string, format: 'csv' | 'pdf', filters?: GetEventsQuery): Promise<Blob> {
  //   const response = await apiClient.get(`/machines/${machineId}/events/export`, {
  //     ...filters,
  //     format
  //   }, { responseType: 'blob' });
  //   return response.data;
  // }

  // TODO: Strategic feature - Get event statistics (counts by type, timeline chart data)
  // async getEventStats(machineId: string): Promise<{ byType: Record<string, number>, timeline: Array<{date: string, count: number}> }> {
  //   const response = await apiClient.get(`/machines/${machineId}/events/stats`);
  //   return response.data.data;
  // }
}

// Singleton export
export const machineEventService = new MachineEventService();
