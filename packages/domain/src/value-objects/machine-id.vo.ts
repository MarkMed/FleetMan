import { Result, ok, err, DomainError, DomainErrorCodes } from '../errors';

/**
 * Value Object para identificadores únicos de Máquina
 * Encapsula la lógica de validación y generación de IDs de máquinas
 */
export class MachineId {
  private constructor(private readonly value: string) {}

  /**
   * Crea un nuevo MachineId a partir de un string
   * @param value - String del ID a validar
   * @returns Result con MachineId válido o error de dominio
   */
  public static create(value: string): Result<MachineId, DomainError> {
    if (!value || value.trim().length === 0) {
      return err(DomainError.create(DomainErrorCodes.INVALID_MACHINE_ID, 'Machine ID cannot be empty'));
    }

    if (value.length < 3 || value.length > 50) {
      return err(DomainError.create(DomainErrorCodes.INVALID_MACHINE_ID, 'Machine ID must be between 3 and 50 characters'));
    }

    // Validar formato (letras, números, guiones, underscores)
    const validFormat = /^[a-zA-Z0-9_-]+$/.test(value);
    if (!validFormat) {
      return err(DomainError.create(DomainErrorCodes.INVALID_MACHINE_ID, 'Machine ID contains invalid characters'));
    }

    return ok(new MachineId(value));
  }

  /**
   * Genera un nuevo MachineId único usando timestamp y random
   * @returns Nuevo MachineId válido
   */
  public static generate(): MachineId {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const id = `machine_${timestamp}_${random}`;
    
    // Como es generado internamente, sabemos que es válido
    return new MachineId(id);
  }

  /**
   * Obtiene el valor string del ID
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Compara dos MachineIds por valor
   */
  public equals(other: MachineId): boolean {
    return this.value === other.value;
  }

  /**
   * Representación string para logging/debugging
   */
  public toString(): string {
    return this.value;
  }
}