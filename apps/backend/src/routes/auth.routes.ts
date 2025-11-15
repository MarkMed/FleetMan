import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requestSanitization } from '../middlewares/requestSanitization';
import { validateLoginUser, validateRegisterUser } from '../middlewares/validation.middleware';

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

// TODO: Implement logout endpoint
// router.post('/logout', authMiddleware, authController.logout);

// TODO: Implement refresh token endpoint  
// router.post('/refresh', authController.refreshToken);

// TODO: Implement forgot password endpoint
// router.post('/forgot-password', authController.forgotPassword);

// TODO: Implement reset password endpoint
// router.post('/reset-password', authController.resetPassword);

export default router;