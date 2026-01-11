// Domain-specific errors for FleetMan
// Temporary: Using relative imports until workspace dependencies are configured

/**
 * Basic Result type for domain operations
 */
export type Result<T, E = DomainError> = 
  | { success: true; data: T }
  | { success: false; error: E };

export const ok = <T>(data: T): Result<T> => ({ success: true, data });
export const err = <E>(error: E): Result<never, E> => ({ success: false, error });

/**
 * Error específico del dominio para FleetMan
 */
export class DomainError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.details = details;

    // Mantiene stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DomainError);
    }
  }

  /**
   * Factory method para crear errores de dominio de forma más limpia
   */
  public static create(code: string, message: string, details?: unknown): DomainError {
    return new DomainError(code, message, details);
  }

  /**
   * Errores específicos de dominio más comunes
   */
  public static validation(message: string, details?: unknown): DomainError {
    return new DomainError('VALIDATION_ERROR', message, details);
  }

  public static domainRule(message: string, details?: unknown): DomainError {
    return new DomainError('DOMAIN_RULE_VIOLATION', message, details);
  }

  public static conflict(message: string, details?: unknown): DomainError {
    return new DomainError('CONFLICT_ERROR', message, details);
  }

  public static notFound(message: string, details?: unknown): DomainError {
    return new DomainError('NOT_FOUND', message, details);
  }
}

/**
 * Códigos de error específicos del dominio de FleetMan
 */
export const DomainErrorCodes = {
  // User errors
  INVALID_USER_ID: 'INVALID_USER_ID',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  DUPLICATE_USER_EMAIL: 'DUPLICATE_USER_EMAIL',
  
  // Machine errors
  INVALID_MACHINE_ID: 'INVALID_MACHINE_ID',
  INVALID_SERIAL_NUMBER: 'INVALID_SERIAL_NUMBER',
  DUPLICATE_MACHINE_SERIAL: 'DUPLICATE_MACHINE_SERIAL',
  MACHINE_HAS_ACTIVE_REMINDERS: 'MACHINE_HAS_ACTIVE_REMINDERS',
  
  // QuickCheck errors
  QUICKCHECK_ALREADY_EXISTS: 'QUICKCHECK_ALREADY_EXISTS',
  
  // Provider errors
  PROVIDER_NOT_FOUND: 'PROVIDER_NOT_FOUND',
  USER_NOT_AUTHORIZED: 'USER_NOT_AUTHORIZED',
  
  // Maintenance errors
  INVALID_MAINTENANCE_INTERVAL: 'INVALID_MAINTENANCE_INTERVAL',
  
  // Message errors (Sprint #12 Module 3)
  INVALID_INPUT: 'INVALID_INPUT',
  PERSISTENCE_ERROR: 'PERSISTENCE_ERROR',
} as const;