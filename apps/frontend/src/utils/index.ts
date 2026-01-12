/**
 * Truncate text to a maximum length with ellipsis
 * 
 * Intelligently truncates text at the nearest word boundary to avoid
 * cutting words in half. Useful for displaying long names in toasts,
 * notifications, and UI elements with space constraints.
 * 
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation (default: 35 for toasts)
 * @returns Truncated text with "..." if it exceeds maxLength
 * 
 * @example
 * ```ts
 * truncateText("Very Long Company Name Here", 20);
 * // => "Very Long Company..."
 * 
 * truncateText("Short Name", 30);
 * // => "Short Name" (no truncation)
 * ```
 */
export const truncateText = (text: string, maxLength: number = 35): string => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  // Truncate at maxLength
  let truncated = text.slice(0, maxLength);
  
  // Try to cut at the last complete word (find last space)
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  // Only cut at word boundary if we found a space and it's not too early
  // (avoid cutting too early like "Very..." when we could fit "Very Long...")
  if (lastSpaceIndex > maxLength * 0.6) {
    truncated = truncated.slice(0, lastSpaceIndex);
  }
  
  return `${truncated.trim()}...`;
};

// Date utilities
export const formatDate = (date: string | Date, locale: string = 'es-ES'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date, locale: string = 'es-ES'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date: string | Date, locale: string = 'es-ES'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRelativeTime = (date: string | Date, locale: string = 'es-ES'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  if (diffInHours < 1) {
    return locale === 'es-ES' ? 'Hace menos de una hora' : 'Less than an hour ago';
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return locale === 'es-ES' 
      ? `Hace ${hours} hora${hours > 1 ? 's' : ''}`
      : `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    const days = Math.floor(diffInDays);
    return locale === 'es-ES'
      ? `Hace ${days} día${days > 1 ? 's' : ''}`
      : `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateObj, locale);
  }
};

export const isDateOverdue = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
};

export const addDays = (date: string | Date, days: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

export const addHours = (date: string | Date, hours: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setHours(dateObj.getHours() + hours);
  return dateObj;
};

// String utilities
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9 -]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing -
};

export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

// Number utilities
export const formatCurrency = (amount: number, currency: string = 'EUR', locale: string = 'es-ES'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatNumber = (num: number, locale: string = 'es-ES'): string => {
  return new Intl.NumberFormat(locale).format(num);
};

export const formatHours = (hours: number, locale: string = 'es-ES'): string => {
  const suffix = locale === 'es-ES' ? 'h' : 'h';
  return `${formatNumber(hours, locale)}${suffix}`;
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Storage utilities
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Async retry utility
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

// URL utilities
export const buildUrl = (base: string, params: Record<string, any>): string => {
  const url = new URL(base);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  
  return url.toString();
};

// File utilities
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

// Color utilities
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${[r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
};