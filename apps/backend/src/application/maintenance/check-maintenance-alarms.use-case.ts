import { MachineRepository, MachineEventTypeRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import { CreateMachineEventUseCase } from '../machine-events/create-machine-event.use-case';
import { NOTIFICATION_MESSAGE_KEYS } from '../../constants/notification-messages.constants';
import { MachineId } from '@packages/domain';

/**
 * Resultado de la verificación de alarmas de mantenimiento
 */
export interface CheckMaintenanceAlarmsResult {
  alarmsChecked: number;
  alarmsTriggered: number;
  errors: Array<{ machineId: string; alarmId: string; error: string }>;
}

/**
 * Use Case: Verificar alarmas de mantenimiento y disparar las que cumplan su intervalo
 * 
 * Responsabilidades:
 * 1. Obtener todas las máquinas activas
 * 2. Por cada máquina, obtener sus alarmas activas (isActive: true)
 * 3. Verificar condición de disparo: currentHours >= (lastTriggeredHours + intervalHours)
 * 4. Si cumple, disparar secuencia:
 *    a) Crear MachineEvent usando CreateMachineEventUseCase (genera notificación automática)
 *    b) Actualizar alarm tracking usando triggerMaintenanceAlarm()
 * 5. Retornar métricas (alarmsChecked, alarmsTriggered, errors)
 * 
 * Contexto de uso:
 * - Cronjob diario: Ejecuta DESPUÉS de UpdateMachinesOperatingHoursUseCase
 * - Las horas deben estar actualizadas antes de verificar alarmas
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo verifica y dispara alarmas
 * - Delegation: Delega creación de eventos a CreateMachineEventUseCase
 * - Fire-and-Forget: Notificaciones son manejadas automáticamente por CreateMachineEventUseCase
 * - Error Isolation: Errores en una alarma no bloquean las demás
 * 
 * Sprint #11: Maintenance Alarms - Cronjob Automation
 */
export class CheckMaintenanceAlarmsUseCase {
  private machineRepository: MachineRepository;
  private eventTypeRepository: MachineEventTypeRepository;
  private createMachineEventUseCase: CreateMachineEventUseCase;

  constructor() {
    this.machineRepository = new MachineRepository();
    this.eventTypeRepository = new MachineEventTypeRepository();
    this.createMachineEventUseCase = new CreateMachineEventUseCase();
  }

  /**
   * Ejecuta la verificación de alarmas de mantenimiento
   * 
   * Flujo:
   * 1. Query máquinas con maintenanceAlarms donde isActive === true
   * 2. Por cada alarma verificar si: machine.operatingHours >= alarm.lastTriggeredHours + alarm.intervalHours
   * 3. Si sí, disparar secuencia:
   *    (a) Crear MachineEvent usando CreateMachineEventUseCase
   *        - typeId: 'notification.maintenance.alarmTriggered' (del seed)
   *        - metadata: {alarmId, alarmName, targetHours, currentHours, triggeredAt}
   *    (b) Actualizar alarm tracking usando triggerMaintenanceAlarm()
   *        - lastTriggeredAt = now
   *        - lastTriggeredHours = currentOperatingHours
   *        - timesTriggered++
   *    (c) Notificar AL OWNER ÚNICAMENTE (automático via CreateMachineEventUseCase)
   * 4. Retornar métricas {alarmsChecked, alarmsTriggered, errors}
   * 
   * @returns Promise con métricas de la verificación
   */
  async execute(): Promise<CheckMaintenanceAlarmsResult> {
    const result: CheckMaintenanceAlarmsResult = {
      alarmsChecked: 0,
      alarmsTriggered: 0,
      errors: []
    };

    const startTime = new Date();
    logger.info('🔔 Starting maintenance alarms check for active machines');

    try {
      // 1. Obtener el tipo de evento para alarmas (del seed)
      const eventTypeKey = NOTIFICATION_MESSAGE_KEYS.maintenance.alarmTriggered;
      const normalizedKey = eventTypeKey.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
      
      const eventTypeResult = await this.eventTypeRepository.findByNormalizedName(normalizedKey);
      if (!eventTypeResult.success) {
        throw new Error(`Event type '${eventTypeKey}' not found. Please run seed script.`);
      }
      const eventType = eventTypeResult.data;

      // 2. Obtener todas las máquinas activas
      const activeMachines = await this.machineRepository.findByStatus('ACTIVE');
      logger.info({ totalActiveMachines: activeMachines.length }, 'Fetched active machines');

      // 3. Por cada máquina, verificar sus alarmas
      for (const machine of activeMachines) {
        const machinePublic = machine.toPublicInterface();
        const machineId = machinePublic.id;
        const alarms = machinePublic.maintenanceAlarms || [];

        // Filtrar solo alarmas activas
        const activeAlarms = alarms.filter((alarm: any) => alarm.isActive);
        result.alarmsChecked += activeAlarms.length;

        if (activeAlarms.length === 0) {
          continue; // Skip machines without active alarms
        }

        const currentHours = machinePublic.specs?.operatingHours || 0;

        logger.debug(
          { 
            machineId, 
            currentHours, 
            activeAlarms: activeAlarms.length 
          }, 
          'Checking alarms for machine'
        );

        // 4. Verificar cada alarma
        for (const alarm of activeAlarms) {
          try {
            // Calcular si debe dispararse
            const lastHours = alarm.lastTriggeredHours || 0;
            const targetHours = lastHours + alarm.intervalHours;
            const shouldTrigger = currentHours >= targetHours;

            logger.debug(
              {
                machineId,
                alarmId: alarm.id,
                alarmTitle: alarm.title,
                currentHours,
                lastHours,
                intervalHours: alarm.intervalHours,
                targetHours,
                shouldTrigger
              },
              'Alarm evaluation'
            );

            if (shouldTrigger) {
              // (a) Crear MachineEvent (genera notificación automáticamente)
              const title = `⚠️ Mantenimiento Requerido: ${alarm.title}`;
              const description = `La alarma de mantenimiento "${alarm.title}" se ha disparado después de acumular ${alarm.intervalHours} horas de operación. Horas actuales: ${currentHours}h. ${alarm.relatedParts.length > 0 ? `Partes involucradas: ${alarm.relatedParts.join(', ')}` : ''}`;

              await this.createMachineEventUseCase.execute(
                machineId,
                'system', // System-generated event (userId = 'system')
                {
                  machineId,
                  createdBy: 'system',
                  typeId: eventType.id,
                  title,
                  description,
                  metadata: {
                    additionalInfo: {
                      alarmId: alarm.id,
                      alarmTitle: alarm.title,
                      intervalHours: alarm.intervalHours,
                      currentOperatingHours: currentHours,
                      lastTriggeredHours: lastHours,
                      targetHours,
                      relatedParts: alarm.relatedParts,
                      timesTriggered: alarm.timesTriggered,
                      triggeredAt: new Date().toISOString()
                    }
                  }
                },
                `/machines/${machineId}/maintenance-alarms`, // actionUrl
                true, // isSystemGenerated
                'MAINTENANCE' // sourceType
              );

              logger.info(
                { 
                  machineId, 
                  alarmId: alarm.id, 
                  alarmTitle: alarm.title,
                  currentHours,
                  targetHours
                }, 
                '📝 Event created for maintenance alarm'
              );

              // (b) Actualizar alarm tracking fields
              const machineIdVO = MachineId.create(machineId);
              if (!machineIdVO.success) {
                throw new Error(`Invalid machine ID: ${machineIdVO.error.message}`);
              }

              const triggerResult = await this.machineRepository.triggerMaintenanceAlarm(
                machineIdVO.data,
                alarm.id,
                currentHours
              );

              if (!triggerResult.success) {
                throw new Error(`Failed to update alarm tracking: ${triggerResult.error.message}`);
              }

              result.alarmsTriggered++;
              logger.info(
                { 
                  machineId, 
                  alarmId: alarm.id,
                  timesTriggered: alarm.timesTriggered + 1
                }, 
                '✅ Maintenance alarm triggered successfully'
              );
            }

          } catch (error) {
            result.errors.push({
              machineId,
              alarmId: alarm.id,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            logger.warn(
              { 
                machineId, 
                alarmId: alarm.id,
                error: error instanceof Error ? error.message : 'Unknown error'
              }, 
              '⚠️ Failed to trigger maintenance alarm'
            );
          }
        }
      }

      const duration = new Date().getTime() - startTime.getTime();
      logger.info(
        {
          alarmsChecked: result.alarmsChecked,
          alarmsTriggered: result.alarmsTriggered,
          errors: result.errors.length,
          durationMs: duration
        },
        '✅ Maintenance alarms check completed'
      );

      return result;

    } catch (error) {
      logger.error(
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        },
        '❌ Maintenance alarms check failed'
      );
      throw error;
    }
  }
}

// TODO: Notificar también al provider asignado
// Razón: Actualmente solo notifica al owner. Para talleres/proveedores asignados, sería útil recibir notificación también
// Problema: Si un taller está a cargo del mantenimiento de una máquina, el owner recibe la alerta pero el taller no
// Solución: Verificar si machine.assignedProviderId existe y crear notificación adicional para ese usuario
// Declaración:
// if (machinePublic.assignedProviderId) {
//   await this.createMachineEventUseCase.execute(
//     machineId,
//     machinePublic.assignedProviderId, // Notificar al provider también
//     { /* same event data */ },
//     actionUrl,
//     true,
//     'MAINTENANCE'
//   );
// }
// Consideración: ¿Duplicar evento o solo agregar provider a la lista de notificados del mismo evento?

// TODO: Configurar ventana de alerta preventiva
// Razón: Alertar X horas ANTES de cumplirse el intervalo (no solo cuando ya se cumplió)
// Ejemplo: Si intervalHours = 500, alertar cuando falten 50 horas (threshold = 10%)
// Esto permite planificación proactiva del mantenimiento
// Declaración:
// interface IMaintenanceAlarm {
//   notifyBeforeHours?: number; // Ej: 50 (alertar 50 horas antes)
// }
// const remainingHours = targetHours - currentHours;
// const shouldPreAlert = remainingHours > 0 && remainingHours <= (alarm.notifyBeforeHours || 0);
// if (shouldPreAlert) {
//   // Crear evento de tipo 'maintenance.reminder' en lugar de 'alarmTriggered'
//   // metadata.isPreAlert = true, metadata.remainingHours = remainingHours
// }

// TODO: Soporte para auto-reset de alarmas
// Razón: Algunas alarmas son recurrentes (ej: cambio de aceite cada 500h), otras son one-time (ej: inspección anual)
// Actualmente todas las alarmas se resetean automáticamente (lastTriggeredHours se actualiza)
// Mejora: Agregar flag autoReset para controlar comportamiento
// Declaración:
// interface IMaintenanceAlarm {
//   autoResetOnComplete?: boolean; // Default: true para recurrentes, false para one-time
// }
// if (!alarm.autoResetOnComplete) {
//   // En lugar de updatear lastTriggeredHours, marcar isActive = false
//   await this.machineRepository.updateMaintenanceAlarm(machineId, alarm.id, { isActive: false });
// }
