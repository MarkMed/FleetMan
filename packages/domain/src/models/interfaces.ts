// =============================================================================
// PUBLIC INTERFACES - Domain Model Contracts
// =============================================================================
// Estas interfaces definen el "contrato público" de cada entidad
// Frontend consume estas interfaces (sin lógica de dominio)
// Backend usa las entidades completas (con reglas de negocio)

// Import for type references
import { DayOfWeek } from '../enums/DayOfWeek';

/**
 * Interface base para todas las entidades
 */
export interface IBaseEntity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Interface pública para User
 */
export interface IUser extends IBaseEntity {
  readonly email: string;
  readonly profile: {
    readonly phone?: string;
    readonly companyName?: string;
    readonly address?: string;
  };
  readonly type: 'CLIENT' | 'PROVIDER';
  readonly isActive: boolean;
  readonly notifications?: readonly INotification[]; // 🆕 Sprint #9: Notificaciones embebidas
}

/**
 * Interface pública para ClientUser
 */
export interface IClientUser extends IUser {
  readonly type: 'CLIENT';
  readonly subscriptionLevel: 'FREE' | 'BASIC' | 'PREMIUM';
  readonly subscriptionExpiry?: Date;
}

/**
 * Interface pública para ProviderUser
 */
export interface IProviderUser extends IUser {
  readonly type: 'PROVIDER';
  readonly serviceAreas: readonly string[];
  readonly isVerified: boolean;
  readonly verificationDate?: Date;
}

/**
 * QuickCheck Item Result - Resultado individual de un item
 * SSOT: Constante para evitar duplicación en schemas Zod
 */
export const QUICK_CHECK_ITEM_RESULTS = ['approved', 'disapproved', 'omitted'] as const;
export type QuickCheckItemResult = typeof QUICK_CHECK_ITEM_RESULTS[number];

/**
 * QuickCheck Item - Item individual con su resultado
 */
export interface IQuickCheckItem {
  readonly name: string;
  readonly description?: string;
  readonly result: QuickCheckItemResult;
}

/**
 * QuickCheck Result - Resultado general del chequeo
 * SSOT: Constante para evitar duplicación en schemas Zod
 */
export const QUICK_CHECK_RESULTS = ['approved', 'disapproved', 'notInitiated'] as const;
export type QuickCheckResult = typeof QUICK_CHECK_RESULTS[number];

/**
 * QuickCheck Record - Registro completo de un QuickCheck ejecutado
 * Se embede dentro del array quickChecks[] de IMachine
 */
export interface IQuickCheckRecord {
  readonly result: QuickCheckResult;
  readonly date: Date;
  readonly executedById: string;
  readonly responsibleName: string; // Nombre del técnico/responsable que ejecuta
  readonly responsibleWorkerId: string; // Número de trabajador/identificador del responsable
  readonly quickCheckItems: readonly IQuickCheckItem[];
  readonly observations?: string;
}

/**
 * Usage Schedule - Programación de uso de máquina
 * Define cuántas horas por día opera y qué días de la semana
 * Crítico para cálculo preciso de alertas de mantenimiento basadas en HORAS REALES de uso
 */
export interface IUsageSchedule {
  readonly dailyHours: number; // 1-24 horas por día
  readonly operatingDays: readonly DayOfWeek[]; // Array de DayOfWeek enums (tipo específico, no genérico string[])
  readonly weeklyHours: number; // Campo calculado (SIEMPRE presente): dailyHours × cantidad de días
}

/**
 * Interface pública para Machine
 */
export interface IMachine extends IBaseEntity {
  readonly serialNumber: string;
  readonly brand: string;
  readonly modelName: string;
  readonly nickname?: string;
  readonly machineTypeId: string;
  readonly ownerId: string;
  readonly createdById: string;
  readonly assignedProviderId?: string;
  readonly providerAssignedAt?: Date;
  readonly assignedTo?: string; // [NUEVO] Persona asignada (temporal string, futuro: userId)
  readonly usageSchedule?: IUsageSchedule; // [NUEVO] Programación de uso para cálculo de alertas
  readonly machinePhotoUrl?: string; // [NUEVO] URL de foto de la máquina (preparación para Cloudinary)
  readonly status: {
    readonly code: 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED';
    readonly displayName: string;
    readonly description: string;
    readonly color: string;
    readonly isOperational: boolean;
  };
  readonly specs?: {
    readonly enginePower?: number;
    readonly maxCapacity?: number;
    readonly fuelType?: 'ELECTRIC_LITHIUM' | 'ELECTRIC_LEAD_ACID' | 'DIESEL' | 'LPG' | 'GASOLINE' | 'BIFUEL' | 'HYBRID';
    readonly year?: number;
    readonly weight?: number;
    readonly operatingHours?: number;
  };
  readonly location?: {
    readonly siteName?: string;
    readonly address?: string;
    readonly coordinates?: {
      readonly latitude: number;
      readonly longitude: number;
    };
    readonly lastUpdated: Date;
  };
  readonly quickChecks?: readonly IQuickCheckRecord[];
}

/**
 * Interface pública mínima para MachineType
 * DRY/SSOT: Usar en dominio, contract y persistencia
 */
export interface IMachineType {
  readonly id: string;
  readonly name: string;
  readonly languages: string[];
}

/**
 * Interface pública para MachineEvent
 */
export interface IMachineEvent extends IBaseEntity {
  readonly machineId: string;
  readonly createdBy: string;
  readonly typeId: string;
  readonly title: string;
  readonly description: string;
  readonly metadata?: {
    readonly additionalInfo?: Record<string, any>;
    readonly notes?: string;
  };
  readonly isSystemGenerated: boolean;
}

/**
 * Interface pública para MachineEventType
 */
export interface IMachineEventType extends IBaseEntity {
  readonly name: string;
  readonly normalizedName: string;
  readonly systemGenerated: boolean;
  readonly createdBy?: string;
  readonly timesUsed: number;
  readonly isActive: boolean;
}

// =============================================================================
// 🔔 NOTIFICATION INTERFACES (Sprint #9)
// =============================================================================

import type { NotificationType, NotificationSourceType } from '../enums/NotificationEnums';
export type { NotificationType, NotificationSourceType };

/**
 * Notification Record - Notificación embebida en User
 * Similar a IQuickCheckRecord embebido en Machine
 * NO es una entidad independiente, sino un subdocumento
 */
export interface INotification {
  readonly id: string; // ID del subdocumento (no entidad)
  readonly notificationType: NotificationType;
  readonly message: string;
  readonly wasSeen: boolean;
  readonly notificationDate: Date;
  readonly actionUrl?: string; // URL para navegar al detalle (ej: /machines/123/quickchecks/456)
  readonly sourceType?: NotificationSourceType; // Clasificación del tipo de origen
  readonly metadata?: Record<string, any>; // Datos para interpolación i18next (ej: {machineName, userName})
  // 🔮 POST-MVP: Campos comentados para futuras versiones
  // readonly priority?: 'LOW' | 'MEDIUM' | 'HIGH'; // Priorización visual
  // readonly expiresAt?: Date; // Auto-eliminación de notificaciones
}

/**
 * Interface pública para MaintenanceReminder
 */
export interface IMaintenanceReminder extends IBaseEntity {
  readonly machineId: string;
  readonly title: string;
  readonly description?: string;
  readonly type: 'TIME_BASED' | 'HOUR_BASED' | 'COMBINED';
  readonly intervalDays?: number;
  readonly intervalHours?: number;
  readonly lastExecutedAt?: Date;
  readonly nextDueDate?: Date;
  readonly nextDueHours?: number;
  readonly isActive: boolean;
  readonly createdById: string;
  readonly priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Interface pública para QuickCheckItemTemplate (OLD - Not used in MVP)
 * Esta era la interfaz original para templates editables de QuickCheck
 * En MVP usamos IQuickCheckItem (embedded) para items dentro de registros
 */
export interface IQuickCheckItemTemplate extends IBaseEntity {
  readonly quickCheckId: string;
  readonly title: string;
  readonly description?: string;
  readonly order: number;
  readonly isRequired: boolean;
  readonly expectedResult?: string;
}

/**
 * Interface pública para QuickCheckTemplate (OLD - Not used in MVP)
 * Esta era la interfaz original para templates editables de QuickCheck
 * En MVP usamos IQuickCheckRecord (embedded en Machine) para registros de ejecución
 */
export interface IQuickCheckTemplate extends IBaseEntity {
  readonly machineId: string;
  readonly title: string;
  readonly description?: string;
  readonly items: readonly IQuickCheckItemTemplate[];
  readonly isActive: boolean;
  readonly createdById: string;
  readonly lastExecutedAt?: Date;
  readonly executionFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

/**
 * Interface pública para InternalMessage
 */
export interface IInternalMessage extends IBaseEntity {
  readonly fromUserId: string;
  readonly toUserId: string;
  readonly subject: string;
  readonly body: string;
  readonly isRead: boolean;
  readonly readAt?: Date;
  readonly parentMessageId?: string;
  readonly relatedEntityType?: 'MACHINE' | 'MAINTENANCE' | 'EVENT';
  readonly relatedEntityId?: string;
  readonly priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Interface pública para Repuesto
 */
export interface IRepuesto extends IBaseEntity {
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly category: string;
  readonly compatibleMachineTypes: readonly string[];
  readonly currentStock: number;
  readonly minimumStock: number;
  readonly unitCost: number;
  readonly supplier?: string;
  readonly isActive: boolean;
  readonly lastRestockDate?: Date;
  readonly warrantyMonths?: number;
}