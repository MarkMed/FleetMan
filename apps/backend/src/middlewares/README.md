# Middlewares

Este directorio contiene middlewares para interceptar y procesar requests antes de que lleguen a los controladores.

## Propósito
- Autenticación y autorización
- Validación de datos
- Logging de requests
- Manejo de errores
- Rate limiting
- Transformación de datos

## Archivos típicos
- `auth.middleware.ts` - Verificación de tokens JWT
- `validation.middleware.ts` - Validación de schemas
- `error-handler.middleware.ts` - Manejo centralizado de errores
- `logger.middleware.ts` - Logging de requests/responses
- `cors.middleware.ts` - Configuración de CORS
- `rate-limiter.middleware.ts` - Limitación de requests
- `file-upload.middleware.ts` - Manejo de uploads
- `compression.middleware.ts` - Compresión de responses
- `security.middleware.ts` - Headers de seguridad
- `permission.middleware.ts` - Verificación de permisos

## Tipos de middlewares
- **Global**: Se aplican a todas las rutas
- **De ruta**: Se aplican a rutas específicas
- **De error**: Manejan errores en la aplicación

## Patrón recomendado
```typescript
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Lógica del middleware
  next(); // O next(error) para errores
};
```