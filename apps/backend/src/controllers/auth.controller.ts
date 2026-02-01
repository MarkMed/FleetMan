import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../config/logger.config';
import { RegisterUserUseCase } from '../application/identity/register-user.use-case';
import { LoginUserUseCase } from '../application/identity/login-user.use-case';
import { LogoutUserUseCase } from '../application/identity/logout-user.use-case';
import { ForgotPasswordUseCase } from '../application/identity/forgot-password.use-case';
import { ResetPasswordUseCase } from '../application/identity/reset-password.use-case';

// TODO: Import contracts schemas cuando estén listas las validaciones finales
// import { RegisterUserRequestSchema, LoginRequestSchema } from '@packages/contracts';

/**
 * AuthController handles authentication-related HTTP requests
 * 
 * Responsibilities:
 * - Call appropriate Use Cases (validation ya se hace en middleware)
 * - Transform domain responses to HTTP responses
 * - Handle HTTP-specific concerns (status codes, headers)
 */
export class AuthController {
  private registerUseCase: RegisterUserUseCase;
  private loginUseCase: LoginUserUseCase;
  private logoutUseCase: LogoutUserUseCase;
  private forgotPasswordUseCase: ForgotPasswordUseCase;
  private resetPasswordUseCase: ResetPasswordUseCase;

  constructor() {
    // TODO: Inyectar dependencias con DI container (tsyringe)
    this.registerUseCase = new RegisterUserUseCase();
    this.loginUseCase = new LoginUserUseCase();
    this.logoutUseCase = new LogoutUserUseCase();
    this.forgotPasswordUseCase = new ForgotPasswordUseCase();
    this.resetPasswordUseCase = new ResetPasswordUseCase();
  }
  
  /**
   * Register a new user (Client or Provider)
   * Los datos ya vienen validados por el middleware validateRegisterUser
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      logger.info({ email: req.body.email }, 'Processing user registration request');
      
      // Los datos ya están validados por el middleware Zod
      const userData = req.body;
      
      // Ejecutar Use Case
      const result = await this.registerUseCase.execute(userData);
      
      logger.info({ 
        userId: result.user.id,
        hasTokens: !!(result.token && result.refreshToken) 
      }, 'User registration completed successfully with auto-login tokens');
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ 
        error: errorMessage,
        email: req.body?.email 
      }, 'User registration failed');
      
      // Mapear errores de dominio a códigos HTTP
      if (errorMessage.includes('Email already registered')) {
        res.status(409).json({
          success: false,
          message: 'Email already exists',
          error: 'EMAIL_ALREADY_EXISTS'
        });
        return;
      }
      
      if (errorMessage.includes('Company name is required')) {
        res.status(400).json({
          success: false,
          message: 'Company name is required for Provider users',
          error: 'VALIDATION_ERROR'
        });
        return;
      }
      
      // Error genérico
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Login user and return JWT token
   * Los datos ya vienen validados por el middleware validateLoginUser
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      logger.info({ email: req.body.email }, 'Processing user login request');
      
      // Ejecutar Use Case de login
      const result = await this.loginUseCase.execute(req.body);
      
      logger.info({ userId: result.user.id }, 'User login completed successfully');
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ 
        error: errorMessage,
        email: req.body?.email 
      }, 'User login failed');
      
      // Mapear errores de dominio a códigos HTTP
      if (errorMessage.includes('Invalid credentials')) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          error: 'INVALID_CREDENTIALS'
        });
        return;
      }
      
      // Error genérico
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Logout user and invalidate JWT token
   * Requires authentication middleware to extract token
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Extraer token del header Authorization
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('Logout attempted without valid authorization header');
        res.status(401).json({
          success: false,
          message: 'Authorization header required',
          error: 'MISSING_TOKEN'
        });
        return;
      }

      const token = authHeader.substring(7); // Remover 'Bearer '

      logger.info('Processing user logout request');

      // Ejecutar Use Case de logout
      await this.logoutUseCase.execute(token);

      logger.info('User logout completed successfully');

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ 
        error: errorMessage 
      }, 'User logout failed');
      
      // Mapear errores de dominio a códigos HTTP
      if (errorMessage.includes('Invalid token')) {
        res.status(401).json({
          success: false,
          message: 'Invalid token',
          error: 'INVALID_TOKEN'
        });
        return;
      }
      
      // Error genérico
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // TODO: Implement refresh token method
  // async refreshToken(req: Request, res: Response): Promise<void> {
  //   // Generate new JWT from refresh token
  // }

  /**
   * Forgot Password - Envía email con link de reset
   * Sprint #15 - Task 2.4: Password Recovery Flow
   * Los datos ya vienen validados por middleware Zod
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      logger.info({ email: req.body.email }, 'Processing forgot password request');

      // Ejecutar Use Case de forgot password
      const result = await this.forgotPasswordUseCase.execute({
        email: req.body.email
      });

      logger.info({ email: req.body.email }, 'Forgot password request processed');

      // Security: Siempre retornar 200 con mensaje genérico (no revelar si email existe)
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error(
        {
          error: errorMessage,
          email: req.body?.email
        },
        'Forgot password request failed'
      );

      // Security: Retornar mensaje genérico incluso si hubo error
      res.status(200).json({
        success: true,
        message: 'Si el email está registrado, recibirás un enlace para restablecer tu contraseña'
      });
    }
  }

  /**
   * Reset Password - Actualiza contraseña con token
   * Sprint #15 - Task 2.4: Password Recovery Flow
   * Los datos ya vienen validados por middleware Zod
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Processing reset password request');

      // Ejecutar Use Case de reset password
      const result = await this.resetPasswordUseCase.execute({
        token: req.body.token,
        newPassword: req.body.password
      });

      logger.info('Password reset completed successfully');

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error(
        {
          error: errorMessage
        },
        'Reset password failed'
      );

      // Mapear errores de dominio a códigos HTTP
      if (errorMessage.includes('inválido') || errorMessage.includes('expirado')) {
        res.status(400).json({
          success: false,
          message: errorMessage,
          error: 'INVALID_OR_EXPIRED_TOKEN'
        });
        return;
      }

      if (errorMessage.includes('desactivada')) {
        res.status(403).json({
          success: false,
          message: errorMessage,
          error: 'ACCOUNT_DEACTIVATED'
        });
        return;
      }

      // Error genérico
      res.status(500).json({
        success: false,
        message: 'Error al procesar la solicitud',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // TODO: Método estratégico - Change Password (cuando usuario está logueado)
  // async changePassword(req: Request, res: Response): Promise<void> {
  //   // Requiere auth middleware + validar currentPassword antes de cambiar
  // }
}