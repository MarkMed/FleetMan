import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast, modal } from '@components/ui';
import { useAuthStore } from '@store/slices/authSlice';
import { i18n } from '@i18n/index';

/**
 * ConfigurationsViewModel - Sprint #14 Tasks 14.5 & 14.6
 * 
 * Business logic layer for Settings/Configurations screen following MVVM-lite pattern
 * 
 * Responsibilities:
 * - Form state management (React Hook Form + Zod)
 * - Settings persistence (mock localStorage for now)
 * - Language change handling (i18n integration)
 * - Loading/saving states
 * - Validation logic
 * 
 * Architecture:
 * - View consumes this ViewModel via useConfigurationsViewModel()
 * - View is responsible ONLY for JSX rendering
 * - ViewModel handles ALL business logic
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

export type SettingsFormData = z.infer<typeof settingsSchema>;

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

/**
 * ViewModel for Configurations Screen
 * 
 * Manages:
 * - Form state and validation
 * - Loading/saving settings from/to backend (currently mocked)
 * - Language changes via i18n
 * - Restore defaults functionality
 * - Test email functionality
 */
export function useConfigurationsViewModel() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  
  // UI state
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

  // ===== Load settings from backend (currently mocked with localStorage) =====
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
      console.log('[ConfigurationsViewModel] Settings loaded from mock localStorage');
    };

    loadSettings();
  }, [user, reset]);

  // ===== Handle language change with i18n (auto-persists to localStorage) =====
  const handleLanguageChange = useCallback((newLanguage: 'es' | 'en') => {
    i18n.changeLanguage(newLanguage);
    toast.success({
      title: t('settings.messages.saveSuccess'),
      description: t('settings.language.description'),
    });
    console.log('[ConfigurationsViewModel] Language changed:', newLanguage);
  }, [i18n, t]);

  // ===== Handle form submission =====
  const onSubmit = useCallback(async (data: SettingsFormData) => {
    setIsSaving(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // TODO: Replace with actual API call: PUT /users/me/notification-preferences
    localStorage.setItem('fleetman_settings_mock', JSON.stringify(data));
    
    console.log('[ConfigurationsViewModel] Settings saved (mock):', data);
    
    toast.success({
      title: t('settings.messages.saveSuccess'),
      description: Object.keys(data).length + ' configuraciones actualizadas',
    });

    setIsSaving(false);
    reset(data); // Mark form as pristine after successful save
  }, [t, reset]);

  // ===== Handle restore defaults =====
  const handleRestoreDefaults = useCallback(async () => {
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
  }, [t, user, reset]);

  // ===== Handle test email =====
  const handleTestEmail = useCallback(async () => {
    const emailAddress = watch('emailAddress');
    
    if (!emailAddress) {
      toast.error({
        title: t('settings.validation.emailRequired'),
      });
      return;
    }

    // TODO: Replace with actual API call: POST /notifications/test
    console.log('[ConfigurationsViewModel] Sending test email to:', emailAddress);
    
    toast.info({
      title: t('settings.messages.testEmailSent', { email: emailAddress }),
      description: 'Revisa tu bandeja de entrada',
    });
  }, [watch, t]);

  return {
    // i18n
    t,
    i18n,
    
    // UI state
    isLoading,
    isSaving,
    
    // Form state
    register,
    handleSubmit,
    watch,
    setValue,
    errors,
    isDirty,
    
    // Actions
    onSubmit,
    handleLanguageChange,
    handleRestoreDefaults,
    handleTestEmail,
  };
}

export type ConfigurationsViewModel = ReturnType<typeof useConfigurationsViewModel>;
