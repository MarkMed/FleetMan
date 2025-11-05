# Hooks Directory

## Propósito
Contiene hooks personalizados que encapsulan lógica de estado, efectos y interacciones con services. Actúan como la capa de abstracción entre componentes UI y la lógica de negocio.

## Tipos de Hooks

### 1. **Data Hooks** - Gestión de Datos del Dominio
**Propósito**: Manejan el estado y operaciones CRUD de entidades del dominio
**Interacciones**:
- Services para comunicación con API
- TanStack Query para caching y sincronización
- Store global para estado compartido

### 2. **UI Hooks** - Estado de Interfaz
**Propósito**: Manejan estado local de UI, modales, formularios
**Interacciones**:
- Estado local con useState/useReducer
- Efectos de UI con useEffect
- Contextos de tema y configuración

### 3. **Form Hooks** - Gestión de Formularios
**Propósito**: Abstraen la lógica de formularios y validación
**Interacciones**:
- React Hook Form para manejo de formularios
- Zod validators para validación
- Submit handlers con services

## Archivos Existentes y Planificados

```
hooks/
├── index.ts            # ✅ Barrel exports
├── useAuth.ts          # ✅ Autenticación y sesión de usuario
├── useMachines.ts      # ✅ Gestión de máquinas
├── useZodForm.ts       # ✅ Helper para formularios con Zod
├── useNotifications.ts # Gestión de notificaciones
├── useMaintenance.ts   # Gestión de mantenimiento
├── useQuickCheck.ts    # Gestión de chequeos rápidos
├── useLocalStorage.ts  # Persistencia local
├── useDebounce.ts      # Debouncing para búsquedas
├── useAsync.ts         # Manejo de operaciones asíncronas
├── usePagination.ts    # Lógica de paginación
├── useFilters.ts       # Filtros de listas
├── useModal.ts         # Estado de modales
├── useTheme.ts         # Gestión de tema claro/oscuro
├── usePermissions.ts   # Permisos de usuario
├── useWebSocket.ts     # Conexiones en tiempo real
└── useBreadcrumbs.ts   # Navegación breadcrumbs
```

## Detalles de Hooks Principales

### `useAuth.ts` ✅
**Responsabilidades**:
- Estado de autenticación (isAuthenticated, user, loading)
- Operaciones de login/logout/register
- Manejo de tokens y refresh
- Navegación post-autenticación

**API**:
```typescript
const {
  user,
  isAuthenticated,
  isLoading,
  login,
  logout,
  register,
  updateProfile
} = useAuth();
```

### `useMachines.ts` ✅
**Responsabilidades**:
- Lista de máquinas con filtros y paginación
- CRUD de máquinas individuales
- Estado de carga y errores
- Cache invalidation

**API**:
```typescript
const {
  machines,
  isLoading,
  error,
  createMachine,
  updateMachine,
  deleteMachine,
  getMachine,
  refetch
} = useMachines(filters);
```

### `useZodForm.ts` ✅
**Responsabilidades**:
- Integración de React Hook Form con Zod
- Manejo de errores de validación
- Submit handlers tipados

**API**:
```typescript
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
  reset
} = useZodForm(schema, defaultValues);
```

## Hooks Planificados

### `useNotifications.ts`
**Responsabilidades**:
- Lista de notificaciones del usuario
- Marcar como leída/no leída
- Configuración de notificaciones
- Notificaciones en tiempo real

### `useMaintenance.ts`
**Responsabilidades**:
- CRUD de mantenimientos
- Calendario de mantenimientos
- Estadísticas y métricas
- Recordatorios y alertas

### `useQuickCheck.ts`
**Responsabilidades**:
- Crear y gestionar chequeos rápidos
- Historial de chequeos
- Estadísticas de chequeos
- Validación de checklists

## Principios de Desarrollo

### 1. Single Responsibility
- Cada hook tiene una responsabilidad específica
- Composición de hooks simples para funcionalidad compleja
- Separación clara entre estado y lógica

### 2. Reusabilidad
- Hooks agnósticos que pueden ser usados en múltiples componentes
- Parámetros configurables para diferentes casos de uso
- Return values consistentes

### 3. Error Handling
- Manejo consistente de errores async
- Estados de loading bien definidos
- Retry logic cuando sea apropiado

### 4. Performance
- Memoización de valores computados
- Debouncing para operaciones costosas
- Lazy evaluation cuando sea posible

## Estructura Típica de Hook

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useExample = (config?: ExampleConfig) => {
  // Estado local
  const [localState, setLocalState] = useState();
  
  // Queries para lectura
  const { data, isLoading, error } = useQuery({
    queryKey: ['example', config],
    queryFn: () => exampleService.getAll(config),
  });
  
  // Mutations para escritura
  const createMutation = useMutation({
    mutationFn: exampleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['example']);
    },
  });
  
  // Callbacks memoizados
  const handleCreate = useCallback((data: CreateData) => {
    createMutation.mutate(data);
  }, [createMutation]);
  
  return {
    // Estado
    data,
    isLoading,
    error,
    
    // Acciones
    create: handleCreate,
    
    // Estados de mutations
    isCreating: createMutation.isPending,
  };
};
```

## Convenciones

### Nomenclatura
- Hooks: `use` + `EntityName` + opcionalmente `Action`
- Ejemplo: `useAuth`, `useMachines`, `useCreateMachine`

### Return Object
- Estados en presente: `isLoading`, `isError`
- Datos: nombre descriptivo (`user`, `machines`, `notifications`)
- Acciones: verbos (`create`, `update`, `delete`, `refetch`)

### Dependencies
- Usar TanStack Query para operaciones de servidor
- useState para estado local temporal
- useCallback para funciones que pueden cambiar frecuentemente
- useMemo para valores computados costosos

## Testing
- Mocking de services y APIs
- Testing de estados de loading y error
- Testing de side effects
- Testing de invalidación de cache