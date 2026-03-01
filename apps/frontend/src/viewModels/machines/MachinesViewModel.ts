import { useMemo } from "react";
import { useMachines } from "../../hooks/useMachines";
import type { CreateMachineResponse } from "@contracts";
import type { MachinesListResult } from "../../services/api/machineService";

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
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useMachines();

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
