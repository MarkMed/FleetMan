import { Response } from 'express';
import { logger } from '../config/logger.config';
import { DiscoverUsersUseCase } from '../application/identity/discover-users.use-case';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import type { 
  DiscoverUsersQuery, 
  PaginatedUsers,
  DiscoverUsersResponse,
  ApiResponse 
} from '@packages/contracts';

/**
 * UserDiscoveryController handles User Discovery HTTP requests
 * 
 * Responsibilities:
 * - Call DiscoverUsersUseCase
 * - Transform domain responses to HTTP responses
 * - Handle HTTP-specific concerns (status codes, headers)
 * - Map domain errors to HTTP status codes
 * 
 * Authentication: Required (authMiddleware in routes)
 * Logged-in user is ALWAYS excluded from their own search results
 * 
 * Sprint #12 - User Communication System - Module 1
 */
export class UserDiscoveryController {
  private discoverUsersUseCase: DiscoverUsersUseCase;

  constructor() {
    this.discoverUsersUseCase = new DiscoverUsersUseCase();
  }

  /**
   * Maps errors to HTTP response with status code and error code
   */
  private handleError(error: Error): { statusCode: number; errorCode: string } {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('not found')) {
      return { statusCode: 404, errorCode: 'NOT_FOUND' };
    }

    if (errorMessage.includes('invalid') || errorMessage.includes('format')) {
      return { statusCode: 400, errorCode: 'INVALID_INPUT' };
    }

    if (errorMessage.includes('forbidden') || errorMessage.includes('access denied')) {
      return { statusCode: 403, errorCode: 'FORBIDDEN' };
    }

    return { statusCode: 500, errorCode: 'INTERNAL_ERROR' };
  }

  /**
   * GET /users/discover
   * Discovers users for exploration (excludes logged-in user)
   * 
   * Query params validated by Zod middleware (DiscoverUsersQuerySchema):
   * - page?: number - Current page (default: 1)
   * - limit?: number - Items per page (default: 20, max: 50)
   * - searchTerm?: string - Search by company name (case-insensitive)
   * - type?: 'CLIENT' | 'PROVIDER' - Filter by user type
   * 
   * Authentication: Required (JWT via authMiddleware)
   * Returns: Public user profiles (sanitized, no sensitive data)
   */
  async discoverUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract authenticated user ID (validated by authMiddleware)
      const loggedUserId = req.user!.userId;

      // Query params already validated and parsed by Zod middleware
      // Cast needed: Express ParsedQs → unknown → DiscoverUsersQuery
      // Middleware garantiza que la estructura es válida
      const filters: DiscoverUsersQuery = req.query as unknown as DiscoverUsersQuery;

      logger.info({ 
        loggedUserId, 
        filters 
      }, 'User discovering other users');

      // Execute use case - result is typed as PaginatedUsers (SSOT)
      // TypeScript knows: result.profiles, result.total, result.page, etc.
      const result: PaginatedUsers = await this.discoverUsersUseCase.execute(loggedUserId, filters);

      // Compose ApiResponse with PaginatedUsers data
      // Type annotation ensures compile-time validation
      const response: DiscoverUsersResponse = {
        success: true,
        message: 'Users discovered successfully',
        data: result // TypeScript validates: result matches PaginatedUsers
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error({ 
        error: (error as Error).message,
        userId: req.user?.userId
      }, 'Error discovering users');

      const { statusCode, errorCode } = this.handleError(error as Error);

      // Type-safe error response validation using satisfies
      const errorResponse = {
        success: false,
        message: (error as Error).message,
        error: errorCode
      } satisfies ApiResponse<never> & { error: string };

      res.status(statusCode).json(errorResponse);
    }
  }

  // TODO: Métodos estratégicos para futuras features
  // async getUserProfileDetail(req: AuthenticatedRequest, res: Response): Promise<void> {
  //   // GET /users/:userId/profile - Vista detallada de perfil público
  //   // Incluye: machineCount, rating, joinedDate, location
  //   // Útil para ver detalles antes de agregar contacto (Module 1.5)
  //   // Response type: Promise<void> with satisfies UserProfileDetailResponse
  // }
}
