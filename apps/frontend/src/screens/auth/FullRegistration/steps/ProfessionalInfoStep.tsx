import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { InputField, Textarea, BodyText } from "@components/ui";
import { Building, Phone, MapPin } from "lucide-react";
import type { CompleteRegistrationData } from "../../../../types/registration.types";

/**
 * ProfessionalInfoStep - Step 3 of Complete Registration Wizard
 * Sprint #14 Task 2.1b
 *
 * Professional/Business information:
 * - Company Name (required for PROVIDER, optional for CLIENT)
 * - Phone (optional but recommended)
 * - Address (optional)
 *
 * Reuses field components from profile editing but adapted for registration context.
 * Includes conditional validation based on user type.
 */
export const ProfessionalInfoStep: React.FC = () => {
  const { t } = useTranslation();
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<CompleteRegistrationData>();

  const userType = watch("type");
  const isProvider = userType === "PROVIDER";

  return (
    <div className="space-y-6">
      {/* Form fields */}
      <div className="space-y-4">
        {/* Conditional hint for PROVIDER */}
        {isProvider && (
          <div className="rounded-md bg-info/10 border border-info/20 p-3">
            <BodyText size="small" className="text-info">
              ℹ️ {t("auth.register.providerRequiresCompanyNameHint")}
            </BodyText>
          </div>
        )}
        {/* Company Name */}
        <Controller
          name="professionalInfo.companyName"
          control={control}
          rules={{
            required: isProvider ? t("validation.required") : false,
            minLength: isProvider
              ? {
                  value: 2,
                  message: t("validation.minLength", { count: 2 }),
                }
              : undefined,
          }}
          render={({ field }) => (
            <InputField
              {...field}
              label={t("profile.edit.fields.companyName")}
              placeholder={t("profile.edit.fields.companyNamePlaceholder")}
              icon={Building}
              error={errors.professionalInfo?.companyName?.message}
              required={isProvider}
              helperText={
                isProvider
                  ? t("auth.register.companyNameRequiredHelper")
                  : t("auth.register.companyNameOptionalHelper")
              }
            />
          )}
        />

        {/* Phone */}
        <Controller
          name="professionalInfo.phone"
          control={control}
          rules={{
            pattern: {
              value: /^[\d\s\-\+\(\)]+$/,
              message: t("validation.invalidPhone"),
            },
          }}
          render={({ field }) => (
            <InputField
              {...field}
              type="tel"
              label={t("profile.edit.fields.phone")}
              placeholder={t("profile.edit.fields.phonePlaceholder")}
              icon={Phone}
              error={errors.professionalInfo?.phone?.message}
              helperText={t("auth.register.phoneHelper")}
            />
          )}
        />

        {/* Address */}
        <Controller
          name="professionalInfo.address"
          control={control}
          render={({ field }) => (
            <Textarea
              label={t("profile.edit.fields.address")}
              placeholder={t("profile.edit.fields.addressPlaceholder")}
              error={errors.professionalInfo?.address?.message}
              maxLength={200}
              showCharacterCount
              value={field.value || ""}
              onChangeText={field.onChange}
              helperText={t("auth.register.addressHelper")}
            />
          )}
        />
      </div>

      {/* Optional info hint */}
      <div className="rounded-md bg-muted/50 border border-border p-3">
        <BodyText size="small" className="text-muted-foreground">
          💡 {t("auth.register.wizard.professionalInfo.optionalFieldsHint")}
        </BodyText>
      </div>
    </div>
  );
};
