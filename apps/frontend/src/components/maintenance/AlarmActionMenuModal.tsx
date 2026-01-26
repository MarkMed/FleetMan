import { useTranslation } from 'react-i18next';
import { Modal, Button, BodyText } from '@components/ui';
import { Mail, Clock, Edit, CheckCircle, PowerOff } from 'lucide-react';

interface AlarmActionMenuModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactProvider: () => void;
  onPostpone: () => void;
  onEditAlarm: () => void;
  onMarkCompleted: () => void;
  onStopMachine: () => void;
}

export const AlarmActionMenuModal = ({
  open,
  onOpenChange,
  onContactProvider,
  onPostpone,
  onEditAlarm,
  onMarkCompleted,
  onStopMachine,
}: AlarmActionMenuModalProps) => {
  const { t } = useTranslation();

  const actions = [
    {
      icon: CheckCircle,
      title: t('maintenance.alarms.actions.markCompleted'),
      description: t('maintenance.alarms.actions.markCompletedDesc'),
      onClick: onMarkCompleted,
      variant: 'default' as const,
    },
    {
      icon: Mail,
      title: t('maintenance.alarms.actions.contactProvider'),
      description: t('maintenance.alarms.actions.contactProviderDesc'),
      onClick: onContactProvider,
      variant: 'default' as const,
    },
    {
      icon: Clock,
      title: t('maintenance.alarms.actions.postpone'),
      description: t('maintenance.alarms.actions.postponeDesc'),
      onClick: onPostpone,
      variant: 'default' as const,
    },
    {
      icon: Edit,
      title: t('maintenance.alarms.actions.editAlarm'),
      description: t('maintenance.alarms.actions.editAlarmDesc'),
      onClick: onEditAlarm,
      variant: 'default' as const,
    },
    {
      icon: PowerOff,
      title: t('maintenance.alarms.actions.stopMachine'),
      description: t('maintenance.alarms.actions.stopMachineDesc'),
      onClick: onStopMachine,
      variant: 'default' as const,
    },
  ];

  const handleActionClick = (onClick: () => void) => {
    onClick();
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('maintenance.alarms.actions.title')}
      description={t('maintenance.alarms.actions.selectAction')}
    >
      <div className="flex flex-col gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-4 px-4 justify-start text-left bg-[hsl(var(--color-card))] hover:bg-accent transition-colors"
              onPress={() => handleActionClick(action.onClick)}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="mt-0.5">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <BodyText weight="medium">{action.title}</BodyText>
                  <BodyText size="small" className="text-muted-foreground">
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
