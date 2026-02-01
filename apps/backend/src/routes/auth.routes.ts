import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requestSanitization } from '../middlewares/requestSanitization';
import { 
  validateLoginUser, 
  validateRegisterUser, 
  validateForgotPassword, 
  validateResetPassword 
} from '../middlewares/validation.middleware';
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

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Sends a password reset email with a link valid for 1 hour. Always returns success (security best practice).
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Request processed (generic message for security)
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
 *                   example: "Si el email está registrado, recibirás un enlace para restablecer tu contraseña"
 *       400:
 *         description: Invalid request data (email format)
 */
router.post('/forgot-password',
  requestSanitization,
  validateForgotPassword,
  authController.forgotPassword.bind(authController)
);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     description: Updates user password using the token from the email link. Token is valid for 1 hour.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "MyNewPass123!"
 *                 description: Must contain at least 8 characters, one uppercase, one lowercase, and one number
 *     responses:
 *       200:
 *         description: Password reset successful
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
 *                   example: "Tu contraseña ha sido actualizada exitosamente"
 *       400:
 *         description: Invalid or expired token
 *       403:
 *         description: Account deactivated
 *       500:
 *         description: Internal server error
 */
router.post('/reset-password',
  requestSanitization,
  validateResetPassword,
  authController.resetPassword.bind(authController)
);

export default router;