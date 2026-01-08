import { Router } from 'express';
import { requestSanitization } from '../middlewares/requestSanitization';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { UserDiscoveryController } from '../controllers/user-discovery.controller';
import { DiscoverUsersQuerySchema } from '@packages/contracts';

const router = Router();
const userDiscoveryController = new UserDiscoveryController();

/**
 * User Discovery Routes
 * 
 * Endpoints for user discovery and exploration.
 * All routes require authentication.
 * Logged-in user is always excluded from their own results.
 * 
 * Sprint #12 - User Communication System - Module 1
 */

/**
 * @swagger
 * /api/v1/users/discover:
 *   get:
 *     summary: Discover users on the platform
 *     description: |
 *       Returns a paginated list of registered users for exploration.
 *       Logged-in user is automatically excluded from results.
 *       Supports search by company name and filtering by user type.
 *       Returns only public data (excludes email, phone, subscriptions).
 *     tags: [User Discovery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Number of users per page (max 50)
 *         example: 20
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description: Search by company name (case-insensitive)
 *         example: "Transportes"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [CLIENT, PROVIDER]
 *         description: Filter by user type
 *         example: "PROVIDER"
 *     responses:
 *       200:
 *         description: Users discovered successfully
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
 *                   example: "Users discovered successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     profiles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "user_abc123"
 *                           profile:
 *                             type: object
 *                             properties:
 *                               companyName:
 *                                 type: string
 *                                 example: "Transportes del Sur SA"
 *                           type:
 *                             type: string
 *                             enum: [CLIENT, PROVIDER]
 *                             example: "CLIENT"
 *                           serviceAreas:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["Excavadoras", "Grúas"]
 *                             description: Only for PROVIDER type
 *                           isVerified:
 *                             type: boolean
 *                             example: true
 *                             description: Only for PROVIDER type
 *                     total:
 *                       type: integer
 *                       example: 47
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid query parameters"
 *                 error:
 *                   type: string
 *                   example: "INVALID_INPUT"
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized - Invalid token"
 *                 error:
 *                   type: string
 *                   example: "UNAUTHORIZED"
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
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "INTERNAL_ERROR"
 */
router.get(
  '/discover',
  requestSanitization, // Sanitize query params
  authMiddleware, // Validate JWT token
  validateRequest({ query: DiscoverUsersQuerySchema }), // Validate query params with Zod
  (req, res) => userDiscoveryController.discoverUsers(req, res) // Execute controller
);

// TODO: Rutas estratégicas para futuras features
// router.get(
//   '/:userId/profile',
//   requestSanitization,
//   authMiddleware,
//   (req, res) => userDiscoveryController.getUserProfileDetail(req, res)
// ); // Vista detallada de perfil público (Module 1.5)

export default router;
