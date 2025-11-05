# Constants

Este directorio contiene todas las constantes utilizadas a lo largo de la aplicación.

## Propósito
- Centralizar valores constantes
- Evitar "magic numbers" y "magic strings"
- Facilitar mantenimiento y modificaciones
- Garantizar consistencia en toda la aplicación

## Archivos típicos
- `http-status.constants.ts` - Códigos de estado HTTP
- `error-messages.constants.ts` - Mensajes de error estandarizados
- `roles.constants.ts` - Roles de usuario del sistema
- `permissions.constants.ts` - Permisos y acciones
- `regex.constants.ts` - Expresiones regulares comunes
- `time.constants.ts` - Constantes de tiempo (timeouts, intervals)
- `pagination.constants.ts` - Valores por defecto para paginación
- `validation.constants.ts` - Constantes para validaciones
- `api-routes.constants.ts` - Rutas de API estandarizadas
- `database.constants.ts` - Nombres de tablas, índices, etc.

## Ejemplo de estructura
```typescript
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  // ...
} as const;
```