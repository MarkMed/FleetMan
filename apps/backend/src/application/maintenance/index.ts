// /apps/backend/src/application/maintenance/index.ts
// Casos de uso para mantenimiento preventivo

// Sprint #11: Maintenance Alarms - Cronjob Automation
export * from './update-machines-operating-hours.use-case';
export * from './check-maintenance-alarms.use-case';

// Sprint #11: Maintenance Alarms - CRUD Operations
export * from './create-maintenance-alarm.use-case';
export * from './list-maintenance-alarms.use-case';
export * from './update-maintenance-alarm.use-case';
export * from './delete-maintenance-alarm.use-case';
export * from './reset-maintenance-alarm.use-case';

// TODO: Implementar casos de uso adicionales:
// - GetMaintenanceHistory
// - ScheduleMaintenanceWindow
// - CompleteMaintenanceTask (marca alarma como atendida con notas)