import { Router } from 'express';
import { requestSanitization } from '../middlewares/requestSanitization';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role-check.middleware';

const router = Router();

/**
 * RUTAS DE MÁQUINAS
 * Ejemplos de autorización por rol y ownership
 */

// TODO: Implementar MachineController
// const machineController = new MachineController();

/**
 * @swagger
 * /api/v1/machines:
 *   get:
 *     summary: List user's machines
 *     description: Returns machines owned by the authenticated user
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's machines
 *       401:
 *         description: Unauthorized
 */
router.get('/',
  requestSanitization,
  authMiddleware,
  // Solo usuarios autenticados pueden ver sus máquinas
  (req: any, res: any) => {
    res.json({
      success: true,
      message: 'User machines retrieved',
      data: {
        machines: [],
        userId: req.user.userId,
        userType: req.user.type
      }
    });
  }
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
 *     responses:
 *       201:
 *         description: Machine created successfully
 *       403:
 *         description: Only clients can create machines
 */
router.post('/',
  requestSanitization,
  authMiddleware,
  requireRole(['CLIENT']), // Solo CLIENTs pueden crear máquinas
  // machineController.create.bind(machineController)
  (req: any, res: any) => {
    res.status(201).json({
      success: true,
      message: 'Machine creation endpoint - CLIENT access only',
      data: {
        note: 'This endpoint is restricted to CLIENT users',
        yourRole: req.user.type
      }
    });
  }
);

/**
 * @swagger
 * /api/v1/machines/all:
 *   get:
 *     summary: List all machines (admin/provider only)
 *     description: Returns all machines in the system - restricted to providers and admins
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all machines
 *       403:
 *         description: Only providers and admins can access this endpoint
 */
router.get('/all',
  requestSanitization,
  authMiddleware,
  requireRole(['PROVIDER', 'ADMIN']), // Solo PROVIDERs y ADMINs pueden ver todas las máquinas
  // machineController.listAll.bind(machineController)
  (req: any, res: any) => {
    res.json({
      success: true,
      message: 'All machines endpoint - PROVIDER/ADMIN access only',
      data: {
        note: 'This endpoint shows all machines in the system',
        yourRole: req.user.type,
        totalMachines: 0
      }
    });
  }
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
  // TODO: Implementar middleware de ownership específico para máquinas
  // requireMachineOwnership(),
  (req: any, res: any) => {
    res.json({
      success: true,
      message: 'Machine details endpoint',
      data: {
        machineId: req.params.id,
        note: 'Would verify machine ownership here',
        yourRole: req.user.type
      }
    });
  }
);

export default router;