import React from 'react';
import { cn } from '../../../utils/cn';

interface WizardProgressProps {
  /** Número total de steps */
  totalSteps: number;
  /** Step actual (0-based) */
  currentStep: number;
  /** Steps que han sido visitados */
  visitedSteps: Set<number>;
  /** Array con títulos de los steps */
  stepTitles?: string[];
  /** Permitir hacer clic en steps visitados */
  allowStepClick?: boolean;
  /** Callback cuando se hace clic en un step */
  onStepClick?: (stepIndex: number) => void;
  /** Clase CSS adicional */
  className?: string;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  totalSteps,
  currentStep,
  visitedSteps,
  stepTitles = [],
  allowStepClick = false,
  onStepClick,
  className,
}) => {
  const steps = Array.from({ length: totalSteps }, (_, index) => index);

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex === currentStep) return 'current';
    if (visitedSteps.has(stepIndex) && stepIndex < currentStep) return 'completed';
    if (visitedSteps.has(stepIndex)) return 'visited';
    return 'pending';
  };

  const getStepClasses = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    const isClickable = allowStepClick && visitedSteps.has(stepIndex);
    
    return cn(
      // Base classes
      'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-all duration-200',
      
      // Status-based styling
      {
        // Current step
        'bg-indigo-600 border-indigo-600 text-white shadow-md': status === 'current',
        
        // Completed step
        'bg-green-500 border-green-500 text-white': status === 'completed',
        
        // Visited step (but not current)
        'bg-indigo-100 border-indigo-300 text-indigo-600': status === 'visited',
        
        // Pending step
        'bg-gray-100 border-gray-300 text-gray-500': status === 'pending',
        
        // Clickable
        'cursor-pointer hover:scale-105 hover:shadow-md': isClickable,
        'cursor-default': !isClickable,
      }
    );
  };

  const getConnectorClasses = (stepIndex: number) => {
    const isCompleted = visitedSteps.has(stepIndex) && stepIndex < currentStep;
    
    return cn(
      'flex-1 h-1 mx-2 rounded transition-all duration-300',
      {
        'bg-green-500': isCompleted,
        'bg-gray-200': !isCompleted,
      }
    );
  };

  const handleStepClick = (stepIndex: number) => {
    if (allowStepClick && visitedSteps.has(stepIndex) && onStepClick) {
      onStepClick(stepIndex);
    }
  };

  return (
    <div className={cn('w-full py-4', className)}>
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((stepIndex) => (
          <React.Fragment key={stepIndex}>
            {/* Step Circle */}
            <div
              className={getStepClasses(stepIndex)}
              onClick={() => handleStepClick(stepIndex)}
              role={allowStepClick && visitedSteps.has(stepIndex) ? 'button' : undefined}
              tabIndex={allowStepClick && visitedSteps.has(stepIndex) ? 0 : undefined}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && allowStepClick && visitedSteps.has(stepIndex)) {
                  handleStepClick(stepIndex);
                }
              }}
            >
              {getStepStatus(stepIndex) === 'completed' ? (
                // Checkmark for completed steps
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                // Step number
                <span>{stepIndex + 1}</span>
              )}
            </div>

            {/* Connector Line (except for last step) */}
            {stepIndex < totalSteps - 1 && (
              <div className={getConnectorClasses(stepIndex)} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Titles */}
      {stepTitles.length > 0 && (
        <div className="flex justify-between">
          {stepTitles.map((title, index) => (
            <div
              key={index}
              className={cn(
                'text-sm text-center flex-1 px-1',
                {
                  'text-indigo-600 font-medium': index === currentStep,
                  'text-green-600 font-medium': getStepStatus(index) === 'completed',
                  'text-gray-600': index !== currentStep && getStepStatus(index) !== 'completed',
                }
              )}
            >
              {title}
            </div>
          ))}
        </div>
      )}

      {/* Progress Text */}
      <div className="text-center mt-2">
        <span className="text-sm text-gray-500">
          Paso {currentStep + 1} de {totalSteps}
        </span>
      </div>
    </div>
  );
};