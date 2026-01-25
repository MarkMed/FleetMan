import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button, BodyText } from '@components/ui';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  MessageSquare, 
  Plus,
  Bell,
  Settings
} from 'lucide-react';

/**
 * QuickActionsModal - Modal principal de acciones rápidas
 * 
 * Modal que presenta un menú de acciones disponibles para el usuario.
 * Clonado de AlarmActionMenuModal para mantener consistencia visual.
 * 
 * Sprint #14 Task 2.1c: QuickActions System
 * 
 * Flujo:
 * 1. Usuario presiona FAB → Se abre este modal
 * 2. Usuario selecciona acción
 * 3. Según la acción:
 *    - Si requiere máquina → Abre MachineSelectModal
 *    - Si requiere contacto → Abre ContactSelectModal
 *    - Si es directa → Navigate inmediato
 * 
 * Acciones disponibles:
 * - Realizar QuickCheck (requiere máquina)
 * - Reportar Evento (requiere máquina)
 * - Ir a Historial (requiere máquina)
 * - Enviar Mensaje (requiere contacto)
 * - Nueva Máquina (directo)
 * - Ver Notificaciones (directo)
 * 
 * @example
 * ```tsx
 * <QuickActionsModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onActionSelect={(actionId) => handleAction(actionId)}
 * />
 * ```
 */

export type QuickActionId = 
  | 'quickcheck' 
  | 'reportEvent' 
  | 'viewHistory' 
  | 'sendMessage' 
  | 'newMachine'
  | 'notifications';

interface QuickAction {
  id: QuickActionId;
  icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  descriptionKey: string;
  needsMachineSelection?: boolean;
  needsContactSelection?: boolean;
  // Strategic future: Color theming per action
  // color?: 'blue' | 'orange' | 'purple' | 'green';
}

interface QuickActionsModalProps {
  /**
   * Estado de apertura del modal
   */
  open: boolean;
  
  /**
   * Callback para cambiar el estado del modal
   */
  onOpenChange: (open: boolean) => void;
  
  /**
   * Callback ejecutado cuando el usuario selecciona una acción
   * @param actionId - ID de la acción seleccionada
   */
  onActionSelect: (actionId: QuickActionId) => void;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  open,
  onOpenChange,
  onActionSelect,
}) => {
  const { t } = useTranslation();

  // Definición de acciones disponibles
  const actions: QuickAction[] = [
    {
      id: 'quickcheck',
      icon: CheckCircle,
      titleKey: 'quickActions.performQuickCheck',
      descriptionKey: 'quickActions.performQuickCheckDesc',
      needsMachineSelection: true,
    },
    {
      id: 'reportEvent',
      icon: AlertCircle,
      titleKey: 'quickActions.reportEvent',
      descriptionKey: 'quickActions.reportEventDesc',
      needsMachineSelection: true,
    },
    {
      id: 'viewHistory',
      icon: Clock,
      titleKey: 'quickActions.viewHistory',
      descriptionKey: 'quickActions.viewHistoryDesc',
      needsMachineSelection: true,
    },
    {
      id: 'sendMessage',
      icon: MessageSquare,
      titleKey: 'quickActions.sendMessage',
      descriptionKey: 'quickActions.sendMessageDesc',
      needsContactSelection: true,
    },
    {
      id: 'notifications',
      icon: Bell,
      titleKey: 'quickActions.viewNotifications',
      descriptionKey: 'quickActions.viewNotificationsDesc',
      // Direct navigation - no selection needed
    },
  ];

  /**
   * Handler para cuando el usuario hace clic en una acción
   * Cierra el modal y notifica al padre
   */
  const handleActionClick = (actionId: QuickActionId) => {
    onActionSelect(actionId);
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('quickActions.title')}
      description={t('quickActions.selectAction')}
    >
      <div className="flex flex-col gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant="outline"
              className="h-auto py-4 px-4 justify-start text-left bg-[hsl(var(--color-card))] hover:bg-accent transition-colors"
              onPress={() => handleActionClick(action.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <div>
                  <Icon className="h-8 w-8" />
                </div>
                <div className="flex flex-col">
                  <BodyText weight="medium">{t(action.titleKey)}</BodyText>
                  <BodyText className="text-muted-foreground">
                    {t(action.descriptionKey)}
                  </BodyText>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
      
      {/* Strategic future: Recent actions section
      <div className="mt-4 pt-4 border-t border-border">
        <BodyText size="small" className="text-muted-foreground mb-2">
          {t('quickActions.recentActions')}
        </BodyText>
        {recentActions.map(action => (
          <Button key={action.id} variant="ghost" size="sm">
            {action.label}
          </Button>
        ))}
      </div>
      */}
    </Modal>
  );
};
