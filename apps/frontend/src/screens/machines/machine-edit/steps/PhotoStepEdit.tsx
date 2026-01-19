import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MachineRegistrationData } from '@contracts';
import { ImagePickerField, Button, TextBlock } from '@components/ui';
import { useMachineEditContext } from '../MachineEditContext';
import { Trash2 } from 'lucide-react';

/**
 * PhotoStepEdit Component
 * 
 * Step 2 of Machine Edit Wizard: Photo Management
 * 
 * Features:
 * - Shows existing photo with "Change" and "Remove" buttons
 * - "Change": Hides image, shows ImagePicker to select new file
 * - "Remove": Hides image, shows ImagePicker, marks photo for deletion
 * - If no existing photo: Shows ImagePicker directly
 * - File object persists in ViewModel during wizard navigation
 * - Upload to Cloudinary deferred until final submit
 * 
 * Integration:
 * - Uses React Hook Form context for URL field
 * - Uses MachineEditViewModel for File object storage + removal flag
 * - Upload to Cloudinary deferred until final submit
 */
export function PhotoStepEdit() {
  const { t } = useTranslation();
  const viewModel = useMachineEditContext();
  
  const { 
    photoFile, 
    setPhotoFile, 
    existingPhotoUrl,
    shouldRemovePhoto,
    setShouldRemovePhoto,
  } = viewModel;
  
  // Detectar cambios de referencia del contexto
  const prevViewModelRef = useRef(viewModel);
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  
  useEffect(() => {
    if (prevViewModelRef.current !== viewModel) {
      prevViewModelRef.current = viewModel;
    }
  });
  
  const {
    setValue,
    formState: { errors },
  } = useFormContext<MachineRegistrationData>();

  // Local UI state: controls when to show ImagePicker
  // Initialize based on existingPhotoUrl - use lazy initialization to avoid recalculation
  const [showImagePicker, setShowImagePicker] = useState(() => {
    const initial = !existingPhotoUrl;
    
    return initial;
  });

  // Memoize the preview URL to avoid creating new URLs on every render
  const photoPreviewUrl = useMemo(() => {
    
    if (photoFile) {
      const url = URL.createObjectURL(photoFile);
      return url;
    }
    
    return '';
  }, [photoFile]);

  // Cleanup: Revoke blob URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  /**
   * Handle "Remove Photo" button click
   * Marks photo for deletion and shows ImagePicker for optional new selection
   */
  const handleRemovePhoto = () => {
    setShouldRemovePhoto(true);
    setShowImagePicker(true);
    setValue('technicalSpecs.machinePhotoUrl', '', { shouldValidate: true });
  };

  /**
   * Handle file selection from ImagePicker
   * Stores File in ViewModel and resets removal flag
   */
  const handleFileSelect = (file: File | null) => {
    setPhotoFile(file);
    
    if (file) {
      // User selected a new photo - cancel any pending removal
      setShouldRemovePhoto(false);
    }
  };

  /**
   * Handle "Cancel" (revert to showing existing photo)
   */
  const handleCancelChange = () => {
    setShowImagePicker(false);
    setPhotoFile(null);
    setShouldRemovePhoto(false);
    // Restore existing photo URL
    if (existingPhotoUrl) {
      setValue('technicalSpecs.machinePhotoUrl', existingPhotoUrl, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <TextBlock as="h2" size="large" weight="medium">
          {t('machines.edit.photo.title', 'Machine Picture')}
        </TextBlock>
        <TextBlock as="p" size="medium" className="text-gray-600">
          {t(
            'machines.edit.photo.description',
            'Update the machine picture or remove it if you prefer.'
          )}
        </TextBlock>
      </div>

      {/* Show existing photo with action buttons */}
      {existingPhotoUrl && !showImagePicker && (
        <div className="space-y-2">
          {/* Existing Photo Preview */}
          <div className="relative">
            
            {/* Label */}
            <div className="mt-2">
              <TextBlock size="small" weight="medium" className="text-gray-700">
                {t('machines.edit.photo.currentLabel', 'Current Photo')}
              </TextBlock>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted border-2 border-gray-200">
              <img
                src={existingPhotoUrl}
                alt={t('machines.edit.photo.currentPhoto', 'Current Photo')}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="default"
              onPress={handleRemovePhoto}
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('machines.edit.photo.removeButton', 'Remove Photo')}
            </Button>
          </div>
        </div>
      )}

      {/* Show ImagePicker (when changing, removing, or no existing photo) */}
      {showImagePicker && (
        <div className="space-y-4">
          {/* Status message */}
          {shouldRemovePhoto && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <TextBlock size="small" weight="medium" className="text-amber-900">
                {t('machines.edit.photo.removalNote', 'La foto será eliminada al confirmar los cambios.')}
              </TextBlock>
              <TextBlock size="small" className="text-amber-700 mt-1">
                {t('machines.edit.photo.removalNoteDesc', 'Puedes seleccionar una nueva foto abajo, o dejar sin foto.')}
              </TextBlock>
            </div>
          )}

          {existingPhotoUrl && !shouldRemovePhoto && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <TextBlock size="small" weight="medium" className="text-blue-900">
                {t('machines.edit.photo.changeNote', 'Selecciona una nueva foto para reemplazar la actual.')}
              </TextBlock>
            </div>
          )}

          {!existingPhotoUrl && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <TextBlock size="small" className="text-gray-700">
                {t('machines.edit.photo.noPhotoNote', 'No hay foto cargada actualmente. Selecciona una imagen abajo.')}
              </TextBlock>
            </div>
          )}

          {/* Image Picker */}
          <ImagePickerField
            label={shouldRemovePhoto 
              ? t('machines.edit.photo.newPhotoLabel', 'Nueva Foto (Opcional)')
              : t('machines.edit.photo.selectPhotoLabel', 'Seleccionar Foto')
            }
            value={photoPreviewUrl}
            onChangeText={() => {}} // Not used - handled via onFileSelect
            onFileSelect={handleFileSelect}
            error={errors.technicalSpecs?.machinePhotoUrl?.message}
            helperText={t(
              'machines.edit.photo.helperText',
              'Formatos soportados: JPEG, PNG, WebP. Tamaño máximo: 5MB. La imagen se subirá al confirmar.'
            )}
          />

          {/* Preview of new file */}
          {photoFile && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden bg-white">
                <img
                  src={photoPreviewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <TextBlock size="small" weight="medium" className="text-green-900">
                  {t('machines.edit.photo.newFileSelected', 'Nueva foto seleccionada')}
                </TextBlock>
                <TextBlock size="small" className="text-green-700">
                  {photoFile.name} ({(photoFile.size / 1024 / 1024).toFixed(2)} MB)
                </TextBlock>
              </div>
            </div>
          )}

          {/* Cancel button (only if there was an existing photo) */}
          {existingPhotoUrl && (
            <div className="flex justify-start">
              <Button
                variant="ghost"
                size="sm"
                onPress={handleCancelChange}
              >
                {t('machines.edit.photo.cancelButton', 'Cancelar y mantener foto actual')}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Info box about optional photo */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <TextBlock size="small" className="text-blue-900">
          💡 {t('machines.edit.photo.tip', 'The photo is optional. You can update other details and keep or remove the current photo.')}
        </TextBlock>
      </div>
    </div>
  );
}
