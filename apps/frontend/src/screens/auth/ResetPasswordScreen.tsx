import React from 'react';
import { Link } from 'react-router-dom';
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
import { useResetPasswordViewModel } from '../../viewModels/auth/ResetPasswordViewModel';

/**
 * ResetPasswordScreen - Sprint #15 Task 2.4
 * 
 * MVVM-lite Pattern:
 * - View: Renders UI based on ViewModel state
 * - ViewModel: Handles business logic (validation, API calls, state)
 * - Separation: View has ZERO business logic
 * 
 * Flow:
 * 1. Usuario hace click en link del email: /reset-password/:token
 * 2. ViewModel extrae token de URL params
 * 3. Ingresa nueva contraseña + confirmación
 * 4. ViewModel valida: contraseñas coinciden + fortaleza (8 chars, mayúscula, minúscula, número)
 * 5. ViewModel llama authService.resetPassword
 * 6. Success: ViewModel muestra modal y auto-redirect a /auth/login
 * 7. Error: ViewModel maneja errores específicos (token expirado/inválido)
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
  // ViewModel handles ALL business logic
  const vm = useResetPasswordViewModel();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {vm.t('auth.resetPassword.title')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {vm.t('auth.resetPassword.subtitle')}
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            {vm.state.tokenError ? (
              /* Token Invalid/Expired State */
              <div className="space-y-6">
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-destructive">
                        {vm.t('auth.resetPassword.error.title')}
                      </h3>
                      <p className="mt-2 text-sm text-destructive/80">
                        {vm.state.errorMessage}
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
                      {vm.t('auth.resetPassword.error.requestNewLink')}
                    </Button>
                  </Link>
                  <Link to="/auth/login" className="block">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="w-full"
                    >
                      {vm.t('auth.forgotPassword.backToLogin')}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* Reset Password Form */
              <form className="space-y-6" onSubmit={vm.actions.handleSubmit}>
                {/* Instructions */}
                <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Lock className="h-5 w-5 text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        {vm.t('auth.resetPassword.instructions')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* New Password Field */}
                <InputField
                  label={vm.t('auth.resetPassword.newPasswordLabel')}
                  placeholder={vm.t('auth.resetPassword.newPasswordPlaceholder')}
                  icon={Lock}
                  secureTextEntry
                  value={vm.state.password}
                  onChangeText={vm.actions.handlePasswordChange}
                  onBlur={vm.actions.validatePassword}
                  error={vm.state.passwordError}
                  required
                  helperText={vm.t('auth.resetPassword.newPasswordHelper')}
                  disabled={vm.state.isLoading}
                />

                {/* Confirm Password Field */}
                <InputField
                  label={vm.t('auth.resetPassword.confirmPasswordLabel')}
                  placeholder={vm.t('auth.resetPassword.confirmPasswordPlaceholder')}
                  icon={Lock}
                  secureTextEntry
                  value={vm.state.confirmPassword}
                  onChangeText={vm.actions.handleConfirmPasswordChange}
                  onBlur={vm.actions.validateConfirmPassword}
                  error={vm.state.confirmPasswordError}
                  required
                  helperText={vm.t('auth.resetPassword.confirmPasswordHelper')}
                  disabled={vm.state.isLoading}
                />

                {/* Error Message */}
                {vm.state.errorMessage && !vm.state.tokenError && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      <p className="ml-2 text-sm text-destructive font-medium">
                        {vm.state.errorMessage}
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
                  loading={vm.state.isLoading}
                  disabled={!vm.computed.canSubmit}
                >
                  {vm.state.isLoading 
                    ? vm.t('auth.resetPassword.submitting')
                    : vm.t('auth.resetPassword.submitButton')
                  }
                </Button>

                {/* Back to Login */}
                <div className="text-center">
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {vm.t('auth.forgotPassword.backToLogin')}
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Success Modal */}
        <Modal open={vm.state.showSuccessModal} onOpenChange={() => {}}>
          <ModalContent className="max-w-md">
            <ModalHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <ModalTitle className="text-center">
                {vm.t('auth.resetPassword.successTitle')}
              </ModalTitle>
            </ModalHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {vm.t('auth.resetPassword.successMessage')}
              </p>

              <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-center">
                <p className="text-xs text-blue-800">
                  {vm.t('auth.resetPassword.redirecting')}
                </p>
              </div>
            </div>

            <ModalFooter className="mt-6">
              <Button
                onPress={vm.actions.handleGoToLogin}
                variant="filled"
                size="default"
                className="w-full"
              >
                <span className="flex items-center justify-center">
                  {vm.t('auth.resetPassword.goToLogin')}
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
