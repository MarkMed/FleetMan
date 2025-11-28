import { useModalStore, type ModalConfig, type ModalVariant } from '@store/slices/modalSlice';

/**
 * Configuration for info/warning/danger modals
 * These are display-only modals without confirmation
 */
interface InfoModalConfig extends Omit<ModalConfig, 'variant' | 'showConfirm' | 'showCancel' | 'onConfirm' | 'onCancel'> {
  /**
   * Text for the dismiss button
   * @default 'Entendido'
   */
  dismissText?: string;
}

/**
 * Configuration for confirmation modals
 * These modals return a promise that resolves to true/false
 */
interface ConfirmationModalConfig extends Omit<ModalConfig, 'variant'> {
  /**
   * The action being confirmed (affects button styling)
   * @default 'default'
   */
  action?: 'default' | 'danger' | 'warning';
}

/**
 * Global Modal Helper Functions
 * 
 * Provides a simple API to control modals from anywhere in the application.
 * These functions interact with the global modal store behind the scenes.
 * 
 * @example
 * ```tsx
 * import { modal } from '@helpers/modal';
 * 
 * // Show info modal
 * modal.info({
 *   title: 'Success',
 *   description: 'Operation completed successfully'
 * });
 * 
 * // Show confirmation modal
 * const confirmed = await modal.confirm({
 *   title: 'Delete Item',
 *   description: 'This action cannot be undone',
 *   action: 'danger'
 * });
 * 
 * if (confirmed) {
 *   // Proceed with deletion
 * }
 * ```
 */
class ModalHelper {
  /**
   * Gets the modal store instance
   * Private method to access store actions
   */
  private getStore() {
    return useModalStore.getState();
  }

  /**
   * Show a loading modal (feedback-loading)
   */
  showLoading(message?: string): void {
    this.getStore().showLoadingModal(message);
  }

  /**
   * Show a simple feedback modal (feedback-message)
   */
  showFeedback(config: {
    variant?: Exclude<ModalVariant, 'default' | 'confirmation'>;
    title?: string;
    description?: string;
    actionLabel?: string;
    dismissible?: boolean;
    showCancel?: boolean;
    onConfirm?: () => void | Promise<void>;
  }): void {
    this.getStore().showFeedbackModal(config);
  }

  /**
   * Show a custom modal with full configuration control
   * 
   * @param config - Complete modal configuration
   * 
   * @example
   * ```tsx
   * modal.show({
   *   title: 'Custom Modal',
   *   content: <MyCustomComponent />,
   *   variant: 'info',
   *   size: 'lg',
   *   showConfirm: false
   * });
   * ```
   */
  show(config: ModalConfig): void {
    this.getStore().showModal(config);
  }

  /**
   * Hide/close the currently open modal
   * 
   * @example
   * ```tsx
   * modal.hide();
   * ```
   */
  hide(): void {
    this.getStore().hideModal();
  }

  /**
   * Show a confirmation modal and return a promise
   * Promise resolves to true if confirmed, false if cancelled/dismissed
   * 
   * @param config - Confirmation modal configuration
   * @returns Promise that resolves to boolean (confirmed or not)
   * 
   * @example
   * ```tsx
   * const deleteConfirmed = await modal.confirm({
   *   title: 'Eliminar Máquina',
   *   description: '¿Estás seguro? Esta acción no se puede deshacer.',
   *   confirmText: 'Eliminar',
   *   cancelText: 'Cancelar',
   *   action: 'danger'
   * });
   * 
   * if (deleteConfirmed) {
   *   await deleteMachine(machineId);
   * }
   * ```
   */
  async confirm(config: ConfirmationModalConfig): Promise<boolean> {
    const { action = 'default', ...modalConfig } = config;
    
    // Set variant and button texts based on action type
    let variant: ModalVariant = 'confirmation';
    let confirmText = config.confirmText || 'Confirmar';
    let cancelText = config.cancelText || 'Cancelar';
    
    switch (action) {
      case 'danger':
        variant = 'danger';
        confirmText = config.confirmText || 'Eliminar';
        break;
      case 'warning':
        variant = 'warning';
        confirmText = config.confirmText || 'Continuar';
        break;
      default:
        variant = 'confirmation';
        break;
    }

    return this.getStore().showConfirmation({
      ...modalConfig,
      confirmText,
      cancelText,
    });
  }

  /**
   * Show an informational modal (no confirmation needed)
   * 
   * @param config - Info modal configuration
   * 
   * @example
   * ```tsx
   * modal.info({
   *   title: 'Información',
   *   description: 'La operación se completó exitosamente.',
   *   dismissText: 'Entendido'
   * });
   * ```
   */
  info(config: InfoModalConfig): void {
    const { dismissText = 'Entendido', ...modalConfig } = config;
    
    this.getStore().showModal({
      ...modalConfig,
      variant: 'info',
      showConfirm: false,
      showCancel: true,
      showColoredBorder: true,
      cancelText: dismissText,
    });
  }

  /**
   * Show a warning modal (no confirmation needed)
   * 
   * @param config - Warning modal configuration
   * 
   * @example
   * ```tsx
   * modal.warning({
   *   title: 'Advertencia',
   *   description: 'Esta acción puede tener consecuencias inesperadas.',
   *   dismissText: 'He sido advertido'
   * });
   * ```
   */
  warning(config: InfoModalConfig): void {
    const { dismissText = 'Entendido', ...modalConfig } = config;
    
    this.getStore().showModal({
      ...modalConfig,
      variant: 'warning',
      showConfirm: false,
      showCancel: true,
      showColoredBorder: true,
      cancelText: dismissText,
    });
  }

  /**
   * Show an error/danger modal (no confirmation needed)
   * 
   * @param config - Error modal configuration
   * 
   * @example
   * ```tsx
   * modal.error({
   *   title: 'Error',
   *   description: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
   *   dismissText: 'Cerrar'
   * });
   * ```
   */
  error(config: InfoModalConfig): void {
    const { dismissText = 'Cerrar', ...modalConfig } = config;
    
    this.getStore().showModal({
      ...modalConfig,
      variant: 'danger',
      showConfirm: false,
      showCancel: true,
      showColoredBorder: true,
      cancelText: dismissText,
    });
  }

  /**
   * Show a success modal (no confirmation needed)
   * 
   * @param config - Success modal configuration
   * 
   * @example
   * ```tsx
   * modal.success({
   *   title: '¡Éxito!',
   *   description: 'La máquina se ha registrado correctamente.',
   *   dismissText: 'Continuar'
   * });
   * ```
   */
  success(config: InfoModalConfig): void {
    const { dismissText = 'Continuar', ...modalConfig } = config;
    
    this.getStore().showModal({
      ...modalConfig,
      variant: 'success',
      showConfirm: false,
      showCancel: true,
      showColoredBorder: true,
      cancelText: dismissText,
    });
  }

  /**
   * Update the current modal configuration
   * Useful for changing loading states or content dynamically
   * 
   * @param config - Partial configuration to update
   * 
   * @example
   * ```tsx
   * // Show loading state
   * modal.update({ loading: true });
   * 
   * // Update content
   * modal.update({ 
   *   description: 'Processing...',
   *   content: <LoadingSpinner />
   * });
   * ```
   */
  update(config: Partial<ModalConfig>): void {
    this.getStore().updateModal(config);
  }

  /**
   * Set loading state for modal buttons
   * Shortcut for modal.update({ loading })
   * 
   * @param loading - Loading state
   * 
   * @example
   * ```tsx
   * modal.setLoading(true);
   * await performAsyncOperation();
   * modal.setLoading(false);
   * ```
   */
  setLoading(loading: boolean): void {
    this.getStore().setLoading(loading);
  }
}

/**
 * Global modal instance
 * Import this to control modals from anywhere in your application
 */
export const modal = new ModalHelper();

/**
 * Export types for external use
 */
export type { ModalConfig, InfoModalConfig, ConfirmationModalConfig };
