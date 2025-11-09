import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

/**
 * Middleware de sanitización XSS
 * Sanitiza req.body, req.query, req.params y req.headers para prevenir ataques XSS
 */

// Configuración personalizada de XSS
const xssOptions = {
  whiteList: {}, // No permitir ningún tag HTML por defecto
  stripIgnoreTag: true, // Remover tags no permitidos
  stripIgnoreTagBody: ['script'], // Remover contenido de tags script
};

/**
 * Función recursiva para sanitizar objetos anidados
 */
const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return xss(obj, xssOptions);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Sanitizar también las claves del objeto
        const sanitizedKey = xss(key, xssOptions);
        sanitized[sanitizedKey] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  // Para números, booleans, etc., devolver tal como está
  return obj;
};

/**
 * Middleware principal de sanitización
 */
export const requestSanitization = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Sanitizar req.body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitizar req.query
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitizar req.params
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    // Sanitizar headers específicos que pueden contener datos del usuario
    const headersToSanitize = [
      'x-forwarded-for',
      'user-agent',
      'referer',
      'x-custom-header'
    ];

    headersToSanitize.forEach(header => {
      if (req.headers[header] && typeof req.headers[header] === 'string') {
        req.headers[header] = xss(req.headers[header] as string, xssOptions);
      }
    });

    next();
  } catch (error) {
    // En caso de error en la sanitización, loggear y continuar
    console.error('Error in XSS sanitization middleware:', error);
    
    // En producción, podrías querer devolver un error 400
    // En desarrollo, continuamos para no bloquear el desarrollo
    next();
  }
};

/**
 * Middleware de sanitización más estricto para endpoints críticos
 */
export const strictRequestSanitization = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Configuración más estricta
    const strictXssOptions = {
      whiteList: {}, // No permitir ningún HTML
      stripIgnoreTag: true,
      stripIgnoreTagBody: true,
      allowCommentTag: false,
    };

    const strictSanitize = (obj: any): any => {
      if (obj === null || obj === undefined) {
        return obj;
      }

      if (typeof obj === 'string') {
        // Aplicar sanitización estricta
        let sanitized = xss(obj, strictXssOptions);
        
        // Remover caracteres potencialmente peligrosos adicionales
        sanitized = sanitized.replace(/[<>'"&]/g, '');
        
        return sanitized;
      }

      if (Array.isArray(obj)) {
        return obj.map(strictSanitize);
      }

      if (typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            sanitized[key] = strictSanitize(obj[key]);
          }
        }
        return sanitized;
      }

      return obj;
    };

    // Aplicar sanitización estricta
    if (req.body) req.body = strictSanitize(req.body);
    if (req.query) req.query = strictSanitize(req.query);
    if (req.params) req.params = strictSanitize(req.params);

    next();
  } catch (error) {
    console.error('Error in strict XSS sanitization middleware:', error);
    res.status(400).json({
      error: 'Invalid request data',
      message: 'Request contains potentially harmful content'
    });
  }
};

export default requestSanitization;