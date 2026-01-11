import { UserId, NotificationCreatedEvent } from '@packages/domain';
import { UserRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import type { AddNotificationRequest } from '@packages/contracts';
import { eventBus } from '../../infrastructure/events';

/**
 * Use Case: Add Notification to User
 * 
 * Responsabilidades:
 * 1. Validar formato de userId
 * 2. Decidir si persistir según sourceType (MESSAGING = ephemeral, otros = persistent)
 * 3. Delegar creación de notificación al repositorio (si aplica)
 * 4. Emitir evento SSE SIEMPRE (real-time push)
 * 5. Log de errores sin bloquear operación principal
 * 
 * Estrategia de Notificaciones:
 * - MESSAGING: Solo SSE (ephemeral) - Mensajes ya están en collection messages
 * - QUICKCHECK/MAINTENANCE/EVENT/SYSTEM: DB + SSE - Requieren historial persistente
 * 
 * Patrón de uso:
 * - Este use case es INTERNO, llamado por otros features (QuickCheck, Events, Maintenance, Messaging)
 * - Fire-and-forget: errores se loggean pero no se propagan
 * - No expuesto en REST API directamente
 * 
 * Sprint #9 - Sistema de Notificaciones
 * Sprint #12 Module 3 - Agregado soporte para notificaciones efímeras
 */
export class AddNotificationUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Ejecuta el caso de uso de agregar notificación
   * 
   * Estrategia de persistencia:
   * - MESSAGING: Solo SSE (ephemeral) - No persiste en DB
   * - Otros tipos: DB + SSE - Persiste para historial
   * 
   * @param userId - ID del usuario que recibirá la notificación
   * @param notification - Datos de la notificación (type, message, actionUrl, sourceType)
   * @returns Promise<void> - Fire-and-forget, errores se loggean internamente
   */
  async execute(
    userId: string,
    notification: AddNotificationRequest
  ): Promise<void> {
    try {
      // 1. Validar formato de userId
      const userIdResult = UserId.create(userId);
      if (!userIdResult.success) {
        logger.error({ 
          userId, 
          error: userIdResult.error.message 
        }, 'Invalid userId format when adding notification');
        return; // Silent fail - no bloquear operación principal
      }

      // 2. Decidir si persistir en DB según sourceType
      // Notificaciones de MESSAGING son efímeras (solo SSE)
      // porque el mensaje ya está persistido en collection messages
      const shouldPersist = notification.sourceType !== 'MESSAGING';
      
      if (shouldPersist) {
        // 2a. Persistir notificación en DB (para historial)
        const addResult = await this.userRepository.addNotification(
          userIdResult.data,
          {
            notificationType: notification.notificationType,
            message: notification.message,
            actionUrl: notification.actionUrl,
            sourceType: notification.sourceType,
            metadata: notification.metadata
          }
        );

        if (!addResult.success) {
          logger.error({ 
            userId,
            error: addResult.error.message,
            notificationType: notification.notificationType,
            sourceType: notification.sourceType
          }, 'Failed to persist notification to DB');
          return; // Silent fail
        }

        logger.info({ 
          userId,
          notificationType: notification.notificationType,
          sourceType: notification.sourceType,
          persisted: true
        }, 'Notification persisted to DB successfully');
      } else {
        // 2b. Notificación efímera (solo SSE, no DB)
        logger.debug({ 
          userId,
          notificationType: notification.notificationType,
          sourceType: notification.sourceType,
          persisted: false,
          reason: 'Ephemeral notification (message already in messages collection)'
        }, 'Skipping DB persistence for ephemeral notification');
      }

      // 3. Emit domain event for real-time push via SSE
      // EventBus → SSEManager → Push to all connected devices
      // Esto se ejecuta SIEMPRE (tanto para notificaciones persistentes como efímeras)
      // 
      // Note: addNotification returns Result<void>, so we construct event from input data.
      // For ephemeral notifications (MESSAGING), the notification ID doesn't matter
      // For persistent notifications, MongoDB generates subdocument _id
      try {
        eventBus.emit('notification-created', new NotificationCreatedEvent(
          userId,
          shouldPersist ? 'generated_by_db' : 'ephemeral_not_persisted', // Distinguish ephemeral vs persistent
          notification.notificationType,
          notification.message,
          new Date(), // Current timestamp
          notification.actionUrl,
          notification.sourceType,
          notification.metadata
        ));

        logger.debug({
          userId,
          notificationType: notification.notificationType,
          sourceType: notification.sourceType,
          sseEmitted: true,
          persisted: shouldPersist
        }, 'Domain event emitted: notification-created (SSE push)');
      } catch (eventError) {
        // Event emission failure shouldn't break notification creation
        // For persistent notifications: SSE is nice-to-have, DB persistence is critical
        // For ephemeral notifications: SSE is critical since there's no DB backup
        const errorMessage = eventError instanceof Error ? eventError.message : 'Unknown error';
        logger.error({
          userId,
          error: errorMessage,
          sourceType: notification.sourceType,
          persisted: shouldPersist
        }, 'Failed to emit notification-created event (SSE push failed)');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ 
        userId,
        error: errorMessage,
        notificationType: notification.notificationType
      }, 'Unexpected error adding notification');
      // No re-throw - fire-and-forget pattern
    }
  }

  // =============================================================================
  // 🔮 POST-MVP: FEATURES ESTRATÉGICOS (COMENTADOS)
  // =============================================================================

  /**
   * TODO: Batch Ephemeral Notifications
   * Agregar método para enviar notificaciones efímeras en batch (múltiples usuarios)
   * Use case: Broadcast de mantenimiento planificado a todos los usuarios afectados
   * 
   * @example
   * async executeBatch(
   *   userIds: string[],
   *   notification: AddNotificationRequest
   * ): Promise<{ success: number; failed: number }> {
   *   const results = await Promise.allSettled(
   *     userIds.map(id => this.execute(id, notification))
   *   );
   *   return {
   *     success: results.filter(r => r.status === 'fulfilled').length,
   *     failed: results.filter(r => r.status === 'rejected').length
   *   };
   * }
   */

  /**
   * TODO: TTL para Notificaciones Efímeras en Redis
   * Si necesitas garantizar entrega de notificaciones efímeras incluso si SSE falla,
   * considera almacenar temporalmente en Redis con TTL de 5 minutos
   * 
   * Flujo:
   * 1. Intenta SSE push
   * 2. Si falla, guarda en Redis con TTL
   * 3. Cuando usuario reconecta, recupera de Redis
   * 4. Después de entrega exitosa o TTL expira, borra de Redis
   * 
   * @example
   * if (!shouldPersist && sseEmitFailed) {
   *   await redisClient.setex(
   *     `ephemeral_notif:${userId}:${Date.now()}`,
   *     300, // 5 minutes TTL
   *     JSON.stringify(notification)
   *   );
   * }
   */

  /**
   * TODO: Rate Limiting para MESSAGING
   * Prevenir spam de mensajes/notificaciones
   * Límite sugerido: 50 mensajes por hora por usuario
   * 
   * @example
   * if (notification.sourceType === 'MESSAGING') {
   *   const rateLimitKey = `msg_rate:${userId}`;
   *   const msgCount = await redisClient.incr(rateLimitKey);
   *   if (msgCount === 1) {
   *     await redisClient.expire(rateLimitKey, 3600); // 1 hour
   *   }
   *   if (msgCount > 50) {
   *     logger.warn({ userId }, 'Message rate limit exceeded');
   *     throw new Error('RATE_LIMIT_EXCEEDED');
   *   }
   * }
   */

  /**
   * TODO: Configuración Dinámica de Tipos Efímeros
   * Permitir configurar qué sourceTypes son efímeros vs persistentes
   * mediante feature flags o config file
   * 
   * @example
   * const EPHEMERAL_SOURCES = ['MESSAGING', 'TYPING_INDICATOR', 'PRESENCE'];
   * const shouldPersist = !EPHEMERAL_SOURCES.includes(notification.sourceType);
   */

  /**
   * TODO: Metrics para Monitoreo
   * Agregar métricas de Prometheus/StatsD para tracking
   * 
   * Métricas sugeridas:
   * - notifications_sent_total{source_type, persisted}
   * - notifications_sse_failures_total{source_type}
   * - notifications_db_failures_total{source_type}
   * - notification_processing_duration_seconds{source_type}
   * 
   * @example
   * metrics.increment('notifications_sent_total', {
   *   source_type: notification.sourceType,
   *   persisted: shouldPersist.toString()
   * });
   */
}
