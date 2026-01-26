import { Response } from 'express';
import { logger } from '../config/logger.config';
import { 
  GetRecentQuickChecksUseCase, 
  GetRecentMachineEventsUseCase 
} from '../application/dashboard';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { MachineRepository } from '@packages/persistence';

/**
 * DashboardController - Sprint #12 (Bundle 12)
 * 
 * Handles dashboard-related HTTP requests for recent activity data.
 * 
 * Responsibilities:
 * - Call appropriate Use Cases for dashboard data
 * - Transform domain responses to HTTP responses
 * - Handle HTTP-specific concerns (status codes, headers)
 * - Provide consistent error handling for dashboard widgets
 * 
 * Architecture:
 * - Controller → Use Case → Repository → MongoDB
 * - Graceful degradation: errors return empty data instead of 500
 * - Paginación incremental para "Load More" UX pattern
 */
export class DashboardController {
  private getRecentQuickChecksUseCase: GetRecentQuickChecksUseCase;
  private getRecentMachineEventsUseCase: GetRecentMachineEventsUseCase;

  constructor() {
    const machineRepository = new MachineRepository();
    this.getRecentQuickChecksUseCase = new GetRecentQuickChecksUseCase(machineRepository);
    this.getRecentMachineEventsUseCase = new GetRecentMachineEventsUseCase(machineRepository);
  }

  /**
   * GET /api/dashboard/recent-quickchecks?limit=5&offset=0
   * 
   * Obtiene QuickChecks recientes de todas las máquinas del usuario.
   * Soporta paginación incremental estilo "Load More".
   * 
   * Query Params (validados por Zod middleware):
   * - limit: number (1-50, default 5) - Cantidad de registros a retornar
   * - offset: number (>=0, default 0) - Offset para paginación
   * 
   * Response: GetRecentQuickChecksResponse
   * - data: array de RecentQuickCheckDTO con datos enriquecidos
   * - total: número total de registros disponibles
   * - limit: límite aplicado
   * - offset: offset aplicado
   * - hasMore: boolean indicando si hay más registros
   * 
   * Estados:
   * - 200: Success con data (puede ser array vacío si usuario sin QuickChecks)
   * - 401: No autenticado (manejado por authMiddleware)
   * - 500: Error interno (gracefully degraded, retorna data vacía)
   */
  async getRecentQuickChecks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Authentication already validated by authMiddleware
      const userId = req.user!.userId;
      const limit = parseInt(req.query.limit as string) || 5;
      const offset = parseInt(req.query.offset as string) || 0;

      logger.info({ 
        userId, 
        limit, 
        offset 
      }, 'DashboardController.getRecentQuickChecks called');

      const result = await this.getRecentQuickChecksUseCase.execute(
        userId,
        limit,
        offset
      );

      // Success response (incluso si data está vacío)
      res.status(200).json(result);
    } catch (error: any) {
      // Log error pero retorna respuesta vacía para graceful degradation
      // Dashboard debe seguir funcionando aunque este widget falle
      logger.error({ 
        userId: req.user?.userId, 
        error: error.message,
        stack: error.stack
      }, 'Error in DashboardController.getRecentQuickChecks');
      
      res.status(200).json({
        data: [],
        total: 0,
        limit: parseInt(req.query.limit as string) || 5,
        offset: parseInt(req.query.offset as string) || 0,
        hasMore: false
      });
    }
  }

  /**
   * GET /api/dashboard/recent-events?limit=5&offset=0
   * 
   * Obtiene eventos de máquina recientes del usuario.
   * Soporta paginación incremental estilo "Load More".
   * 
   * Query Params (validados por Zod middleware):
   * - limit: number (1-50, default 5) - Cantidad de registros a retornar
   * - offset: number (>=0, default 0) - Offset para paginación
   * 
   * Response: GetRecentMachineEventsResponse
   * - data: array de RecentMachineEventDTO con datos enriquecidos
   * - total: número total de registros disponibles
   * - limit: límite aplicado
   * - offset: offset aplicado
   * - hasMore: boolean indicando si hay más registros
   * 
   * Estados:
   * - 200: Success con data (puede ser array vacío si usuario sin eventos)
   * - 401: No autenticado (manejado por authMiddleware)
   * - 500: Error interno (gracefully degraded, retorna data vacía)
   */
  async getRecentEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Authentication already validated by authMiddleware
      const userId = req.user!.userId;
      const limit = parseInt(req.query.limit as string) || 5;
      const offset = parseInt(req.query.offset as string) || 0;

      logger.info({ 
        userId, 
        limit, 
        offset 
      }, 'DashboardController.getRecentEvents called');

      const result = await this.getRecentMachineEventsUseCase.execute(
        userId,
        limit,
        offset
      );

      // Success response (incluso si data está vacío)
      res.status(200).json(result);
    } catch (error: any) {
      // Log error pero retorna respuesta vacía para graceful degradation
      // Dashboard debe seguir funcionando aunque este widget falle
      logger.error({ 
        userId: req.user?.userId, 
        error: error.message,
        stack: error.stack
      }, 'Error in DashboardController.getRecentEvents');
      
      res.status(200).json({
        data: [],
        total: 0,
        limit: parseInt(req.query.limit as string) || 5,
        offset: parseInt(req.query.offset as string) || 0,
        hasMore: false
      });
    }
  }

  // Future endpoints for dashboard enhancements:
  
  /**
   * GET /api/dashboard/summary-stats
   * 
   * Purpose: Obtener estadísticas agregadas del dashboard en una sola llamada
   * Returns: { quickCheckStats, eventStats, machineStats }
   * 
   * async getSummaryStats(req: AuthenticatedRequest, res: Response): Promise<void> {
   *   const userId = req.user!.userId;
   *   const stats = await getDashboardSummaryStatsUseCase.execute(userId);
   *   res.status(200).json(stats);
   * }
   */

  /**
   * GET /api/dashboard/compliance-rate?period=weekly
   * 
   * Purpose: Obtener tasa de cumplimiento de QuickChecks
   * Query: period ('daily' | 'weekly' | 'monthly')
   * Returns: { rate: number, trend: 'up' | 'down' | 'stable' }
   * 
   * async getComplianceRate(req: AuthenticatedRequest, res: Response): Promise<void> {
   *   const userId = req.user!.userId;
   *   const period = req.query.period as string || 'weekly';
   *   const result = await getQuickCheckComplianceRateUseCase.execute(userId, period);
   *   res.status(200).json(result);
   * }
   */
}
