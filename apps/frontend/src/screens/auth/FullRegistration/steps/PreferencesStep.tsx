import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Select, Checkbox, BodyText, Card, CardContent } from '@components/ui';
import { Globe, Bell } from 'lucide-react';
import type { CompleteRegistrationData } from '../../../../types/registration.types';

/**
 * PreferencesStep - Step 5 of Complete Registration Wizard
 * Sprint #14 Task 2.1b
 * 
 * User preferences: language and notifications.
 * This step is OPTIONAL - users can skip it and configure later in settings.
 * 
 * Features:
 * - Language selection (ES/EN) with flags
 * - Email notifications toggle (default: enabled)
 * - Maintenance alerts toggle (default: enabled)
 * - Optional badge
 * - Hint about changing in settings
 */
export const PreferencesStep: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { control } = useFormContext<CompleteRegistrationData>();

  const languageOptions = [
    { value: 'es', label: `🇪🇸 ${t('settings.languages.es')}` },
    { value: 'en', label: `🇺🇸 ${t('settings.languages.en')}` }
  ];

  return (
    <div className="space-y-6">

      {/* Preferences cards */}
      <div className="space-y-4">
        {/* Language Section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t('auth.register.wizard.preferences.language')}
                  </h3>
                  <BodyText size="small" className="text-muted-foreground">
                    {t('auth.register.wizard.preferences.languageDescription')}
                  </BodyText>
                </div>

                <Controller
                  name="preferences.language"
                  control={control}
                  defaultValue={i18n.language as 'es' | 'en'}
                  render={({ field }) => (
                    <Select
                      value={field.value || i18n.language}
                      onValueChange={field.onChange}
                      options={languageOptions}
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {t('auth.register.wizard.preferences.notifications')}
                  </h3>
                  <BodyText size="small" className="text-muted-foreground">
                    {t('auth.register.wizard.preferences.notificationsDescription')}
                  </BodyText>
                </div>

                <div className="space-y-3">
                  {/* Email notifications */}
                  <Controller
                    name="preferences.notifications.email"
                    control={control}
                    defaultValue={true}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="email-notifications"
                        />
                        <label
                          htmlFor="email-notifications"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {t('settings.notifications.email')}
                        </label>
                      </div>
                    )}
                  />

                  {/* Maintenance alerts */}
                  <Controller
                    name="preferences.notifications.maintenanceAlerts"
                    control={control}
                    defaultValue={true}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="maintenance-notifications"
                        />
                        <label
                          htmlFor="maintenance-notifications"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {t('settings.notifications.maintenanceAlerts')}
                        </label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info hint */}
      <div className="rounded-md bg-muted/50 border border-border p-3">
        <BodyText size="small" className="text-muted-foreground">
          💡 {t('auth.register.wizard.preferences.changeInSettingsHint')}
        </BodyText>
      </div>
    </div>
  );
};

// TODO: Strategic preference fields for future enhancements
// - Time zone selection (for accurate maintenance scheduling)
// - Measurement units preference (metric/imperial)
// - Dashboard layout preference (compact/expanded)
// - Email digest frequency (daily/weekly/monthly)
// - SMS/WhatsApp notifications toggle
// - Dark mode preference
