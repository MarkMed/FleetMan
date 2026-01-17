import { useTranslation } from 'react-i18next';
import { Modal, Button, BodyText } from '@components/ui';
import { UserPlus, ShieldBan, Timer, Trash2 } from 'lucide-react';

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
  onClearChat: () => void; // Sprint #13: Clear chat history (coming soon)
  isContact: boolean; // Hide "Add Contact" and "Accept Chat" if already contact
  hasAcceptedChat: boolean; // Sprint #13: Check if user already accepted this chat
}

export const ChatOptionsModal = ({
  open,
  onOpenChange,
  onAcceptChat,
  onAddContact,
  onBlockUser,
  onIgnoreForNow,
  onClearChat,
  isContact,
  hasAcceptedChat,
}: ChatOptionsModalProps) => {
  const { t } = useTranslation();

  // Sprint #13: Contextual actions based on chat state
  // Different options for different scenarios:
  // 1. First conversation from non-contact: Accept, Add Contact, Ignore, Block
  // 2. Accepted chat (non-contact): Add Contact, Clear Chat, Block
  // 3. Contact chat: Clear Chat, Block
  const actions = [];
  
  // SCENARIO 1: First conversation from non-contact (decision required)
  // Show: Accept Chat (CTA), Add Contact, Ignore for Now
  if (!isContact && !hasAcceptedChat) {
    actions.push(
      {
        icon: UserPlus,
        title: t('messages.chatOptions.acceptChat'),
        description: t('messages.chatOptions.acceptChatDesc'),
        onClick: onAcceptChat,
        variant: 'filled' as const,
        isDestructive: false,
        isCTA: true,
      },
      {
        icon: UserPlus,
        title: t('messages.chatOptions.addContact'),
        description: t('messages.chatOptions.addContactDesc'),
        onClick: onAddContact,
        variant: 'outline' as const,
        isDestructive: false,
        isCTA: false,
      },
      {
        icon: Timer,
        title: t('messages.chatOptions.ignoreForNow'),
        description: t('messages.chatOptions.ignoreForNowDesc'),
        onClick: onIgnoreForNow,
        variant: 'ghost' as const,
        isDestructive: false,
        isCTA: false,
      }
    );
  }
  
  // SCENARIO 2: Accepted chat but not contact yet
  // Show: Add Contact only (user already accepted, can add as contact)
  else if (!isContact && hasAcceptedChat) {
    actions.push(
      {
        icon: UserPlus,
        title: t('messages.chatOptions.addContact'),
        description: t('messages.chatOptions.addContactDesc'),
        onClick: onAddContact,
        variant: 'outline' as const,
        isDestructive: false,
        isCTA: false,
      }
    );
  }
  
  // SCENARIO 3: Any active chat (accepted or contact)
  // Show: Clear Chat (warning style, coming soon)
  if (hasAcceptedChat || isContact) {
    actions.push(
      {
        icon: Trash2,
        title: t('messages.chatOptions.clearChat', 'Limpiar Chat'),
        description: t('messages.chatOptions.clearChatDesc', 'Eliminar todo el historial de mensajes'),
        onClick: onClearChat,
        variant: 'outline' as const,
        isDestructive: false,
        isWarning: true, // New flag for warning styling (yellow)
        isCTA: false,
      }
    );
  }
  
  // ALWAYS: Block User at the bottom (destructive action)
  actions.push(
    {
      icon: ShieldBan,
      title: t('messages.chatOptions.blockUser'),
      description: t('messages.chatOptions.blockUserDesc'),
      onClick: onBlockUser,
      variant: 'outline' as const,
      isDestructive: true,
      isCTA: false,
    }
  );

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
      // showCloseButton={false}
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
                  : (action as any).isWarning
                  ? 'text-warning hover:text-warning hover:bg-warning/10'
                  : 'hover:bg-accent'
              }`}
              onPress={() => handleActionClick(action.onClick)}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="ml-1">
                  <Icon className={`h-7 w-7 ${
                    action.isCTA 
                      ? 'text-primary-foreground' 
                      : action.isDestructive 
                      ? 'text-destructive'
                      : (action as any).isWarning
                      ? 'text-warning'
                      : ''
                  }`} />
                </div>
                <div className="flex flex-col">
                  <BodyText 
                    weight="medium" 
                    size='large'
                    className={
                      action.isCTA 
                        ? 'text-primary-foreground' 
                        : action.isDestructive 
                        ? 'text-destructive'
                        : (action as any).isWarning
                        ? 'text-warning'
                        : ''
                    }
                  >
                    {action.title}
                  </BodyText>
                  <BodyText
                    weight='medium'
                    className={
                      action.isCTA 
                        ? 'text-primary-foreground/80' 
                        : action.isDestructive 
                        ? 'text-destructive/80'
                        : (action as any).isWarning
                        ? 'text-warning/80'
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
