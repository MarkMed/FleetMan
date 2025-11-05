# Frontend Source Directory

## Propósito
Directorio principal del código fuente del frontend de FleetMan. Implementa la arquitectura MVVM-lite con React + TypeScript siguiendo principios de Clean Architecture.

## Estructura y Responsabilidades

### Capas de la Arquitectura
- **Presentación**: `screens/`, `components/`, `theme/`
- **Aplicación**: `viewModels/`, `useCases/`, `hooks/`
- **Dominio**: `models/`, `validators/`
- **Infraestructura**: `services/`, `store/`, `i18n/`
- **Compartido**: `utils/`, `constants/`, `config/`, `helpers/`

### Flujo de Datos
```
User Interface → ViewModels → Use Cases → Services → API
     ↓              ↓           ↓          ↓        ↓
 Components ← Hooks ← Store ← Repositories ← Backend
```

## Principios de Desarrollo

### 1. Separación de Responsabilidades
- UI components no deben contener lógica de negocio
- Business logic se maneja en useCases y viewModels
- Estado global solo para datos compartidos entre pantallas

### 2. Tipado Estricto
- Todos los archivos deben usar TypeScript
- Interfaces definidas en `models/`
- Validaciones con Zod en `validators/`

### 3. Reutilización
- Componentes genéricos en `components/ui/`
- Hooks personalizados en `hooks/`
- Utilidades compartidas en `utils/`

### 4. Internacionalización
- Textos siempre a través de `i18n`
- Soporte para español e inglés
- Formateo de fechas y números localizado

## Archivos Principales
- `main.tsx` - Punto de entrada de la aplicación
- `App.tsx` - Componente raíz con providers y routing
- `vite-env.d.ts` - Tipos globales de Vite

## Convenciones de Nomenclatura
- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useAuth.ts`)
- **Services**: camelCase con sufijo `Service` (`authService.ts`)
- **Stores**: camelCase con sufijo `Slice` (`authSlice.ts`)
- **Tipos**: PascalCase (`User`, `MachineStatus`)
- **Archivos de configuración**: camelCase (`apiClient.ts`)

## Estándares de Calidad
- Componentes funcionales con TypeScript
- Uso de React Hooks para estado y efectos
- Implementación de error boundaries
- Testing unitario para lógica crítica
- Documentación JSDoc para funciones complejas