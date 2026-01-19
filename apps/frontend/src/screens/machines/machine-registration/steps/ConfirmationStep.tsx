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
        <h2 className="text-2xl font-bold text-foreground mb-2">Confirma la información</h2>
        <p className="text-muted-foreground">
          Revisa todos los datos antes de registrar la máquina en el sistema
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
                {selectedMachineTypeName
                  ? selectedMachineTypeName
                  : displayValue(basicInfo?.machineTypeId, 'No seleccionado')}
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

      {/* Photo Preview */}
      {(photoFile || addPhotoLater) && (
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
            {photoFile ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">
                  La foto se subirá a Cloudinary al confirmar el registro
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
                  ✓ Foto marcada para agregar más tarde
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Podrás subir la foto desde la página de detalles después del registro
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

      {/* Información de ubicación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
              <span className="text-accent font-semibold">2</span>
            </div>
            <span>Ubicación y Estado</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technicalSpecs?.currentLocation && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Ubicación actual</dt>
                <dd className="text-sm text-foreground">{technicalSpecs.currentLocation}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Estado</dt>
              <dd className="text-sm text-foreground">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  technicalSpecs?.isActive === false ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                }`}>
                  {technicalSpecs?.isActive === false ? 'Inactiva' : 'Activa'}
                </span>
              </dd>
            </div>
            {technicalSpecs?.fuelType && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Tipo de combustible</dt>
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
            Se encontraron errores en la información:
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field} className="text-destructive text-sm">
                {field}: {error?.message || 'Error de validación'}
              </li>
            ))}
          </ul>
          <p className="text-destructive text-sm mt-2">
            Por favor, regresa a los pasos anteriores para corregir estos errores.
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
              Al hacer clic en "Registrar Máquina", se creará un nuevo registro en el sistema.
              Esta información podrá ser editada posteriormente desde la gestión de máquinas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
