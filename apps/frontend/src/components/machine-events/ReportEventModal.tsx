import React from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { EventTypeAutocomplete } from '@components/machine-events/EventTypeAutocomplete';
import type { UseMutationResult } from '@tanstack/react-query';
import type { CreateEventRequest } from '@services/api/machineEventService';

// Validation schema for manual event report
const reportEventSchema = z.object({
  typeId: z.string().min(1, 'Event type is required'),
  title: z
    .string()
    .min(3, 'Title must have at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  metadata: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === '') return undefined;
      try {
        return JSON.parse(val);
      } catch {
        throw new Error('Metadata must be valid JSON');
      }
    }),
});

type ReportEventFormData = z.infer<typeof reportEventSchema>;

interface ReportEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineId: string;
  createEventMutation: UseMutationResult<
    unknown,
    Error,
    CreateEventRequest,
    unknown
  >;
}

/**
 * Modal for reporting manual machine events
 *
 * Features:
 * - Event type selection with autocomplete
 * - Title and description inputs
 * - Optional metadata (JSON)
 * - Form validation with Zod
 * - Loading state during submission
 *
 * @example
 * <ReportEventModal
 *   isOpen={isReportModalOpen}
 *   onClose={handleCloseReportModal}
 *   machineId={machineId}
 *   createEventMutation={mutations.createEvent}
 * />
 */
export const ReportEventModal: React.FC<ReportEventModalProps> = ({
  isOpen,
  onClose,
  machineId,
  createEventMutation,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReportEventFormData>({
    resolver: zodResolver(reportEventSchema),
    defaultValues: {
      typeId: '',
      title: '',
      description: '',
      metadata: '',
    },
  });

  const selectedTypeId = watch('typeId');

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: ReportEventFormData) => {
    try {
      await createEventMutation.mutateAsync({
        typeId: data.typeId,
        title: data.title,
        description: data.description,
        metadata: data.metadata,
      });
      handleClose();
    } catch (error) {
      console.error('Error reporting event:', error);
      // Error is handled by mutation's onError callback in ViewModel
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('machines.events.reportEvent')}
        </h2>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Event Type Autocomplete */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('machines.events.filters.selectType')} *
          </label>
          <EventTypeAutocomplete
            value={selectedTypeId}
            onChange={(typeId: string) => setValue('typeId', typeId)}
            error={errors.typeId?.message}
            placeholder={t('machines.events.filters.search')}
          />
          {errors.typeId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.typeId.message}
            </p>
          )}
        </div>

        {/* Title Input */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {t('machines.events.title')} *
          </label>
          <InputField
            id="title"
            value={watch('title')}
            onChangeText={(text) => setValue('title', text)}
            error={errors.title?.message}
            placeholder={t('machines.events.form.titlePlaceholder')}
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Description Textarea */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {t('common.description')}
          </label>
          <Textarea
            id="description"
            {...register('description')}
            rows={4}
            placeholder={t('machines.events.form.descriptionPlaceholder')}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Metadata JSON Input */}
        <div>
          <label
            htmlFor="metadata"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {t('machines.events.metadata')} (JSON)
          </label>
          <Textarea
            id="metadata"
            {...register('metadata')}
            rows={3}
            placeholder={t('machines.events.form.metadataPlaceholder')}
            disabled={isSubmitting}
          />
          {errors.metadata && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {typeof errors.metadata.message === 'string' ? errors.metadata.message : 'Invalid metadata format'}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('machines.events.form.metadataHint')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            htmlType="button"
            variant="secondary"
            onPress={handleClose}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            htmlType="submit"
            variant="filled"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {t('common.submit')}
          </Button>
        </div>
      </form>

      {/* TODO: Add success toast notification after event creation */}
      {/* TODO: Add option to "Report Another Event" after success */}
    </Modal>
  );
};
