import { Router } from 'express';
import { requestSanitization } from '../middlewares/requestSanitization';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { DashboardController } from '../controllers/dashboard.controller';
import {
  GetRecentQuickChecksRequestSchema,
  GetRecentMachineEventsRequestSchema
} from '@packages/contracts';

const router = Router();
const dashboardController = new DashboardController();

/**
 * RUTAS DE DASHBOARD - Sprint #12 (Bundle 12)
 * Endpoints para datos de actividad reciente en dashboard
 * Todas las rutas requieren autenticación
 * 
 * Patrón de paginación: Incremental con "Load More"
 * - limit: cantidad de registros por página (default 5, max 50)
 * - offset: punto de inicio para paginación (default 0)
 * - hasMore: indica si hay más registros disponibles
 */

/**
 * @swagger
 * /api/v1/dashboard/recent-quickchecks:
 *   get:
 *     summary: Get recent QuickChecks for dashboard
 *     description: |
 *       Returns recent QuickCheck inspections from all user's machines.
 *       - Ordered by date descending (most recent first)
 *       - Includes enriched machine data (name, brand, model, type)
 *       - Supports incremental pagination for "Load More" UX
 *       - Calculates item statistics (approved/disapproved counts)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 5
 *         description: Number of records to return
 *         example: 5
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Offset for pagination (for "Load More")
 *         example: 0
 *     responses:
 *       200:
 *         description: Success (returns empty array if no QuickChecks)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       result:
 *                         type: string
 *                         enum: [approved, disapproved, notInitiated]
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       responsibleName:
 *                         type: string
 *                       quickCheckItemsCount:
 *                         type: integer
 *                       approvedItemsCount:
 *                         type: integer
 *                       disapprovedItemsCount:
 *                         type: integer
 *                       observations:
 *                         type: string
 *                       machine:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           brand:
 *                             type: string
 *                           model:
 *                             type: string
 *                           serialNumber:
 *                             type: string
 *                           machineType:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                 total:
 *                   type: integer
 *                   description: Total number of records available
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *                 hasMore:
 *                   type: boolean
 *                   description: Indicates if more records are available
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal error (gracefully returns empty data)
 */
router.get(
  '/recent-quickchecks',
  requestSanitization,
  authMiddleware,
  validateRequest({ query: GetRecentQuickChecksRequestSchema }),
  (req, res) => dashboardController.getRecentQuickChecks(req, res)
);

/**
 * @swagger
 * /api/v1/dashboard/recent-events:
 *   get:
 *     summary: Get recent machine events for dashboard
 *     description: |
 *       Returns recent machine events (user-reported only) from all user's machines.
 *       - Filters out system-generated events (isSystemGenerated: false)
 *       - Ordered by createdAt descending (most recent first)
 *       - Includes enriched machine data and event type info
 *       - Supports incremental pagination for "Load More" UX
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 5
 *         description: Number of records to return
 *         example: 5
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Offset for pagination (for "Load More")
 *         example: 0
 *     responses:
 *       200:
 *         description: Success (returns empty array if no events)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       isSystemGenerated:
 *                         type: boolean
 *                       eventType:
 *                         type: object
 *                         nullable: true
 *                         description: Event type info (null if event has no valid type)
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       machine:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           serialNumber:
 *                             type: string
 *                           machineType:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *                 hasMore:
 *                   type: boolean
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal error (gracefully returns empty data)
 */
router.get(
  '/recent-events',
  requestSanitization,
  authMiddleware,
  validateRequest({ query: GetRecentMachineEventsRequestSchema }),
  (req, res) => dashboardController.getRecentEvents(req, res)
);

export default router;

/**
 * Future dashboard routes for consideration:
 * 
 * GET /api/v1/dashboard/summary-stats
 * - Estadísticas agregadas (total máquinas, QuickChecks hoy, eventos críticos)
 * - Single request para múltiples métricas
 * 
 * GET /api/v1/dashboard/compliance-rate?period=weekly
 * - Tasa de cumplimiento de QuickChecks por período
 * - Útil para KPIs y trends
 * 
 * GET /api/v1/dashboard/upcoming-maintenance
 * - Alarmas de mantenimiento próximas a dispararse
 * - Widget de prevención
 * 
 * GET /api/v1/dashboard/machine-health-scores
 * - Score de salud por máquina basado en QuickChecks + eventos
 * - Visualización tipo heatmap
 */
