import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/api/authService';
import { 
  InputField, 
  Button, 
  Card, 
  CardContent,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter
} from '../../components/ui';
import { Lock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import type { ResetPasswordRequest } from '@packages/contracts';

/**
 * ResetPasswordScreen - Sprint #15 Task 2.4
 * 
 * Permite a usuarios restablecer su contraseña usando token del email.
 * 
 * Flow:
 * 1. Usuario hace click en link del email: /reset-password/:token
 * 2. Extrae token de URL params
 * 3. Ingresa nueva contraseña + confirmación
 * 4. Validación: contraseñas coinciden + fortaleza (8 chars, mayúscula, minúscula, número)
 * 5. POST /api/v1/auth/reset-password { token, password }
 * 6. Success: redirect a /auth/login con mensaje
 * 7. Error: mostrar mensaje específico (token expirado/inválido)
 * 
 * Security:
 * - Token JWT verificado en backend (signature + DB + expiration)
 * - One-time use: token se borra de DB después de uso exitoso
 * - Password hashing con Argon2id en backend
 * 
 * UX Considerations:
 * - Validación en tiempo real de fortaleza de contraseña
 * - Feedback claro si token expiró (botón para solicitar nuevo)
 * - Auto-redirect a login después de 3 segundos en success
 */
export const ResetPasswordScreen: React.FC = () => {
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

  /**
   * Validate token exists in URL params
   */
  useEffect(() => {
    if (!token) {
      setTokenError(true);
      setErrorMessage(t('auth.resetPassword.error.tokenInvalid'));
    }
  }, [token, t]);

  /**
   * Validate password strength
   * Must match ResetPasswordRequest schema from contracts
   */
  const validatePassword = (): boolean => {
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
  };

  /**
   * Validate password confirmation matches
   */
  const validateConfirmPassword = (): boolean => {
    setConfirmPasswordError('');
    
    if (password !== confirmPassword) {
      setConfirmPasswordError(t('auth.resetPassword.passwordMismatch'));
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   * Validates both passwords and calls backend API
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate('/auth/login', { 
          state: { 
            message: t('auth.resetPassword.successMessage') 
          } 
        });
      }, 3000);

    } catch (error: any) {
      console.error('Reset password error:', error);
      
      // Handle specific error cases
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 400 && message?.includes('expired')) {
        setErrorMessage(t('auth.resetPassword.error.tokenExpired'));
        setTokenError(true);
      } else if (status === 400 && message?.includes('invalid')) {
        setErrorMessage(t('auth.resetPassword.error.tokenInvalid'));
        setTokenError(true);
      } else if (status === 403) {
        setErrorMessage(t('auth.resetPassword.error.accountDeactivated'));
      } else {
        setErrorMessage(
          message || t('auth.resetPassword.error.unknown')
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle manual redirect to login from success modal
   */
  const handleGoToLogin = () => {
    navigate('/auth/login', { 
      state: { 
        message: t('auth.resetPassword.successMessage') 
      } 
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('auth.resetPassword.title')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('auth.resetPassword.subtitle')}
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            {tokenError ? (
              /* Token Invalid/Expired State */
              <div className="space-y-6">
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-destructive">
                        {t('auth.resetPassword.error.title')}
                      </h3>
                      <p className="mt-2 text-sm text-destructive/80">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions for token error */}
                <div className="space-y-3">
                  <Link to="/auth/forgot-password" className="block">
                    <Button
                      variant="filled"
                      size="lg"
                      className="w-full"
                    >
                      {t('auth.resetPassword.error.requestNewLink')}
                    </Button>
                  </Link>
                  <Link to="/auth/login" className="block">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="w-full"
                    >
                      {t('auth.forgotPassword.backToLogin')}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* Reset Password Form */
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Instructions */}
                <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Lock className="h-5 w-5 text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        {t('auth.resetPassword.instructions')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* New Password Field */}
                <InputField
                  label={t('auth.resetPassword.newPasswordLabel')}
                  placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
                  icon={Lock}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  onBlur={validatePassword}
                  error={passwordError}
                  required
                  helperText={t('auth.resetPassword.newPasswordHelper')}
                  disabled={isLoading}
                />

                {/* Confirm Password Field */}
                <InputField
                  label={t('auth.resetPassword.confirmPasswordLabel')}
                  placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                  icon={Lock}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onBlur={validateConfirmPassword}
                  error={confirmPasswordError}
                  required
                  helperText={t('auth.resetPassword.confirmPasswordHelper')}
                  disabled={isLoading}
                />

                {/* Error Message */}
                {errorMessage && !tokenError && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      <p className="ml-2 text-sm text-destructive font-medium">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  htmlType="submit"
                  variant="filled"
                  size="lg"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading 
                    ? t('auth.resetPassword.submitting')
                    : t('auth.resetPassword.submitButton')
                  }
                </Button>

                {/* Back to Login */}
                <div className="text-center">
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {t('auth.forgotPassword.backToLogin')}
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Success Modal */}
        <Modal open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <ModalContent className="max-w-md">
            <ModalHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <ModalTitle className="text-center">
                {t('auth.resetPassword.successTitle')}
              </ModalTitle>
            </ModalHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {t('auth.resetPassword.successMessage')}
              </p>

              <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-center">
                <p className="text-xs text-blue-800">
                  {t('auth.resetPassword.redirecting')}
                </p>
              </div>
            </div>

            <ModalFooter className="mt-6">
              <Button
                onPress={handleGoToLogin}
                variant="filled"
                size="default"
                className="w-full"
              >
                <span className="flex items-center justify-center">
                  {t('auth.resetPassword.goToLogin')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};
