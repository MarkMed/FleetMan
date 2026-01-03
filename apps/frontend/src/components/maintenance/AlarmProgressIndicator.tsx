import React from 'react';
import { useTranslation } from 'react-i18next';
import { BodyText } from '@components/ui';

interface AlarmProgressIndicatorProps {
  /**
   * Current hours accumulated since last trigger
   */
  currentHours: number;
  /**
   * Target interval hours to reach
   */
  intervalHours: number;
  /**
   * Whether alarm is overdue (currentHours > intervalHours)
   */
  isOverdue?: boolean;
  /**
   * Optional className for custom styling
   */
  className?: string;
}

/**
 * AlarmProgressIndicator Component
 * 
 * Visual progress bar showing how close an alarm is to triggering.
 * Color-coded based on proximity:
 * - Green: < 50% (safe)
 * - Yellow: 50-80% (approaching)
 * - Orange: 80-100% (warning)
 * - Red: > 100% (overdue)
 * 
 * Sprint #11: Core component for alarm visualization
 * 
 * Calculation: progress = (currentHours / intervalHours) * 100
 * 
 * @example
 * ```tsx
 * <AlarmProgressIndicator
 *   currentHours={450}
 *   intervalHours={500}
 *   isOverdue={false}
 * />
 * // Shows: 90% progress (orange warning color)
 * ```
 */
export const AlarmProgressIndicator: React.FC<AlarmProgressIndicatorProps> = ({
  currentHours,
  intervalHours,
  isOverdue = false,
  className = '',
}) => {
  const { t } = useTranslation();

  // Calculate percentage (capped at 100% for visual bar)
  const percentage = Math.min((currentHours / intervalHours) * 100, 100);
  const percentageForDisplay = (currentHours / intervalHours) * 100; // Can exceed 100%

  // Determine color based on percentage
  let colorClass = 'bg-success'; // Green (< 50%)
  if (isOverdue) {
    colorClass = 'bg-destructive'; // Red (overdue)
  } else if (percentage >= 80) {
    colorClass = 'bg-warning'; // Orange (80-100%)
  } else if (percentage >= 50) {
    colorClass = 'bg-yellow-500'; // Yellow (50-80%)
  }

  return (
    <div className={className}>
      {/* Label + Hours Display */}
      <div className="flex items-center justify-between mb-1">
        <BodyText size="small" className="text-muted-foreground">
          {t('maintenance.alarms.progress.label')}
        </BodyText>
        <BodyText 
          size="small" 
          weight="medium"
          className={isOverdue ? 'text-destructive' : 'text-foreground'}
        >
          {t('maintenance.alarms.progress.hours', {
            current: currentHours,
            target: intervalHours,
          })}
        </BodyText>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentageForDisplay}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Percentage Text */}
      <div className="flex items-center justify-between mt-1">
        <BodyText size="small" className="text-muted-foreground">
          {percentageForDisplay.toFixed(1)}%
        </BodyText>
        {!isOverdue && (
          <BodyText size="small" className="text-muted-foreground">
            {t('maintenance.alarms.progress.remaining', { 
              hours: Math.max(intervalHours - currentHours, 0) 
            })}
          </BodyText>
        )}
      </div>
    </div>
  );
};

// ============================================
// POST-MVP: Enhanced Variants (Commented)
// ============================================

/**
 * Circular Progress Indicator
 * More compact visual for dashboard widgets
 * 
 * Uses SVG circle with stroke-dasharray animation
 */
// export const CircularAlarmProgress: React.FC<AlarmProgressIndicatorProps> = ({ ... }) => { }

/**
 * Animated Progress Bar
 * With smooth transitions and pulse effect when approaching trigger
 * 
 * Uses Framer Motion for animations
 */
// export const AnimatedAlarmProgress: React.FC<AlarmProgressIndicatorProps> = ({ ... }) => { }

/**
 * Progress with Historical Data
 * Shows trend line of previous triggers
 * 
 * Props: historicalTriggers (array of { triggeredAt, hoursAtTrigger })
 * Displays mini chart below progress bar
 */
// export const AlarmProgressWithHistory: React.FC<AlarmProgressIndicatorProps & HistoryProps> = ({ ... }) => { }

/**
 * Progress with Predictive Alert
 * Estimates when alarm will trigger based on average daily hours
 * 
 * Props: averageDailyHours (number)
 * Shows: "Estimated trigger in X days"
 */
// export const PredictiveAlarmProgress: React.FC<AlarmProgressIndicatorProps & PredictiveProps> = ({ ... }) => { }
