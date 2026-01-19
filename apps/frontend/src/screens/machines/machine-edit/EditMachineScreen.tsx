import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Wizard } from '../../../components/forms/wizard';
import { useMachineEditViewModel } from '../../../viewModels/machines/MachineEditViewModel';
import { MachineEditProvider } from './MachineEditContext';
import { MachineRegistrationData } from '@contracts';
import { Heading1, BodyText, Card } from '@components/ui';

/**
 * EditMachineScreen Component
 * 
 * Screen para editar datos de una máquina existente
 * 
 * Features:
 * - Carga datos de máquina con useMachine(id)
 * - Pre-pobla wizard form con datos actuales
 * - Reutiliza 3 steps de registration + PhotoStepEdit customizado
 * - Muestra skeleton loader mientras carga datos
 * - Valida y envía actualización al backend
 * - Redirige a detalles tras éxito
 * 
 * Architecture:
 * - MVVM pattern: View delega toda lógica al ViewModel
 * - React Hook Form + Zod validation
 * - Context API para compartir ViewModel con steps
 * - TanStack Query para data fetching y mutations
 */
export function EditMachineScreen() {
  const renderCount = React.useRef(0);
  renderCount.current++;
  
  console.log(`🔶 [EditMachineScreen] === RENDER #${renderCount.current} ===`);
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  console.log('🔶 [EditMachineScreen] Hooks:', { id, navigateRef: typeof navigate, tRef: typeof t });

  // Validate machineId param
  if (!id) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6">
          <Heading1 className="text-destructive">
            {t('machines.edit.error.noId', 'ID de máquina no proporcionado')}
          </Heading1>
          <BodyText className="mt-4">
            {t('machines.edit.error.noIdDescription', 'No se pudo identificar la máquina a editar.')}
          </BodyText>
        </Card>
      </div>
    );
  }

  // Initialize ViewModel
  const viewModel = useMachineEditViewModel(id);
  
  console.log('🔶 [EditMachineScreen] Renderizando... isLoadingMachineData:', viewModel.isLoadingMachineData, 'wizardSteps:', viewModel.wizardSteps.length);
  console.log('🔶 [EditMachineScreen] viewModel reference:', viewModel);

  // Loading state - show skeleton while machine data loads
  if (viewModel.isLoadingMachineData) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6">
          {/* Header skeleton */}
          <div className="space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Wizard skeleton */}
          <div className="mt-8 space-y-6">
            {/* Progress bar skeleton */}
            <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
            
            {/* Step content skeleton */}
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-12 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Error state - machine not found or load error
  if (viewModel.error || !viewModel.machine) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6 border-destructive/20 bg-destructive/5">
          <Heading1 className="text-destructive">
            {t('machines.edit.error.loadFailed', 'Error al cargar máquina')}
          </Heading1>
          <BodyText className="mt-4">
            {viewModel.error || t('machines.edit.error.notFound', 'No se pudo encontrar la máquina solicitada.')}
          </BodyText>
          <div className="mt-6">
            <button
              onClick={() => navigate('/machines')}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              {t('common.backToList', 'Volver al listado')}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Main render - machine loaded successfully
  return (
    <div className="mx-auto py-8">
      <Card className="p-6 bg-transparent border-transparent">
        {/* Header */}
        <div className="mb-8">
          <Heading1 size="headline">
            {t('machines.edit.title', { machineName: `${viewModel.machine.brand} ${viewModel.machine.modelName}` })}
          </Heading1>
          <BodyText size="medium" className="mt-1">
            {t('machines.edit.serialNumber', 'Nº Serie')}:<b> {viewModel.machine.serialNumber}</b>
          </BodyText>
        </div>

        {/* Wizard with Form Provider + Context Provider */}
        <FormProvider {...viewModel.form}>
          <MachineEditProvider value={viewModel}>
            <Wizard<MachineRegistrationData>
              steps={viewModel.wizardSteps}
              initialData={viewModel.form.getValues()}
              onSubmit={viewModel.handleWizardSubmit}
              onStepChange={() => {
                // Force wizard to re-read form values from RHF
                viewModel.forceUpdate();
              }}
              isSubmitting={viewModel.isLoading}
              onCancel={() => {
                viewModel.handleCancel();
                navigate(`/machines/${id}`);
              }}
              className="bg-white shadow-lg rounded-lg"
              showProgress
            />
          </MachineEditProvider>
        </FormProvider>
      </Card>
    </div>
  );
}
