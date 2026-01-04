import React from 'react';
import { useTranslation } from 'react-i18next';
import type { MaintenanceAlarm } from '@contracts';
import { Modal, BodyText, Badge, Button } from '@components/ui';
import { AlarmProgressIndicator } from './AlarmProgressIndicator';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface AlarmDetailModalProps {
  /**
   * Controls modal visibility (Radix UI pattern)
   */
  open: boolean;
  /**
   * Handler called when modal state changes
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Alarm data to display (null when closed)
   */
  alarm: MaintenanceAlarm | null;
  /**
   * Current operating hours of the machine
   * Used to calculate progress and warnings
   */
  currentOperatingHours: number;
  /**
   * Machine ID for context (used in edit handler)
   */
  machineId: string | undefined;
  /**
   * Handler called when user clicks Edit button
   */
  onEdit: (alarm: MaintenanceAlarm) => void;
  
  // POST-MVP: Additional handlers for future features
  // onToggleStatus?: (alarm: MaintenanceAlarm) => void;
  // onDelete?: (alarm: MaintenanceAlarm) => void;
}

/**
 * AlarmDetailModal Component
 * 
 * Progressive disclosure modal showing full alarm metadata that was removed
 * from AlarmCard for minimalist design. Displays:
 * - Full description (no line-clamp)
 * - Status badge (Active/Inactive)
 * - Progress indicator
 * - Stats grid (interval, times triggered, last triggered)
 * - Warning/Success messages
 * - Full related parts list (no truncation)
 * - Edit action button
 * 
 * Sprint #11 Refinement: Minimalist UI Pattern
 * Follows "Focus on Value, Not Edge Cases" philosophy
 * 
 * @example
 * ```tsx
 * <AlarmDetailModal
 *   open={!!selectedAlarm}
 *   onOpenChange={(open) => !open && setSelectedAlarm(null)}
 *   alarm={selectedAlarm}
 *   currentOperatingHours={machine.specs.operatingHours}
 *   machineId={machineId}
 *   onEdit={handleEditAlarm}
 * />
 * ```
 */
export const AlarmDetailModal: React.FC<AlarmDetailModalProps> = ({
  open,
  onOpenChange,
  alarm,
  currentOperatingHours,
  machineId,
  onEdit,
}) => {
  const { t } = useTranslation();

  // Guard: Don't render content if no alarm
  if (!alarm) return null;

  // ========================
  // CALCULATIONS
  // ========================

  // Calculate hours since last trigger
  // For never-triggered alarms, use full currentOperatingHours as baseline
  const hoursSinceLastTrigger = alarm.lastTriggeredHours !== null && alarm.lastTriggeredHours !== undefined
    ? currentOperatingHours - alarm.lastTriggeredHours
    : currentOperatingHours;

  // Calculate hours remaining until next trigger
  const hoursRemaining = alarm.intervalHours - hoursSinceLastTrigger;
  const isOverdue = hoursRemaining < 0;
  const isApproaching = hoursRemaining > 0 && hoursRemaining <= alarm.intervalHours * 0.2; // 20% threshold

  // Format last triggered date
  const lastTriggeredDate = alarm.lastTriggeredAt
    ? new Date(alarm.lastTriggeredAt).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : t('maintenance.alarms.neverTriggered');

  // ========================
  // HANDLERS
  // ========================

  const handleEdit = () => {
    onEdit(alarm);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  // ========================
  // RENDER
  // ========================

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={alarm.title}
      showCloseButton
    >
      <div className="space-y-6">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <BodyText size="small" className="text-muted-foreground">
            {t('maintenance.alarms.status')}:
          </BodyText>
          <Badge variant={alarm.isActive ? 'success' : 'secondary'}>
            {alarm.isActive
              ? t('maintenance.alarms.active')
              : t('maintenance.alarms.inactive')}
          </Badge>
        </div>

        {/* Full Description */}
        {alarm.description && (
          <div>
            <BodyText weight="medium" className="mb-2">
              {t('maintenance.alarms.description')}
            </BodyText>
            <BodyText className="text-muted-foreground">
              {alarm.description}
            </BodyText>
          </div>
        )}

        {/* Progress Indicator */}
        <div>
          <BodyText weight="medium" className="mb-3">
            {t('maintenance.alarms.progress')}
          </BodyText>
          <AlarmProgressIndicator
            currentHours={hoursSinceLastTrigger}
            intervalHours={alarm.intervalHours}
            isOverdue={isOverdue}
          />
        </div>

        {/* Warning/Success Messages */}
        {isOverdue && (
          <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <BodyText weight="medium" className="text-destructive">
                {t('maintenance.alarms.overdue')}
              </BodyText>
              <BodyText size="small" className="text-destructive/80">
                {t('maintenance.alarms.overdueDescription')}
              </BodyText>
            </div>
          </div>
        )}

        {isApproaching && !isOverdue && (
          <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <BodyText weight="medium" className="text-warning">
                {t('maintenance.alarms.approaching')}
              </BodyText>
              <BodyText size="small" className="text-warning/80">
                {t('maintenance.alarms.approachingDescription')}
              </BodyText>
            </div>
          </div>
        )}

        {!isOverdue && !isApproaching && (
          <div className="flex items-start gap-3 p-3 bg-success/10 border border-success/20 rounded-lg">
            <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <BodyText weight="medium" className="text-success">
                {t('maintenance.alarms.onTrack')}
              </BodyText>
              <BodyText size="small" className="text-success/80">
                {t('maintenance.alarms.onTrackDescription')}
              </BodyText>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div>
          <BodyText weight="medium" className="mb-3">
            {t('maintenance.alarms.statistics')}
          </BodyText>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Interval */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <BodyText size="small" className="text-muted-foreground">
                  {t('maintenance.alarms.interval')}
                </BodyText>
              </div>
              <BodyText weight="medium">
                {alarm.intervalHours}h
              </BodyText>
            </div>

            {/* Times Triggered */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <BodyText size="small" className="text-muted-foreground mb-1">
                {t('maintenance.alarms.timesTriggered')}
              </BodyText>
              <BodyText weight="medium">
                {alarm.timesTriggered || 0}x
              </BodyText>
            </div>

            {/* Last Triggered */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <BodyText size="small" className="text-muted-foreground mb-1">
                {t('maintenance.alarms.lastTriggered')}
              </BodyText>
              <BodyText weight="medium">
                {lastTriggeredDate}
              </BodyText>
            </div>
          </div>
        </div>

        {/* Related Parts - Full List */}
        {alarm.relatedParts.length > 0 && (
          <div>
            <BodyText weight="medium" className="mb-3">
              {t('maintenance.alarms.relatedParts')} ({alarm.relatedParts.length})
            </BodyText>
            <div className="flex flex-wrap gap-2">
              {alarm.relatedParts.map((part, index) => (
                <Badge key={index} variant="outline">
                  {part}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onPress={handleClose}>
            {t('common.close')}
          </Button>
          <Button variant="filled" onPress={handleEdit}>
            {t('common.edit')}
          </Button>
          
          {/* POST-MVP: Additional actions
           * Activate/Deactivate toggle for quick status changes
           * Delete button with confirmation dialog
           * 
           * <Button 
           *   variant="outline" 
           *   onPress={() => onToggleStatus?.(alarm)}
           * >
           *   {alarm.isActive 
           *     ? t('maintenance.alarms.deactivate') 
           *     : t('maintenance.alarms.activate')}
           * </Button>
           * 
           * <Button 
           *   variant="destructive" 
           *   onPress={() => onDelete?.(alarm)}
           * >
           *   {t('common.delete')}
           * </Button>
           */}
        </div>
      </div>
    </Modal>
  );
};
