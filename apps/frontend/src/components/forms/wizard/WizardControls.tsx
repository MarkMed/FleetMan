import React from "react";
import { Button, TimerButton } from "../../ui";
import { cn } from "../../../utils/cn";

interface WizardControlsProps {
  /** Si es el primer step */
  isFirstStep: boolean;
  /** Si es el último step */
  isLastStep: boolean;
  /** Si el step actual es válido */
  isValid: boolean;
  /** Si el formulario está siendo enviado */
  isSubmitting: boolean;
  /** Callback para ir al step anterior */
  onPrevious: () => void;
  /** Callback para ir al siguiente step */
  onNext: () => void;
  /** Callback para enviar el formulario */
  onSubmit: () => void;
  /** Callback para cancelar */
  onCancel?: () => void;
  /** Texto del botón anterior */
  previousLabel?: string;
  /** Texto del botón siguiente */
  nextLabel?: string;
  /** Texto del botón enviar */
  submitLabel?: string;
  /** Texto del botón cancelar */
  cancelLabel?: string;
  /** Label del timer durante countdown (ej: "¡Verifica los datos!") */
  timerLabel?: string;
  /** Clase CSS adicional */
  className?: string;
}

export const WizardControls: React.FC<WizardControlsProps> = ({
  isFirstStep,
  isLastStep,
  isValid,
  isSubmitting,
  onPrevious,
  onNext,
  onSubmit,
  onCancel,
  previousLabel = "Anterior",
  nextLabel = "Siguiente",
  submitLabel = "Enviar",
  cancelLabel = "Cancelar",
  timerLabel = "¡Verifica los datos!",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between pt-6 border-t border-border",
        className,
      )}
    >
      {/* Left side - Previous/Cancel button */}
      <div className="flex items-center space-x-4">
        {onCancel && (
          <Button
            variant="outline"
            onPress={onCancel}
            disabled={isSubmitting}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:text-red-600 dark:hover:text-red-300 border-2 border-red-400/70 hover:border-red-500"
          >
            {cancelLabel}
          </Button>
        )}
      </div>

      {/* Right side - Next/Submit button */}
      <div className="flex flex-row gap-4">
        {!isFirstStep && (
          <Button
            variant="outline"
            onPress={onPrevious}
            disabled={isSubmitting}
            className="px-6 py-2 border-2 border-blue-200 dark:border-blue-300 hover:border-blue-300 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-200 hover:text-blue-600 dark:hover:text-blue-100"
          >
            {previousLabel}
          </Button>
        )}
        {isLastStep ? (
          <TimerButton
            doubleConfirmation={false}
            resetOnAction={true}
            duration={3}
            onAction={onSubmit}
            label={submitLabel}
            timerLabel={() => timerLabel}
            disabled={!isValid || isSubmitting}
            variant="filled"
            className="px-8 py-2"
          />
        ) : (
          <Button
            variant="filled"
            onPress={onNext}
            disabled={!isValid || isSubmitting}
            className="px-6 py-2"
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
