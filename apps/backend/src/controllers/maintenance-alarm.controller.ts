import { Response } from 'express';
import { logger } from '../config/logger.config';
import {
  CreateMaintenanceAlarmUseCase,
  ListMaintenanceAlarmsUseCase,
  UpdateMaintenanceAlarmUseCase,
  DeleteMaintenanceAlarmUseCase,
  ResetMaintenanceAlarmUseCase
} from '../application/maintenance';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import type { IMaintenanceAlarm } from '@packages/domain';
import type { 
  MaintenanceAlarmDTO, 
  GetMaintenanceAlarmsResponseDTO,
  ApiResponse 
} from '@packages/contracts';

/**
 * MaintenanceAlarmController handles maintenance alarms HTTP requests
 * 
 * Responsibilities:
 * - Call appropriate Use Cases
 * - Transform domain responses to HTTP responses  
 * - Handle HTTP-specific concerns (status codes, headers)
 * 
 * Sprint #11: Maintenance Alarms - HTTP Layer
 */
export class MaintenanceAlarmController {
  private createUseCase: CreateMaintenanceAlarmUseCase;
  private listUseCase: ListMaintenanceAlarmsUseCase;
  private updateUseCase: UpdateMaintenanceAlarmUseCase;
  private deleteUseCase: DeleteMaintenanceAlarmUseCase;
  private resetUseCase: ResetMaintenanceAlarmUseCase;

  constructor() {
    // TODO: Inyectar dependencias con DI container (tsyringe)
    this.createUseCase = new CreateMaintenanceAlarmUseCase();
    this.listUseCase = new ListMaintenanceAlarmsUseCase();
    this.updateUseCase = new UpdateMaintenanceAlarmUseCase();
    this.deleteUseCase = new DeleteMaintenanceAlarmUseCase();
    this.resetUseCase = new ResetMaintenanceAlarmUseCase();
  }

  /**
   * Helper para convertir entidad de dominio a DTO de respuesta
   * Sanitiza datos para respuesta HTTP
   */
  private toResponse(alarm: IMaintenanceAlarm): MaintenanceAlarmDTO {
    return {
      id: alarm.id,
      title: alarm.title,
      description: alarm.description,
      relatedParts: [...alarm.relatedParts], // Convert readonly to mutable array
      intervalHours: alarm.intervalHours,
      accumulatedHours: alarm.accumulatedHours,
      isActive: alarm.isActive,
      createdBy: alarm.createdBy,
      timesTriggered: alarm.timesTriggered,
      lastTriggeredAt: alarm.lastTriggeredAt?.toISOString() ?? null,
      createdAt: alarm.createdAt.toISOString(),
      updatedAt: alarm.updatedAt.toISOString()
    };
  }

  /**
   * POST /machines/:machineId/maintenance-alarms
   * Crea una nueva alarma de mantenimiento
   * Los datos ya vienen validados por el middleware Zod
   */
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { machineId } = req.params;
      
      logger.info({ 
        machineId,
        userId: req.user!.userId,
        alarmTitle: req.body.title
      }, 'Creating maintenance alarm');

      const result = await this.createUseCase.execute({
        machineId,
        title: req.body.title,
        description: req.body.description,
        relatedParts: req.body.relatedParts ?? [],
        intervalHours: req.body.intervalHours,
        createdBy: req.user!.userId
      });

      if (!result.success) {
        res.status(400).json({ success: false, message: result.error.message });
        return;
      }

      const alarm = result.data;

      logger.info({ 
        machineId, 
        alarmId: alarm.id 
      }, 'Maintenance alarm created successfully');

      const responseData: MaintenanceAlarmDTO = this.toResponse(alarm);

      res.status(201).json({
        success: true,
        message: 'Maintenance alarm created successfully',
        data: responseData
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        machineId: req.params.machineId,
        userId: req.user!.userId
      }, 'Failed to create maintenance alarm');

      res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
  }

  /**
   * GET /machines/:machineId/maintenance-alarms
   * Lista las alarmas de mantenimiento de una máquina
   * Query params: isActive (optional)
   */
  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { machineId } = req.params;
      const isActive = req.query.isActive as boolean | undefined;

      logger.info({ 
        machineId,
        isActive,
        userId: req.user!.userId
      }, 'Listing maintenance alarms');

      const result = await this.listUseCase.execute({
        machineId,
        isActive
      });

      if (!result.success) {
        res.status(400).json({ success: false, message: result.error.message });
        return;
      }

      const alarms = result.data;

      logger.info({ 
        machineId, 
        alarmsCount: alarms.length 
      }, 'Maintenance alarms retrieved successfully');

      // Calculate activeCount for response
      const activeCount = alarms.filter((alarm: IMaintenanceAlarm) => alarm.isActive).length;

      const responseData: GetMaintenanceAlarmsResponseDTO = {
        alarms: alarms.map((alarm: IMaintenanceAlarm) => this.toResponse(alarm)),
        total: alarms.length,
        activeCount
      };

      res.status(200).json({
        success: true,
        message: 'Maintenance alarms retrieved successfully',
        data: responseData
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        machineId: req.params.machineId,
        userId: req.user!.userId
      }, 'Failed to list maintenance alarms');

      res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
  }

  /**
   * PATCH /machines/:machineId/maintenance-alarms/:alarmId
   * Actualiza una alarma de mantenimiento existente
   * Permite actualización parcial
   */
  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { machineId, alarmId } = req.params;
      
      logger.info({ 
        machineId,
        alarmId,
        userId: req.user!.userId,
        updates: Object.keys(req.body)
      }, 'Updating maintenance alarm');

      const result = await this.updateUseCase.execute({
        machineId,
        alarmId,
        ...req.body // Spread body fields (title, description, etc.)
      });

      if (!result.success) {
        res.status(400).json({ success: false, message: result.error.message });
        return;
      }

      const alarm = result.data;

      logger.info({ 
        machineId, 
        alarmId 
      }, 'Maintenance alarm updated successfully');

      const responseData: MaintenanceAlarmDTO = this.toResponse(alarm);

      res.status(200).json({
        success: true,
        message: 'Maintenance alarm updated successfully',
        data: responseData
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        machineId: req.params.machineId,
        alarmId: req.params.alarmId,
        userId: req.user!.userId
      }, 'Failed to update maintenance alarm');

      res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
  }

  /**
   * DELETE /machines/:machineId/maintenance-alarms/:alarmId
   * Elimina una alarma de mantenimiento
   * Eliminación física del array
   */
  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { machineId, alarmId } = req.params;
      
      logger.info({ 
        machineId,
        alarmId,
        userId: req.user!.userId
      }, 'Deleting maintenance alarm');

      const result = await this.deleteUseCase.execute({
        machineId,
        alarmId
      });

      if (!result.success) {
        res.status(400).json({ success: false, message: result.error.message });
        return;
      }

      logger.info({ 
        machineId, 
        alarmId 
      }, 'Maintenance alarm deleted successfully');

      res.status(200).json({
        success: true,
        message: 'Maintenance alarm deleted successfully'
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        machineId: req.params.machineId,
        alarmId: req.params.alarmId,
        userId: req.user!.userId
      }, 'Failed to delete maintenance alarm');

      res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
  }

  /**
   * POST /machines/:machineId/maintenance-alarms/:alarmId/reset
   * Reinicia el acumulador de horas de una alarma (después de mantenimiento completado)
   */
  async reset(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { machineId, alarmId } = req.params;
      
      logger.info({ 
        machineId,
        alarmId,
        userId: req.user!.userId
      }, 'Resetting maintenance alarm accumulator');

      const result = await this.resetUseCase.execute({
        machineId,
        alarmId
      });

      if (!result.success) {
        res.status(400).json({ success: false, message: result.error.message });
        return;
      }

      const alarm = result.data;

      logger.info({ 
        machineId, 
        alarmId 
      }, 'Maintenance alarm reset successfully');

      const responseData: MaintenanceAlarmDTO = this.toResponse(alarm);

      res.status(200).json({
        success: true,
        message: 'Maintenance alarm reset successfully (accumulated hours set to 0)',
        data: responseData
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        machineId: req.params.machineId,
        alarmId: req.params.alarmId,
        userId: req.user!.userId
      }, 'Failed to reset maintenance alarm');

      res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
  }
}

// TODO: Mejorar manejo de errores granular
// Razón: Diferenciar entre Machine not found, Alarm not found, Authorization errors
// Declaración: 
// if (error instanceof MachineNotFoundError) res.status(404)
// if (error instanceof UnauthorizedError) res.status(403)
// if (error instanceof ValidationError) res.status(422)
