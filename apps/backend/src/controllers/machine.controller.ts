import { Request, Response } from 'express';
import { logger } from '../config/logger.config';
import {
  CreateMachineUseCase,
  GetMachineUseCase,
  UpdateMachineUseCase,
  ListMachinesUseCase,
  DeleteMachineUseCase
} from '../application/inventory';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Machine } from '@packages/domain';
import type { CreateMachineResponse } from '@packages/contracts';

/**
 * MachineController handles machine-related HTTP requests
 * 
 * Responsibilities:
 * - Call appropriate Use Cases
 * - Transform domain responses to HTTP responses
 * - Handle HTTP-specific concerns (status codes, headers)
 */
export class MachineController {
  private createUseCase: CreateMachineUseCase;
  private getUseCase: GetMachineUseCase;
  private updateUseCase: UpdateMachineUseCase;
  private listUseCase: ListMachinesUseCase;
  private deleteUseCase: DeleteMachineUseCase;

  constructor() {
    // TODO: Inyectar dependencias con DI container (tsyringe)
    this.createUseCase = new CreateMachineUseCase();
    this.getUseCase = new GetMachineUseCase();
    this.updateUseCase = new UpdateMachineUseCase();
    this.listUseCase = new ListMachinesUseCase();
    this.deleteUseCase = new DeleteMachineUseCase();
  }

  /**
   * Helper para convertir entidad de dominio a DTO de respuesta
   * Tipado fuerte: TypeScript nos forzará a incluir todos los campos del contrato
   */
  private toResponse(machine: Machine): CreateMachineResponse {
    const publicInterface = machine.toPublicInterface();
    return {
      id: publicInterface.id,
      serialNumber: publicInterface.serialNumber,
      brand: publicInterface.brand,
      modelName: publicInterface.modelName,
      nickname: publicInterface.nickname ?? null,
      machineTypeId: publicInterface.machineTypeId,
      ownerId: publicInterface.ownerId,
      createdById: publicInterface.createdById,
      assignedProviderId: publicInterface.assignedProviderId,
      providerAssignedAt: publicInterface.providerAssignedAt?.toISOString(),
      assignedTo: publicInterface.assignedTo,
      usageSchedule: publicInterface.usageSchedule,
      machinePhotoUrl: publicInterface.machinePhotoUrl,
      status: publicInterface.status.code,
      specs: publicInterface.specs ?? null,
      location: publicInterface.location ? {
        ...publicInterface.location,
        lastUpdated: publicInterface.location.lastUpdated.toISOString()
      } : null,
      createdAt: publicInterface.createdAt.toISOString(),
      updatedAt: publicInterface.updatedAt.toISOString()
    };
  }

  /**
   * POST /machines
   * Crea una nueva máquina
   * Los datos ya vienen validados por el middleware Zod
   */
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
          error: 'MISSING_AUTH'
        });
        return;
      }

      logger.info({ 
        serialNumber: req.body.serialNumber,
        userId: req.user.userId 
      }, 'Creating machine');

      const machine = await this.createUseCase.execute({
        ...req.body,
        ownerId: req.user.userId,
        createdById: req.user.userId
      });

      logger.info({ id: machine.id.getValue() }, 'Machine created successfully');

      res.status(201).json({
        success: true,
        message: 'Machine created successfully',
        data: this.toResponse(machine)
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        serialNumber: req.body?.serialNumber 
      }, 'Failed to create machine');

      // Mapear errores de dominio a códigos HTTP
      if (errorMessage.includes('already exists')) {
        res.status(409).json({
          success: false,
          message: errorMessage,
          error: 'DUPLICATE_SERIAL'
        });
        return;
      }

      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'RESOURCE_NOT_FOUND'
        });
        return;
      }

      if (errorMessage.includes('validation') || errorMessage.includes('Invalid')) {
        res.status(400).json({
          success: false,
          message: errorMessage,
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /machines/:id
   * Obtiene una máquina por ID
   */
  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
          error: 'MISSING_AUTH'
        });
        return;
      }

      const { id } = req.params;

      logger.info({ id, userId: req.user.userId }, 'Getting machine by ID');

      const machine = await this.getUseCase.execute(
        id,
        req.user.userId,
        req.user.type
      );

      res.status(200).json({
        success: true,
        message: 'Machine retrieved successfully',
        data: this.toResponse(machine)
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        id: req.params?.id 
      }, 'Failed to get machine');

      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'NOT_FOUND'
        });
        return;
      }

      if (errorMessage.includes('Access denied')) {
        res.status(403).json({
          success: false,
          message: errorMessage,
          error: 'FORBIDDEN'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /machines
   * Lista máquinas con filtros y paginación
   */
  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
          error: 'MISSING_AUTH'
        });
        return;
      }

      logger.info({ userId: req.user.userId }, 'Listing machines');

      const result = await this.listUseCase.execute(
        req.query as any,
        req.user.userId,
        req.user.type
      );

      res.status(200).json({
        success: true,
        message: 'Machines retrieved successfully',
        data: {
          machines: result.items.map(m => this.toResponse(m)),
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
          }
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage
      }, 'Failed to list machines');

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * PUT /machines/:id
   * Actualiza una máquina
   */
  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
          error: 'MISSING_AUTH'
        });
        return;
      }

      const { id } = req.params;

      logger.info({ id, userId: req.user.userId }, 'Updating machine');

      const machine = await this.updateUseCase.execute(
        id,
        req.body,
        req.user.userId,
        req.user.type
      );

      logger.info({ id }, 'Machine updated successfully');

      res.status(200).json({
        success: true,
        message: 'Machine updated successfully',
        data: this.toResponse(machine)
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        id: req.params?.id 
      }, 'Failed to update machine');

      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'NOT_FOUND'
        });
        return;
      }

      if (errorMessage.includes('Access denied')) {
        res.status(403).json({
          success: false,
          message: errorMessage,
          error: 'FORBIDDEN'
        });
        return;
      }

      if (errorMessage.includes('validation') || errorMessage.includes('Invalid')) {
        res.status(400).json({
          success: false,
          message: errorMessage,
          error: 'VALIDATION_ERROR'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * DELETE /machines/:id
   * Elimina una máquina
   */
  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
          error: 'MISSING_AUTH'
        });
        return;
      }

      const { id } = req.params;

      logger.info({ id, userId: req.user.userId }, 'Deleting machine');

      await this.deleteUseCase.execute(
        id,
        req.user.userId,
        req.user.type
      );

      logger.info({ id }, 'Machine deleted successfully');

      res.status(200).json({
        success: true,
        message: 'Machine deleted successfully'
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        id: req.params?.id 
      }, 'Failed to delete machine');

      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'NOT_FOUND'
        });
        return;
      }

      if (errorMessage.includes('Access denied')) {
        res.status(403).json({
          success: false,
          message: errorMessage,
          error: 'FORBIDDEN'
        });
        return;
      }

      if (errorMessage.includes('Cannot delete')) {
        res.status(409).json({
          success: false,
          message: errorMessage,
          error: 'CONFLICT'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
      });
    }
  }
}
