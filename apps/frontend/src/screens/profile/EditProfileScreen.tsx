import React from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Wizard } from '../../components/forms/wizard';
import { useEditProfileViewModel } from '../../viewModels/profile/useEditProfileViewModel';
import { modal } from '@helpers/modal';
import { UserProfileEditData } from '../../types/user.types';
import { Button, TextBlock, Skeleton, Card } from '@components/ui';
import { AlertTriangle } from 'lucide-react';

/**
 * Edit Profile Screen
 * Sprint #13 Tasks 10.1 + 10.2: User Profile Editing + Bio & Tags
 * 
 * Pantalla principal para edición de perfil usando wizard multi-step + React Hook Form
 * Patrón similar a MachineRegistrationScreen
 */
export function EditProfileScreen() {
  const { t } = useTranslation();
  
  // ViewModel maneja toda la lógica
  const viewModel = useEditProfileViewModel();
  const {
    form,
    wizardSteps,
    forceUpdate,
    isLoadingUserData,
    loadUserError,
    isSubmitting,
    handleWizardSubmit,
    handleCancel,
  } = viewModel;

  /**
   * Wrapper que abre modal de confirmación antes del submit real
   * Usa modal.show() directamente (reutiliza lógica global de modales)
   */
  const handleSubmitWithConfirmation = async (data: UserProfileEditData) => {
    modal.show({
      title: t('profile.edit.confirmation.modal.title'),
      description: t('profile.edit.confirmation.modal.description'),
      showConfirm: true,
      showCancel: true,
      confirmText: t('profile.edit.confirmation.modal.confirmButton'),
      cancelText: t('profile.edit.confirmation.modal.cancelButton'),
      variant: "warning",
      onConfirm: async () => {
        await handleWizardSubmit(data);
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <TextBlock as="h1" size="headline">
          {t('profile.edit.title')}
        </TextBlock>
        <TextBlock as="p" size="medium" className="mt-2 text-gray-600">
          {t('profile.edit.subtitle')}
        </TextBlock>
      </div>

      {/* Loading skeleton mientras carga datos del usuario */}
      {isLoadingUserData && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="h-8 w-1/3"><Skeleton className="h-8 w-full" /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full md:col-span-2" />
            </div>
            <div className="flex justify-end space-x-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </Card>
      )}

      {/* Error al cargar datos del usuario */}
      {loadUserError && !isLoadingUserData && (
        <Card className="mb-6 bg-yellow-50 border border-yellow-200 p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-1">
                {t('profile.edit.errors.loadUserTitle')}
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                {loadUserError}
              </p>
              <Button 
                onPress={handleCancel}
                variant="outline"
                size="sm"
              >
                {t('common.back')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Wizard Form */}
      {!isLoadingUserData && !loadUserError && (
        <FormProvider {...form}>
          <Wizard<UserProfileEditData>
            steps={wizardSteps}
            initialData={form.getValues()}
            onSubmit={handleSubmitWithConfirmation}
            onStepChange={forceUpdate}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            timerLabel={t('profile.edit.verificationTime')}
            className="bg-white shadow-lg rounded-lg"
            showProgress
          />
        </FormProvider>
      )}
    </div>
  );
}
