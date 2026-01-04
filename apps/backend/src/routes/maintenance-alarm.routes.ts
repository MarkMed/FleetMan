
import {
  CreateMaintenanceAlarmSchema,
  UpdateMaintenanceAlarmSchema,
  ListMaintenanceAlarmsQuerySchema,
  MaintenanceAlarmParamsSchema,
  MachineIdParamSchema
} from '../interfaces/http/validation/maintenance-alarm.schemas';
import { MaintenanceAlarmController } from '../controllers/maintenance-alarm.controller';
import { Router } from 'express';
import { requestSanitization } from '../middlewares/requestSanitization';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';

const router = Router();
const maintenanceAlarmController = new MaintenanceAlarmController();
/**
 * ========================================
 * MAINTENANCE ALARMS ROUTES
 * Sprint #11: Maintenance Alarms CRUD
 * ========================================
 */

/**
 * @swagger
 * /api/v1/machines/{machineId}/maintenance-alarms:
 *   post:
 *     summary: Create maintenance alarm
 *     description: Creates a new maintenance alarm for a machine
 *     tags: [Maintenance Alarms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - intervalHours
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Cambio de aceite hidráulico"
 *               description:
 *                 type: string
 *                 example: "Reemplazar aceite hidráulico cada 500 horas"
 *               relatedParts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Filtro hidráulico", "Aceite ISO 32"]
 *               intervalHours:
 *                 type: number
 *                 example: 500
 *     responses:
 *       201:
 *         description: Maintenance alarm created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/:machineId/maintenance-alarms',
  requestSanitization,
  authMiddleware,
  validateRequest({ 
    params: MachineIdParamSchema,
    body: CreateMaintenanceAlarmSchema 
  }),
  maintenanceAlarmController.create.bind(maintenanceAlarmController)
);

/**
 * @swagger
 * /api/v1/machines/{machineId}/maintenance-alarms:
 *   get:
 *     summary: List maintenance alarms
 *     description: Lists all maintenance alarms for a machine with optional filtering
 *     tags: [Maintenance Alarms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of maintenance alarms
 *       401:
 *         description: Unauthorized
 */
router.get('/:machineId/maintenance-alarms',
  requestSanitization,
  authMiddleware,
  validateRequest({ 
    params: MachineIdParamSchema,
    query: ListMaintenanceAlarmsQuerySchema 
  }),
  maintenanceAlarmController.list.bind(maintenanceAlarmController)
);

/**
 * @swagger
 * /api/v1/machines/{machineId}/maintenance-alarms/{alarmId}:
 *   patch:
 *     summary: Update maintenance alarm
 *     description: Updates an existing maintenance alarm (partial update)
 *     tags: [Maintenance Alarms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: alarmId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               relatedParts:
 *                 type: array
 *                 items:
 *                   type: string
 *               intervalHours:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Maintenance alarm updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Machine or alarm not found
 */
router.patch('/:machineId/maintenance-alarms/:alarmId',
  requestSanitization,
  authMiddleware,
  validateRequest({ 
    params: MaintenanceAlarmParamsSchema,
    body: UpdateMaintenanceAlarmSchema 
  }),
  maintenanceAlarmController.update.bind(maintenanceAlarmController)
);

/**
 * @swagger
 * /api/v1/machines/{machineId}/maintenance-alarms/{alarmId}:
 *   delete:
 *     summary: Delete maintenance alarm
 *     description: Deletes a maintenance alarm from the machine
 *     tags: [Maintenance Alarms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: alarmId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Maintenance alarm deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Machine or alarm not found
 */
router.delete('/:machineId/maintenance-alarms/:alarmId',
  requestSanitization,
  authMiddleware,
  validateRequest({ params: MaintenanceAlarmParamsSchema }),
  maintenanceAlarmController.delete.bind(maintenanceAlarmController)
);

/**
 * @swagger
 * /api/v1/machines/{machineId}/maintenance-alarms/{alarmId}/reset:
 *   post:
 *     summary: Reset maintenance alarm accumulator
 *     description: Resets accumulated hours to 0 after maintenance is completed
 *     tags: [Maintenance Alarms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: alarmId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Maintenance alarm reset successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Machine or alarm not found
 */
router.post('/:machineId/maintenance-alarms/:alarmId/reset',
  requestSanitization,
  authMiddleware,
  validateRequest({ params: MaintenanceAlarmParamsSchema }),
  maintenanceAlarmController.reset.bind(maintenanceAlarmController)
);

export default router;