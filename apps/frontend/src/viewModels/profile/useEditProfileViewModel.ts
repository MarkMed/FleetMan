import { useState, useCallback, useEffect, useReducer } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { WizardStep } from "../../components/forms/wizard";
import { useZodForm } from "../../hooks/useZodForm";
import { useAuth } from "../../store/AuthProvider";
import { useAuthStore } from "../../store/slices/authSlice";
import { userService } from "../../services/api/userService";
import { toast } from "@components/ui";
import { modal } from "@helpers/modal";
import {
  BasicInfoStep,
  BioAndTagsStep,
  ProfileConfirmationStep,
} from "../../screens/profile/edit-profile-steps";
import {
  UserProfileEditData,
  UserProfileEditSchema,
  defaultUserProfileEditData,
  validateProfileStep,
  mapEditDataToUpdateRequest,
  mapUserDataToEditForm,
} from "../../types/user.types";

/**
 * ViewModel for profile editing
 * Sprint #13 Tasks 10.1 + 10.2: User Profile Editing + Bio & Tags
 */
export interface EditProfileViewModel {
  // Form state
  form: UseFormReturn<UserProfileEditData>;

  // Wizard state
  wizardSteps: WizardStep<UserProfileEditData>[];
  forceUpdate: () => void;

  // Data loading state
  isLoadingUserData: boolean;
  loadUserError: string | null;

  // Submit state
  isSubmitting: boolean;
  submitError: string | null;

  // Actions
  handleWizardSubmit: (data: UserProfileEditData) => Promise<void>;
  handleCancel: () => void;
}

/**
 * ViewModel para edición de perfil de usuario siguiendo patrón MVVM
 *
 * RESPONSABILIDADES:
 * - Cargar datos del usuario autenticado al montar
 * - Pre-poblar formulario con valores actuales
 * - Gestionar estado del wizard multi-step con RHF integration
 * - Validar datos por step usando schemas de contracts
 * - Orquestar servicio de actualización de perfil
 * - Actualizar AuthStore tras éxito
 * - Manejar UI state (loading, errors)
 * - Transformar datos entre UI format y API format
 *
 * FEATURES IMPLEMENTADAS:
 * • React Hook Form con validación Zod
 * • Wizard configuration con steps y validaciones
 * • Carga inicial de datos del usuario
 * • Manejo de errores granular
 * • Sincronización perfecta wizard <-> RHF
 * • Actualización del store tras éxito
 */
export function useEditProfileViewModel(): EditProfileViewModel {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateUserInStore = useAuthStore((state) => state.updateUserProfile);

  // React Hook Form con Zod validation
  const form = useZodForm<UserProfileEditData>({
    schema: UserProfileEditSchema,
    defaultValues: defaultUserProfileEditData,
    mode: "onChange",
  });

  // UI State
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [loadUserError, setLoadUserError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Force re-render when form state changes to make validation reactive
  const [, forceUpdateReducer] = useReducer((x) => x + 1, 0);
  const forceUpdate = useCallback(() => forceUpdateReducer(), []);

  // Subscribe to form state changes for wizard reactivity
  useEffect(() => {
    const subscription = form.watch(() => {
      forceUpdateReducer();
    });
    return () => subscription.unsubscribe();
  }, [form]);

  /**
   * Load user data on mount and pre-populate form
   */
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoadingUserData(true);
        setLoadUserError(null);

        if (!user) {
          throw new Error(t("profile.edit.errors.noUser"));
        }

        // Map user data to form format and pre-populate
        const formData = mapUserDataToEditForm(user);
        form.reset(formData);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("profile.edit.errors.loadUser");
        setLoadUserError(errorMessage);
        console.error("❌ Error loading user data:", error);
      } finally {
        setIsLoadingUserData(false);
      }
    };

    loadUserData();
  }, [user, form, t]);

  /**
   * Wizard steps configuration
   */
  const wizardSteps: WizardStep<UserProfileEditData>[] = [
    {
      title: t("profile.edit.steps.basicInfo.title"),
      description: t("profile.edit.steps.basicInfo.description"),
      component: BasicInfoStep,
      isValid: () => {
        // Validar usando schema Zod
        const formData = form.getValues();
        return validateProfileStep("basicInfo", formData);
      },
    },
    {
      title: t("profile.edit.steps.bioAndTags.title"),
      description: t("profile.edit.steps.bioAndTags.description"),
      component: BioAndTagsStep,
      isValid: () => {
        const formData = form.getValues();
        return validateProfileStep("bioAndTags", formData);
      },
    },
    {
      title: t("profile.edit.steps.confirmation.title"),
      description: t("profile.edit.steps.confirmation.description"),
      component: ProfileConfirmationStep,
      isValid: () => Object.keys(form.formState.errors).length === 0,
    },
  ];

  /**
   * Handle wizard submission
   * Calls API, updates store, shows feedback, navigates
   */
  const handleWizardSubmit = useCallback(
    async (wizardData: UserProfileEditData) => {
      if (!user?.id) {
        setSubmitError(t("profile.edit.errors.noUser"));
        return;
      }

      try {
        setIsSubmitting(true);
        setSubmitError(null);

        console.log("📤 Submitting profile update:", wizardData);

        // Transform wizard data to API format
        const apiData = mapEditDataToUpdateRequest(wizardData, user.id);
        console.log("🔄 Mapped to API format:", apiData);

        modal.showLoading("Actualizando perfil...");

        // Call API
        const response = await userService.updateMyProfile(apiData);
        console.log("✅ Profile updated successfully:", response);

        // Navigate back to profile after short delay
        setTimeout(() => {
          // Update AuthStore with new user data
          updateUserInStore(response);
          console.log("✅ AuthStore updated");

        //   // Show success modal
        //   modal.success({
        //     title: t("profile.edit.success.title"),
        //     description: t("profile.edit.success.description"),
        //     dismissText: t("common.ok"),
        //   });
          // Show success toast
          toast.success({
            title: t("profile.edit.success.title"),
            description: t("profile.edit.success.description"),
          });
          modal.hide();
          navigate("/profile");
        }, 1500);
      } catch (error) {
        console.error("❌ Error updating profile:", error);

        const errorMessage =
          error instanceof Error
            ? error.message
            : t("profile.edit.errors.update");

        setSubmitError(errorMessage);

        toast.error({
          title: t("profile.edit.errors.title"),
          description: errorMessage,
        });

        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate, t, updateUserInStore]
  );

  /**
   * Handle cancel action
   */
  const handleCancel = useCallback(() => {
    // Navigate back without saving
    navigate("/profile");
  }, [navigate]);

  return {
    // Form state
    form,

    // Wizard state
    wizardSteps,
    forceUpdate,

    // Data loading state
    isLoadingUserData,
    loadUserError,

    // Submit state
    isSubmitting,
    submitError,

    // Actions
    handleWizardSubmit,
    handleCancel,
  };
}
