import { hashPassword, verifyPassword } from '../utils/auth';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, TokenPayload } from '../utils/jwt';
import { logger } from '../config/logger.config';

/**
 * Datos de usuario para generación de tokens
 */
export interface UserTokenData {
  userId: string;
  email: string;
  type: 'CLIENT' | 'PROVIDER';
}

/**
 * Respuesta completa de autenticación con tokens
 */
export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

/**
 * AuthService - Facade para todas las operaciones de autenticación
 * 
 * Centraliza el uso de utils/auth.ts y utils/jwt.ts
 * Proporciona una interfaz simplificada para los Use Cases
 */
export class AuthService {
  /**
   * Hash una contraseña de forma segura
   * @param password - Contraseña en texto plano
   * @returns Promise con el hash
   */
  static async hashPassword(password: string): Promise<string> {
    logger.debug('Hashing password via AuthService');
    return hashPassword(password);
  }

  /**
   * Verifica una contraseña contra su hash
   * @param password - Contraseña en texto plano
   * @param hashedPassword - Hash almacenado
   * @returns Promise<boolean> - true si coincide
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    logger.debug('Verifying password via AuthService');
    return verifyPassword(password, hashedPassword);
  }

  /**
   * Genera un token de acceso para el usuario
   * @param userData - Datos del usuario
   * @returns Token JWT
   */
  static generateAccessToken(userData: UserTokenData): string {
    logger.debug({ userId: userData.userId }, 'Generating access token via AuthService');
    return generateAccessToken({
      userId: userData.userId,
      email: userData.email,
      type: userData.type,
    });
  }

  /**
   * Genera par de tokens (access + refresh)
   * @param userData - Datos del usuario
   * @returns Objeto con ambos tokens
   */
  static generateTokenPair(userData: UserTokenData): AuthTokenResponse {
    logger.info({ userId: userData.userId }, 'Generating token pair via AuthService');
    
    const accessToken = this.generateAccessToken(userData);
    const refreshToken = generateRefreshToken(userData.userId);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: '1h', // Debe coincidir con configuración en jwt.ts
    };
  }

  /**
   * Verifica un token de acceso
   * @param token - Token a verificar
   * @returns Payload decodificado o null
   */
  static verifyAccessToken(token: string): TokenPayload | null {
    logger.debug('Verifying access token via AuthService');
    return verifyAccessToken(token);
  }
}

// TODO: Extender AuthService con métodos adicionales:
// static async rotateRefreshToken(refreshToken: string): Promise<AuthTokenResponse>
// static async revokeAllTokens(userId: string): Promise<void>
// static async validatePasswordStrength(password: string): Promise<{ isValid: boolean, feedback: string[] }>
// static async checkUserCredentials(email: string, password: string): Promise<UserTokenData | null>
// static async generatePasswordResetToken(userId: string): Promise<string>
// static async verifyPasswordResetToken(token: string): Promise<string | null> // returns userId