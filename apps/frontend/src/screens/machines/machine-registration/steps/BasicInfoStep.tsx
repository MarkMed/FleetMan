import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { InputField, Select, Textarea } from '../../../../components/ui';
import { MachineRegistrationData } from '@packages/contracts';

/**
 * Step 1: Información básica de la máquina - RHF Implementation
 */
export function BasicInfoStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<MachineRegistrationData>();

  // Mock data para machine types (en producción vendría del ViewModel/API)
  const machineTypes = [
    { value: '1', label: 'Excavadora' },
    { value: '2', label: 'Bulldozer' },
    { value: '3', label: 'Grúa' },
    { value: '4', label: 'Cargadora' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <Controller
          control={control}
          name="basicInfo.name"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField
              label="Nombre de la máquina"
              required
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ej: Excavadora 001"
              error={errors.basicInfo?.name?.message}
            />
          )}
        />

        {/* Tipo de máquina */}
        <Controller
          control={control}
          name="basicInfo.machineTypeId"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Tipo de máquina"
              required
              value={value || ''}
              onValueChange={onChange}
              options={machineTypes}
              placeholder="Selecciona un tipo"
              error={errors.basicInfo?.machineTypeId?.message}
            />
          )}
        />

        {/* Marca */}
        <Controller
          control={control}
          name="basicInfo.brand"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField
              label="Marca"
              required
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ej: Caterpillar"
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
              label="Modelo"
              required
              value={String(value ?? '')}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ej: 320D"
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
                label="Número de serie"
                required
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Ej: CAT320D12345"
                error={errors.basicInfo?.serialNumber?.message}
              />
            )}
          />
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <Controller
            control={control}
            name="basicInfo.description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Textarea
                label="Descripción"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Descripción adicional de la máquina..."
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
            <p className="text-sm text-info">
              <strong>Consejo:</strong> Asegúrate de que el número de serie sea único y esté visible en la máquina. 
              Esta información será fundamental para el seguimiento y mantenimiento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}