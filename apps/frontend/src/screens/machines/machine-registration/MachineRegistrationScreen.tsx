import React from "react";
import { FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Wizard } from "../../../components/forms/wizard";
import { useMachineRegistrationViewModel } from "../../../viewModels/machines/MachineRegistrationViewModel";
import { MachineRegistrationProvider } from "./MachineRegistrationContext";
import { useRegistrationConfirmation } from "../../../hooks/useRegistrationConfirmation";
import { MachineRegistrationData } from "@contracts";
// LEGACY: Skeleton import no longer needed (removed machineTypes loading UI)
// import { Button } from "../../../components/ui/Button";
// import { TextBlock, Skeleton } from "@components/ui";
import { Button } from "../../../components/ui/Button";
import { TextBlock } from "@components/ui";

/**
 * Pantalla principal para el registro de máquinas usando wizard multi-step + React Hook Form
 */
export function MachineRegistrationScreen() {
  const { t } = useTranslation();
  const { openConfirmationModal } = useRegistrationConfirmation();
  
  // ViewModel maneja toda la lógica
  const viewModel = useMachineRegistrationViewModel();
  const {
    form,
    wizardSteps,
    forceUpdate,
    isLoading,
    handleWizardSubmit,
    handleCancel,
    // LEGACY: Machine types no longer fetched from API (free-text entry)
    // machineTypeList,
    // machineTypesLoading,
    // machineTypesError,
    // refetchMachineTypes,
  } = viewModel;

  /**
   * Wrapper that opens confirmation modal before actual submit.
   * The TimerButton will call this function after the countdown completes.
   */
  const handleSubmitWithConfirmation = async (data: MachineRegistrationData) => {
    await openConfirmationModal(async () => {
      await handleWizardSubmit(data);
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <TextBlock as="h1" size="headline">
          {t('machines.registration.screen.title')}
        </TextBlock>
        <TextBlock as="p" size="medium" className="mt-2 text-gray-600">
          {t('machines.registration.screen.subtitle')}
        </TextBlock>
      </div>

      {/* LEGACY: Removed machine types loading skeleton (no longer needed for free-text entry) */}

      {/* LEGACY: Removed machine types error banner (no API call to fail) */}

      {/* RHF Error Display */}
      {form.formState.errors.root && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {t('machines.registration.screen.registrationError')}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {form.formState.errors.root.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FormProvider wraps the entire wizard for RHF context */}
      <MachineRegistrationProvider viewModel={viewModel}>
        <FormProvider {...form}>
          <Wizard<MachineRegistrationData>
            steps={wizardSteps}
            initialData={form.getValues()}
            onSubmit={handleSubmitWithConfirmation}
            onStepChange={() => {
              // Force wizard to re-read form values from RHF
              forceUpdate();
            }}
            isSubmitting={isLoading}
            onCancel={handleCancel}
            timerLabel={t('machines.registration.verificationTime')}
            className="bg-white shadow-lg rounded-lg"
            showProgress
          />
        </FormProvider>
      </MachineRegistrationProvider>
    </div>
  );
}
