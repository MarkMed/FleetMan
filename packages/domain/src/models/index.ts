// =============================================================================
// PUBLIC MODELS - Re-exports for external consumption
// =============================================================================

// Export all public interfaces
export * from './interfaces';

// Export enums that consumers need (using const enums to avoid conflicts)
export const USER_TYPE = {
  CLIENT: 'CLIENT' as const,
  PROVIDER: 'PROVIDER' as const
} as const;

export const FUEL_TYPE = {
  ELECTRIC_LITHIUM: 'ELECTRIC_LITHIUM' as const,
  ELECTRIC_LEAD_ACID: 'ELECTRIC_LEAD_ACID' as const,
  DIESEL: 'DIESEL' as const,
  LPG: 'LPG' as const,
  GASOLINE: 'GASOLINE' as const,
  BIFUEL: 'BIFUEL' as const,
  HYBRID: 'HYBRID' as const
} as const;

export const MACHINE_STATUS_CODE = {
  ACTIVE: 'ACTIVE' as const,
  MAINTENANCE: 'MAINTENANCE' as const,
  OUT_OF_SERVICE: 'OUT_OF_SERVICE' as const,
  RETIRED: 'RETIRED' as const
} as const;

export const NOTIFICATION_TYPE = {
  MAINTENANCE_DUE: 'MAINTENANCE_DUE' as const,
  MAINTENANCE_OVERDUE: 'MAINTENANCE_OVERDUE' as const,
  QUICKCHECK_FAILED: 'QUICKCHECK_FAILED' as const,
  MACHINE_DOWN: 'MACHINE_DOWN' as const,
  REMINDER: 'REMINDER' as const,
  SYSTEM: 'SYSTEM' as const
} as const;

export const PRIORITY = {
  LOW: 'LOW' as const,
  MEDIUM: 'MEDIUM' as const,
  HIGH: 'HIGH' as const
} as const;

export const MAINTENANCE_TYPE = {
  TIME_BASED: 'TIME_BASED' as const,
  HOUR_BASED: 'HOUR_BASED' as const,
  COMBINED: 'COMBINED' as const
} as const;

export const EXECUTION_FREQUENCY = {
  DAILY: 'DAILY' as const,
  WEEKLY: 'WEEKLY' as const,
  MONTHLY: 'MONTHLY' as const
} as const;

export const SUBSCRIPTION_LEVEL = {
  FREE: 'FREE' as const,
  BASIC: 'BASIC' as const,
  PREMIUM: 'PREMIUM' as const
} as const;

// Type definitions derived from const objects
export type UserType = typeof USER_TYPE[keyof typeof USER_TYPE];
export type FuelType = typeof FUEL_TYPE[keyof typeof FUEL_TYPE];
export type MachineStatusCode = typeof MACHINE_STATUS_CODE[keyof typeof MACHINE_STATUS_CODE];
export type NotificationType = typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE];
export type Priority = typeof PRIORITY[keyof typeof PRIORITY];
export type MaintenanceType = typeof MAINTENANCE_TYPE[keyof typeof MAINTENANCE_TYPE];
export type ExecutionFrequency = typeof EXECUTION_FREQUENCY[keyof typeof EXECUTION_FREQUENCY];
export type SubscriptionLevel = typeof SUBSCRIPTION_LEVEL[keyof typeof SUBSCRIPTION_LEVEL];

// Re-export common value objects interfaces if needed
export interface ICoordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export interface IUserProfile {
  readonly phone?: string;
  readonly companyName?: string;
  readonly address?: string;
  readonly bio?: string; // 🆕 Sprint #13 Task 10.2: Biografía (max 500 chars)
  readonly tags?: readonly string[]; // 🆕 Sprint #13 Task 10.2: Tags/etiquetas (max 5, cada uno max 100 chars)
  readonly emailNotifications?: boolean; // 🆕 Sprint #15 Task 8.7: Preferencia de notificaciones por email (default: true)
}

export interface IMachineSpecs {
  readonly enginePower?: number;
  readonly maxCapacity?: number;
  readonly fuelType?: FuelType;
  readonly year?: number;
  readonly weight?: number;
  readonly operatingHours?: number;
}

export interface IMachineLocation {
  readonly siteName?: string;
  readonly address?: string;
  readonly coordinates?: ICoordinates;
  readonly lastUpdated: Date;
}

export interface IMachineStatus {
  readonly code: MachineStatusCode;
  readonly displayName: string;
  readonly description: string;
  readonly color: string;
  readonly isOperational: boolean;
}