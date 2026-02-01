/**
 * Date Formatting Utilities
 * 
 * Provides consistent date formatting across the application.
 * Supports both international (dd/mm/yyyy) and US (mm/dd/yyyy) formats.
 * Automatically detects user's locale for appropriate formatting.
 */

/**
 * Date format types
 */
export type DateFormat = 'international' | 'us' | 'iso';

/**
 * Date formatting options
 */
export interface DateFormatOptions {
  /**
   * Format type: 'international' (dd/mm/yyyy), 'us' (mm/dd/yyyy), or 'iso' (yyyy-mm-dd)
   * @default 'auto' - Uses browser locale to determine format
   */
  format?: DateFormat | 'auto';
  /**
   * Include time in the output
   * @default false
   */
  includeTime?: boolean;
  /**
   * Use 12-hour format (AM/PM) instead of 24-hour
   * @default false
   */
  use12Hour?: boolean;
  /**
   * Locale to use for formatting (e.g., 'en-US', 'es-ES')
   * @default Browser default locale
   */
  locale?: string;
}

/**
 * Detects if the user is in the US based on browser locale
 */
const isUSLocale = (): boolean => {
  const locale = navigator.language || navigator.languages?.[0] || 'en-US';
  return locale.startsWith('en-US');
};

/**
 * Formats a date according to the specified format
 * 
 * @param date - Date to format (Date object or ISO string)
 * @param options - Formatting options
 * @returns Formatted date string
 * 
 * @example
 * ```ts
 * formatDate(new Date('2024-01-15'))
 * // International: "15/01/2024"
 * // US: "01/15/2024"
 * 
 * formatDate(new Date(), { format: 'international' })
 * // "15/01/2024"
 * 
 * formatDate(new Date(), { format: 'us', includeTime: true })
 * // "01/15/2024, 2:30 PM"
 * ```
 */
export const formatDate = (
  date: Date | string,
  options: DateFormatOptions = {}
): string => {
  const {
    format = 'auto',
    includeTime = false,
    use12Hour = false,
    locale,
  } = options;

  // Convert string to Date if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Validate date
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDate:', date);
    return 'Invalid Date';
  }

  // Determine format
  let finalFormat: DateFormat;
  if (format === 'auto') {
    finalFormat = isUSLocale() ? 'us' : 'international';
  } else {
    finalFormat = format;
  }

  // Build Intl.DateTimeFormat options
  const intlOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  if (includeTime) {
    intlOptions.hour = '2-digit';
    intlOptions.minute = '2-digit';
    intlOptions.hour12 = use12Hour; // Explicitly set to ensure 24h when false
  }

  // Determine locale based on format
  let formatLocale = locale;
  if (!formatLocale) {
    switch (finalFormat) {
      case 'international':
        formatLocale = 'es-ES'; // dd/mm/yyyy
        break;
      case 'us':
        formatLocale = 'en-US'; // mm/dd/yyyy
        break;
      case 'iso':
        // Return ISO format directly
        const isoDate = dateObj.toISOString().split('T')[0];
        if (includeTime) {
          const time = dateObj.toISOString().split('T')[1].substring(0, 5);
          return `${isoDate} ${time}`;
        }
        return isoDate;
      default:
        formatLocale = navigator.language || 'es-ES';
    }
  }

  return new Intl.DateTimeFormat(formatLocale, intlOptions).format(dateObj);
};

/**
 * Formats a date in international format (dd/mm/yyyy)
 * 
 * @param date - Date to format
 * @param includeTime - Whether to include time
 * @returns Formatted date string
 * 
 * @example
 * ```ts
 * formatDateInternational(new Date('2024-01-15'))
 * // "15/01/2024"
 * ```
 */
export const formatDateInternational = (
  date: Date | string,
  includeTime = false
): string => {
  return formatDate(date, { format: 'international', includeTime });
};

/**
 * Formats a date in US format (mm/dd/yyyy)
 * 
 * @param date - Date to format
 * @param includeTime - Whether to include time
 * @returns Formatted date string
 * 
 * @example
 * ```ts
 * formatDateUS(new Date('2024-01-15'))
 * // "01/15/2024"
 * ```
 */
export const formatDateUS = (
  date: Date | string,
  includeTime = false
): string => {
  return formatDate(date, { format: 'us', includeTime });
};

/**
 * Formats a date in ISO format (yyyy-mm-dd)
 * 
 * @param date - Date to format
 * @param includeTime - Whether to include time
 * @returns Formatted date string
 * 
 * @example
 * ```ts
 * formatDateISO(new Date('2024-01-15'))
 * // "2024-01-15"
 * ```
 */
export const formatDateISO = (
  date: Date | string,
  includeTime = false
): string => {
  return formatDate(date, { format: 'iso', includeTime });
};

/**
 * Formats a date in a long format with month name
 * 
 * @param date - Date to format
 * @param locale - Locale for month names
 * @returns Formatted date string
 * 
 * @example
 * ```ts
 * formatDateLong(new Date('2024-01-15'), 'es-ES')
 * // "15 de enero de 2024"
 * 
 * formatDateLong(new Date('2024-01-15'), 'en-US')
 * // "January 15, 2024"
 * ```
 */
export const formatDateLong = (
  date: Date | string,
  locale?: string
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDateLong:', date);
    return 'Invalid Date';
  }

  const formatLocale = locale || navigator.language || 'es-ES';

  return new Intl.DateTimeFormat(formatLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

/**
 * Formats a date in a short format with abbreviated month
 * 
 * @param date - Date to format
 * @param locale - Locale for month names
 * @returns Formatted date string
 * 
 * @example
 * ```ts
 * formatDateShort(new Date('2024-01-15'), 'es-ES')
 * // "15 ene 2024"
 * 
 * formatDateShort(new Date('2024-01-15'), 'en-US')
 * // "Jan 15, 2024"
 * ```
 */
export const formatDateShort = (
  date: Date | string,
  locale?: string
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDateShort:', date);
    return 'Invalid Date';
  }

  const formatLocale = locale || navigator.language || 'es-ES';

  return new Intl.DateTimeFormat(formatLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
};

/**
 * Formats a time only (HH:mm or HH:mm:ss)
 * 
 * @param date - Date to extract time from
 * @param includeSeconds - Whether to include seconds
 * @param use12Hour - Use 12-hour format with AM/PM
 * @returns Formatted time string
 * 
 * @example
 * ```ts
 * formatTime(new Date('2024-01-15T14:30:45'))
 * // "14:30"
 * 
 * formatTime(new Date('2024-01-15T14:30:45'), true, true)
 * // "2:30:45 PM"
 * ```
 */
export const formatTime = (
  date: Date | string,
  includeSeconds = false,
  use12Hour = false
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatTime:', date);
    return 'Invalid Time';
  }

  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: use12Hour,
  };

  if (includeSeconds) {
    options.second = '2-digit';
  }

  return new Intl.DateTimeFormat(navigator.language || 'es-ES', options).format(
    dateObj
  );
};

/**
 * Formats a relative time (e.g., "2 days ago", "in 3 hours")
 * Note: This is a simple implementation. For production, consider using libraries like date-fns
 * 
 * @param date - Date to compare with current time
 * @param locale - Locale for text
 * @returns Formatted relative time string
 * 
 * @example
 * ```ts
 * formatRelativeTime(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
 * // "hace 2 días" (Spanish)
 * // "2 days ago" (English)
 * ```
 */
export const formatRelativeTime = (
  date: Date | string,
  locale?: string
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatRelativeTime:', date);
    return 'Invalid Date';
  }

  const formatLocale = locale || navigator.language || 'es-ES';
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const rtf = new Intl.RelativeTimeFormat(formatLocale, { numeric: 'auto' });

  if (Math.abs(diffSeconds) < 60) {
    return rtf.format(-diffSeconds, 'second');
  } else if (Math.abs(diffMinutes) < 60) {
    return rtf.format(-diffMinutes, 'minute');
  } else if (Math.abs(diffHours) < 24) {
    return rtf.format(-diffHours, 'hour');
  } else if (Math.abs(diffDays) < 30) {
    return rtf.format(-diffDays, 'day');
  } else if (Math.abs(diffMonths) < 12) {
    return rtf.format(-diffMonths, 'month');
  } else {
    return rtf.format(-diffYears, 'year');
  }
};
