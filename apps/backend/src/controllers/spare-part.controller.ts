import { Request, Response } from 'express';
import { logger } from '../config/logger.config';
import {
  CreateSparePartUseCase,
  ListSparePartsUseCase,
  GetSparePartUseCase,
  UpdateSparePartUseCase,
  DeleteSparePartUseCase
} from '../application/spare-parts';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * Spare Part Controller
 * Sprint #15/16 - Task 7.1: Alta/edición repuesto (RF-012/014)
 * 
 * Handles HTTP requests for spare parts management
 * Pattern: Similar to MachineTypeController
 * 
 * Responsibilities:
 * - Extract request data (params, body, user)
 * - Delegate to appropriate Use Cases
 * - Transform domain responses to HTTP responses
 * - Handle HTTP-specific concerns (status codes, errors)
 * 
 * All endpoints require authentication (authMiddleware)
 * All requests validated by zodValidationMiddleware
 */
export class SparePartController {
  private createUseCase: CreateSparePartUseCase;
  private listUseCase: ListSparePartsUseCase;
  private getUseCase: GetSparePartUseCase;
  private updateUseCase: UpdateSparePartUseCase;
  private deleteUseCase: DeleteSparePartUseCase;

  constructor() {
    // TODO: Replace with DI container (tsyringe) in future
    this.createUseCase = new CreateSparePartUseCase();
    this.listUseCase = new ListSparePartsUseCase();
    this.getUseCase = new GetSparePartUseCase();
    this.updateUseCase = new UpdateSparePartUseCase();
    this.deleteUseCase = new DeleteSparePartUseCase();
  }

  /**
   * POST /machines/:machineId/spare-parts
   * Create new spare part
   * 
   * Request body validated by CreateSparePartRequestSchema
   * User ID extracted from JWT token
   * Machine ID extracted from URL params
   */
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { machineId } = req.params;

      logger.info({ 
        userId,
        machineId,
        name: req.body.name
      }, 'Creating spare part via API');

      // Merge machineId from params with body data
      const requestData = { ...req.body, machineId };
      const sparePart = await this.createUseCase.execute(userId, requestData);

      res.status(201).json({
        success: true,
        message: 'Spare part created successfully',
        data: sparePart
      });

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';

      logger.error({ 
        error: errorMessage,
        userId: req.user?.userId,
        machineId: req.body?.machineId
      }, 'Failed to create spare part');

      // Map domain errors to HTTP status codes
      if (errorMessage.includes('Machine not found')) {
        res.status(404).json({
          success: false,
          message: 'Machine not found',
          error: 'MACHINE_NOT_FOUND'
        });
        return;
      }

      if (errorMessage.includes('Access denied')) {
        res.status(403).json({
          success: false,
          message: 'Access denied',
          error: 'ACCESS_DENIED'
        });
        return;
      }

      if (errorMessage.includes('already exists')) {
        res.status(409).json({
          success: false,
          message: errorMessage,
          error: 'DUPLICATE_SERIAL_ID'
        });
        return;
      }

      if (errorMessage.includes('validation') || errorMessage.includes('required')) {
        res.status(400).json({
          success: false,
          message: errorMessage,
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Generic error
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /machines/:machineId/spare-parts
   * List all spare parts for a machine
   * 
   * User ID extracted from JWT token
   * Machine ID extracted from URL params
   */
  async listByMachine(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { machineId } = req.params;

      logger.info({ 
        userId,
        machineId
      }, 'Listing spare parts via API');

      const spareParts = await this.listUseCase.execute(userId, machineId);

      res.status(200).json({
        success: true,
        data: spareParts,
        count: spareParts.length
      });

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';

      logger.error({ 
        error: errorMessage,
        userId: req.user?.userId,
        machineId: req.params?.machineId
      }, 'Failed to list spare parts');

      // Map domain errors to HTTP status codes
      if (errorMessage.includes('Machine not found')) {
        res.status(404).json({
          success: false,
          message: 'Machine not found',
          error: 'MACHINE_NOT_FOUND'
        });
        return;
      }

      if (errorMessage.includes('Access denied')) {
        res.status(403).json({
          success: false,
          message: 'Access denied',
          error: 'ACCESS_DENIED'
        });
        return;
      }

      // Generic error
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /machines/:machineId/spare-parts/:id
   * Get spare part by ID
   * 
   * User ID extracted from JWT token
   * Machine ID extracted from URL params (for validation)
   */
  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id, machineId } = req.params;

      logger.info({ 
        userId,
        sparePartId: id
      }, 'Getting spare part details via API');

      const sparePart = await this.getUseCase.execute(userId, id);

      res.status(200).json({
        success: true,
        data: sparePart
      });

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';

      logger.error({ 
        error: errorMessage,
        userId: req.user?.userId,
        sparePartId: req.params?.id
      }, 'Failed to get spare part details');

      // Map domain errors to HTTP status codes
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          message: 'Spare part not found',
          error: 'SPARE_PART_NOT_FOUND'
        });
        return;
      }

      if (errorMessage.includes('Access denied')) {
        res.status(403).json({
          success: false,
          message: 'Access denied',
          error: 'ACCESS_DENIED'
        });
        return;
      }

      // Generic error
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * PATCH /machines/:machineId/spare-parts/:id
   * Update spare part
   * 
   * Request body validated by UpdateSparePartRequestSchema
   * User ID extracted from JWT token
   * Machine ID extracted from URL params (for validation)
   */
  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id, machineId } = req.params;

      logger.info({ 
        userId,
        sparePartId: id,
        updates: req.body
      }, 'Updating spare part via API');

      const sparePart = await this.updateUseCase.execute(userId, id, req.body);

      res.status(200).json({
        success: true,
        message: 'Spare part updated successfully',
        data: sparePart
      });

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';

      logger.error({ 
        error: errorMessage,
        userId: req.user?.userId,
        sparePartId: req.params?.id
      }, 'Failed to update spare part');

      // Map domain errors to HTTP status codes
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          message: 'Spare part not found',
          error: 'SPARE_PART_NOT_FOUND'
        });
        return;
      }

      if (errorMessage.includes('Access denied')) {
        res.status(403).json({
          success: false,
          message: 'Access denied',
          error: 'ACCESS_DENIED'
        });
        return;
      }

      if (errorMessage.includes('already exists')) {
        res.status(409).json({
          success: false,
          message: errorMessage,
          error: 'DUPLICATE_SERIAL_ID'
        });
        return;
      }

      if (errorMessage.includes('validation') || errorMessage.includes('required') || errorMessage.includes('No fields')) {
        res.status(400).json({
          success: false,
          message: errorMessage,
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      // Generic error
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * DELETE /machines/:machineId/spare-parts/:id
   * Delete spare part
   * 
   * User ID extracted from JWT token
   * Machine ID extracted from URL params (for validation)
   */
  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id, machineId } = req.params;

      logger.info({ 
        userId,
        sparePartId: id
      }, 'Deleting spare part via API');

      await this.deleteUseCase.execute(userId, id);

      res.status(200).json({
        success: true,
        message: 'Spare part deleted successfully'
      });

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';

      logger.error({ 
        error: errorMessage,
        userId: req.user?.userId,
        sparePartId: req.params?.id
      }, 'Failed to delete spare part');

      // Map domain errors to HTTP status codes
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          message: 'Spare part not found',
          error: 'SPARE_PART_NOT_FOUND'
        });
        return;
      }

      if (errorMessage.includes('Access denied')) {
        res.status(403).json({
          success: false,
          message: 'Access denied',
          error: 'ACCESS_DENIED'
        });
        return;
      }

      // Generic error
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
      });
    }
  }
}
