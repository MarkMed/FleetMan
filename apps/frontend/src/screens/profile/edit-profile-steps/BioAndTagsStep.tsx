import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Textarea, TagInput } from '@components/ui';
import type { UserProfileEditData } from '../../../types/user.types';
import { USER_PROFILE_LIMITS } from '@contracts';

/**
 * Step 2: Bio and Tags Step
 * Sprint #13 Task 10.2c: Bio & Tags - Frontend UI
 * 
 * Campos editables:
 * - Biografía (textarea con contador, max 500 chars)
 * - Etiquetas/Tags (chips, max 5 tags de max 100 chars cada uno)
 */
export const BioAndTagsStep: React.FC = () => {
  const { t } = useTranslation();
  const { control, formState: { errors } } = useFormContext<UserProfileEditData>();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Bio */}
        <Controller
          name="bioAndTags.bio"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Textarea
              label={t('profile.edit.fields.bio')}
              placeholder={t('profile.edit.fields.bioPlaceholder')}
              helperText={t('profile.edit.fields.bioHelper')}
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.bioAndTags?.bio?.message}
              maxLength={USER_PROFILE_LIMITS.MAX_BIO_LENGTH}
              showCharacterCount
            />
          )}
        />

        {/* Tags */}
        <Controller
          name="bioAndTags.tags"
          control={control}
          render={({ field }) => (
            <TagInput
              label={t('profile.edit.fields.tags')}
              placeholder={t('profile.edit.fields.tagsPlaceholder')}
              helperText={t('profile.edit.fields.tagsHelper')}
              value={field.value || []}
              onChangeValue={field.onChange}
              maxTags={USER_PROFILE_LIMITS.MAX_TAGS}
              maxTagLength={USER_PROFILE_LIMITS.MAX_TAG_LENGTH}
              error={errors.bioAndTags?.tags?.message}
            />
          )}
        />
      </div>
    </div>
  );
};
