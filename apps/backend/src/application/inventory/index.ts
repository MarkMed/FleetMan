// /apps/backend/src/application/inventory/index.ts
// Casos de uso para gestión de inventario y tipos de máquina

// Machine Types
export * from './list-machine-types.use-case';
export * from './create-machine-type.use-case';
export * from './update-machine-type.use-case';
export * from './delete-machine-type.use-case';

// Machines
export * from './list-machines.use-case';
export * from './create-machine.use-case';
export * from './get-machine.use-case';
export * from './update-machine.use-case';
export * from './update-operating-hours.use-case'; // 🆕 Sprint #11 - Cronjob
export * from './delete-machine.use-case';

// TODO: Implementar casos de uso de repuestos:
// - ManageSpareParts
// - TrackInventory