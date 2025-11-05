# Services

Este directorio contiene los servicios de aplicación que implementan casos de uso del negocio.

## Propósito
- Implementar lógica de negocio específica de la aplicación
- Coordinar entre múltiples entidades de dominio
- Manejar transacciones
- Integrar con servicios externos
- Aplicar reglas de negocio complejas

## Archivos típicos
- `auth.service.ts` - Servicios de autenticación
- `user.service.ts` - Servicios de gestión de usuarios
- `machine.service.ts` - Servicios de máquinas
- `maintenance.service.ts` - Servicios de mantenimiento
- `quickcheck.service.ts` - Servicios de quick checks
- `notification.service.ts` - Servicios de notificaciones
- `email.service.ts` - Servicios de email
- `upload.service.ts` - Servicios de carga de archivos
- `report.service.ts` - Servicios de reportes

## Responsabilidades
Un servicio debe:
- Implementar casos de uso específicos
- Validar reglas de negocio
- Coordinar múltiples repositorios
- Manejar transacciones
- Publicar eventos de dominio
- Integrar con APIs externas

## Diferencia con Domain Services
- **Application Services**: Orquestan casos de uso completos
- **Domain Services**: Contienen lógica de dominio pura

## Patrón recomendado
```typescript
export class UserService {
  async createUser(userData: CreateUserDto): Promise<User> {
    // 1. Validaciones de negocio
    // 2. Crear entidad de dominio
    // 3. Persistir usando repositorio
    // 4. Publicar eventos
    // 5. Retornar resultado
  }
}
```