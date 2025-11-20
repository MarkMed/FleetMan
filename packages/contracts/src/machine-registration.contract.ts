import { z } from 'zod';
import { 
  CreateMachineRequestSchema as BaseCreateMachineRequestSchema, 
  MachineSpecsSchema,
  MachineLocationSchema 
} from './machine.contract';

// ============================
// Machine Registration - Frontend Specific Wizard Schemas
// ============================
// STRATEGY: Adaptar los schemas existentes para el flujo de wizard multi-step
// TODO: Evaluar si estos schemas específicos del frontend deberían ir en @models

/**
 * Schema para Step 1: Información básica (basado en CreateMachineRequestSchema)
 * Incluye solo los campos necesarios para el primer paso del wizard
 */
export const MachineBasicInfoSchema = z.object({
  // Campos requeridos del dominio
  serialNumber: BaseCreateMachineRequestSchema.shape.serialNumber,
  brand: BaseCreateMachineRequestSchema.shape.brand,
  model: BaseCreateMachineRequestSchema.shape.model,
  machineTypeId: BaseCreateMachineRequestSchema.shape.machineTypeId,
  
  // Campos adicionales para el wizard UI
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  nickname: BaseCreateMachineRequestSchema.shape.nickname.optional(),
  
  // TODO: ownerId y createdById deberían venir del contexto de usuario autenticado
  // Por ahora los incluimos como opcionales para el wizard
  ownerId: z.string().optional(),
  createdById: z.string().optional(),
});

/**
 * Schema para Step 2: Especificaciones técnicas - SIMPLIFICADO
 * Incluye solo los campos especificados + ubicación básica
 */
export const MachineTechnicalSpecsSchema = z.object({
  // Campos requeridos
  year: z.number().min(1990).max(2030),
  
  // Campos opcionales técnicos
  operatingHours: z.number().min(0).optional(),
  fuelType: z.enum([
    'ELECTRIC_LITHIUM',
    'ELECTRIC_LEAD_ACID',
    'DIESEL',
    'LPG',
    'GASOLINE',
    'BIFUEL',
    'HYBRID'
  ]).optional(),
  attachments: z.array(z.string()).optional(),
  specialFeatures: z.array(z.string()).optional(),
  
  // Ubicación básica (movido desde LocationInfo)
  currentLocation: z.string().max(100).optional(),
  isActive: z.boolean().default(true),
});

// ❌ MachineLocationInfoSchema OBLITERATED - moved to TechnicalSpecs

/**
 * Schema completo para el wizard de registro de máquina - SIMPLIFICADO
 * Solo 2 steps: BasicInfo + TechnicalSpecs (con ubicación incluida)
 */
export const MachineRegistrationSchema = z.object({
  basicInfo: MachineBasicInfoSchema,
  technicalSpecs: MachineTechnicalSpecsSchema,
});

// ============================
// Mapping hacia CreateMachineRequestSchema
// ============================
// TODO: Crear mapper function que convierta MachineRegistrationData a CreateMachineRequest
// Esto permite mantener separados los concerns del UI vs API

/**
 * Request final para crear máquina (reusa el schema base del dominio)
 */
export const CreateMachineFromWizardRequestSchema = BaseCreateMachineRequestSchema;

/**
 * Response de máquina creada (reusa el schema base)
 */
export const CreateMachineFromWizardResponseSchema = z.object({
  id: z.string().uuid(),
  serialNumber: z.string(),
  brand: z.string(),
  model: z.string(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'RETIRED']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================
// Types
// ============================

export type MachineBasicInfo = z.infer<typeof MachineBasicInfoSchema>;
export type MachineTechnicalSpecs = z.infer<typeof MachineTechnicalSpecsSchema>;
export type MachineRegistrationData = z.infer<typeof MachineRegistrationSchema>;

export type CreateMachineFromWizardRequest = z.infer<typeof CreateMachineFromWizardRequestSchema>;
export type CreateMachineFromWizardResponse = z.infer<typeof CreateMachineFromWizardResponseSchema>;

// ============================
// Validation Helpers
// ============================

/**
 * Helper para validar cada step individualmente
 * TODO: Considerar usar un ValidationService en lugar de funciones estáticas
 */
export const validateMachineStep = {
  basicInfo: (data: Partial<MachineBasicInfo>) => {
    return MachineBasicInfoSchema.safeParse(data);
  },
  technicalSpecs: (data: Partial<MachineTechnicalSpecs>) => {
    return MachineTechnicalSpecsSchema.safeParse(data);
  },
  complete: (data: Partial<MachineRegistrationData>) => {
    return MachineRegistrationSchema.safeParse(data);
  },
};

// ============================
// Default Values
// ============================
// TODO: Considerar mover defaults a un DefaultsService o similar

export const defaultMachineRegistrationData: Partial<MachineRegistrationData> = {
  basicInfo: {
    serialNumber: '',
    brand: '',
    model: '',
    machineTypeId: '',
    name: '',
    description: '',
    nickname: '',
    ownerId: undefined,
    createdById: undefined,
  },
  technicalSpecs: {
    year: new Date().getFullYear(),
    operatingHours: 0,
    fuelType: undefined,
    attachments: [],
    specialFeatures: [],
    currentLocation: '',
    isActive: true,
  },
};