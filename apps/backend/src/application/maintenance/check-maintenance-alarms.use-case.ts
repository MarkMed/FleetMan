import { MachineRepository, MachineEventTypeRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import { CreateMachineEventUseCase } from '../machine-events/create-machine-event.use-case';
import { NOTIFICATION_MESSAGE_KEYS } from '../../constants/notification-messages.constants';
import { MachineId, Machine, NOTIFICATION_SOURCE_TYPES, DayOfWeek } from '@packages/domain';

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
   * LÓGICA IMPLEMENTADA: "Accumulator Pattern con Día Siguiente"
   * 
   * Flujo Detallado:
   * 1. Query máquinas ACTIVE con maintenanceAlarms activas Y usageSchedule definido
   * 2. Calcular día de AYER (día de operación)
   * 3. Por cada máquina:
   *    a) Verificar si AYER fue día operativo (usageSchedule.operatingDays)
   *    b) Por cada alarma activa:
   *       - Si ayer operó → accumulatedHours += dailyHours
   *       - Si accumulatedHours >= intervalHours → trigger + reset a 0
   *       - Si no → solo guardar accumulatedHours actualizado
   * 
   * IMPORTANTE - "Día Siguiente al Día de Uso":
   * Las horas se suman el día DESPUÉS de que la máquina operó porque representa
   * el tracking de horas ya registradas (pasado), no horas futuras.
   * 
   * Ejemplo:
   *   - Máquina operó: Lunes (10 horas)
   *   - Cronjob ejecuta: Martes 2am
   *   - Acción: Suma 10h al acumulador (refleja las 10h del Lunes)
   *   - Consulta usuario Martes 8am: Ve las horas del Lunes reflejadas
   * 
   * Esta lógica mantiene coherencia con la semántica de "horas de uso registradas"
   * vs "horas de uso proyectadas". Si en el futuro se desea cambiar esta lógica
   * (ej: sumar el mismo día operativo), modificar la verificación de "yesterday"
   * por "today" en la línea que calcula yesterdayDayOfWeek.
   * 
   * Principios aplicados:
   * - Information Expert: Cada alarma maneja su propio acumulador
   * - Error Isolation: Errores en una alarma no bloquean las demás
   * - Single Responsibility: Use case solo orquesta, repository hace persistencia
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

      // 2. Calcular día de AYER (día de operación)
      // Lógica: Cronjob se ejecuta a las 2am de HOY, pero acumula horas del día que ya pasó (AYER)
      // Ejemplo: Si hoy es Martes 2am → acumular horas si la máquina operó el Lunes
      const today = new Date().getDay(); // 0=DOM, 1=LUN, ..., 6=SAB
      const yesterday = (today - 1 + 7) % 7; // Handle wrap-around (ej: hoy DOM → ayer SAB)
      
      // SSOT: Usar DayOfWeek enum (valores de 3 letras: 'SUN', 'MON', etc.)
      // Estos valores coinciden con lo que está en la DB (operatingDays: ['TUE', 'WED', ...])
      const dayMap: DayOfWeek[] = [
        DayOfWeek.SUN,  // 0
        DayOfWeek.MON,  // 1
        DayOfWeek.TUE,  // 2
        DayOfWeek.WED,  // 3
        DayOfWeek.THU,  // 4
        DayOfWeek.FRI,  // 5
        DayOfWeek.SAT   // 6
      ];
      const yesterdayDayOfWeek = dayMap[yesterday];

      logger.info({ 
        today: dayMap[today], 
        yesterday: yesterdayDayOfWeek 
      }, 'Calculated yesterday for hours accumulation (day-after logic)');

      // 🆕 Query optimizada: Trae SOLO máquinas activas que operaron ayer (filtro en DB)
      // Antes: findByStatus('ACTIVE') → 1000 máquinas → filtrar en memoria
      // Ahora: findActiveWithOperatingDay('MON') → 200 máquinas directo de DB
      // Usa índice compuesto: { 'status.code': 1, 'usageSchedule.operatingDays': 1 }
      const machinesOperatedYesterday = await this.machineRepository.findActiveWithOperatingDay(yesterdayDayOfWeek);
      
      logger.info({ totalActiveMachines: machinesOperatedYesterday.length }, 'Fetched active machines');

      // Filtrar solo máquinas con alarmas activas
      // (No podemos filtrar esto en DB porque necesitamos verificar isActive en cada subdocumento)
      const machinesWithAlarms = machinesOperatedYesterday.filter((machine: Machine) => {
        const machinePublic = machine.toPublicInterface();
        const hasActiveAlarms = machinePublic.maintenanceAlarms && 
          machinePublic.maintenanceAlarms.some((alarm: any) => alarm.isActive);
        return hasActiveAlarms;
      });

      logger.info(
        { 
          totalActive: machinesOperatedYesterday.length,
          withAlarms: machinesWithAlarms.length,
          withoutAlarms: machinesOperatedYesterday.length - machinesWithAlarms.length
        }, 
        'Filtered machines with active alarms and schedule'
      );

      // 5. Procesar cada máquina con alarmas activas
      // NOTA: Las máquinas ya vienen filtradas por día operativo desde la query DB
      // No necesitamos verificar usageSchedule.operatingDays.includes(yesterday) aquí
      for (const machine of machinesWithAlarms) {
        const machinePublic = machine.toPublicInterface();
        const machineId = machinePublic.id;
        const usageSchedule = machinePublic.usageSchedule!;
        const alarms = machinePublic.maintenanceAlarms || [];
        const activeAlarms = alarms.filter((alarm: any) => alarm.isActive);

        const dailyHours = usageSchedule.dailyHours;
        
        logger.debug(
          { 
            machineId, 
            yesterdayOperative: yesterdayDayOfWeek,
            dailyHours,
            activeAlarms: activeAlarms.length 
          }, 
          'Processing alarms for machine that operated yesterday'
        );

        // 6. Procesar cada alarma activa (loop interno)
        for (const alarm of activeAlarms) {
          result.alarmsChecked++;

          try {
            const alarmId = alarm.id;
            const currentAccumulated = alarm.accumulatedHours || 0;
            const newAccumulated = currentAccumulated + dailyHours;

            logger.debug(
              {
                machineId,
                alarmId,
                alarmTitle: alarm.title,
                currentAccumulated,
                dailyHoursAdded: dailyHours,
                newAccumulated,
                intervalHours: alarm.intervalHours,
                willTrigger: newAccumulated >= alarm.intervalHours
              },
              'Evaluating alarm with accumulator pattern'
            );

            // Verificar si debe dispararse
            if (newAccumulated >= alarm.intervalHours) {
              // ============================================================
              // TRIGGER SEQUENCE: Event + Notification + Reset
              // ============================================================

              // (a) Crear MachineEvent (genera notificación automática al owner)
              const title = `⚠️ Mantenimiento Requerido: ${alarm.title}`;
              const description = `La alarma de mantenimiento "${alarm.title}" se ha disparado después de acumular ${alarm.intervalHours} horas de operación. Horas acumuladas: ${newAccumulated}h. ${alarm.relatedParts.length > 0 ? `Partes involucradas: ${alarm.relatedParts.join(', ')}.` : ''}`;

              await this.createMachineEventUseCase.execute(
                machineId,
                'system',
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
                      accumulatedHours: newAccumulated,
                      relatedParts: alarm.relatedParts,
                      timesTriggered: alarm.timesTriggered,
                      triggeredAt: new Date().toISOString()
                    }
                  }
                },
                `/machines/${machineId}/maintenance-alarms`,
                true,
                NOTIFICATION_SOURCE_TYPES[2],
                machinePublic.ownerId // Notificar al dueño de la máquina, no a 'system'
              );

              logger.info(
                { 
                  machineId, 
                  alarmId, 
                  alarmTitle: alarm.title,
                  accumulatedHours: newAccumulated,
                  intervalHours: alarm.intervalHours
                }, 
                '📝 Event created for triggered maintenance alarm'
              );

              // (b) Actualizar alarm tracking (reset accumulatedHours a 0)
              const machineIdVO = MachineId.create(machineId);
              if (!machineIdVO.success) {
                throw new Error(`Invalid machine ID: ${machineIdVO.error.message}`);
              }

              const triggerResult = await this.machineRepository.triggerMaintenanceAlarm(
                machineIdVO.data,
                alarmId,
                machinePublic.specs?.operatingHours || 0
              );

              if (!triggerResult.success) {
                throw new Error(`Failed to trigger alarm: ${triggerResult.error.message}`);
              }

              result.alarmsTriggered++;
              logger.info(
                { 
                  machineId, 
                  alarmId,
                  timesTriggered: alarm.timesTriggered + 1,
                  resetAccumulated: true
                }, 
                '✅ Maintenance alarm triggered and accumulator reset to 0'
              );

            } else {
              // ============================================================
              // ACCUMULATE ONLY (no trigger yet)
              // ============================================================

              const machineIdVO = MachineId.create(machineId);
              if (!machineIdVO.success) {
                throw new Error(`Invalid machine ID: ${machineIdVO.error.message}`);
              }

              const updateResult = await this.machineRepository.updateAlarmAccumulatedHours(
                machineIdVO.data,
                alarmId,
                dailyHours
              );

              if (!updateResult.success) {
                throw new Error(`Failed to update accumulated hours: ${updateResult.error.message}`);
              }

              logger.debug(
                { 
                  machineId, 
                  alarmId,
                  newAccumulated,
                  intervalHours: alarm.intervalHours,
                  remainingHours: alarm.intervalHours - newAccumulated
                }, 
                '➕ Accumulated hours updated (no trigger - not reached interval yet)'
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
              '⚠️ Failed to process maintenance alarm'
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
