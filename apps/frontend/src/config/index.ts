// Environment configuration
console.log('🔍 Debug - VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('🔍 Debug - MODE:', import.meta.env.MODE);

export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'FleetMan',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.MODE || 'development',
  
  // Feature flags
  FEATURES: {
    NOTIFICATIONS: import.meta.env.VITE_FEATURE_NOTIFICATIONS !== 'false',
    SPARE_PARTS: import.meta.env.VITE_FEATURE_SPARE_PARTS === 'true',
    MESSAGING: import.meta.env.VITE_FEATURE_MESSAGING === 'true',
    SEARCH: import.meta.env.VITE_FEATURE_SEARCH === 'true',
  },

  // UI Configuration
  UI: {
    ITEMS_PER_PAGE: 10,
    TOAST_DURATION: 4000,
    DEBOUNCE_DELAY: 300,
  },

  // API Configuration
  API: {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },

  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'fleetman_auth_token',
    REFRESH_TOKEN: 'fleetman_refresh_token',
    USER: 'fleetman_user',
    LANGUAGE: 'fleetman_language',
    THEME: 'fleetman_theme',
  },
} as const;

// Debug final config
console.log('🎯 Final API_BASE_URL:', config.API_BASE_URL);

export type Config = typeof config;