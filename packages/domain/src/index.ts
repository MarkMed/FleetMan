// /packages/domain/src/index.ts
// Punto de entrada del paquete de dominio

// Errores de dominio
export * from "./errors";

// Entidades (con exports directos)
export * from "./entities/user";
export * from "./entities/client-user";
export * from "./entities/provider-user";
export * from "./entities/machine";
export * from "./entities/machine-type";
export * from "./entities/machine-event";
export * from "./entities/machine-event-type";

// Value Objects
export * from "./value-objects";

// Puertos (interfaces) - Implementados
export * from "./ports";

// Servicios de dominio - Implementados
export * from "./services";

// Public Models (interfaces for external consumption) - EXPORTS ESPECÍFICOS
export {
  IUser,
  IClientUser, 
  IProviderUser,
  IMachine,
  IMachineType,
  IMachineEvent,
  IMachineEventType,
  INotification,
  IMaintenanceReminder,
  IQuickCheckTemplate, // OLD - not used in MVP
  IQuickCheckItemTemplate, // OLD - not used in MVP
  IInternalMessage,
  IRepuesto,
  IBaseEntity,
  IQuickCheckRecord, // NEW - embedded in Machine
  IQuickCheckItem, // NEW - embedded item in QuickCheckRecord
  QuickCheckItemResult,
  QuickCheckResult,
  QUICK_CHECK_ITEM_RESULTS, // SSOT constant for validation
  QUICK_CHECK_RESULTS // SSOT constant for validation
} from "./models/interfaces";

export {
  USER_TYPE as PublicUserType,
  FUEL_TYPE as PublicFuelType,
  MACHINE_STATUS_CODE as PublicMachineStatusCode,
  NOTIFICATION_TYPE as PublicNotificationType,
  PRIORITY as PublicPriority,
  MAINTENANCE_TYPE as PublicMaintenanceType,
  EXECUTION_FREQUENCY as PublicExecutionFrequency,
  SUBSCRIPTION_LEVEL as PublicSubscriptionLevel,
  type UserType as PublicUserTypeValue,
  type FuelType as PublicFuelTypeValue,
  type MachineStatusCode as PublicMachineStatusCodeValue,
  type NotificationType as PublicNotificationTypeValue,
  type Priority as PublicPriorityValue,
  type MaintenanceType as PublicMaintenanceTypeValue,
  type ExecutionFrequency as PublicExecutionFrequencyValue,
  type SubscriptionLevel as PublicSubscriptionLevelValue,
  type ICoordinates,
  type IUserProfile,
  type IMachineSpecs,
  type IMachineLocation,
  type IMachineStatus
} from "./models";

// TODO: Descomentar cuando estén implementados
// Políticas y estrategias
// export * from "./policies";

// Eventos de dominio
// export * from "./events";