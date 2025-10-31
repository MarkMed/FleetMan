import { Result, ok, err, DomainError, DomainErrorCodes } from '../errors';

/**
 * Value Object para identificadores únicos de Usuario
 * Encapsula la lógica de validación y generación de IDs
 */
export class UserId {
  private constructor(private readonly value: string) {}

  /**
   * Crea un nuevo UserId a partir de un string
   * @param value - String del ID a validar
   * @returns Result con UserId válido o error de dominio
   */
  public static create(value: string): Result<UserId, DomainError> {
    if (!value || value.trim().length === 0) {
      return err(DomainError.create(DomainErrorCodes.INVALID_USER_ID, 'User ID cannot be empty'));
    }

    if (value.length < 3 || value.length > 50) {
      return err(DomainError.create(DomainErrorCodes.INVALID_USER_ID, 'User ID must be between 3 and 50 characters'));
    }

    // Validar formato (letras, números, guiones, underscores)
    const validFormat = /^[a-zA-Z0-9_-]+$/.test(value);
    if (!validFormat) {
      return err(DomainError.create(DomainErrorCodes.INVALID_USER_ID, 'User ID contains invalid characters'));
    }

    return ok(new UserId(value));
  }

  /**
   * Genera un nuevo UserId único usando timestamp y random
   * @returns Nuevo UserId válido
   */
  public static generate(): UserId {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const id = `user_${timestamp}_${random}`;
    
    // Como es generado internamente, sabemos que es válido
    return new UserId(id);
  }

  /**
   * Obtiene el valor string del ID
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Compara dos UserIds por valor
   */
  public equals(other: UserId): boolean {
    return this.value === other.value;
  }

  /**
   * Representación string para logging/debugging
   */
  public toString(): string {
    return this.value;
  }
}