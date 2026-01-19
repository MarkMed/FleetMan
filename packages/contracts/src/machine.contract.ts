import { z } from 'zod';
import { SortOrderSchema, PaginationSchema, BasePaginatedResponseSchema, SearchSchema } from './common.types';
import { DayOfWeek } from '@packages/domain';
import { MachineEventSchema } from './machine-event.contract';
import { MaintenanceAlarmSchema } from './maintenance-alarm.contract';

// =============================================================================
// REAL DRY APPROACH: Re-export de types del dominio
// =============================================================================

// Import local para uso en schemas
import type { 
  MachineSpecs, 
  MachineLocation, 
  CreateMachineProps,
  FuelType,
  MachineStatusCode,
  IUsageSchedule
} from '@packages/domain';

// Re-exportamos los types exactos del dominio para reutilización
export type { 
  MachineSpecs, 
  MachineLocation, 
  CreateMachineProps,
  FuelType,
  MachineStatusCode,
  IUsageSchedule
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
 * Expandido Task 7: tipos específicos de baterías eléctricas
 */
export const FuelTypeSchema = z.union([
  z.literal('ELECTRIC_LITHIUM'),
  z.literal('ELECTRIC_LEAD_ACID'),
  z.literal('DIESEL'),
  z.literal('LPG'),
  z.literal('GASOLINE'),
  z.literal('BIFUEL'),
  z.literal('HYBRID')
]) satisfies z.ZodType<FuelType>;

/**
 * Schema basado en MachineSpecs del dominio
 */
export const MachineSpecsSchema = z.object({
  enginePower: z.number().positive().optional(),
  maxCapacity: z.number().positive().optional(),
  fuelType: FuelTypeSchema.optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(), // +1 año: permite pre-órdenes pero evita errores
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
 * Schema para UsageSchedule - Programación de uso de máquina
 * Valida dailyHours (1-24) y operatingDays (al menos 1 día, sin duplicados)
 * 
 * NOTA: weeklyHours es un campo CALCULADO (dailyHours × días operativos)
 * y NO debe enviarse en requests. Se calcula automáticamente server-side.
 */
export const UsageScheduleSchema = z.object({
  dailyHours: z.number()
    .int('Daily hours must be an integer')
    .min(1, 'Daily hours must be at least 1')
    .max(24, 'Daily hours cannot exceed 24'),
  operatingDays: z.array(z.nativeEnum(DayOfWeek))
    .min(1, 'Must have at least one operating day')
    .max(7, 'Cannot have more than 7 operating days')
    .readonly() // Immutability: alineado con domain readonly string[]
    .refine(
      (days) => new Set(days).size === days.length,
      { message: 'Operating days must be unique (no duplicates)' }
    )
}) satisfies z.ZodType<Omit<IUsageSchedule, 'weeklyHours'>>;

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
  initialStatus: MachineStatusCodeSchema.default('ACTIVE'),
  assignedTo: z.string()
    .max(100, 'Assigned to name cannot exceed 100 characters')
    .trim()
    .optional(),
  usageSchedule: UsageScheduleSchema.optional(),
  // Photo URL - permite string vacío O URL válida
  machinePhotoUrl: z.string()
    .trim()
    .max(500, 'Photo URL cannot exceed 500 characters')
    .refine(
      (val) => val === '' || z.string().url().safeParse(val).success,
      { message: 'Invalid photo URL format' }
    )
    .optional()
    .or(z.literal(''))
}) satisfies z.ZodType<Omit<CreateMachineProps, 'location' | 'usageSchedule'> & { 
  location?: Omit<MachineLocation, 'lastUpdated'> & { lastUpdated: string } 
}>;

/**
 * Schema de respuesta con información completa de la máquina
 * SSOT: Define el contrato exacto de todas las respuestas HTTP de máquinas
 */
export const CreateMachineResponseSchema = z.object({
  id: z.string(),
  serialNumber: z.string(),
  brand: z.string(),
  modelName: z.string(),
  nickname: z.string().nullable(),
  machineTypeId: z.string(),
  ownerId: z.string(),
  createdById: z.string(),
  assignedProviderId: z.string().nullish(), // Provider assigned to machine (puede ser undefined)
  providerAssignedAt: z.string().datetime().nullish(), // Date provider was assigned (puede ser undefined)
  assignedTo: z.string().nullish(), // Person responsible for machine (puede ser undefined)
  usageSchedule: UsageScheduleSchema.extend({
    weeklyHours: z.number() // Calculated field by VO
  }).nullish(), // Operating schedule for maintenance alerts (puede ser undefined)
  machinePhotoUrl: z.string().nullish(), // Photo URL - Cloudinary (puede ser undefined)
  status: MachineStatusCodeSchema,
  specs: MachineSpecsSchema.nullable(),
  location: MachineLocationSchema.nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Sprint #10 & #11: Subdocument arrays (optional - only included when queried)
  eventsHistory: z.array(MachineEventSchema).optional(),
  maintenanceAlarms: z.array(MaintenanceAlarmSchema).optional()
});

/**
 * Schema para obtener máquina
 */
export const GetMachineRequestSchema = z.object({
  id: z.string()
});

export const GetMachineResponseSchema = CreateMachineResponseSchema;

/**
 * Schema para actualizar máquina (PATCH)
 * Todos los campos son opcionales - solo actualiza lo que viene
 * El `id` NO está aquí - viene como parámetro de ruta (URL param)
 */
export const UpdateMachineRequestSchema = z.object({
  // Basic info
  brand: z.string().min(1).max(100).trim().optional(),
  modelName: z.string().min(1).max(100).trim().optional(),
  nickname: z.string().max(100).trim().optional(),
  machineTypeId: z.string().min(1, 'Machine type ID is required').optional(),
  
  // Assignment
  assignedTo: z.string()
    .max(100, 'Assigned to name cannot exceed 100 characters')
    .trim()
    .optional(),
  assignedProviderId: z.string().optional().nullable(),
  
  // Photo URL - permite null, string vacío O URL válida
  machinePhotoUrl: z.string()
    .trim()
    .max(500, 'Photo URL cannot exceed 500 characters')
    .refine(
      (val) => val === null || val === '' || z.string().url().safeParse(val).success,
      { message: 'Invalid photo URL format' }
    )
    .optional()
    .nullable(),
  
  // Specs (nested partial - usar dot notation para evitar reemplazar todo el objeto)
  specs: z.object({
    enginePower: z.number().positive().optional(),
    maxCapacity: z.number().positive().optional(),
    fuelType: FuelTypeSchema.optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(), // +1 año: consistente con CreateMachineRequestSchema
    weight: z.number().positive().optional(),
    operatingHours: z.number().min(0).optional() // Para cronjob (no desde frontend típicamente)
  }).partial().strict().optional(),
  
  // Location (nested partial)
  location: z.object({
    siteName: z.string().optional(),
    address: z.string().optional(),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180)
    }).optional()
  }).partial().strict().optional(),
  
  // Usage schedule
  usageSchedule: UsageScheduleSchema.optional(),
  
  // Status - Comentado porque cambios de estado deberían tener endpoint específico
  // Con validaciones FSM (finite state machine) en Use Case dedicado
  // status: MachineStatusCodeSchema.optional()
  
}).strict(); // Previene campos no definidos

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