# Estructura de Entidades del Dominio

## 📁 Organización por Carpetas

Cada entidad del dominio tiene su propia carpeta que contiene:
- **`{entity}.entity.ts`**: Archivo principal de la entidad
- **`{entity}.test.ts`**: Archivo de pruebas y ejemplos de uso
- **`index.ts`**: Archivo de exportación para la entidad

## 🏗 Estructura Actual

```
src/entities/
├── user/                     ✅ Implementada
│   ├── user.entity.ts        # Entidad base abstracta User
│   ├── user.test.ts          # Tests y ejemplos
│   └── index.ts              # Exports
├── client-user/              ✅ Implementada
│   ├── client-user.entity.ts # ClientUser extends User
│   ├── client-user.test.ts   # Tests completos con gestión de máquinas
│   └── index.ts              # Exports
├── provider-user/            🔄 Pendiente
│   └── index.ts              # Placeholder
├── machine/                  🔄 Pendiente
│   └── index.ts              # Placeholder
├── maintenance-reminder/     🔄 Pendiente
│   └── index.ts              # Placeholder
├── machine-event/            🔄 Pendiente
│   └── index.ts              # Placeholder
├── quick-check/              🔄 Pendiente
│   └── index.ts              # Placeholder
├── quick-check-item/         🔄 Pendiente
│   └── index.ts              # Placeholder
├── notification/             🔄 Pendiente
│   └── index.ts              # Placeholder
├── internal-message/         🔄 Pendiente
│   └── index.ts              # Placeholder
├── repuesto/                 🔄 Pendiente
│   └── index.ts              # Placeholder
└── index.ts                  # Punto de entrada principal
```

## 🔗 Imports y Dependencias

### Patrón de Imports
```typescript
// Para value objects (desde entidad)
import { UserId } from '../../value-objects/user-id.vo';

// Para errores (desde entidad)
import { DomainError } from '../../errors';

// Para otras entidades (desde entidad)
import { User } from '../user/user.entity';
```

### Exports en index.ts
```typescript
// Cada carpeta de entidad exporta todo lo público
export * from './user.entity';

// El index principal de entities exporta todas las carpetas
export * from './user';
export * from './client-user';
```

## 🎯 Beneficios de esta Estructura

✅ **Organización clara**: Cada entidad tiene su propio espacio  
✅ **Escalabilidad**: Fácil agregar nuevas entidades sin contaminar carpetas  
✅ **Tests co-ubicados**: Tests junto a la entidad que prueban  
✅ **Imports limpios**: Estructura predecible de imports  
✅ **Separación de responsabilidades**: Una entidad = una carpeta  

## 📝 Convenciones de Nomenclatura

- **Carpetas**: `kebab-case` (ej: `client-user`, `machine-event`)
- **Archivos**: `kebab-case.tipo.ts` (ej: `user.entity.ts`, `user.test.ts`)
- **Clases**: `PascalCase` (ej: `User`, `ClientUser`, `MachineEvent`)
- **Exports**: Siempre a través de `index.ts`

## 🚀 Próximos Pasos

1. **ProviderUser**: Implementar proveedor de servicios
2. **Machine**: Entidad central de equipos
3. **MachineEvent**: Sistema de eventos y trazabilidad
4. **Notification**: Sistema de notificaciones
5. **QuickCheck**: Formularios de inspección
6. **MaintenanceReminder**: Recordatorios de mantenimiento

---
*Última Actualización: 1 de Noviembre, 2025*