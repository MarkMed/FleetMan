import cron, { type ScheduledTask } from 'node-cron';
import { logger } from '../../config/logger.config';
import { UpdateMachinesOperatingHoursUseCase } from '../../application/maintenance/update-machines-operating-hours.use-case';
import { CheckMaintenanceAlarmsUseCase } from '../../application/maintenance/check-maintenance-alarms.use-case';

/**
 * Maintenance Cron Service
 * 
 * Orquesta la ejecución diaria de tareas de mantenimiento:
 * 1. Actualizar horas de operación de máquinas activas
 * 2. Verificar alarmas de mantenimiento y disparar las que cumplan su intervalo
 * 
 * Características:
 * - Schedule configurable vía ENV variable CRON_MAINTENANCE_SCHEDULE
 * - Ejecución secuencial (step 2 solo si step 1 tiene éxito parcial)
 * - Logging estructurado con métricas detalladas
 * - Idempotent: Puede ejecutarse múltiples veces sin efectos secundarios duplicados
 * - Graceful shutdown: Detiene cron limpiamente al cerrar app
 * 
 * Configuración:
 * - Desarrollo: CRON_MAINTENANCE_SCHEDULE='*\/5 * * * *' (cada 5 min para testing)
 * - Producción: CRON_MAINTENANCE_SCHEDULE='0 5 * * *' (diario a las 2am UY time)
 * 
 * Testing:
 * - Manual: Llamar directamente a execute() sin esperar schedule
 * - Script: apps/backend/src/scripts/test-maintenance-cron.ts
 * 
 * Principios aplicados:
 * - Separation of Concerns: Cronjob solo orquesta, use cases tienen lógica de negocio
 * - Error Isolation: Errores en step 1 no bloquean step 2 (si hubo éxito parcial)
 * - Observability: Logging estructurado para debugging y monitoring
 * 
 * Sprint #11: Maintenance Alarms - Cronjob Automation
 */
export class MaintenanceCronService {
  private cronJob: ScheduledTask | null = null;
  private updateMachinesOperatingHoursUseCase: UpdateMachinesOperatingHoursUseCase;
  private checkMaintenanceAlarmsUseCase: CheckMaintenanceAlarmsUseCase;
  private isRunning: boolean = false;
  
  // Mejora B: Tracking de última ejecución
  // Previene ejecuciones duplicadas cuando el servidor reinicia
  // dentro del mismo intervalo de tiempo (ej: si cron está configurado cada 1 hora
  // y el servidor reinicia 10 min después de la última ejecución)
  private lastExecutionTime: Date | null = null;
  private minIntervalBetweenExecutionsMs: number = 10 * 1000; // 10 seconds (default)

  constructor() {
    this.updateMachinesOperatingHoursUseCase = new UpdateMachinesOperatingHoursUseCase();
    this.checkMaintenanceAlarmsUseCase = new CheckMaintenanceAlarmsUseCase();
  }

  /**
   * Execute maintenance tasks (called by cron or manually)
   * 
   * Flujo de ejecución:
   * 1. Actualizar horas de operación (UpdateMachinesOperatingHoursUseCase)
   * 2. Si step 1 exitoso (al menos 1 máquina actualizada), verificar alarmas (CheckMaintenanceAlarmsUseCase)
   * 3. Si step 1 falló completamente, skip step 2 (las horas no están actualizadas)
   * 
   * Idempotencia:
   * - UpdateMachinesOperatingHoursUseCase: Solo actualiza máquinas que operan HOY
   *   Si se ejecuta 2 veces en el mismo día, la 2da ejecución salta máquinas (no duplica horas)
   * - CheckMaintenanceAlarmsUseCase: Verifica currentHours >= targetHours
   *   Si se ejecuta 2 veces, la 2da no dispara alarmas ya disparadas (lastTriggeredHours ya está actualizado)
   * 
   * @returns Promise<void> - No retorna valor, solo loggea métricas
   */
  async execute(): Promise<void> {
    // Prevent concurrent executions
    if (this.isRunning) {
      logger.warn('⚠️ Maintenance cronjob already running, skipping this execution');
      return;
    }

    // Mejora B: Prevent duplicate executions within minimum interval
    // Útil cuando servidor reinicia justo después de una ejecución exitosa
    if (this.lastExecutionTime) {
      const timeSinceLastExecution = Date.now() - this.lastExecutionTime.getTime();
      if (timeSinceLastExecution < this.minIntervalBetweenExecutionsMs) {
        logger.info(
          {
            lastExecutionTime: this.lastExecutionTime.toISOString(),
            timeSinceLastMs: timeSinceLastExecution,
            minIntervalMs: this.minIntervalBetweenExecutionsMs,
          },
          '⏭️ Skipping execution - too soon since last execution'
        );
        return;
      }
    }

    this.isRunning = true;
    const startTime = new Date();
    logger.info('🔧 Starting maintenance cronjob execution');

    try {
      // ========================================================================
      // Step 1: Update Operating Hours
      // ========================================================================
      logger.info('📊 Step 1/2: Updating operating hours for active machines...');
      
      const hoursResult = await this.updateMachinesOperatingHoursUseCase.execute();
      
      logger.info(
        {
          updated: hoursResult.updated,
          skipped: hoursResult.skipped,
          errors: hoursResult.errors.length,
          errorDetails: hoursResult.errors.length > 0 ? hoursResult.errors : undefined
        },
        hoursResult.errors.length === 0 ? '✅ Step 1/2: Operating hours update completed successfully' : '⚠️ Step 1/2: Operating hours update completed with errors'
      );

      // ========================================================================
      // Step 2: Check Maintenance Alarms
      // ========================================================================
      // Solo ejecutar si step 1 tuvo éxito parcial (al menos 1 máquina actualizada)
      // O si no hubo errores críticos (ej: fallo de conexión a DB)
      if (hoursResult.updated > 0 || hoursResult.errors.length === 0) {
        logger.info('🔔 Step 2/2: Checking maintenance alarms...');
        
        const alarmsResult = await this.checkMaintenanceAlarmsUseCase.execute();
        
        logger.info(
          {
            alarmsChecked: alarmsResult.alarmsChecked,
            alarmsTriggered: alarmsResult.alarmsTriggered,
            errors: alarmsResult.errors.length,
            errorDetails: alarmsResult.errors.length > 0 ? alarmsResult.errors : undefined
          },
          alarmsResult.errors.length === 0 ? '✅ Step 2/2: Maintenance alarms check completed successfully' : '⚠️ Step 2/2: Maintenance alarms check completed with errors'
        );
      } else {
        logger.warn(
          {
            reason: 'Step 1 failed completely - no machines updated',
            errors: hoursResult.errors
          },
          '⚠️ Skipping Step 2/2 (alarm check) due to operating hours update failure'
        );
      }

      // ========================================================================
      // Summary
      // ========================================================================
      const duration = new Date().getTime() - startTime.getTime();
      logger.info(
        { 
          durationMs: duration,
          durationMinutes: (duration / 1000 / 60).toFixed(2)
        }, 
        '✅ Maintenance cronjob completed successfully'
      );

      // Mejora B: Track successful execution time
      this.lastExecutionTime = new Date();

    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        },
        '❌ Maintenance cronjob failed with critical error'
      );
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Start cron schedule
   * 
   * Lee schedule de ENV variable CRON_MAINTENANCE_SCHEDULE
   * Default: '0 5 * * *' (diario a las 2am UY time)
   * 
   * Formato cron:
   * ┌────────────── second (optional, 0-59)
   * │ ┌──────────── minute (0-59)
   * │ │ ┌────────── hour (0-23)
   * │ │ │ ┌──────── day of month (1-31)
   * │ │ │ │ ┌────── month (1-12)
   * │ │ │ │ │ ┌──── day of week (0-7, 0 or 7 is Sunday)
   * │ │ │ │ │ │
   * * * * * * *
   * 
   * Ejemplos:
   * - '0 2 * * *' → Diario a las 2:00am
   * - '*\/5 * * * *' → Cada 5 minutos (testing)
   * - '0 *\/2 * * *' → Cada 2 horas
   * - '0 0 * * 0' → Semanalmente los domingos a medianoche
   * 
   * NOTA IMPORTANTE: Timezone del cronjob
   * El cronjob se ejecuta en la timezone del servidor. Para MVP (Uruguay + vecinos), esto no es problema
   * ya que todos están en UTC-3 (o UTC-4 en caso de Chile).
   * 
   * ⚠️ CONSIDERACIÓN FUTURA: Soporte multi-timezone
   * Si expandimos a otros países/regiones con zonas horarias diferentes, necesitaremos:
   * 1. Agregar campo `timezone` a cada máquina (ej: 'America/Montevideo', 'America/Santiago')
   * 2. Ejecutar cronjob cada hora (no solo a las 2am)
   * 3. En cada ejecución, calcular hora local de cada máquina
   * 4. Solo actualizar máquinas cuya hora local sea 2am ± 30min
   * Ejemplo de problema sin timezone awareness:
   * - Servidor en Uruguay (UTC-3): Cronjob a las 2am hora local
   * - Usuario en Chile (UTC-4): Su máquina se actualiza a la 1am hora local (no a las 2am)
   * - Esto causa alarmas disparándose a horas inesperadas y confusión en reportes
   * Librerías recomendadas: moment-timezone, luxon, date-fns-tz
   */
  public start(): void {
	const schedule = process.env.CRON_MAINTENANCE_SCHEDULE || '0 5 * * *'; // Default: daily at 2am UY time
    
    // Validate cron expression
    if (!cron.validate(schedule)) {
      logger.error({ schedule }, '❌ Invalid cron schedule expression');
      throw new Error(`Invalid cron schedule: ${schedule}`);
    }

    logger.info({ schedule }, 'Starting maintenance cron scheduler');
    
    this.cronJob = cron.schedule(schedule, () => {
      this.execute().catch(error => {
        logger.error(
          { 
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          }, 
          '❌ Cron execution failed'
        );
      });
    });

    logger.info({ schedule }, '✅ Maintenance cron scheduler started');
  }

  /**
   * Stop cron (for graceful shutdown)
   * 
   * Detiene el scheduler de cron para permitir graceful shutdown de la app.
   * Importante llamar esto en process.on('SIGTERM') o process.on('SIGINT')
   * para evitar que el cronjob se ejecute durante el shutdown.
   * 
   * Mejora A: Graceful shutdown mejorado
   * Si el cronjob está ejecutándose, espera hasta que termine (con timeout)
   * antes de detener el scheduler.
   * 
   * @param maxWaitTimeMs - Tiempo máximo a esperar por ejecución en curso (default: 5 min)
   * @returns Promise<void> - Resuelve cuando el cronjob termina o timeout se cumple
   */
  public async stop(maxWaitTimeMs: number = 5 * 60 * 1000): Promise<void> {
    // Detener el scheduler primero (no más ejecuciones nuevas)
    if (this.cronJob) {
      this.cronJob.stop();
      logger.info('⏹️ Maintenance cron scheduler stopped (no more scheduled executions)');
    }

    // Mejora A: Esperar ejecución en curso si existe
    if (this.isRunning) {
      logger.info(
        { maxWaitTimeMs },
        '⏳ Waiting for current cronjob execution to finish before shutdown...'
      );

      const startWaitTime = Date.now();
      
      // Poll cada 500ms hasta que termine o se cumpla timeout
      while (this.isRunning) {
        const elapsedTime = Date.now() - startWaitTime;
        
        if (elapsedTime >= maxWaitTimeMs) {
          logger.warn(
            { elapsedMs: elapsedTime, maxWaitMs: maxWaitTimeMs },
            '⚠️ Timeout reached - forcing shutdown despite ongoing cronjob execution'
          );
          break;
        }

        // Esperar 500ms antes de chequear de nuevo
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (!this.isRunning) {
        logger.info('✅ Cronjob execution completed - safe to shutdown');
      }
    } else {
      logger.info('✅ No cronjob execution in progress - safe to shutdown');
    }
  }

  /**
   * Get cron running status
   * Útil para health checks y monitoring
   */
  public isSchedulerRunning(): boolean {
    return this.cronJob !== null;
  }

  /**
   * Get current execution status
   * Útil para prevenir ejecuciones concurrentes
   */
  public isExecutionRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get last execution time
   * Útil para health checks y monitoring
   */
  public getLastExecutionTime(): Date | null {
    return this.lastExecutionTime;
  }

  /**
   * Get time since last execution in milliseconds
   * Útil para monitoring y debugging
   */
  public getTimeSinceLastExecution(): number | null {
    if (!this.lastExecutionTime) return null;
    return Date.now() - this.lastExecutionTime.getTime();
  }

  /**
   * Get comprehensive status of the cron service
   * Útil para admin endpoints y monitoring
   */
  public getStatus(): {
    isSchedulerRunning: boolean;
    isExecutionRunning: boolean;
    lastExecutionTime: string | null;
    timeSinceLastExecutionMs: number | null;
    schedule: string;
  } {
    const TEMP_CRON_SHCEDULE_FOR_TESTING = '*/5 * * * *';
    const schedule = TEMP_CRON_SHCEDULE_FOR_TESTING;
    
    return {
      isSchedulerRunning: this.isSchedulerRunning(),
      isExecutionRunning: this.isExecutionRunning(),
      lastExecutionTime: this.lastExecutionTime?.toISOString() ?? null,
      timeSinceLastExecutionMs: this.getTimeSinceLastExecution(),
      schedule
    };
  }
}

// TODO: Configurar alertas para errores en cronjob
// Razón: Si el cronjob falla sistemáticamente, necesitamos notificación proactiva (no solo logs)
// Solución: Integrar con sistema de alertas (email, Slack, PagerDuty)
// Declaración:
// private async notifyAdminsOnError(error: Error, metrics: { updated: number; triggered: number; errors: number }): Promise<void> {
//   if (metrics.errors > THRESHOLD) { // Ej: más de 10 errores
//     await sendSlackAlert(`🚨 Maintenance cronjob failed: ${error.message}`, metrics);
//   }
// }

// TODO: Implementar retry logic para fallos transitorios
// Razón: Errores de red o DB temporales no deberían fallar el cronjob completamente
// Solución: Retry con exponential backoff para operaciones que fallan
// Declaración:
// private async executeWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
//   for (let i = 0; i < maxRetries; i++) {
//     try {
//       return await fn();
//     } catch (error) {
//       if (i === maxRetries - 1) throw error;
//       await sleep(Math.pow(2, i) * 1000); // Exponential backoff: 1s, 2s, 4s
//     }
//   }
// }

// TODO: Agregar health check endpoint
// Razón: Monitoring externo necesita verificar que el cronjob está funcionando
// Solución: Endpoint GET /api/health/cron que retorna última ejecución y estado
// Declaración:
// private lastExecution: { timestamp: Date; success: boolean; metrics: any } | null = null;
// public getHealthStatus(): { isRunning: boolean; lastExecution: any } {
//   return {
//     isRunning: this.isSchedulerRunning(),
//     lastExecution: this.lastExecution
//   };
// }

// TODO: Soporte para ejecución distribuida (multiple instances)
// Razón: En producción con múltiples instancias del backend, solo 1 debe ejecutar el cronjob
// Problema: Si hay 3 instancias del backend, el cronjob se ejecutaría 3 veces concurrentemente
// Solución: Usar distributed lock con Redis o DB
// Librerías recomendadas: redlock, pg-boss
// Declaración:
// import Redlock from 'redlock';
// private async acquireLock(): Promise<Lock | null> {
//   const lock = await redlock.acquire(['maintenance-cron-lock'], 5 * 60 * 1000); // 5 min TTL
//   return lock;
// }
// async execute(): Promise<void> {
//   const lock = await this.acquireLock();
//   if (!lock) { logger.info('Another instance is running cron'); return; }
//   try {
//     // Execute tasks
//   } finally {
//     await lock.release();
//   }
// }
