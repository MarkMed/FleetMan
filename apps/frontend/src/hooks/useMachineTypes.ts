import { useQuery } from '@tanstack/react-query';
import { machineService } from '../services/api/machineService';
import { QUERY_KEYS, STORAGE_KEYS } from '../constants';
import type { MachineTypeResponse } from '@packages/contracts';

/**
 * Hook to fetch machine types for selects and dropdowns.
 * Reads optional language from localStorage (STORAGE_KEYS.LANGUAGE).
 */
export function useMachineTypes() {
  const language = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.LANGUAGE) || undefined : undefined;
	console.log('🌐 useMachineTypes: using language:', language);
  return useQuery<MachineTypeResponse[], Error>({
    queryKey: QUERY_KEYS.MACHINE_TYPES,
    queryFn: () => machineService.getMachineTypes(language ?? undefined),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

export default useMachineTypes;
