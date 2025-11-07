import { create } from 'zustand';
import * as React from 'react';

/**
 * Modal Variant Types
 * Defines different modal styles and behaviors
 */
export type ModalVariant = 'default' | 'confirmation' | 'info' | 'warning' | 'danger' | 'success';

/**
 * Modal Configuration Interface
 * Defines all possible modal properties and callbacks
 */
export interface ModalConfig {
  /**
   * Modal title displayed in the header
   */
  title?: string;
  /**
   * Modal description/subtitle text
   */
  description?: string;
  /**
   * Custom React content to display in modal body
   */
  content?: React.ReactNode;
  /**
   * Modal variant affecting styling and button colors
   * @default 'default'
   */
  variant?: ModalVariant;
  /**
   * Whether to show the X close button
   * @default true
   */
  showCloseButton?: boolean;
  /**
   * Whether modal can be closed by clicking overlay or pressing Esc
   * @default true
   */
  dismissible?: boolean;
  /**
   * Custom width for the modal
   * @default 'md' (max-w-lg)
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /**
   * Callback fired when confirm/primary button is clicked
   */
  onConfirm?: () => void | Promise<void>;
  /**
   * Callback fired when cancel/secondary button is clicked
   */
  onCancel?: () => void;
  /**
   * Callback fired when modal is closed (any method)
   */
  onClose?: () => void;
  /**
   * Text for the confirm/primary button
   */
  confirmText?: string;
  /**
   * Text for the cancel/secondary button
   */
  cancelText?: string;
  /**
   * Whether to show confirm button
   * @default true for confirmation modals, false for info modals
   */
  showConfirm?: boolean;
  /**
   * Whether to show cancel button
   * @default true for confirmation modals, false for info modals
   */
  showCancel?: boolean;
  /**
   * Whether confirm button should show loading state
   * @default false
   */
  loading?: boolean;
}

/**
 * Modal State Interface
 * Represents the current state of the global modal
 */
interface ModalState {
  /**
   * Whether the modal is currently open
   */
  isOpen: boolean;
  /**
   * Current modal configuration
   */
  config: ModalConfig;
  /**
   * Internal promise resolver for confirmation modals
   * Used to resolve promises returned by modal.confirm()
   */
  resolver?: (value: boolean) => void;
}

/**
 * Modal Store Actions Interface
 * Defines all actions available for modal management
 */
interface ModalActions {
  /**
   * Show modal with given configuration
   */
  showModal: (config: ModalConfig) => void;
  /**
   * Hide/close the current modal
   */
  hideModal: () => void;
  /**
   * Show confirmation modal and return a promise
   * Promise resolves to true if confirmed, false if cancelled
   */
  showConfirmation: (config: Omit<ModalConfig, 'variant'>) => Promise<boolean>;
  /**
   * Update modal configuration while it's open
   */
  updateModal: (config: Partial<ModalConfig>) => void;
  /**
   * Set loading state for modal buttons
   */
  setLoading: (loading: boolean) => void;
}

/**
 * Complete Modal Store Type
 */
export type ModalStore = ModalState & ModalActions;

/**
 * Default modal configuration
 */
const defaultConfig: ModalConfig = {
  variant: 'default',
  showCloseButton: true,
  dismissible: true,
  size: 'md',
  showConfirm: true,
  showCancel: true,
  loading: false,
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
};

/**
 * Global Modal Store
 * 
 * Manages the state and configuration of the global modal system.
 * Provides actions to show, hide, and configure modals from anywhere in the app.
 * 
 * @example
 * ```tsx
 * import { useModalStore } from '@store/slices/modalSlice';
 * 
 * function SomeComponent() {
 *   const { showModal, showConfirmation } = useModalStore();
 *   
 *   const handleShow = () => {
 *     showModal({
 *       title: 'Information',
 *       description: 'This is a global modal',
 *       variant: 'info'
 *     });
 *   };
 *   
 *   const handleConfirm = async () => {
 *     const confirmed = await showConfirmation({
 *       title: 'Delete Item',
 *       description: 'Are you sure you want to delete this item?',
 *     });
 *     if (confirmed) {
 *       // Do deletion
 *     }
 *   };
 * }
 * ```
 */
export const useModalStore = create<ModalStore>((set, get) => ({
  // Initial State
  isOpen: false,
  config: defaultConfig,
  resolver: undefined,

  // Actions
  showModal: (config: ModalConfig) => {
    set({
      isOpen: true,
      config: { ...defaultConfig, ...config },
      resolver: undefined, // Clear any previous resolver
    });
  },

  hideModal: () => {
    const { resolver } = get();
    
    // If there's a pending promise, resolve it as false (cancelled)
    if (resolver) {
      resolver(false);
    }
    
    // Call onClose callback if provided
    const { config } = get();
    config.onClose?.();
    
    set({
      isOpen: false,
      config: defaultConfig,
      resolver: undefined,
    });
  },

  showConfirmation: (config: Omit<ModalConfig, 'variant'>) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        config: {
          ...defaultConfig,
          ...config,
          variant: 'confirmation',
          showConfirm: true,
          showCancel: true,
        },
        resolver: resolve,
      });
    });
  },

  updateModal: (config: Partial<ModalConfig>) => {
    const currentConfig = get().config;
    set({
      config: { ...currentConfig, ...config },
    });
  },

  setLoading: (loading: boolean) => {
    const currentConfig = get().config;
    set({
      config: { ...currentConfig, loading },
    });
  },
}));