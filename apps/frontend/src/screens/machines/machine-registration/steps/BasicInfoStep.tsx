import React, { useMemo } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { InputField, Select, Textarea, Skeleton } from '../../../../components/ui';
import { MachineRegistrationData } from '@contracts';
import { useMachineTypes } from '@hooks';
import { WizardStepProps } from '../../../../components/forms/wizard';

/**
 * Step 1: Información básica de la máquina - RHF Implementation
 * 
 * SHARED COMPONENT: Works in both registration and edit modes
 * - In edit mode: serialNumber is READ-ONLY (immutable field)
 * - In registration mode: serialNumber is editable
 * 
 * Mode detection: Checks if component receives isEditMode prop
 */
interface BasicInfoStepProps extends WizardStepProps<MachineRegistrationData> {
  isEditMode?: boolean; // Optional: set to true when using in edit wizard
}

export function BasicInfoStep({ isEditMode = false, ...wizardProps }: BasicInfoStepProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<MachineRegistrationData>();

  const { t } = useTranslation();

  // Mock data para machine types (en producción vendría del ViewModel/API)
  const { data: machineTypeList, isLoading, isError } = useMachineTypes();

  // Memoize machineTypes transformation to prevent infinite re-renders
  const machineTypes = useMemo(() => {
    if (!Array.isArray(machineTypeList)) return [];
    return machineTypeList.map((mt: any) => ({ value: mt.id, label: mt.name }));
  }, [machineTypeList]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Marca */}
        <Controller
          control={control}
          name="basicInfo.brand"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField
              label={t('machines.registration.basicInfo.brand')}
              required
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t('machines.registration.basicInfo.brandPlaceholder')}
              error={errors.basicInfo?.brand?.message}
            />
          )}
        />

        {/* Modelo */}
        <Controller
          control={control}
          name="basicInfo.modelName"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField
              label={t('machines.registration.basicInfo.model')}
              required
              value={String(value ?? '')}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t('machines.registration.basicInfo.modelPlaceholder')}
              error={errors.basicInfo?.modelName?.message}
            />
          )}
        />

        {/* Número de serie */}
        <div className="md:col-span-2">
          <Controller
            control={control}
            name="basicInfo.serialNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label={t('machines.registration.basicInfo.serialNumber')}
                required
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('machines.registration.basicInfo.serialNumberPlaceholder')}
                error={errors.basicInfo?.serialNumber?.message}
                disabled={isEditMode} // READ-ONLY in edit mode (immutable field)
                helperText={isEditMode ? t('machines.registration.basicInfo.serialNumberImmutable') : undefined}
              />
            )}
          />
        </div>
        
        {/* Tipo de máquina */}
        {/* BUSINESS DECISION: machineTypeId IS editable in edit mode (unlike serialNumber)
            Rationale: Machines may need reclassification (e.g., specialized excavator → standard excavator)
            Backend validates that the new machineTypeId exists before persisting.
            Alternative consideration: If machineTypeId should be immutable (like serialNumber),
            add disabled={isEditMode} prop and helperText explaining it cannot be changed.
        */}
        <Controller
          control={control}
          name="basicInfo.machineTypeId"
          render={({ field: { onChange, value } }) => (
            isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                label={t('machines.registration.basicInfo.machineType')}
                required
                value={value || ''}
                onValueChange={onChange}
                options={machineTypes}
                placeholder={isError ? t('machines.registration.basicInfo.machineTypeError') : t('machines.registration.basicInfo.machineTypePlaceholder')}
                error={errors.basicInfo?.machineTypeId?.message}
                // disabled={isEditMode} // TODO: Uncomment if machineTypeId should be immutable
                // helperText={isEditMode ? t('machines.registration.basicInfo.machineTypeImmutable') : undefined}
              />
            )
          )}
        />
        
        {/* Nombre */}
        <Controller
          control={control}
          name="basicInfo.name"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField
              label={t('machines.registration.basicInfo.name')}
              required
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t('machines.registration.basicInfo.namePlaceholder')}
              error={errors.basicInfo?.name?.message}
            />
          )}
        />


        {/* Descripción */}
        <div className="md:col-span-2">
          <Controller
            control={control}
            name="basicInfo.description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Textarea
                label={t('machines.registration.basicInfo.description')}
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('machines.registration.basicInfo.descriptionPlaceholder')}
                rows={4}
                maxLength={500}
                showCharacterCount
                error={errors.basicInfo?.description?.message}
              />
            )}
          />
        </div>
      </div>

      <div className="bg-info/10 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-info" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-info" dangerouslySetInnerHTML={{ __html: t('machines.registration.basicInfo.tip') }} />
          </div>
        </div>
      </div>
    </div>
  );
}