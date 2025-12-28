import { 
  MachineId, 
  QUICK_CHECK_RESULTS, 
  NOTIFICATION_SOURCE_TYPES,
  NOTIFICATION_TYPES,
  type IQuickCheckRecord
} from '@packages/domain';
import { MachineRepository, MachineEventTypeRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import { type CreateQuickCheckRecord } from '@packages/contracts';
import { CreateMachineEventUseCase } from '../machine-events';
import { NOTIFICATION_MESSAGE_KEYS} from '../../constants/notification-messages.constants';

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
  private createMachineEventUseCase: CreateMachineEventUseCase;
  private eventTypeRepository: MachineEventTypeRepository;

  constructor() {
    this.machineRepository = new MachineRepository();
    this.createMachineEventUseCase = new CreateMachineEventUseCase();
    this.eventTypeRepository = new MachineEventTypeRepository();
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
    quickCheckAdded: IQuickCheckRecord;
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

      // 3. Integración Sprint #10: Crear evento automático
      // El evento se encarga de notificar al owner automáticamente
      // Fire-and-forget pattern: no bloquear si falla la creación
      // ORDEN CORRECTO: QuickCheck save → Event creation (which notifies)
      this.createEventForQuickCheck(machineId, quickCheckRecord.result, quickCheckRecord)
        .catch(error => {
          logger.warn({ 
            machineId,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, '⚠️ Failed to create event for QuickCheck (non-blocking)');
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
   * Crea evento automático para QuickCheck completado
   * El use case de eventos se encarga de notificar al owner automáticamente
   * Fire-and-forget: errors don't block main operation
   * 
   * FLUJO SIMPLIFICADO (Sprint #10 refactor):
   * 1. QuickCheck se guarda en DB
   * 2. Se llama a CreateMachineEventUseCase.execute()
   * 3. El use case crea evento Y notifica automáticamente
   * 
   * @param machineId - ID of inspected machine
   * @param result - QuickCheck result (SSOT: QUICK_CHECK_RESULTS)
   * @param quickCheckRecord - Complete QuickCheck record for event creation
   */
  private async createEventForQuickCheck(
    machineId: string,
    result: typeof QUICK_CHECK_RESULTS[number],
    quickCheckRecord: IQuickCheckRecord
  ): Promise<void> {
    try {
      // Solo crear eventos para approved/disapproved (no para notInitiated)
      if (result !== QUICK_CHECK_RESULTS[0] && result !== QUICK_CHECK_RESULTS[1]) {
        logger.debug({ machineId, result }, 'Skipping event creation for notInitiated QuickCheck');
        return;
      }

      // 1. Determinar event type key según resultado
      const eventTypeKey = result === QUICK_CHECK_RESULTS[0] 
        ? NOTIFICATION_MESSAGE_KEYS.quickcheck.completed.approved  // approved
        : NOTIFICATION_MESSAGE_KEYS.quickcheck.completed.disapproved;     // disapproved

      // 2. Buscar tipo de evento del sistema para obtener typeId
      const normalizedKey = eventTypeKey.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
      console.log('!!Creating event for QuickCheck with type key:', eventTypeKey, 'normalized as:', normalizedKey);
      const eventTypeResult = await this.eventTypeRepository.findByNormalizedName(normalizedKey);

      if (!eventTypeResult.success) {
        logger.warn({ 
          eventTypeKey,
          normalizedKey
        }, 'System event type not found - seed may not have run correctly');
        return; // Fire-and-forget: no crear eventos si el tipo no existe
      }

      const eventType = eventTypeResult.data;

      // 3. Preparar metadata completo para auditoría
      const failedItemsCount = quickCheckRecord.quickCheckItems?.filter(
        (item: any) => item.result === 'disapproved'
      ).length || 0;

      const metadata = {
        additionalInfo: {
          result,
          responsibleName: quickCheckRecord.responsibleName,
          responsibleWorkerId: quickCheckRecord.responsibleWorkerId,
          executedById: quickCheckRecord.executedById,
          totalItems: quickCheckRecord.quickCheckItems?.length || 0,
          failedItems: failedItemsCount,
          observations: quickCheckRecord.observations || null,
          date: quickCheckRecord.date
        }
      };

      // 4. Crear título y descripción usando keys de notificación
      const title = result === QUICK_CHECK_RESULTS[0]
        ? NOTIFICATION_MESSAGE_KEYS.quickcheck.completed.approved
        : NOTIFICATION_MESSAGE_KEYS.quickcheck.completed.disapproved;

      const description = title + `.description`; // i18n key para descripción detallada

      // 5. actionUrl dinámico apuntando al historial de QuickCheck
      const actionUrl = `/machines/${machineId}/quickcheck/history`;

      // 6. Llamar a CreateMachineEventUseCase (el cual notifica automáticamente)
      await this.createMachineEventUseCase.execute(
        machineId,
        quickCheckRecord.executedById, // userId del técnico que ejecutó
        {
          machineId, // Requerido por el schema
          createdBy: quickCheckRecord.executedById, // Requerido por el schema
          typeId: eventType.id,
          title,
          description,
          metadata
        },
        actionUrl // Pasar actionUrl custom para la notificación
      );

      logger.info({ 
        machineId,
        result
      }, '📝 Event created for QuickCheck (notification sent automatically)');

    } catch (error) {
      // Log error pero no propagar (fire-and-forget)
      logger.warn({ 
        machineId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'Failed to create event for QuickCheck');
    }
  }
}
