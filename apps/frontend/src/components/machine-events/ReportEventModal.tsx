import React from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@store/AuthProvider';

import { Modal } from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { EventTypeSelect } from '@components/machine-events/EventTypeSelect';
import type { UseMutationResult } from '@tanstack/react-query';
import type { EventType } from '@services/api/machineEventService';
import type { CreateMachineEventRequest } from '@packages/contracts';

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
    CreateMachineEventRequest,
    unknown
  >;
  /** Tipos de eventos precargados (desde ViewModel) */
  eventTypes: EventType[];
  /** Loading state de tipos */
  isLoadingEventTypes?: boolean;
  /** Callback para crear nuevo tipo (crowdsourcing) */
  onCreateEventType: (name: string) => Promise<EventType>;
  /** Si está creando un nuevo tipo */
  isCreatingEventType?: boolean;
}

/**
 * Modal for reporting manual machine events
 *
 * Features:
 * - Event type selection con dropdown (sin API calls por keystroke)
 * - Title and description inputs
 * - Optional metadata (JSON)
 * - Form validation with Zod
 * - Loading state during submission
 * - Crowdsourcing: Crear nuevo tipo on-the-fly
 *
 * @example
 * <ReportEventModal
 *   isOpen={isReportModalOpen}
 *   onClose={handleCloseReportModal}
 *   machineId={machineId}
 *   createEventMutation={mutations.createEvent}
 *   eventTypes={data.eventTypes}
 *   isLoadingEventTypes={state.isLoadingEventTypes}
 *   onCreateEventType={actions.handleCreateEventType}
 *   isCreatingEventType={mutations.createEventType.isLoading}
 * />
 */
export const ReportEventModal: React.FC<ReportEventModalProps> = ({
  isOpen,
  onClose,
  machineId,
  createEventMutation,
  eventTypes,
  isLoadingEventTypes = false,
  onCreateEventType,
  isCreatingEventType = false,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
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
    // Solo permitir cerrar si no está creando evento
    if (createEventMutation.isPending) {
      console.log('[ReportEventModal] Cannot close while mutation is pending');
      return;
    }
    reset();
    onClose();
  };

  const onSubmit = async (data: ReportEventFormData) => {
    console.log('[ReportEventModal.onSubmit] Form data received:', data);
    
    // Validate user is authenticated
    if (!user?.id) {
      console.error('[ReportEventModal.onSubmit] ERROR: User not authenticated!');
      return;
    }
    
    // Build payload using CreateMachineEventRequest (SSOT from @packages/contracts)
    // This ensures type-safety and contract compliance with backend API
    const payload: CreateMachineEventRequest = {
      machineId: machineId,
      createdBy: user.id,
      typeId: data.typeId,
      title: data.title,
      description: data.description || '',
      metadata: data.metadata ? { additionalInfo: data.metadata } : undefined,
    };
    
    // TODO: Strategic Improvements for payload construction
    // 1. Validate payload with Zod schema before sending:
    //    - Add: const validatedPayload = CreateMachineEventRequestSchema.parse(payload);
    //    - Benefits: Catch contract violations before API call, better error messages
    //
    // 2. Transform/sanitize data if needed:
    //    - Trim whitespace: title: data.title.trim()
    //    - Remove empty strings: description: data.description?.trim() || ''
    //    - Normalize metadata: Remove null/undefined values from metadata object
    //
    // 3. Add payload versioning for API evolution:
    //    - Add: version: '1.0' field for future backward compatibility
    //    - Backend can handle multiple versions gracefully
    //
    // 4. Include client context (useful for analytics/debugging):
    //    - source: 'web-app' | 'mobile-app'
    //    - userAgent: navigator.userAgent (for support tickets)
    //    - timestamp: new Date().toISOString() (client-side timestamp)
    
    console.log('[ReportEventModal.onSubmit] Payload to send:', payload);
    console.log('[ReportEventModal.onSubmit] Machine ID:', machineId);
    console.log('[ReportEventModal.onSubmit] Created By:', user.id);
    
    // Validate typeId is present (TypeScript already enforces this via CreateMachineEventRequest)
    if (!payload.typeId) {
      console.error('[ReportEventModal.onSubmit] ERROR: typeId is missing!');
      return;
    }
    
    try {
      console.log('[ReportEventModal.onSubmit] Calling createEventMutation.mutateAsync...');
      
      const result = await createEventMutation.mutateAsync(payload);
      
      console.log('[ReportEventModal.onSubmit] Event created successfully:', result);
      console.log('[ReportEventModal.onSubmit] Waiting for queries to refetch...');
      
      // IMPORTANTE: Esperar a que TanStack Query invalide y refetch las queries
      // Esto asegura que la lista se actualice ANTES de cerrar el modal
      // El usuario verá el loading state durante el refetch
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('[ReportEventModal.onSubmit] Refetch completed, closing modal');
      handleClose();
    } catch (error) {
      console.error('[ReportEventModal.onSubmit] Error reporting event:', error);
      // Error is handled by mutation's onError callback in ViewModel
    }
  };

  return (
    <Modal 
      open={isOpen} 
      onOpenChange={(open) => {
        // Prevenir cerrar mientras se está creando evento
        if (!open && !createEventMutation.isPending) {
          handleClose();
        }
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('machines.events.reportEvent')}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Event Type Select (sin API calls por keystroke) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('machines.events.form.eventType')} *
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {t('machines.events.form.eventTypeHint')}
          </p>
          <EventTypeSelect
            value={selectedTypeId}
            onChange={(typeId: string) => setValue('typeId', typeId)}
            error={errors.typeId?.message}
            placeholder={t('machines.events.filters.search')}
            eventTypes={eventTypes}
            isLoadingTypes={isLoadingEventTypes}
            onCreateType={onCreateEventType}
            isCreatingType={isCreatingEventType}
          />
        </div>

        {/* Title Input */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t('machines.events.form.eventTitle')} *
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {t('machines.events.form.eventTitleHint')}
          </p>
          <InputField
            id="title"
            value={watch('title')}
            onChangeText={(text) => setValue('title', text)}
            error={errors.title?.message}
            placeholder={t('machines.events.form.titlePlaceholder')}
            disabled={isSubmitting}
          />
          {/* {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.title.message}
            </p>
          )} */}
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
            value={watch('description')}
            onChangeText={(text) => setValue('description', text)}
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

        {/* TODO: Metadata JSON Input (Advanced Feature)
         * Purpose: Allow users to attach structured data to events
         * Use cases:
         *   - Maintenance events: { partNumber: 'MOT-12345', cost: 5000, supplier: 'ACME Corp' }
         *   - Inspection events: { inspector: 'John Doe', certificationId: 'CERT-2025-001' }
         *   - Repair events: { technicianId: 'TECH-42', hoursWorked: 3.5, warrantyStatus: 'covered' }
         *   - Failure events: { errorCode: 'ERR-404', severity: 'critical', downtime: 120 }
         * Implementation considerations:
         *   - Currently hidden to avoid user confusion
         *   - System events already use metadata internally (see machine-event.entity.ts)
         *   - Consider exposing via:
         *     a) Advanced mode toggle
         *     b) Event type-specific templates with predefined fields
         *     c) Admin-only configuration
         *   - Add JSON schema validation per event type category
         *   - Consider structured form builder instead of raw JSON textarea
         *   - Add autocomplete for common metadata keys based on event type
         */}
        {/* <div>
          <label
            htmlFor="metadata"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {t('machines.events.metadata')} (JSON)
          </label>
          <Textarea
            id="metadata"
            value={watch('metadata')}
            onChangeText={(text) => setValue('metadata', text)}
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
        </div> */}

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
