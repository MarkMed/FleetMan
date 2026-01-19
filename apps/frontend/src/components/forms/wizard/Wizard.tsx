import React from 'react';
import { useWizard } from './useWizard';
import { WizardProgress } from './WizardProgress';
import { WizardControls } from './WizardControls';
import { WizardProps } from './types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../ui';
import { cn } from '../../../utils/cn';

/**
 * Componente Wizard principal para formularios multi-step
 */
export function Wizard<T = any>({
  steps,
  initialData,
  onSubmit,
  onStepChange,
  isSubmitting = false,
  onCancel,
  timerLabel,
  className,
  showProgress = true,
}: WizardProps<T>) {
  
  console.log('🔷 [Wizard] Renderizando... steps:', steps.length, 'isSubmitting:', isSubmitting);
  
  const wizard = useWizard({
    steps,
    initialData,
    onSubmit,
    onStepChange,
    isSubmitting,
  });

  const {
    currentStepConfig,
    currentStep,
    data,
    errors,
    isValid,
    visitedSteps,
    isFirstStep,
    isLastStep,
    nextStep,
    previousStep,
    goToStep,
    submitWizard,
  } = wizard;

  // Preparar props para el step actual
  const stepProps = {
    data,
    errors,
    isValid,
    isSubmitting,
    onNext: nextStep,
    onBack: previousStep,
  };

  // Extraer títulos para el progress
  const stepTitles = steps.map(step => step.title);

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      <Card className="shadow-lg">
        {/* Header del wizard: solo título grande y mini descripción del paso actual */}
        <CardHeader className="text-left pb-0">
          <CardTitle className="text-2xl font-bold text-foreground">
            {currentStepConfig.title}
          </CardTitle>
          {currentStepConfig.description && (
            <CardDescription className="text-muted-foreground mt-2">
              {currentStepConfig.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="px-6 pb-6">
          {/* Progress indicator: solo visual, sin nombres de pasos */}
          {showProgress && (
            <WizardProgress
              totalSteps={steps.length}
              currentStep={currentStep}
              visitedSteps={visitedSteps}
              // stepTitles eliminado para evitar duplicidad visual
              allowStepClick={true}
              onStepClick={goToStep}
              className="mb-8"
            />
          )}

          {/* Step content */}
          <div className="min-h-[400px]">
            <currentStepConfig.component {...stepProps} />
          </div>

          {/* Error display */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <h4 className="text-red-800 font-medium mb-2">
                Por favor, corrige los siguientes errores:
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field} className="text-red-700 text-sm">
                    {message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Controls */}
          <WizardControls
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            isValid={isValid}
            isSubmitting={isSubmitting}
            onPrevious={previousStep}
            onNext={nextStep}
            onSubmit={submitWizard}
            onCancel={onCancel}
            timerLabel={timerLabel}
            className="mt-8"
          />
        </CardContent>
      </Card>

      {/* Debug info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md text-xs text-gray-600">
          <strong>Debug Info:</strong>
          <br />
          Current Step: {currentStep + 1} / {steps.length}
          <br />
          Is Valid: {isValid ? 'Yes' : 'No'}
          <br />
          Visited Steps: {Array.from(visitedSteps).join(', ')}
          <br />
          Wizard Data: {JSON.stringify(data, null, 2)}
          <br />
          <strong>FormProvider Context:</strong> Available
        </div>
      )}
    </div>
  );
}

export default Wizard;