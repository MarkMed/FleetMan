# Screens Directory

## Propósito
Contiene todas las pantallas/páginas principales de la aplicación. Cada screen representa una ruta específica y orquesta la interacción entre componentes, viewModels y casos de uso.

## Estructura de Carpetas

### `/auth/` - Pantallas de Autenticación
**Propósito**: Manejo de login, registro y recuperación de contraseña
**Interacciones**:
- Hook `useAuth` para estado de autenticación
- `authService` para comunicación con backend
- `AuthLayout` para estructura visual
- Navegación a pantallas principales tras autenticación exitosa

**Archivos existentes y planificados**:
```
auth/
├── LoginScreen.tsx          # ✅ Pantalla de inicio de sesión
├── RegisterScreen.tsx       # ✅ Pantalla de registro de usuario
├── ForgotPasswordScreen.tsx # Recuperación de contraseña
├── ResetPasswordScreen.tsx  # Cambio de contraseña con token
├── VerifyEmailScreen.tsx    # Verificación de email
└── index.ts                 # Barrel exports
```

### `/dashboard/` - Panel Principal
**Propósito**: Vista general del sistema con métricas y accesos rápidos
**Interacciones**:
- Hooks de máquinas, mantenimiento y notificaciones
- Componentes de gráficos y estadísticas
- Navegación a otras secciones

**Archivos existentes y planificados**:
```
dashboard/
├── DashboardScreen.tsx      # ✅ Pantalla principal con overview
├── StatsCard.tsx            # Componente para métricas individuales
├── QuickActions.tsx         # Botones de acceso rápido
├── RecentActivity.tsx       # Lista de actividad reciente
├── AlertsPanel.tsx          # Panel de alertas críticas
└── index.ts                 # Barrel exports
```

### `/machines/` - Gestión de Máquinas
**Propósito**: CRUD completo de máquinas e inventario
**Interacciones**:
- Hook `useMachines` para gestión de estado
- `machineService` para operaciones CRUD
- Formularios para crear/editar máquinas
- Componentes de tabla y filtros

**Archivos existentes y planificados**:
```
machines/
├── MachinesScreen.tsx       # ✅ Lista principal de máquinas
├── MachineDetailScreen.tsx  # Vista detallada de una máquina
├── MachineFormScreen.tsx    # Crear/editar máquina
├── MachineCard.tsx          # Tarjeta individual de máquina
├── MachineFilters.tsx       # Filtros de búsqueda
├── MachineTable.tsx         # Tabla de máquinas
└── index.ts                 # Barrel exports
```

### `/maintenance/` - Gestión de Mantenimiento
**Propósito**: Programación, seguimiento y historial de mantenimientos
**Interacciones**:
- Hooks de mantenimiento y máquinas
- Servicios de mantenimiento y notificaciones
- Calendarios y formularios de mantenimiento

**Archivos existentes y planificados**:
```
maintenance/
├── MaintenanceScreen.tsx     # ✅ Vista principal de mantenimiento
├── MaintenanceDetailScreen.tsx # Detalle de mantenimiento específico
├── MaintenanceFormScreen.tsx # Crear/editar mantenimiento
├── MaintenanceCalendar.tsx   # Vista de calendario
├── MaintenanceHistory.tsx    # Historial de mantenimientos
├── MaintenanceStats.tsx      # Estadísticas y métricas
└── index.ts                  # Barrel exports
```

### `/quickcheck/` - Chequeos Rápidos
**Propósito**: Sistema de inspecciones rápidas de máquinas
**Interacciones**:
- Hooks de chequeos y máquinas
- Formularios dinámicos de inspección
- Servicios de chequeos y notificaciones

**Archivos existentes y planificados**:
```
quickcheck/
├── QuickCheckScreen.tsx      # ✅ Pantalla principal de chequeos
├── QuickCheckFormScreen.tsx  # Formulario de nuevo chequeo
├── QuickCheckHistory.tsx     # Historial de chequeos
├── ChecklistComponent.tsx    # Componente de checklist
├── QuickCheckStats.tsx       # Estadísticas de chequeos
└── index.ts                  # Barrel exports
```

### `/notifications/` - Centro de Notificaciones
**Propósito**: Gestión de alertas, recordatorios y notificaciones del sistema
**Interacciones**:
- Hook de notificaciones
- Servicios de notificaciones y configuración
- Componentes de filtrado y configuración

**Archivos existentes y planificados**:
```
notifications/
├── NotificationsScreen.tsx   # ✅ Centro de notificaciones
├── NotificationItem.tsx      # Componente individual de notificación
├── NotificationFilters.tsx   # Filtros de notificaciones
├── NotificationSettings.tsx  # Configuración de notificaciones
└── index.ts                  # Barrel exports
```

## Principios de Desarrollo

### 1. Responsabilidad Única
- Cada screen maneja una funcionalidad específica
- Lógica de negocio delegada a viewModels y useCases
- UI separada en componentes reutilizables

### 2. Gestión de Estado
- Estado local para UI específica de la pantalla
- Estado global solo para datos compartidos
- Uso de hooks personalizados para lógica compleja

### 3. Navegación
- Usar React Router para navegación declarativa
- Lazy loading para optimizar carga inicial
- Manejo de parámetros de URL y query strings

### 4. Error Handling
- Error boundaries para capturar errores de UI
- Estados de carga y error bien definidos
- Feedback claro al usuario

## Estructura Típica de Screen

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
// Hooks e importaciones específicas

export const ExampleScreen: React.FC = () => {
  const { t } = useTranslation();
  // Hooks de estado y efectos
  
  // Early returns para estados de carga/error
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  return (
    <div className="screen-container">
      <ScreenHeader title={t('screen.title')} />
      <ScreenContent>
        {/* Contenido principal */}
      </ScreenContent>
    </div>
  );
};
```

## Convenciones de Nomenclatura

### Archivos
- Screens: `ExampleScreen.tsx`
- Subcomponentes: `ExampleComponent.tsx`
- Índices: `index.ts`

### Componentes
- Exported component: `ExampleScreen`
- Función del componente: `React.FC`

### CSS Classes
- Container principal: `{screen-name}-screen`
- Secciones: `{screen-name}-{section}`
- Elementos: Tailwind utilities

## Testing
- Tests de integración para flujos críticos
- Mocking de hooks y servicios
- Testing de navegación y estado
- Snapshots para regresión visual