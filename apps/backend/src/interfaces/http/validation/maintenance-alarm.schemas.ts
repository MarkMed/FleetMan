import { z } from 'zod';

/**
 * Validaciones Zod para Maintenance Alarms
 * 
 * Propósito:
 * - Validar requests antes de llegar a use cases
 * - Proveer type safety y mensajes de error claros
 * - Evitar datos inválidos en capa de dominio
 * 
 * Sprint #11: Maintenance Alarms - HTTP Layer
 */

// Schema para crear alarma
export const CreateMaintenanceAlarmSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters')
    .trim(),
  
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .trim()
    .optional(),
  
  relatedParts: z.array(z.string().trim().min(1))
    .default([])
    .refine(parts => parts.every(p => p.length > 0), {
      message: 'All related parts must be non-empty strings'
    }),
  
  intervalHours: z.number()
    .int('Interval hours must be an integer')
    .min(1, 'Interval hours must be at least 1')
    .max(10000, 'Interval hours must not exceed 10,000')
});

// Schema para actualizar alarma
export const UpdateMaintenanceAlarmSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters')
    .trim()
    .optional(),
  
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .trim()
    .optional(),
  
  relatedParts: z.array(z.string().trim().min(1))
    .refine(parts => parts.every(p => p.length > 0), {
      message: 'All related parts must be non-empty strings'
    })
    .optional(),
  
  intervalHours: z.number()
    .int('Interval hours must be an integer')
    .min(1, 'Interval hours must be at least 1')
    .max(10000, 'Interval hours must not exceed 10,000')
    .optional(),
  
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

// Schema para listar alarmas (query params)
export const ListMaintenanceAlarmsQuerySchema = z.object({
  isActive: z.enum(['true', 'false'])
    .transform(val => val === 'true')
    .optional()
});

// Schema para params de ruta (machineId, alarmId)
export const MaintenanceAlarmParamsSchema = z.object({
  machineId: z.string()
    .min(1, 'Machine ID is required'),
    // No regex específico - delegar validación al use case (mismo patrón que quickcheck)
  
  alarmId: z.string()
    .min(1, 'Alarm ID is required')
    // No regex específico - alarmId es generado internamente por MongoDB como subdocumento
});

// Schema solo para machineId
export const MachineIdParamSchema = z.object({
  machineId: z.string()
    .min(1, 'Machine ID is required')
    // No regex específico - delegar validación al use case (mismo patrón que quickcheck)
});

// Tipos inferidos para TypeScript
export type CreateMaintenanceAlarmDto = z.infer<typeof CreateMaintenanceAlarmSchema>;
export type UpdateMaintenanceAlarmDto = z.infer<typeof UpdateMaintenanceAlarmSchema>;
export type ListMaintenanceAlarmsQueryDto = z.infer<typeof ListMaintenanceAlarmsQuerySchema>;
export type MaintenanceAlarmParamsDto = z.infer<typeof MaintenanceAlarmParamsSchema>;
export type MachineIdParamDto = z.infer<typeof MachineIdParamSchema>;

// TODO: Schema para filtros avanzados
// Razón: Permitir filtrado por proximidad a trigger, timesTriggered, etc
// Declaración:
// export const AdvancedFiltersSchema = z.object({
//   minAccumulatedHours: z.number().optional(),
//   maxAccumulatedHours: z.number().optional(),
//   minTimesTriggered: z.number().optional(),
//   sortBy: z.enum(['accumulatedHours', 'intervalHours', 'timesTriggered', 'title']).optional(),
//   sortOrder: z.enum(['asc', 'desc']).optional()
// });
