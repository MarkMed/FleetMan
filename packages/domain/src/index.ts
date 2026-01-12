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
export * from "./entities/message/message.entity"; // 🆕 Sprint #12 Module 3 - Message entity

// Value Objects
export * from "./value-objects";

// Enums
export * from "./enums/DayOfWeek";
export * from "./enums/NotificationEnums";

// Domain Events
export * from "./events";

// Puertos (interfaces) - Implementados
export * from "./ports";
export type { IGetNotificationsResult } from "./ports/user.repository";
export type { 
  IMessageRepository,
  IGetConversationHistoryResult,
  ConversationHistoryOptions
} from "./ports/message.repository"; // 🆕 Sprint #12 Module 3 - Message repository port

// Servicios de dominio - Implementados
export * from "./services";

// Public Models (interfaces for external consumption) - EXPORTS ESPECÍFICOS
export {
  IUser,
  IClientUser, 
  IProviderUser,
  IUserPublicProfile, // 🆕 Sprint #12 Module 1 - Public user profile for discovery
  IContact, // 🆕 Sprint #12 Module 2 - Contact subdocument
  IMessage, // 🆕 Sprint #12 Module 3 - Message for 1-to-1 chat
  MESSAGE_CONTENT_MAX_LENGTH, // 🆕 Sprint #12 Module 3 - Content length constant
  IMachine,
  IMachineType,
  IMachineEvent,
  IMachineEventType,
  INotification,
  IMaintenanceAlarm, // 🔔 Sprint #11 - maintenance alarms embedded in Machine
  IQuickCheckTemplate, // OLD - not used in MVP
  IQuickCheckItemTemplate, // OLD - not used in MVP
  IInternalMessage, // DEPRECATED - use IMessage for 1-to-1 chat
  IRepuesto,
  IBaseEntity,
  IQuickCheckRecord, // NEW - embedded in Machine
  IQuickCheckItem, // NEW - embedded item in QuickCheckRecord
  IUsageSchedule, // NEW - embedded in Machine for scheduling
  QuickCheckItemResult,
  QuickCheckResult,
  QUICK_CHECK_ITEM_RESULTS, // SSOT constant for validation
  QUICK_CHECK_RESULTS // SSOT constant for validation
} from "./models/interfaces";

// Export enum types separately to avoid duplicate exports (Sprint #9)
export { NotificationType, NotificationSourceType } from "./enums/NotificationEnums";

// Export FUEL_TYPE const and type directly for internal package use (persistence/contracts layers)
export { FUEL_TYPE, type FuelType } from "./models";

// Export with aliases for external consumers
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