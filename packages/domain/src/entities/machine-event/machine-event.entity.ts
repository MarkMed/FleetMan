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
// Enums y Types para MachineEvent
// =============================================================================

/**
 * Tipos de eventos de máquina soportados
 */
export enum MachineEventType {
  // Eventos manuales reportados por usuarios
  BREAKDOWN = 'breakdown',                    // Avería/rotura reportada
  REPAIR_COMPLETED = 'repair_completed',      // Reparación finalizada
  MAINTENANCE_PERFORMED = 'maintenance_performed', // Mantenimiento realizado
  PART_REPLACEMENT = 'part_replacement',      // Reemplazo de pieza
  STATUS_CHANGE = 'status_change',           // Cambio de estado operativo
  LOCATION_CHANGE = 'location_change',       // Cambio de ubicación
  OPERATOR_NOTE = 'operator_note',           // Nota general del operador
  
  // Eventos automáticos generados por el sistema
  QUICKCHECK_COMPLETED = 'quickcheck_completed',     // QuickCheck finalizado
  MAINTENANCE_REMINDER = 'maintenance_reminder',     // Recordatorio disparado
  COMMUNICATION_LOG = 'communication_log',           // Log de comunicación relevante
  SYSTEM_ALERT = 'system_alert'                     // Alerta del sistema
}

/**
 * Prioridad/severidad del evento
 */
export enum MachineEventPriority {
  LOW = 'low',          // Informativo, sin urgencia
  MEDIUM = 'medium',    // Requiere atención moderada
  HIGH = 'high',        // Requiere atención pronta
  CRITICAL = 'critical' // Requiere acción inmediata
}

/**
 * Metadatos adicionales específicos por tipo de evento
 */
export interface MachineEventMetadata {
  // Para QUICKCHECK_COMPLETED
  readonly quickCheckResult?: {
    readonly totalItems: number;
    readonly passedItems: number;
    readonly failedItems: number;
    readonly overallPassed: boolean;
  };
  
  // Para MAINTENANCE_REMINDER
  readonly maintenanceInfo?: {
    readonly reminderId: string;
    readonly triggerCondition: 'time' | 'hours' | 'both';
    readonly nextDueDate?: Date;
  };
  
  // Para PART_REPLACEMENT
  readonly partInfo?: {
    readonly partName: string;
    readonly partNumber?: string;
    readonly supplier?: string;
    readonly cost?: number;
  };
  
  // Para STATUS_CHANGE
  readonly statusChange?: {
    readonly previousStatus: string;
    readonly newStatus: string;
    readonly reason?: string;
  };
  
  // Para LOCATION_CHANGE
  readonly locationInfo?: {
    readonly previousLocation?: string;
    readonly newLocation: string;
    readonly coordinates?: { lat: number; lng: number };
  };
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
  readonly type: MachineEventType;     // Tipo de evento
  readonly title: string;              // Título descriptivo del evento
  readonly description: string;        // Descripción detallada
  readonly priority?: MachineEventPriority; // Prioridad (default: MEDIUM)
  readonly metadata?: MachineEventMetadata; // Metadatos específicos del tipo
}

/**
 * Propiedades internas de MachineEvent
 */
interface MachineEventProps {
  readonly id: string;
  readonly machineId: MachineId;
  readonly createdBy: UserId;
  readonly type: MachineEventType;
  readonly title: string;
  readonly description: string;
  readonly priority: MachineEventPriority;
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
      type: createProps.type,
      title: createProps.title.trim(),
      description: createProps.description.trim(),
      priority: createProps.priority ?? MachineEventPriority.MEDIUM,
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
    type: MachineEventType,
    title: string,
    description: string,
    priority: MachineEventPriority = MachineEventPriority.MEDIUM,
    metadata?: MachineEventMetadata
  ): Result<MachineEvent, DomainError> {
    const createProps: CreateMachineEventProps = {
      machineId,
      createdBy: systemUserId,
      type,
      title,
      description,
      priority,
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
      type,
      title: title.trim(),
      description: description.trim(),
      priority,
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

    // Validar tipo de evento
    if (!Object.values(MachineEventType).includes(props.type)) {
      return err(DomainError.validation('Invalid machine event type'));
    }

    // Validar prioridad si se proporciona
    if (props.priority && !Object.values(MachineEventPriority).includes(props.priority)) {
      return err(DomainError.validation('Invalid event priority'));
    }

    return ok(undefined);
  }

  private static generateId(): string {
    // TODO: Implementar generación de ID más robusta (UUID v4 o similar)
    // Razón: IDs únicos son críticos para la integridad del historial
    // Declaración: import { v4 as uuidv4 } from 'uuid'; return uuidv4();
    return `mevt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==========================================================================
  // Getters (Propiedades inmutables)
  // ==========================================================================

  /**
   * ID único del evento
   */
  get id(): string {
    return this.props.id;
  }

  /**
   * ID de la máquina asociada al evento
   */
  get machineId(): MachineId {
    return this.props.machineId;
  }

  /**
   * ID del usuario que creó el evento
   */
  get createdBy(): UserId {
    return this.props.createdBy;
  }

  /**
   * Tipo de evento de máquina
   */
  get type(): MachineEventType {
    return this.props.type;
  }

  /**
   * Título descriptivo del evento
   */
  get title(): string {
    return this.props.title;
  }

  /**
   * Descripción detallada del evento
   */
  get description(): string {
    return this.props.description;
  }

  /**
   * Prioridad/severidad del evento
   */
  get priority(): MachineEventPriority {
    return this.props.priority;
  }

  /**
   * Metadatos específicos del tipo de evento
   */
  get metadata(): MachineEventMetadata | null {
    return this.props.metadata ? { ...this.props.metadata } : null;
  }

  /**
   * Fecha y hora de creación del evento
   */
  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }

  /**
   * Indica si el evento fue generado automáticamente por el sistema
   */
  get isSystemGenerated(): boolean {
    return this.props.isSystemGenerated;
  }

  // ==========================================================================
  // Métodos de negocio
  // ==========================================================================

  /**
   * Verifica si el evento es crítico y requiere atención inmediata
   */
  public isCritical(): boolean {
    return this.props.priority === MachineEventPriority.CRITICAL;
  }

  /**
   * Verifica si el evento indica una avería o problema
   */
  public isBreakdownEvent(): boolean {
    return this.props.type === MachineEventType.BREAKDOWN ||
           this.props.type === MachineEventType.SYSTEM_ALERT;
  }

  /**
   * Verifica si el evento es de mantenimiento (preventivo o correctivo)
   */
  public isMaintenanceEvent(): boolean {
    return this.props.type === MachineEventType.MAINTENANCE_PERFORMED ||
           this.props.type === MachineEventType.MAINTENANCE_REMINDER ||
           this.props.type === MachineEventType.PART_REPLACEMENT;
  }

  /**
   * Verifica si el evento requiere seguimiento o acción
   */
  public requiresFollowUp(): boolean {
    return this.props.priority === MachineEventPriority.HIGH ||
           this.props.priority === MachineEventPriority.CRITICAL ||
           this.isBreakdownEvent();
  }

  /**
   * Obtiene una representación resumida del evento para logs
   */
  public getLogSummary(): string {
    const timestamp = this.props.createdAt.toISOString();
    const source = this.props.isSystemGenerated ? 'SYSTEM' : 'USER';
    return `[${timestamp}] ${source} - ${this.props.type.toUpperCase()}: ${this.props.title} (${this.props.priority})`;
  }

  /**
   * Obtiene información contextual del evento para notificaciones
   */
  public getNotificationContext(): {
    machineId: string;
    eventType: string;
    priority: string;
    title: string;
    requiresAction: boolean;
  } {
    return {
      machineId: this.props.machineId.getValue(),
      eventType: this.props.type,
      priority: this.props.priority,
      title: this.props.title,
      requiresAction: this.requiresFollowUp()
    };
  }

  // ==========================================================================
  // Factory helpers para eventos específicos
  // ==========================================================================

  /**
   * Crea un evento de QuickCheck completado con metadatos específicos
   */
  public static createQuickCheckEvent(
    machineId: string,
    systemUserId: string,
    totalItems: number,
    passedItems: number,
    failedItems: number
  ): Result<MachineEvent, DomainError> {
    const overallPassed = failedItems === 0;
    const priority = overallPassed ? MachineEventPriority.LOW : MachineEventPriority.HIGH;
    const title = overallPassed ? 'QuickCheck Passed' : 'QuickCheck Failed';
    const description = `QuickCheck completed with ${passedItems}/${totalItems} items passed`;

    const metadata: MachineEventMetadata = {
      quickCheckResult: {
        totalItems,
        passedItems,
        failedItems,
        overallPassed
      }
    };

    return MachineEvent.createSystemEvent(
      machineId,
      systemUserId,
      MachineEventType.QUICKCHECK_COMPLETED,
      title,
      description,
      priority,
      metadata
    );
  }

  /**
   * Crea un evento de recordatorio de mantenimiento
   */
  public static createMaintenanceReminderEvent(
    machineId: string,
    systemUserId: string,
    reminderId: string,
    triggerCondition: 'time' | 'hours' | 'both',
    nextDueDate?: Date
  ): Result<MachineEvent, DomainError> {
    const title = 'Maintenance Reminder Triggered';
    const description = `Maintenance reminder activated based on ${triggerCondition} condition`;

    const metadata: MachineEventMetadata = {
      maintenanceInfo: {
        reminderId,
        triggerCondition,
        nextDueDate
      }
    };

    return MachineEvent.createSystemEvent(
      machineId,
      systemUserId,
      MachineEventType.MAINTENANCE_REMINDER,
      title,
      description,
      MachineEventPriority.MEDIUM,
      metadata
    );
  }

  // TODO: Implementar método para filtrar eventos por rango de fechas
  // Razón: Consultas de historial necesitarán filtrado temporal eficiente
  // Declaración: public static filterByDateRange(events: MachineEvent[], startDate: Date, endDate: Date): MachineEvent[]

  // TODO: Implementar método para agrupar eventos por tipo para analytics
  // Razón: Reportes y dashboards necesitarán agregaciones de eventos
  // Declaración: public static groupByType(events: MachineEvent[]): Map<MachineEventType, MachineEvent[]>

  // TODO: Considerar agregar campo 'resolvedAt' para eventos que requieren seguimiento
  // Razón: Tracking de tiempo de resolución para KPIs operativos
  // Declaración: private resolvedAt?: Date; public markAsResolved(): Result<void, DomainError>

  // TODO: Evaluar agregar referencias a otros eventos (parentEventId)
  // Razón: Permitir cadenas de eventos relacionados (problema → diagnóstico → reparación)
  // Declaración: readonly parentEventId?: string; public createFollowUpEvent(...): Result<MachineEvent, DomainError>
}