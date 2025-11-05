# Services Directory

## Propósito
Contiene la capa de servicios que maneja toda la comunicación con APIs externas, persistencia local y operaciones de infraestructura. Actúa como el boundary entre la lógica de dominio y el mundo exterior.

## Estructura de Carpetas

### `/api/` - Servicios de API
**Propósito**: Comunicación con el backend y APIs externas
**Interacciones**:
- HttpClient para requests HTTP
- Mappers para transformar DTOs a entidades del dominio
- Error handling y retry logic
- Interceptors para autenticación y logging

**Archivos existentes y planificados**:
```
api/
├── apiClient.ts         # ✅ Cliente HTTP base con interceptors
├── authService.ts       # ✅ Autenticación y gestión de tokens
├── machineService.ts    # ✅ CRUD de máquinas
├── maintenanceService.ts # CRUD de mantenimientos
├── quickCheckService.ts  # Operaciones de chequeos rápidos
├── notificationService.ts # Gestión de notificaciones
├── userService.ts        # Gestión de usuarios y perfiles
├── reportService.ts      # Generación y descarga de reportes
├── uploadService.ts      # Subida de archivos e imágenes
└── index.ts             # Barrel exports
```

### `/storage/` - Persistencia Local
**Propósito**: Manejo de localStorage, sessionStorage y IndexedDB
**Interacciones**:
- Hooks para persistencia reactiva
- Serialización/deserialización de datos
- Manejo de quotas y limpieza de storage

**Archivos planificados**:
```
storage/
├── localStorageService.ts # Wrapper para localStorage
├── sessionStorageService.ts # Wrapper para sessionStorage
├── cacheService.ts       # Cache inteligente con TTL
├── offlineService.ts     # Manejo de datos offline
└── index.ts              # Barrel exports
```

### `/external/` - Servicios Externos
**Propósito**: Integración con servicios de terceros
**Interacciones**:
- APIs de mapas para ubicaciones
- Servicios de notificaciones push
- Analytics y telemetría

**Archivos planificados**:
```
external/
├── mapsService.ts        # Integración con mapas (Google Maps, etc)
├── pushService.ts        # Notificaciones push
├── analyticsService.ts   # Tracking de eventos
├── exportService.ts      # Exportación a PDF, Excel, etc
└── index.ts              # Barrel exports
```

## Detalles de Servicios Principales

### `apiClient.ts` ✅
**Responsabilidades**:
- Configuración base de cliente HTTP
- Interceptors de request/response
- Manejo centralizado de errores
- Retry logic automático
- Timeout configuration

**API**:
```typescript
const apiClient = {
  get: <T>(url: string, config?: Config) => Promise<T>,
  post: <T>(url: string, data?: any, config?: Config) => Promise<T>,
  put: <T>(url: string, data?: any, config?: Config) => Promise<T>,
  delete: <T>(url: string, config?: Config) => Promise<T>,
  patch: <T>(url: string, data?: any, config?: Config) => Promise<T>
};
```

### `authService.ts` ✅
**Responsabilidades**:
- Login/logout/register
- Gestión de tokens JWT
- Refresh token automático
- Validación de sesión

**API**:
```typescript
const authService = {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>,
  logout: () => Promise<void>,
  register: (userData: RegisterData) => Promise<AuthResponse>,
  refreshToken: () => Promise<TokenResponse>,
  getCurrentUser: () => Promise<User>,
  updateProfile: (data: UpdateProfileData) => Promise<User>
};
```

### `machineService.ts` ✅
**Responsabilidades**:
- CRUD completo de máquinas
- Filtros y búsquedas
- Paginación del lado servidor
- Upload de imágenes de máquinas

**API**:
```typescript
const machineService = {
  getAll: (filters?: MachineFilters) => Promise<PaginatedResponse<Machine>>,
  getById: (id: string) => Promise<Machine>,
  create: (data: CreateMachineData) => Promise<Machine>,
  update: (id: string, data: UpdateMachineData) => Promise<Machine>,
  delete: (id: string) => Promise<void>,
  uploadImage: (id: string, file: File) => Promise<string>
};
```

## Servicios Planificados

### `maintenanceService.ts`
**Responsabilidades**:
- CRUD de mantenimientos programados y realizados
- Calendarios de mantenimiento
- Historial y estadísticas
- Alertas y recordatorios

### `quickCheckService.ts`
**Responsabilidades**:
- Crear y gestionar chequeos rápidos
- Templates de checklists
- Historial de chequeos
- Estadísticas y reportes

### `notificationService.ts`
**Responsabilidades**:
- CRUD de notificaciones
- Configuración de preferencias
- Push notifications
- Email notifications

## Principios de Desarrollo

### 1. Separation of Concerns
- Un service por dominio/entidad
- Separación entre comunicación de red y lógica de negocio
- Abstracción de detalles de implementación

### 2. Error Handling
- Manejo consistente de errores HTTP
- Mapeo de errores del servidor a errores del dominio
- Logging centralizado de errores

### 3. Type Safety
- Tipado estricto de requests y responses
- DTOs separados de entidades del dominio
- Validación de respuestas con Zod

### 4. Performance
- Caching inteligente de respuestas
- Request deduplication
- Optimistic updates cuando sea apropiado

## Estructura Típica de Service

```typescript
import { apiClient } from './apiClient';
import type { Entity, CreateEntityData, UpdateEntityData } from '@/models';

export const entityService = {
  async getAll(filters?: EntityFilters): Promise<PaginatedResponse<Entity>> {
    const response = await apiClient.get('/entities', { params: filters });
    return response.data;
  },
  
  async getById(id: string): Promise<Entity> {
    const response = await apiClient.get(`/entities/${id}`);
    return response.data;
  },
  
  async create(data: CreateEntityData): Promise<Entity> {
    const response = await apiClient.post('/entities', data);
    return response.data;
  },
  
  async update(id: string, data: UpdateEntityData): Promise<Entity> {
    const response = await apiClient.put(`/entities/${id}`, data);
    return response.data;
  },
  
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/entities/${id}`);
  }
};
```

## Interceptors y Middleware

### Request Interceptors
- Agregar Authorization header automáticamente
- Logging de requests salientes
- Transformación de datos antes del envío

### Response Interceptors
- Manejo automático de refresh tokens
- Transformación de respuestas
- Error handling centralizado

## Error Handling Strategy

### HTTP Status Codes
- 401: Redirect a login
- 403: Show unauthorized message
- 404: Show not found state
- 500: Show generic error
- Network: Show offline message

### Error Types
```typescript
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR'
}
```

## Testing
- Mocking de HTTP requests con MSW
- Testing de error scenarios
- Testing de retry logic
- Integration tests con backend real