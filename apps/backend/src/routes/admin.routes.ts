import { Router } from 'express';
import { requestSanitization } from '../middlewares/requestSanitization';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role-check.middleware';
import { AdminCronJobController } from '../controllers/admin-cronjob.controller';
import { maintenanceCronService } from '../main';

const router = Router();

// Lazy initialization: controller needs the service instance
// Service is created in main.ts after DB connection
let adminCronJobController: AdminCronJobController | null = null;

const getController = (): AdminCronJobController => {
  if (!adminCronJobController && maintenanceCronService) {
    adminCronJobController = new AdminCronJobController(maintenanceCronService);
  }
  if (!adminCronJobController) {
    throw new Error('AdminCronJobController not initialized - maintenanceCronService is null');
  }
  return adminCronJobController;
};

/**
 * RUTAS DE ADMINISTRACIÓN - CRONJOBS
 * Endpoints para gestión manual de cronjobs
 * 
 * Security: Requiere autenticación y rol ADMIN
 * Sprint #11: Maintenance Alarms - Admin Tools
 */

/**
 * @swagger
 * /api/v1/admin/cronjobs/maintenance-alarms/trigger:
 *   post:
 *     summary: Manually trigger maintenance alarms cronjob
 *     description: Executes the maintenance alarms check immediately without waiting for scheduled time
 *     tags: [Admin - CronJobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cronjob executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     machinesProcessed:
 *                       type: number
 *                     alarmsUpdated:
 *                       type: number
 *                     alarmsTriggered:
 *                       type: number
 *                     executionTimeMs:
 *                       type: number
 *                     executedAt:
 *                       type: string
 *                       format: date-time
 *                     triggeredBy:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       500:
 *         description: Cronjob execution failed
 */
router.post('/maintenance-alarms/trigger',
  requestSanitization,
  authMiddleware,
  requireRole(['ADMIN']),
  (req, res) => getController().triggerMaintenanceAlarmsJob(req as any, res)
);

/**
 * @swagger
 * /api/v1/admin/cronjobs/maintenance-alarms/status:
 *   get:
 *     summary: Get maintenance alarms cronjob status
 *     description: Returns scheduler status, configuration, and last execution details
 *     tags: [Admin - CronJobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cronjob status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     isRunning:
 *                       type: boolean
 *                     schedule:
 *                       type: string
 *                     timezone:
 *                       type: string
 *                     lastExecution:
 *                       type: string
 *                       format: date-time
 *                     lastResult:
 *                       type: object
 *                     nextExecution:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/maintenance-alarms/status',
  requestSanitization,
  authMiddleware,
  requireRole(['ADMIN']),
  (req, res) => getController().getMaintenanceAlarmsJobStatus(req as any, res)
);

/**
 * @swagger
 * /api/v1/admin/cronjobs/maintenance-alarms/start:
 *   post:
 *     summary: Start maintenance alarms cronjob scheduler
 *     description: Starts the scheduler if it was previously stopped
 *     tags: [Admin - CronJobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Scheduler started successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post('/maintenance-alarms/start',
  requestSanitization,
  authMiddleware,
  requireRole(['ADMIN']),
  (req, res) => getController().startMaintenanceAlarmsJob(req as any, res)
);

/**
 * @swagger
 * /api/v1/admin/cronjobs/maintenance-alarms/stop:
 *   post:
 *     summary: Stop maintenance alarms cronjob scheduler
 *     description: Stops the scheduler (useful for maintenance or debugging)
 *     tags: [Admin - CronJobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Scheduler stopped successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post('/maintenance-alarms/stop',
  requestSanitization,
  authMiddleware,
  requireRole(['ADMIN']),
  (req, res) => getController().stopMaintenanceAlarmsJob(req as any, res)
);

export default router;

// TODO: Agregar endpoints para otros cronjobs futuros
// - NotificationDispatchJob endpoints
// - DataCleanupJob endpoints
// - ManualBackupJob endpoints
