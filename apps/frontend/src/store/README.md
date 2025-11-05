# Store Directory

## Propósito
Maneja el estado global de la aplicación usando Zustand. Contiene stores para datos que necesitan ser compartidos entre múltiples componentes y pantallas.

## Arquitectura de Estado

### Principio de Responsabilidad Única
- Cada slice maneja un dominio específico
- Estado global solo para datos realmente compartidos
- Estado local preferido cuando sea posible

### Flujo de Datos
```
UI Components → Actions → Store → Services → API
     ↑                                ↓
   Subscriptions ← State Updates ← Response
```

## Estructura de Archivos

```
store/
├── index.ts              # ✅ Store principal y exports
├── AuthProvider.tsx      # ✅ Provider de contexto de autenticación
├── slices/
│   ├── authSlice.ts      # ✅ Estado de autenticación
│   ├── uiSlice.ts        # ✅ Estado de UI global
│   ├── machineSlice.ts   # Estado de máquinas (si necesario)
│   ├── notificationSlice.ts # Estado de notificaciones
│   ├── themeSlice.ts     # Configuración de tema
│   ├── userPreferencesSlice.ts # Preferencias del usuario
│   └── index.ts          # Exports de slices
├── middleware/
│   ├── persistMiddleware.ts # Persistencia en localStorage
│   ├── devToolsMiddleware.ts # DevTools integration
│   └── index.ts          # Exports de middleware
└── types/
    ├── StoreTypes.ts     # Tipos del store
    └── index.ts          # Exports de tipos
```

## Slices Principales

### `authSlice.ts` ✅
**Responsabilidades**:
- Estado de autenticación del usuario
- Tokens y sesión activa
- Información del usuario logueado
- Estados de loading para auth operations

**Estado**:
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

**Acciones**:
```typescript
interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (tokens: TokenPair) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
```

### `uiSlice.ts` ✅
**Responsabilidades**:
- Estado de la interfaz global
- Sidebar abierto/cerrado
- Modales activos
- Configuración de tema
- Estados de loading globales

**Estado**:
```typescript
interface UIState {
  sidebarOpen: boolean;
  currentModal: string | null;
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  notifications: {
    enabled: boolean;
    sound: boolean;
  };
  isOnline: boolean;
}
```

## Slices Planificados

### `machineSlice.ts`
**Cuándo usar**: Solo si múltiples pantallas necesitan compartir el mismo estado de máquinas
**Responsabilidades**:
- Cache de máquinas seleccionadas
- Filtros compartidos entre pantallas
- Estado de sincronización

### `notificationSlice.ts`
**Responsabilidades**:
- Notificaciones no leídas globales
- Configuración de notificaciones push
- Queue de notificaciones locales

### `themeSlice.ts`
**Responsabilidades**:
- Configuración de tema detallada
- Colores personalizados
- Configuración de accesibilidad

### `userPreferencesSlice.ts`
**Responsabilidades**:
- Preferencias de UI del usuario
- Configuraciones personalizadas
- Shortcuts de teclado

## Provider Pattern

### `AuthProvider.tsx` ✅
**Propósito**: Proveedor de contexto que envuelve la app
**Características**:
- Inicialización del estado de auth
- Hidratación desde localStorage
- Manejo de token refresh automático

```typescript
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lógica de inicialización y hidratación
  return <>{children}</>;
};
```

## Middleware

### Persistencia
**Propósito**: Guardar estado en localStorage automáticamente
**Configuración**:
```typescript
const persistOptions = {
  name: 'fleetman-store',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    auth: { token: state.auth.token, user: state.auth.user },
    ui: { theme: state.ui.theme, language: state.ui.language }
  })
};
```

### DevTools
**Propósito**: Integración con Redux DevTools
**Configuración**:
```typescript
const devToolsOptions = {
  enabled: process.env.NODE_ENV === 'development',
  name: 'FleetMan Store'
};
```

## Patrones de Uso

### 1. Simple State Access
```typescript
const useAuthStore = () => {
  const user = useStore(state => state.auth.user);
  const isAuthenticated = useStore(state => state.auth.isAuthenticated);
  return { user, isAuthenticated };
};
```

### 2. Actions with Async Logic
```typescript
const useAuthActions = () => {
  const { login, logout, setError } = useStore(state => state.auth);
  
  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      // Navegación o side effects adicionales
    } catch (error) {
      setError(error.message);
    }
  };
  
  return { handleLogin, logout };
};
```

### 3. Computed Values
```typescript
const useAuthComputed = () => {
  const isAdmin = useStore(state => 
    state.auth.user?.role === UserRole.ADMIN
  );
  
  const displayName = useStore(state => 
    state.auth.user ? 
      `${state.auth.user.firstName} ${state.auth.user.lastName}` : 
      null
  );
  
  return { isAdmin, displayName };
};
```

## Principios de Desarrollo

### 1. Minimal State
- Solo almacenar estado que realmente necesita ser global
- Preferir estado local y prop drilling cuando sea apropiado
- Evitar duplicar estado que ya está en TanStack Query

### 2. Immutability
- Usar Immer para actualizaciones inmutables (incluido en Zustand)
- Nunca mutar estado directamente
- Crear nuevos objetos para actualizaciones

### 3. Type Safety
- Tipado estricto para todo el estado y acciones
- Usar utility types para slices
- Inferencia de tipos automática

### 4. Performance
- Granular subscriptions (solo suscribirse a lo necesario)
- Memoización de computed values costosos
- Lazy loading de slices grandes

## Testing

### Unit Tests
```typescript
describe('authSlice', () => {
  test('should set user on login', () => {
    const store = createStore();
    const user = { id: '1', email: 'test@test.com' };
    
    store.getState().auth.setUser(user);
    
    expect(store.getState().auth.user).toEqual(user);
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });
});
```

### Integration Tests
- Testing de persistencia
- Testing de middleware
- Testing de side effects

## Convenciones

### Nomenclatura
- Slices: `entitySlice.ts`
- Actions: verbos en presente (`setUser`, `updateProfile`)
- State properties: nombres descriptivos (`isLoading`, `currentModal`)

### Estructura de Slice
```typescript
interface SliceState {
  // Estado aquí
}

interface SliceActions {
  // Acciones aquí
}

export type SliceType = SliceState & SliceActions;

export const createSlice = (set: SetState, get: GetState): SliceType => ({
  // Implementación inicial del estado
  
  // Implementación de acciones
});
```

## Migración y Versioning
- Manejo de cambios en estructura de estado
- Migrations para localStorage
- Backward compatibility
- Versioning de schema de persistencia