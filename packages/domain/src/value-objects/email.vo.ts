import { Result, ok, err, DomainError, DomainErrorCodes } from '../errors';

/**
 * Value Object para direcciones de email
 * Encapsula la validación y normalización de emails
 */
export class Email {
  private constructor(private readonly value: string) {}

  /**
   * Crea un nuevo Email a partir de un string
   * @param value - String del email a validar
   * @returns Result con Email válido o error de dominio
   */
  public static create(value: string): Result<Email, DomainError> {
    if (!value || value.trim().length === 0) {
      return err(DomainError.create(DomainErrorCodes.INVALID_EMAIL, 'Email cannot be empty'));
    }

    // Normalizar: trim y lowercase
    const normalizedEmail = value.trim().toLowerCase();

    // Validación básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return err(DomainError.create(DomainErrorCodes.INVALID_EMAIL, 'Invalid email format'));
    }

    // Validar longitud
    if (normalizedEmail.length > 254) {
      return err(DomainError.create(DomainErrorCodes.INVALID_EMAIL, 'Email is too long'));
    }

    // Validar parte local (antes del @)
    const [localPart, domainPart] = normalizedEmail.split('@');
    
    if (localPart.length > 64) {
      return err(DomainError.create(DomainErrorCodes.INVALID_EMAIL, 'Email local part is too long'));
    }

    if (localPart.length === 0) {
      return err(DomainError.create(DomainErrorCodes.INVALID_EMAIL, 'Email local part cannot be empty'));
    }

    // Validar que no empiece o termine con punto
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return err(DomainError.create(DomainErrorCodes.INVALID_EMAIL, 'Email local part cannot start or end with a dot'));
    }

    // Validar que no tenga puntos consecutivos
    if (localPart.includes('..')) {
      return err(DomainError.create(DomainErrorCodes.INVALID_EMAIL, 'Email local part cannot have consecutive dots'));
    }

    return ok(new Email(normalizedEmail));
  }

  /**
   * Obtiene el valor string del email (normalizado)
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Obtiene el dominio del email
   */
  public getDomain(): string {
    return this.value.split('@')[1];
  }

  /**
   * Obtiene la parte local del email (antes del @)
   */
  public getLocalPart(): string {
    return this.value.split('@')[0];
  }

  /**
   * Compara dos emails por valor
   */
  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  /**
   * Representación string para logging/debugging
   */
  public toString(): string {
    return this.value;
  }

  /**
   * Versión censurada para logs (oculta parte del email)
   */
  public toCensoredString(): string {
    const [local, domain] = this.value.split('@');
    if (local.length <= 2) {
      return `${local[0]}***@${domain}`;
    }
    return `${local.substring(0, 2)}***@${domain}`;
  }
}