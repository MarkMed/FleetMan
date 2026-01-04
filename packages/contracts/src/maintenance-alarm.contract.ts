/**
 * Maintenance Alarm Contracts - Sprint #11
 * 
 * Contratos Zod para MaintenanceAlarm (alarmas de mantenimiento programadas)
 * Pattern: Subdocumento embebido en Machine (como QuickCheck y MachineEvent)
 */

import { z } from 'zod';
import type { IMaintenanceAlarm } from '@packages/domain';

/**
 * Schema para MaintenanceAlarm (lectura/respuesta)
 * Uses satisfies to ensure compile-time validation against domain IMaintenanceAlarm
 */
export const MaintenanceAlarmSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  relatedParts: z.array(z.string().min(1)), // No .default() aquí - siempre debe estar presente en lectura
  intervalHours: z.number().int().min(1),
  accumulatedHours: z.number().int().min(0), // Accumulator Pattern: horas acumuladas desde último trigger
  isActive: z.boolean(),
  createdBy: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastTriggeredAt: z.coerce.date().optional(),
  lastTriggeredHours: z.number().int().min(0).optional(), // DEPRECATED: usar accumulatedHours
  timesTriggered: z.number().int().min(0)
}) satisfies z.ZodType<IMaintenanceAlarm>;

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
    .max(50000, 'Interval too large (max 50,000 hours)'), // ~5.7 años @ 24h/día - límite razonable MVP
  accumulatedHours: z.number()
    .int('Accumulated hours must be an integer')
    .min(0, 'Accumulated hours cannot be negative')
    .default(0), // Default: comienza en 0 al crear alarma
  isActive: z.boolean()
    .default(true) // Alarms active by default
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
  accumulatedHours: z.number()
    .int('Accumulated hours must be an integer')
    .min(0, 'Accumulated hours cannot be negative')
    .optional(), // Opcional para update (ej: reset manual o ajuste)
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

/**
 * DTO type for HTTP responses (dates serialized as ISO strings)
 * 
 * Zod schemas use z.coerce.date() for parsing, but when sending responses,
 * Date objects are serialized to ISO strings by JSON.stringify().
 * This type reflects the actual wire format received by the frontend.
 */
export type MaintenanceAlarmDTO = Omit<MaintenanceAlarm, 'createdAt' | 'updatedAt' | 'lastTriggeredAt'> & {
  createdAt: string;
  updatedAt: string;
  lastTriggeredAt: string | null;
};

/**
 * Response type for list endpoint with DTOs
 */
export type GetMaintenanceAlarmsResponseDTO = Omit<GetMaintenanceAlarmsResponse, 'alarms'> & {
  alarms: MaintenanceAlarmDTO[];
};

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
