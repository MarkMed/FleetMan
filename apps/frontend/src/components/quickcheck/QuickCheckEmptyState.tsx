import React from 'react';
import { Button } from '@components/ui';

interface QuickCheckEmptyStateProps {
  onAddFirstItem: () => void;
}

export const QuickCheckEmptyState: React.FC<QuickCheckEmptyStateProps> = ({ 
  onAddFirstItem 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon */}
      <div className="mb-6">
        <svg 
          className="w-24 h-24 text-muted-foreground opacity-50" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" 
          />
        </svg>
      </div>

      {/* Message */}
      <div className="text-center mb-8 max-w-md">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No hay items de verificación
        </h3>
        <p className="text-muted-foreground">
          Agrega items para verificar en el formulario preventivo de esta máquina
        </p>
      </div>

      {/* CTA Button */}
      <Button 
        variant="filled" 
        size="default"
        onPress={onAddFirstItem}
        className="gap-2"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 4v16m8-8H4" 
          />
        </svg>
        Agregar primer item
      </Button>
    </div>
  );
};
