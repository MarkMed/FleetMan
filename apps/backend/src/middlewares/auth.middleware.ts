import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { LogoutUserUseCase } from '../application/identity/logout-user.use-case';
import { logger } from '../config/logger.config';

/**
 * Interface extendida de Request para incluir información del usuario autenticado
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
 * Middleware de autenticación con verificación de blacklist
 * 
 * Funciones:
 * 1. Extraer y validar token JWT del header Authorization
 * 2. Verificar que el token no esté en lista negra (logout)
 * 3. Agregar información del usuario al request para siguientes middlewares
 * 4. Manejar errores de autenticación de manera consistente
 * 
 * Uso:
 * - router.get('/protected', authMiddleware, controller.method)
 * - Solo permite requests con tokens válidos y no invalidados
 */
export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn({ 
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        path: req.path 
      }, 'Unauthorized access attempt - missing token');
      
      res.status(401).json({
        success: false,
        message: 'Access denied. Token required.',
        error: 'MISSING_TOKEN'
      });
      return;
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // 2. Verificar que el token no esté en lista negra
    const logoutUseCase = new LogoutUserUseCase(); // TODO: Usar DI container
    const isBlacklisted = await logoutUseCase.isTokenBlacklisted(token);
    
    if (isBlacklisted) {
      logger.warn({
        tokenPrefix: token.substring(0, 20) + '...',
        ip: req.ip,
        path: req.path
      }, 'Unauthorized access attempt - blacklisted token');
      
      res.status(401).json({
        success: false,
        message: 'Access denied. Token has been invalidated.',
        error: 'TOKEN_INVALIDATED'
      });
      return;
    }

    // 3. Verificar y decodificar token JWT
    const payload = AuthService.verifyAccessToken(token);
    
    if (!payload) {
      logger.warn({
        tokenPrefix: token.substring(0, 20) + '...',
        ip: req.ip,
        path: req.path
      }, 'Unauthorized access attempt - invalid token');
      
      res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.',
        error: 'INVALID_TOKEN'
      });
      return;
    }

    // 4. Verificar expiración del token (redundante, pero seguro)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      logger.warn({
        userId: payload.userId,
        tokenExp: payload.exp,
        currentTime: now,
        ip: req.ip
      }, 'Unauthorized access attempt - expired token');
      
      res.status(401).json({
        success: false,
        message: 'Access denied. Token has expired.',
        error: 'TOKEN_EXPIRED'
      });
      return;
    }

    // 5. Agregar información del usuario al request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      type: payload.type,
      iat: payload.iat!,
      exp: payload.exp!
    };

    logger.debug({
      userId: payload.userId,
      email: payload.email,
      path: req.path,
      method: req.method
    }, 'Authenticated request processed');

    // Continuar al siguiente middleware/controlador
    next();

  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
      method: req.method,
      ip: req.ip
    }, 'Authentication middleware error');
    
    res.status(500).json({
      success: false,
      message: 'Internal authentication error',
      error: 'AUTH_MIDDLEWARE_ERROR'
    });
  }
};

/**
 * Middleware opcional de autenticación
 * Si hay token, lo valida. Si no hay token, continúa sin error.
 * Útil para endpoints que pueden funcionar con o sin autenticación.
 * 
 * Ejemplo: Endpoint público que muestra más información si el usuario está autenticado
 */
export const optionalAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    // Si no hay token, continuar sin autenticación
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    // Verificar blacklist
    const logoutUseCase = new LogoutUserUseCase();
    const isBlacklisted = await logoutUseCase.isTokenBlacklisted(token);
    
    if (isBlacklisted) {
      // Token invalidado, continuar sin autenticación
      next();
      return;
    }

    // Verificar token
    const payload = AuthService.verifyAccessToken(token);
    
    if (payload && payload.exp && payload.exp > Math.floor(Date.now() / 1000)) {
      // Token válido, agregar información del usuario
      req.user = {
        userId: payload.userId,
        email: payload.email,
        type: payload.type,
        iat: payload.iat!,
        exp: payload.exp!
      };
    }

    next();

  } catch (error) {
    // En modo opcional, los errores no bloquean el request
    logger.warn({
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path
    }, 'Optional auth middleware warning - continuing without auth');
    
    next();
  }
};

/**
 * Middleware para verificar roles específicos
 * Debe usarse después de authMiddleware
 * 
 * @param allowedTypes - Array de tipos de usuario permitidos ('CLIENT', 'PROVIDER')
 * @returns Middleware function
 * 
 * Ejemplo:
 * router.get('/admin', authMiddleware, roleMiddleware(['PROVIDER']), controller.method)
 */
export const roleMiddleware = (allowedTypes: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      logger.error({ path: req.path }, 'Role middleware called without authentication');
      res.status(500).json({
        success: false,
        message: 'Internal error - authentication required before role check',
        error: 'MISSING_AUTH'
      });
      return;
    }

    if (!allowedTypes.includes(req.user.type)) {
      logger.warn({
        userId: req.user.userId,
        userType: req.user.type,
        allowedTypes,
        path: req.path
      }, 'Access denied - insufficient privileges');
      
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient privileges.',
        error: 'INSUFFICIENT_PRIVILEGES'
      });
      return;
    }

    next();
  };
};

// Export types for use in controllers
export type { AuthenticatedRequest };