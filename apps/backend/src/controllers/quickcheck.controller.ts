import { Response } from 'express';
import { logger } from '../config/logger.config';
import {
  AddQuickCheckUseCase,
  GetQuickCheckHistoryUseCase
} from '../application/quickcheck';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * QuickCheckController handles QuickCheck-related HTTP requests
 * 
 * Responsibilities:
 * - Call appropriate Use Cases
 * - Transform domain responses to HTTP responses
 * - Handle HTTP-specific concerns (status codes, headers)
 * - Map domain errors to HTTP status codes
 */
export class QuickCheckController {
  private addQuickCheckUseCase: AddQuickCheckUseCase;
  private getHistoryUseCase: GetQuickCheckHistoryUseCase;

  constructor() {
    this.addQuickCheckUseCase = new AddQuickCheckUseCase();
    this.getHistoryUseCase = new GetQuickCheckHistoryUseCase();
  }

  /**
   * POST /machines/:machineId/quickchecks
   * Agrega un nuevo registro de QuickCheck a una máquina
   * Body ya validado por Zod middleware (CreateQuickCheckRecordSchema)
   */
  async addQuickCheck(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Authentication required',
          error: 'MISSING_AUTH'
        });
        return;
      }

      const { machineId } = req.params;
      const record = req.body;
      const userId = req.user.userId;

      logger.info({ 
        machineId,
        userId,
        itemsCount: record.quickCheckItems?.length 
      }, 'Adding QuickCheck record');

      const result = await this.addQuickCheckUseCase.execute(
        machineId,
        record,
        userId
      );

      res.status(201).json({
        success: true,
        message: 'QuickCheck added successfully',
        data: result
      });

    } catch (error) {
      const statusCode = this.mapErrorToHttpStatus(error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        machineId: req.params.machineId,
        userId: req.user?.userId
      }, 'Failed to add QuickCheck');

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: this.getErrorCode(error as Error)
      });
    }
  }

  /**
   * GET /machines/:machineId/quickchecks
   * Obtiene el historial de QuickChecks de una máquina
   * Query params validados por Zod middleware (QuickCheckHistoryFiltersSchema)
   */
  async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Authentication required',
          error: 'MISSING_AUTH'
        });
        return;
      }

      const { machineId } = req.params;
      const userId = req.user.userId;
      
      // Query params opcionales (ya validados por Zod)
      // Solo incluir filtros que realmente fueron proporcionados
      const filters: any = {};
      
      if (req.query.result) {
        filters.result = req.query.result;
      }
      if (req.query.dateFrom) {
        filters.dateFrom = new Date(req.query.dateFrom as string);
      }
      if (req.query.dateTo) {
        filters.dateTo = new Date(req.query.dateTo as string);
      }
      if (req.query.executedById) {
        filters.executedById = req.query.executedById as string;
      }
      if (req.query.limit) {
        filters.limit = Number(req.query.limit);
      }
      if (req.query.skip) {
        filters.skip = Number(req.query.skip);
      }

      logger.info({ 
        machineId,
        userId,
        filters: Object.keys(filters).length > 0 ? filters : 'none'
      }, 'Fetching QuickCheck history');

      const result = await this.getHistoryUseCase.execute(
        machineId,
        userId,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      const statusCode = this.mapErrorToHttpStatus(error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        machineId: req.params.machineId,
        userId: req.user?.userId
      }, 'Failed to fetch QuickCheck history');

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: this.getErrorCode(error as Error)
      });
    }
  }

  /**
   * Mapea errores de dominio a códigos HTTP apropiados
   */
  private mapErrorToHttpStatus(error: Error): number {
    const message = error.message.toLowerCase();

    // 404 Not Found
    if (message.includes('not found')) {
      return 404;
    }

    // 403 Forbidden
    if (message.includes('access denied') || message.includes('not the owner')) {
      return 403;
    }

    // 422 Unprocessable Entity (regla de negocio)
    if (message.includes('retired machine') || message.includes('cannot add')) {
      return 422;
    }

    // 400 Bad Request (validación)
    if (
      message.includes('validation') || 
      message.includes('invalid') ||
      message.includes('must have at least') ||
      message.includes('should be')
    ) {
      return 400;
    }

    // 500 Internal Server Error (default)
    return 500;
  }

  /**
   * Genera un código de error semántico para respuestas
   */
  private getErrorCode(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('not found')) return 'MACHINE_NOT_FOUND';
    if (message.includes('access denied')) return 'ACCESS_DENIED';
    if (message.includes('retired machine')) return 'MACHINE_RETIRED';
    if (message.includes('validation')) return 'VALIDATION_ERROR';
    if (message.includes('invalid')) return 'INVALID_INPUT';

    return 'INTERNAL_ERROR';
  }
}
