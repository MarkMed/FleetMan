import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { machineService } from "../../services/api/machineService";
import { QUERY_KEYS } from "../../constants";
import type { CreateMachineResponse } from "@packages/contracts";
import type { MachinesListResult } from "../../services/api/machineService";
import { useAuthStore } from "../../store/slices/authSlice";

export interface MachinesViewModel {
  machines: CreateMachineResponse[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<unknown>;
  pagination?: MachinesListResult["pagination"];
}

/**
 * ViewModel para la pantalla de Machines siguiendo MVVM.
 * Encapsula la carga de datos, filtrado inicial y mapea la respuesta para la Vista.
 */
export function useMachinesViewModel(): MachinesViewModel {
  const currentUser = useAuthStore((state) => state.user);
  const ownerId = currentUser?.id;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MachinesListResult>({
    queryKey: QUERY_KEYS.MACHINES,
    queryFn: () => machineService.getMachines(ownerId ? { ownerId } : undefined),
    staleTime: 5 * 60 * 1000,
  });

  const machines = useMemo(() => data?.machines ?? [], [data]);

  return {
    machines,
    isLoading,
    isError,
    errorMessage: error instanceof Error ? error.message : null,
    refetch,
    pagination: data?.pagination,
  };
}
