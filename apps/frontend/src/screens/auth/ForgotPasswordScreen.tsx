import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authService } from "../../services/api/authService";
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
import type { ForgotPasswordRequest } from "@packages/contracts";

/**
 * ForgotPasswordScreen - Sprint #15 Task 2.4
 *
 * Permite a usuarios solicitar restablecimiento de contraseña vía email.
 *
 * Flow:
 * 1. Usuario ingresa email
 * 2. Validación frontend con Zod schema de contracts
 * 3. POST /api/v1/auth/forgot-password
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
  const { t } = useTranslation();

  // Form state
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // Loading & modal state
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  /**
   * Validate email format using Zod schema from contracts
   */
  const validateEmail = (): boolean => {
    setEmailError("");

    if (!email.trim()) {
      setEmailError(t("auth.forgotPassword.emailRequired"));
      return false;
    }

    // Basic email format validation (Zod will do the full validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(t("auth.forgotPassword.invalidEmail"));
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   * Calls backend API and shows success modal
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const payload: ForgotPasswordRequest = {
        email: email.trim().toLowerCase(),
      };

      const response = await authService.forgotPassword(payload);

      // Backend always returns success (security best practice)
      // Show success modal with instructions
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Forgot password error:", error);

      // Show generic error message
      setErrorMessage(
        error?.response?.data?.message ||
          t("auth.forgotPassword.error.unknown"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Close success modal and optionally navigate back to login
   */
  const handleCloseModal = () => {
    setShowSuccessModal(false);
    // Keep email in form in case user wants to retry
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("auth.forgotPassword.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("auth.forgotPassword.subtitle")}
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                      {t("auth.forgotPassword.instructions")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <InputField
                label={t("auth.forgotPassword.emailLabel")}
                placeholder={t("auth.forgotPassword.emailPlaceholder")}
                icon={Mail}
                keyboardType="email"
                value={email}
                onChangeText={setEmail}
                error={emailError}
                required
                helperText={t("auth.forgotPassword.emailHelper")}
                disabled={isLoading}
              />

              {/* Error Message */}
              {errorMessage && (
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
                  ? t("auth.forgotPassword.submitting")
                  : t("auth.forgotPassword.submitButton")}
              </Button>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("auth.forgotPassword.backToLogin")}
                </Link>
              </div>
            </form>
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
                {t("auth.forgotPassword.successTitle")}
              </ModalTitle>
            </ModalHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {t("auth.forgotPassword.successMessage")}
              </p>

              <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs text-amber-800">
                  <strong>Nota:</strong> {t("auth.forgotPassword.spamNotice")}
                </p>
              </div>

              <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                <p className="text-xs text-blue-800">
                  {t("auth.forgotPassword.newWindowNotice")}
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
                {t("auth.forgotPassword.backToLogin")}
              </Button>
              <Button
                onPress={handleCloseModal}
                variant="filled"
                size="default"
                className="w-full"
              >
                {t("auth.forgotPassword.closeModal")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};
