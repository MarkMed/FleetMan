import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/api/authService';
import { toast } from '@components/ui';
import type { ResetPasswordRequest } from '@packages/contracts';

/**
 * ResetPasswordViewModel - Sprint #15 Task 2.4
 * 
 * MVVM-lite pattern: Separates business logic from UI presentation
 * 
 * Responsibilities:
 * - Extract token from URL params
 * - Form state management (password, confirmPassword)
 * - Password strength validation (8 chars, upper, lower, number)
 * - Password matching validation
 * - API calls (authService.resetPassword)
 * - Error handling (expired token, invalid token, account deactivated)
 * - Success modal + auto-redirect to login
 * 
 * Returns:
 * - State: passwords, errors, loading, modals, tokenError
 * - Actions: handlePasswordChange, handleConfirmChange, handleSubmit, goToLogin
 * - Computed: canSubmit, hasError, isTokenValid
 */
export const useResetPasswordViewModel = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  // Form state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [tokenError, setTokenError] = useState(false);
  const [redirectTimeoutId, setRedirectTimeoutId] = useState<NodeJS.Timeout | null>(null);

  /**
   * Validate token exists in URL params on mount
   */
  useEffect(() => {
    if (!token) {
      setTokenError(true);
      setErrorMessage(t('auth.resetPassword.error.tokenInvalid'));
    }
  }, [token, t]);

  /**
   * Cleanup redirect timeout on unmount or when modal closes
   */
  useEffect(() => {
    return () => {
      if (redirectTimeoutId) {
        clearTimeout(redirectTimeoutId);
      }
    };
  }, [redirectTimeoutId]);

  /**
   * Validate password strength
   * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number
   */
  const validatePassword = useCallback((): boolean => {
    setPasswordError('');
    
    if (!password) {
      setPasswordError(t('auth.resetPassword.passwordRequired'));
      return false;
    }

    if (password.length < 8) {
      setPasswordError(t('auth.resetPassword.passwordMinLength'));
      return false;
    }

    // Regex: at least 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      setPasswordError(t('auth.resetPassword.passwordComplexity'));
      return false;
    }

    return true;
  }, [password, t]);

  /**
   * Validate password confirmation matches
   */
  const validateConfirmPassword = useCallback((): boolean => {
    setConfirmPasswordError('');
    
    if (password !== confirmPassword) {
      setConfirmPasswordError(t('auth.resetPassword.passwordMismatch'));
      return false;
    }

    return true;
  }, [password, confirmPassword, t]);

  /**
   * Handle password input change
   * Clears error when user types
   */
  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    
    if (passwordError) {
      setPasswordError('');
    }
    if (errorMessage) {
      setErrorMessage('');
    }
  }, [passwordError, errorMessage]);

  /**
   * Handle confirm password input change
   * Clears error when user types
   */
  const handleConfirmPasswordChange = useCallback((value: string) => {
    setConfirmPassword(value);
    
    if (confirmPasswordError) {
      setConfirmPasswordError('');
    }
  }, [confirmPasswordError]);

  /**
   * Handle form submission
   * Validates passwords, calls API, shows success modal with auto-redirect
   */
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Validate all fields
    const isPasswordValid = validatePassword();
    const isConfirmValid = validateConfirmPassword();

    if (!isPasswordValid || !isConfirmValid) {
      return;
    }

    if (!token) {
      setErrorMessage(t('auth.resetPassword.error.tokenInvalid'));
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const payload: ResetPasswordRequest = {
        token: token.trim(),
        password: password
      };

      await authService.resetPassword(payload);

      // Success: show modal and auto-redirect to login
      setShowSuccessModal(true);
      
      // Clear any existing timeout
      if (redirectTimeoutId) {
        clearTimeout(redirectTimeoutId);
      }
      
      // Auto-redirect after 3 seconds and store timeout ID for cleanup
      const timeoutId = setTimeout(() => {
        navigate('/auth/login', { 
          state: { 
            message: t('auth.resetPassword.successMessage') 
          } 
        });
      }, 3000);
      
      setRedirectTimeoutId(timeoutId);

    } catch (error: any) {
      console.error('Reset password error:', error);
      
      // Handle specific error cases using error.code instead of parsing message text
      const status = error?.response?.status;
      const errorCode = error?.response?.data?.error; // Backend sends structured error codes
      const message = error?.response?.data?.message;
      let errorMsg = '';

      // Use error codes (stable) instead of parsing localized message strings
      if (status === 400 || errorCode === 'INVALID_OR_EXPIRED_TOKEN') {
        // Token invalid or expired - show token error UI
        if (message?.toLowerCase().includes('expirado') || message?.toLowerCase().includes('expired')) {
          errorMsg = t('auth.resetPassword.error.tokenExpired');
        } else {
          errorMsg = t('auth.resetPassword.error.tokenInvalid');
        }
        setErrorMessage(errorMsg);
        setTokenError(true);
      } else if (status === 403 || errorCode === 'ACCOUNT_DEACTIVATED') {
        errorMsg = t('auth.resetPassword.error.accountDeactivated');
        setErrorMessage(errorMsg);
      } else {
        errorMsg = message || t('auth.resetPassword.error.unknown');
        setErrorMessage(errorMsg);
      }

      // Show toast notification
      toast.error({
        title: t('auth.resetPassword.errorTitle'),
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  }, [password, token, validatePassword, validateConfirmPassword, navigate, t]);

  /**
   * Handle manual redirect to login from success modal
   */
  const handleGoToLogin = useCallback(() => {
    // Clear timeout since user is manually navigating
    if (redirectTimeoutId) {
      clearTimeout(redirectTimeoutId);
      setRedirectTimeoutId(null);
    }
    
    navigate('/auth/login', { 
      state: { 
        message: t('auth.resetPassword.successMessage') 
      } 
    });
  }, [navigate, t, redirectTimeoutId]);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setPasswordError('');
    setConfirmPasswordError('');
    setErrorMessage('');
  }, []);

  return {
    // State
    state: {
      password,
      confirmPassword,
      passwordError,
      confirmPasswordError,
      errorMessage,
      isLoading,
      showSuccessModal,
      tokenError,
      token,
    },

    // Actions
    actions: {
      handlePasswordChange,
      handleConfirmPasswordChange,
      handleSubmit,
      handleGoToLogin,
      validatePassword,
      validateConfirmPassword,
      clearErrors,
    },

    // Computed
    computed: {
      canSubmit: !isLoading && password.length > 0 && confirmPassword.length > 0 && !tokenError,
      hasError: !!passwordError || !!confirmPasswordError || !!errorMessage,
      isTokenValid: !!token && !tokenError,
    },

    // i18n helper
    t,
  };
};
