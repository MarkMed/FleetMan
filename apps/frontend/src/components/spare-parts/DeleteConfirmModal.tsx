import { useTranslation } from 'react-i18next';
import { Modal, Button, BodyText, Heading3 } from '@components/ui';
import { AlertTriangle } from 'lucide-react';

/**
 * Type for spare part entity
 */
interface SparePart {
  id: string;
  name: string;
  serialId: string;
  amount: number;
  machineId: string;
}

/**
 * DeleteConfirmModal Component
 * Sprint #15/16 Task 7.1 - Spare Parts Frontend
 * 
 * Purpose:
 * - Confirm permanent deletion of spare part
 * - Prevent accidental deletions with explicit confirmation
 * - Display part details for clarity
 * 
 * Design:
 * - Warning modal with destructive styling
 * - Shows spare part name and serialId for verification
 * - Clear warning message about permanent action
 * - Cancel (default) + Delete (destructive) buttons
 * 
 * @example
 * ```tsx
 * <DeleteConfirmModal
 *   open={vm.modals.deleteConfirm.isOpen}
 *   onOpenChange={vm.modals.deleteConfirm.onClose}
 *   onConfirm={vm.modals.deleteConfirm.onConfirm}
 *   sparePart={vm.data.selectedPart}
 *   isDeleting={vm.state.isDeleting}
 * />
 * ```
 */

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  sparePart: SparePart | null;
  isDeleting?: boolean;
}

export const DeleteConfirmModal = ({
  open,
  onOpenChange,
  onConfirm,
  sparePart,
  isDeleting = false,
}: DeleteConfirmModalProps) => {
  const { t } = useTranslation();

  if (!sparePart) return null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('spareParts.deleteConfirm.title')}
    >
      <div className="space-y-4">
        {/* Warning Icon + Message */}
        <div className="flex items-start gap-4 p-4 bg-destructive/10 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
          <div>
            <BodyText weight="medium" className="text-destructive mb-1">
              {t('spareParts.deleteConfirm.warning')}
            </BodyText>
            <BodyText size="small" className="text-destructive/80">
              {t('spareParts.deleteConfirm.warningDesc')}
            </BodyText>
          </div>
        </div>

        {/* Part Details for Verification */}
        <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
          <Heading3 size="large" weight="medium" className="mb-3">
            {t('spareParts.deleteConfirm.partDetails')}
          </Heading3>
          
          <div className="grid grid-cols-3 gap-2">
            <BodyText size="small" className="text-muted-foreground">
              {t('spareParts.form.name')}:
            </BodyText>
            <BodyText size="small" weight="medium" className="col-span-2">
              {sparePart.name}
            </BodyText>

            <BodyText size="small" className="text-muted-foreground">
              {t('spareParts.form.serialId')}:
            </BodyText>
            <BodyText size="small" weight="medium" className="col-span-2">
              {sparePart.serialId}
            </BodyText>

            <BodyText size="small" className="text-muted-foreground">
              {t('spareParts.form.amount')}:
            </BodyText>
            <BodyText size="small" weight="medium" className="col-span-2">
              {sparePart.amount} {t('spareParts.units')}
            </BodyText>
          </div>
        </div>

        {/* Confirmation Prompt */}
        <BodyText className="text-center">
          {t('spareParts.deleteConfirm.areYouSure')}
        </BodyText>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onPress={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="filled"
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            onPress={onConfirm}
            loading={isDeleting}
            disabled={isDeleting}
          >
            {t('common.delete')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// 🔮 POST-MVP: Strategic enhancements (commented)

/**
 * TODO (v0.0.2): Add impact warning
 * - Show if part is linked to active maintenance alarms
 * - Display count of pending maintenance tasks using this part
 * - Warn about potential scheduling disruptions
 * 
 * UI Addition (conditional):
 * {linkedAlarmsCount > 0 && (
 *   <Alert variant="warning">
 *     <AlertTriangle className="h-4 w-4" />
 *     <AlertTitle>{t('spareParts.deleteConfirm.linkedAlarms')}</AlertTitle>
 *     <AlertDescription>
 *       {t('spareParts.deleteConfirm.linkedAlarmsDesc', { count: linkedAlarmsCount })}
 *     </AlertDescription>
 *   </Alert>
 * )}
 */

/**
 * TODO (v0.0.3): Add "Move to Archive" option
 * - Soft delete instead of permanent deletion
 * - Keep historical data for reporting
 * - Restore option if needed
 * 
 * UI Addition:
 * <Button
 *   variant="outline"
 *   onPress={onArchive}
 *   disabled={isDeleting}
 * >
 *   {t('spareParts.deleteConfirm.archiveInstead')}
 * </Button>
 */

/**
 * TODO (v0.0.4): Add "Transfer to Another Machine" option
 * - Move part to different machine instead of deleting
 * - Useful for repurposing inventory
 * - Quick machine selector dropdown
 * 
 * UI Addition:
 * <div className="pt-4 border-t">
 *   <BodyText size="small" className="mb-2">
 *     {t('spareParts.deleteConfirm.transferOption')}
 *   </BodyText>
 *   <MachineSelect
 *     value={transferMachineId}
 *     onChange={setTransferMachineId}
 *     excludeMachineId={sparePart.machineId}
 *   />
 *   <Button onClick={() => onTransfer(transferMachineId)}>
 *     {t('spareParts.deleteConfirm.transferButton')}
 *   </Button>
 * </div>
 */
