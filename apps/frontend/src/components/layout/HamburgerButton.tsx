import React from 'react';
import { cn } from '@utils/cn';

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * HamburgerButton - Botón animado que alterna entre menú hamburguesa (≡) y X
 * 
 * Características:
 * - Transición suave entre estados
 * - Accesibilidad completa con ARIA
 * - Responsive y touch-friendly
 */
export const HamburgerButton: React.FC<HamburgerButtonProps> = ({ 
  isOpen, 
  onClick,
  className 
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      aria-expanded={isOpen}
      aria-controls="navigation-drawer"
      className={cn(
        'relative flex flex-col justify-center items-center',
        'w-10 h-10 p-2',
        'rounded-md',
        'hover:bg-accent transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
    >
      {/* Top line */}
      <span
        className={cn(
          'block h-0.5 w-6 bg-foreground rounded-full',
          'transition-all duration-300 ease-in-out',
          isOpen && 'rotate-45 translate-y-1.5'
        )}
      />
      
      {/* Middle line */}
      <span
        className={cn(
          'block h-0.5 w-6 bg-foreground rounded-full my-1',
          'transition-all duration-300 ease-in-out',
          isOpen && 'opacity-0 scale-0'
        )}
      />
      
      {/* Bottom line */}
      <span
        className={cn(
          'block h-0.5 w-6 bg-foreground rounded-full',
          'transition-all duration-300 ease-in-out',
          isOpen && '-rotate-45 -translate-y-1.5'
        )}
      />
    </button>
  );
};
