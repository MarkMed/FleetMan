# Config Directory

## Propósito
Contiene archivos de configuración centralizados para la aplicación frontend. Gestiona configuraciones de entorno, constantes de la aplicación y settings que pueden variar entre desarrollo, testing y producción.

## Tipos de Configuración

### 1. **Environment Config** - Configuración de Entorno
### 2. **App Config** - Configuración de la Aplicación
### 3. **Feature Flags** - Banderas de Características
### 4. **API Config** - Configuración de APIs
### 5. **Build Config** - Configuración de Build

## Estructura de Archivos

```
config/
├── index.ts              # ✅ Barrel exports y configuración principal
├── env.config.ts         # Configuración de variables de entorno
├── app.config.ts         # Configuración general de la aplicación
├── api.config.ts         # Configuración de endpoints y APIs
├── features.config.ts    # Feature flags y configuraciones de características
├── theme.config.ts       # Configuración de tema y estilos
├── routing.config.ts     # Configuración de rutas
├── cache.config.ts       # Configuración de caché
├── validation.config.ts  # Configuración de validaciones
├── monitoring.config.ts  # Configuración de monitoreo y analytics
├── security.config.ts    # Configuración de seguridad
└── environments/
    ├── development.ts    # Config específica de desarrollo
    ├── staging.ts        # Config específica de staging
    ├── production.ts     # Config específica de producción
    └── testing.ts        # Config específica de testing
```

## Configuraciones Principales

### `env.config.ts`
**Propósito**: Manejo centralizado de variables de entorno

```typescript
import { z } from 'zod';

// Schema para validar variables de entorno
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']),
  VITE_API_BASE_URL: z.string().url('API URL must be valid'),
  VITE_API_VERSION: z.string().default('v1'),
  VITE_APP_NAME: z.string().default('FleetMan'),
  VITE_APP_VERSION: z.string().default('1.0.0'),
  VITE_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  VITE_ENABLE_DEVTOOLS: z.string().transform(val => val === 'true').default('false'),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_GOOGLE_ANALYTICS_ID: z.string().optional(),
  VITE_MAPS_API_KEY: z.string().optional(),
  VITE_WEBSOCKET_URL: z.string().url().optional(),
  VITE_STORAGE_BUCKET: z.string().optional(),
  VITE_CDN_URL: z.string().url().optional(),
});

type EnvConfig = z.infer<typeof envSchema>;

// Validar y exportar configuración
function createEnvConfig(): EnvConfig {
  const env = {
    NODE_ENV: import.meta.env.NODE_ENV,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_API_VERSION: import.meta.env.VITE_API_VERSION,
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
    VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
    VITE_ENABLE_DEVTOOLS: import.meta.env.VITE_ENABLE_DEVTOOLS,
    VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    VITE_GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
    VITE_MAPS_API_KEY: import.meta.env.VITE_MAPS_API_KEY,
    VITE_WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL,
    VITE_STORAGE_BUCKET: import.meta.env.VITE_STORAGE_BUCKET,
    VITE_CDN_URL: import.meta.env.VITE_CDN_URL,
  };

  const result = envSchema.safeParse(env);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    throw new Error('Invalid environment configuration');
  }

  return result.data;
}

export const envConfig = createEnvConfig();

// Helper para verificar entorno
export const isDevelopment = envConfig.NODE_ENV === 'development';
export const isProduction = envConfig.NODE_ENV === 'production';
export const isStaging = envConfig.NODE_ENV === 'staging';
export const isTesting = envConfig.NODE_ENV === 'test';
```

### `app.config.ts`
**Propósito**: Configuración general de la aplicación

```typescript
import { envConfig } from './env.config';

export const appConfig = {
  // Información básica
  name: envConfig.VITE_APP_NAME,
  version: envConfig.VITE_APP_VERSION,
  description: 'Sistema de gestión de flota de máquinas',
  
  // Configuración de UI
  ui: {
    defaultLanguage: 'es' as const,
    supportedLanguages: ['es', 'en'] as const,
    defaultTheme: 'light' as const,
    themes: ['light', 'dark', 'system'] as const,
    
    // Layout
    sidebar: {
      defaultWidth: 280,
      minWidth: 240,
      maxWidth: 400,
      collapsedWidth: 80,
    },
    
    // Animaciones
    animations: {
      enabled: true,
      duration: 200,
      easing: 'ease-in-out',
    },
    
    // Breakpoints (matching Tailwind)
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  
  // Configuración de funcionalidades
  features: {
    enableOfflineMode: true,
    enablePushNotifications: true,
    enableRealTimeUpdates: true,
    enableFileUpload: true,
    enableExport: true,
    enableAdvancedSearch: true,
    enableAuditLog: true,
    maxFileUploadSize: 10 * 1024 * 1024, // 10MB
    maxFilesPerUpload: 5,
  },
  
  // Configuración de paginación
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    maxPageSize: 100,
  },
  
  // Configuración de caché
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutos
    maxEntries: 100,
    enablePersistence: true,
  },
  
  // Configuración de validación
  validation: {
    debounceTime: 300,
    showErrorsOnBlur: true,
    showErrorsOnChange: false,
  },
  
  // Configuración de formularios
  forms: {
    autoSave: {
      enabled: true,
      interval: 30000, // 30 segundos
    },
    confirmation: {
      requireOnDelete: true,
      requireOnBulkActions: true,
    },
  },
  
  // Configuración de notificaciones
  notifications: {
    defaultDuration: 5000,
    maxVisible: 5,
    position: 'top-right' as const,
    enableSound: false,
  },
  
  // Configuración de sesión
  session: {
    timeoutWarning: 5 * 60 * 1000, // 5 minutos antes de expirar
    maxIdleTime: 30 * 60 * 1000,   // 30 minutos
    refreshThreshold: 10 * 60 * 1000, // 10 minutos
  },
  
  // Configuración de desarrollo
  development: {
    enableDevTools: envConfig.VITE_ENABLE_DEVTOOLS,
    enableMockData: false,
    enableHotReload: true,
    logLevel: envConfig.VITE_LOG_LEVEL,
  },
} as const;

export type AppConfig = typeof appConfig;
```

### `api.config.ts`
**Propósito**: Configuración de APIs y endpoints

```typescript
import { envConfig } from './env.config';

export const apiConfig = {
  // Base configuration
  baseURL: envConfig.VITE_API_BASE_URL,
  version: envConfig.VITE_API_VERSION,
  timeout: 30000, // 30 segundos
  
  // Endpoints
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      register: '/auth/register',
      refresh: '/auth/refresh',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password',
      profile: '/auth/profile',
    },
    
    machines: {
      base: '/machines',
      search: '/machines/search',
      types: '/machine-types',
      upload: '/machines/:id/upload',
      export: '/machines/export',
    },
    
    maintenance: {
      base: '/maintenance',
      schedule: '/maintenance/schedule',
      history: '/maintenance/history',
      stats: '/maintenance/stats',
    },
    
    quickCheck: {
      base: '/quick-checks',
      templates: '/quick-check-templates',
      stats: '/quick-checks/stats',
    },
    
    notifications: {
      base: '/notifications',
      settings: '/notification-settings',
      markRead: '/notifications/:id/read',
      markAllRead: '/notifications/read-all',
    },
    
    users: {
      base: '/users',
      profile: '/users/profile',
      permissions: '/users/permissions',
    },
    
    reports: {
      base: '/reports',
      generate: '/reports/generate',
      download: '/reports/:id/download',
    },
    
    uploads: {
      images: '/uploads/images',
      documents: '/uploads/documents',
    },
  },
  
  // Request configuration
  request: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    
    retry: {
      attempts: 3,
      delay: 1000, // ms
      backoff: 'exponential' as const,
    },
    
    cache: {
      enabled: true,
      ttl: 5 * 60 * 1000, // 5 minutos
      methods: ['GET'] as const,
    },
  },
  
  // Response configuration
  response: {
    timeout: 30000,
    validateStatus: (status: number) => status >= 200 && status < 300,
  },
  
  // Error handling
  errors: {
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    timeoutStatusCode: 408,
    networkErrorCode: 'NETWORK_ERROR',
  },
  
  // WebSocket configuration
  websocket: {
    url: envConfig.VITE_WEBSOCKET_URL,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000,
  },
} as const;

export type ApiConfig = typeof apiConfig;
```

### `features.config.ts`
**Propósito**: Feature flags y configuración de características

```typescript
import { envConfig, isDevelopment, isProduction } from './env.config';

export const featuresConfig = {
  // Características principales
  auth: {
    enableRegistration: true,
    enableSocialLogin: false,
    enableTwoFactor: false,
    enablePasswordReset: true,
    passwordComplexity: 'medium' as const, // low, medium, high
  },
  
  machines: {
    enableBulkOperations: true,
    enableImageUpload: true,
    enableQRCodeGeneration: true,
    enableLocationTracking: false,
    enableAdvancedFilters: true,
    maxImagesPerMachine: 10,
  },
  
  maintenance: {
    enablePredictiveMaintenance: false,
    enableCalendarView: true,
    enableRecurringSchedules: true,
    enableMaintenanceTemplates: true,
    enableCostTracking: true,
    enablePartsInventory: false,
  },
  
  quickCheck: {
    enablePhotoCapture: true,
    enableOfflineMode: true,
    enableCustomChecklists: true,
    enableDigitalSignature: false,
    enableVoiceNotes: false,
  },
  
  notifications: {
    enablePushNotifications: true,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    enableSlackIntegration: false,
    enableRealTimeAlerts: true,
  },
  
  reporting: {
    enableAdvancedReports: true,
    enableScheduledReports: false,
    enableCustomReports: true,
    enableDataExport: true,
    supportedFormats: ['PDF', 'Excel', 'CSV'] as const,
  },
  
  integrations: {
    enableMapsIntegration: Boolean(envConfig.VITE_MAPS_API_KEY),
    enableAnalytics: envConfig.VITE_ENABLE_ANALYTICS,
    enableErrorTracking: Boolean(envConfig.VITE_SENTRY_DSN),
    enableFileStorage: Boolean(envConfig.VITE_STORAGE_BUCKET),
  },
  
  // Características experimentales (solo en desarrollo)
  experimental: {
    enableAIAssistant: isDevelopment,
    enableDarkMode: true,
    enableAdvancedSearch: isDevelopment,
    enableBetaFeatures: isDevelopment,
    enablePerformanceMonitoring: !isProduction,
  },
  
  // Límites y restricciones
  limits: {
    maxMachinesPerUser: isProduction ? 1000 : 100,
    maxFileSizeUpload: 10 * 1024 * 1024, // 10MB
    maxConcurrentUploads: 3,
    maxNotificationHistory: 100,
    sessionTimeout: 30 * 60 * 1000, // 30 minutos
  },
  
  // UI Features
  ui: {
    enableAnimations: true,
    enableTooltips: true,
    enableKeyboardShortcuts: true,
    enableDragAndDrop: true,
    enableVirtualization: true, // Para listas grandes
    enableLazyLoading: true,
  },
  
  // Performance features
  performance: {
    enableCodeSplitting: true,
    enableImageOptimization: true,
    enableCaching: true,
    enablePreloading: true,
    enableServiceWorker: isProduction,
  },
} as const;

// Helper para verificar si una feature está habilitada
export const isFeatureEnabled = (feature: string): boolean => {
  const keys = feature.split('.');
  let current: any = featuresConfig;
  
  for (const key of keys) {
    current = current[key];
    if (current === undefined) {
      return false;
    }
  }
  
  return Boolean(current);
};

// Helper para obtener configuración de feature
export const getFeatureConfig = <T>(feature: string): T | undefined => {
  const keys = feature.split('.');
  let current: any = featuresConfig;
  
  for (const key of keys) {
    current = current[key];
    if (current === undefined) {
      return undefined;
    }
  }
  
  return current as T;
};

export type FeaturesConfig = typeof featuresConfig;
```

### `theme.config.ts`
**Propósito**: Configuración de temas y estilos

```typescript
export const themeConfig = {
  // Colores del sistema
  colors: {
    // Primary brand colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a',
    },
    
    // Secondary colors
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      500: '#64748b',
      600: '#475569',
      900: '#0f172a',
    },
    
    // Status colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      900: '#14532d',
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      900: '#78350f',
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      900: '#7f1d1d',
    },
    
    info: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      500: '#0ea5e9',
      600: '#0284c7',
      900: '#0c4a6e',
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  // Border radius
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  
  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  
  // Animation
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
  
  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
  
  // Component-specific configs
  components: {
    button: {
      sizes: {
        sm: { padding: '0.5rem 0.75rem', fontSize: '0.875rem' },
        md: { padding: '0.75rem 1rem', fontSize: '1rem' },
        lg: { padding: '1rem 1.5rem', fontSize: '1.125rem' },
      },
    },
    
    input: {
      sizes: {
        sm: { padding: '0.5rem', fontSize: '0.875rem' },
        md: { padding: '0.75rem', fontSize: '1rem' },
        lg: { padding: '1rem', fontSize: '1.125rem' },
      },
    },
    
    card: {
      padding: '1.5rem',
      borderRadius: '0.5rem',
      border: '1px solid',
    },
  },
} as const;

export type ThemeConfig = typeof themeConfig;
```

## Configuración por Entorno

### `environments/production.ts`
```typescript
export const productionConfig = {
  api: {
    timeout: 15000,
    retryAttempts: 2,
    enableCache: true,
  },
  
  logging: {
    level: 'warn',
    enableConsole: false,
    enableRemote: true,
  },
  
  features: {
    enableDevTools: false,
    enableMockData: false,
    enableDebugMode: false,
  },
  
  performance: {
    enableLazyLoading: true,
    enableCodeSplitting: true,
    enableServiceWorker: true,
  },
} as const;
```

### `environments/development.ts`
```typescript
export const developmentConfig = {
  api: {
    timeout: 60000,
    retryAttempts: 1,
    enableCache: false,
  },
  
  logging: {
    level: 'debug',
    enableConsole: true,
    enableRemote: false,
  },
  
  features: {
    enableDevTools: true,
    enableMockData: true,
    enableDebugMode: true,
  },
  
  performance: {
    enableLazyLoading: false,
    enableCodeSplitting: false,
    enableServiceWorker: false,
  },
} as const;
```

## Usage Patterns

### Accessing Configuration
```typescript
// En componentes
import { appConfig, apiConfig, featuresConfig } from '@/config';

// Verificar feature flags
if (isFeatureEnabled('machines.enableBulkOperations')) {
  // Mostrar bulk operations
}

// Usar configuración de API
const endpoint = `${apiConfig.baseURL}${apiConfig.endpoints.machines.base}`;

// Usar configuración de UI
const sidebarWidth = appConfig.ui.sidebar.defaultWidth;
```

### Environment-specific Configuration
```typescript
// Cargar config específica del entorno
import { envConfig, isDevelopment } from '@/config/env.config';

if (isDevelopment) {
  // Configuración de desarrollo
}
```

## Validación y Seguridad

### Validación de Configuración
```typescript
// Todas las configs deben ser validadas con Zod
const configSchema = z.object({
  // schema definition
});

export const config = configSchema.parse(rawConfig);
```

### Secrets Management
```typescript
// NUNCA incluir secrets en el código
// Usar variables de entorno para datos sensibles
const apiKey = envConfig.VITE_MAPS_API_KEY; // ✅ Correcto
const hardcodedKey = 'sk-12345'; // ❌ Incorrecto
```

## Testing

### Configuration Tests
```typescript
describe('Config Validation', () => {
  test('should validate environment config', () => {
    expect(() => createEnvConfig()).not.toThrow();
  });
  
  test('should have required API endpoints', () => {
    expect(apiConfig.endpoints.auth.login).toBeDefined();
    expect(apiConfig.endpoints.machines.base).toBeDefined();
  });
});
```