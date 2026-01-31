import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { IUserRepository } from '@packages/domain';
import { UserRepository } from '@packages/persistence';
import { config } from '../../config/env.config';

/**
 * Request DTO para ResetPasswordUseCase
 * Sprint #15 - Task 2.4: Password Recovery Flow
 */
export interface ResetPasswordRequest {
  token: string;       // Token JWT del link de reset
  newPassword: string; // Nueva contraseña en texto plano (se hasheará)
}

/**
 * Response DTO para ResetPasswordUseCase
 * Sprint #15 - Task 2.4: Password Recovery Flow
 */
export interface ResetPasswordResponse {
  message: string; // Mensaje de confirmación
}

/**
 * Use Case: Reset Password
 * Sprint #15 - Task 2.4: Password Recovery Flow
 * 
 * Responsabilidades:
 * 1. Validar token JWT (firma + expiración)
 * 2. Buscar usuario por token en DB (verificar que existe y no expiró)
 * 3. Hashear nueva contraseña con Argon2
 * 4. Actualizar password del usuario
 * 5. Limpiar token de reset
 * 6. Guardar cambios en DB
 * 7. Retornar confirmación
 * 
 * Security Considerations:
 * - Token JWT con firma verificable
 * - Token expira en 1 hora (controlado por JWT + DB)
 * - Password hasheado con Argon2 (mejor que bcrypt para nuevos passwords)
 * - Token se limpia después de usar (one-time use)
 * - Validaciones de password strength en controller (via Zod)
 * 
 * Error Handling:
 * - Token inválido o expirado → error específico
 * - Usuario no existe → error específico
 * - Fallo al hashear/guardar → error de sistema
 * 
 * @example
 * ```typescript
 * const useCase = new ResetPasswordUseCase();
 * const result = await useCase.execute({
 *   token: 'eyJhbGciOiJIUzI1NiIs...',
 *   newPassword: 'MyNewSecurePass123!'
 * });
 * 
 * console.log(result.message); // "Contraseña actualizada exitosamente"
 * ```
 */
export class ResetPasswordUseCase {
  private userRepository: IUserRepository;

  constructor() {
    // Inicializar dependencias (sin DI container)
    this.userRepository = new UserRepository();
  }

  /**
   * Ejecuta el caso de uso de reset password
   * 
   * @param request - Request DTO con token y nueva contraseña
   * @returns ResetPasswordResponse - Mensaje de confirmación
   * @throws Error - Si el token es inválido o expiró
   */
  async execute(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const { token, newPassword } = request;

    // 1. Validar token JWT (firma + expiración)
    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, config.jwt.secret);
      
      // Verificar claim personalizado (debe ser password-reset)
      if (decodedToken.purpose !== 'password-reset') {
        throw new Error('Invalid token purpose');
      }
    } catch (error) {
      throw new Error('El enlace de restablecimiento es inválido o ha expirado');
    }

    // 2. Buscar usuario por token en DB (verificar que existe y no expiró en DB también)
    const userResult = await this.userRepository.findByResetToken(token);
    
    if (!userResult.success) {
      throw new Error('El enlace de restablecimiento es inválido o ha expirado');
    }

    const user = userResult.data;

    // 3. Verificar que el usuario esté activo
    if (!user.isActive) {
      throw new Error('Esta cuenta está desactivada');
    }

    // 4. Hashear nueva contraseña con Argon2 (algoritmo recomendado por OWASP)
    let passwordHash: string;
    try {
      passwordHash = await argon2.hash(newPassword, {
        type: argon2.argon2id, // Argon2id (híbrido - balance entre security y performance)
        memoryCost: 65536,     // 64 MB
        timeCost: 3,           // 3 iteraciones
        parallelism: 4         // 4 threads paralelos
      });
    } catch (error) {
      console.error('Failed to hash password:', error);
      throw new Error('Error al procesar la contraseña');
    }

    // 5. Actualizar password del usuario (método de dominio)
    const updateResult = user.updatePasswordHash(passwordHash);
    
    if (!updateResult.success) {
      throw new Error('Error al actualizar la contraseña');
    }

    // 6. Limpiar token de reset (seguridad: one-time use)
    const clearResult = user.clearPasswordResetToken();
    
    if (!clearResult.success) {
      console.error('Failed to clear reset token:', clearResult.error);
      // Continuar de todos modos (no crítico)
    }

    // 7. Guardar cambios en DB
    const saveResult = await this.userRepository.save(user);
    
    if (!saveResult.success) {
      console.error('Failed to save user after password reset:', saveResult.error);
      throw new Error('Error al guardar los cambios');
    }

    // 8. Retornar confirmación
    return {
      message: 'Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
    };
  }

  // TODO: Método estratégico - Invalidar todos los tokens activos del usuario
  // Útil si el usuario sospecha que su cuenta fue comprometida
  // async revokeAllResetTokens(userId: UserId): Promise<Result<void, DomainError>> {
  //   return this.userRepository.clearResetToken(userId);
  // }

  // TODO: Método estratégico - Historial de cambios de contraseña
  // Guardar timestamp de último cambio para auditoría
  // async recordPasswordChange(userId: UserId): Promise<void> {
  //   await UserModel.updateOne(
  //     { _id: userId.getValue() },
  //     { $set: { lastPasswordChangeAt: new Date() } }
  //   );
  // }

  // TODO: Método estratégico - Notificar por email del cambio de contraseña
  // Security best practice: alertar al usuario de cambios críticos
  // async notifyPasswordChanged(user: User): Promise<void> {
  //   await this.emailService.sendPasswordChangedEmail({
  //     to: user.email.getValue(),
  //     userName: user.getDisplayName(),
  //     timestamp: new Date()
  //   });
  // }
}
