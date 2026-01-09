import { type Request, type Response } from 'express';
import { logger } from '../config/logger.config';
import { type ApiResponse, type ContactUserIdParam, type ListContactsResponse } from '@packages/contracts';
import { AddContactUseCase } from '../application/identity/add-contact.use-case';
import { RemoveContactUseCase } from '../application/identity/remove-contact.use-case';
import { ListContactsUseCase } from '../application/identity/list-contacts.use-case';
import { UserRepository } from '@packages/persistence';

/**
 * Authenticated Request with JWT payload
 * Extends Express Request with user info from authMiddleware
 */
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    type: string;
    iat: number;
    exp: number;
  };
}

/**
 * Contact Management Controller (Sprint #12 Module 2)
 * 
 * Maneja operaciones de gestión de contactos:
 * - Agregar contacto (POST)
 * - Remover contacto (DELETE)
 * - Listar contactos (GET)
 * 
 * Endpoints:
 * - POST   /api/v1/users/me/contacts/:contactUserId
 * - DELETE /api/v1/users/me/contacts/:contactUserId
 * - GET    /api/v1/users/me/contacts
 */
export class ContactController {
  private readonly addContactUseCase: AddContactUseCase;
  private readonly removeContactUseCase: RemoveContactUseCase;
  private readonly listContactsUseCase: ListContactsUseCase;

  constructor() {
    const userRepository = new UserRepository();
    this.addContactUseCase = new AddContactUseCase(userRepository);
    this.removeContactUseCase = new RemoveContactUseCase(userRepository);
    this.listContactsUseCase = new ListContactsUseCase(userRepository);
  }

  /**
   * POST /api/v1/users/me/contacts/:contactUserId
   * 
   * Agrega un usuario como contacto en la agenda personal
   * 
   * Authentication: Required (JWT via authMiddleware)
   * 
   * Path Params:
   * - contactUserId: string - ID del usuario a agregar como contacto
   * 
   * Response:
   * - 201 Created: Contacto agregado exitosamente (o ya existía)
   * - 400 Bad Request: Validación falló (auto-contacto, formato inválido)
   * - 404 Not Found: Usuario o contacto no existe
   * - 500 Internal Server Error: Error de servidor
   */
  async add(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // 1. Extract authenticated user ID (validated by authMiddleware)
      const loggedUserId = req.user!.userId;

      // 2. Extract contactUserId from path params (validated by Zod middleware)
      const { contactUserId } = req.params as ContactUserIdParam;

      logger.info({ loggedUserId, contactUserId }, 'User adding contact');

      // 3. Execute use case
      await this.addContactUseCase.execute(loggedUserId, contactUserId);

      // 4. Return success response
      const response: ApiResponse<void> = {
        success: true,
        message: 'Contact added successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error({ 
        error: (error as Error).message,
        userId: req.user?.userId,
        contactUserId: req.params.contactUserId
      }, 'Error adding contact');

      const { statusCode, errorCode } = this.handleError(error as Error);

      const errorResponse = {
        success: false,
        message: (error as Error).message,
        error: errorCode
      } satisfies ApiResponse<never> & { error: string };

      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * DELETE /api/v1/users/me/contacts/:contactUserId
   * 
   * Remueve un usuario de la lista de contactos
   * 
   * Authentication: Required (JWT via authMiddleware)
   * 
   * Path Params:
   * - contactUserId: string - ID del usuario a remover de contactos
   * 
   * Response:
   * - 200 OK: Contacto removido exitosamente (o no existía)
   * - 400 Bad Request: Validación falló (formato inválido)
   * - 404 Not Found: Usuario no existe
   * - 500 Internal Server Error: Error de servidor
   */
  async remove(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // 1. Extract authenticated user ID
      const loggedUserId = req.user!.userId;

      // 2. Extract contactUserId from path params
      const { contactUserId } = req.params as ContactUserIdParam;

      logger.info({ loggedUserId, contactUserId }, 'User removing contact');

      // 3. Execute use case
      await this.removeContactUseCase.execute(loggedUserId, contactUserId);

      // 4. Return success response
      const response: ApiResponse<void> = {
        success: true,
        message: 'Contact removed successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error({ 
        error: (error as Error).message,
        userId: req.user?.userId,
        contactUserId: req.params.contactUserId
      }, 'Error removing contact');

      const { statusCode, errorCode } = this.handleError(error as Error);

      const errorResponse = {
        success: false,
        message: (error as Error).message,
        error: errorCode
      } satisfies ApiResponse<never> & { error: string };

      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * GET /api/v1/users/me/contacts
   * 
   * Lista todos los contactos del usuario con sus perfiles públicos
   * 
   * Authentication: Required (JWT via authMiddleware)
   * 
   * Response:
   * - 200 OK: Lista de contactos (puede ser array vacío)
   * - 400 Bad Request: Validación falló
   * - 404 Not Found: Usuario no existe
   * - 500 Internal Server Error: Error de servidor
   */
  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // 1. Extract authenticated user ID
      const loggedUserId = req.user!.userId;

      logger.info({ loggedUserId }, 'User listing contacts');

      // 2. Execute use case
      const result: ListContactsResponse = await this.listContactsUseCase.execute(loggedUserId);

      // 3. Return success response
      const response: ApiResponse<ListContactsResponse> = {
        success: true,
        message: 'Contacts retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error({ 
        error: (error as Error).message,
        userId: req.user?.userId
      }, 'Error listing contacts');

      const { statusCode, errorCode } = this.handleError(error as Error);

      const errorResponse = {
        success: false,
        message: (error as Error).message,
        error: errorCode
      } satisfies ApiResponse<never> & { error: string };

      res.status(statusCode).json(errorResponse);
    }
  }

  /**
   * Error handler helper
   * Maps error messages to HTTP status codes
   */
  private handleError(error: Error): { statusCode: number; errorCode: string } {
    const message = error.message.toLowerCase();

    // 400 Bad Request: Validation errors
    if (
      message.includes('invalid') ||
      message.includes('cannot add yourself') ||
      message.includes('format')
    ) {
      return { statusCode: 400, errorCode: 'VALIDATION_ERROR' };
    }

    // 404 Not Found: Resource not found
    if (message.includes('not found')) {
      return { statusCode: 404, errorCode: 'NOT_FOUND' };
    }

    // 409 Conflict: Business rule conflict (e.g., max contacts limit)
    if (message.includes('limit')) {
      return { statusCode: 409, errorCode: 'CONFLICT' };
    }

    // 500 Internal Server Error: Default for unexpected errors
    return { statusCode: 500, errorCode: 'INTERNAL_SERVER_ERROR' };
  }
}
