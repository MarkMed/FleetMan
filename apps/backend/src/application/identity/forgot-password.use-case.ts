import jwt from 'jsonwebtoken';
import path from 'path';
import { IUserRepository } from '@packages/domain';
import { UserRepository } from '@packages/persistence';
import { NodemailerTransport, EmailTemplateService, EmailService } from '@packages/infra';
import { config } from '../../config/env.config';

/**
 * Request DTO para ForgotPasswordUseCase
 * Sprint #15 - Task 2.4: Password Recovery Flow
 */
export interface ForgotPasswordRequest {
  email: string; // Email del usuario que solicita el reset
}

/**
 * Response DTO para ForgotPasswordUseCase
 * Sprint #15 - Task 2.4: Password Recovery Flow
 */
export interface ForgotPasswordResponse {
  message: string; // Mensaje de confirmación genérico (security best practice)
  // NOTE: No exponemos detalles sensibles:
  // - No confirmamos si el email existe o no (evita email enumeration)
  // - No retornamos el token (solo se envía por email)
}

/**
 * Use Case: Forgot Password
 * Sprint #15 - Task 2.4: Password Recovery Flow
 * 
 * Responsabilidades:
 * 1. Buscar usuario por email
 * 2. Generar token JWT de reset (válido 1 hora)
 * 3. Guardar token en DB con fecha de expiración
 * 4. Enviar email con link de reset
 * 5. Retornar mensaje genérico (security: no revelar si el email existe)
 * 
 * Security Considerations:
 * - Mensaje genérico incluso si el email no existe (evita email enumeration attacks)
 * - Token JWT con expiración corta (1 hora)
 * - Token se guarda hasheado en DB? NO - usar JWT firmado es suficiente
 * - Rate limiting aplicado en controller (evita brute force)
 * 
 * @example
 * ```typescript
 * const useCase = new ForgotPasswordUseCase();
 * const result = await useCase.execute({ email: 'user@example.com' });
 * 
 * // Siempre retorna success con mensaje genérico (security)
 * console.log(result.message); // "Si el email existe, recibirás un link de reset"
 * ```
 */
export class ForgotPasswordUseCase {
  private userRepository: IUserRepository;
  private emailService: EmailService;

  constructor() {
    // Inicializar dependencias (sin DI container)
    this.userRepository = new UserRepository();

    // Inicializar email infrastructure
    const emailTransport = new NodemailerTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: config.email.smtp.secure,
      auth: {
        user: config.email.smtp.auth.user,
        pass: config.email.smtp.auth.pass
      },
      from: config.email.from
    });

    const templatesPath = path.join(__dirname, '../../templates');
    const templateService = new EmailTemplateService(templatesPath);

    this.emailService = new EmailService(emailTransport, templateService);
  }

  /**
   * Ejecuta el caso de uso de forgot password
   * 
   * @param request - Request DTO con email del usuario
   * @returns ForgotPasswordResponse - Mensaje genérico de confirmación
   * @throws Error - Solo si hay fallo crítico de infraestructura
   */
  async execute(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    try {
      const { email } = request;

      // 1. Buscar usuario por email
      const userResult = await this.userRepository.findByEmail(email);

      // Security: Mensaje genérico incluso si el usuario no existe
      // Esto evita email enumeration attacks (no revelar si el email está registrado)
      if (!userResult.success) {
        return {
          message: 'Si el email está registrado, recibirás un enlace para restablecer tu contraseña'
        };
      }

      const user = userResult.data;

      // Verificar que el usuario esté activo
      if (!user.isActive) {
        // Security: Mensaje genérico (no revelar que la cuenta está desactivada)
        return {
          message: 'Si el email está registrado, recibirás un enlace para restablecer tu contraseña'
        };
      }

      // 2. Generar token JWT de reset (válido 1 hora)
      const resetToken = jwt.sign(
        {
          userId: user.id.getValue(),
          email: user.email.getValue(),
          purpose: 'password-reset' // Claim personalizado para verificar uso
        },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      // 3. Calcular fecha de expiración y guardar token en DB
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hora desde ahora

      const saveResult = await this.userRepository.saveResetToken(
        user.id,
        resetToken,
        expiresAt
      );

      if (!saveResult.success) {
        console.error('Failed to save reset token:', saveResult.error);
        // Continuar de todos modos (silent fail - mejor UX)
      }

      // 4. Construir link de reset con token
      const resetLink = `${config.app.baseUrl}/reset-password/${resetToken}`;

      // 5. Enviar email con link de reset
      const emailResult = await this.emailService.sendPasswordResetEmail({
        to: user.email.getValue(),
        userName: user.getDisplayName(),
        resetLink
      });

      if (!emailResult.success) {
        console.error('Failed to send password reset email:', emailResult.error);
        // Security: No revelar error de envío al usuario
        // TODO: Agregar retry queue para emails fallidos
      }

      // 6. Retornar mensaje genérico de confirmación
      return {
        message: 'Si el email está registrado, recibirás un enlace para restablecer tu contraseña'
      };
    } catch (error) {
      // Log error interno pero retornar mensaje genérico (security)
      console.error('Forgot password use case error:', error);
      
      return {
        message: 'Si el email está registrado, recibirás un enlace para restablecer tu contraseña'
      };
    }
  }

  // TODO: Método estratégico - Verificar si token es válido sin consumirlo
  // async validateResetToken(token: string): Promise<boolean> {
  //   try {
  //     // Verificar firma JWT
  //     jwt.verify(token, config.jwt.secret);
  //     
  //     // Verificar que existe en DB y no ha expirado
  //     const userResult = await this.userRepository.findByResetToken(token);
  //     return userResult.success;
  //   } catch (error) {
  //     return false;
  //   }
  // }
}
