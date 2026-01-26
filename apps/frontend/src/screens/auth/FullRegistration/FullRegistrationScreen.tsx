import React from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Wizard } from '../../../components/forms/wizard/Wizard';
import { useFullRegistrationViewModel } from '../../../viewModels/auth/FullRegistrationViewModel';
import type { CompleteRegistrationData } from '../../../types/registration.types';

/**
 * FullRegistrationScreen - Full registration wizard
 * Sprint #14 Task 2.1b
 * 
 * Pantalla presentacional para el registro completo de usuarios.
 * Toda la lógica de negocio está en FullRegistrationViewModel.
 * 
 * Multi-step wizard for complete user registration with full profile.
 * Provides rich onboarding experience compared to quick registration.
 * 
 * Steps:
 * 1. Credentials (email, password)
 * 2. User Type (CLIENT vs PROVIDER)
 * 3. Professional Info (company, phone, address)
 * 4. Profile Completion (bio, tags) - OPTIONAL
 * 5. Preferences (language, notifications) - OPTIONAL
 * 6. Confirmation (review all data)
 * 
 * Features:
 * - Progress indicator
 * - Step validation per step with isValid() functions
 * - Reactive validation with forceUpdate mechanism
 * - Can skip optional steps
 * - Cancel redirects to login
 * - Auto-login after success
 */
export const FullRegistrationScreen: React.FC = () => {
  const { t } = useTranslation();
  
  // ViewModel maneja toda la lógica
  const viewModel = useFullRegistrationViewModel();
  const {
    form,
    wizardSteps,
    forceUpdate,
    isLoading,
    error,
    handleWizardSubmit,
    handleCancel,
  } = viewModel;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        {/* Display global registration error if any */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-red-800">
              {t('auth.register.error.title')}
            </h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* FormProvider wraps the entire wizard for RHF context */}
        <FormProvider {...form}>
          <Wizard<CompleteRegistrationData>
            steps={wizardSteps}
            initialData={form.getValues()}
            onSubmit={handleWizardSubmit}
            onCancel={handleCancel}
            onStepChange={() => {
              // Force wizard to re-read form values from RHF
              forceUpdate();
            }}
            showProgress={true}
            isSubmitting={isLoading}
            timerLabel={t('auth.register.wizard.confirmation.verifyData')}
          />
        </FormProvider>
      </div>
    </div>
  );
};

// TODO: Strategic enhancements for full registration
// - Save draft to localStorage (resume later)
// - Social registration integration (Google, Microsoft)
// - Organization invite code support
// - Welcome email with next steps
// - Profile completion tracking after registration
// - A/B test wizard flow variants
