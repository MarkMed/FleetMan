# Models

Este directorio contiene los modelos de datos para la capa de persistencia (ORM/ODM).

## Propósito
- Definir estructura de tablas/documentos
- Configurar relaciones entre entidades
- Definir validaciones a nivel de base de datos
- Mapear entidades de dominio a persistencia

## Archivos típicos
- `user.model.ts` - Modelo de usuario
- `machine.model.ts` - Modelo de máquina
- `machine-type.model.ts` - Tipos de máquina
- `maintenance.model.ts` - Registros de mantenimiento
- `quick-check.model.ts` - Quick checks
- `notification.model.ts` - Notificaciones
- `asset.model.ts` - Activos
- `client.model.ts` - Clientes
- `provider.model.ts` - Proveedores
- `base.model.ts` - Modelo base con campos comunes

## Responsabilidades
Un modelo debe:
- Definir campos y tipos de datos
- Configurar validaciones básicas
- Establecer relaciones (hasMany, belongsTo, etc.)
- Definir hooks de lifecycle si es necesario
- Configurar índices para performance

## Nota importante
Los modelos son específicos de la tecnología de persistencia (TypeORM, Mongoose, Prisma, etc.) y son diferentes de las entidades de dominio.