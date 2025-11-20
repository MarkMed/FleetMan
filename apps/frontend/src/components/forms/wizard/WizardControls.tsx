import React from 'react';
import { Button } from '../../ui/Button';
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
  submitLabel = 'Completar',
  cancelLabel = 'Cancelar',
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-between pt-6 border-t border-gray-200', className)}>
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
            className="text-gray-500 hover:text-gray-700"
          >
            {cancelLabel}
          </Button>
        )}
      </div>

      {/* Right side - Next/Submit button */}
      <div>
        {isLastStep ? (
          <Button
            variant="filled"
            onPress={onSubmit}
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
            className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {submitLabel}
          </Button>
        ) : (
          <Button
            variant="filled"
            onPress={onNext}
            disabled={!isValid || isSubmitting}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
};