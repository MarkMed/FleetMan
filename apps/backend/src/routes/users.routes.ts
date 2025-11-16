import { Router } from 'express';
import { requestSanitization } from '../middlewares/requestSanitization';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role-check.middleware';

const router = Router();

/**
 * RUTAS DE USUARIOS
 * Ejemplos de autorización combinada (rol + ownership)
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: List all users (admin only)
 *     description: Administrative endpoint to list all users in the system
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Admin access required
 */
router.get('/',
  requestSanitization,
  authMiddleware,
  requireRole(['ADMIN']), // Solo ADMINs pueden ver todos los usuarios
  (req: any, res: any) => {
    res.json({
      success: true,
      message: 'All users endpoint - ADMIN access only',
      data: {
        note: 'This would return all users in the system',
        yourRole: req.user.type,
        totalUsers: 0
      }
    });
  }
);

/**
 * @swagger
 * /api/v1/users/{userId}/profile:
 *   get:
 *     summary: Get user profile
 *     description: Get user profile - users can see their own, admins can see any
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile data
 *       403:
 *         description: Access denied - not your profile
 */
// TODO: Future MVP+ feature - Get user profile with ownership check
// router.get('/:userId/profile', authMiddleware, requireRoleOrOwnership(['ADMIN'], 'userId'), ...);
router.get('/:userId/profile',
  requestSanitization,
  authMiddleware,
  requireRole(['ADMIN']), // Solo ADMINs pueden ver perfiles por ahora (MVP)
  (req: any, res: any) => {
    res.json({
      success: true,
      message: 'User profile endpoint',
      data: {
        requestedUserId: req.params.userId,
        yourUserId: req.user.userId,
        yourRole: req.user.type,
        note: 'ADMINs can view any profile, users can only view their own'
      }
    });
  }
);

/**
 * @swagger
 * /api/v1/users/{userId}/machines:
 *   get:
 *     summary: Get user's machines
 *     description: Get machines owned by a specific user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User's machines
 *       403:
 *         description: Access denied
 */
// TODO: Future MVP+ feature - Get user machines with ownership check
// router.get('/:userId/machines', authMiddleware, requireRoleOrOwnership(['PROVIDER', 'ADMIN'], 'userId'), ...);
router.get('/:userId/machines',
  requestSanitization,
  authMiddleware,
  requireRole(['PROVIDER', 'ADMIN']), // Solo PROVIDERs/ADMINs pueden ver máquinas por ahora (MVP)
  (req: any, res: any) => {
    res.json({
      success: true,
      message: 'User machines endpoint',
      data: {
        requestedUserId: req.params.userId,
        yourUserId: req.user.userId,
        yourRole: req.user.type,
        machines: [],
        note: 'PROVIDERs/ADMINs can view any user machines, users can only view their own'
      }
    });
  }
);

/**
 * @swagger
 * /api/v1/users/directory:
 *   get:
 *     summary: Public user directory
 *     description: List of users available for contact (public profiles)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Public user directory
 */
router.get('/directory',
  requestSanitization,
  authMiddleware,
  // Cualquier usuario autenticado puede ver el directorio público
  (req: any, res: any) => {
    res.json({
      success: true,
      message: 'Public user directory',
      data: {
        note: 'This endpoint shows public user profiles for contact purposes',
        yourRole: req.user.type,
        users: []
      }
    });
  }
);

export default router;