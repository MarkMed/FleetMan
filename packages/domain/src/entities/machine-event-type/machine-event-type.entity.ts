/**
 * Entidad MachineEventType - Tipo de Evento de Máquina
 * 
 * Representa un tipo de evento que puede ser usado para categorizar eventos de máquinas.
 * Permite evolución orgánica del sistema - los usuarios pueden crear nuevos tipos dinámicamente.
 */

import { Result, ok, err, DomainError } from '../../errors';
import { UserId } from '../../value-objects/user-id.vo';
import { IMachineEventType } from '../../models/interfaces';

// =============================================================================
// Interfaces para MachineEventType
// =============================================================================

/**
 * Propiedades para crear un nuevo MachineEventType
 */
export interface CreateMachineEventTypeProps {
  readonly name: string;           // Nombre del tipo de evento (ej: "Limpieza profunda")
  readonly createdBy?: string;     // ID del usuario (si no es sistema)
}

/**
 * Propiedades internas de MachineEventType
 */
interface MachineEventTypeProps {
  readonly id: string;
  readonly name: string;
  readonly normalizedName: string;  // Para búsquedas y comparaciones
  readonly systemGenerated: boolean;
  readonly createdBy: UserId | null;
  readonly createdAt: Date;
  readonly timesUsed: number;      // Para ordenar por popularidad
  readonly isActive: boolean;      // Soft delete
}

// =============================================================================
// Entidad MachineEventType
// =============================================================================

export class MachineEventType {
  private constructor(private props: MachineEventTypeProps) {}

  /**
   * Convierte la entidad a su representación de interfaz pública
   * Para uso en frontend y contratos
   */
  public toPublicInterface(): IMachineEventType {
    return {
      id: this.props.id,
      name: this.props.name,
      normalizedName: this.props.normalizedName,
      systemGenerated: this.props.systemGenerated,
      createdBy: this.props.createdBy?.getValue(),
      timesUsed: this.props.timesUsed,
      isActive: this.props.isActive,
      createdAt: this.props.createdAt,
      updatedAt: this.props.createdAt // MachineEventType no tiene updatedAt, usa createdAt
    };
  }

  // ==========================================================================
  // Factory Methods
  // ==========================================================================

  /**
   * Crea un nuevo tipo de evento generado por el sistema
   */
  public static createSystemType(createProps: CreateMachineEventTypeProps): Result<MachineEventType, DomainError> {
    const validation = MachineEventType.validateCreateProps(createProps);
    if (!validation.success) {
      return err(validation.error);
    }

    const normalizedName = MachineEventType.normalizeName(createProps.name);
    
    const props: MachineEventTypeProps = {
      id: MachineEventType.generateId(),
      name: createProps.name.trim(),
      normalizedName,
      systemGenerated: true,
      createdBy: null,
      createdAt: new Date(),
      timesUsed: 0,
      isActive: true
    };

    return ok(new MachineEventType(props));
  }

  /**
   * Crea un nuevo tipo de evento creado por usuario
   */
  public static createUserType(createProps: CreateMachineEventTypeProps): Result<MachineEventType, DomainError> {
    const validation = MachineEventType.validateCreateProps(createProps);
    if (!validation.success) {
      return err(validation.error);
    }

    if (!createProps.createdBy) {
      return err(DomainError.validation('User ID is required for user-created event types'));
    }

    const userIdResult = UserId.create(createProps.createdBy);
    if (!userIdResult.success) {
      return err(userIdResult.error);
    }

    const normalizedName = MachineEventType.normalizeName(createProps.name);
    
    const props: MachineEventTypeProps = {
      id: MachineEventType.generateId(),
      name: createProps.name.trim(),
      normalizedName,
      systemGenerated: false,
      createdBy: userIdResult.data,
      createdAt: new Date(),
      timesUsed: 0,
      isActive: true
    };

    return ok(new MachineEventType(props));
  }

  // ==========================================================================
  // Validaciones
  // ==========================================================================

  private static validateCreateProps(props: CreateMachineEventTypeProps): Result<void, DomainError> {
    // Validar nombre
    if (!props.name || props.name.trim().length === 0) {
      return err(DomainError.validation('Event type name is required'));
    }
    if (props.name.trim().length > 50) {
      return err(DomainError.validation('Event type name cannot exceed 50 characters'));
    }

    return ok(undefined);
  }

  private static generateId(): string {
    return `mevt_type_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Normaliza el nombre para búsquedas y comparaciones
   */
  private static normalizeName(name: string): string {
    return name.toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '_');       // Espacios a guiones bajos
  }

  // ==========================================================================
  // Getters
  // ==========================================================================

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get normalizedName(): string {
    return this.props.normalizedName;
  }

  get systemGenerated(): boolean {
    return this.props.systemGenerated;
  }

  get createdBy(): UserId | null {
    return this.props.createdBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get timesUsed(): number {
    return this.props.timesUsed;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  // ==========================================================================
  // Métodos de negocio
  // ==========================================================================

  /**
   * Incrementa el contador de uso
   */
  public incrementUsage(): void {
    (this.props as any).timesUsed = this.props.timesUsed + 1;
  }

  /**
   * Desactiva el tipo de evento (soft delete)
   */
  public deactivate(): Result<void, DomainError> {
    if (this.props.systemGenerated) {
      return err(DomainError.domainRule('Cannot deactivate system-generated event types'));
    }

    (this.props as any).isActive = false;
    return ok(undefined);
  }

  /**
   * Reactiva el tipo de evento
   */
  public reactivate(): void {
    (this.props as any).isActive = true;
  }

  // TODO: Implementar búsqueda fuzzy para sugerencias UX
  // Razón: Cuando el usuario escriba "reparación" debe sugerir "Repair Completed"
  // Declaración: public static findSimilar(searchTerm: string, eventTypes: MachineEventType[]): MachineEventType[]

  // TODO: Implementar ordenamiento por popularidad
  // Razón: Los tipos más usados deben aparecer primero en la UI
  // Declaración: public static sortByPopularity(eventTypes: MachineEventType[]): MachineEventType[]

  // TODO: Implementar detección de duplicados
  // Razón: Evitar que se creen "Mantenimiento" y "mantenimiento " como tipos separados
  // Declaración: public static findDuplicates(name: string, eventTypes: MachineEventType[]): MachineEventType[]
}