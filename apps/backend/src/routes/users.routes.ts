import { Router } from 'express';
import { requestSanitization } from '../middlewares/requestSanitization';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role-check.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { UpdateUserRequestSchema } from '@packages/contracts';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

/**
 * RUTAS DE USUARIOS
 * Sprint #13 Tasks 10.1 + 10.2: User Profile Editing + Bio & Tags
 * 
 * Nuevas rutas:
 * - PATCH /me/profile - Actualizar perfil propio (phone, companyName, address, bio, tags)
 * 
 * Rutas legacy (ejemplos de autorización combinada rol + ownership):
 * - GET / - List all users (admin only)
 * - GET /:userId/profile - Get user profile (admin only, MVP)
 * - GET /:userId/machines - Get user machines (provider/admin only, MVP)
 * - GET /directory - Public user directory
 */

/**
 * @swagger
 * /api/v1/users/me/profile:
 *   patch:
 *     summary: Update own user profile
 *     description: |
 *       Allows authenticated users to update their own profile information.
 *       Ownership is enforced by authMiddleware (only authenticated user can edit their own profile).
 *       
 *       **Sprint #13 Tasks 10.1 + 10.2: User Profile Editing + Bio & Tags**
 *       
 *       Editable fields:
 *       - phone (optional, max 20 chars, validated format)
 *       - companyName (optional, max 100 chars)
 *       - address (optional, max 200 chars)
 *       - bio (optional, max 500 chars) - NEW in Sprint #13
 *       - tags (optional, array max 5, each max 100 chars) - NEW in Sprint #13
 *       
 *       Non-editable fields (excluded from this endpoint):
 *       - email (requires separate verification flow)
 *       - isActive (admin-only operation)
 *       - subscriptionLevel / serviceAreas (future functionality)
 *       
 *       Validation layers:
 *       1. Zod schema (contracts) - format & structure validation
 *       2. Domain entity - business rules validation
 *       3. Mongoose schema - database constraint validation
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                     example: "+123456789"
 *                     description: Phone number in international format
 *                   companyName:
 *                     type: string
 *                     example: "Fleet Management Solutions Inc."
 *                     maxLength: 100
 *                   address:
 *                     type: string
 *                     example: "123 Main St, Springfield, USA"
 *                     maxLength: 200
 *                   bio:
 *                     type: string
 *                     example: "Fleet management company specializing in heavy machinery maintenance and tracking."
 *                     maxLength: 500
 *                     description: User/company biography (Sprint #13 Task 10.2)
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["construction", "heavy-machinery", "maintenance", "tracking"]
 *                     maxItems: 5
 *                     description: Tags for user discovery and categorization (Sprint #13 Task 10.2, each tag max 100 chars)
 *           examples:
 *             updateBioAndTags:
 *               summary: Update bio and tags
 *               value:
 *                 profile:
 *                   bio: "Leading provider of construction equipment maintenance services in North America."
 *                   tags: ["construction", "excavators", "maintenance", "certified"]
 *             updateContactInfo:
 *               summary: Update contact information
 *               value:
 *                 profile:
 *                   phone: "+1234567890"
 *                   address: "456 Industrial Ave, Los Angeles, CA"
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: "Profile updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     profile:
 *                       type: object
 *                       properties:
 *                         phone:
 *                           type: string
 *                         companyName:
 *                           type: string
 *                         address:
 *                           type: string
 *                         bio:
 *                           type: string
 *                         tags:
 *                           type: array
 *                           items:
 *                             type: string
 *                     type:
 *                       type: string
 *                       enum: [CLIENT, PROVIDER]
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error (Zod, domain rules, or Mongoose constraints)
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
 *                   example: "Bio is too long (max 500 characters)"
 *                 error:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *       401:
 *         description: Not authenticated (missing or invalid token)
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
 *                   example: "Access denied. Token required."
 *                 error:
 *                   type: string
 *                   example: "MISSING_TOKEN"
 *       403:
 *         description: User account is deactivated
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
 *                   example: "Cannot update deactivated user profile"
 *                 error:
 *                   type: string
 *                   example: "USER_DEACTIVATED"
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch('/me/profile',
  requestSanitization,
  authMiddleware, // Garantiza req.user.userId existe
  validateRequest({ body: UpdateUserRequestSchema }), // Validación Zod
  userController.updateProfile // Controller invoca use case
);

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