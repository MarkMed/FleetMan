# Repositories

Este directorio contiene las implementaciones de repositorios para el acceso a datos.

## Propósito
- Implementar interfaces de repositorio definidas en el dominio
- Abstraer detalles de persistencia
- Proporcionar operaciones CRUD
- Manejar consultas complejas
- Transformar entre modelos de persistencia y entidades de dominio

## Archivos típicos
- `user.repository.ts` - Repositorio de usuarios
- `machine.repository.ts` - Repositorio de máquinas
- `machine-type.repository.ts` - Repositorio de tipos de máquina
- `maintenance.repository.ts` - Repositorio de mantenimientos
- `quick-check.repository.ts` - Repositorio de quick checks
- `notification.repository.ts` - Repositorio de notificaciones
- `asset.repository.ts` - Repositorio de activos
- `base.repository.ts` - Repositorio base con operaciones comunes

## Responsabilidades
Un repositorio debe:
- Implementar la interfaz de puerto del dominio
- Convertir entidades de dominio a modelos de persistencia
- Convertir modelos de persistencia a entidades de dominio
- Manejar errores de base de datos
- Optimizar consultas para performance

## Patrón recomendado
```typescript
export class UserRepository implements IUserRepository {
  async findById(id: UserId): Promise<User | null> {
    // Implementación específica de persistencia
  }
}
```