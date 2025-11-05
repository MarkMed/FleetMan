# Config

Este directorio contiene todas las configuraciones del aplicativo backend.

## Propósito
- Centralizar configuraciones del sistema
- Manejar variables de entorno
- Configuraciones específicas por ambiente
- Configuración de servicios externos

## Archivos típicos
- `database.config.ts` - Configuración de base de datos
- `server.config.ts` - Configuración del servidor HTTP
- `auth.config.ts` - Configuración de autenticación
- `redis.config.ts` - Configuración de Redis/Cache
- `email.config.ts` - Configuración de servicios de email
- `jwt.config.ts` - Configuración de JWT
- `upload.config.ts` - Configuración para carga de archivos
- `cors.config.ts` - Configuración de CORS
- `logger.config.ts` - Configuración de logging
- `env.config.ts` - Validación y tipado de variables de entorno

## Patrón recomendado
Cada archivo de configuración debe:
- Validar variables de entorno requeridas
- Proporcionar valores por defecto cuando sea apropiado
- Exportar un objeto de configuración tipado
- Documentar cada opción de configuración