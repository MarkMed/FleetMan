import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../config/logger.config';
import { RegisterUserUseCase } from '../application/identity/register-user.use-case';
import { LoginUserUseCase } from '../application/identity/login-user.use-case';
import { LogoutUserUseCase } from '../application/identity/logout-user.use-case';

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

  constructor() {
    // TODO: Inyectar dependencias con DI container (tsyringe)
    this.registerUseCase = new RegisterUserUseCase();
    this.loginUseCase = new LoginUserUseCase();
    this.logoutUseCase = new LogoutUserUseCase();
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
      
      logger.info({ userId: result.id }, 'User registration completed successfully');
      
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

  // TODO: Implement forgot password method
  // async forgotPassword(req: Request, res: Response): Promise<void> {
  //   // Send password reset email
  // }

  // TODO: Implement reset password method  
  // async resetPassword(req: Request, res: Response): Promise<void> {
  //   // Reset password with token
  // }
}