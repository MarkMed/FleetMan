# Schemas

Este directorio contiene esquemas de validación para requests, responses y datos.

## Propósito
- Validar estructura de datos de entrada
- Definir formato de responses de API
- Documentar contratos de datos
- Generar tipos TypeScript automáticamente
- Integrar con documentación Swagger

## Archivos típicos
- `user.schema.ts` - Esquemas relacionados con usuarios
- `machine.schema.ts` - Esquemas de máquinas
- `auth.schema.ts` - Esquemas de autenticación
- `maintenance.schema.ts` - Esquemas de mantenimiento
- `quickcheck.schema.ts` - Esquemas de quick checks
- `common.schema.ts` - Esquemas reutilizables
- `response.schema.ts` - Esquemas de respuestas estándar
- `pagination.schema.ts` - Esquemas de paginación

## Tipos de esquemas
- **Request schemas**: Validación de datos entrantes
- **Response schemas**: Estructura de respuestas
- **Database schemas**: Validación para persistencia
- **DTO schemas**: Data Transfer Objects

## Librerías comunes
- Joi
- Yup
- Zod
- Ajv
- Class-validator

## Patrón recomendado
```typescript
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
  role: z.enum(['admin', 'user'])
});
```