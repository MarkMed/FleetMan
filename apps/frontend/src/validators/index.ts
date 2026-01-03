import { z } from 'zod';

// User authentication schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Ingresa un correo válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Ingresa un correo válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una minúscula, una mayúscula y un número'
    ),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  role: z.enum(['client', 'provider'], {
    errorMap: () => ({ message: 'Selecciona un tipo de cuenta' }),
  }),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  businessName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.role === 'client' && !data.companyName?.trim()) {
    return false;
  }
  if (data.role === 'provider' && !data.businessName?.trim()) {
    return false;
  }
  return true;
}, {
  message: 'Este campo es requerido para tu tipo de cuenta',
  path: ['companyName'], // Will be overridden by conditional logic
});

// Machine schemas
export const machineSchema = z.object({
  serialNumber: z
    .string()
    .min(1, 'El número de serie es requerido')
    .min(3, 'El número de serie debe tener al menos 3 caracteres'),
  model: z
    .string()
    .min(1, 'El modelo es requerido'),
  brand: z
    .string()
    .min(1, 'La marca es requerida'),
  year: z
    .number()
    .optional()
    .refine((val) => !val || (val >= 1900 && val <= new Date().getFullYear() + 1), {
      message: 'Ingresa un año válido',
    }),
  location: z.string().optional(),
  contactProviderId: z.string().optional(),
  specifications: z.record(z.any()).optional(),
  purchaseDate: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  notes: z.string().optional(),
});

// Maintenance alarm validators - now using contract schemas
// Import from @contracts for DRY compliance
// export { CreateMaintenanceAlarmRequestSchema, UpdateMaintenanceAlarmRequestSchema } from '@contracts';
// 
// DEPRECATED: Old maintenanceReminderSchema removed - use CreateMaintenanceAlarmRequestSchema instead
// The old schema supported 'time' | 'hours' | 'both' types
// New alarm system only uses hours-based intervals (intervalHours)
// Migration: type='hours' → keep intervalHours, type='time'/'both' → convert to equivalent hours

// Event schema
export const eventSchema = z.object({
  type: z.enum(['maintenance', 'breakdown', 'inspection', 'repair', 'manual'], {
    errorMap: () => ({ message: 'Selecciona un tipo de evento' }),
  }),
  title: z
    .string()
    .min(1, 'El título es requerido')
    .min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  startDate: z
    .string()
    .min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().optional(),
  hoursAtEvent: z
    .number()
    .optional()
    .refine((val) => !val || val >= 0, {
      message: 'Las horas deben ser un número positivo',
    }),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  cost: z
    .number()
    .optional()
    .refine((val) => !val || val >= 0, {
      message: 'El costo debe ser un número positivo',
    }),
  notes: z.string().optional(),
});

// Quick check schemas
export const quickCheckItemSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  isRequired: z.boolean().default(true),
});

export const quickCheckSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  items: z
    .array(quickCheckItemSchema)
    .min(1, 'Debe tener al menos un elemento de chequeo'),
});

export const quickCheckExecutionSchema = z.object({
  results: z
    .array(z.object({
      itemId: z.string(),
      status: z.enum(['ok', 'fail', 'omit']),
      notes: z.string().optional(),
    }))
    .min(1, 'Debe completar al menos un elemento'),
  notes: z.string().optional(),
});

// Search and filter schemas
export const machineFiltersSchema = z.object({
  status: z.array(z.enum(['active', 'inactive', 'maintenance', 'broken'])).optional(),
  brand: z.array(z.string()).optional(),
  location: z.array(z.string()).optional(),
  ownerId: z.string().optional(),
  managedById: z.string().optional(),
  searchTerm: z.string().optional(),
});

// Contact information schema
export const contactInfoSchema = z.object({
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val.replace(/[\s\-\(\)]/g, '')), {
      message: 'Ingresa un número de teléfono válido',
    }),
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Ingresa un correo válido',
    }),
  website: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: 'Ingresa una URL válida',
    }),
  whatsapp: z
    .string()
    .optional()
    .refine((val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val.replace(/[\s\-\(\)]/g, '')), {
      message: 'Ingresa un número de WhatsApp válido',
    }),
});

// Export types inferred from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type MachineFormData = z.infer<typeof machineSchema>;
// MaintenanceReminderFormData deprecated - use CreateMaintenanceAlarmRequest from @contracts
export type EventFormData = z.infer<typeof eventSchema>;
export type QuickCheckFormData = z.infer<typeof quickCheckSchema>;
export type QuickCheckItemFormData = z.infer<typeof quickCheckItemSchema>;
export type QuickCheckExecutionFormData = z.infer<typeof quickCheckExecutionSchema>;
export type MachineFiltersFormData = z.infer<typeof machineFiltersSchema>;
export type ContactInfoFormData = z.infer<typeof contactInfoSchema>;