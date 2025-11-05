# Routes

Este directorio contiene la definición de rutas HTTP y su mapeo a controladores.

## Propósito
- Definir endpoints de la API
- Mapear rutas a controladores específicos
- Aplicar middlewares a rutas
- Organizar versionado de API
- Definir parámetros y query strings

## Archivos típicos
- `auth.routes.ts` - Rutas de autenticación
- `user.routes.ts` - Rutas de gestión de usuarios
- `machine.routes.ts` - Rutas de máquinas
- `maintenance.routes.ts` - Rutas de mantenimiento
- `quickcheck.routes.ts` - Rutas de quick checks
- `asset.routes.ts` - Rutas de activos
- `notification.routes.ts` - Rutas de notificaciones
- `index.ts` - Registro central de todas las rutas
- `v1/` - Rutas de versión 1 de la API

## Responsabilidades
Un archivo de rutas debe:
- Definir métodos HTTP (GET, POST, PUT, DELETE)
- Especificar paths de endpoints
- Aplicar middlewares apropiados
- Mapear a métodos de controladores
- Documentar parámetros esperados

## Patrón recomendado
```typescript
router.get('/users/:id', 
  authMiddleware, 
  validationMiddleware(userSchema), 
  userController.findById
);
```