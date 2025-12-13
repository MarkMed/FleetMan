import React, { useState } from 'react';
import { Modal, ModalFooter, Button, InputField } from '@components/ui';
import { User, IdCard } from 'lucide-react';

interface ResponsibleInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; workerId: string }) => void;
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
 * Validaciones:
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
  const [name, setName] = useState(initialName);
  const [workerId, setWorkerId] = useState(initialWorkerId);
  const [errors, setErrors] = useState<{ name?: string; workerId?: string }>({});

  const validate = (): boolean => {
    const newErrors: { name?: string; workerId?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (name.length > 100) {
      newErrors.name = 'Máximo 100 caracteres';
    }

    if (!workerId.trim()) {
      newErrors.workerId = 'El número de trabajador es requerido';
    } else if (workerId.length > 50) {
      newErrors.workerId = 'Máximo 50 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({ name: name.trim(), workerId: workerId.trim() });
      handleClose();
    }
  };

  const handleClose = () => {
    setErrors({});
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
      <div className="space-y-6 p-6">
        <div className="space-y-4">
            {/* Nombre del Responsable */}
            <div className="space-y-2">
              <label htmlFor="responsibleName" className="block text-sm font-medium text-foreground">
                Nombre Completo <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                  <User className="w-4 h-4" />
                </div>
                <InputField
                  id="responsibleName"
                  type="text"
                  value={name}
                  onChangeText={setName}
                  placeholder="Ej: Juan Pérez"
                  className="pl-10"
                  maxLength={100}
                  autoFocus
                />
              </div>
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {name.length}/100 caracteres
              </p>
            </div>

            {/* Número de Trabajador */}
            <div className="space-y-2">
              <label htmlFor="workerIdInput" className="block text-sm font-medium text-foreground">
                Número de Trabajador <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                  <IdCard className="w-4 h-4" />
                </div>
                <InputField
                  id="workerIdInput"
                  type="text"
                  value={workerId}
                  onChangeText={setWorkerId}
                  placeholder="Ej: TEC-0042 o DNI-12345678"
                  className="pl-10"
                  maxLength={50}
                />
              </div>
              {errors.workerId && (
                <p className="text-xs text-destructive">{errors.workerId}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {workerId.length}/50 caracteres
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
              variant="outline"
              size="default"
              onPress={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="filled"
              size="default"
              onPress={handleSubmit}
              className="flex-1"
            >
              Confirmar
            </Button>
          </div>
        </ModalFooter>
      </div>
    </Modal>
  );
};
