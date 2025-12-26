import { 
  MachineId, 
  QUICK_CHECK_RESULTS, 
  NOTIFICATION_SOURCE_TYPES,
  NOTIFICATION_TYPES 
} from '@packages/domain';
import { MachineRepository, MachineEventTypeRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import { type CreateQuickCheckRecord } from '@packages/contracts';
import { AddNotificationUseCase } from '../notifications';
import { CreateMachineEventTypeUseCase } from '../machine-events';
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
  private eventTypeRepository: MachineEventTypeRepository;
  private createEventTypeUseCase: CreateMachineEventTypeUseCase;

  constructor() {
    this.machineRepository = new MachineRepository();
    this.addNotificationUseCase = new AddNotificationUseCase();
    this.eventTypeRepository = new MachineEventTypeRepository();
    this.createEventTypeUseCase = new CreateMachineEventTypeUseCase();
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

      // 3. Integración Sprint #10 + #9: Crear evento primero, luego notificar
      // Fire-and-forget pattern: no bloquear si falla la creación
      // ORDEN CORRECTO: QuickCheck save → Event creation → Notification
      this.notifyMachineOwnerAfterEvent(machineId, quickCheckRecord.result, quickCheckRecord.responsibleName, quickCheckRecord)
        .catch(error => {
          logger.warn({ 
            machineId,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, '⚠️ Failed to create event/notification for QuickCheck (non-blocking)');
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
   * Crea evento de máquina y notifica al owner sobre QuickCheck completado
   * Fire-and-forget: errors don't block main operation
   * 
   * FLUJO CORRECTO (Sprint #10):
   * 1. QuickCheck se guarda en DB
   * 2. Se crea evento automático en eventsHistory
   * 3. Se envía notificación con eventId en metadata y actionUrl
   * 
   * @param machineId - ID of inspected machine
   * @param result - QuickCheck result (SSOT: QUICK_CHECK_RESULTS)
   * @param responsibleName - Name of technician who executed the QuickCheck
   * @param quickCheckRecord - Complete QuickCheck record for event creation
   */
  private async notifyMachineOwnerAfterEvent(
    machineId: string,
    result: typeof QUICK_CHECK_RESULTS[number],
    responsibleName: string,
    quickCheckRecord: any
  ): Promise<void> {
    try {
      // 1. Get machine to extract ownerId and validate
      const machineIdResult = MachineId.create(machineId);
      if (!machineIdResult.success) {
        logger.error({ machineId }, 'Invalid machineId format for event/notification');
        return;
      }

      const machineResult = await this.machineRepository.findById(machineIdResult.data);
      if (!machineResult.success) {
        logger.error({ machineId }, 'Machine not found for event/notification');
        return;
      }

      const machine = machineResult.data;
      const machinePublic = machine.toPublicInterface();
      const ownerId = machinePublic.ownerId;

      // 2. PASO 1: Crear evento automático primero (solo para approved/disapproved)
      let eventId: string | null = null;
      if (result === QUICK_CHECK_RESULTS[0] || result === QUICK_CHECK_RESULTS[1]) {
        eventId = await this.createMachineEventAuto(
          machineIdResult.data,
          result,
          responsibleName,
          quickCheckRecord,
          machinePublic
        );
      }

      // 3. Map QuickCheck result to notification type and message (SSOT)
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

      // 4. Extract metadata for i18next interpolation
      const machineName = machinePublic.nickname || machinePublic.serialNumber;
      
      // 5. PASO 2: Enviar notificación con eventId en metadata (si se creó evento)
      // actionUrl apunta al evento específico si existe, sino al historial de QuickCheck
      const actionUrl = eventId 
        ? `/machines/${machineId}/events/${eventId}`
        : `/machines/${machineId}/quickcheck/history`;

      await this.addNotificationUseCase.execute(ownerId, {
        notificationType: notificationConfig.type,
        message: notificationConfig.message,
        actionUrl,
        sourceType: NOTIFICATION_SOURCE_TYPES[0], // 'QUICKCHECK'
        metadata: {
          machineName,
          userName: responsibleName,
          eventId: eventId || undefined // Incluir eventId si fue creado
        }
      });

      logger.info({ 
        ownerId,
        machineId,
        result,
        eventId
      }, '🔔 QuickCheck notification sent successfully (with eventId)');

    } catch (error) {
      // Log error but don't propagate (fire-and-forget)
      logger.warn({ 
        machineId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'Failed to create event/notification for QuickCheck');
    }
  }

  /**
   * Crea evento automático de máquina cuando se completa un QuickCheck
   * 
   * Propósito:
   * - Mantener historial unificado de eventos de máquina
   * - QuickCheck completed genera evento automático en eventsHistory
   * - Retorna eventId para incluirlo en la notificación
   * 
   * Patrón:
   * - Fire-and-forget (no falla el QuickCheck si falla el evento)
   * - Obtiene/crea tipo de evento sistemático
   * - Metadata completo para auditoría
   * 
   * @param machineId - MachineId VO
   * @param result - Resultado del QuickCheck ('approved' | 'disapproved')
   * @param responsibleName - Nombre del técnico que ejecutó
   * @param quickCheckData - Datos del QuickCheck agregado
   * @param machinePublic - Interfaz pública de la máquina
   * @returns eventId del evento creado, o null si falla
   */
  private async createMachineEventAuto(
    machineId: MachineId,
    result: string,
    responsibleName: string,
    quickCheckData: any,
    machinePublic: any
  ): Promise<string | null> {
    try {
      // 1. Determinar tipo de evento según resultado
      const eventTypeKey = result === QUICK_CHECK_RESULTS[0] 
        ? 'machine.events.quickcheck.completed'  // approved
        : 'machine.events.quickcheck.failed';     // disapproved

      // 2. Obtener o crear tipo de evento (sistema)
      // NOTE: Estos tipos ya deberían existir desde seed, pero por si acaso
      const eventType = await this.createEventTypeUseCase.execute(
        eventTypeKey,
        'system', // userId no relevante para tipos de sistema
        'es',
        true // systemGenerated
      );

      // 3. Preparar metadata completo para auditoría
      const machineName = machinePublic.nickname || machinePublic.serialNumber;
      const failedItemsCount = quickCheckData.quickCheckItems?.filter(
        (item: any) => item.result === 'disapproved'
      ).length || 0;

      const metadata = {
        quickCheckId: quickCheckData.id,
        result,
        responsibleName,
        responsibleWorkerId: quickCheckData.responsibleWorkerId,
        executedById: quickCheckData.executedById,
        totalItems: quickCheckData.quickCheckItems?.length || 0,
        failedItems: failedItemsCount,
        observations: quickCheckData.observations || null,
        date: quickCheckData.date
      };

      // 4. Crear título descriptivo
      const title = result === QUICK_CHECK_RESULTS[0]
        ? `QuickCheck Aprobado - ${machineName}`
        : `QuickCheck Desaprobado - ${machineName} (${failedItemsCount} items fallidos)`;

      // 5. Crear descripción detallada
      const description = result === QUICK_CHECK_RESULTS[0]
        ? `QuickCheck ejecutado por ${responsibleName}. Todos los ítems inspeccionados están en orden.`
        : `QuickCheck ejecutado por ${responsibleName}. ${failedItemsCount} de ${metadata.totalItems} ítems NO aprobados. Requiere atención.`;

      // 6. Agregar evento a historial de máquina usando repositorio
      const addEventResult = await this.machineRepository.addEvent(machineId, {
        typeId: eventType.id,
        title,
        description,
        createdBy: quickCheckData.executedById, // Usuario que ejecutó el QuickCheck
        isSystemGenerated: true, // Evento automático
        metadata
      });

      // 7. Extraer eventId del resultado
      // addEvent retorna Result<IMachineEvent> donde IMachineEvent tiene id
      if (!addEventResult.success) {
        logger.warn({ 
          machineId: machineId.getValue(),
          error: addEventResult.error.message
        }, 'Failed to add event to machine');
        return null;
      }

      const eventId = addEventResult.data.id;

      logger.info({ 
        machineId: machineId.getValue(),
        eventTypeKey,
        result,
        eventId
      }, '📝 Machine event created for QuickCheck completion');

      return eventId;

    } catch (error) {
      // Log error pero no propagar (fire-and-forget)
      logger.warn({ 
        machineId: machineId.getValue(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'Failed to create machine event for QuickCheck');
      
      return null; // Retornar null si falla
    }
  }
}
