import { Result, ok, err, DomainError } from '../errors';
import { MachineType, CreateMachineTypeProps } from '../entities/machine-type';
import { MachineTypeId } from '../value-objects/machine-type-id.vo';
import { IMachineTypeRepository } from '../ports/machine-type.repository';

/**
 * Domain Service para MachineType
 * Encapsula lógica de negocio compleja que involucra múltiples entidades
 * o que requiere acceso a repositorios
 * 
 * Este es el "ExpERTO" en gestión de tipos de máquina que mencionábamos
 */
export class MachineTypeDomainService {
  constructor(private machineTypeRepository: IMachineTypeRepository) {}

  /**
   * Crea un nuevo tipo de máquina verificando reglas de negocio
   */
  async createMachineType(props: CreateMachineTypeProps, createdBy?: string): Promise<Result<MachineType, DomainError>> {
    // Verificar que el código no existe
    const codeExists = await this.machineTypeRepository.codeExists(props.code);
    if (codeExists) {
      return err(DomainError.conflict(`Machine type with code '${props.code}' already exists`));
    }

    // Crear la entidad
    const machineTypeResult = MachineType.create(props);
    if (!machineTypeResult.success) {
      return err(machineTypeResult.error);
    }

    const machineType = machineTypeResult.data;

    // Establecer audit info si se proporciona
    if (createdBy) {
      // Usar el método reconstitute con createdBy
      const auditedResult = MachineType.reconstitute({
        id: machineType.id.getValue(),
        code: machineType.code,
        displayName: machineType.displayName,
        description: machineType.description,
        category: machineType.category,
        isActive: machineType.isActive,
        metadata: machineType.metadata,
        createdAt: machineType.createdAt,
        updatedAt: machineType.updatedAt,
        createdBy: createdBy
      });

      if (!auditedResult.success) {
        return err(auditedResult.error);
      }
    }

    // Persistir
    const saveResult = await this.machineTypeRepository.save(machineType);
    if (!saveResult.success) {
      return err(saveResult.error);
    }

    return ok(machineType);
  }

  /**
   * Actualiza un tipo de máquina existente
   */
  async updateMachineType(
    id: MachineTypeId,
    updates: {
      displayName?: string;
      description?: string;
      category?: string;
    },
    lastModifiedBy?: string
  ): Promise<Result<MachineType, DomainError>> {
    // Cargar la entidad existente
    const machineTypeResult = await this.machineTypeRepository.findById(id);
    if (!machineTypeResult.success) {
      return err(machineTypeResult.error);
    }

    const machineType = machineTypeResult.data;

    // Aplicar las actualizaciones
    const updateResult = machineType.updateInfo({
      ...updates,
      lastModifiedBy
    });

    if (!updateResult.success) {
      return err(updateResult.error);
    }

    // Persistir cambios
    const saveResult = await this.machineTypeRepository.save(machineType);
    if (!saveResult.success) {
      return err(saveResult.error);
    }

    return ok(machineType);
  }

  /**
   * Desactiva un tipo de máquina si no está en uso
   */
  async deactivateMachineType(id: MachineTypeId, lastModifiedBy?: string): Promise<Result<void, DomainError>> {
    // Verificar que no hay máquinas usando este tipo
    const machineCount = await this.machineTypeRepository.countMachinesUsingType(id);
    if (machineCount > 0) {
      return err(DomainError.domainRule(`Cannot deactivate machine type: ${machineCount} machines are using it`));
    }

    // Cargar y desactivar
    const machineTypeResult = await this.machineTypeRepository.findById(id);
    if (!machineTypeResult.success) {
      return err(machineTypeResult.error);
    }

    const machineType = machineTypeResult.data;
    machineType.deactivate(lastModifiedBy);

    // Persistir
    const saveResult = await this.machineTypeRepository.save(machineType);
    if (!saveResult.success) {
      return err(saveResult.error);
    }

    return ok(undefined);
  }

  /**
   * Reactiva un tipo de máquina
   */
  async activateMachineType(id: MachineTypeId, lastModifiedBy?: string): Promise<Result<void, DomainError>> {
    const machineTypeResult = await this.machineTypeRepository.findById(id);
    if (!machineTypeResult.success) {
      return err(machineTypeResult.error);
    }

    const machineType = machineTypeResult.data;
    machineType.activate(lastModifiedBy);

    const saveResult = await this.machineTypeRepository.save(machineType);
    if (!saveResult.success) {
      return err(saveResult.error);
    }

    return ok(undefined);
  }

  /**
   * Elimina físicamente un tipo de máquina
   * SOLO si no hay máquinas asociadas
   */
  async deleteMachineType(id: MachineTypeId): Promise<Result<void, DomainError>> {
    // Verificar que no hay máquinas usando este tipo
    const machineCount = await this.machineTypeRepository.countMachinesUsingType(id);
    if (machineCount > 0) {
      return err(DomainError.domainRule(`Cannot delete machine type: ${machineCount} machines are using it`));
    }

    // Proceder con eliminación
    return await this.machineTypeRepository.delete(id);
  }

  /**
   * Obtiene todos los tipos activos para dropdowns
   */
  async getActiveTypesForDropdown(): Promise<Array<{ value: string; label: string; category: string }>> {
    const activeTypes = await this.machineTypeRepository.findAllActive();
    return activeTypes.map(type => type.toSelectOption());
  }

  /**
   * Obtiene tipos agrupados por categoría
   */
  async getTypesGroupedByCategory(): Promise<Record<string, MachineType[]>> {
    const allTypes = await this.machineTypeRepository.findAllActive();
    
    return allTypes.reduce((groups, type) => {
      const category = type.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(type);
      return groups;
    }, {} as Record<string, MachineType[]>);
  }

  /**
   * Busca tipos de máquina por término de búsqueda
   */
  async searchMachineTypes(searchTerm: string): Promise<MachineType[]> {
    const results = await this.machineTypeRepository.findPaginated({
      page: 1,
      limit: 100, // Límite alto para búsqueda
      filter: {
        searchTerm: searchTerm,
        isActive: true
      }
    });

    return results.items;
  }

  /**
   * Verifica si un código está disponible para uso
   */
  async isCodeAvailable(code: string, excludeId?: MachineTypeId): Promise<boolean> {
    if (excludeId) {
      return !(await this.machineTypeRepository.codeExistsExcluding(code, excludeId));
    } else {
      return !(await this.machineTypeRepository.codeExists(code));
    }
  }

  /**
   * Obtiene estadísticas de uso de tipos de máquina
   */
  async getUsageStatistics(): Promise<Array<{
    machineType: MachineType;
    machineCount: number;
  }>> {
    const allTypes = await this.machineTypeRepository.findAll();
    
    const statistics = await Promise.all(
      allTypes.map(async (type) => ({
        machineType: type,
        machineCount: await this.machineTypeRepository.countMachinesUsingType(type.id)
      }))
    );

    // Ordenar por uso descendente
    return statistics.sort((a, b) => b.machineCount - a.machineCount);
  }
}