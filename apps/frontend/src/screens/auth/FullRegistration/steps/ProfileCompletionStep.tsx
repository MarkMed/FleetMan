import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Textarea, TagInput, BodyText, Badge } from "@components/ui";
import { USER_PROFILE_LIMITS } from "@contracts";
import type { CompleteRegistrationData } from "../../../../types/registration.types";

/**
 * ProfileCompletionStep - Step 4 of Complete Registration Wizard
 * Sprint #14 Task 2.1b
 *
 * Optional profile enrichment fields:
 * - Bio (max 500 chars)
 * - Tags (max 5 tags, max 100 chars each)
 *
 * Reuses Bio & Tags components from profile editing.
 * This step is OPTIONAL and can be skipped.
 */
export const ProfileCompletionStep: React.FC = () => {
  const { t } = useTranslation();
  const {
    control,
    formState: { errors },
  } = useFormContext<CompleteRegistrationData>();

  return (
    <div className="space-y-6">
      {/* Form fields */}
      <div className="space-y-4">
        {/* Bio */}
        <Controller
          name="profileCompletion.bio"
          control={control}
          rules={{
            maxLength: {
              value: USER_PROFILE_LIMITS.MAX_BIO_LENGTH,
              message: t("validation.maxLength", {
                count: USER_PROFILE_LIMITS.MAX_BIO_LENGTH,
              }),
            },
          }}
          render={({ field }) => (
            <Textarea
              label={t("profile.edit.fields.bio")}
              placeholder={t("profile.edit.fields.bioPlaceholder")}
              helperText={t("profile.edit.fields.bioHelper")}
              value={field.value || ""}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.profileCompletion?.bio?.message}
              maxLength={USER_PROFILE_LIMITS.MAX_BIO_LENGTH}
              showCharacterCount
            />
          )}
        />

        {/* Tags */}
        <Controller
          name="profileCompletion.tags"
          control={control}
          rules={{
            validate: (tags) => {
              if (!tags || tags.length === 0) return true; // Optional field

              // Check max tags
              if (tags.length > USER_PROFILE_LIMITS.MAX_TAGS) {
                return t("validation.maxTags", {
                  count: USER_PROFILE_LIMITS.MAX_TAGS,
                });
              }

              // Check tag length
              const invalidTag = tags.find(
                (tag) => tag.length > USER_PROFILE_LIMITS.MAX_TAG_LENGTH,
              );
              if (invalidTag) {
                return t("validation.tagMaxLength", {
                  count: USER_PROFILE_LIMITS.MAX_TAG_LENGTH,
                });
              }

              // Check duplicates
              const uniqueTags = new Set(tags);
              if (uniqueTags.size !== tags.length) {
                return t("validation.duplicateTags");
              }

              return true;
            },
          }}
          render={({ field }) => (
            <TagInput
              label={t("profile.edit.fields.tags")}
              placeholder={t("profile.edit.fields.tagsPlaceholder")}
              helperText={t("profile.edit.fields.tagsHelper")}
              value={field.value || []}
              onChangeValue={field.onChange}
              maxTags={USER_PROFILE_LIMITS.MAX_TAGS}
              maxTagLength={USER_PROFILE_LIMITS.MAX_TAG_LENGTH}
              error={errors.profileCompletion?.tags?.message}
            />
          )}
        />
      </div>

      {/* Benefits hint */}
      <div>
        <BodyText className="text-muted-foreground mb-2">
          ⏭️ {t("auth.register.wizard.profileCompletion.canSkipHint")}
        </BodyText>
        <div className="rounded-md bg-success/10 border border-success/20 p-4">
          <h3 className="text-sm font-semibold text-success mb-2">
            {t("auth.register.wizard.profileCompletion.benefitsTitle")}
          </h3>
          <ul className="space-y-1 text-sm text-success">
            <li>✓ {t("auth.register.wizard.profileCompletion.benefit1")}</li>
            <li>✓ {t("auth.register.wizard.profileCompletion.benefit2")}</li>
            <li>✓ {t("auth.register.wizard.profileCompletion.benefit3")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
