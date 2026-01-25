import React from "react";
import { useWizard } from "./useWizard";
import { WizardProgress } from "./WizardProgress";
import { WizardControls } from "./WizardControls";
import { WizardProps } from "./types";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../../ui";
import { cn } from "../../../utils/cn";

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
  console.log(
    "🔷 [Wizard] Renderizando... steps:",
    steps.length,
    "isSubmitting:",
    isSubmitting,
  );

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
  const stepTitles = steps.map((step) => step.title);

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <Card className="shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header del wizard: solo título grande y mini descripción del paso actual */}
        <CardHeader className="text-left pb-0 sticky top-0 bg-gray-100/70 dark:bg-gray-900/30 backdrop-blur-[1px]">
          {/* Progress indicator: solo visual, sin nombres de pasos */}
          {showProgress && (
            <WizardProgress
              totalSteps={steps.length}
              currentStep={currentStep}
              visitedSteps={visitedSteps}
              // stepTitles eliminado para evitar duplicidad visual
              allowStepClick={true}
              onStepClick={goToStep}
              className="mb-4"
            />
          )}
          <div className="mb-4">
            <CardTitle className="text-2xl font-bold text-foreground">
              {currentStepConfig.title}
            </CardTitle>
            {currentStepConfig.description && (
              <CardDescription className="text-muted-foreground mt-2">
                {currentStepConfig.description}
              </CardDescription>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6">
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
            className="mt-8 sticky bottom-0 bg-gray-100/70 dark:bg-gray-900/30 backdrop-blur-[1px] py-4"
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default Wizard;
