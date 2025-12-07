import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, InputField, Textarea } from '@components/ui';
import type { QuickCheckItemInput } from '@models/QuickCheck';

// Validation schema
const QuickCheckItemSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(80, 'El nombre no puede exceder 80 caracteres')
    .trim(),
  description: z.string()
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
});

type QuickCheckItemFormData = z.infer<typeof QuickCheckItemSchema>;

interface QuickCheckItemModalProps {
  mode: 'create' | 'edit';
  initialData?: QuickCheckItemInput;
  onSubmit: (data: QuickCheckItemInput) => void;
  onCancel: () => void;
}

export const QuickCheckItemModal: React.FC<QuickCheckItemModalProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
    reset,
  } = useForm<QuickCheckItemFormData>({
    resolver: zodResolver(QuickCheckItemSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  });

  // Auto-focus on name input when modal opens
  useEffect(() => {
    setFocus('name');
  }, [setFocus]);

  // Reset form with initialData when it changes (critical for edit mode)
  // ALWAYS reset to prevent stale data when switching between create/edit
  useEffect(() => {
    reset({
      name: initialData?.name || '',
      description: initialData?.description || '',
    });
  }, [initialData, reset]);

  const handleFormSubmit = (data: QuickCheckItemFormData) => {
    onSubmit({
      name: data.name,
      description: data.description || undefined,
    });
    reset();
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {mode === 'create' ? 'Agregar Item' : 'Editar Item'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === 'create' 
            ? 'Define un nuevo item de verificación para el QuickCheck' 
            : 'Modifica los datos del item de verificación'
          }
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Name input (required) - Using Controller pattern */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField
              label="Nombre del item"
              placeholder="Ej: Frenos, Luces, Niveles de fluidos..."
              required
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
            />
          )}
        />

        {/* Description input (optional) - Using Controller pattern */}
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Textarea
              label="Descripción (opcional)"
              placeholder="Agrega detalles adicionales que ayuden a entender qué verificar"
              rows={3}
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.description?.message}
            />
          )}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            htmlType="button"
            variant="outline"
            size="default"
            onPress={handleCancel}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            htmlType="submit"
            variant="filled"
            size="default"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear item' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
};
