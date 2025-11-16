import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requestSanitization } from '../middlewares/requestSanitization';
import { validateLoginUser, validateRegisterUser } from '../middlewares/validation.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account (Client or Provider)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterUserResponse'
 *       400:
 *         description: Invalid request data
 *       409:
 *         description: Email already exists
 */
router.post('/register', 
  requestSanitization,
  validateRegisterUser,
  authController.register.bind(authController)
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates user and returns JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Invalid request data
 */
router.post('/login',
  requestSanitization,
  validateLoginUser,
  authController.login.bind(authController)
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Invalidates user JWT token by adding it to blacklist
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
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
 *                   example: "Logout successful"
 *       401:
 *         description: Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/logout',
  requestSanitization,
  authController.logout.bind(authController)
);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user info
 *     description: Returns current authenticated user information (test endpoint)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
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
 *                   example: "User info retrieved"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     type:
 *                       type: string
 *       401:
 *         description: Unauthorized - invalid or missing token
 */
router.get('/me',
  requestSanitization,
  authMiddleware,
  (req: any, res: any) => {
    res.json({
      success: true,
      message: 'User info retrieved',
      data: {
        userId: req.user.userId,
        email: req.user.email,
        type: req.user.type,
        tokenExpiry: new Date(req.user.exp * 1000).toISOString()
      }
    });
  }
);

// TODO: Implement refresh token endpoint  
// router.post('/refresh', authController.refreshToken);

// TODO: Implement forgot password endpoint
// router.post('/forgot-password', authController.forgotPassword);

// TODO: Implement reset password endpoint
// router.post('/reset-password', authController.resetPassword);

export default router;