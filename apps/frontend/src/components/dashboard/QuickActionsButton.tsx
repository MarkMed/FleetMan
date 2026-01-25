import React from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@utils/cn';

/**
 * QuickActionsButton - Float Action Button (FAB)
 * 
 * Botón flotante circular ubicado en la esquina inferior derecha del Dashboard.
 * Abre el modal de acciones rápidas al hacer clic.
 * 
 * Sprint #14 Task 2.1c: QuickActions System
 * 
 * Features:
 * - Fixed positioning (bottom-right)
 * - High z-index to float above all content
 * - Smooth hover animations (scale + shadow)
 * - Accesible con aria-label
 * - Icon: Zap (lightning bolt) para indicar "acciones rápidas"
 * 
 * @example
 * ```tsx
 * <QuickActionsButton onPress={() => setModalOpen(true)} />
 * ```
 */

interface QuickActionsButtonProps {
  /**
   * Callback ejecutado al hacer clic en el botón flotante
   */
  onPress: () => void;
  
  /**
   * Clases CSS adicionales (opcional)
   */
  className?: string;
  
  // Strategic future: Badge with notification count
  // notificationCount?: number;
  
  // Strategic future: Cambiar posición del FAB
  // position?: 'bottom-right' | 'bottom-left' | 'top-right';
}

export const QuickActionsButton: React.FC<QuickActionsButtonProps> = ({
  onPress,
  className,
}) => {
  return (
    <button
      onClick={onPress}
      aria-label="Acciones rápidas"
      className={cn(
        // Fixed positioning - bottom-right corner
        'fixed bottom-6 right-6 z-50',
        
        // Size and shape - circular FAB
        'h-14 w-14 rounded-full',
        
        // Styling - primary theme colors
        'bg-primary text-primary-foreground',
        'shadow-lg',
        
        // Hover animations - scale up + enhanced shadow
        'hover:scale-110 hover:shadow-xl',
        
        // Active state - slight scale down for feedback
        'active:scale-100',
        
        // Transitions - smooth animations
        'transition-all duration-200 ease-out',
        
        // Focus states - accessibility
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        
        // Icon centering
        'flex items-center justify-center',
        
        className
      )}
    >
      <Zap className="h-6 w-6" />
      
      {/* Strategic future: Notification badge
      {notificationCount && notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}
      */}
    </button>
  );
};
