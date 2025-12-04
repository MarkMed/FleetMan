// =============================================================================
// PUBLIC INTERFACES - Domain Model Contracts
// =============================================================================
// Estas interfaces definen el "contrato público" de cada entidad
// Frontend consume estas interfaces (sin lógica de dominio)
// Backend usa las entidades completas (con reglas de negocio)

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
 */
export type QuickCheckItemResult = 'approved' | 'disapproved' | 'omitted';

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
 */
export type QuickCheckResult = 'approved' | 'disapproved' | 'notInitiated';

/**
 * QuickCheck Record - Registro completo de un QuickCheck ejecutado
 * Se embede dentro del array quickChecks[] de IMachine
 */
export interface IQuickCheckRecord {
  readonly result: QuickCheckResult;
  readonly date: Date;
  readonly executedById: string;
  readonly quickCheckItems: readonly IQuickCheckItem[];
  readonly observations?: string;
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
    readonly fuelType?: 'DIESEL' | 'GASOLINE' | 'ELECTRIC' | 'HYBRID';
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

/**
 * Interface pública para Notification
 */
export interface INotification extends IBaseEntity {
  readonly userId: string;
  readonly type: 'MAINTENANCE_DUE' | 'MAINTENANCE_OVERDUE' | 'QUICKCHECK_FAILED' | 'MACHINE_DOWN' | 'REMINDER' | 'SYSTEM';
  readonly title: string;
  readonly message: string;
  readonly isRead: boolean;
  readonly readAt?: Date;
  readonly relatedEntityType?: 'MACHINE' | 'MAINTENANCE_REMINDER' | 'QUICKCHECK' | 'EVENT';
  readonly relatedEntityId?: string;
  readonly actionUrl?: string;
  readonly priority: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly expiresAt?: Date;
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