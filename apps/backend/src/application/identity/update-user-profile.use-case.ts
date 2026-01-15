import { UpdateUserRequest } from '@packages/contracts';
import { UserId } from '@packages/domain';
import { UserRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';

/**
 * Use Case para actualizar el perfil de un usuario
 * Sprint #13 Tasks 10.1 + 10.2: User Profile Editing + Bio & Tags
 * 
 * Funcionalidad:
 * - Permite a usuarios editar su propio perfil (phone, companyName, address, bio, tags)
 * - Ownership verificado por authMiddleware (req.user.userId === userId del request)
 * - Validaciones en múltiples capas: Zod (contracts) → Entity (domain) → Mongoose (persistence)
 * 
 * Campos editables:
 * - profile.phone (opcional)
 * - profile.companyName (opcional)
 * - profile.address (opcional)
 * - profile.bio (opcional, max 500 chars)
 * - profile.tags (opcional, max 5 tags, cada uno max 100 chars)
 * 
 * Campos NO editables (excluidos de este use case):
 * - email (requiere verificación separada)
 * - isActive (solo admins)
 * - subscriptionLevel / serviceAreas (específicos de tipo, funcionalidad futura)
 */
export class UpdateUserProfileUseCase {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Ejecuta la actualización del perfil del usuario
   * 
   * @param userId - ID del usuario a actualizar (debe coincidir con req.user.userId del JWT)
   * @param request - Datos de actualización validados por Zod
   * @returns Promise con datos del usuario actualizado o error
   * 
   * Flujo:
   * 1. Validar userId con Value Object UserId
   * 2. Obtener entidad User desde repository
   * 3. Aplicar cambios usando entity.updateProfile() (valida reglas de dominio)
   * 4. Persistir usando repository.save() (convierte entity → document y actualiza DB)
   * 5. Retornar usuario actualizado en formato público
   */
  async execute(userId: string, request: UpdateUserRequest): Promise<{
    id: string;
    email: string;
    profile: any;
    type: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }> {
    logger.info({ userId, updateFields: Object.keys(request.profile || {}) }, 'Starting user profile update');

    try {
      // 1. Validar userId
      const userIdResult = UserId.create(userId);
      if (!userIdResult.success) {
        logger.warn({ userId }, 'Invalid user ID format');
        throw new Error('Invalid user ID');
      }

      // 2. Obtener entidad User existente
      const userResult = await this.userRepository.findById(userIdResult.data);
      if (!userResult.success) {
        logger.warn({ userId }, 'User not found');
        throw new Error('User not found');
      }

      const user = userResult.data;

      // 3. Validar que el usuario esté activo (regla de negocio)
      if (!user.isActive) {
        logger.warn({ userId }, 'Cannot update inactive user profile');
        throw new Error('User account is deactivated');
      }

      // 4. Aplicar actualizaciones de perfil usando método de entidad
      // updateProfile() valida reglas de dominio (longitudes, formatos, etc.)
      if (request.profile) {
        const updateResult = user.updateProfile(request.profile);
        if (!updateResult.success) {
          logger.warn({ 
            userId, 
            error: updateResult.error.message 
          }, 'Profile validation failed');
          throw new Error(updateResult.error.message);
        }
      }

      // TODO: Futuro - Manejar actualización de isActive solo para admins
      // if (request.isActive !== undefined && requestingUserRole === 'ADMIN') {
      //   if (request.isActive) user.reactivate();
      //   else user.deactivate();
      // }

      // 5. Persistir cambios en base de datos
      const saveResult = await this.userRepository.save(user);
      if (!saveResult.success) {
        logger.error({ 
          userId, 
          error: saveResult.error.message 
        }, 'Failed to save user profile updates');
        throw new Error('Failed to update user profile');
      }

      logger.info({ 
        userId, 
        updatedFields: Object.keys(request.profile || {}),
        hasBio: !!request.profile?.bio,
        tagsCount: request.profile?.tags?.length || 0
      }, '✅ User profile updated successfully');

      // 6. Retornar datos actualizados en formato público
      return {
        id: user.id.getValue(),
        email: user.email.getValue(),
        profile: user.profile,
        type: user.type,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      };

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId 
      }, 'User profile update failed');
      
      throw error;
    }
  }
}
