import { useTranslation } from "react-i18next";
import { modal } from "@helpers/modal";

/**
 * Hook for handling machine registration confirmation flow.
 * 
 * Provides a modal-based confirmation dialog before executing the actual
 * registration API call. Improves UX by giving users a final chance to
 * review and cancel the action.
 * 
 * @returns {Object} Hook utilities
 * @returns {Function} openConfirmationModal - Opens confirmation modal and executes callback if confirmed
 * 
 * @example
 * ```tsx
 * const { openConfirmationModal } = useRegistrationConfirmation();
 * 
 * const handleSubmit = () => {
 *   openConfirmationModal(async () => {
 *     await createMachine(data);
 *   });
 * };
 * ```
 */
export const useRegistrationConfirmation = () => {
  const { t } = useTranslation();

  /**
   * Opens a confirmation modal and executes the provided callback if user confirms.
   * 
   * @param onConfirm - Async callback to execute after user confirms
   * 
   * @example
   * ```tsx
   * openConfirmationModal(async () => {
   *   await apiCall();
   *   navigate('/success');
   * });
   * ```
   */
  const openConfirmationModal = async (onConfirm: () => void | Promise<void>) => {
    const confirmed = await modal.confirm({
      title: t('machines.registration.confirmation.title'),
      description: t('machines.registration.confirmation.description'),
      confirmText: t('machines.registration.confirmation.confirmButton'),
      cancelText: t('machines.registration.confirmation.cancelButton'),
      action: 'default', // Positive confirmation action (not destructive)
    });

    if (confirmed) {
      await onConfirm();
    }
  };

  // TODO: Future enhancement - Add telemetry tracking for confirmation acceptance/rejection rates
  // const trackConfirmationDecision = (confirmed: boolean) => {
  //   analytics.track('machine_registration_confirmation', { confirmed });
  // };

  // TODO: Future enhancement - Add option to show registration summary in modal
  // const openConfirmationModalWithSummary = (data: MachineRegistrationData, onConfirm: () => void) => {
  //   // Show formatted summary of brand, model, serial number, etc.
  // };

  return {
    openConfirmationModal,
  };
};
