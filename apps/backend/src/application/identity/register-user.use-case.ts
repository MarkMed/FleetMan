import { 
  CreateUserRequest, 
  RegisterResponse,
  UserType 
} from '@packages/contracts';
import { logger } from '../../config/logger.config';
import { AuthService } from '../../services/auth.service';
import { UserRepository } from '@packages/persistence';

/**
 * Use Case para registrar un nuevo usuario en el sistema
 * Maneja la lógica de negocio para crear usuarios (Client o Provider)
 * 
 * TODO: Conectar con UserRepository una vez que esté completamente configurado
 */
export class RegisterUserUseCase {
  private userRepository: UserRepository;

  constructor() {
    // Inyectar UserRepository real - ¡Adiós mocks! 🚀
    this.userRepository = new UserRepository();
  }
  /**
   * Ejecuta el caso de uso de registro de usuario
   * @param request - Datos del usuario a registrar
   * @returns Promise con la respuesta del usuario creado + tokens para auto-login
   */
  async execute(request: CreateUserRequest): Promise<RegisterResponse> {
    logger.info({ email: request.email, type: request.type }, 'Starting user registration');

    try {
      // 1. Verificar si el email ya existe en la base de datos
      const emailExists = await this.userRepository.emailExists(request.email);
      
      if (emailExists) {
        logger.warn({ email: request.email }, 'User registration failed: Email already exists');
        throw new Error('Email already registered');
      }
      
      // 2. Hash de la contraseña usando AuthService
      const hashedPassword = await AuthService.hashPassword(request.password);

      // 3. Validaciones de negocio específicas por tipo de usuario
      this.validateBusinessRules(request);

      // 4. Crear usuario en la base de datos
      const createResult = await this.userRepository.create({
        email: request.email,
        passwordHash: hashedPassword,
        profile: request.profile,
        type: request.type,
      });

      if (!createResult.success) {
        logger.error({ error: createResult.error }, 'Failed to create user in database');
        throw new Error('Failed to create user');
      }

      const savedUser = createResult.data;

      // 5. Generar tokens para auto-login
      const { accessToken, refreshToken } = await AuthService.generateTokenPair({
        userId: savedUser.id,
        email: savedUser.email,
        type: savedUser.type as UserType
      });

      logger.info({ 
        userId: savedUser.id, 
        email: savedUser.email,
        type: savedUser.type,
        hasTokens: !!(accessToken && refreshToken)
      }, '🎉 User registered successfully with auto-login tokens!');

      // 6. Retornar respuesta completa con tokens para auto-login
      return {
        user: {
          id: savedUser.id,
          email: savedUser.email,
          profile: savedUser.profile,
          type: savedUser.type as UserType,
          isActive: savedUser.isActive,
          createdAt: savedUser.createdAt,
          updatedAt: savedUser.updatedAt,
        },
        token: accessToken,
        refreshToken: refreshToken
      };

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        email: request.email,
        type: request.type 
      }, 'User registration failed');
      
      throw error;
    }
  }

  /**
   * Valida reglas de negocio específicas según el tipo de usuario
   * @param request - Datos del usuario a validar
   */
  private validateBusinessRules(request: CreateUserRequest): void {
	const disableThis = false;
    // Validación específica para Providers: deben tener companyName
    if (request.type === UserType.PROVIDER) {
      if (!request.profile.companyName || request.profile.companyName.trim().length === 0) {
        throw new Error('Company name is required for Provider users');
      }
    }

    // Validación de email de dominio empresarial para Providers (opcional)
    if (disableThis && (request.type === UserType.PROVIDER)) {
      const emailDomain = request.email.split('@')[1];
      const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
      
      if (personalDomains.includes(emailDomain.toLowerCase())) {
        logger.warn({ 
          email: request.email, 
          domain: emailDomain 
        }, 'Provider using personal email domain');
        // No throw error, solo warning
      }
    }

    // Validación de longitud de campos
    if (request.profile.phone && request.profile.phone.length > 20) {
      throw new Error('Phone number is too long');
    }

    if (request.profile.address && request.profile.address.length > 200) {
      throw new Error('Address is too long');
    }

    // TODO: Agregar más validaciones de negocio según necesidades:
    // - Validar formato de teléfono con regex
    // - Políticas de contraseñas más estrictas
    // - Verificación de empresas para Providers
    // - Límites de usuarios por empresa
  }
}