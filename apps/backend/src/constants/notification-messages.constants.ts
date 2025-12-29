/**
 * Claves de i18n para mensajes de notificaciones y tipos de eventos
 * 
 * Este archivo consolida:
 * 1. Notification messages (keys i18n para el frontend)
 * 2. Machine event types (identificadores de tipos de eventos del sistema)
 * 
 * SSOT (Single Source of Truth) para todas las claves relacionadas con
 * notificaciones y eventos de máquinas.
 * 
 * @example
 * // Notificación
 * message: NOTIFICATION_MESSAGE_KEYS.quickcheck.completed.approved
 * 
 * // Event Type
 * name: MACHINE_EVENT_TYPE_KEYS.quickcheck.completed
 */


export const NOTIFICATION_MESSAGE_KEYS = {
  quickcheck: {
    completed: {
      approved: 'notification.quickcheck.completed.approved',
      disapproved: 'notification.quickcheck.completed.disapproved',
      notInitiated: 'notification.quickcheck.completed.notInitiated'
    },
    created: 'notification.quickcheck.created',
    assigned: 'notification.quickcheck.assigned'
  },
  machine: {
    created: 'notification.machine.created',
    updated: 'notification.machine.updated',
    deleted: 'notification.machine.deleted',
    statusChanged: 'notification.machine.statusChanged',
    event: {
      maintenanceStarted: 'notification.machine.event.maintenanceStarted',
      maintenanceCompleted: 'notification.machine.event.maintenanceCompleted',
      maintenanceCancelled: 'notification.machine.event.maintenanceCancelled',
      sparePartAdded: 'notification.machine.event.sparePartAdded',
      sparePartRemoved: 'notification.machine.event.sparePartRemoved',
      documentUploaded: 'notification.machine.event.documentUploaded',
      documentDeleted: 'notification.machine.event.documentDeleted',
      operatorAssigned: 'notification.machine.event.operatorAssigned',
      operatorUnassigned: 'notification.machine.event.operatorUnassigned',
      breakdown: 'notification.machine.event.breakdown',
      breakdownResolved: 'notification.machine.event.breakdownResolved'
    }
  },
  maintenance: {
    scheduled: 'notification.maintenance.scheduled',
    reminder: 'notification.maintenance.reminder',
    overdue: 'notification.maintenance.overdue',
    completed: 'notification.maintenance.completed',
    cancelled: 'notification.maintenance.cancelled',
    rescheduled: 'notification.maintenance.rescheduled'
  },
  user: {
    assigned: 'notification.user.assigned',
    unassigned: 'notification.user.unassigned',
    roleChanged: 'notification.user.roleChanged',
    permissionsChanged: 'notification.user.permissionsChanged'
  },
  system: {
    welcome: 'notification.system.welcome',
    passwordChanged: 'notification.system.passwordChanged',
    accountUpdated: 'notification.system.accountUpdated',
    dataExported: 'notification.system.dataExported',
    reportGenerated: 'notification.system.reportGenerated'
  }
} as const;

/**
 * Tipo helper para acceso type-safe a las keys
 */
export type NotificationMessageKey = 
  | typeof NOTIFICATION_MESSAGE_KEYS.quickcheck.completed[keyof typeof NOTIFICATION_MESSAGE_KEYS.quickcheck.completed]
  | typeof NOTIFICATION_MESSAGE_KEYS.quickcheck.created
  | typeof NOTIFICATION_MESSAGE_KEYS.quickcheck.assigned
  | typeof NOTIFICATION_MESSAGE_KEYS.machine.created
  | typeof NOTIFICATION_MESSAGE_KEYS.machine.updated
  | typeof NOTIFICATION_MESSAGE_KEYS.machine.deleted
  | typeof NOTIFICATION_MESSAGE_KEYS.machine.statusChanged
  | typeof NOTIFICATION_MESSAGE_KEYS.machine.event[keyof typeof NOTIFICATION_MESSAGE_KEYS.machine.event]
  | typeof NOTIFICATION_MESSAGE_KEYS.maintenance[keyof typeof NOTIFICATION_MESSAGE_KEYS.maintenance]
  | typeof NOTIFICATION_MESSAGE_KEYS.user[keyof typeof NOTIFICATION_MESSAGE_KEYS.user]
  | typeof NOTIFICATION_MESSAGE_KEYS.system[keyof typeof NOTIFICATION_MESSAGE_KEYS.system];
