import React from 'react';
import { MachineRegistrationScreen } from './machine-registration/MachineRegistrationScreen';

/**
 * NewMachineScreen - Pantalla de registro de máquinas
 * 
 * REFACTORED Sprint 5:
 * ✅ Ahora usa MachineRegistrationScreen con React Hook Form + Wizard
 * ✅ Implementación completa de RHF + Controller pattern
 * ✅ Validaciones con Zod schemas
 * ✅ Multi-step wizard con navegación fluida
 * ✅ Formulario tipado y validado
 * 
 * Este wrapper permite mantener la ruta /machines/new mientras 
 * reutilizamos la implementación completa del wizard
 */
export const NewMachineScreen: React.FC = () => {
  return <MachineRegistrationScreen />;
};