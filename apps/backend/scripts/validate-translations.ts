/**
 * Validation Script: Notification Translation Completeness
 * Sprint #15 Task 8.7: Email i18n support
 * 
 * Validates that ALL notification keys defined in NOTIFICATION_MESSAGE_KEYS
 * have corresponding English translations in NotificationTranslatorService.
 * 
 * SSOT COMPLIANCE:
 * - Imports real NOTIFICATION_MESSAGE_KEYS from constants file
 * - Reads EN_TRANSLATIONS from NotificationTranslatorService source file
 * - No duplication of constants (fixes GitHub Copilot finding #5)
 * 
 * Run: cd apps/backend && npx tsx scripts/validate-translations.ts
 */

/// <reference types="node" />

import * as fs from 'fs';
import * as path from 'path';

// Import real SSOT (no inline duplicates)
import { NOTIFICATION_MESSAGE_KEYS } from '../src/constants/notification-messages.constants';

/**
 * Parse EN_TRANSLATIONS from NotificationTranslatorService source file
 * This avoids importing the service (which would load config)
 */
function parseTranslationsFromSource(): Record<string, string> {
  const servicePath = path.join(__dirname, '../src/services/i18n/notification-translator.service.ts');
  const sourceCode = fs.readFileSync(servicePath, 'utf-8');
  
  // Extract EN_TRANSLATIONS object
  const translationsMatch = sourceCode.match(/const EN_TRANSLATIONS: Record<string, string> = \{([\s\S]*?)\n\};/);
  
  if (!translationsMatch) {
    throw new Error('Could not parse EN_TRANSLATIONS from NotificationTranslatorService');
  }
  
  const translationsBlock = translationsMatch[1];
  const translations: Record<string, string> = {};
  
  // Parse each line: 'key': 'value',
  const lineRegex = /'([^']+)':\s*'([^']+(?:\\.[^']*)*)',?/g;
  let match;
  
  while ((match = lineRegex.exec(translationsBlock)) !== null) {
    const [, key, value] = match;
    translations[key] = value;
  }
  
  return translations;
}

/**
 * Extract all string values (keys) from NOTIFICATION_MESSAGE_KEYS object
 */
function extractAllKeys(obj: any, keys: string[] = []): string[] {
  for (const value of Object.values(obj)) {
    if (typeof value === 'string') {
      keys.push(value);
    } else if (typeof value === 'object' && value !== null) {
      extractAllKeys(value, keys);
    }
  }
  return keys;
}

/**
 * Main validation function
 */
function validateTranslationCompleteness() {
  console.log('🔍 Validating notification translations...\n');

  // Extract all notification keys from real SSOT
  const allDefinedKeys = extractAllKeys(NOTIFICATION_MESSAGE_KEYS);
  
  // Parse translations from source file (avoids config import)
  const translations = parseTranslationsFromSource();
  const allTranslationKeys = Object.keys(translations);
  
  console.log(`📊 Found ${allDefinedKeys.length} notification keys in NOTIFICATION_MESSAGE_KEYS`);
  console.log(`📚 Found ${allTranslationKeys.length} translations in NotificationTranslatorService\n`);

  // Track validation results
  const missingTranslations: string[] = [];
  const orphanedTranslations: string[] = [];
  
  // Verify each key has a translation
  for (const key of allDefinedKeys) {
    if (!translations[key]) {
      missingTranslations.push(key);
    }
  }
  
  // Check for orphaned translations (translations without corresponding keys)
  const definedKeysSet = new Set(allDefinedKeys);
  for (const translationKey of allTranslationKeys) {
    if (!definedKeysSet.has(translationKey)) {
      orphanedTranslations.push(translationKey);
    }
  }

  // Report missing translations
  if (missingTranslations.length > 0) {
    console.error('❌ VALIDATION FAILED\n');
    console.error(`Missing English translations for ${missingTranslations.length} notification key(s):\n`);
    missingTranslations.forEach(key => {
      console.error(`  ❌ ${key}`);
    });
    console.error('\n💡 Add these translations to NotificationTranslatorService.EN_TRANSLATIONS');
    console.error('   to match apps/frontend/src/i18n/locales/en.json\n');
    process.exit(1);
  }
  
  // Report orphaned translations (warnings only, don't fail)
  if (orphanedTranslations.length > 0) {
    console.warn('⚠️  Found orphaned translations (no corresponding keys):\n');
    orphanedTranslations.forEach(key => {
      console.warn(`  ⚠️  ${key}`);
    });
    console.warn('\n💡 These translations exist but have no corresponding key in NOTIFICATION_MESSAGE_KEYS');
    console.warn('   Consider removing them or adding the corresponding constants.\n');
  }

  // Success
  console.log('✅ VALIDATION PASSED\n');
  console.log('✨ All notification keys have corresponding English translations\n');
  
  // Show sample translations
  console.log('📝 Sample Translations:\n');
  const sampleKeys = [
    { key: 'notification.quickcheck.completed.approved', label: 'QuickCheck Approved' },
    { key: 'notification.machine.created', label: 'Machine Created' },
    { key: 'notification.maintenance.alarmTriggered', label: 'Maintenance Alarm' },
    { key: 'notification.system.welcome', label: 'System Welcome' }
  ];
  
  for (const { key, label } of sampleKeys) {
    const translation = translations[key] || key;
    console.log(`  ${label}: "${translation}"`);
  }

  console.log('\n✅ Translation system ready for production!\n');
  process.exit(0);
}

// Run validation
validateTranslationCompleteness();
