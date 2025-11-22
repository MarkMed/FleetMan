import { apiClient, handleApiResponse } from './apiClient';
import { API_ENDPOINTS } from '../../constants';
import { getSessionToken } from '../../store/slices/authSlice';
import type { 
  CreateMachineResponse as Machine,
  CreateMachineRequest as MachineFormData,
  ListMachinesResponse
} from '@packages/contracts';
import type { MachineTypeResponse } from '@packages/contracts';
import type {
  CreateMachineEventRequest,
  CreateMachineEventResponse,
  ListMachineEventsResponse
} from '@packages/contracts';

// Temporary basic types for MVP
interface MachineFilters {
  status?: string[];
  brand?: string[];
  location?: string[];
  ownerId?: string;
  managedById?: string;
  searchTerm?: string;
}

interface EventFilters {
  type?: string[];
  severity?: string[];
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

export interface MachinesListResult {
  machines: Machine[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class MachineService {
  // Get all machines with optional filters
  async getMachines(filters?: MachineFilters): Promise<MachinesListResult> {
    const params: Record<string, string> = {};
    
    if (filters) {
      if (filters.status?.length) {
        params.status = filters.status.join(',');
      }
      if (filters.brand?.length) {
        params.brand = filters.brand.join(',');
      }
      if (filters.location?.length) {
        params.location = filters.location.join(',');
      }
      if (filters.ownerId) {
        params.ownerId = filters.ownerId;
      }
      if (filters.managedById) {
        params.managedById = filters.managedById;
      }
      if (filters.searchTerm) {
        params.search = filters.searchTerm;
      }
    }

    const response = await apiClient.get<{ success: boolean; message?: string; data: ListMachinesResponse }>(
      API_ENDPOINTS.MACHINES,
      params
    );
    const processed = handleApiResponse(response);
    const payload: ListMachinesResponse = (processed as any).data ?? (processed as any);
    return {
      machines: payload.machines ?? [],
      pagination: payload.total !== undefined ? {
        total: payload.total,
        page: payload.page,
        limit: payload.limit,
        totalPages: payload.totalPages,
      } : undefined,
    };
  }

  // Get machine by ID
  async getMachine(id: string): Promise<Machine> {
    const response = await apiClient.get<Machine>(API_ENDPOINTS.MACHINE(id));
    return handleApiResponse(response);
  }

  // Create new machine
  async createMachine(
    machineData: MachineFormData,
    headers?: Record<string, string>
  ): Promise<{success: boolean, message: string, data: Machine}> {
    const response = await apiClient.post<{success: boolean, message: string, data: Machine}>(
      API_ENDPOINTS.MACHINES,
      machineData,
      headers
    );
    return handleApiResponse(response);
  }

  // Update machine
  async updateMachine(id: string, machineData: Partial<MachineFormData>): Promise<Machine> {
    const response = await apiClient.put<Machine>(
      API_ENDPOINTS.MACHINE(id),
      machineData
    );
    return handleApiResponse(response);
  }

  // Delete machine
  async deleteMachine(id: string): Promise<void> {
    const response = await apiClient.delete(API_ENDPOINTS.MACHINE(id));
    handleApiResponse(response);
  }

  // Get machine events
  async getMachineEvents(machineId: string): Promise<ListMachineEventsResponse> {
    const response = await apiClient.get<ListMachineEventsResponse>(API_ENDPOINTS.MACHINE_EVENTS(machineId));
    return handleApiResponse(response);
  }

  // Create machine event
  async createMachineEvent(machineId: string, eventData: CreateMachineEventRequest): Promise<CreateMachineEventResponse> {
    const payload = { ...eventData, machineId };
    const response = await apiClient.post<CreateMachineEventResponse>(API_ENDPOINTS.MACHINE_EVENTS(machineId), payload);
    return handleApiResponse(response);
  }

  // Get machine reminders
  async getMachineReminders(machineId: string): Promise<any> {
    const response = await apiClient.get(API_ENDPOINTS.MACHINE_REMINDERS(machineId));
    return handleApiResponse(response);
  }

  // Create machine reminder
  async createMachineReminder(machineId: string, reminderData: any): Promise<any> {
    const payload = { ...reminderData, machineId };
    const response = await apiClient.post(API_ENDPOINTS.MACHINE_REMINDERS(machineId), payload);
    return handleApiResponse(response);
  }

  // Update machine operating hours convenience method
  async updateMachineHours(id: string, hours: number): Promise<Machine> {
    // Reuse updateMachine to update the specs.operatingHours
    return this.updateMachine(id, { specs: { operatingHours: hours } } as any);
  }

  // Get machine statistics (for dashboard)
  async getMachineStats(): Promise<{
    total: number;
    active: number;
    maintenance: number;
    broken: number;
    inactive: number;
  }> {
    const response = await apiClient.get(`${API_ENDPOINTS.MACHINES}/stats`);
    return handleApiResponse(response);
  }

  // Get machine types (for dropdowns etc.)
  async getMachineTypes(language?: string): Promise<MachineTypeResponse[]> {
    const params: Record<string, string> = {};
    if (language) params.language = language;

    // Read token synchronously from store helper and pass it explicitly as headers
    let headers: Record<string, string> | undefined = undefined;
    try {
      const token = getSessionToken();
      if (token) {
        headers = { Authorization: `Bearer ${token}` };
      }
    } catch (e) {
      // Non-fatal: proceed without headers if helper fails
      console.warn('machineService: getSessionToken failed', e);
      headers = undefined;
    }
    console.log('🛰️ machineService: getMachineTypes using headers:', headers);
    const response = await apiClient.get(API_ENDPOINTS.MACHINE_TYPES, params, headers);
    console.log('🧭 Raw API response for machine types:', response);
    const data = handleApiResponse(response).data;
    console.log('✅ Processed machine types data:', data);
    return data;
  }
}

// Create and export service instance
export const machineService = new MachineService();
