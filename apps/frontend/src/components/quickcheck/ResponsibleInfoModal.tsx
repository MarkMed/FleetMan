import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalFooter, Button, InputField } from '@components/ui';
import { User, IdCard } from 'lucide-react';

// Validation schema matching backend contracts
const ResponsibleInfoSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  workerId: z.string()
    .min(1, 'El número de trabajador es requerido')
    .max(50, 'El número de trabajador no puede exceder 50 caracteres')
    .trim(),
});

type ResponsibleInfoFormData = z.infer<typeof ResponsibleInfoSchema>;

interface ResponsibleInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; workerId: string }) => Promise<void>;
  initialName?: string;
  initialWorkerId?: string;
}

/**
 * ResponsibleInfoModal - Captura información del responsable antes de enviar QuickCheck
 * 
 * Sprint 8 - Tracking de Responsables:
 * - Nombre completo del técnico/operador
 * - Número de trabajador/credencial
 * 
 * Validaciones (Zod + RHF):
 * - Ambos campos son obligatorios
 * - Min 1 carácter cada uno
 * - Max 100 caracteres para nombre
 * - Max 50 caracteres para workerId
 */
export const ResponsibleInfoModal: React.FC<ResponsibleInfoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialName = '',
  initialWorkerId = '',
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
    reset,
    watch,
  } = useForm<ResponsibleInfoFormData>({
    resolver: zodResolver(ResponsibleInfoSchema),
    defaultValues: {
      name: initialName,
      workerId: initialWorkerId,
    },
  });

  // Watch form values for character count
  const nameValue = watch('name') || '';
  const workerIdValue = watch('workerId') || '';

  // Auto-focus on name input when modal opens
  useEffect(() => {
    if (isOpen) {
      setFocus('name');
    }
  }, [isOpen, setFocus]);

  // Reset form when modal opens with new initial data
  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialName,
        workerId: initialWorkerId,
      });
    }
  }, [isOpen, initialName, initialWorkerId, reset]);

  const handleFormSubmit = async (data: ResponsibleInfoFormData) => {
    try {
      await onSubmit({
        name: data.name.trim(),
        workerId: data.workerId.trim(),
      });
      // Only close modal if submission was successful
      handleClose();
    } catch (error) {
      // Keep modal open on error so user doesn't lose their input
      // Error will be displayed via toast in the ViewModel
      console.error('Error submitting responsible info:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal 
      open={isOpen} 
      onOpenChange={(open) => !open && handleClose()}
      title="Identificación del Responsable"
      description="Ingresa la información del técnico que ejecuta el QuickCheck"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 p-6">
        <div className="space-y-4">
          {/* Nombre del Responsable - Using Controller pattern */}
          <div className="space-y-2">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <div className="relative">
                  <div className="absolute left-3 top-[72%] -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                    <User className="w-4 h-4" />
                  </div>
                  <InputField
                    id="responsibleName"
                    label="Nombre Completo"
                    required
                    type="text"
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Ej: Juan Pérez"
                    className="pl-10"
                    maxLength={100}
                    error={errors.name?.message}
                  />
                </div>
              )}
            />
            <p className="text-xs text-muted-foreground">
              {nameValue.length}/100 caracteres
            </p>
          </div>

          {/* Número de Trabajador - Using Controller pattern */}
          <div className="space-y-2">
            <Controller
              control={control}
              name="workerId"
              render={({ field: { onChange, onBlur, value } }) => (
                <div className="relative">
                  <div className="absolute left-3 top-[72%] -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                    <IdCard className="w-4 h-4" />
                  </div>
                  <InputField
                    id="workerIdInput"
                    label="Número de Trabajador"
                    required
                    type="text"
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Ej: TEC-0042 o DNI-12345678"
                    className="pl-10"
                    maxLength={50}
                    error={errors.workerId?.message}
                  />
                </div>
              )}
            />
            <p className="text-xs text-muted-foreground">
              {workerIdValue.length}/50 caracteres
            </p>
          </div>

          {/* Info box */}
          <div className="p-3 bg-muted/50 border border-border rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Importante:</strong> Esta información se registra para trazabilidad
              y auditoría. Asegúrate de ingresar los datos correctos del técnico responsable.
            </p>
          </div>
        </div>

        <ModalFooter>
          <div className="flex gap-3 w-full">
            <Button
              htmlType="button"
              variant="outline"
              size="default"
              onPress={handleClose}
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
              {isSubmitting ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
};
