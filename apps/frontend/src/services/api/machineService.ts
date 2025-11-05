import { apiClient, handleApiResponse } from './apiClient';
import { API_ENDPOINTS } from '@constants';
import { 
  Machine, 
  MachineFormData, 
  MachineEvent, 
  EventFormData, 
  MaintenanceReminder,
  MaintenanceReminderFormData,
  PaginatedResponse,
  MachineFilters,
  EventFilters
} from '@models';

export class MachineService {
  // Get all machines with optional filters
  async getMachines(filters?: MachineFilters): Promise<PaginatedResponse<Machine>> {
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

    const response = await apiClient.get<PaginatedResponse<Machine>>(
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

  // Get machine events/history
  async getMachineEvents(
    machineId: string, 
    filters?: EventFilters
  ): Promise<PaginatedResponse<MachineEvent>> {
    const params: Record<string, string> = {};
    
    if (filters) {
      if (filters.type?.length) {
        params.type = filters.type.join(',');
      }
      if (filters.severity?.length) {
        params.severity = filters.severity.join(',');
      }
      if (filters.dateFrom) {
        params.dateFrom = filters.dateFrom;
      }
      if (filters.dateTo) {
        params.dateTo = filters.dateTo;
      }
      if (filters.searchTerm) {
        params.search = filters.searchTerm;
      }
    }

    const response = await apiClient.get<PaginatedResponse<MachineEvent>>(
      API_ENDPOINTS.MACHINE_EVENTS(machineId),
      params
    );
    return handleApiResponse(response);
  }

  // Create machine event
  async createMachineEvent(machineId: string, eventData: EventFormData): Promise<MachineEvent> {
    const response = await apiClient.post<MachineEvent>(
      API_ENDPOINTS.MACHINE_EVENTS(machineId),
      eventData
    );
    return handleApiResponse(response);
  }

  // Get machine maintenance reminders
  async getMachineReminders(machineId: string): Promise<MaintenanceReminder[]> {
    const response = await apiClient.get<MaintenanceReminder[]>(
      API_ENDPOINTS.MACHINE_REMINDERS(machineId)
    );
    return handleApiResponse(response);
  }

  // Create maintenance reminder for machine
  async createMachineReminder(
    machineId: string, 
    reminderData: MaintenanceReminderFormData
  ): Promise<MaintenanceReminder> {
    const response = await apiClient.post<MaintenanceReminder>(
      API_ENDPOINTS.MACHINE_REMINDERS(machineId),
      reminderData
    );
    return handleApiResponse(response);
  }

  // Update maintenance reminder
  async updateMachineReminder(
    reminderId: string, 
    reminderData: Partial<MaintenanceReminderFormData>
  ): Promise<MaintenanceReminder> {
    const response = await apiClient.put<MaintenanceReminder>(
      API_ENDPOINTS.MAINTENANCE_REMINDER(reminderId),
      reminderData
    );
    return handleApiResponse(response);
  }

  // Delete maintenance reminder
  async deleteMachineReminder(reminderId: string): Promise<void> {
    const response = await apiClient.delete(
      API_ENDPOINTS.MAINTENANCE_REMINDER(reminderId)
    );
    handleApiResponse(response);
  }

  // Update machine hours
  async updateMachineHours(id: string, hours: number): Promise<Machine> {
    const response = await apiClient.patch<Machine>(
      API_ENDPOINTS.MACHINE(id),
      { hoursUsed: hours }
    );
    return handleApiResponse(response);
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