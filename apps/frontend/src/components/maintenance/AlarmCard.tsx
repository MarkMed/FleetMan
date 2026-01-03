import React from 'react';
import { useTranslation } from 'react-i18next';
import type { MaintenanceAlarm } from '@contracts';
import { Card, BodyText, Badge } from '@components/ui';
import { Clock, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
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
      {/* Header: Title + Status Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-5 h-5 text-primary" />
            <BodyText weight="medium" className="text-foreground">
              {alarm.title}
            </BodyText>
          </div>
          {alarm.description && (
            <BodyText size="small" className="text-muted-foreground line-clamp-2">
              {alarm.description}
            </BodyText>
          )}
        </div>

        {/* Status Badge */}
        <Badge variant={alarm.isActive ? 'success' : 'secondary'}>
          {alarm.isActive ? t('maintenance.isActive') : t('common.inactive')}
        </Badge>
      </div>

      {/* Progress Indicator */}
      <div className="mb-3">
        <AlarmProgressIndicator
          currentHours={hoursSinceLastTrigger}
          intervalHours={alarm.intervalHours}
          isOverdue={isOverdue}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
        {/* Interval */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <div>
            <BodyText size="small" className="text-muted-foreground">
              {t('maintenance.alarms.intervalHoursLabel')}
            </BodyText>
            <BodyText size="small" weight="medium">
              {alarm.intervalHours}h
            </BodyText>
          </div>
        </div>

        {/* Times Triggered */}
        <div className="flex items-center gap-2">
          {isOverdue ? (
            <AlertTriangle className="w-4 h-4 text-destructive" />
          ) : (
            <CheckCircle className="w-4 h-4 text-success" />
          )}
          <div>
            <BodyText size="small" className="text-muted-foreground">
              {t('maintenance.alarms.timesTriggered')}
            </BodyText>
            <BodyText size="small" weight="medium">
              {alarm.timesTriggered}
            </BodyText>
          </div>
        </div>
      </div>

      {/* Warning/Success Message */}
      {isOverdue && (
        <div className="mt-3 flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
          <BodyText size="small" className="text-destructive">
            {t('maintenance.alarms.progress.overdue', { hours: Math.abs(hoursRemaining) })}
          </BodyText>
        </div>
      )}
      {isApproaching && !isOverdue && (
        <div className="mt-3 flex items-center gap-2 p-2 bg-warning/10 rounded-md">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
          <BodyText size="small" className="text-warning">
            {t('maintenance.alarms.progress.approaching')}
          </BodyText>
        </div>
      )}

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
 * AlarmCard with drag-and-drop support
 * Allows reordering alarms by priority
 * 
 * Integration: React DnD or dnd-kit
 */
// export const DraggableAlarmCard: React.FC<AlarmCardProps & DraggableProps> = ({ ... }) => { }

/**
 * AlarmCard with inline actions
 * Quick toggle active/inactive without opening modal
 * 
 * Props: onToggle, onEdit, onDelete actions
 */
// export const AlarmCardWithActions: React.FC<AlarmCardProps & ActionProps> = ({ ... }) => { }

/**
 * Compact AlarmCard variant
 * For dashboard widgets or mobile view
 * 
 * Shows only: title, interval, status, progress bar (no description/parts)
 */
// export const CompactAlarmCard: React.FC<AlarmCardProps> = ({ ... }) => { }
