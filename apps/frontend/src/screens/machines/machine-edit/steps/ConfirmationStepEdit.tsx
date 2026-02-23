import React, { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, ImagePickerField } from '../../../../components/ui';
import { MachineRegistrationData } from '@contracts';
// LEGACY: useMachineTypes no longer needed (machineTypeName is free-text)
// import { useMachineTypes } from '@hooks';
import { useMachineEditContext } from '../MachineEditContext';

/**
 * Step 4: Confirmación y resumen de la información - Edit Mode Version
 * Shows a summary of all entered data including photo preview
 * Uses MachineEditContext instead of MachineRegistrationContext
 */
export function ConfirmationStepEdit() {
  const { 
    control
  } = useFormContext<MachineRegistrationData>();
  
  const { t } = useTranslation();
  const { photoFile, existingPhotoUrl, shouldRemovePhoto } = useMachineEditContext();
  
  // Watch all form values for real-time updates
  const data = useWatch({ control });
  const { basicInfo, technicalSpecs } = data;
  
  // LEGACY: No longer resolving machineType from API (direct string display)
  // const { data: machineTypes } = useMachineTypes();
  // const selectedMachineTypeName = machineTypes?.find(
  //   (type) => type.id === basicInfo?.machineTypeId
  // )?.name;

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

  // Determine photo display logic for edit mode
  // If shouldRemovePhoto is true, don't show existing photo even if URL exists
  const hasPhoto = shouldRemovePhoto ? !!photoFile : (photoFile || existingPhotoUrl);
  const photoUrl = photoFile ? URL.createObjectURL(photoFile) : (shouldRemovePhoto ? undefined : (existingPhotoUrl || undefined));

  // Cleanup: Revoke blob URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (photoFile && photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoFile, photoUrl]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Confirma los cambios</h2>
        <p className="text-muted-foreground">
          Revisa todas las modificaciones antes de guardar los cambios
        </p>
      </div>

      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-info/10 rounded-full flex items-center justify-center">
              <span className="text-info font-semibold">1</span>
            </div>
            <span>Información Básica</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Nombre</dt>
              <dd className="text-sm text-foreground">{displayValue(basicInfo?.name)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Tipo de máquina</dt>
              <dd className="text-sm text-foreground">
                {displayValue(basicInfo?.machineTypeName, 'No seleccionado')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Marca</dt>
              <dd className="text-sm text-foreground">{displayValue(basicInfo?.brand)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Modelo</dt>
              <dd className="text-sm text-foreground">{displayValue(basicInfo?.modelName)}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-muted-foreground">Número de serie</dt>
              <dd className="text-sm text-foreground font-mono">{displayValue(basicInfo?.serialNumber)}</dd>
            </div>
            {basicInfo?.description && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Descripción</dt>
                <dd className="text-sm text-foreground">{basicInfo.description}</dd>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Photo Preview - Edit Mode */}
      {hasPhoto && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">📸</span>
              </div>
              <span>Foto de la Máquina</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {photoFile && (
                <p className="text-sm text-amber-600 mb-3">
                  ⚠️ Se subirá una nueva foto a Cloudinary al confirmar los cambios
                </p>
              )}
              <ImagePickerField
                value={photoUrl}
                disabled={true}
                helperText={photoFile ? `${photoFile.name} (${(photoFile.size / 1024 / 1024).toFixed(2)} MB)` : 'Foto actual'}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {!hasPhoto && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">📸</span>
              </div>
              <span>Foto de la Máquina</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Sin foto
              </p>
            </div>
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
            <span>Especificaciones Técnicas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Año</dt>
              <dd className="text-sm text-foreground">{displayValue(technicalSpecs?.year)}</dd>
            </div>
            {technicalSpecs?.operatingHours && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Horas de operación</dt>
                <dd className="text-sm text-foreground">{technicalSpecs.operatingHours}</dd>
              </div>
            )}
            {technicalSpecs?.fuelType && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Tipo de combustible</dt>
                <dd className="text-sm text-foreground">
                  {getFuelTypeLabel(technicalSpecs.fuelType)}
                </dd>
              </div>
            )}
          </div>

          {/* Accesorios */}
          {technicalSpecs?.attachments && technicalSpecs.attachments.length > 0 && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Accesorios</dt>
              <dd className="text-sm text-foreground">{displayArray(technicalSpecs.attachments)}</dd>
            </div>
          )}

          {/* Características especiales */}
          {technicalSpecs?.specialFeatures && technicalSpecs.specialFeatures.length > 0 && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Características especiales</dt>
              <dd className="text-sm text-foreground">{displayArray(technicalSpecs.specialFeatures)}</dd>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
