import { createContext, useContext, useRef, useEffect } from 'react';
import type { MachineEditViewModel } from '../../../viewModels/machines/MachineEditViewModel';

/**
 * Context para compartir MachineEditViewModel con todos los steps
 * Evita prop drilling y simplifica acceso a photoFile, setPhotoFile, etc.
 */
const MachineEditContext = createContext<MachineEditViewModel | null>(null);

// Wrapper que detecta cambios en el value
export function MachineEditProvider({ value, children }: { value: MachineEditViewModel, children: React.ReactNode }) {
  const prevRef = useRef(value);
  const renderCount = useRef(0);
  
  renderCount.current++;
  console.log('🟠 [MachineEditProvider] Render #', renderCount.current);
  
  useEffect(() => {
	console.log('🟠 [MachineEditProvider] Checking for value changes...');
    if (prevRef.current !== value) {
      console.log('🔴 [MachineEditProvider] ¡VALUE CAMBIÓ! Esto causa re-render de todos los consumidores');
      console.log('🔴 [MachineEditProvider] Prev:', prevRef.current);
      console.log('🔴 [MachineEditProvider] New:', value);
      prevRef.current = value;
    }
  }, [value]);
  
  return (
    <MachineEditContext.Provider value={value}>
      {children}
    </MachineEditContext.Provider>
  );
}

/**
 * Hook para acceder al MachineEditViewModel desde cualquier step
 * Lanza error si se usa fuera del provider
 */
export function useMachineEditContext(): MachineEditViewModel {
  const context = useContext(MachineEditContext);
  
  if (!context) {
    throw new Error(
      'useMachineEditContext must be used within MachineEditProvider'
    );
  }
  
  return context;
}
