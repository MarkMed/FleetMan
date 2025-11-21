import React from 'react';
import { Button, TimerButton } from '../../ui';
import { cn } from '../../../utils/cn';

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
  previousLabel = 'Anterior',
  nextLabel = 'Siguiente',
  submitLabel = 'Enviar',
  cancelLabel = 'Cancelar',
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-between pt-6 border-t border-border', className)}>
      {/* Left side - Previous/Cancel button */}
      <div className="flex items-center space-x-4">
        {!isFirstStep && (
          <Button
            variant="secondary"
            onPress={onPrevious}
            disabled={isSubmitting}
            className="px-6 py-2"
          >
            {previousLabel}
          </Button>
        )}
        {onCancel && (
          <Button
            variant="ghost"
            onPress={onCancel}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground"
          >
            {cancelLabel}
          </Button>
        )}
      </div>

      {/* Right side - Next/Submit button */}
      <div>
        {isLastStep ? (
          <TimerButton
            startOnRender={false}
            duration={5}
            onAction={onSubmit}
            label={submitLabel}
            timerLabel={(remaining: number) => `${remaining}`}
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