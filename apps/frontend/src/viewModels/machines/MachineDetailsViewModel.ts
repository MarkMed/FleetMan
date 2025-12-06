import { useQuery } from '@tanstack/react-query';
import { machineService } from '../../services/api/machineService';
import { QUERY_KEYS } from '../../constants';
import type { CreateMachineResponse } from '@contracts';

export interface MachineDetailsViewModel {
  machine?: CreateMachineResponse;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<unknown>;
}

/**
 * ViewModel para la pantalla de detalles de máquinas.
 * Encapsula la lógica de data fetching y entrega datos listos para la vista.
 */
export function useMachineDetailsViewModel(id?: string): MachineDetailsViewModel {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.MACHINE(id ?? 'unknown'),
    queryFn: () => {
      if (!id) {
        return Promise.reject(new Error('Machine ID is required'));
      }
      return machineService.getMachine(id);
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });

  return {
    machine: data,
    isLoading,
    isError,
    errorMessage: error instanceof Error ? error.message : null,
    refetch,
  };
}
