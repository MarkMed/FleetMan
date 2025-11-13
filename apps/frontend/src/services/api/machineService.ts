import { apiClient, handleApiResponse } from './apiClient';
import { API_ENDPOINTS } from '../../constants';
import type { 
  CreateMachineResponse as Machine,
  CreateMachineRequest as MachineFormData,
  ListMachinesResponse
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

export class MachineService {
  // Get all machines with optional filters
  async getMachines(filters?: MachineFilters): Promise<ListMachinesResponse> {
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

    const response = await apiClient.get<ListMachinesResponse>(
      API_ENDPOINTS.MACHINES,
      params
    );
    return handleApiResponse(response);
  }

  // Get machine by ID
  async getMachine(id: string): Promise<Machine> {
    const response = await apiClient.get<Machine>(API_ENDPOINTS.MACHINE(id));
    return handleApiResponse(response);
  }

  // Create new machine
  async createMachine(machineData: MachineFormData): Promise<Machine> {
    const response = await apiClient.post<Machine>(
      API_ENDPOINTS.MACHINES,
      machineData
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
}

// Create and export service instance
export const machineService = new MachineService();