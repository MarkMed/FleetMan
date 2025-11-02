import { Result, ok, err, DomainError } from '../errors';

/**
 * Value Object para identificar un tipo de máquina
 * Representa la referencia a una entidad MachineType
 */
export class MachineTypeId {
  private constructor(private readonly value: string) {}

  /**
   * Crea un MachineTypeId desde un string
   */
  public static create(value: string): Result<MachineTypeId, DomainError> {
    if (!value || typeof value !== 'string') {
      return err(DomainError.validation('MachineTypeId value is required'));
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return err(DomainError.validation('MachineTypeId cannot be empty'));
    }

    if (trimmed.length < 3 || trimmed.length > 50) {
      return err(DomainError.validation('MachineTypeId must be between 3 and 50 characters'));
    }

    // Validar formato (solo letras, números, guiones, guiones bajos)
    const validFormat = /^[a-zA-Z0-9_-]+$/.test(trimmed);
    if (!validFormat) {
      return err(DomainError.validation('MachineTypeId contains invalid characters'));
    }

    return ok(new MachineTypeId(trimmed));
  }

  /**
   * Genera un nuevo ID único
   */
  public static generate(): MachineTypeId {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return new MachineTypeId(`mtype_${timestamp}_${random}`);
  }

  /**
   * Crea un MachineTypeId desde un código conocido (para migración)
   */
  public static fromCode(code: string): Result<MachineTypeId, DomainError> {
    if (!code || typeof code !== 'string') {
      return err(DomainError.validation('Code is required'));
    }

    const normalized = code.toUpperCase().trim();
    return this.create(normalized);
  }

  /**
   * Obtiene el valor del ID
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Compara dos MachineTypeId
   */
  public equals(other: MachineTypeId): boolean {
    if (!other || !(other instanceof MachineTypeId)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Representación string
   */
  public toString(): string {
    return this.value;
  }

  /**
   * Serialización para JSON
   */
  public toJSON(): string {
    return this.value;
  }
}