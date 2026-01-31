import { Router } from 'express';
import { SparePartController } from '../controllers/spare-part.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import {
  CreateSparePartBodySchema,
  UpdateSparePartRequestSchema
} from '@packages/contracts';

/**
 * Spare Parts Routes
 * Sprint #15/16 - Task 7.1: Alta/edición repuesto (RF-012/014)
 * 
 * All endpoints require authentication
 * All mutations validated by Zod schemas
 * 
 * Base path: /api/v1/machines
 * Routes: /api/v1/machines/:machineId/spare-parts
 */
const router = Router();
const controller = new SparePartController();

// =============================================================================
// SPARE PARTS CRUD ENDPOINTS
// =============================================================================

/**
 * @swagger
 * /machines/{machineId}/spare-parts:
 *   post:
 *     summary: Create new spare part
 *     description: Creates a new spare part for a machine. Only machine owner can create spare parts.
 *     tags: [SpareParts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *         description: Machine ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - serialId
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 200
 *                 example: "Filtro de Aceite"
 *                 description: Spare part name
 *               serialId:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "F-1234"
 *                 description: Serial ID or part number
 *               amount:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *                 example: 5
 *                 description: Quantity available
 *     responses:
 *       201:
 *         description: Spare part created successfully
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
 *                   example: "Spare part created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SparePart'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied (not machine owner)
 *       404:
 *         description: Machine not found
 *       409:
 *         description: Serial ID already exists for this machine
 *       500:
 *         description: Internal server error
 */
router.post(
  '/:machineId/spare-parts',
  authMiddleware,
  validateBody(CreateSparePartBodySchema),
  controller.create.bind(controller)
);

/**
 * @swagger
 * /machines/{machineId}/spare-parts:
 *   get:
 *     summary: List spare parts by machine
 *     description: Retrieves all spare parts for a specific machine. Only machine owner can view.
 *     tags: [SpareParts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *         description: Machine ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: List of spare parts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SparePart'
 *                 count:
 *                   type: integer
 *                   example: 5
 *       403:
 *         description: Access denied (not machine owner)
 *       404:
 *         description: Machine not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:machineId/spare-parts',
  authMiddleware,
  controller.listByMachine.bind(controller)
);

/**
 * @swagger
 * /machines/{machineId}/spare-parts/{id}:
 *   get:
 *     summary: Get spare part details
 *     description: Retrieves details of a specific spare part. Only machine owner can view.
 *     tags: [SpareParts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *         description: Machine ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Spare part ID
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Spare part details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SparePart'
 *       403:
 *         description: Access denied (not machine owner)
 *       404:
 *         description: Spare part not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:machineId/spare-parts/:id',
  authMiddleware,
  controller.getById.bind(controller)
);

/**
 * @swagger
 * /machines/{machineId}/spare-parts/{id}:
 *   patch:
 *     summary: Update spare part
 *     description: Updates an existing spare part. Only machine owner can update. Machine ID cannot be changed.
 *     tags: [SpareParts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *         description: Machine ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Spare part ID
 *         example: "507f1f77bcf86cd799439012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 200
 *                 example: "Filtro de Aceite Premium"
 *                 description: Updated spare part name
 *               serialId:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "F-5678"
 *                 description: Updated serial ID
 *               amount:
 *                 type: integer
 *                 minimum: 0
 *                 example: 10
 *                 description: Updated quantity
 *           example:
 *             amount: 10
 *     responses:
 *       200:
 *         description: Spare part updated successfully
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
 *                   example: "Spare part updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SparePart'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied (not machine owner)
 *       404:
 *         description: Spare part not found
 *       409:
 *         description: Serial ID already exists for this machine
 *       500:
 *         description: Internal server error
 */
router.patch(
  '/:machineId/spare-parts/:id',
  authMiddleware,
  validateBody(UpdateSparePartRequestSchema),
  controller.update.bind(controller)
);

/**
 * @swagger
 * /machines/{machineId}/spare-parts/{id}:
 *   delete:
 *     summary: Delete spare part
 *     description: Permanently deletes a spare part. Only machine owner can delete.
 *     tags: [SpareParts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *         description: Machine ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Spare part ID
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Spare part deleted successfully
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
 *                   example: "Spare part deleted successfully"
 *       403:
 *         description: Access denied (not machine owner)
 *       404:
 *         description: Spare part not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:machineId/spare-parts/:id',
  authMiddleware,
  controller.delete.bind(controller)
);

// =============================================================================
// SWAGGER SCHEMA DEFINITIONS
// =============================================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     SparePart:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *           description: Unique spare part ID
 *         name:
 *           type: string
 *           example: "Filtro de Aceite"
 *           description: Spare part name
 *         serialId:
 *           type: string
 *           example: "F-1234"
 *           description: Serial ID or part number
 *         amount:
 *           type: integer
 *           example: 5
 *           description: Quantity available
 *         machineId:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *           description: Machine ID this spare part belongs to
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-01-31T10:30:00.000Z"
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-01-31T15:45:00.000Z"
 *           description: Last update timestamp
 */

export default router;
