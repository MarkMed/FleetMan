import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../config/logger.config.js';

/**
 * Factory pattern para crear validadores Zod reutilizables
 * Inspirado en el patrón strategy pattern para máxima escalabilidad
 * 
 * Utiliza schemas de @fleetman/contracts para mantener sincronización
 * entre frontend y backend
 */
const createValidator = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[source];
      const validatedData = schema.parse(dataToValidate);
      
      // Reemplazar los datos originales con los validados y sanitizados por Zod
      req[source] = validatedData;
      
      logger.debug({ path: req.path, method: req.method, source }, `Validation successful for ${source}`);
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        logger.warn({ 
          errors: errorMessages,
          path: req.path,
          method: req.method,
          source 
        }, 'Validation error');
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages
        });
      }
      
      logger.error({ error }, 'Unexpected validation error');
      return res.status(500).json({
        success: false,
        message: 'Internal validation error'
      });
    }
  };
};

/**
 * Factory methods específicos para diferentes fuentes de datos
 * 100% escalable - agregar nuevas validaciones es trivial
 */
export const validateBody = (schema: ZodSchema) => createValidator(schema, 'body');
export const validateQuery = (schema: ZodSchema) => createValidator(schema, 'query');
export const validateParams = (schema: ZodSchema) => createValidator(schema, 'params');

// Imports de schemas desde contracts
import { LoginRequest, RegisterRequest } from '@packages/contracts';

// Validadores específicos pre-configurados para los endpoints de auth
export const validateLoginUser = validateBody(LoginRequest);
export const validateRegisterUser = validateBody(RegisterRequest);

// TODO: Agregar más validadores según se necesiten:
// export const validateMachineId = validateParams(machineIdParamsSchema);
// export const validateMaintenanceQuery = validateQuery(maintenanceQuerySchema);