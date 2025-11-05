# Models Directory

## Propósito
Define todas las interfaces, tipos y entidades del dominio de la aplicación. Actúa como el contrato central de datos que se comparte entre todas las capas de la aplicación.

## Organización de Tipos

### 1. **Domain Entities** - Entidades del Dominio
**Propósito**: Representan los objetos principales del negocio
**Características**:
- Mapean directamente al domain model del backend
- Incluyen todas las propiedades y relaciones
- Son inmutables desde la perspectiva del frontend

### 2. **DTOs** - Data Transfer Objects
**Propósito**: Objetos para transferencia de datos con APIs
**Características**:
- Pueden diferir de las entidades de dominio
- Optimizados para transmisión de red
- Incluyen metadatos de API (pagination, etc.)

### 3. **Form Data** - Datos de Formularios
**Propósito**: Tipos específicos para formularios de UI
**Características**:
- Subconjuntos de entidades para crear/editar
- Incluyen campos de validación temporal
- Estados intermedios de formularios

### 4. **UI Types** - Tipos de Interfaz
**Propósito**: Tipos específicos para el estado de la UI
**Características**:
- Estados de loading, error, success
- Configuraciones de componentes
- Preferencias de usuario

## Archivos Existentes y Planificados

```
models/
├── index.ts              # ✅ Barrel exports con todas las interfaces
├── entities/
│   ├── User.ts           # ✅ Usuario y autenticación
│   ├── Machine.ts        # ✅ Máquina y propiedades
│   ├── MachineType.ts    # ✅ Tipos de máquinas
│   ├── Maintenance.ts    # ✅ Mantenimientos programados y realizados
│   ├── QuickCheck.ts     # ✅ Chequeos rápidos e inspecciones
│   ├── Notification.ts   # ✅ Notificaciones y alertas
│   ├── MachineEvent.ts   # Eventos y cambios de estado
│   ├── Location.ts       # Ubicaciones y sectores
│   ├── Attachment.ts     # Archivos y documentos adjuntos
│   └── index.ts          # Exports de entidades
├── dtos/
│   ├── AuthDTOs.ts       # Request/Response de autenticación
│   ├── MachineDTOs.ts    # DTOs de máquinas con paginación
│   ├── MaintenanceDTOs.ts # DTOs de mantenimiento
│   ├── QuickCheckDTOs.ts # DTOs de chequeos rápidos
│   ├── NotificationDTOs.ts # DTOs de notificaciones
│   ├── PaginationDTOs.ts # Tipos de paginación genéricos
│   └── index.ts          # Exports de DTOs
├── forms/
│   ├── AuthForms.ts      # Formularios de login/register
│   ├── MachineForms.ts   # Formularios de máquinas
│   ├── MaintenanceForms.ts # Formularios de mantenimiento
│   ├── QuickCheckForms.ts # Formularios de chequeos
│   ├── UserProfileForms.ts # Formularios de perfil
│   └── index.ts          # Exports de formularios
├── ui/
│   ├── ApiState.ts       # Estados de carga/error/success
│   ├── TableTypes.ts     # Tipos para tablas y listas
│   ├── FormTypes.ts      # Tipos comunes de formularios
│   ├── NavigationTypes.ts # Tipos de navegación y rutas
│   ├── ThemeTypes.ts     # Tipos de tema y configuración
│   └── index.ts          # Exports de UI types
└── enums/
    ├── MachineStatus.ts  # Estados de máquinas
    ├── MaintenanceType.ts # Tipos de mantenimiento
    ├── NotificationType.ts # Tipos de notificaciones
    ├── UserRole.ts       # Roles de usuario
    ├── Priority.ts       # Niveles de prioridad
    └── index.ts          # Exports de enums
```

## Detalles de Interfaces Principales

### Domain Entities ✅

**User Interface**:
```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Machine Interface**:
```typescript
export interface Machine {
  id: string;
  name: string;
  serialNumber: string;
  model: string;
  brand: string;
  machineType: MachineType;
  status: MachineStatus;
  location?: string;
  acquisitionDate: Date;
  warrantyExpiryDate?: Date;
  operatingHours: number;
  fuelLevel?: number;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  notes?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Form Data Types
```typescript
export interface CreateMachineForm {
  name: string;
  serialNumber: string;
  model: string;
  brand: string;
  machineTypeId: string;
  location?: string;
  acquisitionDate: string; // ISO string for form inputs
  warrantyExpiryDate?: string;
  notes?: string;
  image?: File;
}

export interface UpdateMachineForm extends Partial<CreateMachineForm> {
  id: string;
}
```

### API Response Types
```typescript
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

## Principios de Modelado

### 1. Immutability
- Todas las interfaces son readonly por defecto
- Usar utility types para mutabilidad específica
- Evitar modificación directa de objetos

### 2. Type Safety
- Evitar `any` y `unknown` cuando sea posible
- Usar union types para estados conocidos
- Discriminated unions para tipos complejos

### 3. Consistency
- Nomenclatura consistente (camelCase para propiedades)
- Patrones consistentes para IDs (string UUIDs)
- Fechas como Date objects en entidades, ISO strings en DTOs

### 4. Extensibility
- Usar interfaces en lugar de types cuando sea posible
- Preparar para extensión con optional properties
- Separar concerns con composición

## Convenciones de Nomenclatura

### Interfaces
- Entidades: PascalCase sin sufijos (`User`, `Machine`)
- DTOs: PascalCase con sufijo DTO (`CreateMachineDTO`)
- Forms: PascalCase con sufijo Form (`LoginForm`)
- Estados: PascalCase descriptivo (`LoadingState`, `ErrorState`)

### Properties
- camelCase para todas las propiedades
- booleanos con prefijo `is`, `has`, `can` (`isActive`, `hasWarranty`)
- fechas con sufijo `At` o `Date` (`createdAt`, `expiryDate`)
- IDs con sufijo `Id` excepto el ID principal (`userId`, pero `id`)

### Enums
- PascalCase para nombres de enum
- UPPER_SNAKE_CASE para valores
- Preferir string enums sobre numeric

```typescript
export enum MachineStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  RETIRED = 'RETIRED'
}
```

## Utility Types

### Formularios
```typescript
// Para crear tipos de formulario a partir de entidades
export type CreateFormData<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateFormData<T> = Partial<CreateFormData<T>> & { id: string };

// Para hacer propiedades opcionales
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Para seleccionar campos específicos
export type Pick<T, K extends keyof T> = { [P in K]: T[P] };
```

### API States
```typescript
export interface LoadingState {
  isLoading: true;
  error: null;
  data: null;
}

export interface ErrorState {
  isLoading: false;
  error: ApiError;
  data: null;
}

export interface SuccessState<T> {
  isLoading: false;
  error: null;
  data: T;
}

export type AsyncState<T> = LoadingState | ErrorState | SuccessState<T>;
```

## Validación con Zod

- Schemas de validación co-localizados con tipos
- Inferencia de tipos a partir de schemas
- Validación consistente entre frontend y backend

```typescript
import { z } from 'zod';

export const CreateMachineSchema = z.object({
  name: z.string().min(1).max(100),
  serialNumber: z.string().min(1),
  model: z.string().min(1),
  // ... más validaciones
});

export type CreateMachineData = z.infer<typeof CreateMachineSchema>;
```

## Testing
- Type-only tests para verificar compatibilidad
- Tests de validación con Zod schemas
- Tests de transformación entre DTOs y entidades