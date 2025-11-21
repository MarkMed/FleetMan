import { z } from 'zod';

/**
 * Schema para crear un nuevo tipo de máquina
 */
export const CreateMachineTypeRequestSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),
  language: z.string()
    .length(2, 'El idioma debe ser código ISO 639-1 (2 letras)')
    .regex(/^[a-z]{2}$/, 'El idioma debe ser código ISO 639-1 en minúsculas')
    .default('en')
});
export type CreateMachineTypeRequest = z.infer<typeof CreateMachineTypeRequestSchema>;

/**
 * Schema para actualizar un tipo de máquina
 */
export const UpdateMachineTypeRequestSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim()
});
export type UpdateMachineTypeRequest = z.infer<typeof UpdateMachineTypeRequestSchema>;

/**
 * Schema de respuesta para tipo de máquina
 */
export const MachineTypeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  languages: z.array(z.string())
});
export type MachineTypeResponse = z.infer<typeof MachineTypeResponseSchema>;

/**
 * Schema para listar tipos de máquina con filtros opcionales
 */
export const ListMachineTypesQuerySchema = z.object({
  language: z.string().optional()
});
export type ListMachineTypesQuery = z.infer<typeof ListMachineTypesQuerySchema>;

// Legacy interface para compatibilidad
export interface MachineTypeContract {
  id: string;
  name: string;
  languages: string[];
}