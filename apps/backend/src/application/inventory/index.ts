// /apps/backend/src/application/inventory/index.ts
// Casos de uso para gestión de inventario y tipos de máquina

// Machine Types
export * from './list-machine-types.use-case';
export * from './create-machine-type.use-case';
export * from './update-machine-type.use-case';
export * from './delete-machine-type.use-case';

// TODO: Implementar casos de uso de repuestos:
// - ManageSpareParts
// - TrackInventory