import { 
  MachineId, 
  QUICK_CHECK_RESULTS, 
  NOTIFICATION_SOURCE_TYPES,
  NOTIFICATION_TYPES 
} from '@packages/domain';
import { MachineRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import { type CreateQuickCheckRecord } from '@packages/contracts';
import { AddNotificationUseCase } from '../notifications';
import { NOTIFICATION_MESSAGE_KEYS } from '../../constants/notification-messages.constants';

/**
 * Use Case: Agregar registro de QuickCheck a una máquina
 * 
 * Responsabilidades:
 * 1. Validar que la máquina existe
 * 2. Validar que el usuario tiene acceso (owner o provider asignado)
 * 3. Delegar validaciones de negocio a Machine.addQuickCheckRecord()
 * 4. Persistir cambios en repositorio
 * 
 * Reglas de Acceso:
 * - CLIENT puede agregar quickcheck a sus propias máquinas
 * - PROVIDER puede agregar quickcheck a máquinas asignadas
 * 
 * Campos de Responsabilidad (Obligatorios desde Sprint 8):
 * - responsibleName: Nombre completo del técnico que ejecuta la inspección
 * - responsibleWorkerId: Número de empleado/identificador del trabajador
 * - executedById: ID del usuario logueado (extraído del JWT, server-side)
 * 
 * Estos campos permiten trackear tanto el "quién" (usuario del sistema) 
 * como el "quién físicamente" (técnico que puede no tener cuenta en el sistema).
 */
export class AddQuickCheckUseCase {
  private machineRepository: MachineRepository;
  private addNotificationUseCase: AddNotificationUseCase;

  constructor() {
    this.machineRepository = new MachineRepository();
    this.addNotificationUseCase = new AddNotificationUseCase();
  }

  /**
   * Ejecuta el caso de uso de agregar QuickCheck
   * 
   * @param machineId - ID de la máquina objetivo
   * @param record - Registro de QuickCheck a agregar. Campos obligatorios:
   *   - result: Resultado general (approved, disapproved, notInitiated)
   *   - responsibleName: Nombre del técnico responsable (1-100 chars)
   *   - responsibleWorkerId: Número/ID de trabajador (1-50 chars)
   *   - quickCheckItems: Array de items inspeccionados (min 1, max 50)
   *   - observations: (opcional) Comentarios generales
   * @param userId - ID del usuario ejecutando la acción (desde JWT) - se asigna a executedById
   * @returns Promise con el registro agregado (incluye fecha generada server-side)
   * @throws Error si máquina no existe, acceso denegado, o validación falla
   */
  async execute(
    machineId: string,
    record: CreateQuickCheckRecord,
    userId: string
  ): Promise<{
    machineId: string;
    quickCheckAdded: any;
    totalQuickChecks: number;
  }> {
    logger.info({ 
      machineId, 
      userId,
      itemsCount: record.quickCheckItems.length 
    }, 'Starting QuickCheck addition');

    try {
      // 1. Validar formato de machineId
      const machineIdResult = MachineId.create(machineId);
      if (!machineIdResult.success) {
        throw new Error(`Invalid machine ID format: ${machineIdResult.error.message}`);
      }

      // 2. Agregar QuickCheck usando repositorio (incluye validaciones de dominio)
      const addResult = await this.machineRepository.addQuickCheckRecord(
        machineIdResult.data,
        {
          ...record,
          executedById: userId // Server-side: usar userId del JWT, no del request body
        }
      );

      if (!addResult.success) {
        // Mapear errores de dominio a mensajes HTTP-friendly
        const error = addResult.error;
        
        if (error.message.includes('not found')) {
          throw new Error(`Machine with ID ${machineId} not found`);
        }
        
        if (error.message.includes('retired machine')) {
          throw new Error('Cannot add QuickCheck to retired machine');
        }
        
        if (error.message.includes('Access denied')) {
          throw new Error('Access denied: you are not the owner or assigned provider');
        }

        // Errores de validación genéricos
        throw new Error(error.message);
      }

      // El repositorio ahora retorna { quickCheckRecord, totalQuickChecks }
      const { quickCheckRecord, totalQuickChecks } = addResult.data;

      logger.info({ 
        machineId,
        totalQuickChecks,
        result: quickCheckRecord.result
      }, '✅ QuickCheck added successfully');

      // 3. Integración Sprint #9: Notificar al owner de la máquina
      // Fire-and-forget pattern: no bloquear si falla la notificación
      this.notifyMachineOwner(machineId, quickCheckRecord.result)
        .catch(error => {
          logger.warn({ 
            machineId,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, '⚠️ Failed to send QuickCheck notification (non-blocking)');
        });

      return {
        machineId,
        quickCheckAdded: quickCheckRecord,
        totalQuickChecks
      };

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        machineId,
        userId
      }, 'QuickCheck addition failed');
      
      throw error;
    }
  }

  /**
   * Notifies machine owner about completed QuickCheck
   * Fire-and-forget: errors don't block main operation
   * Sprint #9 - QuickCheck → Notifications Integration
   * 
   * @param machineId - ID of inspected machine
   * @param result - QuickCheck result (SSOT: QUICK_CHECK_RESULTS)
   */
  private async notifyMachineOwner(
    machineId: string,
    result: typeof QUICK_CHECK_RESULTS[number]
  ): Promise<void> {
    try {
      // 1. Get machine to extract ownerId
      const machineIdResult = MachineId.create(machineId);
      if (!machineIdResult.success) {
        logger.error({ machineId }, 'Invalid machineId format for notification');
        return;
      }

      const machineResult = await this.machineRepository.findById(machineIdResult.data);
      if (!machineResult.success) {
        logger.error({ machineId }, 'Machine not found for notification');
        return;
      }

      const machine = machineResult.data;
      const ownerId = machine.toPublicInterface().ownerId;

      // 2. Map QuickCheck result to notification type and message (SSOT)
      const RESULT_TO_NOTIFICATION_MAP = {
        [QUICK_CHECK_RESULTS[0]]: { // 'approved'
          type: NOTIFICATION_TYPES[0], // 'success'
          message: NOTIFICATION_MESSAGE_KEYS.quickcheck.completed.approved
        },
        [QUICK_CHECK_RESULTS[1]]: { // 'disapproved'
          type: NOTIFICATION_TYPES[1], // 'warning'
          message: NOTIFICATION_MESSAGE_KEYS.quickcheck.completed.disapproved
        },
        [QUICK_CHECK_RESULTS[2]]: { // 'notInitiated'
          type: NOTIFICATION_TYPES[3], // 'info'
          message: NOTIFICATION_MESSAGE_KEYS.quickcheck.completed.notInitiated
        }
      };

      const notificationConfig = RESULT_TO_NOTIFICATION_MAP[result];
      if (!notificationConfig) {
        logger.warn({ result }, 'Unknown QuickCheck result, skipping notification');
        return;
      }

      // 3. Send notification to owner (SSOT: NOTIFICATION_SOURCE_TYPES)
      // Message is an i18n key that will be translated in frontend
      await this.addNotificationUseCase.execute(ownerId, {
        notificationType: notificationConfig.type,
        message: notificationConfig.message,
        actionUrl: `/machines/${machineId}/quickchecks/history`,
        sourceType: NOTIFICATION_SOURCE_TYPES[0] // 'QUICKCHECK'
      });

      logger.info({ 
        ownerId,
        machineId,
        result 
      }, '🔔 QuickCheck notification sent successfully');

    } catch (error) {
      // Log error but don't propagate (fire-and-forget)
      logger.warn({ 
        machineId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'Failed to send QuickCheck notification');
    }
  }
}
