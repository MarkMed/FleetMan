import { Router } from 'express';
import { requestSanitization } from '../middlewares/requestSanitization';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserStatsController } from '../controllers/user-stats.controller';

const router = Router();
const userStatsController = new UserStatsController();

/**
 * User Statistics Routes
 * 
 * Endpoints for user statistics and metrics.
 * All routes require authentication (any authenticated user can access).
 * 
 * Purpose:
 * - Feature estratégica solicitada por cliente
 * - Mostrar transparencia del ecosistema
 * - Estimular networking y negocios internos (efecto snowball)
 * - Hookear más usuarios mostrando tamaño de la comunidad
 * 
 * Sprint #12 - User Stats Feature
 */

/**
 * @swagger
 * /api/v1/users/stats/total:
 *   get:
 *     summary: Get total registered users
 *     description: |
 *       Returns the total number of registered users in the system.
 *       No filters applied - counts ALL users regardless of type.
 *       Accessible by any authenticated user.
 *       Strategic feature to show ecosystem size and stimulate networking.
 *     tags: [User Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total users retrieved successfully
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
 *                   example: "Total registered users retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       minimum: 0
 *                       description: Total number of registered users (all types)
 *                       example: 347
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "UNAUTHORIZED"
 *                 message:
 *                   type: string
 *                   example: "Authentication required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "INTERNAL_ERROR"
 *                 message:
 *                   type: string
 *                   example: "Failed to get total users"
 *       503:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "DATABASE_ERROR"
 *                 message:
 *                   type: string
 *                   example: "Database temporarily unavailable"
 */
router.get(
  '/stats/total',
  requestSanitization,
  authMiddleware,
  // No validation needed - no query params
  // No authorization needed - any authenticated user can access
  (req: any, res: any) => userStatsController.getTotalUsers(req, res)
);

// =============================================================================
// FUTURE ROUTES (Strategic, commented for extensibility)
// =============================================================================

// /**
//  * @swagger
//  * /api/v1/users/stats/growth:
//  *   get:
//  *     summary: Get user growth statistics (Admin only)
//  *     description: Returns user growth over time with comparison to previous period
//  *     tags: [User Statistics]
//  *     security:
//  *       - bearerAuth: []
//  */
// router.get(
//   '/stats/growth',
//   requestSanitization,
//   authMiddleware,
//   requireRole(['ADMIN']), // Admin only
//   validateRequest(UserGrowthStatsQuerySchema, 'query'),
//   (req: any, res: any) => userStatsController.getUserGrowthStats(req, res)
// );

// /**
//  * @swagger
//  * /api/v1/users/stats/active:
//  *   get:
//  *     summary: Get active users statistics (Admin only)
//  *     description: Returns count of users active in last N days
//  *     tags: [User Statistics]
//  *     security:
//  *       - bearerAuth: []
//  */
// router.get(
//   '/stats/active',
//   requestSanitization,
//   authMiddleware,
//   requireRole(['ADMIN']), // Admin only
//   validateRequest(ActiveUsersStatsQuerySchema, 'query'),
//   (req: any, res: any) => userStatsController.getActiveUsersStats(req, res)
// );

// /**
//  * @swagger
//  * /api/v1/users/stats/by-region:
//  *   get:
//  *     summary: Get users distribution by region (Admin only)
//  *     description: Returns breakdown of users by geographic region
//  *     tags: [User Statistics]
//  *     security:
//  *       - bearerAuth: []
//  */
// router.get(
//   '/stats/by-region',
//   requestSanitization,
//   authMiddleware,
//   requireRole(['ADMIN']), // Admin only
//   (req: any, res: any) => userStatsController.getUsersByRegionStats(req, res)
// );

export default router;
