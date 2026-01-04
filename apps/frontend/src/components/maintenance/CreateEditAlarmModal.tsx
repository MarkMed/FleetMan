import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { 
  CreateMaintenanceAlarmRequestSchema,
  type CreateMaintenanceAlarmRequest,
  type MaintenanceAlarm,
} from '@contracts';

import { Modal, InputField, Button, Textarea, BodyText } from '@components/ui';
import { RelatedPartsInput } from '@components/maintenance';
import { useCreateMaintenanceAlarm, useUpdateMaintenanceAlarm } from '@hooks';
import { useToast } from '@hooks/useToast';

interface CreateEditAlarmModalProps {
  /**
   * Modal open state
   */
  isOpen: boolean;
  /**
   * Close handler
   */
  onClose: () => void;
  /**
   * Machine ID for the alarm
   */
  machineId: string | undefined;
  /**
   * Alarm to edit (if null, creates new alarm)
   */
  alarm?: MaintenanceAlarm | null;
}

/**
 * CreateEditAlarmModal Component
 * 
 * Modal form for creating or editing maintenance alarms.
 * Uses React Hook Form + Zod validation from @contracts.
 * 
 * Sprint #11: Mock implementation (simulates API calls)
 * Sprint #12: Will connect to real backend
 * 
 * Form Fields:
 * - title (string, max 100)
 * - description (textarea, max 500, optional)
 * - intervalHours (number, min 1, max 50000)
 * - relatedParts (string[], max 50 items)
 * - isActive (boolean toggle)
 * 
 * @example
 * ```tsx
 * <CreateEditAlarmModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   machineId={machineId}
 *   alarm={editingAlarm} // null for create, alarm object for edit
 * />
 * ```
 */
export const CreateEditAlarmModal: React.FC<CreateEditAlarmModalProps> = ({
  isOpen,
  onClose,
  machineId,
  alarm,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const isEditMode = !!alarm;

  // Mutations
  const createMutation = useCreateMaintenanceAlarm(machineId);
  const updateMutation = useUpdateMaintenanceAlarm(machineId);

  // Form with Zod validation from contracts
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateMaintenanceAlarmRequest>({
    resolver: zodResolver(CreateMaintenanceAlarmRequestSchema),
    defaultValues: {
      title: '',
      description: '',
      intervalHours: 100,
      relatedParts: [],
    },
  });

  // Watch relatedParts for controlled input
  const relatedParts = watch('relatedParts');

  // ========================
  // EFFECTS
  // ========================

  // Reset form when modal opens/closes or alarm changes
  useEffect(() => {
    if (isOpen) {
      if (alarm) {
        // Edit mode: populate with alarm data
        reset({
          title: alarm.title,
          description: alarm.description || '',
          intervalHours: alarm.intervalHours,
          relatedParts: [...alarm.relatedParts], // Clone array
          isActive: alarm.isActive, // Preserve current activation state
        });
      } else {
        // Create mode: reset to defaults
        reset({
          title: '',
          description: '',
          intervalHours: 100,
          relatedParts: [],
        });
      }
    }
  }, [isOpen, alarm, reset]);

  // ========================
  // HANDLERS
  // ========================

  const onSubmit = async (data: CreateMaintenanceAlarmRequest) => {
    try {
      if (isEditMode && alarm) {
        // Update existing alarm
        await updateMutation.mutateAsync({
          alarmId: alarm.id,
          changes: data,
        });

        toast({
          title: t('maintenance.alarms.notifications.updated'),
          variant: 'success',
        });
      } else {
        // Create new alarm - Always active by default (Focus on Value, Not Edge Cases)
        await createMutation.mutateAsync({ ...data, isActive: true });

        toast({
          title: t('maintenance.alarms.notifications.created'),
          variant: 'success',
        });
      }

      // Close modal and reset form
      onClose();
      reset();
    } catch (error) {
      console.error('[CreateEditAlarmModal] Error:', error);
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing during submission
    onClose();
    reset();
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
          ? t('maintenance.alarms.form.editTitle')
          : t('maintenance.alarms.form.createTitle')
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title Field */}
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField
              label={t('maintenance.alarms.alarmTitle')}
              placeholder={t('maintenance.alarms.alarmTitlePlaceholder')}
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.title?.message}
              required
            />
          )}
        />

        {/* Description Field */}
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Textarea
              label={t('maintenance.alarms.alarmDescription')}
              placeholder={t('maintenance.alarms.alarmDescriptionPlaceholder')}
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              rows={3}
              maxLength={500}
              error={errors.description?.message}
              helperText={t('maintenance.alarms.form.descriptionMax')}
            />
          )}
        />

        {/* Interval Hours Field */}
        <div>
          <InputField
            label={t('maintenance.alarms.intervalHoursLabel')}
            type="number"
            placeholder={t('maintenance.alarms.intervalHoursPlaceholder')}
            name="intervalHours"
            value={watch('intervalHours')?.toString() || ''}
            onChangeText={(text) => setValue('intervalHours', parseInt(text) || 0, { shouldValidate: true })}
            error={errors.intervalHours?.message}
            required
            min={1}
            max={50000}
          />
          <BodyText size="small" className="text-muted-foreground mt-1">
            {t('maintenance.alarms.intervalHoursHint')}
          </BodyText>
        </div>

        {/* Related Parts Field */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('maintenance.alarms.relatedParts')}
          </label>
          <RelatedPartsInput
            value={relatedParts}
            onChange={(parts) => setValue('relatedParts', parts)}
            maxParts={50}
            error={errors.relatedParts?.message}
          />
        </div>

        {/* POST-MVP: Active Toggle
         * Removed in minimalist iteration - "Focus on Value, Not Edge Cases"
         * Edge case: Creating alarm to immediately disable makes no functional sense
         * User can activate/deactivate later from AlarmDetailModal
         * 
         * <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
         *   <div>
         *     <BodyText weight="medium">{t('maintenance.isActive')}</BodyText>
         *     <BodyText size="small" className="text-muted-foreground">
         *       {watch('isActive')
         *         ? 'La alarma sonará automáticamente cuando se cumpla el intervalo'
         *         : 'La alarma está desactivada y no sonará'}
         *     </BodyText>
         *   </div>
         *   <Switch
         *     checked={watch('isActive')}
         *     onCheckedChange={(checked: boolean) => setValue('isActive', checked)}
         *   />
         * </div>
         */}

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
            {isEditMode ? t('common.save') : t('common.create')}
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
 * Multi-step wizard for complex alarm creation
 * Step 1: Basic info (title, interval)
 * Step 2: Related parts (with autocomplete)
 * Step 3: Notification settings (who to notify, when)
 * Step 4: Preview and confirm
 */
// export const AlarmWizardModal: React.FC<AlarmWizardProps> = ({ ... }) => { }

/**
 * Template selection
 * Pre-fill form from maintenance task templates
 * 
 * UI: Dropdown "Cargar desde plantilla" at top of modal
 */
// const [selectedTemplate, setSelectedTemplate] = useState<AlarmTemplate | null>(null);

/**
 * Duplicate alarm
 * Clone existing alarm and edit
 * 
 * Props: sourceAlarm (alarm to duplicate)
 */
// export const DuplicateAlarmModal: React.FC<DuplicateAlarmModalProps> = ({ ... }) => { }

/**
 * Advanced scheduling options
 * - notifyBefore: Alert X hours before interval
 * - priority: LOW | MEDIUM | HIGH
 * - assignedTo: Specific responsible person
 * 
 * UI: Expandable "Advanced Options" section
 */
// const [showAdvanced, setShowAdvanced] = useState(false);
