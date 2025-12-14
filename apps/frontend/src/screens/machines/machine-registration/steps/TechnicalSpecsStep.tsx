import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { InputField, Select, Textarea, Checkbox } from '../../../../components/ui';
import { MachineRegistrationData } from '@contracts';
import { DayOfWeek } from '@packages/domain';
import { FUEL_TYPE } from '@packages/domain';

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
    watch, // ✨ Needed for weeklyHours calculation
  } = useFormContext<MachineRegistrationData>();
  
  const { t } = useTranslation();

  // Build fuel types from domain SSOT + i18n labels
  const fuelTypes = Object.values(FUEL_TYPE).map(value => ({
    value,
    label: t(`machines.fuelTypes.${value}`),
  }));

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

      {/* ✨ NUEVA SECCIÓN - Asignación y Responsable - Task 3.2a */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Asignación y Responsable
        </h3>
       
        <Controller
          control={control}
          name="technicalSpecs.assignedTo"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField
              label="Asignar a"
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ej: Juan Pérez"
              helperText="Persona responsable de esta máquina (operador, encargado, etc.)"
              error={errors.technicalSpecs?.assignedTo?.message}
            />
          )}
        />
      </div>

      {/* ✨ NUEVA SECCIÓN - Programación de Uso - Task 3.2a */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Programación de Uso
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Define cuántas horas por día opera la máquina y qué días de la semana. 
          Esta información se utiliza para calcular alertas de mantenimiento automáticas.
        </p>
       
        <div className="space-y-6">
          {/* Horas diarias */}
          <Controller
            control={control}
            name="technicalSpecs.usageSchedule.dailyHours"
            render={({ field: {onChange, onBlur, value } }) => (
              <InputField
                label="Horas diarias de operación"
                keyboardType="numeric"
                value={value?.toString() || ''}
                onChangeText={(text) => onChange(parseInt(text) || undefined)}
                onBlur={onBlur}
                placeholder="Ej: 8"
                helperText="Promedio de horas que opera por día (1-24)"
                error={errors.technicalSpecs?.usageSchedule?.dailyHours?.message}
              />
            )}
          />
         
          {/* Selector visual de días */}
          <Controller
            control={control}
            name="technicalSpecs.usageSchedule.operatingDays"
            render={({ field: { value, onChange } }) => {
              const selectedDays = value || [];
              const dailyHours = watch('technicalSpecs.usageSchedule.dailyHours') || 0;
              const weeklyHours = selectedDays.length * dailyHours;
             
              return (
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Días de operación
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Selecciona los días en que esta máquina opera habitualmente
                  </p>
                 
                  {/* Grid de botones para días */}
                  <div className="grid grid-cols-7 gap-2">
                    {[
                      { value: DayOfWeek.MON, short: t('common.daysOfWeek.short.MON'), full: t('common.daysOfWeek.full.MON') },
                      { value: DayOfWeek.TUE, short: t('common.daysOfWeek.short.TUE'), full: t('common.daysOfWeek.full.TUE') },
                      { value: DayOfWeek.WED, short: t('common.daysOfWeek.short.WED'), full: t('common.daysOfWeek.full.WED') },
                      { value: DayOfWeek.THU, short: t('common.daysOfWeek.short.THU'), full: t('common.daysOfWeek.full.THU') },
                      { value: DayOfWeek.FRI, short: t('common.daysOfWeek.short.FRI'), full: t('common.daysOfWeek.full.FRI') },
                      { value: DayOfWeek.SAT, short: t('common.daysOfWeek.short.SAT'), full: t('common.daysOfWeek.full.SAT') },
                      { value: DayOfWeek.SUN, short: t('common.daysOfWeek.short.SUN'), full: t('common.daysOfWeek.full.SUN') },
                    ].map((day) => {
                      const isSelected = selectedDays.includes(day.value);
                     
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            onChange(
                              isSelected
                                ? selectedDays.filter(d => d !== day.value)
                                : [...selectedDays, day.value]
                            );
                          }}
                          className={`
                            p-3 rounded-lg border-2 font-semibold text-sm
                            transition-all duration-200
                            ${isSelected
                              ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                              : 'bg-background border-border hover:border-primary/50 hover:scale-105'
                            }
                          `}
                          title={day.full}
                        >
                          {day.short}
                        </button>
                      );
                    })}
                  </div>
                 
                  {/* Info calculada - Horas semanales */}
                  {selectedDays.length > 0 && dailyHours > 0 && (
                    <div className="mt-4 p-4 bg-info/10 rounded-md border border-info/30">
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-info">
                          <strong>{selectedDays.length}</strong> día(s) × <strong>{dailyHours}</strong> horas/día = <strong>{weeklyHours} horas/semana</strong>
                        </div>
                      </div>
                      <p className="text-xs text-info/80 mt-2">
                        Esta programación se usará para calcular alertas de mantenimiento basadas en horas de uso reales.
                      </p>
                    </div>
                  )}
                 
                  {/* Error message */}
                  {errors.technicalSpecs?.usageSchedule?.operatingDays && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.technicalSpecs.usageSchedule.operatingDays.message}
                    </p>
                  )}
                </div>
              );
            }}
          />
        </div>
      </div>

      {/* ✨ NUEVA SECCIÓN - Foto de Máquina - Task 3.2a */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Imagen de la Máquina
        </h3>
       
        <Controller
          control={control}
          name="technicalSpecs.machinePhotoUrl"
          render={({ field: { onChange, onBlur, value } }) => (
            <div className="space-y-3">
              <InputField
                label="URL de foto (temporal)"
                type="url"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="https://example.com/foto-maquina.jpg"
                helperText="URL de imagen (temporal hasta implementar carga de archivos)"
                error={errors.technicalSpecs?.machinePhotoUrl?.message}
              />
             
              {/* Preview de imagen si URL es válida */}
              {value && !errors.technicalSpecs?.machinePhotoUrl && (
                <div className="mt-3 relative rounded-lg overflow-hidden border border-border max-w-sm">
                  <img 
                    src={value} 
                    alt="Vista previa" 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          )}
        />
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