/**
 * Entidad MachineEvent - Evento/Registro en el Historial de Máquina
 * 
 * Representa un evento específico en la bitácora de una máquina.
 * Funciona como historial unificado para trazabilidad operativa completa.
 * Puede ser creado manualmente por usuarios o automáticamente por el sistema.
 */

import { Result, ok, err, DomainError } from '../../errors';
import { UserId } from '../../value-objects/user-id.vo';
import { MachineId } from '../../value-objects/machine-id.vo';

// =============================================================================
// Types para MachineEvent
// =============================================================================

/**
 * Metadatos adicionales para eventos (simplificado para MVP)
 */
export interface MachineEventMetadata {
  // Información adicional como objeto flexible
  readonly additionalInfo?: Record<string, any>;
  
  // Información básica de contexto
  readonly notes?: string;
}

// =============================================================================
// Interfaces para MachineEvent
// =============================================================================

/**
 * Propiedades para crear un nuevo MachineEvent
 */
export interface CreateMachineEventProps {
  readonly machineId: string;           // ID de la máquina asociada
  readonly createdBy: string;          // ID del usuario que crea el evento
  readonly typeId: string;             // ID del tipo de evento (MachineEventType)
  readonly title: string;              // Título descriptivo del evento
  readonly description: string;        // Descripción detallada
  readonly metadata?: MachineEventMetadata; // Metadatos específicos del tipo
}

/**
 * Propiedades internas de MachineEvent
 */
interface MachineEventProps {
  readonly id: string;
  readonly machineId: MachineId;
  readonly createdBy: UserId;
  readonly typeId: string;             // ID del tipo de evento (MachineEventType)
  readonly title: string;
  readonly description: string;
  readonly metadata: MachineEventMetadata | null;
  readonly createdAt: Date;
  readonly isSystemGenerated: boolean;
}

// =============================================================================
// Entidad MachineEvent
// =============================================================================

export class MachineEvent {
  private constructor(private props: MachineEventProps) {}

  // ==========================================================================
  // Factory Methods
  // ==========================================================================

  /**
   * Crea un nuevo evento manual reportado por un usuario
   */
  public static createUserEvent(createProps: CreateMachineEventProps): Result<MachineEvent, DomainError> {
    const validation = MachineEvent.validateCreateProps(createProps);
    if (!validation.success) {
      return err(validation.error);
    }

    const machineIdResult = MachineId.create(createProps.machineId);
    if (!machineIdResult.success) {
      return err(machineIdResult.error);
    }

    const userIdResult = UserId.create(createProps.createdBy);
    if (!userIdResult.success) {
      return err(userIdResult.error);
    }

    const props: MachineEventProps = {
      id: MachineEvent.generateId(),
      machineId: machineIdResult.data,
      createdBy: userIdResult.data,
      typeId: createProps.typeId,
      title: createProps.title.trim(),
      description: createProps.description.trim(),
      metadata: createProps.metadata ?? null,
      createdAt: new Date(),
      isSystemGenerated: false
    };

    return ok(new MachineEvent(props));
  }

  /**
   * Crea un nuevo evento automático generado por el sistema
   */
  public static createSystemEvent(
    machineId: string,
    systemUserId: string,
    typeId: string,
    title: string,
    description: string,
    metadata?: MachineEventMetadata
  ): Result<MachineEvent, DomainError> {
    const createProps: CreateMachineEventProps = {
      machineId,
      createdBy: systemUserId,
      typeId,
      title,
      description,
      metadata
    };

    const validation = MachineEvent.validateCreateProps(createProps);
    if (!validation.success) {
      return err(validation.error);
    }

    const machineIdResult = MachineId.create(machineId);
    if (!machineIdResult.success) {
      return err(machineIdResult.error);
    }

    const userIdResult = UserId.create(systemUserId);
    if (!userIdResult.success) {
      return err(userIdResult.error);
    }

    const props: MachineEventProps = {
      id: MachineEvent.generateId(),
      machineId: machineIdResult.data,
      createdBy: userIdResult.data,
      typeId,
      title: title.trim(),
      description: description.trim(),
      metadata: metadata ?? null,
      createdAt: new Date(),
      isSystemGenerated: true
    };

    return ok(new MachineEvent(props));
  }

  // ==========================================================================
  // Validaciones
  // ==========================================================================

  private static validateCreateProps(props: CreateMachineEventProps): Result<void, DomainError> {
    // Validar título
    if (!props.title || props.title.trim().length === 0) {
      return err(DomainError.validation('Event title is required'));
    }
    if (props.title.trim().length > 200) {
      return err(DomainError.validation('Event title cannot exceed 200 characters'));
    }

    // Validar descripción
    if (!props.description || props.description.trim().length === 0) {
      return err(DomainError.validation('Event description is required'));
    }
    if (props.description.trim().length > 2000) {
      return err(DomainError.validation('Event description cannot exceed 2000 characters'));
    }

    // Validar tipo de evento (debe ser un string válido - ID de MachineEventType)
    if (!props.typeId || props.typeId.trim().length === 0) {
      return err(DomainError.validation('Event type ID is required'));
    }

    return ok(undefined);
  }

  private static generateId(): string {
    return `mevt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==========================================================================
  // Getters (Propiedades inmutables)
  // ==========================================================================

  get id(): string {
    return this.props.id;
  }

  get machineId(): MachineId {
    return this.props.machineId;
  }

  get createdBy(): UserId {
    return this.props.createdBy;
  }

  get typeId(): string {
    return this.props.typeId;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get metadata(): MachineEventMetadata | null {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get isSystemGenerated(): boolean {
    return this.props.isSystemGenerated;
  }

  // ==========================================================================
  // Métodos de negocio
  // ==========================================================================

  /**
   * Obtiene una representación resumida del evento para logs
   */
  public getLogSummary(): string {
    const timestamp = this.props.createdAt.toISOString();
    const source = this.props.isSystemGenerated ? 'SYSTEM' : 'USER';
    return `[${timestamp}] ${source} - ${this.props.typeId}: ${this.props.title}`;
  }

  /**
   * Obtiene información contextual del evento para notificaciones
   */
  public getNotificationContext(): {
    machineId: string;
    eventTypeId: string;
    title: string;
  } {
    return {
      machineId: this.props.machineId.getValue(),
      eventTypeId: this.props.typeId,
      title: this.props.title
    };
  }

  // TODO: Implementar método para verificar si es evento crítico
  // Razón: Algunos eventos requieren notificación inmediata (breakdowns, alertas)
  // Implementación: Requiere consultar la entidad MachineEventType para determinar criticidad
  // Declaración: public isCritical(): Promise<boolean>

  // TODO: Implementar método para obtener eventos relacionados
  // Razón: Para mostrar contexto histórico (ej: reparaciones relacionadas a una avería)
  // Implementación: Buscar eventos de la misma máquina en rango temporal
  // Declaración: public static findRelatedEvents(machineId: string, timeRange: number): Promise<MachineEvent[]>
}