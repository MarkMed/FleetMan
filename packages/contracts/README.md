# Contracts Package - Fuente Única de Verdad

## 📋 Propósito

El paquete `contracts` define la **fuente única de verdad** para la comunicación entre frontend y backend usando **Zod** para validación y tipado isomórfico. Elimina inconsistencias entre capas y permite derivar automáticamente tipos TypeScript y documentación OpenAPI.

## 🎯 Principios Arquitectónicos

- **Single Source of Truth**: Un lugar para definir la forma de todos los datos
- **Isomorphic Validation**: Mismas validaciones en frontend y backend
- **Type Safety**: Generación automática de tipos TypeScript
- **API Documentation**: Base para generar documentación OpenAPI automática
- **No Drift**: Imposible que frontend y backend se desincronicen

## 📁 Estructura de Archivos

### Archivos Actuales

#### `auth.contract.ts`
Contratos para autenticación y autorización:
- `LoginRequest` - Credenciales de login
- `LoginResponse` - Token de respuesta
- `RegisterRequest` - Datos de registro
- `RefreshTokenRequest` - Renovación de tokens

#### `common.types.ts`
Tipos compartidos y utilitarios:
- `ApiError` - Estructura estandarizada de errores
- `PaginationRequest` - Parámetros de paginación
- `PaginationResponse` - Respuesta paginada
- `ApiResponse<T>` - Wrapper genérico de respuestas

### Contratos por Implementar

#### `user.contract.ts`
Contratos relacionados con gestión de usuarios:
- `CreateUserRequest/Response`
- `UpdateUserRequest/Response`
- `GetUserRequest/Response`
- `ListUsersRequest/Response`

#### `machine.contract.ts`
Contratos para gestión de máquinas/equipos:
- `RegisterMachineRequest/Response`
- `UpdateMachineRequest/Response`
- `GetMachineRequest/Response`
- `ListMachinesRequest/Response`
- `MachineHistoryRequest/Response`

#### `maintenance.contract.ts`
Contratos para mantenimiento preventivo:
- `CreateReminderRequest/Response`
- `UpdateReminderRequest/Response`
- `GetMaintenanceHistoryRequest/Response`
- `TriggerMaintenanceRequest/Response`

#### `quickcheck.contract.ts`
Contratos para chequeos rápidos de seguridad:
- `CreateQuickCheckRequest/Response`
- `ExecuteQuickCheckRequest/Response`
- `GetQuickCheckResultsRequest/Response`
- `QuickCheckReportRequest/Response`

#### `notification.contract.ts`
Contratos para sistema de notificaciones:
- `GetNotificationsRequest/Response`
- `MarkAsReadRequest/Response`
- `NotificationPreferencesRequest/Response`

## 🛠 Patterns y Convenciones

### Naming Convention
```typescript
// Request/Response pairs
export const CreateMachineRequest = z.object({...});
export const CreateMachineResponse = z.object({...});

// Type inference
export type CreateMachineRequest = z.infer<typeof CreateMachineRequest>;
export type CreateMachineResponse = z.infer<typeof CreateMachineResponse>;
```

### Validation Patterns
```typescript
// Nested validation
const ContactMethod = z.object({
  type: z.enum(['phone', 'email', 'whatsapp']),
  value: z.string().min(1),
  isPrimary: z.boolean().default(false)
});

// Conditional validation
const UserRequest = z.object({
  type: z.enum(['client', 'provider']),
  // ... other fields
}).refine(data => {
  // Custom validation logic
  return data.type === 'client' ? hasRequiredClientFields(data) : true;
});
```

### Error Handling
```typescript
// Standardized API errors
export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
  timestamp: z.string().datetime()
});
```

### Pagination
```typescript
// Reusable pagination schemas
export const PaginationRequest = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc')
});

export const PaginationResponse = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number()
  });
```

## 🔄 Uso en las Capas

### Frontend (React)
```typescript
import { LoginRequest, LoginResponse } from '@packages/contracts';

// Validación en formularios (React Hook Form + Zod)
const loginSchema = LoginRequest;

// Type-safe API calls
const response: LoginResponse = await api.post('/auth/login', validatedData);
```

### Backend (Express Controllers)
```typescript
import { LoginRequest, LoginResponse } from '@packages/contracts';

// Middleware de validación
app.post('/auth/login', validateBody(LoginRequest), (req, res) => {
  const validatedBody: LoginRequest = req.body; // Type-safe
  // ... lógica
  const response: LoginResponse = { token: '...' };
  res.json(response);
});
```

## 📚 Beneficios

### 🔒 Type Safety
- Errores de tipo en tiempo de compilación
- IntelliSense completo en ambas capas
- Refactoring seguro

### 🚀 DX (Developer Experience)
- No repetir validaciones
- Documentación automática
- Tests más simples

### 🐛 Menos Bugs
- Imposible desincronizar contratos
- Validación consistente
- Errores claros y tipados

## 🚫 Qué NO va en este paquete

- ❌ Lógica de negocio (eso va en domain)
- ❌ Implementaciones de validación (solo esquemas)
- ❌ Configuración de base de datos
- ❌ Lógica de presentación (UI components)

## 📝 Next Steps

1. Definir esquemas Zod para cada entidad del dominio
2. Implementar validaciones complejas con `.refine()`
3. Generar documentación OpenAPI automática
4. Integrar con React Hook Form en frontend
5. Crear middleware de validación para backend