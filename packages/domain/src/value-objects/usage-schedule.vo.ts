import { DayOfWeek } from '../enums/DayOfWeek';
import { Result, ok, err, DomainError } from '../errors';

/**
 * UsageSchedule Value Object
 * 
 * Representa la programación de uso de una máquina:
 * - Cuántas horas por día opera
 * - Qué días de la semana opera
 * 
 * Este VO es crítico para:
 * 1. Cálculo preciso de alertas de mantenimiento basadas en HORAS REALES de uso
 * 2. Cronjobs que acumulan horas solo en días operativos
 * 3. Predicción de fecha de mantenimiento
 * 
 * @example
 * ```typescript
 * const schedule = UsageSchedule.create(12, [DayOfWeek.MON, DayOfWeek.TUE, DayOfWeek.WED, DayOfWeek.THU]);
 * // → 12hs/día × 4 días = 48hs/semana
 * 
 * if (schedule.success) {
 *   const weeklyHours = schedule.data.weeklyHours; // 48
 *   const shouldAccumulate = schedule.data.shouldAccumulateHoursToday(); // true si hoy es lun-jue
 * }
 * ```
 */
export class UsageSchedule {
  private constructor(
    private readonly _dailyHours: number,
    private readonly _operatingDays: readonly DayOfWeek[]
  ) {}

  /**
   * Factory method para crear UsageSchedule con validaciones
   */
  public static create(
    dailyHours: number,
    operatingDays: readonly DayOfWeek[] // Acepta readonly (del schema Zod)
  ): Result<UsageSchedule, DomainError> {
    // Validación 1: dailyHours debe estar entre 1 y 24
    if (dailyHours < 1 || dailyHours > 24) {
      return err(DomainError.validation('Daily hours must be between 1 and 24'));
    }

    // Validación 2: Al menos un día de operación
    if (!operatingDays || operatingDays.length === 0) {
      return err(DomainError.validation('Must have at least one operating day'));
    }

    // Validación 3: Máximo 7 días (toda la semana)
    if (operatingDays.length > 7) {
      return err(DomainError.validation('Cannot have more than 7 operating days'));
    }

    // Validación 4: No duplicados
    const uniqueDays = new Set(operatingDays);
    if (uniqueDays.size !== operatingDays.length) {
      return err(DomainError.validation('Duplicate operating days are not allowed'));
    }

    // Validación 5: Valores válidos del enum
    const validDays = Object.values(DayOfWeek);
    const invalidDays = operatingDays.filter(day => !validDays.includes(day));
    if (invalidDays.length > 0) {
      return err(DomainError.validation(`Invalid day(s): ${invalidDays.join(', ')}`));
    }

    return ok(new UsageSchedule(dailyHours, [...operatingDays]));
  }

  // =============================================================================
  // Getters
  // =============================================================================

  get dailyHours(): number {
    return this._dailyHours;
  }

  get operatingDays(): readonly DayOfWeek[] {
    return this._operatingDays;
  }

  /**
   * Calcula horas semanales de operación
   * @returns dailyHours × cantidad de días operativos
   */
  get weeklyHours(): number {
    return this._dailyHours * this._operatingDays.length;
  }

  /**
   * Cantidad de días por semana que opera
   */
  get daysPerWeek(): number {
    return this._operatingDays.length;
  }

  // =============================================================================
  // Métodos de negocio
  // =============================================================================

  /**
   * Verifica si la máquina opera en un día específico
   * @param day - Día a verificar
   * @returns true si el día está en operatingDays
   */
  public isOperatingDay(day: DayOfWeek): boolean {
    return this._operatingDays.includes(day);
  }

  /**
   * Verifica si la máquina debería acumular horas HOY
   * Útil para cronjobs diarios que acumulan horas de uso
   * 
   * @returns true si hoy es un día operativo
   * 
   * @example
   * ```typescript
   * // Cronjob diario a las 00:00
   * if (machine.usageSchedule.shouldAccumulateHoursToday()) {
   *   await machine.addOperatingHours(machine.usageSchedule.dailyHours);
   * }
   * ```
   */
  public shouldAccumulateHoursToday(): boolean {
    const today = new Date().getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    const dayMap: DayOfWeek[] = [
      DayOfWeek.SUN, 
      DayOfWeek.MON, 
      DayOfWeek.TUE,
      DayOfWeek.WED, 
      DayOfWeek.THU, 
      DayOfWeek.FRI, 
      DayOfWeek.SAT
    ];
    return this.isOperatingDay(dayMap[today]);
  }

  /**
   * Calcula cuántas semanas tomará acumular X horas
   * Útil para estimar fecha de próximo mantenimiento
   * 
   * @param targetHours - Horas objetivo a alcanzar
   * @param currentHours - Horas actuales acumuladas
   * @returns Cantidad de semanas necesarias (redondeado hacia arriba)
   * 
   * @example
   * ```typescript
   * const schedule = UsageSchedule.create(8, [DayOfWeek.MON, DayOfWeek.TUE, DayOfWeek.WED, DayOfWeek.THU, DayOfWeek.FRI]);
   * // 8hs/día × 5 días = 40hs/semana
   * 
   * const weeksToMaintenance = schedule.data.weeksToReachHours(500, 100);
   * // (500 - 100) / 40 = 10 semanas
   * ```
   */
  public weeksToReachHours(targetHours: number, currentHours: number = 0): number {
    if (targetHours <= currentHours) {
      return 0; // Ya alcanzado
    }

    const hoursRemaining = targetHours - currentHours;
    return Math.ceil(hoursRemaining / this.weeklyHours);
  }

  /**
   * Estima fecha en que se alcanzarán X horas
   * 
   * @param targetHours - Horas objetivo
   * @param currentHours - Horas actuales
   * @returns Fecha estimada (aproximada, asume distribución uniforme de semanas)
   */
  public estimateDateForHours(targetHours: number, currentHours: number = 0): Date {
    const weeksNeeded = this.weeksToReachHours(targetHours, currentHours);
    
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + (weeksNeeded * 7));
    
    return estimatedDate;
  }

  // =============================================================================
  // Métodos de comparación
  // =============================================================================

  /**
   * Compara dos UsageSchedule por igualdad
   */
  public equals(other: UsageSchedule): boolean {
    if (this._dailyHours !== other._dailyHours) {
      return false;
    }

    if (this._operatingDays.length !== other._operatingDays.length) {
      return false;
    }

    // Comparar días (orden no importa)
    const thisSet = new Set(this._operatingDays);
    const otherSet = new Set(other._operatingDays);
    
    for (const day of thisSet) {
      if (!otherSet.has(day)) {
        return false;
      }
    }

    return true;
  }

  // =============================================================================
  // Serialización
  // =============================================================================

  /**
   * Convierte a objeto plano para persistencia/serialización
   */
  public toPlainObject(): {
    dailyHours: number;
    operatingDays: DayOfWeek[];
  } {
    return {
      dailyHours: this._dailyHours,
      operatingDays: [...this._operatingDays]
    };
  }

  /**
   * Crea UsageSchedule desde objeto plano
   */
  public static fromPlainObject(obj: {
    dailyHours: number;
    operatingDays: DayOfWeek[];
  }): Result<UsageSchedule, DomainError> {
    return UsageSchedule.create(obj.dailyHours, obj.operatingDays);
  }

  // =============================================================================
  // TODO POST-MVP: Métodos estratégicos futuros
  // =============================================================================

  /**
   * TODO POST-MVP: Validar contra festivos/excepciones
   * Permitiría definir días específicos donde NO se opera (festivos nacionales, mantenimiento programado, etc.)
   * 
   * @param date - Fecha a validar
   * @param holidays - Array de fechas festivas
   * @returns true si debería acumular horas (no es festivo)
   */
  // public shouldAccumulateOnDate(date: Date, holidays: Date[] = []): boolean {
  //   const dayOfWeek = this.getDayOfWeekFromDate(date);
  //   if (!this.isOperatingDay(dayOfWeek)) return false;
  //
  //   // Verificar si es festivo
  //   const isHoliday = holidays.some(holiday => 
  //     holiday.toDateString() === date.toDateString()
  //   );
  //
  //   return !isHoliday;
  // }

  /**
   * TODO POST-MVP: Soporte para múltiples turnos
   * Algunas máquinas operan en turnos (mañana 8hs, tarde 6hs, noche 4hs)
   * 
   * interface Shift {
   *   name: string;
   *   startHour: number; // 0-23
   *   durationHours: number;
   *   operatingDays: DayOfWeek[];
   * }
   * 
   * class MultiShiftUsageSchedule extends UsageSchedule {
   *   constructor(private shifts: Shift[]) { ... }
   *   
   *   get weeklyHours(): number {
   *     return this.shifts.reduce((total, shift) => {
   *       return total + (shift.durationHours * shift.operatingDays.length);
   *     }, 0);
   *   }
   * }
   */

  /**
   * TODO POST-MVP: Ajuste estacional
   * Algunas industrias tienen temporadas altas/bajas (construcción, agricultura)
   * Podría ajustar dailyHours según mes del año
   * 
   * interface SeasonalAdjustment {
   *   startMonth: number; // 1-12
   *   endMonth: number;
   *   multiplier: number; // 0.5 = 50% de uso, 1.5 = 150% de uso
   * }
   */
}
