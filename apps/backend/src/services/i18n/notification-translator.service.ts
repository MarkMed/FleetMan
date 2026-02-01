/**
 * Backend Notification Translator Service
 * Sprint #15 Task 8.7: Email i18n support
 * 
 * Translates notification i18n keys to English messages with variable interpolation.
 * 
 * SSOT: Translations match frontend en.json (apps/frontend/src/i18n/locales/en.json)
 * Keys defined in: apps/backend/src/constants/notification-messages.constants.ts
 * 
 * @example
 * translate('notification.machine.created', { 
 *   machineType: 'Excavator', 
 *   brand: 'CAT', 
 *   serialNumber: '12345' 
 * })
 * // Returns: "Machine Registered! Excavator CAT 12345"
 */

import { logger } from '../../config/logger.config';

interface TranslationContext {
  [key: string]: string | number | boolean | undefined;
}

/**
 * English translations for notification messages
 * 
 * Structure mirrors notification-messages.constants.ts
 * Content matches apps/frontend/src/i18n/locales/en.json
 */
const EN_TRANSLATIONS: Record<string, string> = {
  // QuickCheck notifications
  'notification.quickcheck.completed.approved': 
    'Machine {{machineName}} approved by {{responsibleName}}',
  'notification.quickcheck.completed.disapproved': 
    'Machine {{machineName}} disapproved by {{responsibleName}}',
  'notification.quickcheck.completed.notInitiated': 
    'Machine {{machineName}} not initiated by {{responsibleName}}',
  'notification.quickcheck.created': 
    'New QuickCheck created for machine {{machineName}}',
  'notification.quickcheck.assigned': 
    'QuickCheck assigned to {{userName}} for machine {{machineName}}',

  // Machine notifications
  'notification.machine.created': 
    'Machine Registered! {{machineType}} {{brand}} {{serialNumber}}',
  'notification.machine.updated': 
    'Machine {{machineName}} updated',
  'notification.machine.deleted': 
    'Machine {{machineName}} deleted',
  'notification.machine.statusChanged': 
    'Machine {{machineName}} status changed to {{status}}',

  // Machine event notifications
  'notification.machine.event.maintenanceStarted': 
    'Maintenance started on machine {{machineName}}',
  'notification.machine.event.maintenanceCompleted': 
    'Maintenance completed on machine {{machineName}}',
  'notification.machine.event.maintenanceCancelled': 
    'Maintenance cancelled on machine {{machineName}}',
  'notification.machine.event.sparePartAdded': 
    'Spare part added to machine {{machineName}}',
  'notification.machine.event.sparePartRemoved': 
    'Spare part removed from machine {{machineName}}',
  'notification.machine.event.documentUploaded': 
    'Document uploaded for machine {{machineName}}',
  'notification.machine.event.documentDeleted': 
    'Document deleted from machine {{machineName}}',
  'notification.machine.event.operatorAssigned': 
    'Operator {{userName}} assigned to machine {{machineName}}',
  'notification.machine.event.operatorUnassigned': 
    'Operator {{userName}} unassigned from machine {{machineName}}',
  'notification.machine.event.breakdown': 
    'Machine {{machineName}} out of service',
  'notification.machine.event.breakdownResolved': 
    'Machine {{machineName}} operational again',

  // Maintenance notifications
  'notification.maintenance.scheduled': 
    'Maintenance scheduled for machine {{machineName}} on {{date}}',
  'notification.maintenance.reminder': 
    'Reminder: Maintenance for machine {{machineName}} in {{hours}} hours',
  'notification.maintenance.overdue': 
    'Maintenance overdue for machine {{machineName}}',
  'notification.maintenance.completed': 
    'Maintenance completed on machine {{machineName}}',
  'notification.maintenance.cancelled': 
    'Maintenance cancelled for machine {{machineName}}',
  'notification.maintenance.rescheduled': 
    'Maintenance rescheduled for machine {{machineName}}',
  'notification.maintenance.alarmTriggered': 
    '⚠️ {{alarmTitle}}',
  'notification.maintenance.alarmTriggered.description': 
    'Machine {{machineName}} reached {{accumulatedHours}} operating hours. ' +
    'Maintenance required every {{intervalHours}} hours. ' +
    'Related parts: {{relatedParts}}',

  // User notifications
  'notification.user.assigned': 
    'You have been assigned to {{taskType}}',
  'notification.user.unassigned': 
    'You have been unassigned from {{taskType}}',
  'notification.user.roleChanged': 
    'Your role has changed to {{roleName}}',
  'notification.user.permissionsChanged': 
    'Your permissions have been updated',

  // System notifications
  'notification.system.welcome': 
    'Welcome to FleetMan, {{userName}}',
  'notification.system.passwordChanged': 
    'Your password has been successfully updated',
  'notification.system.accountUpdated': 
    'Your account has been updated',
  'notification.system.dataExported': 
    'Your data has been exported successfully',
  'notification.system.reportGenerated': 
    'Report {{reportName}} generated successfully'
};

/**
 * NotificationTranslatorService
 * 
 * Provides translation of notification i18n keys to English messages
 * with Handlebars-style {{variable}} interpolation.
 */
export class NotificationTranslatorService {
  /**
   * Translate notification key to English message with variable interpolation
   * 
   * Supports Handlebars-style interpolation: {{variableName}}
   * Falls back to raw key if translation not found (logs warning)
   * 
   * @param key - i18n key (e.g., 'notification.machine.created')
   * @param context - Variables for interpolation (e.g., { machineName: 'Excavator 001' })
   * @returns Translated and interpolated message in English
   * 
   * @example
   * translate('notification.machine.created', {
   *   machineType: 'Excavator',
   *   brand: 'CAT',
   *   serialNumber: '12345'
   * })
   * // Returns: "Machine Registered! Excavator CAT 12345"
   * 
   * @example
   * translate('notification.quickcheck.completed.approved', {
   *   machineName: 'Blue Chariot',
   *   responsibleName: 'John Doe'
   * })
   * // Returns: "Machine Blue Chariot approved by John Doe"
   */
  public static translate(
    key: string,
    context: TranslationContext = {}
  ): string {
    const template = EN_TRANSLATIONS[key];
    
    if (!template) {
      logger.warn({ 
        key, 
        availableKeys: Object.keys(EN_TRANSLATIONS).length 
      }, 'Translation key not found - returning raw key as fallback');
      return key; // Fallback to raw key
    }

    // Simple Handlebars-style interpolation: {{variable}}
    // Matches all occurrences of {{word}} and replaces with context value
    const interpolated = template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      const value = context[varName];
      
      // If variable not found in context, keep placeholder
      if (value === undefined || value === null) {
        logger.debug({ key, varName }, 'Variable not found in context - keeping placeholder');
        return match;
      }
      
      return String(value);
    });

    return interpolated;
  }

  /**
   * Check if a translation exists for a given key
   * 
   * Useful for validation and testing
   * 
   * @param key - i18n key to check
   * @returns true if translation exists, false otherwise
   * 
   * @example
   * hasTranslation('notification.machine.created') // true
   * hasTranslation('notification.unknown.key')     // false
   */
  public static hasTranslation(key: string): boolean {
    return key in EN_TRANSLATIONS;
  }

  /**
   * Get all available translation keys
   * 
   * Useful for validation and testing
   * 
   * @returns Array of all registered translation keys
   * 
   * @example
   * const allKeys = NotificationTranslatorService.getAllKeys();
   * console.log(`Total translations: ${allKeys.length}`);
   */
  public static getAllKeys(): string[] {
    return Object.keys(EN_TRANSLATIONS);
  }

  // =============================================================================
  // 🔮 STRATEGIC FEATURES (Commented for future implementation)
  // =============================================================================

  /**
   * TODO (Sprint #16+): Multi-language Support
   * 
   * Add Spanish translations and language parameter
   * 
   * @example
   * private static readonly ES_TRANSLATIONS: Record<string, string> = {
   *   'notification.machine.created': '¡Máquina Registrada! {{machineType}} {{brand}} {{serialNumber}}',
   *   // ... all other keys
   * };
   * 
   * public static translate(
   *   key: string,
   *   context: TranslationContext = {},
   *   language: 'en' | 'es' = 'en'
   * ): string {
   *   const translations = language === 'es' ? this.ES_TRANSLATIONS : EN_TRANSLATIONS;
   *   // ... rest of logic
   * }
   */

  /**
   * TODO (Sprint #16+): User Language Preference
   * 
   * Add preferredLanguage field to User entity and use in translation
   * 
   * @example
   * // In User entity (packages/domain/src/models/index.ts):
   * export interface IUserProfile {
   *   // ... existing fields ...
   *   readonly preferredLanguage?: 'en' | 'es'; // Default: 'es'
   * }
   * 
   * // Helper method:
   * public static getUserLanguage(user: User): 'en' | 'es' {
   *   return (user.toPublicData().profile?.preferredLanguage as 'en' | 'es') || 'es';
   * }
   * 
   * // Usage in AddNotificationUseCase:
   * const userLanguage = NotificationTranslatorService.getUserLanguage(user);
   * const translatedMessage = NotificationTranslatorService.translate(
   *   notification.message,
   *   notification.metadata,
   *   userLanguage
   * );
   */

  /**
   * TODO (Sprint #17+): Translation Caching
   * 
   * Cache interpolated translations to improve performance
   * 
   * @example
   * private static translationCache = new Map<string, string>();
   * 
   * public static translate(key: string, context: TranslationContext = {}): string {
   *   const cacheKey = `${key}:${JSON.stringify(context)}`;
   *   if (this.translationCache.has(cacheKey)) {
   *     return this.translationCache.get(cacheKey)!;
   *   }
   *   // ... perform translation
   *   this.translationCache.set(cacheKey, result);
   *   return result;
   * }
   */

  /**
   * TODO (Sprint #18+): Advanced Interpolation
   * 
   * Support plural forms, date formatting, and nested variables
   * 
   * @example
   * // Plural forms:
   * '{{count}} machine(s) updated' → "1 machine updated" / "5 machines updated"
   * 
   * // Date formatting:
   * 'Scheduled for {{date|format:YYYY-MM-DD}}' → "Scheduled for 2026-01-30"
   * 
   * // Nested objects:
   * 'Assigned to {{user.name}} ({{user.email}})' → "Assigned to John Doe (john@example.com)"
   */

  /**
   * TODO (Sprint #19+): Translation from Shared Package
   * 
   * Move translations to packages/shared for use by both frontend and backend
   * 
   * @example
   * // packages/shared/src/i18n/translations.ts
   * export const NOTIFICATION_TRANSLATIONS = {
   *   en: { ... },
   *   es: { ... }
   * };
   * 
   * // Import in backend:
   * import { NOTIFICATION_TRANSLATIONS } from '@packages/shared';
   */
}
