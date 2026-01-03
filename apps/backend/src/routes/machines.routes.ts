import { Router } from 'express';
import { requestSanitization } from '../middlewares/requestSanitization';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role-check.middleware';
import { MachineController } from '../controllers/machine.controller';
import { MaintenanceAlarmController } from '../controllers/maintenance-alarm.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import {
  CreateMachineRequestSchema,
  UpdateMachineRequestSchema,
  ListMachinesRequestSchema
} from '@packages/contracts';
import {
  CreateMaintenanceAlarmSchema,
  UpdateMaintenanceAlarmSchema,
  ListMaintenanceAlarmsQuerySchema,
  MaintenanceAlarmParamsSchema,
  MachineIdParamSchema
} from '../interfaces/http/validation/maintenance-alarm.schemas';

const router = Router();
const machineController = new MachineController();
const maintenanceAlarmController = new MaintenanceAlarmController();

/**
 * RUTAS DE MÁQUINAS
 * Endpoints CRUD para gestión de máquinas
 */

/**
 * @swagger
 * /api/v1/machines:
 *   get:
 *     summary: List user's machines
 *     description: Returns machines owned by authenticated user with pagination and filters
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, MAINTENANCE, OUT_OF_SERVICE, RETIRED]
 *       - in: query
 *         name: machineTypeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in serialNumber, brand, modelName, nickname
 *     responses:
 *       200:
 *         description: List of machines with pagination
 *       401:
 *         description: Unauthorized
 */
router.get('/',
  requestSanitization,
  authMiddleware,
  validateRequest({ query: ListMachinesRequestSchema }),
  machineController.list.bind(machineController)
);

/**
 * @swagger
 * /api/v1/machines:
 *   post:
 *     summary: Create a new machine
 *     description: Allows clients to register a new machine
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serialNumber
 *               - brand
 *               - modelName
 *               - machineTypeId
 *             properties:
 *               serialNumber:
 *                 type: string
 *                 example: "FLT-12345"
 *               brand:
 *                 type: string
 *                 example: "Toyota"
 *               modelName:
 *                 type: string
 *                 example: "8FBE20"
 *               machineTypeId:
 *                 type: string
 *               nickname:
 *                 type: string
 *               specs:
 *                 type: object
 *               location:
 *                 type: object
 *     responses:
 *       201:
 *         description: Machine created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Only clients can create machines
 *       409:
 *         description: Serial number already exists
 */
router.post('/',
  requestSanitization,
  authMiddleware,
  requireRole(['CLIENT']),
  validateRequest({ body: CreateMachineRequestSchema }),
  machineController.create.bind(machineController)
);

/**
 * @swagger
 * /api/v1/machines/{id}:
 *   get:
 *     summary: Get machine details
 *     description: Get detailed information about a specific machine
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Machine ID
 *     responses:
 *       200:
 *         description: Machine details
 *       403:
 *         description: Access denied - not your machine
 *       404:
 *         description: Machine not found
 */
router.get('/:id',
  requestSanitization,
  authMiddleware,
  machineController.getById.bind(machineController)
);

/**
 * @swagger
 * /api/v1/machines/{id}:
 *   put:
 *     summary: Update machine
 *     description: Update machine details (specs, location, nickname, status)
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specs:
 *                 type: object
 *               location:
 *                 type: object
 *               nickname:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, MAINTENANCE, OUT_OF_SERVICE, RETIRED]
 *     responses:
 *       200:
 *         description: Machine updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Machine not found
 */
router.put('/:id',
  requestSanitization,
  authMiddleware,
  validateRequest({ body: UpdateMachineRequestSchema }),
  machineController.update.bind(machineController)
);

/**
 * @swagger
 * /api/v1/machines/{id}:
 *   delete:
 *     summary: Delete machine
 *     description: Delete a machine (only owner can delete)
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Machine deleted successfully
 *       403:
 *         description: Access denied - only owner can delete
 *       404:
 *         description: Machine not found
 */
router.delete('/:id',
  requestSanitization,
  authMiddleware,
  machineController.delete.bind(machineController)
);

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