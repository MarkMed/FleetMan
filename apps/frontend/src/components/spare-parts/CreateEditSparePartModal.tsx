import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { 
  CreateSparePartRequestSchema,
  type CreateSparePartRequest,
  type UpdateSparePartRequest,
} from '@contracts';

import { Modal, InputField, Button, BodyText } from '@components/ui';

/**
 * Type for spare part entity
 */
interface SparePart {
  id: string;
  name: string;
  serialId: string;
  amount: number;
  machineId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface CreateEditSparePartModalProps {
  /**
   * Modal open state
   */
  isOpen: boolean;
  /**
   * Close handler
   */
  onClose: () => void;
  /**
   * Machine ID for the spare part
   */
  machineId: string | undefined;
  /**
   * Spare part to edit (if null/undefined, creates new part)
   */
  sparePart?: SparePart | null;
  /**
   * Create callback (called when creating new part)
   */
  onCreate?: (data: CreateSparePartRequest) => Promise<void>;
  /**
   * Update callback (called when editing existing part)
   */
  onUpdate?: (sparePartId: string, updates: UpdateSparePartRequest) => Promise<void>;
}

/**
 * CreateEditSparePartModal Component
 * 
 * Modal form for creating or editing spare parts.
 * Uses React Hook Form + Zod validation from @contracts.
 * 
 * Sprint #15/16 Task 7.1: Spare Parts Frontend
 * 
 * Form Fields:
 * - name (string, 2-200 chars)
 * - serialId (string, 1-100 chars)
 * - amount (number, integer >= 0)
 * - machineId (hidden, auto-filled from prop)
 * 
 * Behavior:
 * - Single modal for create + edit (discriminated by sparePart prop)
 * - Create mode: All fields empty, machineId auto-filled
 * - Edit mode: Pre-populate fields, machineId immutable (hidden)
 * - Reset form when modal opens/closes or sparePart changes
 * - Display validation errors from Zod schema
 * - Handle async mutations with loading state
 * 
 * @example
 * ```tsx
 * <CreateEditSparePartModal
 *   isOpen={vm.modals.createEdit.isOpen}
 *   onClose={vm.modals.createEdit.onClose}
 *   machineId={vm.state.machineId}
 *   sparePart={vm.data.selectedPart}
 *   onCreate={vm.modals.createEdit.onCreate}
 *   onUpdate={vm.modals.createEdit.onUpdate}
 * />
 * ```
 */
export const CreateEditSparePartModal: React.FC<CreateEditSparePartModalProps> = ({
  isOpen,
  onClose,
  machineId,
  sparePart,
  onCreate,
  onUpdate,
}) => {
  const { t } = useTranslation();

  const isEditMode = !!sparePart;

  // React Hook Form with Zod validation
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateSparePartRequest>({
    resolver: zodResolver(CreateSparePartRequestSchema),
    defaultValues: {
      name: '',
      serialId: '',
      amount: 0,
      machineId: machineId || '',
    },
  });

  // ========================
  // EFFECTS
  // ========================

  // Reset form when modal opens/closes or sparePart changes
  useEffect(() => {
    if (isOpen) {
      if (sparePart) {
        // Edit mode: populate with sparePart data
        reset({
          name: sparePart.name,
          serialId: sparePart.serialId,
          amount: sparePart.amount,
          machineId: sparePart.machineId,
        });
      } else {
        // Create mode: reset to defaults
        reset({
          name: '',
          serialId: '',
          amount: 0,
          machineId: machineId || '',
        });
      }
    }
  }, [isOpen, sparePart, machineId, reset]);

  // ========================
  // HANDLERS
  // ========================

  const onSubmit = async (data: CreateSparePartRequest) => {
    try {
      if (isEditMode && sparePart && onUpdate) {
        // Update existing spare part
        // Extract only updatable fields (machineId is immutable)
        const updates: UpdateSparePartRequest = {
          name: data.name,
          serialId: data.serialId,
          amount: data.amount,
        };
        
        await onUpdate(sparePart.id, updates);
      } else if (onCreate) {
        // Create new spare part
        await onCreate(data);
      }

      // Success handled by ViewModel (toast + modal close)
      // No need to close here, ViewModel handles it
    } catch (error) {
      // Error handled by ViewModel (toast)
      // Keep modal open for user to fix errors
      console.error('[CreateEditSparePartModal] Error:', error);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing during submission
    onClose();
  };

  // ========================
  // RENDER
  // ========================

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      title={
        isEditMode
          ? t('spareParts.form.editTitle')
          : t('spareParts.form.createTitle')
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField
              label={t('spareParts.form.name')}
              placeholder={t('spareParts.form.namePlaceholder')}
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
              required
              maxLength={200}
            />
          )}
        />

        {/* Serial ID Field */}
        <Controller
          control={control}
          name="serialId"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField
              label={t('spareParts.form.serialId')}
              placeholder={t('spareParts.form.serialIdPlaceholder')}
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.serialId?.message}
              required
              maxLength={100}
            />
          )}
        />

        {/* Amount Field */}
        <div>
          <InputField
            label={t('spareParts.form.amount')}
            type="number"
            placeholder={t('spareParts.form.amountPlaceholder')}
            name="amount"
            value={watch('amount')?.toString() || '0'}
            onChangeText={(text) => {
              const value = parseInt(text) || 0;
              setValue('amount', value >= 0 ? value : 0, { shouldValidate: true });
            }}
            error={errors.amount?.message}
            required
            min={0}
          />
          <BodyText size="small" className="text-muted-foreground mt-1">
            {t('spareParts.form.amountHint')}
          </BodyText>
        </div>

        {/* Machine ID (hidden, auto-filled) */}
        {/* Note: machineId is required by backend but not editable by user */}
        <input type="hidden" {...control.register('machineId')} />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            htmlType="button"
            variant="outline"
            onPress={handleClose}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            htmlType="submit"
            variant="filled"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditMode ? t('common.save') : t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ============================================
// POST-MVP: Enhanced Features (Commented)
// ============================================

/**
 * TODO (v0.0.2): Add photo upload field
 * - Upload part photo for visual identification
 * - Preview uploaded image
 * - Crop/resize functionality
 * 
 * UI Addition:
 * <div>
 *   <label>{t('spareParts.form.photo')}</label>
 *   <ImageUpload
 *     value={photoUrl}
 *     onChange={(url) => setValue('photoUrl', url)}
 *     maxSize={5 * 1024 * 1024} // 5MB
 *     accept="image/*"
 *   />
 * </div>
 */

/**
 * TODO (v0.0.3): Add part details fields (collapsible section)
 * - Part number (manufacturer SKU)
 * - Manufacturer name
 * - Supplier info
 * - Unit cost
 * - Notes/description
 * 
 * UI Structure:
 * <CollapsibleSection title={t('spareParts.form.advancedDetails')}>
 *   <InputField label="Part Number" name="partNumber" />
 *   <InputField label="Manufacturer" name="manufacturer" />
 *   <InputField label="Supplier" name="supplier" />
 *   <InputField label="Unit Cost" type="number" name="unitCost" />
 *   <Textarea label="Notes" name="notes" />
 * </CollapsibleSection>
 */

/**
 * TODO (v0.0.4): Add stock thresholds
 * - Min stock level (trigger low stock alert)
 * - Max stock level (prevent overstocking)
 * - Reorder point (automatic purchase order)
 * 
 * UI Addition:
 * <div className="grid grid-cols-2 gap-4">
 *   <InputField label="Min Stock" type="number" name="minStockLevel" />
 *   <InputField label="Max Stock" type="number" name="maxStockLevel" />
 * </div>
 */

/**
 * TODO (v0.0.5): Add duplicate detection warning
 * - Check for existing parts with same serialId during typing
 * - Show warning if duplicate found
 * - Allow override with confirmation
 * 
 * Implementation:
 * const debouncedSerialId = useDebounce(watch('serialId'), 500);
 * const { data: existingPart } = useCheckDuplicateSerialId(machineId, debouncedSerialId);
 * 
 * {existingPart && (
 *   <Alert variant="warning">
 *     {t('spareParts.form.duplicateWarning', { name: existingPart.name })}
 *   </Alert>
 * )}
 */

/**
 * TODO (v0.0.6): Add location field
 * - Storage location (warehouse, shelf, bin)
 * - Autocomplete from previous locations
 * - Quick access map/diagram (future)
 * 
 * UI Addition:
 * <InputField
 *   label="Location"
 *   name="location"
 *   placeholder="e.g., Warehouse A, Shelf 3, Bin 12"
 *   suggestions={previousLocations}
 * />
 */
