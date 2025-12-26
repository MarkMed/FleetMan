import { MachineId, UserId, MachineEventType } from '@packages/domain';
import { MachineRepository, MachineEventTypeRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import { type CreateMachineEventRequest } from '@packages/contracts';

/**
 * Use Case: Crear evento de máquina (reportado por usuario)
 * 
 * Responsabilidades:
 * 1. Validar que la máquina existe
 * 2. Validar que el usuario tiene acceso (owner o provider asignado)
 * 3. Obtener o crear tipo de evento (patrón crowdsourcing como MachineType)
 * 4. Agregar evento al historial de la máquina
 * 5. Incrementar contador de uso del tipo de evento (fire-and-forget)
 * 
 * Reglas de Acceso:
 * - CLIENT puede agregar eventos a sus propias máquinas
 * - PROVIDER puede agregar eventos a máquinas asignadas
 * 
 * Patrón:
 * - Similar a AddNotificationUseCase (subdocumento pattern)
 * - Similar a CreateMachineTypeUseCase (crowdsourcing de tipos)
 * - Fire-and-forget para incremento de contador
 * 
 * NO genera notificación por defecto (evitar spam):
 * - Eventos manuales del usuario NO notifican (el usuario ya sabe)
 * - Solo eventos sistemáticos críticos generan notificación (ver CreateSystemEventUseCase)
 */
export class CreateMachineEventUseCase {
  private machineRepository: MachineRepository;
  private eventTypeRepository: MachineEventTypeRepository;

  constructor() {
    this.machineRepository = new MachineRepository();
    this.eventTypeRepository = new MachineEventTypeRepository();
  }

  /**
   * Ejecuta el caso de uso de crear evento de máquina
   * 
   * @param machineId - ID de la máquina objetivo
   * @param userId - ID del usuario creando el evento (desde JWT)
   * @param request - Datos del evento a crear:
   *   - typeId: ID del tipo de evento (debe existir previamente)
   *   - title: Título del evento (1-200 chars)
   *   - description: Descripción detallada (1-2000 chars)
   *   - metadata: Datos adicionales flexibles (JSON)
   * 
   * @returns Promise con el evento creado
   * @throws Error si máquina no existe, acceso denegado, o validación falla
   */
  async execute(
    machineId: string,
    userId: string,
    request: CreateMachineEventRequest
  ): Promise<{
    eventId: string;
    machineId: string;
    message: string;
  }> {
    logger.info({ 
      machineId, 
      userId,
      typeId: request.typeId
    }, 'Creating machine event');

    try {
      // 1. Validar formato de machineId
      const machineIdResult = MachineId.create(machineId);
      if (!machineIdResult.success) {
        throw new Error(`Invalid machine ID format: ${machineIdResult.error.message}`);
      }

      // 2. Validar formato de userId
      const userIdResult = UserId.create(userId);
      if (!userIdResult.success) {
        throw new Error(`Invalid user ID format: ${userIdResult.error.message}`);
      }

      // 3. Validar que la máquina existe y que el usuario tiene acceso
      const machineResult = await this.machineRepository.findById(machineIdResult.data);
      if (!machineResult.success) {
        throw new Error(`Machine with ID ${machineId} not found`);
      }

      const machine = machineResult.data;

      // 4. Validar acceso del usuario (owner o provider asignado)
      const isOwner = machine.ownerId.getValue() === userId;
      const isAssignedProvider = machine.assignedProviderId?.getValue() === userId;

      if (!isOwner && !isAssignedProvider) {
        throw new Error('Access denied: you are not the owner or assigned provider');
      }

      // 5. Validar que el tipo de evento existe
      const typeExists = await this.eventTypeRepository.findById(request.typeId);
      if (!typeExists.success) {
        throw new Error(`Event type with ID ${request.typeId} not found`);
      }

      // 6. Agregar evento al historial de la máquina (subdocumento pattern)
      const addEventResult = await this.machineRepository.addEvent(
        machineIdResult.data,
        {
          typeId: request.typeId,
          title: request.title,
          description: request.description || '',
          createdBy: userId,
          isSystemGenerated: false, // Eventos manuales del usuario
          metadata: request.metadata || {}
        }
      );

      if (!addEventResult.success) {
        throw new Error(`Failed to add event: ${addEventResult.error.message}`);
      }

      const createdEvent = addEventResult.data;

      logger.info({ 
        eventId: createdEvent.id,
        machineId,
        eventTypeId: request.typeId,
        userId
      }, '✅ Machine event created successfully');

      return {
        eventId: createdEvent.id,
        machineId,
        message: 'Event reported successfully'
      };

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        machineId,
        userId
      }, 'Machine event creation failed');
      
      throw error;
    }
  }

  // ============================================================================
  // MÉTODOS ESTRATÉGICOS (Comentados para futuras features)
  // ============================================================================

  /**
   * TODO: Crear múltiples eventos en una sola operación (bulk reporting)
   * 
   * @param machineId - ID de la máquina
   * @param userId - ID del usuario
   * @param events - Array de eventos a crear
   * @returns Promise con eventos creados
   * 
   * Propósito:
   * - Útil cuando usuario importa historial desde otro sistema (Excel, CSV)
   * - Validar todos los eventos primero, luego crear con 1 save() transaccional
   * - Ejemplo: Importar 50 eventos de mantenimiento de sistema legacy
   * 
   * Implementación:
   * async executeBulk(
   *   machineId: string,
   *   userId: string,
   *   events: CreateMachineEventRequest[]
   * ): Promise<{ eventsCreated: number; errors: string[] }> {
   *   // 1. Validar ownership una sola vez
   *   // 2. Obtener/crear todos los tipos de eventos necesarios
   *   // 3. Agregar todos los eventos con 1 operación $push multiple
   *   // 4. Incrementar contadores en batch
   *   // 5. Retornar summary con éxitos y errores
   * }
   */

  /**
   * TODO: Crear evento con referencia a evento padre (relación parent-child)
   * 
   * @param machineId - ID de la máquina
   * @param userId - ID del usuario
   * @param request - Datos del evento
   * @param parentEventId - ID del evento padre
   * @returns Promise con evento creado
   * 
   * Propósito:
   * - Crear cadena de eventos relacionados
   * - Ejemplo: "Rotura Reportada" (padre) → "Reparación en Proceso" (hijo) → "Reparación Completada" (hijo)
   * - Metadata incluye { parentEventId: '...' }
   * - UI puede mostrar timeline de eventos relacionados
   * 
   * Caso de uso:
   * 1. Usuario reporta "Rotura del motor" (evento padre)
   * 2. Técnico reporta "Diagnóstico completado" (hijo del evento 1)
   * 3. Técnico reporta "Reparación finalizada" (hijo del evento 1)
   * 4. UI muestra árbol de eventos relacionados con la rotura original
   * 
   * Implementación:
   * async executeWithParent(
   *   machineId: string,
   *   userId: string,
   *   request: CreateMachineEventRequest,
   *   parentEventId: string
   * ): Promise<{ eventId: string; parentEventId: string }> {
   *   // 1. Validar que evento padre existe en eventsHistory
   *   // 2. Agregar parentEventId a metadata
   *   // 3. Ejecutar create normal
   *   // 4. Opcional: Notificar a creadores de eventos relacionados
   * }
   */

  /**
   * TODO: Plantillas de eventos frecuentes (Quick Report Templates)
   * 
   * @param machineId - ID de la máquina
   * @param userId - ID del usuario
   * @param templateId - ID de plantilla predefinida
   * @returns Promise con evento creado
   * 
   * Propósito:
   * - Usuario crea eventos frecuentes con 1 click (sin formulario completo)
   * - Ejemplo: Plantilla "Mantenimiento Preventivo Estándar" con descripción pre-llenada
   * - Reducir friction para reportes rutinarios
   * 
   * Plantillas comunes:
   * - "Mantenimiento preventivo completado"
   * - "Inspección de rutina OK"
   * - "Lubricación realizada"
   * - "Limpieza profunda"
   * 
   * Implementación:
   * async executeFromTemplate(
   *   machineId: string,
   *   userId: string,
   *   templateId: string,
   *   customFields?: { title?: string; description?: string }
   * ): Promise<{ eventId: string }> {
   *   // 1. Cargar plantilla desde EventTemplateRepository
   *   // 2. Merge plantilla con campos custom
   *   // 3. Ejecutar create normal
   *   // 4. Incrementar contador de uso de plantilla (analytics)
   * }
   */
}
