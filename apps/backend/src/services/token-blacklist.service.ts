/**
 * Token Blacklist Service
 * Gestiona la invalidación de tokens JWT para logout seguro
 * 
 * Estrategia:
 * - Tokens inválidos se almacenan en lista negra hasta su expiración natural
 * - Usa Redis para performance (memoria) y TTL automático
 * - Fallback a memoria si Redis no está disponible
 */

import { logger } from '../config/logger.config';

/**
 * Interface para el servicio de blacklist de tokens
 * Permite diferentes implementaciones (Redis, memoria, etc.)
 */
export interface ITokenBlacklistService {
  blacklist(token: string, expiration: number): Promise<void>;
  isBlacklisted(token: string): Promise<boolean>;
  cleanup(): Promise<void>;
}

/**
 * Implementación en memoria del Token Blacklist
 * Para desarrollo y como fallback cuando Redis no está disponible
 */
export class MemoryTokenBlacklistService implements ITokenBlacklistService {
  private blacklistedTokens = new Map<string, number>(); // token -> expiration timestamp
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup automático cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
    
    logger.info('MemoryTokenBlacklistService initialized with auto-cleanup');
  }

  /**
   * Agrega un token a la lista negra
   * @param token - Token JWT a invalidar
   * @param expiration - Timestamp de expiración del token
   */
  async blacklist(token: string, expiration: number): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    
    // Solo agregar si el token no está ya expirado
    if (expiration > now) {
      this.blacklistedTokens.set(token, expiration);
      logger.info({ 
        tokenExpiry: expiration, 
        currentTime: now,
        ttlSeconds: expiration - now 
      }, 'Token added to blacklist');
    } else {
      logger.debug('Token already expired, not adding to blacklist');
    }
  }

  /**
   * Verifica si un token está en lista negra
   * @param token - Token JWT a verificar
   * @returns true si está en lista negra
   */
  async isBlacklisted(token: string): Promise<boolean> {
    const expiration = this.blacklistedTokens.get(token);
    
    if (!expiration) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    
    // Si el token expiró naturalmente, removerlo de la lista
    if (expiration <= now) {
      this.blacklistedTokens.delete(token);
      return false;
    }

    return true;
  }

  /**
   * Limpia tokens expirados de la memoria
   */
  async cleanup(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const initialSize = this.blacklistedTokens.size;
    
    for (const [token, expiration] of this.blacklistedTokens.entries()) {
      if (expiration <= now) {
        this.blacklistedTokens.delete(token);
      }
    }

    const finalSize = this.blacklistedTokens.size;
    const removed = initialSize - finalSize;
    
    if (removed > 0) {
      logger.debug({ 
        tokensRemoved: removed, 
        remainingTokens: finalSize 
      }, 'Token blacklist cleanup completed');
    }
  }

  /**
   * Destructor para limpieza de recursos
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.blacklistedTokens.clear();
    logger.info('MemoryTokenBlacklistService destroyed');
  }

  /**
   * Obtiene estadísticas de la blacklist
   */
  getStats(): {
    totalBlacklistedTokens: number;
    tokensExpiring: { in1Hour: number; in1Day: number };
  } {
    const now = Math.floor(Date.now() / 1000);
    const in1Hour = now + (60 * 60);
    const in1Day = now + (24 * 60 * 60);

    let expiring1Hour = 0;
    let expiring1Day = 0;

    for (const expiration of this.blacklistedTokens.values()) {
      if (expiration <= in1Hour) {
        expiring1Hour++;
      } else if (expiration <= in1Day) {
        expiring1Day++;
      }
    }

    return {
      totalBlacklistedTokens: this.blacklistedTokens.size,
      tokensExpiring: {
        in1Hour: expiring1Hour,
        in1Day: expiring1Day
      }
    };
  }
}

/**
 * Singleton del servicio de blacklist
 * Por ahora usa implementación en memoria
 * TODO: Cambiar a Redis en producción
 */
export class TokenBlacklistService {
  private static instance: ITokenBlacklistService;

  public static getInstance(): ITokenBlacklistService {
    if (!TokenBlacklistService.instance) {
      // Por ahora usar implementación en memoria
      // En el futuro, detectar si Redis está disponible y usar RedisTokenBlacklistService
      TokenBlacklistService.instance = new MemoryTokenBlacklistService();
      logger.info('TokenBlacklistService singleton created with Memory implementation');
    }
    
    return TokenBlacklistService.instance;
  }

  /**
   * Permite cambiar la implementación en runtime (para testing)
   */
  public static setInstance(instance: ITokenBlacklistService): void {
    TokenBlacklistService.instance = instance;
  }
}