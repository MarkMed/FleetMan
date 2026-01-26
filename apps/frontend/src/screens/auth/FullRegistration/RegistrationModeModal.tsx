import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, Card, BodyText, Heading3, Badge } from '@components/ui';
import { Star, Zap } from 'lucide-react';
import { cn } from '@utils/cn';

interface RegistrationModeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * RegistrationModeModal - Sprint #14 Task 2.1b
 * 
 * Modal que permite al usuario elegir entre dos modos de registro:
 * 1. Registro Completo (Recomendado): Wizard multi-paso con todos los datos de perfil
 * 2. Registro Rápido: Solo campos esenciales (email, password, type)
 * 
 * Features:
 * - Opción de registro completo destacada con badge "Recomendado"
 * - Estimación de tiempo para cada opción
 * - Iconos descriptivos
 * - Navegación directa a la ruta correspondiente
 * 
 * Dependencies:
 * - Modal component (Radix UI Dialog wrapper)
 * - Router para navegación
 * - i18n para traducciones
 */
export const RegistrationModeModal: React.FC<RegistrationModeModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSelectMode = (mode: 'full-form' | 'quick') => {
    onOpenChange(false);
    navigate(`/auth/register/${mode}`);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>{t('auth.register.chooseMethod')}</ModalTitle>
          <ModalDescription>{t('auth.register.methodDescription')}</ModalDescription>
        </ModalHeader>

        <div className="flex flex-col gap-4 mt-4">
          {/* Opción 1: Registro Completo (Recomendado) */}
          <Card
            className={cn(
              'cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-200',
              'border-2 border-transparent'
            )}
            onClick={() => handleSelectMode('full-form')}
          >
            <div className="p-6 space-y-3">
              {/* Badge y título */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Star className="h-6 w-6 text-primary" fill="currentColor" />
                  </div>
                  <Heading3>{t('auth.register.completeRegistration')}</Heading3>
                </div>
                <Badge variant="success" className="shrink-0">
                  {t('common.recommended')}
                </Badge>
              </div>

              {/* Descripción */}
              <BodyText size="small" className="text-muted-foreground">
                {t('auth.register.fullFormDescription')}
              </BodyText>

              {/* Tiempo estimado */}
              <div className="flex items-center gap-2">
                <BodyText size="small" weight="medium" className="text-primary">
                  ⏱️ ~5 {t('common.minutes')}
                </BodyText>
              </div>

              {/* Features incluidas */}
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ {t('auth.register.features.credentials')}</li>
                <li>✓ {t('auth.register.features.userType')}</li>
                <li>✓ {t('auth.register.features.professionalInfo')}</li>
                <li>✓ {t('auth.register.features.profileCompletion')}</li>
                <li>✓ {t('auth.register.features.preferences')}</li>
              </ul>
            </div>
          </Card>

          {/* Opción 2: Registro Rápido */}
          <Card
            className={cn(
              'cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-200',
              'border-2 border-transparent'
            )}
            onClick={() => handleSelectMode('quick')}
          >
            <div className="p-6 space-y-3">
              {/* Icono y título */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Zap className="h-6 w-6 text-warning" />
                </div>
                <Heading3>{t('auth.register.quickRegistration')}</Heading3>
              </div>

              {/* Descripción */}
              <BodyText size="small" className="text-muted-foreground">
                {t('auth.register.quickDescription')}
              </BodyText>

              {/* Tiempo estimado */}
              <div className="flex items-center gap-2">
                <BodyText size="small" weight="medium" className="text-warning">
                  ⏱️ ~2 {t('common.minutes')}
                </BodyText>
              </div>

              {/* Features incluidas */}
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ {t('auth.register.features.credentials')}</li>
                <li>✓ {t('auth.register.features.userType')}</li>
                <li className="text-muted-foreground/50">
                  ⓘ {t('auth.register.features.completeProfileLater')}
                </li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Footer hint */}
        <div className="mt-4 text-center">
          <BodyText size="small" className="text-muted-foreground">
            {t('auth.register.canChangeAnytime')}
          </BodyText>
        </div>
      </ModalContent>
    </Modal>
  );
};
