import { UserId } from '@packages/domain';
import { UserRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import type { GetNotificationsQuery } from '@packages/contracts';
import type { IGetNotificationsResult } from '@packages/domain';

/**
 * Use Case: Get User Notifications
 * 
 * Responsabilidades:
 * 1. Validar formato de userId
 * 2. Aplicar filtros y paginación
 * 3. Retornar notificaciones del usuario con metadata de paginación
 * 
 * Filtros soportados:
 * - onlyUnread: Filtra solo notificaciones no vistas
 * - page: Página actual (default: 1)
 * - limit: Cantidad por página (default: 20, max: 100)
 * 
 * Sprint #9 - Sistema de Notificaciones
 */
export class GetUserNotificationsUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Ejecuta el caso de uso de obtener notificaciones
   * 
   * @param userId - ID del usuario
   * @param filters - Filtros y opciones de paginación (validados por Zod)
   * @returns Promise con notificaciones paginadas y metadata
   * @throws Error si userId inválido o usuario no existe
   */
  async execute(
    userId: string,
    filters: GetNotificationsQuery
  ): Promise<IGetNotificationsResult> {
    logger.info({ 
      userId,
      filters 
    }, 'Getting user notifications');

    try {
      // 1. Validar formato de userId
      const userIdResult = UserId.create(userId);
      if (!userIdResult.success) {
        throw new Error(`Invalid user ID format: ${userIdResult.error.message}`);
      }

      // 2. Obtener notificaciones desde repositorio con filtros
      const getResult = await this.userRepository.getUserNotifications(
        userIdResult.data,
        {
          onlyUnread: filters.onlyUnread,
          page: filters.page,
          limit: filters.limit
        }
      );

      if (!getResult.success) {
        // Mapear errores de dominio a mensajes HTTP-friendly
        const error = getResult.error;
        
        if (error.message.includes('not found')) {
          throw new Error(`User with ID ${userId} not found`);
        }
        
        throw new Error(error.message);
      }

      const result = getResult.data;

      logger.info({ 
        userId,
        totalNotifications: result.total,
        returnedCount: result.notifications.length,
        page: result.page
      }, 'Notifications retrieved successfully');

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ 
        userId,
        filters,
        error: errorMessage
      }, 'Failed to get user notifications');
      
      throw error;
    }
  }
}
