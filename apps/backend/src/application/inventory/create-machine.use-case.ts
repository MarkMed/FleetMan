import { Machine, UsageSchedule, NOTIFICATION_TYPES, NOTIFICATION_SOURCE_TYPES } from '@packages/domain';
import { MachineRepository, MachineTypeRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import { CreateMachineRequest } from '@packages/contracts';
import { AddNotificationUseCase } from '../notifications/add-notification.use-case';
import { NOTIFICATION_MESSAGE_KEYS } from '../../constants/notification-messages.constants';

/**
 * Use Case para crear una nueva máquina
 * Valida serial number único, machineTypeId existente y crea la entidad
 */
export class CreateMachineUseCase {
  private machineRepository: MachineRepository;
  private machineTypeRepository: MachineTypeRepository;
  private addNotificationUseCase: AddNotificationUseCase;

  constructor() {
    this.machineRepository = new MachineRepository();
    this.machineTypeRepository = new MachineTypeRepository();
    this.addNotificationUseCase = new AddNotificationUseCase();
  }

  /**
   * Ejecuta el caso de uso de crear máquina
   * @param request - Datos de la máquina a crear
   * @returns Promise con la máquina creada
   */
  async execute(request: CreateMachineRequest): Promise<Machine> {
    logger.info({ 
      serialNumber: request.serialNumber,
      ownerId: request.ownerId 
    }, 'Starting machine creation');

    try {
      // Validar que el serial number no exista
      const serialExists = await this.machineRepository.serialNumberExists(request.serialNumber);
      if (serialExists) {
        throw new Error(`Serial number ${request.serialNumber} already exists`);
      }

      // Validar que el machine type exista
      const machineType = await this.machineTypeRepository.findById(request.machineTypeId);
      if (!machineType) {
        throw new Error(`Machine type with ID ${request.machineTypeId} not found`);
      }

      // Crear UsageSchedule VO si viene en request
      let usageSchedule: UsageSchedule | undefined;
      if (request.usageSchedule) {
        const usageScheduleResult = UsageSchedule.create(
          request.usageSchedule.dailyHours,
          request.usageSchedule.operatingDays // UsageSchedule.create acepta readonly arrays
        );
        if (!usageScheduleResult.success) {
          throw new Error(usageScheduleResult.error.message);
        }
        usageSchedule = usageScheduleResult.data;
      }

      // Crear entidad de dominio
      const machineResult = Machine.create({
        serialNumber: request.serialNumber,
        brand: request.brand,
        modelName: request.modelName,
        machineTypeId: request.machineTypeId,
        ownerId: request.ownerId,
        createdById: request.createdById,
        nickname: request.nickname,
        specs: request.specs,
        location: request.location ? {
          ...request.location,
          lastUpdated: new Date(request.location.lastUpdated)
        } : undefined,
        initialStatus: request.initialStatus,
        assignedTo: request.assignedTo, // [NEW Task 3.2a] Person assigned to machine
        usageSchedule, // [NEW Task 3.2a] Value Object (not plain object!)
        machinePhotoUrl: request.machinePhotoUrl // [NEW Task 3.2a] Photo URL
      });

      if (!machineResult.success) {
        throw new Error(machineResult.error.message);
      }

      const machine = machineResult.data;

      // Guardar en repositorio
      const saveResult = await this.machineRepository.save(machine);
      if (!saveResult.success) {
        throw new Error(saveResult.error.message);
      }

      logger.info({ 
        id: machine.id.getValue(),
        serialNumber: machine.serialNumber.getValue()
      }, '✅ Machine created successfully');

      // 🔔 Notificar al dueño de la máquina sobre el registro exitoso
      // Fire-and-forget: No fallar el registro si falla la notificación
      try {
        const ownerId = machine.ownerId.getValue();
        const machineName = machine.nickname || machine.serialNumber.getValue();
        const machineTypeName = machineType.name; // Ya disponible de validación anterior (línea 42)

        await this.addNotificationUseCase.execute(ownerId, {
          notificationType: NOTIFICATION_TYPES[0], // 'success'
          message: NOTIFICATION_MESSAGE_KEYS.machine.created,
          actionUrl: `/machines/${machine.id.getValue()}`,
          sourceType: NOTIFICATION_SOURCE_TYPES[3], // 'SYSTEM'
          metadata: {
            machineName,
            machineType: machineTypeName,
            brand: machine.brand,
            serialNumber: machine.serialNumber.getValue()
          }
        });

        logger.info({ 
          ownerId, 
          machineId: machine.id.getValue() 
        }, '📢 Machine registration notification sent');

      } catch (notificationError) {
        // Log error pero no propagar - la máquina ya fue creada exitosamente
        logger.error({ 
          error: notificationError instanceof Error ? notificationError.message : 'Unknown error',
          machineId: machine.id.getValue()
        }, '⚠️ Failed to send machine registration notification');
      }

      // TODO: Método estratégico - Notificar a provider asignado si existe
      // if (machine.assignedProviderId) {
      //   await this.notifyAssignedProvider(machine);
      //   // Mensaje: "Nueva máquina asignada: {machineType} {brand} {serialNumber}"
      //   // Útil para flujo: Cliente crea máquina → Provider recibe notificación
      // }

      return machine;

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        serialNumber: request.serialNumber
      }, 'Machine creation failed');
      
      throw error;
    }
  }

  // ============================================================================
  // MÉTODOS ESTRATÉGICOS (Comentados para futuras features)
  // ============================================================================

  /**
   * TODO: Notificar a provider asignado cuando se le asigna una nueva máquina
   * 
   * @param machine - Máquina recién creada con assignedProviderId
   * @returns Promise<void>
   * 
   * Propósito:
   * - Avisar al provider que tiene una nueva máquina asignada
   * - Mensaje: "Nueva máquina asignada: {machineType} {brand} {serialNumber}"
   * - ActionUrl: `/machines/${machineId}` (para ver detalles)
   * 
   * Caso de uso:
   * - Cliente crea máquina Y asigna provider → Provider recibe notificación
   * - Provider puede prepararse para dar servicio a esa máquina
   * 
   * Implementación:
   * async notifyAssignedProvider(machine: Machine): Promise<void> {
   *   if (!machine.assignedProviderId) return;
   *   
   *   const providerId = machine.assignedProviderId.getValue();
   *   const machineName = machine.nickname || machine.serialNumber.getValue();
   *   
   *   await this.addNotificationUseCase.execute(providerId, {
   *     notificationType: NOTIFICATION_TYPES[1], // 'info'
   *     message: NOTIFICATION_MESSAGE_KEYS.machine.assigned,
   *     actionUrl: `/machines/${machine.id.getValue()}`,
   *     sourceType: NOTIFICATION_SOURCE_TYPES[3], // 'SYSTEM'
   *     metadata: { machineName, machineType, brand, serialNumber }
   *   });
   * }
   */

  /**
   * TODO: Notificaciones bulk para importación masiva de máquinas
   * 
   * @param machines - Array de máquinas creadas
   * @param ownerId - ID del dueño común (típicamente mismo cliente)
   * @returns Promise<void>
   * 
   * Propósito:
   * - Enviar 1 notificación consolidada en vez de N notificaciones individuales
   * - Evitar spam de notificaciones cuando se importan 50+ máquinas desde Excel/CSV
   * 
   * Mensaje: "Se registraron {count} máquinas nuevas en tu flota"
   * ActionUrl: `/machines?filter=recent` (listado filtrado por recientes)
   * 
   * Caso de uso:
   * - Cliente importa 100 máquinas desde CSV
   * - En vez de 100 notificaciones → 1 notificación consolidada
   * 
   * Implementación:
   * async notifyBulkMachineRegistration(machines: Machine[], ownerId: string): Promise<void> {
   *   await this.addNotificationUseCase.execute(ownerId, {
   *     notificationType: NOTIFICATION_TYPES[0], // 'success'
   *     message: NOTIFICATION_MESSAGE_KEYS.machine.bulkCreated,
   *     actionUrl: `/machines?filter=recent`,
   *     sourceType: NOTIFICATION_SOURCE_TYPES[3], // 'SYSTEM'
   *     metadata: { 
   *       count: machines.length,
   *       firstMachineName: machines[0].nickname || machines[0].serialNumber.getValue()
   *     }
   *   });
   * }
   */

  /**
   * TODO: Notificación de validación/activación de máquina pendiente
   * 
   * @param machineId - ID de la máquina pendiente de validación
   * @param adminUserId - ID del administrador que debe validar
   * @returns Promise<void>
   * 
   * Propósito:
   * - Workflow de aprobación: Máquina creada → Admin valida → Máquina activada
   * - Útil para empresas con proceso de auditoría antes de activar activos
   * 
   * Mensaje: "Nueva máquina pendiente de validación: {machineType} {serialNumber}"
   * ActionUrl: `/admin/machines/pending-validation/${machineId}`
   * 
   * Caso de uso:
   * - Cliente crea máquina con status PENDING
   * - Admin recibe notificación para validar documentación/datos
   * - Admin aprueba → Máquina cambia a OPERATIONAL
   * 
   * Implementación:
   * async notifyPendingValidation(machine: Machine, adminUserId: string): Promise<void> {
   *   await this.addNotificationUseCase.execute(adminUserId, {
   *     notificationType: NOTIFICATION_TYPES[1], // 'info'
   *     message: NOTIFICATION_MESSAGE_KEYS.machine.pendingValidation,
   *     actionUrl: `/admin/machines/pending-validation/${machine.id.getValue()}`,
   *     sourceType: NOTIFICATION_SOURCE_TYPES[3], // 'SYSTEM'
   *     metadata: { 
   *       machineType,
   *       serialNumber: machine.serialNumber.getValue(),
   *       createdBy: machine.createdById.getValue()
   *     }
   *   });
   * }
   */
}
