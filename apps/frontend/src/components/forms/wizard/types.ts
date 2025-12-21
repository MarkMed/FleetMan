import { z } from 'zod';

/**
 * Props que cada step component debe implementar
 */
export interface WizardStepProps<T = any> {
  /** Datos actuales del formulario */
  data: Partial<T>;
  /** Callback para actualizar datos del step (opcional, se usa RHF ahora) */
  onChange?: (data: Partial<T>) => void;
  /** Errores de validación del step actual */
  errors: Record<string, string>;
  /** Si el step actual es válido */
  isValid: boolean;
  /** Si el formulario está siendo enviado */
  isSubmitting: boolean;
  /** Función para avanzar al siguiente step */
  onNext?: () => void;
  /** Función para retroceder al step anterior */
  onBack?: () => void;
}

/**
 * Configuración de un step del wizard
 */
export interface WizardStep<T = any> {
  /** Componente React que renderiza este step */
  component: React.ComponentType<WizardStepProps<T>>;
  /** Título del step */
  title: string;
  /** Descripción opcional del step */
  description?: string;
  /** Schema de validación Zod para este step */
  validation?: z.ZodSchema<Partial<T>>;
  /** Si este step puede ser omitido */
  optional?: boolean;
  /** Función para validar si el step es válido (compatible con RHF) */
  isValid?: (data?: Partial<T>) => boolean;
}

/**
 * Props del componente Wizard principal
 */
export interface WizardProps<T = any> {
  /** Array de steps del wizard */
  steps: WizardStep<T>[];
  /** Datos iniciales del formulario */
  initialData?: Partial<T>;
  /** Callback cuando se envía el formulario completo */
  onSubmit: (data: T) => Promise<void>;
  /** Callback cuando cambia el step actual */
  onStepChange?: (stepIndex: number, data: Partial<T>) => void;
  /** Si el formulario está siendo enviado */
  isSubmitting?: boolean;
  /** Callback cuando se cancela el wizard */
  onCancel?: () => void;
  /** Label del timer durante countdown en último step */
  timerLabel?: string;
  /** Personalización de la UI */
  className?: string;
  /** Si mostrar el indicador de progreso */
  showProgress?: boolean;
}

/**
 * Estado interno del wizard
 */
export interface WizardState<T = any> {
  /** Índice del step actual (0-based) */
  currentStep: number;
  /** Datos acumulados de todos los steps */
  data: Partial<T>;
  /** Errores de validación del step actual */
  errors: Record<string, string>;
  /** Si el step actual es válido */
  isValid: boolean;
  /** Historia de steps visitados para navegación inteligente */
  visitedSteps: Set<number>;
}

/**
 * Acciones disponibles en el wizard
 */
export interface WizardActions<T = any> {
  /** Ir al siguiente step */
  nextStep: () => void;
  /** Ir al step anterior */
  previousStep: () => void;
  /** Ir a un step específico */
  goToStep: (stepIndex: number) => void;
  /** Actualizar datos del step actual (opcional con RHF) */
  updateStepData?: (data: Partial<T>) => void;
  /** Validar el step actual */
  validateCurrentStep: () => Promise<boolean>;
  /** Enviar el formulario completo */
  submitWizard: () => Promise<void>;
  /** Reiniciar el wizard */
  reset: () => void;
}

/**
 * Return type del hook useWizard
 */
export interface UseWizardReturn<T = any> extends WizardState<T>, WizardActions<T> {
  /** Configuración del step actual */
  currentStepConfig: WizardStep<T>;
  /** Si es el primer step */
  isFirstStep: boolean;
  /** Si es el último step */
  isLastStep: boolean;
  /** Porcentaje de progreso (0-100) */
  progress: number;
}