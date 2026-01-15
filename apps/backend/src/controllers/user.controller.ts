import { Request, Response } from 'express';
import { UpdateUserProfileUseCase } from '../application/identity/update-user-profile.use-case';
import { logger } from '../config/logger.config';

/**
 * Interface para Request autenticado (viene de authMiddleware)
 */
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    type: string;
    iat: number;
    exp: number;
  };
}

/**
 * User Controller
 * Sprint #13 Tasks 10.1 + 10.2: User Profile Editing + Bio & Tags
 * 
 * Endpoints:
 * - PATCH /users/me/profile - Actualizar perfil propio (requiere auth)
 * 
 * TODO: Futuras funcionalidades (Sprint #13+)
 * - GET /users/me/profile - Obtener perfil propio
 * - GET /users/:userId/public - Ver perfil público de otro usuario
 * - PATCH /users/me/avatar - Subir avatar (Task 10.3)
 * - GET /users/suggestions - Buscar usuarios por tags
 */
export class UserController {
  private updateUserProfileUseCase: UpdateUserProfileUseCase;

  constructor() {
    this.updateUserProfileUseCase = new UpdateUserProfileUseCase();
  }

  /**
   * PATCH /users/me/profile
   * Actualiza el perfil del usuario autenticado
   * 
   * Ownership: authMiddleware garantiza que req.user.userId es el usuario autenticado
   * Solo el usuario puede editar su propio perfil (/me endpoint pattern)
   * 
   * Request Body (validado por Zod middleware):
   * {
   *   profile?: {
   *     phone?: string,
   *     companyName?: string,
   *     address?: string,
   *     bio?: string,
   *     tags?: string[]
   *   }
   * }
   * 
   * Responses:
   * - 200: Perfil actualizado exitosamente
   * - 400: Validación fallida (Zod o domain rules)
   * - 401: No autenticado (authMiddleware)
   * - 404: Usuario no encontrado
   * - 500: Error interno
   */
  public updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // authMiddleware garantiza que req.user existe
      if (!req.user) {
        logger.error({ path: req.path }, 'Authenticated request missing user data');
        res.status(500).json({
          success: false,
          message: 'Internal authentication error',
          error: 'MISSING_USER_DATA'
        });
        return;
      }

      const userId = req.user.userId;
      // Extraer solo profile del body (ignorar campo id que viene por Zod pero no se usa)
      const { profile } = req.body;

      logger.info({ 
        userId, 
        updateFields: Object.keys(profile || {}),
        ip: req.ip 
      }, 'User profile update request received');

      // Ejecutar use case con solo el profile field
      const updatedUser = await this.updateUserProfileUseCase.execute(userId, { profile });

      logger.info({ userId }, 'User profile updated successfully');

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({
        error: errorMessage,
        userId: req.user?.userId,
        path: req.path
      }, 'User profile update failed');

      // Mapear errores a códigos HTTP apropiados
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        });
        return;
      }

      if (errorMessage.includes('Invalid') || errorMessage.includes('validation')) {
        res.status(400).json({
          success: false,
          message: errorMessage,
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      if (errorMessage.includes('deactivated')) {
        res.status(403).json({
          success: false,
          message: 'Cannot update deactivated user profile',
          error: 'USER_DEACTIVATED'
        });
        return;
      }

      // Error genérico
      res.status(500).json({
        success: false,
        message: 'Failed to update user profile',
        error: 'UPDATE_FAILED'
      });
    }
  };

  // TODO: Futuros endpoints
  // 
  // /**
  //  * GET /users/me/profile
  //  * Obtiene el perfil completo del usuario autenticado
  //  */
  // public getMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  //   // Implementation...
  // };
  //
  // /**
  //  * GET /users/:userId/public
  //  * Obtiene el perfil público de otro usuario (para User Discovery)
  //  * Excluye información sensible: email, phone, notifications
  //  */
  // public getPublicProfile = async (req: Request, res: Response): Promise<void> => {
  //   // Implementation...
  // };
}
