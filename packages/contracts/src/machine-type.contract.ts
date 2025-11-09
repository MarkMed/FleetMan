import { z } from 'zod';
import { SortOrderSchema, PaginationSchema, BasePaginatedResponseSchema } from './common.types';

// =============================================================================
// REAL DRY APPROACH: Re-export de types del dominio
// =============================================================================

// Re-exportamos los types exactos del dominio para reutilización
export { 
  MachineTypeMetadata, 
  CreateMachineTypeProps 
} from '../../domain/src/entities/machine-type/machine-type.entity';
export { FuelType } from '../../domain/src/entities/machine/machine.entity';

// Import local para uso en schemas
import { 
  MachineTypeMetadata, 
  CreateMachineTypeProps 
} from '../../domain/src/entities/machine-type/machine-type.entity';
import { FuelType } from '../../domain/src/entities/machine/machine.entity';

// =============================================================================
// Schemas Zod basados en types IMPORTADOS del dominio (DRY REAL)
// =============================================================================

/**
 * Schema para rangos de especificaciones
 */
export const SpecRangeSchema = z.object({
  min: z.number().positive(),
  max: z.number().positive()
}).refine(data => data.max > data.min, {
  message: "Max value must be greater than min value"
});

/**
 * Schema para especificaciones por defecto sugeridas
 */
export const DefaultSpecsSchema = z.object({
  enginePowerRange: SpecRangeSchema.optional(),
  capacityRange: SpecRangeSchema.optional(),
  recommendedFuelType: z.union([
    z.literal('DIESEL'),
    z.literal('GASOLINE'),
    z.literal('ELECTRIC'),
    z.literal('HYBRID')
  ]).optional()
}) satisfies z.ZodType<{ 
  enginePowerRange?: { min: number; max: number };
  capacityRange?: { min: number; max: number };
  recommendedFuelType?: FuelType;
}>;

/**
 * Schema basado en MachineTypeMetadata del dominio
 */
export const MachineTypeMetadataSchema = z.object({
  // UI/Visual
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color format').optional(),
  icon: z.string().optional(),
  imageUrl: z.string().url().optional(),
  
  // Organización
  tags: z.array(z.string()).optional(),
  sortOrder: z.number().int().min(0).optional(),
  
  // Configuración de negocio
  requiresLicense: z.boolean().optional(),
  minimumOperatorLevel: z.string().optional(),
  defaultMaintenanceInterval: z.number().int().positive().optional(),
  
  // Specs por defecto sugeridas
  defaultSpecs: DefaultSpecsSchema.optional()
}) satisfies z.ZodType<MachineTypeMetadata>;

/**
 * Schema para crear tipo de máquina basado en CreateMachineTypeProps del dominio
 */
export const CreateMachineTypeRequestSchema = z.object({
  code: z.string()
    .min(2, 'Code must be at least 2 characters')
    .max(50, 'Code cannot exceed 50 characters')
    .regex(/^[A-Z0-9_]+$/, 'Code must contain only uppercase letters, numbers and underscores'),
  displayName: z.string()
    .min(1, 'Display name is required')
    .max(100, 'Display name cannot exceed 100 characters'),
  description: z.string().max(500).optional(),
  category: z.string()
    .min(1, 'Category is required')
    .max(100, 'Category cannot exceed 100 characters'),
  isActive: z.boolean().default(true),
  metadata: MachineTypeMetadataSchema.optional()
}) satisfies z.ZodType<CreateMachineTypeProps>;

/**
 * Schema de respuesta con información completa del tipo de máquina
 */
export const CreateMachineTypeResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  displayName: z.string(),
  description: z.string(),
  category: z.string(),
  isActive: z.boolean(),
  metadata: MachineTypeMetadataSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().optional(),
  lastModifiedBy: z.string().optional()
});

/**
 * Schema para obtener tipo de máquina
 */
export const GetMachineTypeRequestSchema = z.object({
  id: z.string()
});

export const GetMachineTypeResponseSchema = CreateMachineTypeResponseSchema;

/**
 * Schema para actualizar tipo de máquina
 */
export const UpdateMachineTypeRequestSchema = z.object({
  id: z.string(),
  displayName: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  category: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
  metadata: MachineTypeMetadataSchema.optional()
});

export const UpdateMachineTypeResponseSchema = CreateMachineTypeResponseSchema;

/**
 * Schema para listar tipos de máquina (usando types comunes)
 */
export const ListMachineTypesRequestSchema = PaginationSchema.extend({
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(), // Buscar por code, displayName o category
  sortBy: z.enum(['code', 'displayName', 'category', 'createdAt', 'updatedAt']).default('displayName'),
  sortOrder: SortOrderSchema.default('asc')
});

export const ListMachineTypesResponseSchema = BasePaginatedResponseSchema.extend({
  machineTypes: z.array(CreateMachineTypeResponseSchema)
});

/**
 * Schema para obtener categorías únicas
 */
export const GetMachineTypeCategoriesRequestSchema = z.object({
  includeInactive: z.boolean().default(false)
});

export const GetMachineTypeCategoriesResponseSchema = z.object({
  categories: z.array(z.string())
});

/**
 * Schema para activar/desactivar tipo de máquina
 */
export const ToggleMachineTypeStatusRequestSchema = z.object({
  id: z.string(),
  isActive: z.boolean()
});

export const ToggleMachineTypeStatusResponseSchema = CreateMachineTypeResponseSchema;

// =============================================================================
// Type Inference (derivados automáticamente del dominio)
// =============================================================================

export type CreateMachineTypeRequest = z.infer<typeof CreateMachineTypeRequestSchema>;
export type CreateMachineTypeResponse = z.infer<typeof CreateMachineTypeResponseSchema>;

export type GetMachineTypeRequest = z.infer<typeof GetMachineTypeRequestSchema>;
export type GetMachineTypeResponse = z.infer<typeof GetMachineTypeResponseSchema>;

export type UpdateMachineTypeRequest = z.infer<typeof UpdateMachineTypeRequestSchema>;
export type UpdateMachineTypeResponse = z.infer<typeof UpdateMachineTypeResponseSchema>;

export type ListMachineTypesRequest = z.infer<typeof ListMachineTypesRequestSchema>;
export type ListMachineTypesResponse = z.infer<typeof ListMachineTypesResponseSchema>;

export type GetMachineTypeCategoriesRequest = z.infer<typeof GetMachineTypeCategoriesRequestSchema>;
export type GetMachineTypeCategoriesResponse = z.infer<typeof GetMachineTypeCategoriesResponseSchema>;

export type ToggleMachineTypeStatusRequest = z.infer<typeof ToggleMachineTypeStatusRequestSchema>;
export type ToggleMachineTypeStatusResponse = z.infer<typeof ToggleMachineTypeStatusResponseSchema>;