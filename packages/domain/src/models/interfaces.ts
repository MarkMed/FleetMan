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
 * Interface para contactos (Sprint #12 Module 2 - Contact Management)
 * Relación unidireccional: un usuario guarda a otro en su agenda personal
 * Subdocumento embebido en User (similar a notifications)
 */
export interface IContact {
  readonly contactUserId: string; // ID del usuario agregado como contacto
  readonly addedAt: Date; // Fecha en que se agregó el contacto
  // TODO: Campos estratégicos para futuro (personalización de agenda)
  // readonly nickname?: string; // Alias personalizado para el contacto
  // readonly tags?: readonly string[]; // Etiquetas: ['proveedor-confiable', 'urgente', etc.]
  // readonly notes?: string; // Notas privadas sobre el contacto
  // readonly isFavorite?: boolean; // Marcar como favorito
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
    readonly bio?: string; // 🆕 Sprint #13 Task 10.2: Biografía (max 500 chars)
    readonly tags?: readonly string[]; // 🆕 Sprint #13 Task 10.2: Tags/etiquetas (max 5, cada uno max 100 chars)
    readonly emailNotifications?: boolean; // 🆕 Sprint #15 Task 8.7: Email notifications toggle (default: true = opt-out)
  };
  readonly type: 'CLIENT' | 'PROVIDER';
  readonly isActive: boolean;
  readonly notifications?: readonly INotification[]; // 🆕 Sprint #9: Notificaciones embebidas
  readonly contacts?: readonly IContact[]; // 🆕 Sprint #12 Module 2: Contactos embebidos
  readonly acceptedChatsFrom?: readonly string[]; // 🆕 Sprint #13 Task 9.3e: Whitelist de chats aceptados (UserIds)
  readonly usersBlackList?: readonly string[]; // 🆕 Sprint #13 Task 9.3e: Blacklist de usuarios bloqueados (UserIds)
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
 * Interface para datos públicos de usuarios (User Discovery - Sprint #12)
 * Subconjunto de datos de User expuestos para descubrimiento de usuarios
 * Excluye información sensible: email, phone, subscriptions, notifications
 */
export interface IUserPublicProfile {
  readonly id: string;
  readonly profile: {
    readonly companyName?: string;
    readonly bio?: string; // 🆕 Sprint #13 Task 10.2: Biografía pública (max 500 chars)
    readonly tags?: readonly string[]; // 🆕 Sprint #13 Task 10.2: Tags públicos (max 5, cada uno max 100 chars)
  };
  readonly type: 'CLIENT' | 'PROVIDER';
  // Provider-specific fields (opcionales, solo para type === 'PROVIDER')
  // serviceAreas: Para ProviderUser se mapea desde specialties
  readonly serviceAreas?: readonly string[];
  readonly isVerified?: boolean;
  // TODO: Campos estratégicos para futuro
  // readonly machineCount?: number; // Cantidad de máquinas (para mostrar experiencia del cliente)
  // readonly rating?: number; // Rating promedio (para proveedores verificados)
  // readonly location?: string; // Ciudad/región (para búsquedas geográficas futuras)
  // readonly responseTime?: string; // Tiempo promedio de respuesta (para mensajería - Sprint #12 Module 3)
  // readonly completedJobs?: number; // Trabajos completados (para proveedores verificados)
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
  // LEGACY: machineTypeId replaced by free-text machineTypeName (Sprint #XX)
  // readonly machineTypeId: string;
  readonly machineTypeName: string;
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
  readonly eventsHistory?: readonly IMachineEvent[]; // 🆕 Sprint #10: Historial de eventos embebido (como quickChecks)
  readonly maintenanceAlarms?: readonly IMaintenanceAlarm[]; // 🆕 Sprint #11: Alarmas de mantenimiento embebidas (patrón subdocumento)
}

/**
 * Interface pública mínima para MachineType
 * DRY/SSOT: Usar en dominio, contract y persistencia
 * 
 * LEGACY: Machine types are now free-text fields (machineTypeName).
 * This interface is kept for backward compatibility and potential future features.
 */
export interface IMachineType {
  readonly id: string;
  readonly name: string;
  readonly languages: string[];
}

/**
 * Interface pública para SparePart (Repuesto)
 * Sprint #15/16 - Task 7.1: Alta/edición repuesto
 * Entidad independiente con referencia a machineId
 */
export interface ISparePart {
  readonly id: string;
  readonly name: string;
  readonly serialId: string;
  readonly amount: number;
  readonly machineId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Interface pública para MachineEvent
 * NOTA: NO tiene machineId porque está embebido en Machine.eventsHistory[]
 * Similar a IQuickCheckRecord que no tiene machineId
 */
export interface IMachineEvent extends IBaseEntity {
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
  readonly languages: string[];      // Códigos ISO 639-1 (ej: ['es', 'en'])
  readonly systemGenerated: boolean;
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

// =============================================================================
// 🔔 MAINTENANCE ALARM INTERFACES (Sprint #11)
// =============================================================================

/**
 * Maintenance Alarm Record - Alarma de mantenimiento embebida en Machine
 * Similar a IQuickCheckRecord e IMachineEvent embebidos en Machine
 * NO es una entidad independiente, sino un subdocumento
 * 
 * Propósito: Sistema de alertas automáticas basadas en horas acumuladas de uso.
 * El cronjob verifica si machine.specs.operatingHours >= (lastTriggeredHours + intervalHours)
 * y dispara evento + notificación cuando se cumple la condición.
 */
export interface IMaintenanceAlarm {
  readonly id: string; // ID del subdocumento
  readonly title: string; // Ej: "Cambiar filtros de aceite y aire"
  readonly description?: string; // Detalles del mantenimiento
  readonly relatedParts: readonly string[]; // Partes involucradas (ej: ["Filtro de Aceite", "Filtro de Aire"])
  readonly intervalHours: number; // Cada cuántas horas acumuladas alertar
  
  // 🆕 NUEVO: Accumulator Pattern (Sprint #11 - Refactor)
  // Horas acumuladas desde el último trigger (o desde creación si nunca se disparó)
  // El cronjob suma dailyHours cada día DESPUÉS de que la máquina operó (día siguiente)
  // Cuando accumulatedHours >= intervalHours → trigger alarma + reset a 0
  // Ejemplo: Si intervalo es 500h y acumula 502h → trigger + reset a 0 (nuevo ciclo)
  readonly accumulatedHours: number;
  
  readonly isActive: boolean; // Permite desactivar sin eliminar
  readonly createdBy: string; // userId - Trazabilidad
  readonly createdAt: Date; // Timestamp de creación
  readonly updatedAt: Date; // Timestamp de última actualización
  readonly lastTriggeredAt?: Date; // Última vez que se disparó la alarma
  
  // ⚠️ DEPRECATED (mantener por compatibilidad con datos existentes, remover en v2.0)
  // Ya no se usa en lógica de cronjob - usar accumulatedHours en su lugar
  readonly lastTriggeredHours?: number;
  
  readonly timesTriggered: number; // Contador de veces disparadas
  // 🔮 POST-MVP: Campos comentados para futuras versiones
  // readonly priority?: 'LOW' | 'MEDIUM' | 'HIGH'; // Priorización visual
  // readonly notifyBefore?: number; // Alertar X horas antes de cumplirse intervalo
  // readonly autoResetOnComplete?: boolean; // Reset automático vs manual
  // readonly assignedTo?: string; // Responsable específico de atender alarma
  // readonly estimatedDuration?: number; // Duración estimada de mantenimiento (para planificación)
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
 * Constante para límite de caracteres en contenido de mensajes
 * Sprint #12 - Módulo 3: Messaging System
 */
export const MESSAGE_CONTENT_MAX_LENGTH = 1000;

/**
 * Interface pública para Mensaje 1-a-1
 * Adaptado de IInternalMessage para sistema de mensajería simple entre contactos
 * 
 * Sprint #12 - Módulo 3: Messaging System
 */
export interface IMessage extends IBaseEntity {
  readonly senderId: string;
  readonly recipientId: string;
  readonly content: string;
  readonly sentAt: Date;
  
  // TODO: Features POST-MVP
  // readonly isRead?: boolean;           // Estado de lectura del mensaje
  // readonly readAt?: Date;              // Timestamp cuando fue leído
  // readonly parentMessageId?: string;   // Para threading/respuestas
  // readonly attachmentUrls?: string[];  // Para multimedia (imágenes, documentos)
  // readonly isEdited?: boolean;         // Flag si fue editado
  // readonly editedAt?: Date;            // Timestamp de última edición
}

/**
 * Interface pública para InternalMessage (Sistema interno diferente al chat 1-a-1)
 * DEPRECATED: Mantener por compatibilidad, pero usar IMessage para chat
 * @deprecated Use IMessage for 1-to-1 chat messaging instead
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