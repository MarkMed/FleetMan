import * as React from 'react';
import { useModalStore } from '@store/slices/modalSlice';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Button
} from '@components/ui';
import { cn } from '@utils/cn';

/**
 * Global Modal Component
 * 
 * Renders the global modal based on the state from the modal store.
 * This component should be placed at the root level of the application
 * (typically in App.tsx) to be available globally.
 * 
 * Features:
 * - Automatically syncs with global modal state
 * - Handles different modal variants (info, warning, danger, success, confirmation)
 * - Supports custom content rendering
 * - Manages button states and callbacks
 * - Responsive sizing
 * 
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <div>
 *       <YourAppContent />
 *       <GlobalModal />
 *       <Toaster />
 *     </div>
 *   );
 * }
 * ```
 */
export function GlobalModal() {
  const { 
    isOpen, 
    config, 
    hideModal, 
    resolver 
  } = useModalStore();

  /**
   * Handle confirm button click
   * Calls onConfirm callback and resolves promise for confirmation modals
   */
  const handleConfirm = async () => {
    try {
      // Call onConfirm callback if provided
      if (config.onConfirm) {
        await config.onConfirm();
      }
      
      // Resolve promise for confirmation modals
      if (resolver) {
        resolver(true);
      }
      
      // Close modal
      hideModal();
    } catch (error) {
      console.error('Error in modal confirm handler:', error);
      // Don't close modal if there's an error
    }
  };

  /**
   * Handle cancel button click
   * Calls onCancel callback and resolves promise as false for confirmation modals
   */
  const handleCancel = () => {
    // Call onCancel callback if provided
    if (config.onCancel) {
      config.onCancel();
    }
    
    // Resolve promise as false for confirmation modals
    if (resolver) {
      resolver(false);
    }
    
    // Close modal
    hideModal();
  };

  /**
   * Handle modal open change (when closed via overlay or escape)
   * Only allows closing if modal is dismissible
   */
  const handleOpenChange = (open: boolean) => {
    if (!open && config.dismissible !== false) {
      handleCancel(); // Treat as cancel/dismiss
    }
  };

  /**
   * Get modal border classes based on variant and showColoredBorder
   */
  const getBorderClasses = () => {
    if (!config.showColoredBorder) {
      return ''; // Use default border from Modal component
    }

    switch (config.variant) {
      case 'danger':
        return 'border-l-4 border-l-red-500 border-t-red-500/40 border-r-red-500/40 border-b-red-500/40';
      case 'warning':
        return 'border-l-4 border-l-yellow-500 border-t-yellow-500/40 border-r-yellow-500/40 border-b-yellow-500/40';
      case 'success':
        return 'border-l-4 border-l-green-500 border-t-green-500/40 border-r-green-500/40 border-b-green-500/40';
      case 'info':
        return 'border-l-4 border-l-blue-500 border-t-blue-500/40 border-r-blue-500/40 border-b-blue-500/40';
      case 'confirmation':
      default:
        return 'border-l-4 border-l-blue-600 border-t-blue-600/40 border-r-blue-600/40 border-b-blue-600/40';
    }
  };

  /**
   * Get background accent classes for colored border modals
   */
  const getBackgroundAccent = () => {
    if (!config.showColoredBorder) {
      return '';
    }

    switch (config.variant) {
      case 'danger':
        return 'bg-gradient-to-r from-red-50/50 via-background to-background dark:from-red-950/40 dark:via-background dark:to-background';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-50/50 via-background to-background dark:from-yellow-950/40 dark:via-background dark:to-background';
      case 'success':
        return 'bg-gradient-to-r from-green-50/50 via-background to-background dark:from-green-950/40 dark:via-background dark:to-background';
      case 'info':
        return 'bg-gradient-to-r from-blue-50/50 via-background to-background dark:from-blue-950/40 dark:via-background dark:to-background';
      case 'confirmation':
      default:
        return 'bg-gradient-to-r from-blue-50/50 via-background to-background dark:from-blue-950/40 dark:via-background dark:to-background';
    }
  };
  const getSizeClasses = () => {
    switch (config.size) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-[95vw] max-h-[95vh]';
      default:
        return 'max-w-lg';
    }
  };

  /**
   * Get button variant based on modal variant
   */
  const getConfirmButtonVariant = (): "destructive" | "warning" | "success" | "filled" | "ghost" | "link" | "outline" | "secondary" => {
    switch (config.variant) {
      case 'danger':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'info':
        return 'filled';
      case 'confirmation':
      default:
        return 'filled';
    }
  };

  /**
   * Get cancel button variant based on modal variant
   */
  const getCancelButtonVariant = (): "destructive" | "warning" | "success" | "filled" | "ghost" | "link" | "outline" | "secondary" => {
    switch (config.variant) {
      case 'danger':
      case 'warning':
        return 'ghost';
      default:
        return 'ghost';
    }
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <ModalContent 
        className={cn(
          'w-full',
          getSizeClasses(),
          getBorderClasses(),
          getBackgroundAccent()
        )}
        showCloseButton={config.showCloseButton}
      >
        {/* Header Section */}
        {(config.title || config.description) && (
          <ModalHeader>
            {config.title && (
              <ModalTitle className={cn(
                // Color the title based on variant
                config.variant === 'danger' && 'text-destructive',
                config.variant === 'warning' && 'text-yellow-600',
                config.variant === 'success' && 'text-green-600',
                config.variant === 'info' && 'text-blue-600'
              )}>
                {config.title}
              </ModalTitle>
            )}
            {config.description && (
              <ModalDescription>
                {config.description}
              </ModalDescription>
            )}
          </ModalHeader>
        )}

        {/* Content Section */}
        {config.content && (
          <div className="px-6 py-4">
            {config.content}
          </div>
        )}

        {/* Footer Section - Only show if there are buttons to display */}
        {(config.showConfirm || config.showCancel) && (
          <ModalFooter>
            <div className="flex gap-3 w-full sm:w-auto">
              {/* Cancel Button */}
              {config.showCancel && (
                <Button
                  variant={getCancelButtonVariant()}
                  onPress={handleCancel}
                  disabled={config.loading}
                  className="flex-1 sm:flex-none"
                >
                  {config.cancelText || 'Cancelar'}
                </Button>
              )}
              
              {/* Confirm Button */}
              {config.showConfirm && (
                <Button
                  variant={getConfirmButtonVariant()}
                  onPress={handleConfirm}
                  loading={config.loading}
                  disabled={config.loading}
                  className="flex-1 sm:flex-none"
                >
                  {config.confirmText || 'Confirmar'}
                </Button>
              )}
            </div>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}