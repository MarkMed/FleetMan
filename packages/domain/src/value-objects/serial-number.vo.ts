import { Result, ok, err, DomainError, DomainErrorCodes } from '../errors';

/**
 * Value Object para números de serie de máquinas
 * Encapsula la validación y normalización de números de serie
 */
export class SerialNumber {
  private constructor(private readonly value: string) {}

  /**
   * Crea un nuevo SerialNumber a partir de un string
   * @param value - String del número de serie a validar
   * @returns Result con SerialNumber válido o error de dominio
   */
  public static create(value: string): Result<SerialNumber, DomainError> {
    if (!value || value.trim().length === 0) {
      return err(DomainError.create(DomainErrorCodes.INVALID_SERIAL_NUMBER, 'Serial number cannot be empty'));
    }

    // Normalizar: trim y uppercase
    const normalizedSerial = value.trim().toUpperCase();

    // Validar longitud
    if (normalizedSerial.length < 3 || normalizedSerial.length > 50) {
      return err(DomainError.create(DomainErrorCodes.INVALID_SERIAL_NUMBER, 'Serial number must be between 3 and 50 characters'));
    }

    // Validar formato: solo letras, números, guiones y underscores
    const validFormat = /^[A-Z0-9_-]+$/.test(normalizedSerial);
    if (!validFormat) {
      return err(DomainError.create(DomainErrorCodes.INVALID_SERIAL_NUMBER, 'Serial number contains invalid characters. Only letters, numbers, hyphens and underscores allowed'));
    }

    // Validar que no sea solo guiones o underscores
    if (/^[-_]+$/.test(normalizedSerial)) {
      return err(DomainError.create(DomainErrorCodes.INVALID_SERIAL_NUMBER, 'Serial number cannot be only hyphens or underscores'));
    }

    // Validar que tenga al menos un carácter alfanumérico
    if (!/[A-Z0-9]/.test(normalizedSerial)) {
      return err(DomainError.create(DomainErrorCodes.INVALID_SERIAL_NUMBER, 'Serial number must contain at least one alphanumeric character'));
    }

    return ok(new SerialNumber(normalizedSerial));
  }

  /**
   * Obtiene el valor string del número de serie (normalizado)
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Compara dos números de serie por valor
   */
  public equals(other: SerialNumber): boolean {
    return this.value === other.value;
  }

  /**
   * Representación string para logging/debugging
   */
  public toString(): string {
    return this.value;
  }

  /**
   * Versión censurada para logs públicos (oculta parte del número de serie)
   */
  public toCensoredString(): string {
    if (this.value.length <= 4) {
      return `${this.value.substring(0, 2)}***`;
    }
    return `${this.value.substring(0, 3)}***${this.value.substring(this.value.length - 2)}`;
  }

  /**
   * Valida si coincide con un patrón específico (útil para búsquedas)
   */
  public matchesPattern(pattern: string): boolean {
    try {
      const regex = new RegExp(pattern, 'i');
      return regex.test(this.value);
    } catch {
      return false;
    }
  }
}