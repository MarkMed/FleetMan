import React from 'react';
import { 
  Heading1, 
  Heading2, 
  BodyText, 
  Button, 
  Card, 
  Switch,
  Skeleton,
  Badge,
  Select,
} from '@components/ui';
import { ThemeToggle } from '@components/settings/ThemeToggle';
import { Mail, Save, RotateCcw } from 'lucide-react';
import { useConfigurationsViewModel } from '../../viewModels/settings/useConfigurationsViewModel';

/**
 * ConfigurationsScreen - Sprint #14 Tasks 14.5 & 14.6 (View Layer - MVVM-lite)
 * 
 * Pantalla completa de configuraciones del sistema con:
 * - Theme toggle (14.5): Selector de tema con persistencia automática
 * - Settings form (14.6): Configuraciones de idioma, notificaciones, mantenimiento, seguridad
 * 
 * Architecture:
 * - View Layer: Only rendering and UI structure (this file)
 * - Business Logic: Handled by useConfigurationsViewModel
 * - Pattern: Consumes ViewModel, NO business logic in this component
 * 
 * @remarks
 * Frontend-only implementation: Backend calls are mocked in ViewModel
 * Theme/Language persist in Zustand + i18n + localStorage automatically
 */

export const ConfigurationsScreen: React.FC = () => {
  // ========================
  // ViewModel (Business Logic)
  // ========================
  const vm = useConfigurationsViewModel();

  // ========================
  // LOADING STATE
  // ========================
  if (vm.isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-10 w-96 mb-2" />
          <Skeleton className="h-6 w-full max-w-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ========================
  // MAIN LAYOUT
  // ========================
  return (
    <form onSubmit={vm.handleSubmit(vm.onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap sticky top-0 bg-background/80 pt-4 pb-4 z-10 border-b border-border backdrop-blur-[1px]">
        <div>
          <div className="flex items-center gap-3">
            <Heading1 size="headline" className="tracking-tight text-foreground">
              {vm.t('settings.title')}
            </Heading1>
            {vm.isDirty && (
              <Badge variant="warning" className="text-xs">
                {vm.t('settings.messages.unsavedChanges')}
              </Badge>
            )}
          </div>
          <BodyText className="text-muted-foreground mt-2">
            {vm.t('settings.subtitle')}
          </BodyText>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap justify-end">
          <Button
            variant="outline"
            onPress={vm.handleRestoreDefaults}
            className="flex items-center gap-2"
            disabled={vm.isSaving}
          >
            <RotateCcw className="w-4 h-4" />
            {vm.t('settings.buttons.restoreDefaults')}
          </Button>
          <Button
            variant="filled"
            size="default"
            className="flex items-center gap-2"
            disabled={!vm.isDirty || vm.isSaving}
            aria-busy={vm.isSaving}
            onPress={vm.handleSubmit(vm.onSubmit)}
          >
            <Save className="w-4 h-4" />
            {vm.isSaving ? vm.t('settings.buttons.saving') : vm.t('settings.buttons.save')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Language + Appearance */}
        <div className="space-y-6">
          {/* Language Settings */}
          <Card>
            <div className="p-6">
              <Heading2 size="large" weight="bold" className="mb-2">
                {vm.t('settings.language.title')}
              </Heading2>
              <BodyText size="small" className="text-muted-foreground mb-6">
                {vm.t('settings.language.subtitle')}
              </BodyText>
              
              <div className="space-y-4">
                <Select
                  label={vm.t('settings.language.label')}
                  value={vm.i18n.language.split('-')[0]} // Normalize en-US → en
                  onValueChange={(value) => vm.handleLanguageChange(value as 'es' | 'en')}
                  options={[
                    { value: 'es', label: vm.t('settings.language.spanish') },
                    { value: 'en', label: vm.t('settings.language.english') }
                  ]}
                  helperText={vm.t('settings.language.description')}
                />
              </div>
            </div>
          </Card>

          {/* Appearance Settings - Task 14.5 */}
          <Card>
            <div className="p-6">
              <Heading2 size="large" weight="bold" className="mb-2">
                {vm.t('settings.appearance.title')}
              </Heading2>
              <BodyText size="small" className="text-muted-foreground mb-6">
                {vm.t('settings.appearance.subtitle')}
              </BodyText>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    {vm.t('settings.appearance.theme.label')}
                  </label>
                  <ThemeToggle />
                  <BodyText size="small" className="text-muted-foreground mt-2">
                    {vm.t('settings.appearance.theme.description')}
                  </BodyText>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Aside): Notification Settings - Task 14.6 */}
        <Card>
          <div className="p-6">
            <Heading2 size="large" weight="bold" className="mb-2">
              {vm.t('settings.notifications.title')}
            </Heading2>
            <BodyText size="small" className="text-muted-foreground mb-6">
              {vm.t('settings.notifications.subtitle')}
            </BodyText>
            
            <div className="flex flex-col gap-6">
              {/* Email notifications toggle */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <BodyText weight="medium">
                    {vm.t('settings.notifications.emailEnabled.label')}
                  </BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    {vm.t('settings.notifications.emailEnabled.description')}
                  </BodyText>
                </div>
                <Switch
                  checked={vm.watch('emailEnabled')}
                  onCheckedChange={(checked) => vm.setValue('emailEnabled', checked, { shouldDirty: true })}
                  aria-label={vm.t('settings.notifications.emailEnabled.label')}
                />
              </div>

              {/* Maintenance alerts */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <BodyText weight="medium">
                    {vm.t('settings.notifications.maintenanceAlerts.label')}
                  </BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    {vm.t('settings.notifications.maintenanceAlerts.description')}
                  </BodyText>
                </div>
                <Switch
                  checked={vm.watch('maintenanceAlerts')}
                  onCheckedChange={(checked) => vm.setValue('maintenanceAlerts', checked, { shouldDirty: true })}
                />
              </div>

              {/* Push notifications */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <BodyText weight="medium">
                    {vm.t('settings.notifications.pushNotifications.label')}
                  </BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    {vm.t('settings.notifications.pushNotifications.description')}
                  </BodyText>
                </div>
                <Switch
                  checked={vm.watch('pushNotifications')}
                  onCheckedChange={(checked) => vm.setValue('pushNotifications', checked, { shouldDirty: true })}
                />
              </div>
            </div>

            {/* Test email button */}
            <div className="mt-6 w-full flex justify-end">
              <Button
                variant="outline"
                onPress={vm.handleTestEmail}
                className="flex items-center gap-2 w-full"
              >
                <Mail className="w-4 h-4" />
                {vm.t('settings.buttons.testEmail')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </form>
  );
};

// Comentario estratégico: Futuras extensiones posibles
// interface ExtendedSettingsData extends SettingsFormData {
//   notificationSound?: boolean; // Sonidos en notificaciones push
//   autoBackup?: boolean; // Respaldo automático de datos
//   dataRetention?: number; // Días de retención de logs
//   apiRateLimit?: number; // Límite de requests por minuto
//   darkModeSchedule?: { start: string; end: string }; // Programar cambio de tema
// }