import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { machineService } from '@services/api/machineService';
import { QUERY_KEYS } from '@constants';
import { useAuthStore } from '@store/slices/authSlice';
import type { 
  CreateMachineResponse as Machine, 
  CreateMachineRequest as MachineFormData,
  UpdateMachineRequest,
} from '@contracts';
import type { CreateMachineEventRequest as EventFormData } from '@contracts';

// Local filter type used by the hooks (frontend-specific)
interface MachineFilters {
  status?: string[];
  brand?: string[];
  location?: string[];
  ownerId?: string;
  managedById?: string;
  searchTerm?: string;
}

// Get machines with filters
export const useMachines = (
  filters?: MachineFilters,
  options?: { enabled?: boolean; staleTime?: number }
) => {
  const currentUser = useAuthStore((state) => state.user);
  const ownerId = currentUser?.id;
  // Always merge ownerId from auth store — single source of truth
  const mergedFilters = { ownerId, ...filters };
  return useQuery({
    queryKey: [...QUERY_KEYS.MACHINES, mergedFilters],
    queryFn: () => machineService.getMachines(mergedFilters),
    staleTime: options?.staleTime ?? 2 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
};

// Get single machine
export const useMachine = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.MACHINE(id),
    queryFn: () => machineService.getMachine(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create machine mutation
export const useCreateMachine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (machineData: MachineFormData) => machineService.createMachine(machineData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MACHINES });
    },
  });
};

// Update machine mutation
export const useUpdateMachine = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (machineData: UpdateMachineRequest) => 
      machineService.updateMachine(id, machineData),
    onSuccess: (updatedMachine) => {
      queryClient.setQueryData(QUERY_KEYS.MACHINE(id), updatedMachine);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MACHINES });
    },
  });
};

// Delete machine mutation
export const useDeleteMachine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => machineService.deleteMachine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MACHINES });
    },
  });
};

// Get machine events
export const useMachineEvents = (machineId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_EVENTS(machineId),
    queryFn: () => machineService.getMachineEvents(machineId),
    enabled: !!machineId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Create machine event mutation
export const useCreateMachineEvent = (machineId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventData: EventFormData) => 
      machineService.createMachineEvent(machineId, eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.MACHINE_EVENTS(machineId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.MACHINE(machineId) 
      });
    },
  });
};

// Get machine reminders
export const useMachineReminders = (machineId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.MACHINE_REMINDERS(machineId),
    queryFn: () => machineService.getMachineReminders(machineId),
    enabled: !!machineId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create machine reminder mutation
export const useCreateMachineReminder = (machineId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    // MaintenanceReminderFormData is currently not in contracts; accept `any` until contract exists
    mutationFn: (reminderData: any) => 
      machineService.createMachineReminder(machineId, reminderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.MACHINE_REMINDERS(machineId) 
      });
    },
  });
};

// Update machine hours mutation
export const useUpdateMachineHours = (machineId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (hours: number) => machineService.updateMachineHours(machineId, hours),
    onSuccess: (updatedMachine) => {
      queryClient.setQueryData(QUERY_KEYS.MACHINE(machineId), updatedMachine);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MACHINES });
    },
  });
};

// Get machine statistics
export const useMachineStats = () => {
  return useQuery({
    queryKey: ['machines', 'stats'],
    queryFn: () => machineService.getMachineStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};