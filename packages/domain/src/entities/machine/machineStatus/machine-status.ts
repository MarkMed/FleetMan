import { Result, ok, err, DomainError } from '../../../errors';

/**
 * Clase abstracta base para representar estados de máquina
 * Implementa el patrón State/Strategy para manejar comportamientos específicos de cada estado
 */
export abstract class MachineStatus {
  public abstract readonly code: string;
  public abstract readonly displayName: string;
  public abstract readonly description: string;
  public abstract readonly color: string; // Para UI
  public abstract readonly isOperational: boolean;
  public abstract readonly allowsAssignProvider: boolean;

  /**
   * Define las transiciones válidas desde este estado
   */
  public abstract getValidTransitions(): MachineStatus[];

  /**
   * Verifica si se puede transicionar a un nuevo estado
   */
  public canTransitionTo(newStatus: MachineStatus): boolean {
    return this.getValidTransitions().some(status => status.code === newStatus.code);
  }

  /**
   * Lógica específica que se ejecuta al entrar a este estado
   */
  public abstract onEnterStatus(): Result<void, DomainError>;

  /**
   * Lógica específica que se ejecuta al salir de este estado
   */
  public abstract onExitStatus(): Result<void, DomainError>;

  /**
   * Verifica si se puede asignar un proveedor en este estado
   */
  public canAssignProvider(): boolean {
    return this.allowsAssignProvider;
  }

  /**
   * Verifica si la máquina puede realizar trabajo en este estado
   */
  public isAvailableForWork(): boolean {
    return this.isOperational;
  }

  /**
   * Obtiene el mensaje de transición para logging/auditoría
   */
  protected getTransitionMessage(toStatus: MachineStatus): string {
    return `Machine status changed from ${this.displayName} to ${toStatus.displayName}`;
  }

  /**
   * Comparación por código
   */
  public equals(other: MachineStatus): boolean {
    return this.code === other.code;
  }

  /**
   * Representación string
   */
  public toString(): string {
    return this.code;
  }
}

/**
 * Estado ACTIVE - Máquina operativa y disponible para trabajo
 */
export class ActiveMachineStatus extends MachineStatus {
  public readonly code = 'ACTIVE';
  public readonly displayName = 'Activa';
  public readonly description = 'Máquina operativa y disponible para trabajo';
  public readonly color = '#22c55e'; // Verde
  public readonly isOperational = true;
  public readonly allowsAssignProvider = true;

  public getValidTransitions(): MachineStatus[] {
    return [
      new MaintenanceMachineStatus(),
      new OutOfServiceMachineStatus(),
      new RetiredMachineStatus()
    ];
  }

  public onEnterStatus(): Result<void, DomainError> {
    // Lógica específica al activar una máquina
    // Por ejemplo: notificar que está disponible, actualizar dashboards, etc.
    return ok(undefined);
  }

  public onExitStatus(): Result<void, DomainError> {
    // Lógica específica al salir del estado activo
    // Por ejemplo: verificar trabajos en progreso, notificar cambio de estado
    return ok(undefined);
  }
}

/**
 * Estado MAINTENANCE - Máquina en mantenimiento programado o correctivo
 */
export class MaintenanceMachineStatus extends MachineStatus {
  public readonly code = 'MAINTENANCE';
  public readonly displayName = 'En Mantenimiento';
  public readonly description = 'Máquina en mantenimiento programado o correctivo';
  public readonly color = '#f59e0b'; // Amarillo
  public readonly isOperational = false;
  public readonly allowsAssignProvider = true; // Puede necesitar proveedor de mantenimiento

  public getValidTransitions(): MachineStatus[] {
    return [
      new ActiveMachineStatus(),
      new OutOfServiceMachineStatus(),
      new RetiredMachineStatus()
    ];
  }

  public onEnterStatus(): Result<void, DomainError> {
    // Lógica específica al entrar en mantenimiento
    // Por ejemplo: programar recordatorios, notificar al equipo de mantenimiento
    return ok(undefined);
  }

  public onExitStatus(): Result<void, DomainError> {
    // Lógica específica al salir de mantenimiento
    // Por ejemplo: validar que el mantenimiento se completó, actualizar horas de servicio
    return ok(undefined);
  }

  /**
   * Método específico para el estado de mantenimiento
   */
  public getMaintenanceType(): 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY' {
    // Esta lógica podría expandirse con más contexto
    return 'PREVENTIVE';
  }
}

/**
 * Estado OUT_OF_SERVICE - Máquina fuera de servicio temporalmente
 */
export class OutOfServiceMachineStatus extends MachineStatus {
  public readonly code = 'OUT_OF_SERVICE';
  public readonly displayName = 'Fuera de Servicio';
  public readonly description = 'Máquina temporalmente fuera de servicio por avería o reparación mayor';
  public readonly color = '#ef4444'; // Rojo
  public readonly isOperational = false;
  public readonly allowsAssignProvider = true; // Puede necesitar proveedor especializado

  public getValidTransitions(): MachineStatus[] {
    return [
      new ActiveMachineStatus(),
      new MaintenanceMachineStatus(),
      new RetiredMachineStatus()
    ];
  }

  public onEnterStatus(): Result<void, DomainError> {
    // Lógica específica al marcar como fuera de servicio
    // Por ejemplo: cancelar trabajos programados, notificar urgencia
    return ok(undefined);
  }

  public onExitStatus(): Result<void, DomainError> {
    // Lógica específica al salir de fuera de servicio
    // Por ejemplo: verificar reparaciones, certificar que está operativa
    return ok(undefined);
  }

  /**
   * Método específico para fuera de servicio
   */
  public getServiceIssueType(): 'BREAKDOWN' | 'MAJOR_REPAIR' | 'SAFETY_ISSUE' {
    // Esta lógica podría expandirse con más contexto
    return 'BREAKDOWN';
  }
}

/**
 * Estado RETIRED - Máquina retirada permanentemente del servicio
 */
export class RetiredMachineStatus extends MachineStatus {
  public readonly code = 'RETIRED';
  public readonly displayName = 'Retirada';
  public readonly description = 'Máquina retirada permanentemente del servicio activo';
  public readonly color = '#6b7280'; // Gris
  public readonly isOperational = false;
  public readonly allowsAssignProvider = false; // No necesita proveedor

  public getValidTransitions(): MachineStatus[] {
    // Una máquina retirada no puede cambiar de estado - decisión final
    return [];
  }

  public onEnterStatus(): Result<void, DomainError> {
    // Lógica específica al retirar una máquina
    // Por ejemplo: archivar datos, transferir historial, notificar stakeholders
    return ok(undefined);
  }

  public onExitStatus(): Result<void, DomainError> {
    // Una máquina retirada no puede salir de este estado
    return err(DomainError.domainRule('A retired machine cannot change status'));
  }

  /**
   * Método específico para máquinas retiradas
   */
  public getRetirementReason(): 'END_OF_LIFE' | 'SOLD' | 'SCRAPPED' | 'TRANSFERRED' {
    // Esta lógica podría expandirse con más contexto
    return 'END_OF_LIFE';
  }
}

/**
 * Registry para manejar todos los estados de máquina
 * Implementa el patrón Registry para gestión centralizada
 */
export class MachineStatusRegistry {
  private static readonly statuses = new Map<string, () => MachineStatus>([
    ['ACTIVE', () => new ActiveMachineStatus()],
    ['MAINTENANCE', () => new MaintenanceMachineStatus()],
    ['OUT_OF_SERVICE', () => new OutOfServiceMachineStatus()],
    ['RETIRED', () => new RetiredMachineStatus()],
  ]);

  /**
   * Obtiene un estado por su código
   */
  public static getByCode(code: string): MachineStatus | undefined {
    const factory = this.statuses.get(code);
    return factory ? factory() : undefined;
  }

  /**
   * Obtiene todos los estados disponibles
   */
  public static getAllStatuses(): MachineStatus[] {
    return Array.from(this.statuses.values()).map(factory => factory());
  }

  /**
   * Obtiene todos los códigos de estado
   */
  public static getAllCodes(): string[] {
    return Array.from(this.statuses.keys());
  }

  /**
   * Verifica si un código de estado es válido
   */
  public static isValidCode(code: string): boolean {
    return this.statuses.has(code);
  }

  /**
   * Obtiene estados operacionales
   */
  public static getOperationalStatuses(): MachineStatus[] {
    return this.getAllStatuses().filter(status => status.isOperational);
  }

  /**
   * Obtiene estados que permiten asignación de proveedor
   */
  public static getProviderAssignableStatuses(): MachineStatus[] {
    return this.getAllStatuses().filter(status => status.allowsAssignProvider);
  }

  /**
   * Registra un nuevo estado (para extensibilidad futura)
   */
  public static registerStatus(code: string, factory: () => MachineStatus): void {
    if (this.statuses.has(code)) {
      throw new Error(`Machine status with code '${code}' is already registered`);
    }
    this.statuses.set(code, factory);
  }
}

/**
 * Helper functions para crear estados
 */
export const MachineStatuses = {
  Active: () => new ActiveMachineStatus(),
  Maintenance: () => new MaintenanceMachineStatus(),
  OutOfService: () => new OutOfServiceMachineStatus(),
  Retired: () => new RetiredMachineStatus(),
} as const;

/**
 * Type union para mantener compatibilidad con código existente
 */
export type MachineStatusCode = 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED';