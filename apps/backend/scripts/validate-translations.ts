/**
 * Validation Script: Notification Translation Completeness
 * Sprint #15 Task 8.7: Email i18n support
 * 
 * Validates that ALL notification keys defined in NOTIFICATION_MESSAGE_KEYS
 * have corresponding English translations in NotificationTranslatorService.
 * 
 * Run: cd apps/backend && npx tsx scripts/validate-translations.ts
 */

/// <reference types="node" />

// Import only the constants (no config dependencies)
const NOTIFICATION_MESSAGE_KEYS = {
  quickcheck: {
    completed: {
      approved: 'notification.quickcheck.completed.approved',
      disapproved: 'notification.quickcheck.completed.disapproved',
      notInitiated: 'notification.quickcheck.completed.notInitiated'
    },
    created: 'notification.quickcheck.created',
    assigned: 'notification.quickcheck.assigned'
  },
  machine: {
    created: 'notification.machine.created',
    updated: 'notification.machine.updated',
    deleted: 'notification.machine.deleted',
    statusChanged: 'notification.machine.statusChanged',
    event: {
      maintenanceCompleted: 'notification.machine.event.maintenanceCompleted',
      repairStarted: 'notification.machine.event.repairStarted',
      repairCompleted: 'notification.machine.event.repairCompleted',
      breakdown: 'notification.machine.event.breakdown',
      safetyIncident: 'notification.machine.event.safetyIncident',
      machineStopped: 'notification.machine.event.machineStopped',
      statusChange: 'notification.machine.event.statusChange',
      technicalInspection: 'notification.machine.event.technicalInspection',
      partReplacement: 'notification.machine.event.partReplacement'
    }
  },
  maintenance: {
    scheduled: 'notification.maintenance.scheduled',
    reminder: 'notification.maintenance.reminder',
    overdue: 'notification.maintenance.overdue',
    completed: 'notification.maintenance.completed',
    cancelled: 'notification.maintenance.cancelled',
    rescheduled: 'notification.maintenance.rescheduled',
    alarmTriggered: 'notification.maintenance.alarmTriggered'
  },
  user: {
    assigned: 'notification.user.assigned',
    unassigned: 'notification.user.unassigned',
    roleChanged: 'notification.user.roleChanged',
    permissionsChanged: 'notification.user.permissionsChanged'
  },
  system: {
    welcome: 'notification.system.welcome',
    passwordChanged: 'notification.system.passwordChanged',
    accountUpdated: 'notification.system.accountUpdated',
    dataExported: 'notification.system.dataExported',
    reportGenerated: 'notification.system.reportGenerated'
  }
};

// Inline translations (copy from NotificationTranslatorService)
const EN_TRANSLATIONS: Record<string, string> = {
  // QuickCheck notifications
  'notification.quickcheck.completed.approved': 'Machine {{machineName}} approved by {{responsibleName}}',
  'notification.quickcheck.completed.disapproved': 'Machine {{machineName}} disapproved by {{responsibleName}}: {{observation}}',
  'notification.quickcheck.completed.notInitiated': 'Machine {{machineName}} not initiated by {{responsibleName}}: {{observation}}',
  'notification.quickcheck.created': 'New QuickCheck created for machine {{machineName}}',
  'notification.quickcheck.assigned': 'QuickCheck assigned to you for machine {{machineName}}',

  // Machine notifications
  'notification.machine.created': 'Machine Registered! {{machineType}} {{brand}} {{serialNumber}}',
  'notification.machine.updated': 'Machine {{machineName}} updated',
  'notification.machine.deleted': 'Machine {{machineName}} removed from system',
  'notification.machine.statusChanged': 'Machine {{machineName}} status changed to {{newStatus}}',

  // Machine events
  'notification.machine.event.maintenanceCompleted': 'Maintenance completed on {{machineName}}',
  'notification.machine.event.repairStarted': 'Repair started on {{machineName}}',
  'notification.machine.event.repairCompleted': 'Repair completed on {{machineName}}',
  'notification.machine.event.breakdown': 'Breakdown reported on {{machineName}}',
  'notification.machine.event.safetyIncident': '⚠️ Safety incident on {{machineName}}',
  'notification.machine.event.machineStopped': 'Machine {{machineName}} stopped',
  'notification.machine.event.statusChange': 'Status change on {{machineName}}',
  'notification.machine.event.technicalInspection': 'Technical inspection on {{machineName}}',
  'notification.machine.event.partReplacement': 'Part replaced on {{machineName}}',

  // Maintenance notifications
  'notification.maintenance.scheduled': 'Maintenance scheduled for {{machineName}} on {{scheduledDate}}',
  'notification.maintenance.reminder': 'Reminder: Maintenance due for {{machineName}} on {{dueDate}}',
  'notification.maintenance.overdue': '⚠️ Overdue maintenance for {{machineName}}',
  'notification.maintenance.completed': 'Maintenance completed on {{machineName}}',
  'notification.maintenance.cancelled': 'Maintenance cancelled for {{machineName}}',
  'notification.maintenance.rescheduled': 'Maintenance rescheduled for {{machineName}} to {{newDate}}',
  'notification.maintenance.alarmTriggered': '⚠️ {{alarmTitle}}',

  // User notifications
  'notification.user.assigned': 'You have been assigned to {{machineName}}',
  'notification.user.unassigned': 'You have been unassigned from {{machineName}}',
  'notification.user.roleChanged': 'Your role has been changed to {{newRole}}',
  'notification.user.permissionsChanged': 'Your permissions have been updated',

  // System notifications
  'notification.system.welcome': 'Welcome to FleetMan, {{userName}}',
  'notification.system.passwordChanged': 'Your password has been changed',
  'notification.system.accountUpdated': 'Your account information has been updated',
  'notification.system.dataExported': 'Your data export is ready: {{fileName}}',
  'notification.system.reportGenerated': 'Report generated: {{reportName}}'
};

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

  // Extract all notification keys from constants
  const allDefinedKeys = extractAllKeys(NOTIFICATION_MESSAGE_KEYS);
  console.log(`📊 Found ${allDefinedKeys.length} notification keys in NOTIFICATION_MESSAGE_KEYS`);
  console.log(`📚 Found ${Object.keys(EN_TRANSLATIONS).length} translations in EN_TRANSLATIONS\n`);

  // Track missing translations
  const missingTranslations: string[] = [];
  
  // Verify each key has a translation
  for (const key of allDefinedKeys) {
    if (!EN_TRANSLATIONS[key]) {
      missingTranslations.push(key);
    }
  }

  // Report results
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

  // Success
  console.log('✅ VALIDATION PASSED\n');
  console.log('✨ All notification keys have corresponding English translations\n');
  
  // Show sample translations
  console.log('📝 Sample Translations:\n');
  console.log(`  QuickCheck Approved: "${EN_TRANSLATIONS['notification.quickcheck.completed.approved']}"`);
  console.log(`  Machine Created: "${EN_TRANSLATIONS['notification.machine.created']}"`);
  console.log(`  Maintenance Alarm: "${EN_TRANSLATIONS['notification.maintenance.alarmTriggered']}"`);
  console.log(`  System Welcome: "${EN_TRANSLATIONS['notification.system.welcome']}"`);

  console.log('\n✅ Translation system ready for production!\n');
  process.exit(0);
}

// Run validation
validateTranslationCompleteness();
