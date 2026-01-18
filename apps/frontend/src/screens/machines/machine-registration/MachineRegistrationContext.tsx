import React, { createContext, useContext } from 'react';
import { MachineRegistrationViewModel } from '../../../viewModels/machines/MachineRegistrationViewModel';

/**
 * Context for sharing MachineRegistrationViewModel state with wizard steps
 * 
 * This allows deep components (like PhotoStep) to access ViewModel state
 * without prop drilling through the Wizard component.
 */
const MachineRegistrationContext = createContext<MachineRegistrationViewModel | null>(null);

export interface MachineRegistrationProviderProps {
  viewModel: MachineRegistrationViewModel;
  children: React.ReactNode;
}

export function MachineRegistrationProvider({ viewModel, children }: MachineRegistrationProviderProps) {
  return (
    <MachineRegistrationContext.Provider value={viewModel}>
      {children}
    </MachineRegistrationContext.Provider>
  );
}

/**
 * Hook to access MachineRegistrationViewModel from wizard steps
 * 
 * @throws Error if used outside MachineRegistrationProvider
 */
export function useMachineRegistrationContext(): MachineRegistrationViewModel {
  const context = useContext(MachineRegistrationContext);
  
  if (!context) {
    throw new Error(
      'useMachineRegistrationContext must be used within MachineRegistrationProvider'
    );
  }
  
  return context;
}
