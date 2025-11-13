// /packages/domain/src/ports/index.ts
// Puertos (interfaces) para inversión de dependencias

// Repositorios implementados
export * from './machine-type.repository';
export * from './user.repository';
export * from './machine.repository';
export * from './machine-event.repository';
export * from './machine-event-type.repository';

// TODO: Implementar puertos adicionales según arquitectura:
// - Otros repositorios: INotificationRepository, IMaintenanceReminderRepository
// - Servicios externos: INotificationService, ISchedulerService
// - Infraestructura: IClock, ILogger, IMailer