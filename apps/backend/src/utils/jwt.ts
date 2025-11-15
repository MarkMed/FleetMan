import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';
import { logger } from '../config/logger.config';

/**
 * Payload estándar para tokens de acceso
 */
export interface TokenPayload {
  userId: string;
  email: string;
  type: 'CLIENT' | 'PROVIDER';
  iat?: number;
  exp?: number;
}

/**
 * Configuración de tokens
 */
const TOKEN_CONFIG = {
  accessToken: {
    expiresIn: '1h',
    algorithm: 'HS256' as const,
  },
  refreshToken: {
    expiresIn: '7d',
    algorithm: 'HS256' as const,
  },
} as const;

/**
 * Genera un token JWT de acceso
 * @param payload - Datos del usuario para el token
 * @returns Token JWT firmado
 */
export function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  try {
    // Usar JWT_SECRET desde config
    const secret = config.jwt.secret;
    
    const token = jwt.sign(
      payload,
      secret,
      {
        expiresIn: TOKEN_CONFIG.accessToken.expiresIn,
        algorithm: TOKEN_CONFIG.accessToken.algorithm,
        issuer: 'fleetman-api',
        audience: 'fleetman-client',
      }
    );
    
    logger.debug({ userId: payload.userId }, 'Access token generated');
    return token;
    
  } catch (error) {
    logger.error({ error, userId: payload.userId }, 'Failed to generate access token');
    throw new Error('Token generation failed');
  }
}

/**
 * Verifica y decodifica un token JWT
 * @param token - Token a verificar
 * @returns Payload decodificado o null si es inválido
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    // Usar JWT_SECRET desde config
    const secret = config.jwt.secret;
    
    const decoded = jwt.verify(token, secret, {
      algorithms: [TOKEN_CONFIG.accessToken.algorithm],
      issuer: 'fleetman-api',
      audience: 'fleetman-client',
    }) as TokenPayload;
    
    logger.debug({ userId: decoded.userId }, 'Access token verified successfully');
    return decoded;
    
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn({ error: error.message }, 'Invalid token provided');
    } else {
      logger.error({ error }, 'Token verification failed');
    }
    return null;
  }
}

/**
 * Genera un refresh token simple (solo userId)
 * @param userId - ID del usuario
 * @returns Refresh token
 */
export function generateRefreshToken(userId: string): string {
  try {
    // Usar JWT_SECRET desde config
    const secret = config.jwt.secret;
    
    const token = jwt.sign(
      { userId, type: 'refresh' },
      secret,
      {
        expiresIn: TOKEN_CONFIG.refreshToken.expiresIn,
        algorithm: TOKEN_CONFIG.refreshToken.algorithm,
        issuer: 'fleetman-api',
      }
    );
    
    logger.debug({ userId }, 'Refresh token generated');
    return token;
    
  } catch (error) {
    logger.error({ error, userId }, 'Failed to generate refresh token');
    throw new Error('Refresh token generation failed');
  }
}

// TODO: Implementar funcionalidades adicionales de JWT:
// export function verifyRefreshToken(token: string): { userId: string } | null
// export function blacklistToken(token: string): Promise<void> // Para logout
// export function generateTokenPair(payload: TokenPayload): { accessToken: string, refreshToken: string }
// export function rotateRefreshToken(oldRefreshToken: string): Promise<{ accessToken: string, refreshToken: string }>
// export function getTokenExpiration(token: string): Date | null