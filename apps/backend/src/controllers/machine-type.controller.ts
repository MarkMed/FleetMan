import { Request, Response } from 'express';
import { logger } from '../config/logger.config';
import {
  ListMachineTypesUseCase,
  CreateMachineTypeUseCase,
  UpdateMachineTypeUseCase,
  DeleteMachineTypeUseCase
} from '../application/inventory';
import { MachineTypeResponse } from '@packages/contracts';
import { MachineType } from '@packages/domain';

/**
 * MachineTypeController handles machine type-related HTTP requests
 * 
 * Responsibilities:
 * - Call appropriate Use Cases (validation ya se hace en middleware)
 * - Transform domain responses to HTTP responses
 * - Handle HTTP-specific concerns (status codes, headers)
 */
export class MachineTypeController {
  private listUseCase: ListMachineTypesUseCase;
  private createUseCase: CreateMachineTypeUseCase;
  private updateUseCase: UpdateMachineTypeUseCase;
  private deleteUseCase: DeleteMachineTypeUseCase;

  constructor() {
    // TODO: Inyectar dependencias con DI container (tsyringe)
    this.listUseCase = new ListMachineTypesUseCase();
    this.createUseCase = new CreateMachineTypeUseCase();
    this.updateUseCase = new UpdateMachineTypeUseCase();
    this.deleteUseCase = new DeleteMachineTypeUseCase();
  }

  /**
   * Helper para convertir entidad de dominio a DTO de respuesta
   */
  private toResponse(machineType: MachineType): MachineTypeResponse {
    return {
      id: machineType.id,
      name: machineType.name,
      languages: machineType.languages
    };
  }

  /**
   * GET /machine-types
   * Lista todos los tipos de máquina, opcionalmente filtrados por idioma
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const language = req.query.language as string | undefined;
      
      logger.info({ language }, 'Listing machine types');
      
      const machineTypes = await this.listUseCase.execute(language);
      
      res.status(200).json({
        success: true,
        message: 'Machine types retrieved successfully',
        data: machineTypes.map(mt => this.toResponse(mt)),
        count: machineTypes.length
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ 
        error: errorMessage,
        language: req.query.language 
      }, 'Failed to list machine types');
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * POST /machine-types
   * Crea un nuevo tipo de máquina o agrega idioma a uno existente
   * Los datos ya vienen validados por el middleware Zod
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      logger.info({ name: req.body.name, language: req.body.language }, 'Creating machine type');
      
      const machineType = await this.createUseCase.execute(req.body);
      
      logger.info({ id: machineType.id }, 'Machine type created successfully');
      
      res.status(201).json({
        success: true,
        message: 'Machine type created successfully',
        data: this.toResponse(machineType)
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ 
        error: errorMessage,
        name: req.body?.name 
      }, 'Failed to create machine type');
      
      // Mapear errores de dominio a códigos HTTP
      if (errorMessage.includes('ya existe') || errorMessage.includes('already exists')) {
        res.status(409).json({
          success: false,
          message: 'Machine type with this name already exists',
          error: 'DUPLICATE_NAME'
        });
        return;
      }
      
      if (errorMessage.includes('validación') || errorMessage.includes('validation')) {
        res.status(400).json({
          success: false,
          message: errorMessage,
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
   * PUT /machine-types/:id
   * Actualiza el nombre de un tipo de máquina
   * Los datos ya vienen validados por el middleware Zod
   * 
   * TODO: Agregar middleware requireRole(['ADMIN']) para restringir acceso
   * Solo usuarios administradores deberían poder actualizar tipos de máquina
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info({ id, newName: req.body.name }, 'Updating machine type');
      
      const machineType = await this.updateUseCase.execute(id, req.body);
      
      logger.info({ id }, 'Machine type updated successfully');
      
      res.status(200).json({
        success: true,
        message: 'Machine type updated successfully',
        data: this.toResponse(machineType)
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ 
        error: errorMessage,
        id: req.params?.id 
      }, 'Failed to update machine type');
      
      // Mapear errores de dominio a códigos HTTP
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          message: 'Machine type not found',
          error: 'NOT_FOUND'
        });
        return;
      }
      
      if (errorMessage.includes('validación') || errorMessage.includes('validation')) {
        res.status(400).json({
          success: false,
          message: errorMessage,
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
   * DELETE /machine-types/:id
   * Elimina un tipo de máquina
   * 
   * TODO: Agregar middleware requireRole(['ADMIN']) para restringir acceso
   * Solo usuarios administradores deberían poder eliminar tipos de máquina
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info({ id }, 'Deleting machine type');
      
      await this.deleteUseCase.execute(id);
      
      logger.info({ id }, 'Machine type deleted successfully');
      
      res.status(200).json({
        success: true,
        message: 'Machine type deleted successfully'
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ 
        error: errorMessage,
        id: req.params?.id 
      }, 'Failed to delete machine type');
      
      // Mapear errores de dominio a códigos HTTP
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          message: 'Machine type not found',
          error: 'NOT_FOUND'
        });
        return;
      }
      
      if (errorMessage.includes('in use') || errorMessage.includes('machines are using')) {
        res.status(409).json({
          success: false,
          message: errorMessage,
          error: 'IN_USE'
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
}
