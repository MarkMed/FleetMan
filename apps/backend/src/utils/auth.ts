import * as argon2 from 'argon2';
import { logger } from '../config/logger.config';

/**
 * Configuración estándar para Argon2
 * Balanceado entre seguridad y performance
 */
const ARGON2_CONFIG = {
  memoryCost: 65536, // 64MB
  timeCost: 3,       // 3 iteraciones
  parallelism: 4,    // 4 threads
} as const;

/**
 * Hash una contraseña usando Argon2id
 * @param password - Contraseña en texto plano
 * @returns Promise con el hash de la contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await argon2.hash(password, ARGON2_CONFIG);
    
    logger.debug('Password hashed successfully');
    return hash;
    
  } catch (error) {
    logger.error({ error }, 'Failed to hash password');
    throw new Error('Password hashing failed');
  }
}

/**
 * Verifica una contraseña contra su hash
 * @param password - Contraseña en texto plano
 * @param hashedPassword - Hash almacenado
 * @returns Promise<boolean> - true si coincide
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const isValid = await argon2.verify(hashedPassword, password);
    
    logger.debug({ isValid }, 'Password verification completed');
    return isValid;
    
  } catch (error) {
    logger.error({ error }, 'Password verification failed');
    return false; // Fallo silencioso por seguridad
  }
}

// TODO: Implementar funciones adicionales de seguridad:
// export function validatePasswordStrength(password: string): { isValid: boolean, feedback: string[] }
// export function generateSecureRandomPassword(length: number): string
// export function checkPasswordHistory(userId: string, newPasswordHash: string): Promise<boolean>
// export function rateLimitPasswordAttempts(identifier: string): Promise<boolean>