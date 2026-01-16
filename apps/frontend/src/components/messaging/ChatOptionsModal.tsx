import { useTranslation } from 'react-i18next';
import { Modal, Button, BodyText } from '@components/ui';
import { UserPlus, ShieldBan, Timer } from 'lucide-react';

/**
 * ChatOptionsModal Component
 * Sprint #13 Task 9.3h - Chat Access Control UI
 * 
 * Purpose:
 * - Display options menu for chat actions (similar to AlarmActionMenuModal)
 * - Allows adding contact, blocking user, and other future actions
 * - Accessed via "three dots" button in chat header
 * 
 * Options:
 * 1. Guardar Contacto (Add as Contact) - Functional
 * 2. Bloquear Usuario (Block User) - Functional, red text, at bottom
 * 3. Silenciar Conversación (Mute) - "En construcción" toast
 * 4. Reportar Usuario (Report) - "En construcción" toast
 * 5. Archivar Chat (Archive) - "En construcción" toast
 * 
 * Design:
 * - Modal with title "Opciones de Chat"
 * - Each option is an outlined button with icon + title + description
 * - Block option has destructive styling (red)
 * - Options close modal automatically after click
 * 
 * @example
 * ```tsx
 * <ChatOptionsModal
 *   open={vm.modals.chatOptions.isOpen}
 *   onOpenChange={vm.modals.chatOptions.onOpenChange}
 *   onAddContact={vm.actions.handleAddContact}
 *   onBlockUser={vm.actions.handleBlockUser}
 *   isContact={vm.state.isContact}
 * />
 * ```
 */

interface ChatOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAcceptChat: () => void; // Sprint #13: Accept chat from non-contact
  onAddContact: () => void;
  onBlockUser: () => void;
  onIgnoreForNow: () => void; // Sprint #13: Ignore decision temporarily
  isContact: boolean; // Hide "Add Contact" and "Accept Chat" if already contact
}

export const ChatOptionsModal = ({
  open,
  onOpenChange,
  onAcceptChat,
  onAddContact,
  onBlockUser,
  onIgnoreForNow,
  isContact,
}: ChatOptionsModalProps) => {
  const { t } = useTranslation();

  const actions = [
    // Sprint #13: Reordered for first-conversation flow
    // 1. Accept Chat (CTA - primary action for non-contacts)
    // 2. Add Contact (secondary action)
    // 3. Ignore for Now (escape hatch)
    // 4. Block User (destructive, always last)
    
    // Only show "Accept Chat" if not contact (will be hidden after accepting)
    ...(!isContact
      ? [
          {
            icon: UserPlus, // TODO: Consider UserCheck icon for "Accept"
            title: t('messages.chatOptions.acceptChat'),
            description: t('messages.chatOptions.acceptChatDesc'),
            onClick: onAcceptChat,
            variant: 'filled' as const, // CTA styling (primary blue)
            isDestructive: false,
            isCTA: true,
          },
        ]
      : []),
    // Only show "Add Contact" if not already a contact
    ...(!isContact
      ? [
          {
            icon: UserPlus,
            title: t('messages.chatOptions.addContact'),
            description: t('messages.chatOptions.addContactDesc'),
            onClick: onAddContact,
            variant: 'outline' as const, // Secondary styling
            isDestructive: false,
            isCTA: false,
          },
        ]
      : []),
    // Ignore for now - escape hatch for users who don't want to decide yet
    ...(!isContact
      ? [
          {
            icon: Timer,
            title: t('messages.chatOptions.ignoreForNow'),
            description: t('messages.chatOptions.ignoreForNowDesc'),
            onClick: onIgnoreForNow,
            variant: 'ghost' as const, // Subtle styling
            isDestructive: false,
            isCTA: false,
          },
        ]
      : []),
    // Block user always at the bottom with destructive styling
    {
      icon: ShieldBan,
      title: t('messages.chatOptions.blockUser'),
      description: t('messages.chatOptions.blockUserDesc'),
      onClick: onBlockUser,
      variant: 'outline' as const, // Outline with red text
      isDestructive: true,
      isCTA: false,
    },
  ];

  const handleActionClick = (onClick: () => void) => {
    // Execute action handler
    // NOTE: Modal closure is handled by each action's onSuccess callback
    // This prevents race conditions with query invalidation
    onClick();
    
    // Only close immediately for actions that don't have async mutations
    // (e.g., Block User has its own confirmation modal, so close this one)
    // Accept Chat and Add Contact close themselves in onSuccess
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('messages.chatOptions.title')}
      description={t('messages.chatOptions.selectAction')}
      showCloseButton={false}
    >
      <div className="flex flex-col gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant={action.variant}
              className={`h-auto py-4 px-4 justify-start text-left transition-colors ${
                action.isCTA 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : action.isDestructive 
                  ? 'text-destructive hover:text-destructive hover:bg-destructive/10' 
                  : 'hover:bg-accent'
              }`}
              onPress={() => handleActionClick(action.onClick)}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="mt-0.5">
                  <Icon className={`h-5 w-5 ${
                    action.isCTA 
                      ? 'text-primary-foreground' 
                      : action.isDestructive 
                      ? 'text-destructive' 
                      : ''
                  }`} />
                </div>
                <div className="flex flex-col gap-1">
                  <BodyText 
                    weight="medium" 
                    className={action.isCTA ? 'text-primary-foreground' : action.isDestructive ? 'text-destructive' : ''}
                  >
                    {action.title}
                  </BodyText>
                  <BodyText
                    size="small"
                    className={
                      action.isCTA 
                        ? 'text-primary-foreground/80' 
                        : action.isDestructive 
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
