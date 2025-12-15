/**
 * Days of the Week Enum
 * Used for UsageSchedule to define operating days
 */
export enum DayOfWeek {
  SUN = 'SUN',
  MON = 'MON',
  TUE = 'TUE',
  WED = 'WED',
  THU = 'THU',
  FRI = 'FRI',
  SAT = 'SAT'
}

/**
 * Helper map for day labels
 */
export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.SUN]: 'Sunday',
  [DayOfWeek.MON]: 'Monday',
  [DayOfWeek.TUE]: 'Tuesday',
  [DayOfWeek.WED]: 'Wednesday',
  [DayOfWeek.THU]: 'Thursday',
  [DayOfWeek.FRI]: 'Friday',
  [DayOfWeek.SAT]: 'Saturday'
};

/**
 * Helper map for short day labels
 */
export const DAY_OF_WEEK_SHORT_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.SUN]: 'Su',
  [DayOfWeek.MON]: 'Mo',
  [DayOfWeek.TUE]: 'Tu',
  [DayOfWeek.WED]: 'We',
  [DayOfWeek.THU]: 'Th',
  [DayOfWeek.FRI]: 'Fr',
  [DayOfWeek.SAT]: 'Sa'
};
