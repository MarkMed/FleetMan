import { Response } from 'express';
import { logger } from '../config/logger.config';
import {
  AddQuickCheckUseCase,
  GetQuickCheckHistoryUseCase,
  GetQuickCheckItemsTemplateUseCase
} from '../application/quickcheck';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { MachineRepository } from '@packages/persistence';

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
  private getItemsTemplateUseCase: GetQuickCheckItemsTemplateUseCase;

  constructor() {
    this.addQuickCheckUseCase = new AddQuickCheckUseCase();
    this.getHistoryUseCase = new GetQuickCheckHistoryUseCase();
    const machineRepository = new MachineRepository();
    this.getItemsTemplateUseCase = new GetQuickCheckItemsTemplateUseCase(machineRepository);
  }

  /**
   * POST /machines/:machineId/quickchecks
   * Agrega un nuevo registro de QuickCheck a una máquina
   * 
   * Body validado por Zod middleware (CreateQuickCheckRecordSchema):
   * - result: 'approved' | 'disapproved' | 'notInitiated'
   * - responsibleName: string (1-100 chars) - Nombre del técnico responsable
   * - responsibleWorkerId: string (1-50 chars) - Número de trabajador/empleado
   * - quickCheckItems: array (1-50 items) - Items inspeccionados
   * - observations?: string (max 1000 chars) - Comentarios opcionales
   * 
   * Campos auto-generados server-side:
   * - date: Date.now()
   * - executedById: req.user.userId (desde JWT)
   */
  async addQuickCheck(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Authentication already validated by authMiddleware
      const { machineId } = req.params;
      const record = req.body;
      const userId = req.user!.userId;

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
      // Authentication already validated by authMiddleware
      const { machineId } = req.params;
      const userId = req.user!.userId;
      
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

  /**
   * GET /machines/:machineId/quickcheck/items-template
   * Obtiene plantilla de ítems derivada del último QuickCheck
   * 
   * Estrategia: Reutilizar estructura del último QuickCheck sin duplicar storage
   * 
   * Autorización:
   * - Owner de la máquina
   * - Provider asignado a la máquina
   * 
   * Response:
   * - Si hay historial: Retorna items[] sin resultado (para inicializar formulario)
   * - Si NO hay historial: Retorna items[] vacío (usuario crea desde cero)
   * 
   * Headers:
   * - Cache-Control: max-age=900 (cacheable 15 minutos - balance performance/frescura)
   */
  async getItemsTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { machineId } = req.params;
      const userId = req.user!.userId;

      logger.info({ machineId, userId }, 'Getting QuickCheck items template');

      const result = await this.getItemsTemplateUseCase.execute(machineId, userId);

      // Cache response (ítems raramente cambian entre QuickChecks)
      // 15 minutos: balance entre performance y frescura de datos
      res.set('Cache-Control', 'max-age=900'); // 15 minutos

      res.status(200).json(result);

    } catch (error) {
      const statusCode = this.mapErrorToHttpStatus(error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        machineId: req.params.machineId 
      }, 'Failed to get QuickCheck items template');

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: this.getErrorCode(error as Error)
      });
    }
  }
}
