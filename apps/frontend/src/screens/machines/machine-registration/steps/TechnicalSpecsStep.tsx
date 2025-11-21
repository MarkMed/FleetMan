import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { InputField, Select, Textarea, Checkbox } from '../../../../components/ui';
import { MachineRegistrationData } from '@packages/contracts';

/**
 * Step 2: Especificaciones técnicas de la máquina - RHF Implementation
 * Campos simplificados según RF-005:
 * - year (requerido)
 * - operatingHours (opcional)
 * - fuelType (enum)
 * - attachments (opcional)
 * - specialFeatures (opcional) 
 * - currentLocation (opcional, movido desde LocationInfoStep)
 * - isActive (opcional, default true)
 */
export function TechnicalSpecsStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<MachineRegistrationData>();

  const fuelTypes = [
    { value: 'ELECTRIC_LITHIUM', label: 'Eléctrico (Litio)' },
    { value: 'ELECTRIC_LEAD_ACID', label: 'Eléctrico (Plomo Ácido)' },
    { value: 'DIESEL', label: 'Diesel' },
    { value: 'LPG', label: 'LPG (Gas)' },
    { value: 'GASOLINE', label: 'Nafta' },
    { value: 'BIFUEL', label: 'Bi-fuel' },
    { value: 'HYBRID', label: 'Hybrid' },
  ];

  return (
    <div className="space-y-8">
      {/* Especificaciones básicas */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Especificaciones Técnicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Año - REQUERIDO */}
          <Controller
            control={control}
            name="technicalSpecs.year"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label="Año de fabricación"
                required
                keyboardType="numeric"
                value={value?.toString() || ''}
                onChangeText={(text) => onChange(parseInt(text) || undefined)}
                onBlur={onBlur}
                placeholder={`Ej: ${new Date().getFullYear()}`}
                error={errors.technicalSpecs?.year?.message}
              />
            )}
          />

          {/* Horas de operación - OPCIONAL */}
          <Controller
            control={control}
            name="technicalSpecs.operatingHours"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label="Horas de operación"
                keyboardType="numeric"
                value={value?.toString() || ''}
                onChangeText={(text) => onChange(parseInt(text) || undefined)}
                onBlur={onBlur}
                placeholder="Ej: 1500"
                helperText="Horas acumuladas de uso"
                error={errors.technicalSpecs?.operatingHours?.message}
              />
            )}
          />

          {/* Tipo de combustible - ENUM */}
            <Controller
              control={control}
              name="technicalSpecs.fuelType"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Fuente de Energía"
                  value={value || ''}
                  onValueChange={onChange}
                  options={fuelTypes}
                  placeholder="Selecciona la fuente de energía"
                  error={errors.technicalSpecs?.fuelType?.message}
                />
              )}
            />          {/* Ubicación actual - OPCIONAL (movido desde LocationInfoStep) */}
          <Controller
            control={control}
            name="technicalSpecs.currentLocation"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label="Ubicación actual"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Ej: Obra Downtown - Sector A"
                error={errors.technicalSpecs?.currentLocation?.message}
              />
            )}
          />
        </div>
      </div>

      {/* Accesorios y características especiales */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Accesorios y Características</h3>
        <div className="space-y-6">
          <Controller
            control={control}
            name="technicalSpecs.attachments"
            render={({ field: { onChange, onBlur, value } }) => (
              <Textarea
                label="Accesorios instalados"
                value={value?.join(', ') || ''}
                onChangeText={(text) => onChange(text ? text.split(',').map(s => s.trim()).filter(s => s.length > 0) : [])}
                onBlur={onBlur}
                placeholder="Ej: Martillo hidráulico, Cuchara de excavación, Pulgar hidráulico"
                helperText="Separa los accesorios con comas"
                rows={3}
                error={errors.technicalSpecs?.attachments?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="technicalSpecs.specialFeatures"
            render={({ field: { onChange, onBlur, value } }) => (
              <Textarea
                label="Características especiales"
                value={value?.join(', ') || ''}
                onChangeText={(text) => onChange(text ? text.split(',').map(s => s.trim()).filter(s => s.length > 0) : [])}
                onBlur={onBlur}
                placeholder="Ej: Sistema de aire acondicionado, GPS integrado, Cámara de reversa"
                helperText="Separa las características con comas"
                rows={3}
                error={errors.technicalSpecs?.specialFeatures?.message}
              />
            )}
          />
        </div>
      </div>

      {/* Estado operativo */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Estado Operativo</h3>
        <Controller
          control={control}
          name="technicalSpecs.isActive"
          render={({ field: { onChange, value } }) => (
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={value ?? true}
                onCheckedChange={onChange}
              />
              <div className="text-sm">
                <label className="font-medium text-foreground">
                  Máquina activa
                </label>
                <p className="text-muted-foreground">
                  Indica si la máquina está actualmente en uso operativo
                </p>
              </div>
            </div>
          )}
        />
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
              <strong>Nota:</strong> Solo el año de fabricación es obligatorio. 
              El resto de campos te ayudarán a tener un mejor control y seguimiento 
              de tus máquinas en el sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}