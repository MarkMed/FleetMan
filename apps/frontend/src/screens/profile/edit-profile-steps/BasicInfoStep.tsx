import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { InputField, Textarea } from '@components/ui';
import type { UserProfileEditData } from '../../../types/user.types';

/**
 * Step 1: Basic Info Step
 * Sprint #13 Task 10.1c: User Profile Editing - Frontend UI
 * 
 * Campos editables:
 * - Nombre de empresa (opcional)
 * - Teléfono (opcional)
 * - Dirección (opcional)
 */
export const BasicInfoStep: React.FC = () => {
  const { t } = useTranslation();
  const { control, formState: { errors } } = useFormContext<UserProfileEditData>();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Company Name */}
        <Controller
          name="basicInfo.companyName"
          control={control}
          render={({ field }) => (
            <InputField
              label={t('profile.edit.fields.companyName')}
              placeholder={t('profile.edit.fields.companyNamePlaceholder')}
              error={errors.basicInfo?.companyName?.message}
              {...field}
            />
          )}
        />

        {/* Phone */}
        <Controller
          name="basicInfo.phone"
          control={control}
          render={({ field }) => (
            <InputField
              label={t('profile.edit.fields.phone')}
              placeholder={t('profile.edit.fields.phonePlaceholder')}
              type="tel"
              error={errors.basicInfo?.phone?.message}
              {...field}
            />
          )}
        />

        {/* Address */}
        <Controller
          name="basicInfo.address"
          control={control}
          render={({ field }) => (
            <Textarea
              label={t('profile.edit.fields.address')}
              placeholder={t('profile.edit.fields.addressPlaceholder')}
              error={errors.basicInfo?.address?.message}
              maxLength={200}
              showCharacterCount
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
      </div>
    </div>
  );
};
