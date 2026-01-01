import { MachineId, IMachine } from '@packages/domain';
import { MachineRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import { UpdateMachineRequest } from '@packages/contracts';
import { flattenToDotNotation } from '../../utils/flatten-to-dot-notation';

/**
 * Use Case para actualizar una máquina existente
 * 
 * PRINCIPIO DE EXPERTO:
 * - Use Case = Experto en lógica de negocio (QUÉ actualizar, validaciones)
 * - Repository = Experto en persistencia (CÓMO guardar en DB)
 * 
 * Este Use Case valida ownership y prepara el objeto de updates.
 * El Repository hace el update directo con Mongoose $set (merge automático).
 */
export class UpdateMachineUseCase {
  private machineRepository: MachineRepository;

  constructor() {
    this.machineRepository = new MachineRepository();
  }

  /**
   * Ejecuta el caso de uso de actualizar máquina
   * @param machineId - ID de la máquina a actualizar
   * @param request - Datos a actualizar
   * @param requestingUserId - ID del usuario que solicita
   * @param userType - Tipo de usuario
   * @returns Promise<IMachine> - Interface ligera de la máquina actualizada
   */
  async execute(
    machineId: string,
    request: UpdateMachineRequest,
    requestingUserId: string,
    userType: string
  ): Promise<IMachine> {
    logger.info({ machineId, requestingUserId }, 'Starting machine update');

    try {
      // Crear value object de ID
      const idResult = MachineId.create(machineId);
      if (!idResult.success) {
        throw new Error('Invalid machine ID format');
      }

      // Buscar máquina (solo para validar ownership)
      const machineResult = await this.machineRepository.findById(idResult.data);
      if (!machineResult.success) {
        throw new Error(machineResult.error.message);
      }

      const machine = machineResult.data;

      // Verificar ownership (solo owner puede actualizar)
      if (userType === 'CLIENT' && machine.ownerId.getValue() !== requestingUserId) {
        throw new Error('Access denied - not your machine');
      }

      // Preparar objeto de updates (lógica de negocio: QUÉ actualizar)
      const updates: Record<string, any> = {};

      // Basic info
      if (request.brand !== undefined) updates.brand = request.brand;
      if (request.modelName !== undefined) updates.modelName = request.modelName;
      if (request.nickname !== undefined) updates.nickname = request.nickname;

      // Assignment
      if (request.assignedTo !== undefined) updates.assignedTo = request.assignedTo;
      if (request.assignedProviderId !== undefined) updates.assignedProviderId = request.assignedProviderId;

      // Photo
      if (request.machinePhotoUrl !== undefined) updates.machinePhotoUrl = request.machinePhotoUrl;

      // Specs (nested - usar dot notation para evitar reemplazar todo el objeto)
      if (request.specs) {
        updates.specs = request.specs;
      }

      // Location (nested - usar dot notation para evitar reemplazar todo el objeto)
      if (request.location) {
        updates.location = request.location;
      }

      // Usage schedule
      if (request.usageSchedule) {
        updates.usageSchedule = request.usageSchedule;
      }

      // Validar que hay algo que actualizar
      if (Object.keys(updates).length === 0) {
        throw new Error('No fields to update');
      }

      // Convertir nested objects a dot notation para evitar reemplazar objetos completos
      // Ejemplo: { specs: { operatingHours: 500 } } → { 'specs.operatingHours': 500 }
      const flattenedUpdates = flattenToDotNotation(updates);

      // Delegar update al repo (sin lógica, solo persistencia)
      const updateResult = await this.machineRepository.update(idResult.data, flattenedUpdates);
      if (!updateResult.success) {
        throw new Error(updateResult.error.message);
      }

      logger.info({ machineId }, '✅ Machine updated successfully');

      // Convertir entity a interface ligera (DTO pattern)
      return updateResult.data.toPublicInterface();

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        machineId 
      }, 'Machine update failed');
      
      throw error;
    }
  }
}

