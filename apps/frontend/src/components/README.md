# Components Directory

## Propósito
Contiene todos los componentes reutilizables de la interfaz de usuario, organizados por categoría y nivel de abstracción.

## Estructura de Carpetas

### `/ui/` - Componentes Base
**Propósito**: Componentes primitivos y elementos básicos de UI
**Interacciones**: 
- Utilizados por componentes de nivel superior
- Implementan el design system con Tailwind CSS
- Siguen patrones de shadcn/ui y Radix UI

**Archivos que debería contener**:
```
ui/
├── Button.tsx          # Botones con variantes (primary, secondary, destructive)
├── Input.tsx           # Campos de entrada de texto
├── Select.tsx          # Dropdowns y selects
├── Checkbox.tsx        # Checkboxes con estados
├── Radio.tsx           # Radio buttons
├── Switch.tsx          # Toggle switches
├── Textarea.tsx        # Áreas de texto multilínea
├── Label.tsx           # Etiquetas para formularios
├── Card.tsx            # Contenedores con bordes y sombras
├── Badge.tsx           # Indicadores de estado pequeños
├── Avatar.tsx          # Imágenes de perfil circulares
├── Separator.tsx       # Líneas divisorias
├── Skeleton.tsx        # Placeholders de carga
├── Spinner.tsx         # Indicadores de carga
├── Toast.tsx           # Notificaciones temporales
├── Modal.tsx           # Diálogos modales
├── Tooltip.tsx         # Información contextual
├── Tabs.tsx            # Navegación por pestañas
├── Accordion.tsx       # Contenido expandible
├── Progress.tsx        # Barras de progreso
├── Table.tsx           # Tablas con encabezados
├── Pagination.tsx      # Controles de paginación
├── DatePicker.tsx      # Selector de fechas
├── TimePicker.tsx      # Selector de tiempo
└── index.ts            # Barrel exports
```

### `/forms/` - Componentes de Formularios
**Propósito**: Componentes complejos para manejo de formularios
**Interacciones**:
- Usa componentes de `/ui/` como building blocks
- Integra con `react-hook-form` y validadores Zod
- Comunica con hooks personalizados para lógica de negocio

**Archivos que debería contener**:
```
forms/
├── LoginForm.tsx       # Formulario de inicio de sesión
├── RegisterForm.tsx    # Formulario de registro
├── MachineForm.tsx     # Crear/editar máquinas
├── QuickCheckForm.tsx  # Formulario de chequeo rápido
├── MaintenanceForm.tsx # Formulario de mantenimiento
├── UserProfileForm.tsx # Edición de perfil
├── SearchForm.tsx      # Búsquedas con filtros
├── FormField.tsx       # Wrapper para campos con validación
├── FormError.tsx       # Componente para mostrar errores
└── index.ts            # Barrel exports
```

### `/layout/` - Componentes de Diseño
**Propósito**: Componentes que definen la estructura y navegación de la aplicación
**Interacciones**:
- Usa hooks de autenticación y navegación
- Integra con el sistema de routing
- Maneja el estado global de UI (sidebar, theme)

**Archivos existentes y planificados**:
```
layout/
├── AuthLayout.tsx      # ✅ Layout para páginas de autenticación
├── MainLayout.tsx      # ✅ Layout principal con sidebar y header
├── Header.tsx          # Header con navegación y acciones de usuario
├── Sidebar.tsx         # Navegación lateral con menús
├── Footer.tsx          # Pie de página con información
├── Breadcrumbs.tsx     # Navegación de ruta actual
├── LoadingLayout.tsx   # Layout durante estados de carga
├── ErrorLayout.tsx     # Layout para páginas de error
└── index.ts            # Barrel exports
```

## Principios de Diseño

### 1. Composición sobre Herencia
- Componentes pequeños y enfocados
- Usar composition patterns en lugar de props extensas
- Implementar render props cuando sea necesario

### 2. Accesibilidad (a11y)
- Todos los componentes deben ser accesibles
- Usar atributos ARIA apropiados
- Soporte para navegación por teclado
- Contraste de colores adecuado

### 3. Reutilización
- Componentes agnósticos al dominio en `/ui/`
- Props well-typed con TypeScript
- Documentación clara con ejemplos de uso

### 4. Performance
- Usar React.memo para componentes puros
- Lazy loading para componentes pesados
- Optimizar re-renders innecesarios

## Convenciones de Código

### Estructura de Componente
```typescript
import React from 'react';
import { cn } from '@/utils';

interface ComponentProps {
  // Props aquí
}

export const Component: React.FC<ComponentProps> = ({ 
  prop1, 
  prop2,
  className,
  ...props 
}) => {
  return (
    <div className={cn('base-classes', className)} {...props}>
      {/* Contenido */}
    </div>
  );
};
```

### Exportación
- Named exports para componentes individuales
- Barrel exports en `index.ts` para importaciones limpias
- Re-exportar tipos relacionados

### Testing
- Cada componente debe tener tests unitarios
- Focus en comportamiento, no implementación
- Testing de accesibilidad con testing-library