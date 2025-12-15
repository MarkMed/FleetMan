import { useMemo } from 'react';
import { useMachineTypes } from './useMachineTypes';

/**
 * Hook to resolve a machine type ID to its display name.
 * 
 * Leverages TanStack Query cache from useMachineTypes (60min staleTime).
 * Returns name or undefined if not found/loading.
 * 
 * @param machineTypeId - Machine type ObjectId to resolve
 * @returns Machine type name or undefined
 * 
 * @example
 * const typeName = useMachineTypeName(machine.machineTypeId);
 * <span>{typeName ?? 'Tipo desconocido'}</span>
 */
export function useMachineTypeName(machineTypeId: string | undefined): string | undefined {
  const { data: machineTypes, isLoading } = useMachineTypes();
  
  return useMemo(() => {
    if (!machineTypeId || isLoading || !machineTypes) {
      return undefined;
    }
    
    return machineTypes.find(type => type.id === machineTypeId)?.name;
  }, [machineTypeId, machineTypes, isLoading]);
}

/**
 * Hook to resolve multiple machine type IDs to a Map<id, name>.
 * 
 * Useful for batch lookups (e.g., in lists with many machines).
 * Returns Map with resolved names, empty for loading/not-found.
 * 
 * @param machineTypeIds - Array of machine type IDs to resolve
 * @returns Map of ID -> name
 * 
 * @example
 * const typeNames = useMachineTypeResolver(machines.map(m => m.machineTypeId));
 * machines.map(m => typeNames.get(m.machineTypeId) ?? 'Unknown')
 */
export function useMachineTypeResolver(machineTypeIds: string[]): Map<string, string> {
  const { data: machineTypes, isLoading } = useMachineTypes();
  
  return useMemo(() => {
    const result = new Map<string, string>();
    
    if (isLoading || !machineTypes) {
      return result;
    }
    
    machineTypeIds.forEach(id => {
      const type = machineTypes.find(t => t.id === id);
      if (type) {
        result.set(id, type.name);
      }
    });
    
    return result;
  }, [machineTypeIds, machineTypes, isLoading]);
}
