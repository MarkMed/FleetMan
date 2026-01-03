import React from 'react';
import { useTranslation } from 'react-i18next';
import type { MaintenanceAlarm } from '@contracts';
import { Card, BodyText, Badge } from '@components/ui';
import { AlarmProgressIndicator } from './AlarmProgressIndicator';

interface AlarmCardProps {
  alarm: MaintenanceAlarm;
  /**
   * Current operating hours of the machine
   * Used to calculate progress towards next trigger
   */
  currentOperatingHours: number;
  /**
   * Click handler to open detail view
   */
  onClick?: (alarm: MaintenanceAlarm) => void;
  /**
   * Optional className for custom styling
   */
  className?: string;
}

/**
 * AlarmCard Component
 * 
 * Displays maintenance alarm summary in card format.
 * Shows: title, interval, active status, progress, last triggered info.
 * 
 * Sprint #11: Core component for MaintenanceAlarmsListScreen
 * 
 * @example
 * ```tsx
 * <AlarmCard
 *   alarm={alarm}
 *   currentOperatingHours={machine.specs.operatingHours}
 *   onClick={(alarm) => setSelectedAlarm(alarm)}
 * />
 * ```
 */
export const AlarmCard: React.FC<AlarmCardProps> = ({
  alarm,
  currentOperatingHours,
  onClick,
  className = '',
}) => {
  const { t } = useTranslation();

  // Calculate hours since last trigger
  const hoursSinceLastTrigger = alarm.lastTriggeredHours
    ? currentOperatingHours - alarm.lastTriggeredHours
    : 0;

  // Calculate hours remaining until next trigger
  const hoursRemaining = alarm.intervalHours - hoursSinceLastTrigger;
  const isOverdue = hoursRemaining < 0;
  const isApproaching = hoursRemaining > 0 && hoursRemaining <= alarm.intervalHours * 0.2; // 20% threshold

  return (
    <Card 
      className={`
        p-4 hover:shadow-md transition-shadow cursor-pointer
        ${!alarm.isActive ? 'opacity-60' : ''}
        ${className}
      `}
      onClick={() => onClick?.(alarm)}
    >
      {/* Header: Title only (minimalist) */}
      <div className="mb-3">
        <BodyText weight="medium" className="text-foreground mb-1">
          {alarm.title}
        </BodyText>
        {alarm.description && (
          <BodyText size="small" className="text-muted-foreground line-clamp-2">
            {alarm.description}
          </BodyText>
        )}
      </div>

      {/* Progress Indicator - Core visual element */}
      <div className="mb-3">
        <AlarmProgressIndicator
          currentHours={hoursSinceLastTrigger}
          intervalHours={alarm.intervalHours}
          isOverdue={isOverdue}
        />
      </div>

      {/* Related Parts (if any) */}
      {alarm.relatedParts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <BodyText size="small" className="text-muted-foreground mb-1">
            {t('maintenance.alarms.relatedParts')}:
          </BodyText>
          <div className="flex flex-wrap gap-1">
            {alarm.relatedParts.slice(0, 3).map((part, index) => (
              <Badge key={index} variant="outline" size="sm">
                {part}
              </Badge>
            ))}
            {alarm.relatedParts.length > 3 && (
              <Badge variant="outline" size="sm">
                +{alarm.relatedParts.length - 3}
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

// ============================================
// POST-MVP: Enhanced Features (Commented)
// ============================================

/**
 * Elements removed for minimalism (moved to AlarmDetailModal):
 * 
 * 1. Wrench icon - Potential UX confusion (looks clickable)
 * 2. Status Badge - Redundant with opacity + available in modal
 * 3. Stats Grid - Secondary info (interval, times triggered)
 * 4. Warning/Success Messages - Redundant with progress bar colors
 * 
 * Preserved elements (core functionality):
 * - Title + Description (primary identification)
 * - AlarmProgressIndicator (gigachad visual - color-coded status)
 * - Related Parts (actionable info for maintenance)
 * - Opacity 60% for inactive alarms (subtle visual cue)
 * 
 * Restore via AlarmDetailModal on card click (progressive disclosure)
 */

/**
 * AlarmCard with drag-and-drop support
 * Allows reordering alarms by priority
 * 
 * Integration: React DnD or dnd-kit
 * Props: onDragStart, onDragEnd, isDragging
 */
// export const DraggableAlarmCard: React.FC<AlarmCardProps & DraggableProps> = ({ ... }) => { }

/**
 * AlarmCard with inline actions
 * Quick toggle active/inactive without opening modal
 * 
 * Props: onToggle, onEdit, onDelete actions
 * UI: Action buttons appear on hover (Edit, Toggle, Delete icons)
 */
// export const AlarmCardWithActions: React.FC<AlarmCardProps & ActionProps> = ({ ... }) => { }

/**
 * Compact AlarmCard variant
 * For dashboard widgets or mobile view
 * 
 * Shows only: title, progress bar, status dot (no description/parts)
 * Height: ~100px vs ~200px current
 */
// export const CompactAlarmCard: React.FC<AlarmCardProps> = ({ ... }) => { }

/**
 * AlarmDetailModal - Progressive Disclosure Pattern
 * 
 * Shows all metadata removed from card for clean UI:
 * - Status badge with toggle action
 * - Stats: Interval (500h), Times triggered (3x), Last triggered (Dec 28)
 * - Warning/approaching messages with icons
 * - Full related parts list (no truncation at 3 items)
 * - Action buttons: Edit, Activate/Deactivate, Delete
 * - Future: Trigger history timeline
 * 
 * Props:
 * - alarm: MaintenanceAlarm
 * - currentOperatingHours: number
 * - onEdit: (alarm) => void
 * - onToggleStatus: (alarmId, isActive) => void
 * - onDelete: (alarmId) => void
 * 
 * Trigger: onClick from AlarmCard
 */
// export const AlarmDetailModal: React.FC<AlarmDetailModalProps> = ({ ... }) => { }
// export const CompactAlarmCard: React.FC<AlarmCardProps> = ({ ... }) => { }
