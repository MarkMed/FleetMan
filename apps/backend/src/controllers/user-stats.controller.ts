import { Response } from 'express';
import { logger } from '../config/logger.config';
import { GetTotalUsersUseCase } from '../application/identity/get-total-users.use-case';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import type { 
  GetTotalUsersResponse,
  GetTotalUsersApiResponse,
  ApiResponse 
} from '@packages/contracts';

/**
 * UserStatsController handles User Statistics HTTP requests
 * 
 * Responsibilities:
 * - Call GetTotalUsersUseCase
 * - Transform domain responses to HTTP responses
 * - Handle HTTP-specific concerns (status codes, headers)
 * - Map errors to appropriate HTTP status codes
 * 
 * Authentication: Required (authMiddleware in routes)
 * Authorization: Any authenticated user can access (no role restrictions)
 * 
 * Privacy: Only exposes aggregate data (total count)
 * Purpose: Strategic feature requested by client (snowball effect)
 * 
 * Sprint #12 - User Stats Feature
 */
export class UserStatsController {
  private getTotalUsersUseCase: GetTotalUsersUseCase;

  constructor() {
    this.getTotalUsersUseCase = new GetTotalUsersUseCase();
  }

  /**
   * Maps errors to HTTP response with status code and error code
   */
  private handleError(error: Error): { statusCode: number; errorCode: string } {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('database') || errorMessage.includes('persistence')) {
      return { statusCode: 503, errorCode: 'DATABASE_ERROR' };
    }

    if (errorMessage.includes('timeout')) {
      return { statusCode: 504, errorCode: 'TIMEOUT' };
    }

    return { statusCode: 500, errorCode: 'INTERNAL_ERROR' };
  }

  /**
   * GET /users/stats/total
   * Returns total number of registered users in the system
   * 
   * No query params needed (simple count, no filters)
   * 
   * Authentication: Required (JWT via authMiddleware)
   * Authorization: Any authenticated user (CLIENT, PROVIDER, ADMIN, etc.)
   * 
   * Response: { success: true, message: string, data: { totalUsers: number } }
   * 
   * Use cases:
   * - Display on landing/dashboard to show ecosystem size
   * - Marketing hook (show community growth)
   * - Stimulate networking and internal business
   * - Snowball effect: más usuarios ven números altos → más confianza → más registros
   */
  async getTotalUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // No need to extract userId - this is aggregate public data
      // Any authenticated user can see this (validated by authMiddleware)

      logger.info({ 
        userId: req.user?.userId,
        userType: req.user?.type 
      }, 'User requesting total registered users');

      // Execute use case (no params needed - aggregate query)
      const totalUsersData = await this.getTotalUsersUseCase.execute();

      // Build success response (ApiResponse wrapper)
      const response: GetTotalUsersApiResponse = {
        success: true,
        message: 'Total registered users retrieved successfully',
        data: totalUsersData
      };

      logger.info({ 
        totalUsers: totalUsersData.totalUsers,
        requestedBy: req.user?.userId 
      }, 'Total users retrieved successfully');

      res.status(200).json(response);
    } catch (error) {
      // Map error to appropriate HTTP status
      const { statusCode, errorCode } = this.handleError(error as Error);
      
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
        statusCode,
        errorCode
      }, 'Error getting total users');

      res.status(statusCode).json({
        success: false,
        error: errorCode,
        message: error instanceof Error ? error.message : 'Failed to get total users'
      });
    }
  }
}

// =============================================================================
// FUTURE CONTROLLER METHODS (Strategic, commented for extensibility)
// =============================================================================

// /**
//  * GET /users/stats/growth
//  * Returns user growth statistics over time
//  * 
//  * Query params:
//  * - period: '7d' | '30d' | '90d' | '1y' (default: '30d')
//  * 
//  * Authentication: Admin only (strategic data)
//  * Response: { totalUsers, newUsers, growthRate, breakdown }
//  */
// async getUserGrowthStats(req: AuthenticatedRequest, res: Response): Promise<void> {
//   // TODO: Implement when GetUserGrowthStatsUseCase is created
//   // Requires requireRole(['ADMIN']) middleware
// }

// /**
//  * GET /users/stats/active
//  * Returns active users statistics (logged in last N days)
//  * 
//  * Query params:
//  * - period: '7d' | '30d' | '90d' (default: '30d')
//  * 
//  * Authentication: Admin only (KPI data)
//  * Response: { totalActive, period, breakdown, activityRate }
//  */
// async getActiveUsersStats(req: AuthenticatedRequest, res: Response): Promise<void> {
//   // TODO: Implement when GetActiveUsersStatsUseCase is created
//   // Requires User.lastLoginAt field
// }

// /**
//  * GET /users/stats/by-region
//  * Returns user distribution by geographic region
//  * 
//  * No query params
//  * 
//  * Authentication: Admin only (strategic market data)
//  * Response: { regions: [{ region, totalUsers, breakdown }] }
//  */
// async getUsersByRegionStats(req: AuthenticatedRequest, res: Response): Promise<void> {
//   // TODO: Implement when GetUsersByRegionStatsUseCase is created
//   // Requires User.profile.region field
// }
