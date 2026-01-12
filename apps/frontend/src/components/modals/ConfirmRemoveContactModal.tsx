import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ModalRoot,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@components/ui/Modal';
import { Button, BodyText } from '@components/ui';
import { AlertTriangle } from 'lucide-react';
import type { UserPublicProfile } from '@packages/contracts';

/**
 * @deprecated This component is deprecated and will be removed in the future.
 * 
 * Reason: Violates DRY (Don't Repeat Yourself) principle.
 * Replacement: Use global modal system instead (modal.show() from @helpers/modal).
 * 
 * Migration example:
 * ```tsx
 * // OLD (deprecated):
 * <ConfirmRemoveContactModal
 *   isOpen={isOpen}
 *   contact={contact}
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 * />
 * 
 * // NEW (recommended):
 * modal.show({
 *   title: t('users.contacts.confirmRemoveTitle'),
 *   description: t('users.contacts.confirmRemoveMessage', { companyName }),
 *   variant: 'danger',
 *   showConfirm: true,
 *   showCancel: true,
 *   confirmText: t('users.contacts.confirmRemoveButton'),
 *   cancelText: t('users.contacts.cancelRemoveButton'),
 *   confirmButtonClassName: 'bg-transparent hover:bg-destructive/10 text-destructive border-destructive border',
 *   onConfirm: async () => {
 *     await removeContactMutation.mutateAsync(contactId);
 *   }
 * });
 * ```
 * 
 * Benefits of global modal:
 * - Single source of truth for modal logic
 * - Consistent styling across app
 * - Less code duplication
 * - Easier to maintain and extend
 * - Centralized modal state management
 * 
 * TODO: Remove this file after migrating all usages to global modal system
 */

interface ConfirmRemoveContactModalProps {
  /**
   * Controls modal visibility
   */
  isOpen: boolean;
  
  /**
   * Contact to be removed (null when modal is closed)
   */
  contact: UserPublicProfile | null;
  
  /**
   * Callback when user confirms removal
   */
  onConfirm: () => void;
  
  /**
   * Callback when user cancels or closes modal
   */
  onCancel: () => void;
  
  /**
   * Loading state during removal operation
   * @default false
   */
  isLoading?: boolean;
}

/**
 * ConfirmRemoveContactModal Component
 * 
 * Confirmation dialog for removing a contact from user's contact list.
 * Part of Sprint #12 - Module 2: User Communication System (Contact Management).
 * 
 * Purpose:
 * - Prevent accidental contact removal
 * - Show clear warning message
 * - Display company name of contact being removed
 * - Provide cancel/confirm actions
 * 
 * UX Pattern:
 * - Destructive action requires confirmation
 * - Alert icon for visual warning
 * - Disabled buttons during loading
 * - Clear button labels (Cancel vs Remove)
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * const [selectedContact, setSelectedContact] = useState<UserPublicProfile | null>(null);
 * const removeContact = useRemoveContact();
 * 
 * const handleConfirm = () => {
 *   if (selectedContact) {
 *     removeContact.mutate(selectedContact.id);
 *   }
 * };
 * 
 * <ConfirmRemoveContactModal
 *   isOpen={isOpen}
 *   contact={selectedContact}
 *   onConfirm={handleConfirm}
 *   onCancel={() => setIsOpen(false)}
 *   isLoading={removeContact.isPending}
 * />
 * ```
 */
export const ConfirmRemoveContactModal: React.FC<ConfirmRemoveContactModalProps> = ({
  isOpen,
  contact,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  // Company name for display (fallback to "Sin nombre")
  const companyName = contact?.profile.companyName || t('users.discovery.noCompanyName');

  return (
    <ModalRoot open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <ModalContent showCloseButton={!isLoading}>
        {/* Header with warning icon */}
        <ModalHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <ModalTitle className="text-xl">
              {t('users.contacts.confirmRemoveTitle')}
            </ModalTitle>
          </div>
          <ModalDescription>
            <BodyText className="text-muted-foreground">
              {t('users.contacts.confirmRemoveMessage', { companyName })}
            </BodyText>
          </ModalDescription>
        </ModalHeader>

        {/* Footer with action buttons */}
        <ModalFooter className="mt-6">
          <Button
            variant="outline"
            onPress={onCancel}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            {t('users.contacts.cancelRemoveButton')}
          </Button>
          
          <Button
            variant="destructive"
            onPress={onConfirm}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            {isLoading ? t('users.contacts.removing') : t('users.contacts.confirmRemoveButton')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalRoot>
  );
};

// =============================================================================
// FUTURE ENHANCEMENTS (Strategic, commented for post-MVP)
// =============================================================================

/**
 * TODO: Add checkbox "Don't show this again" para usuarios avanzados
 * Guardar preferencia en localStorage
 * 
 * @example
 * const [dontShowAgain, setDontShowAgain] = useState(false);
 * 
 * <Checkbox
 *   checked={dontShowAgain}
 *   onCheckedChange={setDontShowAgain}
 *   label="No volver a mostrar esta confirmación"
 * />
 */

/**
 * TODO: Show contact statistics in modal (messages sent, interactions, etc.)
 * Útil para contexto antes de eliminar
 * 
 * @example
 * <BodyText>
 *   Has intercambiado {messageCount} mensajes con este contacto.
 * </BodyText>
 */

/**
 * TODO: Option to "Archive" instead of delete (soft delete)
 * Útil para mantener historial sin mostrar en lista activa
 * 
 * @example
 * <Button variant="outline" onPress={onArchive}>
 *   Archivar contacto
 * </Button>
 */
