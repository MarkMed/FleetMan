import * as React from 'react';
import { useModalStore } from '@store/slices/modalSlice';
import { modalVariantStrategyFactory } from '@strategies/modalVariantStrategies';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Button,
} from '@components/ui';
import { Spinner } from '@components/ui';
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
 * - Uses Strategy pattern for variant-specific styling and behavior
 * - Handles different modal variants (info, warning, danger, success, confirmation)
 * - Supports custom content rendering
 * - Manages button states and callbacks
 * - Responsive sizing
 * - Extensible through custom variant strategies
 * 
 * Architecture:
 * - Uses ModalVariantStrategyFactory to determine styling and behavior
 * - Each variant has its own strategy implementing ModalVariantStrategy interface
 * - Easy to extend with new variants without modifying existing code
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
   * Get the appropriate strategy for the current modal variant
   */
  const getVariantStrategy = () => {
    const variant = config.variant !== "default" ? config.variant : (config.feedbackVariant !== undefined ? config.feedbackVariant : 'info');
    const strategyResult = modalVariantStrategyFactory.getStrategy(variant);
    console.log('Using modal strategy for variant:', config, strategyResult);
    return strategyResult;
  };

  /**
   * Get modal border classes based on variant and showColoredBorder
   */
  const getBorderClasses = () => {
    if (!config.showColoredBorder) {
      return ''; // Use default border from Modal component
    }

    return getVariantStrategy().getBorderClasses();
  };

  /**
   * Get background accent classes for colored border modals
   */
  const getBackgroundAccent = () => {
    if (!config.showColoredBorder) {
      return '';
    }

    return getVariantStrategy().getBackgroundAccent();
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
    return getVariantStrategy().getConfirmButtonVariant();
  };

  /**
   * Get cancel button variant based on modal variant
   */
  const getCancelButtonVariant = (): "destructive" | "warning" | "success" | "filled" | "ghost" | "link" | "outline" | "secondary" => {
    return getVariantStrategy().getCancelButtonVariant();
  };

  /**
   * Get title color classes based on modal variant
   */
  const getTitleColorClasses = () => {
    return getVariantStrategy().getTitleColorClasses();
  };

  const isFeedbackLoading = config.mode === 'feedback-loading';
  const isFeedbackMessage = config.mode === 'feedback-message';

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
        {(config.title) && (
          <ModalHeader>
            {config.title && (
              <ModalTitle className={cn(
                // Color the title based on variant using strategy
                getTitleColorClasses()
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

        {/* Feedback Loading */}
        {isFeedbackLoading && (
          <div className="px-6 py-8 flex flex-col items-center gap-4 text-center">
            <Spinner />
            {config.description && <ModalDescription>{config.description}</ModalDescription>}
          </div>
        )}

        {/* Content Section */}
        {!isFeedbackLoading && config.content && (
          <div className="px-6 py-4">
            {config.content}
          </div>
        )}

        {/* Footer Section - Only show if there are buttons to display */}
        {(config.showConfirm || config.showCancel) && !isFeedbackLoading && (
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
