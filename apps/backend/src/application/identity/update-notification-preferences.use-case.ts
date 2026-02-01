import { 
  UpdateNotificationPreferencesRequest, 
  UpdateNotificationPreferencesResponse,
  NotificationPreferencesResponse 
} from '@packages/contracts';
import { UserId } from '@packages/domain';
import { UserRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';

/**
 * Use Case para actualizar preferencias de notificaciones
 * Sprint #15 Task 8.7: Email Notifications Configuration
 * 
 * Funcionalidad:
 * - Permite a usuarios controlar si reciben notificaciones por email
 * - Ownership verificado por authMiddleware (req.user.userId === userId del request)
 * - Opt-out approach: usuarios reciben emails por defecto (true), pueden desactivar
 * 
 * Campos editables:
 * - profile.emailNotifications (boolean, default: true)
 * 
 * Flujo:
 * 1. Validar userId con Value Object UserId
 * 2. Obtener usuario desde repository
 * 3. Actualizar preferencia de email
 * 4. Persistir cambios
 * 5. Retornar preferencias actualizadas
 */
export class UpdateNotificationPreferencesUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Ejecuta la actualización de preferencias de notificaciones
   * 
   * @param userId - ID del usuario a actualizar (debe coincidir con req.user.userId del JWT)
   * @param request - Preferencias validadas por Zod
   * @returns Promise con preferencias actualizadas o error
   */
  async execute(
    userId: string, 
    request: UpdateNotificationPreferencesRequest
  ): Promise<UpdateNotificationPreferencesResponse> {
    logger.info({ 
      userId, 
      emailNotifications: request.emailNotifications 
    }, 'Starting notification preferences update');

    try {
      // 1. Validar userId
      const userIdResult = UserId.create(userId);
      if (!userIdResult.success) {
        logger.warn({ userId }, 'Invalid user ID format');
        throw new Error('Invalid user ID');
      }

      // 2. Obtener usuario existente
      const userResult = await this.userRepository.findById(userIdResult.data);
      if (!userResult.success) {
        logger.warn({ userId }, 'User not found');
        throw new Error('User not found');
      }

      const user = userResult.data;

      // 3. Validar que el usuario esté activo
      if (!user.isActive) {
        logger.warn({ userId }, 'Cannot update preferences for inactive user');
        throw new Error('User account is deactivated');
      }

      // 4. Actualizar preferencias de notificaciones
      // Nota: Como emailNotifications es parte del profile, usamos updateProfile
      const updateResult = user.updateProfile({
        emailNotifications: request.emailNotifications
      });

      if (!updateResult.success) {
        logger.warn({ 
          userId, 
          error: updateResult.error.message 
        }, 'Failed to update notification preferences');
        throw new Error(updateResult.error.message);
      }

      // 5. Persistir cambios en base de datos
      const saveResult = await this.userRepository.save(user);
      if (!saveResult.success) {
        logger.error({ 
          userId, 
          error: saveResult.error.message 
        }, 'Failed to save notification preferences');
        throw new Error('Failed to update notification preferences');
      }

      // 6. Construir respuesta con preferencias actualizadas
      // Nota: save() retorna void, usar el user original (ya actualizado en memoria)
      // Usar null-safety: ?? true asegura default si el campo no existe
      const preferences: NotificationPreferencesResponse = {
        emailNotifications: user.profile?.emailNotifications ?? true
      };

      logger.info({ 
        userId, 
        preferences 
      }, 'Notification preferences updated successfully');

      return {
        success: true,
        message: 'Notification preferences updated successfully',
        preferences
      };

    } catch (error) {
      logger.error({ 
        userId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 'Update notification preferences failed');
      
      throw error;
    }
  }

  /**
   * Obtiene las preferencias actuales de notificaciones
   * 
   * @param userId - ID del usuario
   * @returns Promise con preferencias actuales
   */
  async getPreferences(userId: string): Promise<NotificationPreferencesResponse> {
    logger.info({ userId }, 'Fetching notification preferences');

    try {
      // 1. Validar userId
      const userIdResult = UserId.create(userId);
      if (!userIdResult.success) {
        logger.warn({ userId }, 'Invalid user ID format');
        throw new Error('Invalid user ID');
      }

      // 2. Obtener usuario
      const userResult = await this.userRepository.findById(userIdResult.data);
      if (!userResult.success) {
        logger.warn({ userId }, 'User not found');
        throw new Error('User not found');
      }

      const user = userResult.data;

      // 3. Construir respuesta con null-safety
      // Si emailNotifications es null/undefined, retornar true (default)
      const preferences: NotificationPreferencesResponse = {
        emailNotifications: user.profile?.emailNotifications ?? true
      };

      logger.info({ userId, preferences }, 'Notification preferences fetched successfully');

      return preferences;

    } catch (error) {
      logger.error({ 
        userId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 'Failed to fetch notification preferences');
      
      throw error;
    }
  }
}

// TODO: Campos estratégicos para futuro
// - smsNotifications: boolean (opt-in por costo de SMS)
// - pushNotifications: boolean (notificaciones móviles)
// - emailDigestFrequency: 'none' | 'daily' | 'weekly' | 'monthly'
// - notificationCategories: { maintenance: boolean, messages: boolean, system: boolean }
