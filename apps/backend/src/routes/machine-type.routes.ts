import { Router } from 'express';
import { MachineTypeController } from '../controllers/machine-type.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requestSanitization } from '../middlewares/requestSanitization';
import { validateRequest } from '../middlewares/validation.middleware';
import { 
  CreateMachineTypeRequestSchema, 
  UpdateMachineTypeRequestSchema,
  ListMachineTypesQuerySchema
} from '@packages/contracts';

const router = Router();
const machineTypeController = new MachineTypeController();

/**
 * RUTAS DE TIPOS DE MÁQUINA
 * Endpoints CRUD para gestión de tipos de máquina
 */

/**
 * @swagger
 * /api/v1/machine-types:
 *   get:
 *     summary: List all machine types
 *     description: Returns all machine types, optionally filtered by language
 *     tags: [Machine Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           pattern: ^[a-z]{2}$
 *         description: ISO 639-1 language code (e.g., 'en', 'es')
 *     responses:
 *       200:
 *         description: List of machine types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       languages:
 *                         type: array
 *                         items:
 *                           type: string
 *                 count:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/',
  requestSanitization,
  authMiddleware,
  validateRequest({ query: ListMachineTypesQuerySchema }),
  machineTypeController.list.bind(machineTypeController)
);

/**
 * @swagger
 * /api/v1/machine-types:
 *   post:
 *     summary: Create a new machine type
 *     description: Creates a new machine type or adds language to existing one
 *     tags: [Machine Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: "Forklift"
 *               language:
 *                 type: string
 *                 pattern: ^[a-z]{2}$
 *                 default: "en"
 *                 example: "en"
 *     responses:
 *       201:
 *         description: Machine type created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Machine type already exists
 */
router.post('/',
  requestSanitization,
  authMiddleware,
  validateRequest({ body: CreateMachineTypeRequestSchema }),
  machineTypeController.create.bind(machineTypeController)
);

/**
 * @swagger
 * /api/v1/machine-types/{id}:
 *   put:
 *     summary: Update a machine type
 *     description: Updates the name of a machine type (admin only in future)
 *     tags: [Machine Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Machine type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: "Autoelevador clásico"
 *     responses:
 *       200:
 *         description: Machine type updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Machine type not found
 */
// TODO: Agregar requireRole(['ADMIN']) middleware para restringir acceso
router.put('/:id',
  requestSanitization,
  authMiddleware,
  validateRequest({ body: UpdateMachineTypeRequestSchema }),
  machineTypeController.update.bind(machineTypeController)
);

/**
 * @swagger
 * /api/v1/machine-types/{id}:
 *   delete:
 *     summary: Delete a machine type
 *     description: Deletes a machine type (admin only in future)
 *     tags: [Machine Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Machine type ID
 *     responses:
 *       200:
 *         description: Machine type deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Machine type not found
 *       409:
 *         description: Machine type is in use
 */
// TODO: Agregar requireRole(['ADMIN']) middleware para restringir acceso
router.delete('/:id',
  requestSanitization,
  authMiddleware,
  machineTypeController.delete.bind(machineTypeController)
);

export default router;
