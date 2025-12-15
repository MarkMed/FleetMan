import { DayOfWeek } from '@packages/domain';

/**
 * Labels en español para días de la semana
 * SSOT para UI - Re-usa enum del dominio
 */
export const DAY_OF_WEEK_LABELS_ES: Record<DayOfWeek, string> = {
  [DayOfWeek.SUN]: 'Domingo',
  [DayOfWeek.MON]: 'Lunes',
  [DayOfWeek.TUE]: 'Martes',
  [DayOfWeek.WED]: 'Miércoles',
  [DayOfWeek.THU]: 'Jueves',
  [DayOfWeek.FRI]: 'Viernes',
  [DayOfWeek.SAT]: 'Sábado'
};

/**
 * Labels cortos para botones del selector de días
 */
export const DAY_OF_WEEK_SHORT_LABELS_ES: Record<DayOfWeek, string> = {
  [DayOfWeek.SUN]: 'Do',
  [DayOfWeek.MON]: 'Lu',
  [DayOfWeek.TUE]: 'Ma',
  [DayOfWeek.WED]: 'Mi',
  [DayOfWeek.THU]: 'Ju',
  [DayOfWeek.FRI]: 'Vi',
  [DayOfWeek.SAT]: 'Sá'
};
