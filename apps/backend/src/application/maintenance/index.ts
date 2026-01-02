// /apps/backend/src/application/maintenance/index.ts
// Casos de uso para mantenimiento preventivo

// Sprint #11: Maintenance Alarms - Cronjob Automation
export * from './update-machines-operating-hours.use-case';
export * from './check-maintenance-alarms.use-case';

// TODO: Implementar casos de uso adicionales:
// - CreateMaintenanceReminder
// - TriggerMaintenanceNotification
// - GetMaintenanceHistory
// - ScheduleMaintenanceWindow
// - CompleteMaintenanceTask