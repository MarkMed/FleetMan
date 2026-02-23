import { useQuery } from '@tanstack/react-query';
import { machineService } from '../services/api/machineService';
import { QUERY_KEYS, STORAGE_KEYS } from '../constants';
import type { MachineTypeResponse } from '@contracts';

/**
 * LEGACY: Hook to fetch machine types for selects and dropdowns.
 * 
 * STATUS: Deprecated - Machine types are now free-text strings (machineTypeName).
 * 
 * KEPT FOR:
 * - Backward compatibility with existing machines (objectId references in DB)
 * - Future type suggestions/autocomplete from historical data
 * - Admin panel for managing legacy type catalog
 * 
 * NEW APPROACH:
 * - Machines use free-text machineTypeName field
 * - UI uses MACHINE_TYPE_SUGGESTIONS constant (apps/frontend/src/constants/machineTypeSuggestions.ts)
 * - No API call needed for registration/edit forms
 * 
 * MIGRATION PATH:
 * - Existing machines continue to have machineTypeId references
 * - Backend /machines endpoints accept LEGACY header for ObjectId lookups
 * - Future: Archive this hook once all clients updated
 * 
 * Reads optional language from localStorage (STORAGE_KEYS.LANGUAGE).
 */
export function useMachineTypes() {
  const language = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.LANGUAGE) || undefined : undefined;
  return useQuery<MachineTypeResponse[], Error>({
    queryKey: QUERY_KEYS.MACHINE_TYPES,
    queryFn: () => machineService.getMachineTypes(language ?? undefined),
    staleTime: 1000 * 60 * 60, // 60 minutes - reference data changes rarely
    retry: 1,
  });
}

export default useMachineTypes;
