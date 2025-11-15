# Services

Este directorio contiene servicios que actúan como facades para operaciones complejas.

## Propósito  
- Proporcionar interfaces simplificadas para operaciones complejas
- Centralizar lógica que involucra múltiples utils
- Abstraer complejidad de implementación para Use Cases
- Mantener consistencia en configuraciones
- Facilitar testing y mocking

## Archivos
- `auth.service.ts` - Facade para operaciones de autenticación y autorización

## Responsabilidades
Los services deben:
- Actuar como facade pattern para utils relacionados
- Proporcionar interfaces limpias para Use Cases  
- Centralizar configuraciones y parámetros
- Manejar logging estructurado
- Delegar implementación real a utils

## Patrón implementado
```typescript
export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    logger.debug('Hashing password via AuthService');
    return hashPassword(password); // Delega a util
  }
}
```

## AuthService
Centraliza operaciones de:
- Hash y verificación de contraseñas (Argon2)
- Generación y verificación de tokens JWT
- Configuración unificada de seguridad

### Ejemplo de uso:
```typescript
// En Use Cases:
const hash = await AuthService.hashPassword(pwd);
const tokens = AuthService.generateTokenPair(user);
```

## TODOs futuros
- `email.service.ts` - Para envío de emails (verificación, reset)
- `notification.service.ts` - Para notificaciones push/in-app  
- `file.service.ts` - Para manejo de archivos/uploads
- `cache.service.ts` - Para operaciones de cache (Redis)