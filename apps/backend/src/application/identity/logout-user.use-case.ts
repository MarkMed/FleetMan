import { logger } from '../../config/logger.config';
import { AuthService } from '../../services/auth.service';
import { TokenBlacklistService } from '../../services/token-blacklist.service';

/**
 * LogoutUserUseCase
 * 
 * Maneja la lógica de negocio para logout de usuarios
 * Invalida tokens JWT agregándolos a una lista negra
 * 
 * Flujo de logout:
 * 1. Verificar que el token sea válido (no corrupto)
 * 2. Extraer información del payload (exp, userId)
 * 3. Agregar token a lista negra hasta su expiración
 * 4. Log del evento de seguridad
 */
export class LogoutUserUseCase {
  private tokenBlacklistService = TokenBlacklistService.getInstance();

  constructor() {
    // Service injection podría hacerse aquí si usamos DI container
  }

  /**
   * Ejecuta el caso de uso de logout de usuario
   * @param accessToken - Token JWT a invalidar
   * @returns Promise que se resuelve cuando el logout es exitoso
   */
  async execute(accessToken: string): Promise<void> {
    logger.info('Starting user logout process');

    try {
      // 1. Verificar y extraer payload del token
      const payload = AuthService.verifyAccessToken(accessToken);
      
      if (!payload) {
        logger.warn('Logout attempted with invalid or expired token');
        throw new Error('Invalid token provided for logout');
      }

      // 2. Verificar que el token tenga información de expiración
      if (!payload.exp) {
        logger.warn({ userId: payload.userId }, 'Token missing expiration time');
        throw new Error('Token missing required expiration information');
      }

      // 3. Agregar token a lista negra hasta su expiración natural
      await this.tokenBlacklistService.blacklist(accessToken, payload.exp);

      // 4. Log del evento de seguridad exitoso
      logger.info({ 
        userId: payload.userId,
        tokenExpiry: new Date(payload.exp * 1000).toISOString(),
        logoutTimestamp: new Date().toISOString()
      }, '🔒 User logout successful - token invalidated');

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'User logout failed');
      
      // Re-throw para manejo en controller
      throw error;
    }
  }

  /**
   * Verifica si un token está actualmente en lista negra
   * Útil para middleware de autenticación
   * 
   * @param accessToken - Token a verificar
   * @returns true si el token está invalidado
   */
  async isTokenBlacklisted(accessToken: string): Promise<boolean> {
    try {
      return await this.tokenBlacklistService.isBlacklisted(accessToken);
    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 'Error checking token blacklist status');
      
      // En caso de error, asumir que el token NO está en lista negra
      // Esto evita bloquear usuarios legítimos por errores técnicos
      return false;
    }
  }

  /**
   * Obtiene estadísticas del blacklist para monitoreo
   * (Solo para admin/debugging)
   */
  async getBlacklistStats(): Promise<{
    totalBlacklistedTokens: number;
    tokensExpiring: { in1Hour: number; in1Day: number };
  } | null> {
    try {
      // Solo disponible si el servicio implementa getStats
      const service = this.tokenBlacklistService as any;
      
      if (typeof service.getStats === 'function') {
        return service.getStats();
      }
      
      return null;
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 
        'Error getting blacklist stats');
      return null;
    }
  }
}