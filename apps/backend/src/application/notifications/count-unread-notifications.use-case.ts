import { UserId } from '@packages/domain';
import { UserRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';

/**
 * Use Case: Count Unread Notifications
 * 
 * Responsabilidades:
 * 1. Validar formato de userId
 * 2. Contar notificaciones no vistas del usuario
 * 3. Retornar conteo para badge UI
 * 
 * Uso:
 * - Frontend polling cada 30s para actualizar badge
 * - Endpoint lightweight sin paginación
 * - Usado en navbar/header para mostrar contador
 * 
 * Sprint #9 - Sistema de Notificaciones
 */
export class CountUnreadNotificationsUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Ejecuta el caso de uso de contar notificaciones no vistas
   * 
   * @param userId - ID del usuario
   * @returns Promise<number> - Cantidad de notificaciones no vistas
   * @throws Error si userId inválido o usuario no existe
   */
  async execute(userId: string): Promise<number> {
    logger.debug({ userId }, 'Counting unread notifications');

    try {
      // 1. Validar formato de userId
      const userIdResult = UserId.create(userId);
      if (!userIdResult.success) {
        throw new Error(`Invalid user ID format: ${userIdResult.error.message}`);
      }

      // 2. Contar notificaciones no vistas desde repositorio
      const countResult = await this.userRepository.countUnreadNotifications(
        userIdResult.data
      );

      if (!countResult.success) {
        // Mapear errores de dominio a mensajes HTTP-friendly
        const error = countResult.error;
        
        if (error.message.includes('not found')) {
          throw new Error(`User with ID ${userId} not found`);
        }
        
        throw new Error(error.message);
      }

      const unreadCount = countResult.data;

      logger.debug({ 
        userId,
        unreadCount
      }, 'Unread notifications counted');

      return unreadCount;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ 
        userId,
        error: errorMessage
      }, 'Failed to count unread notifications');
      
      throw error;
    }
  }
}
