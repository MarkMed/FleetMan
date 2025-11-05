# Controllers

Este directorio contiene los controladores que manejan las peticiones HTTP y coordinan las respuestas.

## Propósito
- Procesar requests HTTP entrantes
- Validar datos de entrada
- Coordinar con servicios de dominio
- Formatear y enviar responses
- Manejar errores y exceptions

## Archivos típicos
- `auth.controller.ts` - Autenticación y autorización
- `user.controller.ts` - Gestión de usuarios
- `machine.controller.ts` - Gestión de máquinas
- `maintenance.controller.ts` - Mantenimiento de equipos
- `quickcheck.controller.ts` - Quick checks
- `asset.controller.ts` - Gestión de activos
- `notification.controller.ts` - Notificaciones
- `base.controller.ts` - Controlador base con funcionalidad común

## Responsabilidades
Un controlador debe:
- Extraer y validar parámetros del request
- Llamar a los servicios apropiados
- Transformar datos para la respuesta
- Manejar errores específicos de HTTP
- Implementar logging de requests

## Patrón recomendado
```typescript
export class UserController {
  async create(req: Request, res: Response): Promise<void> {
    // 1. Validar input
    // 2. Llamar servicio
    // 3. Formatear response
    // 4. Enviar respuesta
  }
}
```