import { useCallback, useState, useEffect } from "react";
import { UseWizardReturn, WizardProps, WizardState } from "./types";

/**
 * Custom hook para manejar la lógica del wizard
 */
export function useWizard<T = any>({
  steps,
  initialData = {},
  onSubmit,
  onStepChange,
  isSubmitting = false,
}: Pick<
  WizardProps<T>,
  "steps" | "initialData" | "onSubmit" | "onStepChange" | "isSubmitting"
>): UseWizardReturn<T> {
  // Estado interno del wizard
  const [state, setState] = useState<WizardState<T>>({
    currentStep: 0,
    data: initialData,
    errors: {},
    isValid: false,
    visitedSteps: new Set([0]),
  });

  // Configuración del step actual
  const currentStepConfig = steps[state.currentStep];

  // Flags de navegación
  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === steps.length - 1;

  // Cálculo de progreso
  const progress = ((state.currentStep + 1) / steps.length) * 100;

  /**
   * Validar el step actual usando la función isValid del step
   */
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const { isValid, validation } = currentStepConfig;

    // PRIORIDAD 1: Usar función isValid si existe (nuestro caso)
    if (isValid && typeof isValid === "function") {
      try {
        const result = isValid();
        const isStepValid = typeof result === "boolean" ? result : await result;
        setState((prev) => ({ ...prev, errors: {}, isValid: isStepValid }));
        return isStepValid;
      } catch (error) {
        console.error("Error in isValid function:", error);
        setState((prev) => ({
          ...prev,
          errors: { general: "Error de validación" },
          isValid: false,
        }));
        return false;
      }
    }

    // PRIORIDAD 2: Usar schema Zod si existe (fallback)
    if (validation) {
      try {
        // Validar solo los campos relevantes para este step
        const result = validation.safeParse(state.data);

        if (result.success) {
          setState((prev) => ({ ...prev, errors: {}, isValid: true }));
          return true;
        } else {
          // Convertir errores de Zod a formato plano
          const errors: Record<string, string> = {};
          result.error.errors.forEach((error) => {
            const path = error.path.join(".");
            errors[path] = error.message;
          });

          setState((prev) => ({ ...prev, errors, isValid: false }));
          return false;
        }
      } catch (error) {
        console.error("Error validating step with schema:", error);
        setState((prev) => ({
          ...prev,
          errors: { general: "Error de validación" },
          isValid: false,
        }));
        return false;
      }
    }

    // Si no hay validación definida, considerar válido
    setState((prev) => ({ ...prev, errors: {}, isValid: true }));
    return true;
  }, [currentStepConfig, state.data]);

  /**
   * Ir al siguiente step
   */
  const nextStep = useCallback(async () => {
    // Validar step actual antes de avanzar
    const isValid = await validateCurrentStep();
    if (!isValid) {
      return;
    }

    // Avanzar al siguiente step si no es el último
    if (!isLastStep) {
      setState((prev) => {
        const nextStepIndex = prev.currentStep + 1;
        const newVisitedSteps = new Set(prev.visitedSteps);
        newVisitedSteps.add(nextStepIndex);

        // Notificar cambio de step (datos vienen de externa source como RHF)
        onStepChange?.(nextStepIndex, prev.data);

        return {
          ...prev,
          currentStep: nextStepIndex,
          visitedSteps: newVisitedSteps,
          errors: {}, // Limpiar errores al cambiar de step
          isValid: false, // Resetear validación para el nuevo step
        };
      });
    }
  }, [validateCurrentStep, isLastStep, onStepChange]);

  /**
   * Ir al step anterior
   */
  const previousStep = useCallback(() => {
    if (!isFirstStep) {
      setState((prev) => {
        const prevStepIndex = prev.currentStep - 1;

        // Notificar cambio de step
        onStepChange?.(prevStepIndex, prev.data);

        return {
          ...prev,
          currentStep: prevStepIndex,
          errors: {}, // Limpiar errores al cambiar de step
          isValid: false, // Resetear validación para el nuevo step
        };
      });
    }
  }, [isFirstStep, onStepChange]);

  /**
   * Ir a un step específico
   */
  const goToStep = useCallback(
    (stepIndex: number) => {
      // Solo permitir ir a steps ya visitados o al siguiente step inmediato
      if (
        stepIndex >= 0 &&
        stepIndex < steps.length &&
        (state.visitedSteps.has(stepIndex) ||
          stepIndex === state.currentStep + 1)
      ) {
        setState((prev) => {
          const newVisitedSteps = new Set(prev.visitedSteps);
          newVisitedSteps.add(stepIndex);

          // Notificar cambio de step
          onStepChange?.(stepIndex, prev.data);

          return {
            ...prev,
            currentStep: stepIndex,
            visitedSteps: newVisitedSteps,
            errors: {},
            isValid: false,
          };
        });
      }
    },
    [steps.length, state.visitedSteps, state.currentStep, onStepChange]
  );

  /**
   * Enviar el formulario completo
   */
  const submitWizard = useCallback(async () => {
    // Validar step actual antes de enviar
    const isValid = await validateCurrentStep();
    if (!isValid) {
      return;
    }

    try {
      await onSubmit(state.data as T);
    } catch (error) {
      console.error("Error submitting wizard:", error);
      // Podrías agregar manejo de errores aquí
    }
  }, [validateCurrentStep, onSubmit, state.data]);

  /**
   * Reiniciar el wizard
   */
  const reset = useCallback(() => {
    setState({
      currentStep: 0,
      data: initialData,
      errors: {},
      isValid: false,
      visitedSteps: new Set([0]),
    });
  }, [initialData]);

  // Re-validar cuando cambien los datos o el step actual
  useEffect(() => {
    validateCurrentStep();
  }, [validateCurrentStep]);

  // 🔥 FIX: Sincronizar wizard data con datos externos (ej: RHF)
  useEffect(() => {
    setState(prev => ({
      ...prev,
      data: initialData
    }));
  }, [initialData]);

  return {
    // Estado
    ...state,

    // Configuración actual
    currentStepConfig,

    // Flags
    isFirstStep,
    isLastStep,
    progress,

    // Acciones
    nextStep,
    previousStep,
    goToStep,
    validateCurrentStep,
    submitWizard,
    reset,
  };
}
