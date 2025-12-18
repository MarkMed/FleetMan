/**
 * Notification Use Cases Exports
 * Sprint #9 - Sistema de Notificaciones
 * 
 * Use Cases:
 * - AddNotificationUseCase: Interno, llamado por otros features (fire-and-forget)
 * - GetUserNotificationsUseCase: GET con filtros y paginación
 * - MarkNotificationsAsSeenUseCase: PATCH batch update
 * - CountUnreadNotificationsUseCase: GET conteo para badge
 */

export * from './add-notification.use-case';
export * from './get-user-notifications.use-case';
export * from './mark-notifications-as-seen.use-case';
export * from './count-unread-notifications.use-case';
