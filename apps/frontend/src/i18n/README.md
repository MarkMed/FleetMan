# I18n Directory

## Propósito
Contiene toda la configuración e implementación del sistema de internacionalización (i18n) de la aplicación. Gestiona múltiples idiomas, traducciones y localización de formatos de fecha, números y monedas.

## Sistema de Internacionalización

### Características
- **Múltiples idiomas**: Español (principal) e Inglés
- **Lazy loading**: Carga de traducciones bajo demanda
- **Pluralización**: Manejo de formas plurales
- **Formateo localizado**: Fechas, números, monedas
- **Namespace organization**: Traducciones organizadas por dominio
- **Fallbacks**: Sistema de respaldo para traducciones faltantes

## Estructura de Archivos

```
i18n/
├── index.ts              # ✅ Configuración principal de i18next
├── config.ts             # Configuración de i18next
├── resources.ts          # Definición de recursos y namespaces
├── formatters.ts         # Formatters personalizados
├── hooks.ts              # Hooks personalizados para i18n
├── types.ts              # Types para TypeScript
├── locales/
│   ├── es.json           # ✅ Traducciones en español (principal)
│   ├── en.json           # ✅ Traducciones en inglés
│   ├── es/               # Traducciones modulares en español
│   │   ├── common.json   # Términos comunes
│   │   ├── auth.json     # Autenticación
│   │   ├── machines.json # Máquinas
│   │   ├── maintenance.json # Mantenimiento
│   │   ├── quickcheck.json # Chequeos rápidos
│   │   ├── notifications.json # Notificaciones
│   │   ├── forms.json    # Formularios
│   │   ├── errors.json   # Mensajes de error
│   │   ├── navigation.json # Navegación
│   │   └── dashboard.json # Dashboard
│   ├── en/               # Traducciones modulares en inglés
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── machines.json
│   │   ├── maintenance.json
│   │   ├── quickcheck.json
│   │   ├── notifications.json
│   │   ├── forms.json
│   │   ├── errors.json
│   │   ├── navigation.json
│   │   └── dashboard.json
│   └── index.ts          # Exports de locales
├── utils/
│   ├── formatters.ts     # Utilidades de formateo
│   ├── plurals.ts        # Reglas de pluralización
│   ├── validators.ts     # Validadores de traducciones
│   └── index.ts          # Exports de utils
└── plugins/
    ├── datePlugin.ts     # Plugin para fechas
    ├── numberPlugin.ts   # Plugin para números
    └── index.ts          # Exports de plugins
```

## Configuración Principal

### `config.ts`
**Propósito**: Configuración de i18next

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import de traducciones estáticas (para fallback)
import esTranslations from './locales/es.json';
import enTranslations from './locales/en.json';

const isProduction = import.meta.env.NODE_ENV === 'production';

export const defaultNS = 'common';
export const fallbackLng = 'es';
export const supportedLanguages = ['es', 'en'] as const;

export const i18nConfig = {
  // Configuración básica
  lng: fallbackLng,
  fallbackLng,
  supportedLngs: supportedLanguages,
  
  // Namespace configuration
  defaultNS,
  ns: [
    'common',
    'auth',
    'machines',
    'maintenance', 
    'quickcheck',
    'notifications',
    'forms',
    'errors',
    'navigation',
    'dashboard'
  ],
  
  // Debugging (solo en desarrollo)
  debug: !isProduction,
  
  // Configuración de detección de idioma
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    lookupLocalStorage: 'fleetman_language',
    caches: ['localStorage'],
  },
  
  // Configuración de backend (para lazy loading)
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    addPath: '/locales/{{lng}}/{{ns}}.json',
  },
  
  // Interpolación
  interpolation: {
    escapeValue: false, // React ya escapa por defecto
    formatSeparator: ',',
    format: (value: any, format: string, lng: string) => {
      if (format === 'uppercase') return value.toUpperCase();
      if (format === 'lowercase') return value.toLowerCase();
      if (format === 'capitalize') return value.charAt(0).toUpperCase() + value.slice(1);
      
      // Formateo de fechas
      if (format.startsWith('date')) {
        const dateFormat = format.split(':')[1] || 'short';
        return formatDate(value, dateFormat, lng);
      }
      
      // Formateo de números
      if (format.startsWith('number')) {
        const numberFormat = format.split(':')[1] || 'decimal';
        return formatNumber(value, numberFormat, lng);
      }
      
      return value;
    },
  },
  
  // Configuración de React
  react: {
    useSuspense: true,
    bindI18n: 'languageChanged',
    bindI18nStore: 'added removed',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em'],
  },
  
  // Recursos de fallback (embebidos)
  resources: {
    es: esTranslations,
    en: enTranslations,
  },
};

// Inicializar i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(i18nConfig);

export default i18n;
```

### `resources.ts`
**Propósito**: Definición de tipos para recursos de traducciones

```typescript
// Definir estructura de recursos para TypeScript
export interface TranslationResources {
  common: {
    actions: {
      save: string;
      cancel: string;
      delete: string;
      edit: string;
      create: string;
      search: string;
      filter: string;
      export: string;
      import: string;
      refresh: string;
      close: string;
      back: string;
      next: string;
      previous: string;
      submit: string;
      reset: string;
    };
    status: {
      active: string;
      inactive: string;
      pending: string;
      completed: string;
      cancelled: string;
      draft: string;
    };
    labels: {
      name: string;
      description: string;
      date: string;
      time: string;
      location: string;
      notes: string;
      image: string;
      file: string;
      status: string;
      type: string;
      priority: string;
    };
    messages: {
      loading: string;
      noData: string;
      error: string;
      success: string;
      confirm: string;
      unsavedChanges: string;
    };
    time: {
      justNow: string;
      minutesAgo: string;
      hoursAgo: string;
      daysAgo: string;
      weeksAgo: string;
      monthsAgo: string;
    };
  };
  
  auth: {
    titles: {
      login: string;
      register: string;
      forgotPassword: string;
      resetPassword: string;
    };
    fields: {
      email: string;
      password: string;
      confirmPassword: string;
      firstName: string;
      lastName: string;
      rememberMe: string;
    };
    actions: {
      signIn: string;
      signUp: string;
      signOut: string;
      forgotPassword: string;
      resetPassword: string;
    };
    messages: {
      loginSuccess: string;
      logoutSuccess: string;
      invalidCredentials: string;
      emailSent: string;
      passwordReset: string;
    };
  };
  
  machines: {
    titles: {
      machines: string;
      newMachine: string;
      editMachine: string;
      machineDetail: string;
    };
    fields: {
      serialNumber: string;
      model: string;
      brand: string;
      machineType: string;
      acquisitionDate: string;
      warrantyDate: string;
      operatingHours: string;
      fuelLevel: string;
      lastMaintenance: string;
      nextMaintenance: string;
    };
    status: {
      active: string;
      maintenance: string;
      outOfService: string;
      retired: string;
    };
    types: {
      excavator: string;
      bulldozer: string;
      crane: string;
      loader: string;
      compactor: string;
      truck: string;
      generator: string;
      other: string;
    };
    messages: {
      created: string;
      updated: string;
      deleted: string;
      maintenanceDue: string;
      lowFuel: string;
    };
  };
  
  // ... más namespaces
}

// Export de tipos para uso en la aplicación
export type TranslationKey = keyof TranslationResources;
export type CommonTranslations = TranslationResources['common'];
export type AuthTranslations = TranslationResources['auth'];
export type MachineTranslations = TranslationResources['machines'];
```

## Traducciones por Namespace

### `locales/es/common.json`
```json
{
  "actions": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "create": "Crear",
    "search": "Buscar",
    "filter": "Filtrar",
    "export": "Exportar",
    "import": "Importar",
    "refresh": "Actualizar",
    "close": "Cerrar",
    "back": "Volver",
    "next": "Siguiente",
    "previous": "Anterior",
    "submit": "Enviar",
    "reset": "Restablecer"
  },
  "status": {
    "active": "Activo",
    "inactive": "Inactivo",
    "pending": "Pendiente",
    "completed": "Completado",
    "cancelled": "Cancelado",
    "draft": "Borrador"
  },
  "labels": {
    "name": "Nombre",
    "description": "Descripción",
    "date": "Fecha",
    "time": "Hora",
    "location": "Ubicación",
    "notes": "Notas",
    "image": "Imagen",
    "file": "Archivo",
    "status": "Estado",
    "type": "Tipo",
    "priority": "Prioridad"
  },
  "messages": {
    "loading": "Cargando...",
    "noData": "No hay datos disponibles",
    "error": "Ha ocurrido un error",
    "success": "Operación exitosa",
    "confirm": "¿Está seguro?",
    "unsavedChanges": "Tiene cambios sin guardar"
  },
  "time": {
    "justNow": "Ahora mismo",
    "minutesAgo": "{{count}} minuto",
    "minutesAgo_plural": "{{count}} minutos",
    "hoursAgo": "{{count}} hora",
    "hoursAgo_plural": "{{count}} horas",
    "daysAgo": "{{count}} día",
    "daysAgo_plural": "{{count}} días",
    "weeksAgo": "{{count}} semana",
    "weeksAgo_plural": "{{count}} semanas",
    "monthsAgo": "{{count}} mes",
    "monthsAgo_plural": "{{count}} meses"
  }
}
```

### `locales/es/machines.json`
```json
{
  "titles": {
    "machines": "Máquinas",
    "newMachine": "Nueva Máquina",
    "editMachine": "Editar Máquina",
    "machineDetail": "Detalle de Máquina"
  },
  "fields": {
    "serialNumber": "Número de Serie",
    "model": "Modelo",
    "brand": "Marca",
    "machineType": "Tipo de Máquina",
    "acquisitionDate": "Fecha de Adquisición",
    "warrantyDate": "Fecha de Garantía",
    "operatingHours": "Horas Operativas",
    "fuelLevel": "Nivel de Combustible",
    "lastMaintenance": "Último Mantenimiento",
    "nextMaintenance": "Próximo Mantenimiento"
  },
  "status": {
    "active": "Activa",
    "maintenance": "En Mantenimiento",
    "outOfService": "Fuera de Servicio",
    "retired": "Retirada"
  },
  "types": {
    "excavator": "Excavadora",
    "bulldozer": "Bulldozer",
    "crane": "Grúa",
    "loader": "Cargadora",
    "compactor": "Compactadora",
    "truck": "Camión",
    "generator": "Generador",
    "other": "Otros"
  },
  "filters": {
    "all": "Todas",
    "byType": "Por Tipo",
    "byStatus": "Por Estado",
    "byLocation": "Por Ubicación"
  },
  "messages": {
    "created": "Máquina creada exitosamente",
    "updated": "Máquina actualizada exitosamente",
    "deleted": "Máquina eliminada exitosamente",
    "maintenanceDue": "Mantenimiento vencido",
    "lowFuel": "Combustible bajo",
    "noMachines": "No hay máquinas registradas",
    "loadingMachines": "Cargando máquinas..."
  },
  "stats": {
    "total": "Total",
    "active": "Activas",
    "inMaintenance": "En Mantenimiento",
    "availability": "Disponibilidad",
    "efficiency": "Eficiencia",
    "avgHours": "Horas Promedio"
  }
}
```

## Hooks Personalizados

### `hooks.ts`
**Propósito**: Hooks personalizados para i18n

```typescript
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import type { TranslationKey } from './types';

// Hook principal para traducciones
export const useI18n = (namespace?: TranslationKey) => {
  const { t, i18n } = useTranslation(namespace);
  
  return {
    t,
    language: i18n.language,
    changeLanguage: i18n.changeLanguage,
    isRTL: i18n.dir() === 'rtl',
  };
};

// Hook para formateo de fechas localizadas
export const useDateFormat = () => {
  const { i18n } = useTranslation();
  
  return useMemo(() => ({
    formatDate: (date: Date | string, format: 'short' | 'medium' | 'long' = 'medium') => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      const options: Intl.DateTimeFormatOptions = {
        short: { day: '2-digit', month: '2-digit', year: 'numeric' },
        medium: { day: '2-digit', month: 'short', year: 'numeric' },
        long: { day: '2-digit', month: 'long', year: 'numeric' },
      }[format];
      
      return new Intl.DateTimeFormat(i18n.language, options).format(dateObj);
    },
    
    formatTime: (date: Date | string, includeSeconds = false) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        ...(includeSeconds && { second: '2-digit' }),
      };
      
      return new Intl.DateTimeFormat(i18n.language, options).format(dateObj);
    },
    
    formatDateTime: (date: Date | string) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      return new Intl.DateTimeFormat(i18n.language, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(dateObj);
    },
    
    formatRelative: (date: Date | string) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diffMs = now.getTime() - dateObj.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMins < 1) return 'time.justNow';
      if (diffMins < 60) return `time.minutesAgo`;
      if (diffHours < 24) return `time.hoursAgo`;
      if (diffDays < 7) return `time.daysAgo`;
      if (diffDays < 30) return `time.weeksAgo`;
      return `time.monthsAgo`;
    },
  }), [i18n.language]);
};

// Hook para formateo de números localizados
export const useNumberFormat = () => {
  const { i18n } = useTranslation();
  
  return useMemo(() => ({
    formatNumber: (num: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(i18n.language, options).format(num);
    },
    
    formatCurrency: (amount: number, currency = 'EUR') => {
      return new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency,
      }).format(amount);
    },
    
    formatPercentage: (num: number, decimals = 1) => {
      return new Intl.NumberFormat(i18n.language, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num / 100);
    },
    
    formatDecimal: (num: number, decimals = 2) => {
      return new Intl.NumberFormat(i18n.language, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num);
    },
  }), [i18n.language]);
};

// Hook para mensajes de formularios
export const useFormMessages = () => {
  const { t } = useTranslation(['forms', 'errors']);
  
  return {
    required: (field: string) => t('errors:validation.required', { field }),
    minLength: (field: string, min: number) => t('errors:validation.minLength', { field, min }),
    maxLength: (field: string, max: number) => t('errors:validation.maxLength', { field, max }),
    email: () => t('errors:validation.email'),
    password: () => t('errors:validation.password'),
    confirm: (field: string) => t('errors:validation.confirm', { field }),
    numeric: (field: string) => t('errors:validation.numeric', { field }),
    url: (field: string) => t('errors:validation.url', { field }),
  };
};

// Hook para detección de cambio de idioma
export const useLanguageChange = (callback: (language: string) => void) => {
  const { i18n } = useTranslation();
  
  useMemo(() => {
    const handleLanguageChange = (lng: string) => {
      callback(lng);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, callback]);
};
```

## Utilidades de Formateo

### `formatters.ts`
**Propósito**: Formatters personalizados para diferentes tipos de datos

```typescript
// Formatear duración en formato legible
export const formatDuration = (minutes: number, language = 'es'): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (language === 'es') {
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} h`;
    return `${hours} h ${mins} min`;
  } else {
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} h`;
    return `${hours} h ${mins} min`;
  }
};

// Formatear tamaño de archivo
export const formatFileSize = (bytes: number, language = 'es'): string => {
  const units = language === 'es' 
    ? ['bytes', 'KB', 'MB', 'GB'] 
    : ['bytes', 'KB', 'MB', 'GB'];
  
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

// Formatear rango de fechas
export const formatDateRange = (
  startDate: Date,
  endDate: Date,
  language = 'es'
): string => {
  const formatter = new Intl.DateTimeFormat(language, {
    day: '2-digit',
    month: 'short',
  });
  
  const start = formatter.format(startDate);
  const end = formatter.format(endDate);
  
  return `${start} - ${end}`;
};

// Formatear estado con color
export const formatStatus = (
  status: string,
  translations: Record<string, string>
): { label: string; color: string } => {
  const label = translations[status] || status;
  
  const colors: Record<string, string> = {
    active: 'success',
    inactive: 'muted',
    pending: 'warning',
    completed: 'success',
    cancelled: 'destructive',
    error: 'destructive',
  };
  
  return {
    label,
    color: colors[status.toLowerCase()] || 'muted',
  };
};
```

## Configuración de TypeScript

### Declaration Merging para i18next
```typescript
// types/i18next.d.ts
import 'react-i18next';
import type { TranslationResources } from '../i18n/resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: TranslationResources;
  }
}

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: TranslationResources;
  }
}
```

## Uso en Componentes

### Ejemplos de Uso
```typescript
// Uso básico
import { useI18n } from '@/i18n/hooks';

const Component = () => {
  const { t } = useI18n('machines');
  
  return (
    <div>
      <h1>{t('titles.machines')}</h1>
      <p>{t('messages.noMachines')}</p>
    </div>
  );
};

// Uso con interpolación
const MachineCard = ({ machine }: { machine: Machine }) => {
  const { t } = useI18n('machines');
  const { formatDate } = useDateFormat();
  
  return (
    <div>
      <h3>{machine.name}</h3>
      <p>{t('fields.lastMaintenance')}: {formatDate(machine.lastMaintenanceDate)}</p>
      <p>{t('messages.operatingHours', { hours: machine.operatingHours })}</p>
    </div>
  );
};

// Uso con pluralización
const NotificationCount = ({ count }: { count: number }) => {
  const { t } = useI18n('notifications');
  
  return (
    <span>
      {t('messages.unreadCount', { count })}
    </span>
  );
};
```

## Testing

### i18n Tests
```typescript
describe('i18n Configuration', () => {
  test('should load Spanish translations', async () => {
    await i18n.changeLanguage('es');
    expect(i18n.t('common:actions.save')).toBe('Guardar');
  });
  
  test('should handle pluralization', () => {
    expect(i18n.t('common:time.minutesAgo', { count: 1 })).toBe('1 minuto');
    expect(i18n.t('common:time.minutesAgo', { count: 5 })).toBe('5 minutos');
  });
  
  test('should format dates correctly', () => {
    const { formatDate } = useDateFormat();
    const date = new Date('2023-12-25');
    
    expect(formatDate(date, 'short')).toMatch(/25\/12\/2023/);
  });
});
```

## Mejores Prácticas

### 1. Organización de Keys
- Usar namespaces para organizar traducciones
- Keys descriptivos y jerarquizados
- Evitar duplicación de texto

### 2. Interpolación
- Usar interpolación para valores dinámicos
- Formatters para tipos de datos específicos
- Pluralización para conteos

### 3. Performance
- Lazy loading de namespaces
- Cachear traducciones en localStorage
- Minimizar re-renders por cambios de idioma

### 4. Mantenimiento
- Validar completitud de traducciones
- Scripts para detectar keys faltantes
- Documentar contexto de uso cuando sea necesario