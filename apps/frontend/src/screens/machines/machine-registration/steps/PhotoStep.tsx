import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MachineRegistrationData } from '@contracts';
import { ImagePickerField, Checkbox, TextBlock } from '@components/ui';
import { useMachineRegistrationContext } from '../MachineRegistrationContext';

/**
 * PhotoStep Component
 * 
 * Step 2 of Machine Registration Wizard: Photo Selection
 * 
 * Features:
 * - Image picker for file selection (upload happens at submit time)
 * - Optional "Add later" checkbox to skip photo
 * - Form validation (either file selected OR checkbox must be checked)
 * - File object persists in ViewModel during wizard navigation
 * 
 * Integration:
 * - Uses React Hook Form context for URL field
 * - Uses ViewModel for File object storage
 * - Upload to Cloudinary deferred until final submit
 */
export function PhotoStep() {
  const { t } = useTranslation();
  const { photoFile, setPhotoFile } = useMachineRegistrationContext();
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<MachineRegistrationData>();

  // Watch both fields to enable "Continue" button conditionally
  const machinePhotoUrl = watch('technicalSpecs.machinePhotoUrl');
  const addPhotoLater = watch('addPhotoLater');

  // Debug logging (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('🎬 PhotoStep render:', {
      machinePhotoUrl,
      addPhotoLater,
      hasFile: !!photoFile,
      fileName: photoFile?.name,
      canContinue: !!photoFile || addPhotoLater,
    });
  }

  /**
   * Handle "Add later" checkbox change
   * When checked, clear photo URL and File object
   */
  const handleAddLaterChange = (checked: boolean) => {
    if (checked) {
      // Clear photo URL when user chooses to add later
      setValue('technicalSpecs.machinePhotoUrl', '', { shouldValidate: true });
      // Clear File object from ViewModel
      setPhotoFile(null);
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Cleared photo URL and File (add later checked)');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <TextBlock as="h2" size="large" weight="medium">
          {t('machineRegistration.photo.title', 'Foto de la Máquina')}
        </TextBlock>
        <TextBlock as="p" size="medium" className="text-gray-600">
          {t(
            'machineRegistration.photo.description',
            'Agrega una foto representativa de la máquina para facilitar su identificación.'
          )}
        </TextBlock>
      </div>

      {/* Image Picker */}
      <Controller
        control={control}
        name="technicalSpecs.machinePhotoUrl"
        render={({ field: { value, onChange } }) => (
          <ImagePickerField
            label={t('machineRegistration.photo.label', 'Foto')}
            value={value || ''}
            onChangeText={onChange}
            onFileSelect={(file) => {
              setPhotoFile(file); // Store File in ViewModel
              if (process.env.NODE_ENV === 'development') {
                console.log('📸 File stored in ViewModel:', file?.name);
              }
            }}
            error={errors.technicalSpecs?.machinePhotoUrl?.message}
            helperText={t(
              'machineRegistration.photo.helperText',
              'Formatos soportados: JPEG, PNG, WebP. Tamaño máximo: 5MB. La imagen se subirá al confirmar el registro.'
            )}
            disabled={addPhotoLater} // Disable when "add later" is checked
          />
        )}
      />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            {t('common.or', 'o')}
          </span>
        </div>
      </div>

      {/* "Add Later" Checkbox */}
      <Controller
        control={control}
        name="addPhotoLater"
        render={({ field: { value, onChange } }) => (
          <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Checkbox
              checked={value || false}
              onCheckedChange={(checked) => {
                onChange(checked);
                handleAddLaterChange(checked as boolean);
              }}
              id="addPhotoLater"
              disabled={!!machinePhotoUrl} // Disable when photo is uploaded
            />
            <div className="flex-1">
              <label
                htmlFor="addPhotoLater"
                className="text-sm font-medium text-gray-900 cursor-pointer"
              >
                {t('machineRegistration.photo.addLater', 'Agregaré la foto más tarde')}
              </label>
              <p className="text-xs text-gray-600 mt-1">
                {t(
                  'machineRegistration.photo.addLaterDescription',
                  'Podrás subir la foto desde la página de detalles de la máquina después del registro.'
                )}
              </p>
            </div>
          </div>
        )}
      />

      {/* Validation Info */}
      {!photoFile && !addPhotoLater && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-yellow-400 mr-3 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                {t('machineRegistration.photo.required', 'Acción requerida')}
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                {t(
                  'machineRegistration.photo.requiredDescription',
                  'Debes seleccionar una foto o marcar la casilla para continuar.'
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Future Enhancement: Multiple Photos */}
      {/* 
      <div className="border-t border-gray-200 pt-6">
        <TextBlock as="h3" size="large" weight="medium" className="mb-3">
          {t('machineRegistration.photo.additionalPhotos', 'Fotos Adicionales (Opcional)')}
        </TextBlock>
        <TextBlock as="p" size="small" className="text-gray-600 mb-4">
          {t(
            'machineRegistration.photo.additionalPhotosDescription',
            'Agrega más fotos para mostrar diferentes ángulos o detalles de la máquina.'
          )}
        </TextBlock>
        
        <Controller
          control={control}
          name="technicalSpecs.additionalPhotos"
          render={({ field: { value, onChange } }) => (
            <MultiImagePickerField
              value={value || []}
              onChange={onChange}
              maxImages={5}
              helperText="Máximo 5 fotos adicionales"
            />
          )}
        />
      </div>
      */}
    </div>
  );
}
