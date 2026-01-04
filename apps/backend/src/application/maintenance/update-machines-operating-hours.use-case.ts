import { MachineRepository } from '@packages/persistence';
import { Machine } from '@packages/domain';
import { logger } from '../../config/logger.config';
import { UpdateOperatingHoursUseCase } from '../inventory/update-operating-hours.use-case';

/**
 * Resultado de la actualización batch de horas de operación
 */
export interface UpdateMachinesOperatingHoursResult {
  updated: number;
  skipped: number;
  errors: Array<{ machineId: string; error: string }>;
}

/**
 * Use Case: Actualizar horas de operación de todas las máquinas activas que operan hoy
 * 
 * Responsabilidades:
 * 1. Obtener todas las máquinas activas
 * 2. Filtrar máquinas con usageSchedule definido
 * 3. Verificar si cada máquina opera hoy (usando UsageSchedule.shouldAccumulateHoursToday())
 * 4. Actualizar horas usando UpdateOperatingHoursUseCase
 * 5. Retornar métricas (updated, skipped, errors)
 * 
 * Contexto de uso:
 * - Cronjob diario: Ejecuta este use case para actualizar todas las máquinas automáticamente
 * - La lógica de negocio (qué días opera cada máquina) está en UsageSchedule Value Object
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo se encarga de orquestar la actualización batch
 * - Delegation: Delega actualización individual a UpdateOperatingHoursUseCase
 * - Error Isolation: Errores en una máquina no bloquean las demás
 * 
 * Sprint #11: Maintenance Alarms - Cronjob Automation
 */
export class UpdateMachinesOperatingHoursUseCase {
  private machineRepository: MachineRepository;
  private updateOperatingHoursUseCase: UpdateOperatingHoursUseCase;

  constructor() {
    this.machineRepository = new MachineRepository();
    this.updateOperatingHoursUseCase = new UpdateOperatingHoursUseCase();
  }

  /**
   * Ejecuta la actualización batch de horas de operación
   * 
   * Flujo:
   * 1. Query máquinas ACTIVE con usageSchedule definido
   * 2. Por cada máquina verificar si hoy es día operativo (UsageSchedule)
   * 3. Si sí, sumar usageSchedule.dailyHours a machine.operatingHours
   * 4. Actualizar en BD vía UpdateOperatingHoursUseCase
   * 5. Retornar métricas {updated, skipped, errors}
   * 
   * @returns Promise con métricas de la operación batch
   */
  async execute(): Promise<UpdateMachinesOperatingHoursResult> {
    const result: UpdateMachinesOperatingHoursResult = {
      updated: 0,
      skipped: 0,
      errors: []
    };

    const startTime = new Date();
    logger.info('📊 Starting batch update of operating hours for active machines');

    try {
      // 1. Obtener todas las máquinas activas
      const activeMachines = await this.machineRepository.findByStatus('ACTIVE');
      logger.info({ totalActiveMachines: activeMachines.length }, 'Fetched active machines');

      // 2. Filtrar máquinas con usageSchedule definido
      const machinesWithSchedule = activeMachines.filter((machine: Machine) => {
        const machinePublic = machine.toPublicInterface();
        return machinePublic.usageSchedule !== undefined && machinePublic.usageSchedule !== null;
      });

      logger.info(
        { 
          totalActive: activeMachines.length,
          withSchedule: machinesWithSchedule.length,
          withoutSchedule: activeMachines.length - machinesWithSchedule.length
        }, 
        'Filtered machines with usage schedule'
      );

      // 3. Filtrar máquinas que operan hoy
      const machinesToUpdate = machinesWithSchedule.filter((machine: Machine) => {
        const machinePublic = machine.toPublicInterface();
        const usageSchedule = machinePublic.usageSchedule!;
        
        // Verificar si hoy es un día operativo
        // DayOfWeek mapping: 0=SUN, 1=MON, ..., 6=SAT
        const today = new Date().getDay();
        const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const todayDayOfWeek = dayMap[today];
        
        // Verificar si hoy está en operatingDays
        return usageSchedule.operatingDays.includes(todayDayOfWeek as any);
      });

      logger.info(
        { 
          withSchedule: machinesWithSchedule.length,
          operatingToday: machinesToUpdate.length,
          notOperatingToday: machinesWithSchedule.length - machinesToUpdate.length
        }, 
        'Filtered machines operating today'
      );

      // 4. Actualizar cada máquina (con error isolation)
      for (const machine of machinesToUpdate) {
        const machinePublic = machine.toPublicInterface();
        const machineId = machinePublic.id;
        const hoursToAdd = machinePublic.usageSchedule!.dailyHours;

        try {
          await this.updateOperatingHoursUseCase.execute({
            machineId,
            hoursToAdd
          });

          result.updated++;
          logger.debug({ machineId, hoursToAdd }, '✅ Machine hours updated');

        } catch (error) {
          result.errors.push({
            machineId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          logger.warn({ machineId, error: error instanceof Error ? error.message : 'Unknown error' }, '⚠️ Failed to update machine hours');
        }
      }

      // 5. Calcular máquinas saltadas
      result.skipped = activeMachines.length - machinesToUpdate.length;

      const duration = new Date().getTime() - startTime.getTime();
      logger.info(
        {
          updated: result.updated,
          skipped: result.skipped,
          errors: result.errors.length,
          durationMs: duration
        },
        '✅ Batch operating hours update completed'
      );

      return result;

    } catch (error) {
      logger.error(
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        },
        '❌ Batch operating hours update failed'
      );
      throw error;
    }
  }
}

// TODO: Optimización con bulkWrite para mejor performance
// Razón: Actualmente hace 1 update por máquina (N queries). Para flotas grandes (>1000 máquinas), considerar bulkWrite
// Declaración:
// async executeBulk(): Promise<UpdateMachinesOperatingHoursResult> {
//   const updates = machinesToUpdate.map(machine => ({
//     updateOne: {
//       filter: { _id: machine.id.getValue() },
//       update: { $inc: { 'specs.operatingHours': machine.usageSchedule!.dailyHours } }
//     }
//   }));
//   await MachineModel.bulkWrite(updates);
// }

// TODO: Soporte para múltiples zonas horarias
// Razón: MVP es regional (Uruguay + vecinos, misma timezone UTC-3), pero si expandimos internacionalmente necesitamos timezone awareness
// Problema actual: Cronjob se ejecuta a las 2am hora del servidor (ej: UTC-3). Si un usuario en Chile (UTC-4) tiene una máquina,
// sus horas se actualizarían 1 hora más temprano de lo esperado (1am hora local vs 2am). Esto causa:
// - Alarmas de mantenimiento disparándose a horas inesperadas
// - Confusión en reportes (horas no coinciden con expectativa del usuario)
// - Problemas de auditoría (timestamps no reflejan hora local correcta)
// Solución futura:
// - Agregar campo `timezone: string` (ej: 'America/Montevideo') a Machine
// - Calcular hora local de cada máquina: const localTime = moment.tz(new Date(), machine.timezone)
// - Verificar si son las 2am EN LA TIMEZONE DE LA MÁQUINA antes de actualizar
// - O ejecutar cronjob cada hora y verificar: localTime.hour() === 2
// Librerías recomendadas: moment-timezone, luxon, date-fns-tz
// Declaración:
// interface IMachine {
//   timezone?: string; // IANA timezone (ej: 'America/Santiago', 'America/Buenos_Aires')
// }
// const shouldUpdateNow = (machine: IMachine): boolean => {
//   const localTime = moment.tz(new Date(), machine.timezone || 'America/Montevideo');
//   return localTime.hour() === 2 && localTime.minute() < 10; // Window de 10min para ejecutar
// };
