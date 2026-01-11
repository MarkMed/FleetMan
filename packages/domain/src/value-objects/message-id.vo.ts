import { Result, ok, err, DomainError, DomainErrorCodes } from '../errors';

/**
 * Value Object para identificadores únicos de Mensaje
 * Encapsula la lógica de validación y generación de IDs para mensajes 1-a-1
 * 
 * Sprint #12 - Módulo 3: Messaging System
 */
export class MessageId {
  private constructor(private readonly value: string) {}

  /**
   * Crea un nuevo MessageId a partir de un string
   * @param value - String del ID a validar
   * @returns Result con MessageId válido o error de dominio
   */
  public static create(value: string): Result<MessageId, DomainError> {
    if (!value || value.trim().length === 0) {
      return err(DomainError.create(DomainErrorCodes.INVALID_INPUT, 'Message ID cannot be empty'));
    }

    if (value.length < 3 || value.length > 100) {
      return err(DomainError.create(DomainErrorCodes.INVALID_INPUT, 'Message ID must be between 3 and 100 characters'));
    }

    // Validar formato (letras, números, guiones, underscores)
    const validFormat = /^[a-zA-Z0-9_-]+$/.test(value);
    if (!validFormat) {
      return err(DomainError.create(DomainErrorCodes.INVALID_INPUT, 'Message ID contains invalid characters'));
    }

    return ok(new MessageId(value));
  }

  /**
   * Genera un nuevo MessageId único usando timestamp y random
   * Formato: message_<timestamp>_<random>
   * @returns Nuevo MessageId válido
   */
  public static generate(): MessageId {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const id = `message_${timestamp}_${random}`;
    
    // Como es generado internamente, sabemos que es válido
    return new MessageId(id);
  }

  /**
   * Obtiene el valor string del ID
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Compara con otro MessageId
   */
  public equals(other: MessageId): boolean {
    if (!other) return false;
    return this.value === other.getValue();
  }

  /**
   * Representación string del MessageId
   */
  public toString(): string {
    return this.value;
  }
}
