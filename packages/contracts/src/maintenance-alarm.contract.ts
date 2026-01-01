/**
 * Maintenance Alarm Contracts - Sprint #11
 * 
 * Contratos Zod para MaintenanceAlarm (alarmas de mantenimiento programadas)
 * Pattern: Subdocumento embebido en Machine (como QuickCheck y MachineEvent)
 */

import { z } from 'zod';

/**
 * Schema para MaintenanceAlarm (lectura/respuesta)
 */
export const MaintenanceAlarmSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  relatedParts: z.array(z.string().min(1)).default([]),
  intervalHours: z.number().int().min(1),
  isActive: z.boolean(),
  createdBy: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastTriggeredAt: z.coerce.date().optional(),
  lastTriggeredHours: z.number().int().min(0).optional(),
  timesTriggered: z.number().int().min(0)
});

/**
 * Schema para crear MaintenanceAlarm
 */
export const CreateMaintenanceAlarmRequestSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less')
    .trim(),
  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .trim()
    .optional(),
  relatedParts: z.array(
    z.string()
      .min(1, 'Part name cannot be empty')
      .trim()
  )
    .max(50, 'Too many parts (max 50)')
    .default([]),
  intervalHours: z.number()
    .int('Interval must be an integer')
    .min(1, 'Interval must be at least 1 hour')
    .max(50000, 'Interval too large (max 50,000 hours)') // ~5.7 años @ 24h/día - límite razonable MVP
});

/**
 * Schema para actualizar MaintenanceAlarm
 * Todos los campos opcionales (partial update)
 */
export const UpdateMaintenanceAlarmRequestSchema = z.object({
  title: z.string()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title must be 100 characters or less')
    .trim()
    .optional(),
  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .trim()
    .optional(),
  relatedParts: z.array(
    z.string()
      .min(1, 'Part name cannot be empty')
      .trim()
  )
    .max(50, 'Too many parts (max 50)')
    .optional(),
  intervalHours: z.number()
    .int('Interval must be an integer')
    .min(1, 'Interval must be at least 1 hour')
    .max(50000, 'Interval too large (max 50,000 hours)')
    .optional(),
  isActive: z.boolean()
    .optional()
});

/**
 * Schema para query params al obtener alarmas
 */
export const GetMaintenanceAlarmsQuerySchema = z.object({
  onlyActive: z.coerce.boolean().optional() // coerce convierte string "true"/"false" a boolean
});

/**
 * Schema para respuesta de lista de alarmas
 */
export const GetMaintenanceAlarmsResponseSchema = z.object({
  alarms: z.array(MaintenanceAlarmSchema),
  total: z.number().int().min(0),
  activeCount: z.number().int().min(0)
});

// =============================================================================
// Type Exports
// =============================================================================

export type MaintenanceAlarm = z.infer<typeof MaintenanceAlarmSchema>;
export type CreateMaintenanceAlarmRequest = z.infer<typeof CreateMaintenanceAlarmRequestSchema>;
export type UpdateMaintenanceAlarmRequest = z.infer<typeof UpdateMaintenanceAlarmRequestSchema>;
export type GetMaintenanceAlarmsQuery = z.infer<typeof GetMaintenanceAlarmsQuerySchema>;
export type GetMaintenanceAlarmsResponse = z.infer<typeof GetMaintenanceAlarmsResponseSchema>;

// =============================================================================
// 🔮 POST-MVP: Schemas comentados para futuras funcionalidades
// =============================================================================

// /**
//  * Schema para configuración avanzada de alarma (POST-MVP)
//  */
// export const AdvancedMaintenanceAlarmConfigSchema = z.object({
//   priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
//   notifyBefore: z.number().int().min(0).optional(), // Alertar X horas antes
//   autoResetOnComplete: z.boolean().optional(), // Reset automático al completar mantenimiento
//   assignedTo: z.string().optional(), // userId del responsable
//   estimatedDuration: z.number().int().min(0).optional(), // Duración estimada en horas
//   reminderChannels: z.array(z.enum(['NOTIFICATION', 'EMAIL', 'SMS'])).optional() // Múltiples canales
// });
