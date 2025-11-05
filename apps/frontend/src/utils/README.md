# Utils Directory

## Propósito
Contiene funciones utilitarias, helpers y herramientas que son utilizadas a través de toda la aplicación. Estas funciones son agnósticas al dominio y proporcionan funcionalidad común reutilizable.

## Categorías de Utilidades

### 1. **CSS & Styling** - Utilidades de Estilos
### 2. **Data Manipulation** - Manipulación de Datos
### 3. **Validation** - Validaciones Auxiliares
### 4. **Formatting** - Formateo de Datos
### 5. **Browser APIs** - Interacción con APIs del Navegador
### 6. **Performance** - Optimización y Performance

## Archivos Existentes y Planificados

```
utils/
├── index.ts              # ✅ Barrel exports
├── cn.ts                 # ✅ Utility para combinar clases de Tailwind
├── styling/
│   ├── classNames.ts     # Utilities para manejo de CSS classes
│   ├── tailwindHelpers.ts # Helpers específicos de Tailwind
│   ├── responsive.ts     # Utilidades para responsive design
│   └── index.ts          # Exports de styling utils
├── data/
│   ├── arrayHelpers.ts   # Manipulación de arrays
│   ├── objectHelpers.ts  # Manipulación de objetos
│   ├── dateHelpers.ts    # Utilidades de fechas
│   ├── numberHelpers.ts  # Formateo de números
│   ├── stringHelpers.ts  # Manipulación de strings
│   ├── urlHelpers.ts     # Manipulación de URLs
│   └── index.ts          # Exports de data utils
├── validation/
│   ├── commonValidators.ts # Validadores comunes (email, phone, etc)
│   ├── formHelpers.ts    # Helpers para formularios
│   ├── schemaHelpers.ts  # Utilities para Zod schemas
│   └── index.ts          # Exports de validation utils
├── formatting/
│   ├── currency.ts       # Formateo de moneda
│   ├── dates.ts          # Formateo de fechas
│   ├── numbers.ts        # Formateo de números
│   ├── text.ts           # Formateo de texto
│   └── index.ts          # Exports de formatting utils
├── browser/
│   ├── localStorage.ts   # Wrapper para localStorage
│   ├── clipboard.ts      # Utilidades de clipboard
│   ├── download.ts       # Descargas de archivos
│   ├── notifications.ts  # API de notificaciones del navegador
│   ├── geolocation.ts    # API de geolocalización
│   └── index.ts          # Exports de browser utils
├── performance/
│   ├── debounce.ts       # Función debounce
│   ├── throttle.ts       # Función throttle
│   ├── memoize.ts        # Memoización
│   ├── lazy.ts           # Lazy loading utilities
│   └── index.ts          # Exports de performance utils
├── async/
│   ├── retry.ts          # Retry logic para operaciones async
│   ├── timeout.ts        # Timeout utilities
│   ├── queue.ts          # Queue para operaciones async
│   ├── batch.ts          # Batching de operaciones
│   └── index.ts          # Exports de async utils
├── constants/
│   ├── regex.ts          # Expresiones regulares comunes
│   ├── formats.ts        # Formatos de fecha, números, etc
│   ├── limits.ts         # Límites de la aplicación
│   └── index.ts          # Exports de constants
└── testing/
    ├── mockHelpers.ts    # Helpers para testing
    ├── factoryHelpers.ts # Factory functions para tests
    ├── assertions.ts     # Custom assertions
    └── index.ts          # Exports de testing utils
```

## Detalles de Utilidades Principales

### `cn.ts` ✅
**Propósito**: Combinar clases de CSS de manera condicional
**Uso**: Integración con Tailwind CSS y clsx

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Uso:
// cn('px-2 py-1', isActive && 'bg-blue-500', className)
```

### `arrayHelpers.ts`
**Propósito**: Operaciones comunes con arrays

```typescript
// Eliminar duplicados
export const unique = <T>(array: T[]): T[] => [...new Set(array)];

// Agrupar por propiedad
export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

// Filtrar elementos no nulos/undefined
export const filterTruthy = <T>(array: (T | null | undefined)[]): T[] =>
  array.filter((item): item is T => Boolean(item));

// Mover elemento en array
export const moveElement = <T>(
  array: T[],
  fromIndex: number,
  toIndex: number
): T[] => {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
};

// Chunk array en grupos
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};
```

### `dateHelpers.ts`
**Propósito**: Utilidades para manejo de fechas

```typescript
import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

// Formatear fecha para mostrar
export const formatDate = (date: Date | string, formatStr = 'dd/MM/yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, formatStr, { locale: es }) : '';
};

// Formatear fecha relativa
export const formatRelativeDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const days = differenceInDays(new Date(), dateObj);
  
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
  return formatDate(dateObj);
};

// Validar si fecha está en rango
export const isDateInRange = (
  date: Date,
  startDate: Date,
  endDate: Date
): boolean => {
  return date >= startDate && date <= endDate;
};

// Obtener inicio/fin de período
export const getStartOfPeriod = (period: 'day' | 'week' | 'month' | 'year'): Date => {
  const now = new Date();
  
  switch (period) {
    case 'day':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return startOfWeek;
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
  }
};
```

### `stringHelpers.ts`
**Propósito**: Manipulación y formateo de strings

```typescript
// Capitalizar primera letra
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// Convertir a title case
export const titleCase = (str: string): string =>
  str.replace(/\w\S*/g, (txt) => capitalize(txt));

// Truncar texto
export const truncate = (str: string, length: number, suffix = '...'): string =>
  str.length > length ? str.substring(0, length) + suffix : str;

// Limpiar espacios
export const cleanSpaces = (str: string): string =>
  str.replace(/\s+/g, ' ').trim();

// Convertir a slug
export const slugify = (str: string): string =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remover acentos
    .replace(/[^a-z0-9 -]/g, '') // remover caracteres especiales
    .replace(/\s+/g, '-') // espacios a guiones
    .replace(/-+/g, '-') // múltiples guiones a uno
    .trim();

// Extraer iniciales
export const getInitials = (name: string, maxInitials = 2): string =>
  name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, maxInitials)
    .join('');

// Máscarar texto (para mostrar emails parcialmente, etc)
export const maskText = (str: string, visibleChars = 3, maskChar = '*'): string => {
  if (str.length <= visibleChars * 2) return str;
  const start = str.substring(0, visibleChars);
  const end = str.substring(str.length - visibleChars);
  const middle = maskChar.repeat(str.length - visibleChars * 2);
  return start + middle + end;
};
```

### `numberHelpers.ts`
**Propósito**: Formateo y manipulación de números

```typescript
// Formatear número con separadores de miles
export const formatNumber = (num: number, locale = 'es-ES'): string =>
  new Intl.NumberFormat(locale).format(num);

// Formatear porcentaje
export const formatPercentage = (
  num: number,
  decimals = 1,
  locale = 'es-ES'
): string =>
  new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num / 100);

// Formatear moneda
export const formatCurrency = (
  amount: number,
  currency = 'EUR',
  locale = 'es-ES'
): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);

// Redondear a decimales específicos
export const roundTo = (num: number, decimals: number): number =>
  Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);

// Clamp número entre min y max
export const clamp = (num: number, min: number, max: number): number =>
  Math.min(Math.max(num, min), max);

// Generar número aleatorio en rango
export const randomBetween = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Formatear bytes
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};
```

### `debounce.ts`
**Propósito**: Debouncing para optimizar performance

```typescript
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Versión que retorna una promesa
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: ReturnType<typeof setTimeout>;
  let resolvePromise: (value: ReturnType<T>) => void;
  let rejectPromise: (reason?: any) => void;
  
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId);
      resolvePromise = resolve;
      rejectPromise = reject;
      
      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args);
          resolvePromise(result);
        } catch (error) {
          rejectPromise(error);
        }
      }, delay);
    });
  };
}
```

### `localStorage.ts`
**Propósito**: Wrapper seguro para localStorage

```typescript
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue ?? null;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue ?? null;
    }
  },
  
  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  },
  
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  },
  
  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },
  
  has: (key: string): boolean => {
    return localStorage.getItem(key) !== null;
  },
  
  size: (): number => {
    return localStorage.length;
  }
};
```

## Principios de Desarrollo

### 1. Pure Functions
- Todas las utilidades deben ser funciones puras cuando sea posible
- Sin side effects (excepto para browser APIs)
- Predictable input/output

### 2. Type Safety
- Tipado estricto con TypeScript
- Uso de generics para flexibilidad
- Overloads para diferentes casos de uso

### 3. Performance
- Optimizadas para performance
- Lazy evaluation cuando sea apropiado
- Evitar operaciones costosas innecesarias

### 4. Error Handling
- Manejo graceful de errores
- Fallbacks para casos edge
- Logging de errores sin lanzar excepciones

## Testing

### Unit Tests
```typescript
describe('arrayHelpers', () => {
  test('unique should remove duplicates', () => {
    const input = [1, 2, 2, 3, 3, 3];
    const expected = [1, 2, 3];
    
    expect(unique(input)).toEqual(expected);
  });
  
  test('groupBy should group items by key', () => {
    const input = [
      { category: 'A', value: 1 },
      { category: 'B', value: 2 },
      { category: 'A', value: 3 }
    ];
    
    const result = groupBy(input, 'category');
    
    expect(result.A).toHaveLength(2);
    expect(result.B).toHaveLength(1);
  });
});
```

## Convenciones

### Nomenclatura
- Funciones: camelCase descriptivo
- Archivos: camelCase con sufijo del tipo (Helpers, Utils)
- Constantes: UPPER_SNAKE_CASE

### Organización
- Agrupar por funcionalidad relacionada
- Un archivo por tipo de utilidad
- Barrel exports en cada subcarpeta

### Documentación
- JSDoc para funciones complejas
- Ejemplos de uso en comentarios
- Descripción de parámetros y return values