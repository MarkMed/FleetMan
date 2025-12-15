import { Router } from 'express';
import { requestSanitization } from '../middlewares/requestSanitization';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { QuickCheckController } from '../controllers/quickcheck.controller';
import {
  CreateQuickCheckRecordSchema,
  QuickCheckHistoryFiltersSchema
} from '@packages/contracts';

const router = Router();
const quickCheckController = new QuickCheckController();

/**
 * RUTAS DE QUICKCHECK
 * Endpoints para gestión de inspecciones rápidas (QuickCheck)
 * Todas las rutas requieren autenticación
 */

/**
 * @swagger
 * /api/v1/machines/{machineId}/quickchecks:
 *   post:
 *     summary: Add QuickCheck record to machine
 *     description: |
 *       Registers a new QuickCheck inspection for a machine.
 *       - CLIENTs can add quickchecks to their own machines
 *       - PROVIDERs can add quickchecks to assigned machines
 *       - Date is auto-generated server-side
 *       - ExecutedById is extracted from JWT token
 *     tags: [QuickCheck]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the machine to inspect
 *         example: "machine_abc123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - result
 *               - responsibleName
 *               - responsibleWorkerId
 *               - quickCheckItems
 *             properties:
 *               result:
 *                 type: string
 *                 enum: [approved, disapproved, notInitiated]
 *                 description: Overall result of the inspection
 *                 example: "approved"
 *               responsibleName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Full name of the technician/person executing the inspection
 *                 example: "Juan Pérez"
 *               responsibleWorkerId:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Worker ID, employee number, or identification of the responsible person
 *                 example: "TEC-0042"
 *               quickCheckItems:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 50
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - result
 *                   properties:
 *                     name:
 *                       type: string
 *                       maxLength: 100
 *                       example: "Frenos"
 *                     description:
 *                       type: string
 *                       maxLength: 500
 *                       example: "Inspección visual y prueba de frenado"
 *                     result:
 *                       type: string
 *                       enum: [approved, disapproved, omitted]
 *                       example: "approved"
 *               observations:
 *                 type: string
 *                 maxLength: 1000
 *                 description: General observations about the inspection
 *                 example: "Máquina en excelente estado. Sin novedades."
 *     responses:
 *       201:
 *         description: QuickCheck added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "QuickCheck added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     machineId:
 *                       type: string
 *                     quickCheckAdded:
 *                       type: object
 *                       properties:
 *                         result:
 *                           type: string
 *                         date:
 *                           type: string
 *                           format: date-time
 *                         executedById:
 *                           type: string
 *                           description: ID of the user who executed (from JWT)
 *                         responsibleName:
 *                           type: string
 *                           description: Name of the responsible technician
 *                         responsibleWorkerId:
 *                           type: string
 *                           description: Worker ID/employee number
 *                         quickCheckItems:
 *                           type: array
 *                         observations:
 *                           type: string
 *                     totalQuickChecks:
 *                       type: number
 *                       description: Total number of quickchecks in machine history
 *       400:
 *         description: Validation error (invalid data structure or business rule violation)
 *       403:
 *         description: Access denied - not owner or assigned provider
 *       404:
 *         description: Machine not found
 *       422:
 *         description: Cannot add quickcheck to retired machine
 */
router.post('/:machineId/quickchecks',
  requestSanitization,
  authMiddleware,
  validateRequest({ body: CreateQuickCheckRecordSchema }),
  quickCheckController.addQuickCheck.bind(quickCheckController)
);

/**
 * @swagger
 * /api/v1/machines/{machineId}/quickchecks:
 *   get:
 *     summary: Get QuickCheck history for machine
 *     description: |
 *       Retrieves the history of QuickCheck inspections for a machine.
 *       Supports filtering by result, date range, executor, and pagination.
 *       - CLIENTs can view history of their own machines
 *       - PROVIDERs can view history of assigned machines
 *     tags: [QuickCheck]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the machine
 *         example: "machine_abc123"
 *       - in: query
 *         name: result
 *         schema:
 *           type: string
 *           enum: [approved, disapproved, notInitiated]
 *         description: Filter by overall result
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter quickchecks from this date (inclusive)
 *         example: "2025-01-01T00:00:00Z"
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter quickchecks until this date (inclusive)
 *         example: "2025-12-31T23:59:59Z"
 *       - in: query
 *         name: executedById
 *         schema:
 *           type: string
 *         description: Filter by user who executed the inspection
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Number of records to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *           default: 0
 *           minimum: 0
 *         description: Number of records to skip (for pagination)
 *     responses:
 *       200:
 *         description: QuickCheck history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     machineId:
 *                       type: string
 *                     quickChecks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           result:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           executedById:
 *                             type: string
 *                             description: ID of the user who executed (from JWT)
 *                           responsibleName:
 *                             type: string
 *                             description: Name of the responsible technician
 *                           responsibleWorkerId:
 *                             type: string
 *                             description: Worker ID/employee number
 *                           quickCheckItems:
 *                             type: array
 *                           observations:
 *                             type: string
 *                     total:
 *                       type: number
 *                       description: Total number of quickchecks in machine (unfiltered)
 *                     filters:
 *                       type: object
 *                       description: Echo of applied filters
 *       403:
 *         description: Access denied - not owner or assigned provider
 *       404:
 *         description: Machine not found
 */
router.get('/:machineId/quickchecks',
  requestSanitization,
  authMiddleware,
  validateRequest({ query: QuickCheckHistoryFiltersSchema }),
  quickCheckController.getHistory.bind(quickCheckController)
);

export default router;
