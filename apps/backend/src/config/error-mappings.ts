/**
 * Error Mappings Configuration
 * 
 * Single Source of Truth (SSOT) para mapear códigos de error de dominio
 * a códigos de estado HTTP y códigos de error de API.
 * 
 * Sprint #13 Task 9.3f-h: Centralización de mapeo de errores
 * 
 * Previene hardcodeo de status codes y mantiene consistencia en toda la API.
 */

/**
 * Mapeo de códigos de error de dominio a respuestas HTTP
 * 
 * Estructura:
 * - key: Código de error del dominio (DomainError.code)
 * - value: { statusCode, errorCode } para respuesta HTTP
 */
export const DOMAIN_ERROR_HTTP_MAPPINGS: Record<string, { statusCode: number; errorCode: string }> = {
  // ============================================================================
  // 4xx CLIENT ERRORS
  // ============================================================================
  
  // 400 Bad Request - Errores de validación de entrada
  'INVALID_INPUT': { statusCode: 400, errorCode: 'INVALID_INPUT' },
  'VALIDATION_ERROR': { statusCode: 400, errorCode: 'INVALID_INPUT' },
  'INVALID_USER_ID': { statusCode: 400, errorCode: 'INVALID_INPUT' },
  'INVALID_EMAIL': { statusCode: 400, errorCode: 'INVALID_INPUT' },
  'INVALID_MACHINE_ID': { statusCode: 400, errorCode: 'INVALID_INPUT' },
  'INVALID_SERIAL_NUMBER': { statusCode: 400, errorCode: 'INVALID_INPUT' },
  
  // 403 Forbidden - Acceso denegado / Reglas de negocio
  'FORBIDDEN': { statusCode: 403, errorCode: 'FORBIDDEN' },
  'NOT_CONTACT': { statusCode: 403, errorCode: 'NOT_CONTACT' },
  'INVALID_STATE': { statusCode: 403, errorCode: 'INVALID_STATE' },
  'USER_NOT_AUTHORIZED': { statusCode: 403, errorCode: 'FORBIDDEN' },
  'DOMAIN_RULE_VIOLATION': { statusCode: 403, errorCode: 'FORBIDDEN' },
  
  // 404 Not Found - Recursos no encontrados
  'NOT_FOUND': { statusCode: 404, errorCode: 'NOT_FOUND' },
  'PROVIDER_NOT_FOUND': { statusCode: 404, errorCode: 'NOT_FOUND' },
  
  // 409 Conflict - Conflictos de estado/duplicados
  'CONFLICT_ERROR': { statusCode: 409, errorCode: 'CONFLICT' },
  'DUPLICATE_USER_EMAIL': { statusCode: 409, errorCode: 'CONFLICT' },
  'DUPLICATE_MACHINE_SERIAL': { statusCode: 409, errorCode: 'CONFLICT' },
  'QUICKCHECK_ALREADY_EXISTS': { statusCode: 409, errorCode: 'CONFLICT' },
  'MACHINE_HAS_ACTIVE_REMINDERS': { statusCode: 409, errorCode: 'CONFLICT' },
  
  // ============================================================================
  // 5xx SERVER ERRORS
  // ============================================================================
  
  // 500 Internal Server Error - Errores de infraestructura
  'PERSISTENCE_ERROR': { statusCode: 500, errorCode: 'INTERNAL_ERROR' },
  'INTERNAL_ERROR': { statusCode: 500, errorCode: 'INTERNAL_ERROR' },
} as const;

/**
 * Palabras clave para detección fallback en error.message
 * Se usa cuando el error NO es un DomainError con código
 */
export const ERROR_MESSAGE_KEYWORDS = {
  notFound: ['not found', 'does not exist'],
  invalidInput: ['invalid', 'format', 'malformed', 'required'],
  forbidden: ['forbidden', 'blocked', 'access denied', 'not authorized', 'permission denied'],
  notContact: ['not_contact', 'non-contact', 'not a contact'],
  inactive: ['not active', 'inactive', 'disabled'],
  conflict: ['already exists', 'duplicate', 'conflict'],
} as const;

/**
 * HTTP Status Codes (referencia)
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * API Error Codes (referencia)
 */
export const API_ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  FORBIDDEN: 'FORBIDDEN',
  NOT_CONTACT: 'NOT_CONTACT',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INVALID_STATE: 'INVALID_STATE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
