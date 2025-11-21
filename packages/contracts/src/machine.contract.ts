import { z } from 'zod';
import { SortOrderSchema, PaginationSchema, BasePaginatedResponseSchema, SearchSchema } from './common.types';

// =============================================================================
// REAL DRY APPROACH: Re-export de types del dominio
// =============================================================================

// Re-exportamos los types exactos del dominio para reutilización
export { 
  MachineSpecs, 
  MachineLocation, 
  CreateMachineProps,
  FuelType
} from '@packages/domain';
export type { MachineStatusCode } from '@packages/domain';

// Import local para uso en schemas
import type { 
  MachineSpecs, 
  MachineLocation, 
  CreateMachineProps,
  FuelType,
  MachineStatusCode
} from '@packages/domain';

// =============================================================================
// Schemas Zod basados en types IMPORTADOS del dominio (DRY REAL)
// =============================================================================

/**
 * Schema derivado de MachineStatusCode del dominio (NO DUPLICADO)
 */
export const MachineStatusCodeSchema = z.union([
  z.literal('ACTIVE'),
  z.literal('MAINTENANCE'), 
  z.literal('OUT_OF_SERVICE'),
  z.literal('RETIRED')
]) satisfies z.ZodType<MachineStatusCode>;

/**
 * Schema derivado de FuelType del dominio (NO DUPLICADO)
 */
export const FuelTypeSchema = z.union([
  z.literal('DIESEL'),
  z.literal('GASOLINE'),
  z.literal('ELECTRIC'),
  z.literal('HYBRID')
]) satisfies z.ZodType<FuelType>;

/**
 * Schema basado en MachineSpecs del dominio
 */
export const MachineSpecsSchema = z.object({
  enginePower: z.number().positive().optional(),
  maxCapacity: z.number().positive().optional(),
  fuelType: FuelTypeSchema.optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  weight: z.number().positive().optional(),
  operatingHours: z.number().min(0).optional()
}) satisfies z.ZodType<MachineSpecs>;

/**
 * Schema para coordenadas geográficas
 */
export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

/**
 * Schema basado en MachineLocation del dominio
 */
export const MachineLocationSchema = z.object({
  siteName: z.string().optional(),
  address: z.string().optional(),
  coordinates: CoordinatesSchema.optional(),
  lastUpdated: z.string().datetime()
}) satisfies z.ZodType<Omit<MachineLocation, 'lastUpdated'> & { lastUpdated: string }>;

/**
 * Schema para crear máquina basado en CreateMachineProps del dominio
 */
export const CreateMachineRequestSchema = z.object({
  serialNumber: z.string()
    .min(1, 'Serial number is required')
    .max(100, 'Serial number cannot exceed 100 characters'),
  brand: z.string()
    .min(1, 'Brand is required')
    .max(100, 'Brand cannot exceed 100 characters'),
  modelName: z.string()
    .min(1, 'Model name is required')
    .max(100, 'Model name cannot exceed 100 characters'),
  machineTypeId: z.string().min(1, 'Machine type ID is required'),
  ownerId: z.string().min(1, 'Owner ID is required'),
  createdById: z.string().min(1, 'Creator ID is required'),
  specs: MachineSpecsSchema.optional(),
  location: MachineLocationSchema.optional(),
  nickname: z.string().max(100).optional(),
  initialStatus: MachineStatusCodeSchema.default('ACTIVE')
}) satisfies z.ZodType<Omit<CreateMachineProps, 'location'> & { 
  location?: Omit<MachineLocation, 'lastUpdated'> & { lastUpdated: string } 
}>;

/**
 * Schema de respuesta con información completa de la máquina
 */
export const CreateMachineResponseSchema = z.object({
  id: z.string(),
  serialNumber: z.string(),
  brand: z.string(),
  modelName: z.string(),
  machineTypeId: z.string(),
  ownerId: z.string(),
  createdById: z.string(),
  specs: MachineSpecsSchema.nullable(),
  location: MachineLocationSchema.nullable(),
  nickname: z.string().nullable(),
  status: MachineStatusCodeSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

/**
 * Schema para obtener máquina
 */
export const GetMachineRequestSchema = z.object({
  id: z.string()
});

export const GetMachineResponseSchema = CreateMachineResponseSchema;

/**
 * Schema para actualizar máquina
 */
export const UpdateMachineRequestSchema = z.object({
  id: z.string(),
  specs: MachineSpecsSchema.optional(),
  location: MachineLocationSchema.optional(),
  nickname: z.string().max(100).optional(),
  status: MachineStatusCodeSchema.optional()
});

export const UpdateMachineResponseSchema = CreateMachineResponseSchema;

/**
 * Schema para listar máquinas (usando types comunes)
 */
export const ListMachinesRequestSchema = PaginationSchema.extend({
  ownerId: z.string().optional(),
  machineTypeId: z.string().optional(),
  status: MachineStatusCodeSchema.optional(),
  brand: z.string().optional(),
  search: z.string().optional(), // Buscar por serialNumber, brand, modelName, nickname
  sortBy: z.enum(['serialNumber', 'brand', 'modelName', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: SortOrderSchema.default('desc')
});

export const ListMachinesResponseSchema = BasePaginatedResponseSchema.extend({
  machines: z.array(CreateMachineResponseSchema)
});

/**
 * Schema para transferir propiedad de máquina
 */
export const TransferMachineOwnershipRequestSchema = z.object({
  machineId: z.string(),
  newOwnerId: z.string(),
  transferredById: z.string(),
  notes: z.string().optional()
});

export const TransferMachineOwnershipResponseSchema = z.object({
  success: z.boolean(),
  machine: CreateMachineResponseSchema
});

// =============================================================================
// Type Inference (derivados automáticamente del dominio)
// =============================================================================

export type CreateMachineRequest = z.infer<typeof CreateMachineRequestSchema>;
export type CreateMachineResponse = z.infer<typeof CreateMachineResponseSchema>;

export type GetMachineRequest = z.infer<typeof GetMachineRequestSchema>;
export type GetMachineResponse = z.infer<typeof GetMachineResponseSchema>;

export type UpdateMachineRequest = z.infer<typeof UpdateMachineRequestSchema>;
export type UpdateMachineResponse = z.infer<typeof UpdateMachineResponseSchema>;

export type ListMachinesRequest = z.infer<typeof ListMachinesRequestSchema>;
export type ListMachinesResponse = z.infer<typeof ListMachinesResponseSchema>;

export type TransferMachineOwnershipRequest = z.infer<typeof TransferMachineOwnershipRequestSchema>;
export type TransferMachineOwnershipResponse = z.infer<typeof TransferMachineOwnershipResponseSchema>;