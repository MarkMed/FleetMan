import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  InputField,
  Button,
  Card,
  CardContent,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
} from "../../components/ui";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useForgotPasswordViewModel } from "../../viewModels/auth/ForgotPasswordViewModel";

/**
 * ForgotPasswordScreen - Sprint #15 Task 2.4
 *
 * MVVM-lite Pattern:
 * - View: Renders UI based on ViewModel state
 * - ViewModel: Handles business logic (validation, API calls, state)
 * - Separation: View has ZERO business logic
 *
 * Flow:
 * 1. Usuario ingresa email
 * 2. ViewModel valida con regex
 * 3. ViewModel llama authService.forgotPassword
 * 4. Success modal con instrucciones (revisar email + spam)
 * 5. Backend envía email con link: /reset-password/:token
 *
 * Security:
 * - Backend siempre retorna 200 OK (previene email enumeration)
 * - Mensaje genérico "si tu cuenta existe, recibirás el email"
 * - Token JWT con expiración de 1 hora
 *
 * UX Considerations:
 * - Reusa estilos de LoginScreen para consistencia
 * - Modal de éxito con instrucciones claras
 * - Botón de "Volver al Login" siempre visible
 */
export const ForgotPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  
  // ViewModel handles ALL business logic
  const vm = useForgotPasswordViewModel();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {vm.t("auth.forgotPassword.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {vm.t("auth.forgotPassword.subtitle")}
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <form className="space-y-6" onSubmit={vm.actions.handleSubmit}>
              {/* Instructions */}
              <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Mail
                      className="h-5 w-5 text-blue-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      {vm.t("auth.forgotPassword.instructions")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <InputField
                label={vm.t("auth.forgotPassword.emailLabel")}
                placeholder={vm.t("auth.forgotPassword.emailPlaceholder")}
                icon={Mail}
                keyboardType="email"
                value={vm.state.email}
                onChangeText={vm.actions.handleEmailChange}
                error={vm.state.emailError}
                required
                helperText={vm.t("auth.forgotPassword.emailHelper")}
                disabled={vm.state.isLoading}
              />

              {/* Error Message */}
              {vm.state.errorMessage && (
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
                  ? vm.t("auth.forgotPassword.submitting")
                  : vm.t("auth.forgotPassword.submitButton")}
              </Button>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {vm.t("auth.forgotPassword.backToLogin")}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Success Modal */}
        <Modal open={vm.state.showSuccessModal} onOpenChange={vm.actions.handleCloseModal}>
          <ModalContent className="max-w-md">
            <ModalHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <ModalTitle className="text-center">
                {vm.t("auth.forgotPassword.successTitle")}
              </ModalTitle>
            </ModalHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {vm.t("auth.forgotPassword.successMessage")}
              </p>

              <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs text-amber-800">
                  <strong>Nota:</strong> {vm.t("auth.forgotPassword.spamNotice")}
                </p>
              </div>

              <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                <p className="text-xs text-blue-800">
                  {vm.t("auth.forgotPassword.newWindowNotice")}
                </p>
              </div>
            </div>

            <ModalFooter className="mt-6">
              <Button
                variant="ghost"
                size="default"
                className="w-full"
                onPress={() => {
                  navigate("/auth/login");
                }}
              >
                {vm.t("auth.forgotPassword.backToLogin")}
              </Button>
              <Button
                onPress={vm.actions.handleCloseModal}
                variant="filled"
                size="default"
                className="w-full"
              >
                {vm.t("auth.forgotPassword.closeModal")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};
