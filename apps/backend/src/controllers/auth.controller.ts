import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../config/logger.config';
import { RegisterUserUseCase } from '../application/identity/register-user.use-case';

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

  constructor() {
    // TODO: Inyectar dependencias con DI container (tsyringe)
    this.registerUseCase = new RegisterUserUseCase();
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
   * TODO: Implementar LoginUserUseCase cuando esté listo
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      logger.info({ email: req.body.email }, 'Processing user login request');
      
      // TODO: Implementar LoginUserUseCase
      // const result = await this.loginUseCase.execute(req.body);
      
      // Respuesta temporal mockeada
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: 'temp-user-id',
            email: req.body.email,
            type: 'CLIENT'
          },
          token: 'temporary-jwt-token-' + Date.now(),
          refreshToken: 'temporary-refresh-token-' + Date.now()
        }
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ 
        error: errorMessage,
        email: req.body?.email 
      }, 'User login failed');
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // TODO: Implement logout method
  // async logout(req: Request, res: Response): Promise<void> {
  //   // Invalidate JWT token (add to blacklist)
  // }

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