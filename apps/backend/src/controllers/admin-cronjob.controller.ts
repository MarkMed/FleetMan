import { Request, Response } from 'express';
import { logger } from '../config/logger.config';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { MaintenanceCronService } from '../services/cron/maintenance-cron.service';

/**
 * AdminCronJobController handles administrative cronjob operations
 * 
 * Responsibilities:
 * - Permitir ejecución manual del cronjob de alarmas de mantenimiento
 * - Proveer información de estado del scheduler
 * - Facilitar testing y debugging
 * 
 * Security: Solo accesible por usuarios con rol ADMIN
 * 
 * Sprint #11: Maintenance Alarms - Admin Tools
 */
export class AdminCronJobController {
  private maintenanceCronService: MaintenanceCronService;

  constructor(maintenanceCronService: MaintenanceCronService) {
    this.maintenanceCronService = maintenanceCronService;
  }

  /**
   * POST /admin/cronjobs/maintenance-alarms/trigger
   * Ejecuta manualmente el cronjob de alarmas de mantenimiento
   * Útil para testing y verificación sin esperar al schedule
   */
  async triggerMaintenanceAlarmsJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      logger.info({ 
        userId: req.user!.userId,
        triggeredBy: 'manual'
      }, 'Admin triggered maintenance cronjob manually');

      const startTime = Date.now();

      // Ejecutar el cronjob service (ejecuta ambos use cases: update hours + check alarms)
      await this.maintenanceCronService.execute();

      const executionTime = Date.now() - startTime;

      logger.info({ 
        executionTimeMs: executionTime
      }, 'Manual maintenance cronjob completed');

      res.status(200).json({
        success: true,
        message: 'Maintenance cronjob executed successfully',
        data: {
          executionTimeMs: executionTime,
          executedAt: new Date().toISOString(),
          triggeredBy: req.user!.userId,
          note: 'Check logs for detailed execution metrics'
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        userId: req.user!.userId
      }, 'Failed to execute maintenance alarms cronjob');

      res.status(500).json({
        success: false,
        message: 'Failed to execute maintenance alarms cronjob',
        error: errorMessage
      });
    }
  }

  /**
   * GET /admin/cronjobs/maintenance-alarms/status
   * Obtiene información del estado del scheduler
   * Muestra configuración, próxima ejecución, última ejecución
   */
  async getMaintenanceAlarmsJobStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      logger.info({ 
        userId: req.user!.userId
      }, 'Getting maintenance cronjob status');

      // Obtener información del scheduler
      const status = this.maintenanceCronService.getStatus();

      res.status(200).json({
        success: true,
        message: 'Maintenance cronjob status retrieved successfully',
        data: status
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        userId: req.user!.userId
      }, 'Failed to get maintenance alarms cronjob status');

      res.status(500).json({
        success: false,
        message: 'Failed to get cronjob status',
        error: errorMessage
      });
    }
  }

  /**
   * POST /admin/cronjobs/maintenance-alarms/start
   * Inicia el scheduler del cronjob (si fue detenido previamente)
   * Útil para enable/disable feature sin restart
   */
  async startMaintenanceAlarmsJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      logger.info({ 
        userId: req.user!.userId
      }, 'Admin starting maintenance cronjob scheduler');

      this.maintenanceCronService.start();

      res.status(200).json({
        success: true,
        message: 'Maintenance cronjob scheduler started',
        data: {
          startedAt: new Date().toISOString(),
          startedBy: req.user!.userId
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        userId: req.user!.userId
      }, 'Failed to start maintenance alarms cronjob');

      res.status(500).json({
        success: false,
        message: 'Failed to start cronjob scheduler',
        error: errorMessage
      });
    }
  }

  /**
   * POST /admin/cronjobs/maintenance-alarms/stop
   * Detiene el scheduler del cronjob
   * Útil para mantenimiento o debugging
   */
  async stopMaintenanceAlarmsJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      logger.info({ 
        userId: req.user!.userId
      }, 'Admin stopping maintenance cronjob scheduler');

      await this.maintenanceCronService.stop();

      res.status(200).json({
        success: true,
        message: 'Maintenance cronjob scheduler stopped',
        data: {
          stoppedAt: new Date().toISOString(),
          stoppedBy: req.user!.userId
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error({ 
        error: errorMessage,
        userId: req.user!.userId
      }, 'Failed to stop maintenance alarms cronjob');

      res.status(500).json({
        success: false,
        message: 'Failed to stop cronjob scheduler',
        error: errorMessage
      });
    }
  }
}

// TODO: Agregar endpoint de historial de ejecuciones
// Razón: Permitir auditoría de ejecuciones pasadas (timestamps, resultados, errores)
// Declaración:
// async getExecutionHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
//   // Requiere persistencia de logs de ejecución (MongoDB collection o similar)
// }

// TODO: Agregar endpoint para actualizar schedule sin restart
// Razón: Permitir cambiar CRON_MAINTENANCE_SCHEDULE dinámicamente
// Declaración:
// async updateSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
//   const { cronExpression } = req.body;
//   maintenanceAlarmsScheduler.updateSchedule(cronExpression);
// }
