import { useState, useCallback, useEffect, useReducer } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/AuthProvider';
import type { WizardStep } from '../../components/forms/wizard/types';
import type { CompleteRegistrationData } from '../../types/registration.types';
import type { RegisterRequest } from '@contracts';
import { UserType } from '@contracts';
import {
  CredentialsStep,
  UserTypeStep,
  ProfessionalInfoStep,
  ProfileCompletionStep,
  PreferencesStep,
  ConfirmationStep
} from '../../screens/auth/FullRegistration/steps';

export interface FullRegistrationViewModel {
  // Form state
  form: UseFormReturn<CompleteRegistrationData>;
  
  // Wizard state
  wizardSteps: WizardStep<CompleteRegistrationData>[];
  forceUpdate: () => void;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  handleWizardSubmit: (data: CompleteRegistrationData) => Promise<void>;
  handleCancel: () => void;
  reset: () => void;
}

/**
 * ViewModel para el registro completo de usuarios siguiendo patrón MVVM
 * Sprint #14 Task 2.1b
 *
 * RESPONSABILIDADES:
 * - Gestionar estado del wizard multi-step con RHF integration
 * - Validar datos por step usando validaciones inline
 * - Orquestar registro de usuario con AuthProvider
 * - Manejar UI state (loading, errors)
 * - Transformar datos entre UI format y domain format
 * - Aplicar preferencias de usuario tras registro exitoso
 *
 * FEATURES IMPLEMENTADAS:
 * • React Hook Form con validación inline
 * • Wizard configuration con steps y validaciones
 * • Manejo de errores granular
 * • Sincronización perfecta wizard <-> RHF
 * • Validaciones condicionales (PROVIDER requiere companyName)
 * • Steps opcionales (profileCompletion, preferences)
 * • Auto-login tras registro exitoso
 * 
 * FLUJO DE SUBMIT:
 * 1. Validar datos del formulario
 * 2. Mapear datos del wizard a RegisterRequest
 * 3. Llamar al registro con AuthProvider
 * 4. Aplicar preferencias de usuario (idioma)
 * 5. Redirección automática a dashboard (manejada por AuthProvider)
 */
export function useFullRegistrationViewModel(): FullRegistrationViewModel {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { register, isLoading: authLoading, error: authError } = useAuth();

  // React Hook Form setup
  const form = useForm<CompleteRegistrationData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      type: 'CLIENT',
      professionalInfo: {
        companyName: '',
        phone: '',
        address: ''
      },
      profileCompletion: {
        bio: '',
        tags: []
      },
      preferences: {
        language: (i18n.language as 'es' | 'en') || 'es',
        notifications: {
          email: true,
          maintenanceAlerts: true
        }
      }
    }
  });

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Force re-render when form state changes to make validation reactive
  const [, forceUpdateReducer] = useReducer(x => x + 1, 0);
  const forceUpdate = useCallback(() => forceUpdateReducer(), []);

  // Subscribe to form state changes for wizard reactivity
  useEffect(() => {
    const subscription = form.watch(() => {
      forceUpdateReducer(); // Force wizard to re-evaluate isValid functions
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Configuración de los steps del wizard
  const wizardSteps: WizardStep<CompleteRegistrationData>[] = [
    {
      title: t('auth.register.wizard.credentials.title'),
      description: t('auth.register.wizard.credentials.description'),
      component: CredentialsStep,
      isValid: () => {
        const { email, password, confirmPassword } = form.getValues();
        const errors = form.formState.errors;
        
        // Check required fields are filled
        if (!email || !password || !confirmPassword) return false;
        
        // Check no validation errors in credentials fields
        if (errors.email || errors.password || errors.confirmPassword) return false;
        
        // Check passwords match
        if (password !== confirmPassword) return false;
        
        return true;
      }
    },
    {
      title: t('auth.register.wizard.userType.title'),
      description: t('auth.register.wizard.userType.description'),
      component: UserTypeStep,
      isValid: () => {
        const { type } = form.getValues();
        const errors = form.formState.errors;
        
        // Check type is selected
        if (!type) return false;
        
        // Check no validation errors
        if (errors.type) return false;
        
        return true;
      }
    },
    {
      title: t('auth.register.wizard.professionalInfo.title'),
      description: t('auth.register.wizard.professionalInfo.description'),
      component: ProfessionalInfoStep,
      isValid: () => {
        const { type, professionalInfo } = form.getValues();
        const errors = form.formState.errors;
        
        // If PROVIDER, companyName is required
        if (type === 'PROVIDER' && !professionalInfo?.companyName) return false;
        
        // Check no validation errors in professional info fields
        if (errors.professionalInfo) return false;
        
        return true;
      }
    },
    {
      title: t('auth.register.wizard.profileCompletion.title'),
      description: t('auth.register.wizard.profileCompletion.description'),
      component: ProfileCompletionStep,
      optional: true,
      isValid: () => {
        const errors = form.formState.errors;
        
        // Optional step - just check no validation errors
        if (errors.profileCompletion) return false;
        
        return true;
      }
    },
    {
      title: t('auth.register.wizard.preferences.title'),
      description: t('auth.register.wizard.preferences.description'),
      component: PreferencesStep,
      optional: true,
      isValid: () => {
        const errors = form.formState.errors;
        
        // Optional step - just check no validation errors
        if (errors.preferences) return false;
        
        return true;
      }
    },
    {
      title: t('auth.register.wizard.confirmation.title'),
      description: t('auth.register.wizard.confirmation.description'),
      component: ConfirmationStep,
      isValid: () => {
        // Final step - all form must be valid
        return Object.keys(form.formState.errors).length === 0;
      }
    }
  ];

  /**
   * Handle wizard submit - main business logic
   * 
   * Flow:
   * 1. Validate form data
   * 2. Map wizard data to RegisterRequest
   * 3. Call registration with AuthProvider
   * 4. Apply user preferences (language)
   * 5. User redirected to dashboard by AuthProvider
   */
  const handleWizardSubmit = useCallback(async (data: CompleteRegistrationData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use form.getValues() as single source of truth
      const currentFormData = form.getValues();
      
      // Trigger validation
      const isValid = await form.trigger();
      if (!isValid) {
        throw new Error(t('auth.register.error.invalidData'));
      }

      // Map wizard data to RegisterRequest format
      const registerRequest: RegisterRequest = {
        email: currentFormData.email,
        password: currentFormData.password,
        type: currentFormData.type as UserType,
        profile: {
          ...(currentFormData.professionalInfo?.companyName && { 
            companyName: currentFormData.professionalInfo.companyName 
          }),
          ...(currentFormData.professionalInfo?.phone && { 
            phone: currentFormData.professionalInfo.phone 
          }),
          ...(currentFormData.professionalInfo?.address && { 
            address: currentFormData.professionalInfo.address 
          }),
          ...(currentFormData.profileCompletion?.bio && { 
            bio: currentFormData.profileCompletion.bio 
          }),
          ...(currentFormData.profileCompletion?.tags && 
            currentFormData.profileCompletion.tags.length > 0 && { 
              tags: currentFormData.profileCompletion.tags 
            })
        }
      };

      // Call registration
      await register(registerRequest);

      // Apply user preferences after successful registration
      if (currentFormData.preferences?.language) {
        i18n.changeLanguage(currentFormData.preferences.language);
      }

      // User will be redirected to dashboard by AuthProvider
      
    } catch (error) {
      console.error('❌ Full registration failed:', error);
      
      // Determine error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : t('auth.register.error.unknown');
      
      setError(errorMessage);
      
      throw error; // Re-throw to be handled by wizard
    } finally {
      setIsLoading(false);
    }
  }, [form, register, i18n, t]);

  /**
   * Handle cancel action
   */
  const handleCancel = useCallback(() => {
    form.reset();
    setError(null);
    navigate('/auth/login');
  }, [form, navigate]);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    form.reset();
    setError(null);
    setIsLoading(false);
  }, [form]);

  return {
    // Form state
    form,
    
    // Wizard state
    wizardSteps,
    forceUpdate,
    
    // UI State
    isLoading: isLoading || authLoading,
    error: error ?? authError ?? null,
    
    // Actions
    handleWizardSubmit,
    handleCancel,
    reset,
  };
}
