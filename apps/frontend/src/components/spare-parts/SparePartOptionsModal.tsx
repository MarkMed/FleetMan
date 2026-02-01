import { useTranslation } from 'react-i18next';
import { Modal, Button, BodyText } from '@components/ui';
import { Edit, Trash2 } from 'lucide-react';

/**
 * SparePartOptionsModal Component
 * Sprint #15/16 Task 7.1 - Spare Parts Frontend
 * 
 * Purpose:
 * - Display options menu for spare part actions
 * - Similar to ChatOptionsModal and AlarmActionMenuModal
 * - Accessed via "Options" button (MoreVertical icon) in SparePartCard
 * 
 * Options:
 * 1. Edit - Opens CreateEditSparePartModal with selected part
 * 2. Delete - Opens delete confirmation modal (destructive action at bottom)
 * 
 * Design:
 * - Modal with title "Opciones de Repuesto"
 * - Each option is an outlined button with icon + title + description
 * - Delete option has destructive styling (red text)
 * - Options close modal automatically after click
 * 
 * @example
 * ```tsx
 * <SparePartOptionsModal
 *   open={vm.modals.options.isOpen}
 *   onOpenChange={vm.modals.options.onClose}
 *   onEdit={vm.modals.options.onEdit}
 *   onDelete={vm.modals.options.onDelete}
 * />
 * ```
 */

interface SparePartOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const SparePartOptionsModal = ({
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: SparePartOptionsModalProps) => {
  const { t } = useTranslation();

  const actions = [
    {
      icon: Edit,
      title: t('spareParts.options.edit'),
      description: t('spareParts.options.editDesc'),
      onClick: onEdit,
      variant: 'outline' as const,
      isDestructive: false,
    },
    {
      icon: Trash2,
      title: t('spareParts.options.delete'),
      description: t('spareParts.options.deleteDesc'),
      onClick: onDelete,
      variant: 'outline' as const,
      isDestructive: true,
    },
  ];

  const handleActionClick = (onClick: () => void) => {
    onClick();
    // Note: Modal closure is handled by each action's callback
    // This prevents race conditions with state updates
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('spareParts.options.title')}
      description={t('spareParts.options.selectAction')}
    >
      <div className="flex flex-col gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant={action.variant}
              className={`h-auto py-4 px-4 justify-start text-left transition-colors bg-[hsl(var(--color-card))] ${
                action.isDestructive 
                  ? 'text-destructive hover:text-destructive hover:bg-destructive/10'
                  : 'hover:bg-accent'
              }`}
              onPress={() => handleActionClick(action.onClick)}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="ml-1">
                  <Icon className={`h-7 w-7 ${action.isDestructive ? 'text-destructive' : ''}`} />
                </div>
                <div className="flex flex-col">
                  <BodyText 
                    weight="medium" 
                    size='large'
                    className={action.isDestructive ? 'text-destructive' : ''}
                  >
                    {action.title}
                  </BodyText>
                  <BodyText
                    weight='medium'
                    className={
                      action.isDestructive 
                        ? 'text-destructive/80'
                        : 'text-muted-foreground'
                    }
                  >
                    {action.description}
                  </BodyText>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </Modal>
  );
};

// 🔮 POST-MVP: Strategic enhancements (commented)

/**
 * TODO (v0.0.2): Add "Duplicate" option
 * - Clone spare part with new serialId
 * - Useful for creating similar parts quickly
 * - Opens CreateEditSparePartModal pre-filled
 * 
 * Action:
 * {
 *   icon: Copy,
 *   title: t('spareParts.options.duplicate'),
 *   description: t('spareParts.options.duplicateDesc'),
 *   onClick: onDuplicate,
 *   variant: 'outline',
 *   isDestructive: false
 * }
 */

/**
 * TODO (v0.0.3): Add "View History" option
 * - Show usage history (when part was used)
 * - Link to maintenance alarms/events
 * - Navigate to history screen
 * 
 * Action:
 * {
 *   icon: History,
 *   title: t('spareParts.options.viewHistory'),
 *   description: t('spareParts.options.viewHistoryDesc'),
 *   onClick: onViewHistory,
 *   variant: 'outline',
 *   isDestructive: false
 * }
 */

/**
 * TODO (v0.0.4): Add "Generate QR Code" option
 * - Generate QR code for physical inventory
 * - Download as image or print
 * - Scan to view part details
 * 
 * Action:
 * {
 *   icon: QrCode,
 *   title: t('spareParts.options.generateQR'),
 *   description: t('spareParts.options.generateQRDesc'),
 *   onClick: onGenerateQR,
 *   variant: 'outline',
 *   isDestructive: false
 * }
 */

/**
 * TODO (v0.0.5): Add "Mark as Low Stock" option
 * - Manually trigger low stock alert
 * - Useful for parts nearing reorder point
 * - Send notification to inventory manager
 * 
 * Action (conditional, only shown when amount >= minStockLevel):
 * {
 *   icon: AlertTriangle,
 *   title: t('spareParts.options.markLowStock'),
 *   description: t('spareParts.options.markLowStockDesc'),
 *   onClick: onMarkLowStock,
 *   variant: 'outline',
 *   isDestructive: false,
 *   isWarning: true // Yellow styling
 * }
 */
