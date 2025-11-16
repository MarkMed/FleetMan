import { 
  LoginRequest, 
  LoginResponse,
  UserType 
} from '@packages/contracts';
import { logger } from '../../config/logger.config';
import { AuthService } from '../../services/auth.service';
import { UserRepository } from '@packages/persistence';

/**
 * Use Case para autenticar un usuario en el sistema
 * Maneja la lógica de negocio para login de usuarios (Client o Provider)
 * 
 * Flujo de autenticación:
 * 1. Buscar usuario por email
 * 2. Verificar contraseña con hash almacenado
 * 3. Generar tokens JWT (access + refresh)
 * 4. Retornar usuario sanitizado + tokens
 */
export class LoginUserUseCase {
  private userRepository: UserRepository;

  constructor() {
    // Inyectar UserRepository - ya con findByEmail() funcional
    this.userRepository = new UserRepository();
  }

  /**
   * Ejecuta el caso de uso de login de usuario
   * @param request - Credenciales del usuario (email + password)
   * @returns Promise con la respuesta de autenticación exitosa
   */
  async execute(request: LoginRequest): Promise<LoginResponse> {
    logger.info({ email: request.email }, 'Starting user login');

    try {
      // 1. Buscar usuario por email (retorna entidad de dominio)
      const userResult = await this.userRepository.findByEmail(request.email);
      
      if (!userResult.success) {
        logger.warn({ email: request.email }, 'Login failed: User not found');
        // ⚠️ Seguridad: Mensaje genérico para no revelar si el email existe
        throw new Error('Invalid credentials');
      }

      const user = userResult.data; // Ya es una entidad User real

      // Verificar que el usuario pueda hacer login
      if (!user.canPerformAction('login')) {
        logger.warn({ email: request.email, userId: user.id.getValue() }, 'Login failed: User cannot login');
        throw new Error('Invalid credentials'); // Mensaje genérico por seguridad
      }

      // 2. Verificar contraseña usando AuthService (Argon2)
      const isValidPassword = await AuthService.verifyPassword(
        request.password,
        user.getPasswordHash() // Método seguro de la entidad
      );

      if (!isValidPassword) {
        logger.warn({ email: request.email, userId: user.id.getValue() }, 'Login failed: Invalid password');
        // ⚠️ Seguridad: Mismo mensaje para no revelar qué falló
        throw new Error('Invalid credentials');
      }

      // 3. Generar tokens JWT (access + refresh)
      const userData = {
        userId: user.id.getValue(),        // Método de UserId value object
        email: user.email.getValue(),      // Método de Email value object
        type: user.type
      };

      const tokens = AuthService.generateTokenPair(userData);

      logger.info({ 
        userId: user.id.getValue(), 
        email: user.email.getValue(),
        type: user.type 
      }, '🎉 User login successful');

      // 4. Retornar respuesta usando método de dominio (SIN passwordHash)
      const publicData = user.toPublicData();
      return {
        user: {
          ...publicData,
          type: publicData.type as UserType // Cast al tipo de contrato esperado
        },
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        email: request.email 
      }, 'User login failed');
      
      // Re-throw para manejo en controller
      throw error;
    }
  }

  /**
   * Ejecuta verificación adicional de timing para prevenir timing attacks
   * Siempre verifica password aunque el usuario no exista
   * 
   * @private
   * @param password - Password a verificar
   * @param userExists - Si el usuario existe o no
   * @param actualHash - Hash real del usuario (si existe)
   */
  private async performTimingSecureVerification(
    password: string, 
    userExists: boolean, 
    actualHash?: string
  ): Promise<boolean> {
    if (userExists && actualHash) {
      return await AuthService.verifyPassword(password, actualHash);
    } else {
      // Verificar contra hash dummy para mantener mismo tiempo de respuesta
      const dummyHash = '$argon2id$v=19$m=65536,t=3,p=4$dummy$dummy';
      await AuthService.verifyPassword(password, dummyHash);
      return false;
    }
  }
}