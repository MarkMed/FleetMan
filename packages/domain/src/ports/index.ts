// /packages/domain/src/ports/index.ts
// Puertos (interfaces) para inversión de dependencias

// Repositorios implementados
export * from './machine-type.repository';

// TODO: Implementar puertos restantes según arquitectura:
// - Repositorios: IUserRepository, IMachineRepository, etc.
// - Servicios externos: INotificationService, ISchedulerService
// - Infraestructura: IClock, ILogger, IMailer