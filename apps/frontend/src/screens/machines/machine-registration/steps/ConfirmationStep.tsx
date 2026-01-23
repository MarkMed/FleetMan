import React, { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, ImagePickerField } from '../../../../components/ui';
import { MachineRegistrationData } from '@contracts';
import { useMachineTypes } from '@hooks';
import { useMachineRegistrationContext } from '../MachineRegistrationContext';

/**
 * Step 4: Confirmación y resumen de la información - RHF Implementation
 * Shows a summary of all entered data including photo preview
 */
export function ConfirmationStep() {
  const { 
    control, 
    formState: { errors },
    getValues
  } = useFormContext<MachineRegistrationData>();
  
  const { t } = useTranslation();
  const { photoFile } = useMachineRegistrationContext();
  
  // Watch all form values for real-time updates
  const data = useWatch({ control });
  const { basicInfo, technicalSpecs, addPhotoLater } = data;
  const { data: machineTypes } = useMachineTypes();
  const selectedMachineTypeName = machineTypes?.find(
    (type) => type.id === basicInfo?.machineTypeId
  )?.name;

  // Helper para mostrar valores con fallback
  const displayValue = (value: any, fallback?: string) => {
    return value ?? (fallback || t('common.notSpecified'));
  };

  // Helper para mostrar arrays
  const displayArray = (arr: string[] | undefined, fallback?: string) => {
    if (!arr || arr.length === 0) return fallback || t('common.notSpecified');
    return arr.join(', ');
  };

  // Helper para mostrar fuel type traducido
  const getFuelTypeLabel = (fuelType: string | undefined) => {
    if (!fuelType) return t('common.notSpecified');
    return t(`machines.fuelTypes.${fuelType}`);
  };

  // Create blob URL for preview
  const photoPreviewUrl = photoFile ? URL.createObjectURL(photoFile) : null;

  // Cleanup: Revoke blob URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('machines.registration.confirmation.title')}</h2>
        <p className="text-muted-foreground">
          {t('machines.registration.confirmation.subtitle')}
        </p>
      </div>

      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-info/10 rounded-full flex items-center justify-center">
              <span className="text-info font-semibold">1</span>
            </div>
            <span>{t('machines.registration.confirmation.basicInfo')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">{t('machines.registration.basicInfo.name')}</dt>
              <dd className="text-sm text-foreground">{displayValue(basicInfo?.name)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">{t('machines.registration.basicInfo.machineType')}</dt>
              <dd className="text-sm text-foreground">
                {selectedMachineTypeName
                  ? selectedMachineTypeName
                  : displayValue(basicInfo?.machineTypeId, t('machines.registration.confirmation.notSelected'))}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">{t('machines.registration.basicInfo.brand')}</dt>
              <dd className="text-sm text-foreground">{displayValue(basicInfo?.brand)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">{t('machines.registration.basicInfo.model')}</dt>
              <dd className="text-sm text-foreground">{displayValue(basicInfo?.modelName)}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-muted-foreground">{t('machines.registration.basicInfo.serialNumber')}</dt>
              <dd className="text-sm text-foreground font-mono">{displayValue(basicInfo?.serialNumber)}</dd>
            </div>
            {basicInfo?.description && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">{t('machines.registration.basicInfo.description')}</dt>
                <dd className="text-sm text-foreground">{basicInfo.description}</dd>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Photo Preview */}
      {(photoFile || addPhotoLater) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">📸</span>
              </div>
              <span>{t('machines.registration.confirmation.photo')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {photoFile ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">
                  {t('machines.registration.confirmation.photoUploadInfo')}
                </p>
                <ImagePickerField
                  value={URL.createObjectURL(photoFile)}
                  disabled={true}
                  helperText={`${photoFile.name} (${(photoFile.size / 1024 / 1024).toFixed(2)} MB)`}
                />
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ✓ {t('machines.registration.confirmation.photoLaterMarked')}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {t('machines.registration.confirmation.photoLaterInfo')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Especificaciones técnicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
              <span className="text-success font-semibold">2</span>
            </div>
            <span>{t('machines.registration.confirmation.technicalSpecs')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">{t('machines.registration.technicalSpecs.year')}</dt>
              <dd className="text-sm text-foreground">{displayValue(technicalSpecs?.year)}</dd>
            </div>
            {technicalSpecs?.operatingHours && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t('machines.registration.technicalSpecs.operatingHours')}</dt>
                <dd className="text-sm text-foreground">{technicalSpecs.operatingHours}</dd>
              </div>
            )}
            {technicalSpecs?.fuelType && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t('machines.registration.technicalSpecs.fuelType')}</dt>
                <dd className="text-sm text-foreground">
                  {getFuelTypeLabel(technicalSpecs.fuelType)}
                </dd>
              </div>
            )}
          </div>

          {/* Accesorios */}
          {technicalSpecs?.attachments && technicalSpecs.attachments.length > 0 && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">{t('machines.registration.technicalSpecs.attachments')}</dt>
              <dd className="text-sm text-foreground">{displayArray(technicalSpecs.attachments)}</dd>
            </div>
          )}

          {/* Características especiales */}
          {technicalSpecs?.specialFeatures && technicalSpecs.specialFeatures.length > 0 && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">{t('machines.registration.technicalSpecs.specialFeatures')}</dt>
              <dd className="text-sm text-foreground">{displayArray(technicalSpecs.specialFeatures)}</dd>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información de ubicación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
              <span className="text-accent font-semibold">2</span>
            </div>
            <span>{t('machines.registration.confirmation.locationStatus')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technicalSpecs?.currentLocation && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t('machines.registration.technicalSpecs.currentLocation')}</dt>
                <dd className="text-sm text-foreground">{technicalSpecs.currentLocation}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-muted-foreground">{t('machines.registration.confirmation.status')}</dt>
              <dd className="text-sm text-foreground">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  technicalSpecs?.isActive === false ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                }`}>
                  {technicalSpecs?.isActive === false ? t('machines.registration.confirmation.inactive') : t('machines.registration.confirmation.active')}
                </span>
              </dd>
            </div>
            {technicalSpecs?.fuelType && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t('machines.registration.technicalSpecs.fuelType')}</dt>
                <dd className="text-sm text-foreground">
                  {getFuelTypeLabel(technicalSpecs.fuelType)}
                </dd>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Errores globales */}
      {errors && Object.keys(errors).length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <h4 className="text-destructive font-medium mb-2">
            {t('machines.registration.confirmation.errorsFound')}
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field} className="text-destructive text-sm">
                {field}: {error?.message || t('machines.registration.confirmation.validationError')}
              </li>
            ))}
          </ul>
          <p className="text-destructive text-sm mt-2">
            {t('machines.registration.confirmation.goBackToFix')}
          </p>
        </div>
      )}

      {/* Mensaje final */}
      <div className="bg-info/10 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-info" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-info">
              {t('machines.registration.confirmation.finalMessage')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
