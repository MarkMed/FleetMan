import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/api/authService';
import { toast } from '@components/ui';
import type { ForgotPasswordRequest } from '@packages/contracts';

/**
 * ForgotPasswordViewModel - Sprint #15 Task 2.4
 * 
 * MVVM-lite pattern: Separates business logic from UI presentation
 * 
 * Responsibilities:
 * - Form state management (email)
 * - Validation logic
 * - API calls (authService.forgotPassword)
 * - Modal state (success/error)
 * - Loading states
 * 
 * Returns:
 * - State: email, errors, loading, modals
 * - Actions: handleEmailChange, handleSubmit, closeModal
 * - Computed: canSubmit, hasError
 */
export const useForgotPasswordViewModel = () => {
  const { t } = useTranslation();

  // Form state
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Validate email format
   * Returns true if valid, false otherwise
   */
  const validateEmail = useCallback((): boolean => {
    setEmailError('');

    if (!email.trim()) {
      setEmailError(t('auth.forgotPassword.emailRequired'));
      return false;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(t('auth.forgotPassword.invalidEmail'));
      return false;
    }

    return true;
  }, [email, t]);

  /**
   * Handle email input change
   * Clears error when user types
   */
  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    
    // Clear error when user starts typing
    if (emailError) {
      setEmailError('');
    }
    if (errorMessage) {
      setErrorMessage('');
    }
  }, [emailError, errorMessage]);

  /**
   * Handle form submission
   * Validates email, calls API, shows success modal
   */
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const payload: ForgotPasswordRequest = {
        email: email.trim().toLowerCase(),
      };

      await authService.forgotPassword(payload);

      // Backend always returns success (security best practice)
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Forgot password error:', error);

      const errorMsg = error?.response?.data?.message ||
        t('auth.forgotPassword.error.unknown');

      // Show error in UI (inline message)
      setErrorMessage(errorMsg);
      
      // Show toast notification
      toast.error({
        title: t('auth.forgotPassword.errorTitle'),
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  }, [email, validateEmail, t]);

  /**
   * Close success modal
   * Keeps email in form for retry
   */
  const handleCloseModal = useCallback(() => {
    setShowSuccessModal(false);
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setEmailError('');
    setErrorMessage('');
  }, []);

  return {
    // State
    state: {
      email,
      emailError,
      errorMessage,
      isLoading,
      showSuccessModal,
    },

    // Actions
    actions: {
      handleEmailChange,
      handleSubmit,
      handleCloseModal,
      clearErrors,
    },

    // Computed
    computed: {
      canSubmit: !isLoading && email.trim().length > 0,
      hasError: !!emailError || !!errorMessage,
    },

    // i18n helper
    t,
  };
};
