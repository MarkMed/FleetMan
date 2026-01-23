import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Heading1, 
  Heading2, 
  BodyText, 
  Button, 
  Card, 
  Switch,
  Input,
  Select,
  Skeleton,
  Badge,
  toast,
  modal
} from '@components/ui';
import { ThemeToggle } from '@components/settings/ThemeToggle';
import { useUIStore } from '@store';
import { useAuthStore } from '@store/slices/authSlice';
import { i18n } from '@i18n/index';
import { Mail, Save, RotateCcw } from 'lucide-react';

/**
 * ConfigurationsScreen - Sprint #14 Tasks 14.5 & 14.6
 * 
 * Pantalla completa de configuraciones del sistema con:
 * - Theme toggle (14.5): Selector de tema con persistencia automática
 * - Settings form (14.6): Configuraciones de idioma, notificaciones, mantenimiento, seguridad
 * 
 * @remarks
 * Frontend-only implementation: Backend calls are mocked with console.log + toasts
 * Theme/Language persist in Zustand + localStorage automatically
 * Notification preferences simulate backend persistence via localStorage mock
 */

// Validation schema for settings form
const settingsSchema = z.object({
  // Notification preferences
  emailEnabled: z.boolean(),
  emailAddress: z.string().email('settings.validation.emailInvalid'),
  frequency: z.enum(['immediate', 'daily', 'weekly']),
  maintenanceAlerts: z.boolean(),
  lowStockAlerts: z.boolean(),
  pushNotifications: z.boolean(),
  
  // Maintenance configuration
  preventiveInterval: z.number().min(1, 'settings.validation.numberMin').max(10000),
  anticipationDays: z.number().min(1).max(90),
  dailyOperatingHours: z.number().min(0.5).max(24),
  
  // Security settings
  sessionTimeout: z.enum(['30', '60', '120', '480']),
  require2FA: z.boolean(),

  // General settings (non-persisted, for UI only)
  timezone: z.string(),
  dateFormat: z.string(),
  currency: z.string(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

// Default values
const defaultSettings: SettingsFormData = {
  emailEnabled: true,
  emailAddress: '',
  frequency: 'immediate',
  maintenanceAlerts: true,
  lowStockAlerts: true,
  pushNotifications: false,
  preventiveInterval: 500,
  anticipationDays: 7,
  dailyOperatingHours: 8,
  sessionTimeout: '60',
  require2FA: true,
  timezone: 'America/Santiago',
  dateFormat: 'dd/mm/yyyy',
  currency: 'CLP',
};

export const ConfigurationsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettings,
  });

  // Simulate loading settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // TODO: Replace with actual API call: GET /users/me/notification-preferences
      const mockSettings = localStorage.getItem('fleetman_settings_mock');
      
      if (mockSettings) {
        const parsed = JSON.parse(mockSettings);
        reset(parsed);
      } else {
        // Use user email as default
        reset({
          ...defaultSettings,
          emailAddress: user?.email || '',
        });
      }
      
      setIsLoading(false);
      console.log('[ConfigurationsScreen] Settings loaded from mock localStorage');
    };

    loadSettings();
  }, [user, reset]);

  // Handle language change with i18n (auto-persists to localStorage)
  const handleLanguageChange = (newLanguage: 'es' | 'en') => {
    i18n.changeLanguage(newLanguage);
    toast.success({
      title: t('settings.messages.saveSuccess'),
      description: t('settings.language.description'),
    });
    console.log('[ConfigurationsScreen] Language changed:', newLanguage);
  };

  // Handle form submission
  const onSubmit = async (data: SettingsFormData) => {
    setIsSaving(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // TODO: Replace with actual API call: PUT /users/me/notification-preferences
    localStorage.setItem('fleetman_settings_mock', JSON.stringify(data));
    
    console.log('[ConfigurationsScreen] Settings saved (mock):', data);
    
    toast.success({
      title: t('settings.messages.saveSuccess'),
      description: Object.keys(data).length + ' configuraciones actualizadas',
    });

    setIsSaving(false);
    reset(data); // Mark form as pristine after successful save
  };

  // Handle restore defaults
  const handleRestoreDefaults = async () => {
    const confirmed = await modal.confirm({
      title: t('settings.messages.restoreConfirmTitle'),
      content: t('settings.messages.restoreConfirmMessage'),
      confirmText: t('settings.messages.restoreConfirmButton'),
      cancelText: t('settings.messages.restoreCancelButton'),
      action: 'warning',
    });

    if (!confirmed) return;

    // TODO: Replace with actual API call: DELETE /users/me/notification-preferences (restore defaults)
    const restoredData = {
      ...defaultSettings,
      emailAddress: user?.email || '',
    };
    
    reset(restoredData);
    localStorage.setItem('fleetman_settings_mock', JSON.stringify(restoredData));
    
    modal.hide();
    
    toast.success({
      title: t('settings.messages.restoreSuccess'),
    });
  };

  // Handle test email
  const handleTestEmail = async () => {
    const emailAddress = watch('emailAddress');
    
    if (!emailAddress) {
      toast.error({
        title: t('settings.validation.emailRequired'),
      });
      return;
    }

    // TODO: Replace with actual API call: POST /notifications/test
    console.log('[ConfigurationsScreen] Sending test email to:', emailAddress);
    
    toast.info({
      title: t('settings.messages.testEmailSent', { email: emailAddress }),
      description: 'Revisa tu bandeja de entrada',
    });
  };

  // Loading skeleton
  if (isLoading) {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <Heading1 size="headline" className="tracking-tight text-foreground">
              {t('settings.title')}
            </Heading1>
            {isDirty && (
              <Badge variant="warning" className="text-xs">
                {t('settings.messages.unsavedChanges')}
              </Badge>
            )}
          </div>
          <BodyText className="text-muted-foreground mt-2">
            {t('settings.subtitle')}
          </BodyText>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onPress={handleRestoreDefaults}
            className="flex items-center gap-2"
            disabled={isSaving}
          >
            <RotateCcw className="w-4 h-4" />
            {t('settings.buttons.restoreDefaults')}
          </Button>
          <Button
            variant="filled"
            size="default"
            className="flex items-center gap-2"
            disabled={!isDirty || isSaving}
            aria-busy={isSaving}
            onPress={handleSubmit(onSubmit)}
          >
            <Save className="w-4 h-4" />
            {isSaving ? t('settings.buttons.saving') : t('settings.buttons.save')}
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
                {t('settings.language.title')}
              </Heading2>
              <BodyText size="small" className="text-muted-foreground mb-6">
                {t('settings.language.subtitle')}
              </BodyText>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('settings.language.label')}
                  </label>
                  <select
                    value={i18n.language}
                    onChange={(e) => handleLanguageChange(e.target.value as 'es' | 'en')}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  >
                    <option value="es">{t('settings.language.spanish')}</option>
                    <option value="en">{t('settings.language.english')}</option>
                  </select>
                  <BodyText size="small" className="text-muted-foreground mt-2">
                    {t('settings.language.description')}
                  </BodyText>
                </div>
              </div>
            </div>
          </Card>

          {/* Appearance Settings - Task 14.5 */}
          <Card>
            <div className="p-6">
              <Heading2 size="large" weight="bold" className="mb-2">
                {t('settings.appearance.title')}
              </Heading2>
              <BodyText size="small" className="text-muted-foreground mb-6">
                {t('settings.appearance.subtitle')}
              </BodyText>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    {t('settings.appearance.theme.label')}
                  </label>
                  <ThemeToggle />
                  <BodyText size="small" className="text-muted-foreground mt-2">
                    {t('settings.appearance.theme.description')}
                  </BodyText>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Aside): Notification Settings - Task 14.6 */}
        <Card>
          <div className="lg:col-span-2 p-6">
            <Heading2 size="large" weight="bold" className="mb-2">
              {t('settings.notifications.title')}
            </Heading2>
            <BodyText size="small" className="text-muted-foreground mb-6">
              {t('settings.notifications.subtitle')}
            </BodyText>
            
            <div className="grid-cols-1 md:grid-cols-2 flex flex-col gap-6">
              {/* Email notifications toggle */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <BodyText weight="medium">
                    {t('settings.notifications.emailEnabled.label')}
                  </BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    {t('settings.notifications.emailEnabled.description')}
                  </BodyText>
                </div>
                <Switch
                  checked={watch('emailEnabled')}
                  onCheckedChange={(checked) => setValue('emailEnabled', checked, { shouldDirty: true })}
                  aria-label={t('settings.notifications.emailEnabled.label')}
                />
              </div>

              {/* Maintenance alerts */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <BodyText weight="medium">
                    {t('settings.notifications.maintenanceAlerts.label')}
                  </BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    {t('settings.notifications.maintenanceAlerts.description')}
                  </BodyText>
                </div>
                <Switch
                  checked={watch('maintenanceAlerts')}
                  onCheckedChange={(checked) => setValue('maintenanceAlerts', checked, { shouldDirty: true })}
                />
              </div>

              {/* Push notifications */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg w-full">
                <div className="flex-1">
                  <BodyText weight="medium">
                    {t('settings.notifications.pushNotifications.label')}
                  </BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    {t('settings.notifications.pushNotifications.description')}
                  </BodyText>
                </div>
                <Switch
                  checked={watch('pushNotifications')}
                  onCheckedChange={(checked) => setValue('pushNotifications', checked, { shouldDirty: true })}
                />
              </div>
            </div>

            {/* Test email button */}
            <div className="mt-6 w-full flex justify-end">
              <Button
                variant="outline"
                onPress={handleTestEmail}
                className="flex items-center gap-2 w-full"
              >
                <Mail className="w-4 h-4" />
                {t('settings.buttons.testEmail')}
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