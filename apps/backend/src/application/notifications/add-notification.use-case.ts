import { UserId } from '@packages/domain';
import { UserRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import type { AddNotificationRequest } from '@packages/contracts';

/**
 * Use Case: Add Notification to User
 * 
 * Responsabilidades:
 * 1. Validar formato de userId
 * 2. Delegar creación de notificación al repositorio
 * 3. Log de errores sin bloquear operación principal
 * 
 * Patrón de uso:
 * - Este use case es INTERNO, llamado por otros features (QuickCheck, Events, Maintenance)
 * - Fire-and-forget: errores se loggean pero no se propagan
 * - No expuesto en REST API directamente
 * 
 * Sprint #9 - Sistema de Notificaciones
 */
export class AddNotificationUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Ejecuta el caso de uso de agregar notificación
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

      // 2. Agregar notificación usando repositorio
      const addResult = await this.userRepository.addNotification(
        userIdResult.data,
        {
          notificationType: notification.notificationType,
          message: notification.message,
          actionUrl: notification.actionUrl,
          sourceType: notification.sourceType
        }
      );

      if (!addResult.success) {
        logger.error({ 
          userId,
          error: addResult.error.message,
          notificationType: notification.notificationType
        }, 'Failed to add notification');
        return; // Silent fail
      }

      logger.info({ 
        userId,
        notificationType: notification.notificationType,
        sourceType: notification.sourceType
      }, 'Notification added successfully');

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
}
