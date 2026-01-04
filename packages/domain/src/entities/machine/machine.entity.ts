import { Result, ok, err, DomainError, DomainErrorCodes } from '../../errors';
import { MachineId } from '../../value-objects/machine-id.vo';
import { MachineTypeId } from '../../value-objects/machine-type-id.vo';
import { SerialNumber } from '../../value-objects/serial-number.vo';
import { UserId } from '../../value-objects/user-id.vo';
import { UsageSchedule } from '../../value-objects/usage-schedule.vo';
import { 
  MachineStatus, 
  MachineStatusRegistry, 
  MachineStatuses,
  MachineStatusCode 
} from './machineStatus';
import { 
  IMachine, 
  IQuickCheckRecord,
  IMachineEvent,
  IMaintenanceAlarm,
  IUsageSchedule
} from '../../models/interfaces';
// FuelType imported from models/index.ts (SSOT)
import type { FuelType } from '../../models';

/**
 * Especificaciones técnicas de la máquina (interna - mutable)
 */
export interface MachineSpecs {
  enginePower?: number;
  maxCapacity?: number;
  fuelType?: FuelType; // Using FuelType from SSOT in models/index.ts
  year?: number;
  weight?: number;
  operatingHours?: number;
}

/**
 * Información de ubicación de la máquina (interna - mutable)
 */
export interface MachineLocation {
  siteName?: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  lastUpdated: Date;
}

/**
 * Propiedades para crear una máquina
 */
export interface CreateMachineProps {
  serialNumber: string;
  brand: string;
  modelName: string;
  machineTypeId: string; // Se recibe como string y se valida internamente
  ownerId: string; // UserId string
  createdById: string; // UserId string
  specs?: MachineSpecs;
  location?: MachineLocation;
  nickname?: string; // Nombre amigable para la máquina
  initialStatus?: MachineStatusCode;
  assignedTo?: string; // [NUEVO] Persona asignada (temporal string)
  usageSchedule?: UsageSchedule; // [NUEVO] Programación de uso
  machinePhotoUrl?: string; // [NUEVO] URL de foto
}

/**
 * Propiedades internas de la máquina
 */
interface MachineProps {
  id: MachineId;
  serialNumber: SerialNumber;
  brand: string;
  modelName: string;
  machineTypeId: MachineTypeId;
  nickname?: string;
  status: MachineStatus; // Ahora usa la clase MachineStatus
  ownerId: UserId;
  createdById: UserId;
  assignedProviderId?: UserId;
  providerAssignedAt?: Date;
  assignedTo?: string; // [NUEVO] Persona asignada
  usageSchedule?: UsageSchedule; // [NUEVO] Programación de uso
  machinePhotoUrl?: string; // [NUEVO] URL de foto
  specs?: MachineSpecs;
  location?: MachineLocation;
  quickChecks: IQuickCheckRecord[]; // Historial de inspecciones (mutable)
  eventsHistory: IMachineEvent[]; // 🆕 Sprint #10: Historial de eventos (mutable)
  maintenanceAlarms: IMaintenanceAlarm[]; // 🆕 Sprint #11: Alarmas de mantenimiento (mutable)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Machine - Entidad que representa un equipo/activo físico siendo gestionado
 * Es la entidad central del sistema FleetMan
 */
export class Machine {
  private constructor(private props: MachineProps) {}

  /**
   * Convierte la entidad a su representación de interfaz pública
   * Para uso en frontend y contratos
   */
  public toPublicInterface(): IMachine {
    return {
      id: this.props.id.getValue(),
      serialNumber: this.props.serialNumber.getValue(),
      brand: this.props.brand,
      modelName: this.props.modelName,
      nickname: this.props.nickname,
      machineTypeId: this.props.machineTypeId.getValue(),
      ownerId: this.props.ownerId.getValue(),
      createdById: this.props.createdById.getValue(),
      assignedProviderId: this.props.assignedProviderId?.getValue(),
      providerAssignedAt: this.props.providerAssignedAt,
      assignedTo: this.props.assignedTo,
      usageSchedule: this.props.usageSchedule ? {
        dailyHours: this.props.usageSchedule.dailyHours,
        operatingDays: this.props.usageSchedule.operatingDays,
        weeklyHours: this.props.usageSchedule.weeklyHours
      } : undefined,
      machinePhotoUrl: this.props.machinePhotoUrl,
      status: {
        code: this.props.status.code as 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED',
        displayName: this.props.status.displayName,
        description: this.props.status.description,
        color: this.props.status.color,
        isOperational: this.props.status.isOperational
      },
      specs: this.props.specs ? {
        enginePower: this.props.specs.enginePower,
        maxCapacity: this.props.specs.maxCapacity,
        fuelType: this.props.specs.fuelType,
        year: this.props.specs.year,
        weight: this.props.specs.weight,
        operatingHours: this.props.specs.operatingHours
      } : undefined,
      location: this.props.location ? {
        siteName: this.props.location.siteName,
        address: this.props.location.address,
        coordinates: this.props.location.coordinates,
        lastUpdated: this.props.location.lastUpdated
      } : undefined,
      quickChecks: this.props.quickChecks, // Real quickcheck history
      eventsHistory: this.props.eventsHistory, // 🆕 Sprint #10: Real events history
      maintenanceAlarms: this.props.maintenanceAlarms, // 🆕 Sprint #11: Real maintenance alarms
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt
    };
  }

  /**
   * Crea una nueva máquina con validaciones de dominio
   * @param createProps - Propiedades para crear la máquina
   * @returns Result con Machine válida o error de dominio
   */
  public static create(createProps: CreateMachineProps): Result<Machine, DomainError> {
    // Validar número de serie
    const serialNumberResult = SerialNumber.create(createProps.serialNumber);
    if (!serialNumberResult.success) {
      return err(serialNumberResult.error);
    }

    // Validar machine type ID
    const machineTypeIdResult = MachineTypeId.create(createProps.machineTypeId);
    if (!machineTypeIdResult.success) {
      return err(machineTypeIdResult.error);
    }

    // Validar owner ID
    const ownerIdResult = UserId.create(createProps.ownerId);
    if (!ownerIdResult.success) {
      return err(ownerIdResult.error);
    }

    // Validar creator ID
    const creatorIdResult = UserId.create(createProps.createdById);
    if (!creatorIdResult.success) {
      return err(creatorIdResult.error);
    }

    // Validar propiedades básicas
    const basicValidation = Machine.validateBasicProps(createProps);
    if (!basicValidation.success) {
      return err(basicValidation.error);
    }

    // Validar specs si están presentes
    if (createProps.specs) {
      const specsValidation = Machine.validateSpecs(createProps.specs);
      if (!specsValidation.success) {
        return err(specsValidation.error);
      }
    }

    // Validar ubicación si está presente
    if (createProps.location) {
      const locationValidation = Machine.validateLocation(createProps.location);
      if (!locationValidation.success) {
        return err(locationValidation.error);
      }
    }

    const now = new Date();

    // Determinar estado inicial
    const initialStatus = createProps.initialStatus 
      ? MachineStatusRegistry.getByCode(createProps.initialStatus)
      : MachineStatuses.Active();

    if (!initialStatus) {
      return err(DomainError.validation(`Invalid initial status: ${createProps.initialStatus}`));
    }

    const props: MachineProps = {
      id: MachineId.generate(),
      serialNumber: serialNumberResult.data,
      brand: createProps.brand.trim(),
      modelName: createProps.modelName.trim(),
      machineTypeId: machineTypeIdResult.data,
      nickname: createProps.nickname?.trim(),
      status: initialStatus,
      ownerId: ownerIdResult.data,
      createdById: creatorIdResult.data,
      assignedTo: createProps.assignedTo === undefined ? undefined : createProps.assignedTo.trim(), // Nuevo campo
      usageSchedule: createProps.usageSchedule, // Nuevo campo
      machinePhotoUrl: createProps.machinePhotoUrl === undefined ? undefined : createProps.machinePhotoUrl.trim(), // Nuevo campo
      specs: createProps.specs,
      location: createProps.location,
      quickChecks: [], // Initialize empty history
      eventsHistory: [], // 🆕 Sprint #10: Initialize empty events
      maintenanceAlarms: [], // 🆕 Sprint #11: Initialize empty alarms
      createdAt: now,
      updatedAt: now,
    };

    return ok(new Machine(props));
  }

  /**
   * Valida las propiedades básicas de la máquina
   */
  private static validateBasicProps(props: CreateMachineProps): Result<void, DomainError> {
    if (!props.brand || props.brand.trim().length === 0) {
      return err(DomainError.validation('Brand is required'));
    }

    if (!props.modelName || props.modelName.trim().length === 0) {
      return err(DomainError.validation('Model name is required'));
    }

    if (props.brand.length > 50) {
      return err(DomainError.validation('Brand name is too long'));
    }

    if (props.modelName.length > 50) {
      return err(DomainError.validation('Model name is too long'));
    }

    if (props.nickname && props.nickname.length > 30) {
      return err(DomainError.validation('Nickname is too long'));
    }

    return ok(undefined);
  }

  /**
   * Valida las especificaciones técnicas
   */
  private static validateSpecs(specs: MachineSpecs): Result<void, DomainError> {
    if (specs.enginePower !== undefined && (specs.enginePower <= 0 || specs.enginePower > 10000)) {
      return err(DomainError.validation('Engine power must be between 1 and 10000 HP'));
    }

    if (specs.maxCapacity !== undefined && (specs.maxCapacity <= 0 || specs.maxCapacity > 1000000)) {
      return err(DomainError.validation('Max capacity must be between 1 and 1000000 kg'));
    }

    if (specs.year !== undefined) {
      const currentYear = new Date().getFullYear();
      if (specs.year < 1900 || specs.year > currentYear + 1) {
        return err(DomainError.validation(`Year must be between 1900 and ${currentYear + 1}`));
      }
    }

    if (specs.weight !== undefined && (specs.weight <= 0 || specs.weight > 1000000)) {
      return err(DomainError.validation('Weight must be between 1 and 1000000 kg'));
    }

    if (specs.operatingHours !== undefined && (specs.operatingHours < 0 || specs.operatingHours > 100000)) {
      return err(DomainError.validation('Operating hours must be between 0 and 100000'));
    }

    return ok(undefined);
  }

  /**
   * Valida la información de ubicación
   */
  private static validateLocation(location: MachineLocation): Result<void, DomainError> {
    if (location.coordinates) {
      const { latitude, longitude } = location.coordinates;
      if (latitude < -90 || latitude > 90) {
        return err(DomainError.validation('Latitude must be between -90 and 90'));
      }
      if (longitude < -180 || longitude > 180) {
        return err(DomainError.validation('Longitude must be between -180 and 180'));
      }
    }

    return ok(undefined);
  }

  // =============
  // Getters públicos (interfaz inmutable)
  // =============

  get id(): MachineId {
    return this.props.id;
  }

  get serialNumber(): SerialNumber {
    return this.props.serialNumber;
  }

  get brand(): string {
    return this.props.brand;
  }

  get modelName(): string {
    return this.props.modelName;
  }

  get machineTypeId(): MachineTypeId {
    return this.props.machineTypeId;
  }

  get nickname(): string | undefined {
    return this.props.nickname;
  }

  get status(): MachineStatus {
    return this.props.status;
  }

  get ownerId(): UserId {
    return this.props.ownerId;
  }

  get createdById(): UserId {
    return this.props.createdById;
  }

  get assignedProviderId(): UserId | undefined {
    return this.props.assignedProviderId;
  }

  get providerAssignedAt(): Date | undefined {
    return this.props.providerAssignedAt ? new Date(this.props.providerAssignedAt) : undefined;
  }

  get assignedTo(): string | undefined {
    return this.props.assignedTo;
  }

  get usageSchedule(): UsageSchedule | undefined {
    return this.props.usageSchedule;
  }

  get machinePhotoUrl(): string | undefined {
    return this.props.machinePhotoUrl;
  }

  get specs(): MachineSpecs | undefined {
    return this.props.specs ? { ...this.props.specs } : undefined;
  }

  get location(): MachineLocation | undefined {
    return this.props.location ? { ...this.props.location } : undefined;
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }

  get updatedAt(): Date {
    return new Date(this.props.updatedAt);
  }

  // =============
  // Métodos de negocio
  // =============

  /**
   * Asigna un proveedor a la máquina
   */
  public assignProvider(providerId: UserId): Result<void, DomainError> {
    if (this.props.status.code === 'RETIRED') {
      return err(DomainError.domainRule('Cannot assign provider to retired machine'));
    }

    if (!this.props.status.canAssignProvider()) {
      return err(DomainError.domainRule(`Cannot assign provider to machine in ${this.props.status.displayName} status`));
    }

    if (this.props.assignedProviderId && this.props.assignedProviderId.equals(providerId)) {
      return err(DomainError.domainRule('Provider is already assigned to this machine'));
    }

    this.props.assignedProviderId = providerId;
    this.props.providerAssignedAt = new Date();
    this.props.updatedAt = new Date();

    return ok(undefined);
  }

  /**
   * Remueve el proveedor asignado de la máquina
   */
  public removeProvider(): Result<void, DomainError> {
    if (!this.props.assignedProviderId) {
      return err(DomainError.domainRule('No provider is currently assigned to this machine'));
    }

    this.props.assignedProviderId = undefined;
    this.props.providerAssignedAt = undefined;
    this.props.updatedAt = new Date();

    return ok(undefined);
  }

  /**
   * Cambia el estado de la máquina
   */
  public changeStatus(newStatus: MachineStatus): Result<void, DomainError> {
    if (this.props.status.equals(newStatus)) {
      return err(DomainError.domainRule(`Machine is already in ${newStatus.displayName} status`));
    }

    // Validar transiciones permitidas usando el nuevo patrón
    if (!this.props.status.canTransitionTo(newStatus)) {
      return err(DomainError.domainRule(`Invalid status transition from ${this.props.status.displayName} to ${newStatus.displayName}`));
    }

    // Ejecutar lógica de salida del estado actual
    const exitResult = this.props.status.onExitStatus();
    if (!exitResult.success) {
      return err(exitResult.error);
    }

    // Ejecutar lógica de entrada al nuevo estado
    const enterResult = newStatus.onEnterStatus();
    if (!enterResult.success) {
      return err(enterResult.error);
    }

    this.props.status = newStatus;
    this.props.updatedAt = new Date();

    return ok(undefined);
  }

  /**
   * Actualiza las especificaciones técnicas
   */
  public updateSpecs(newSpecs: Partial<MachineSpecs>): Result<void, DomainError> {
    const updatedSpecs = { ...this.props.specs, ...newSpecs };
    
    const validation = Machine.validateSpecs(updatedSpecs);
    if (!validation.success) {
      return err(validation.error);
    }

    this.props.specs = updatedSpecs;
    this.props.updatedAt = new Date();

    return ok(undefined);
  }

  /**
   * Actualiza la ubicación de la máquina
   */
  public updateLocation(newLocation: MachineLocation): Result<void, DomainError> {
    const validation = Machine.validateLocation(newLocation);
    if (!validation.success) {
      return err(validation.error);
    }

    this.props.location = { ...newLocation };
    this.props.updatedAt = new Date();

    return ok(undefined);
  }

  /**
   * Actualiza las horas de operación
   */
  public updateOperatingHours(hours: number): Result<void, DomainError> {
    if (hours < 0 || hours > 100000) {
      return err(DomainError.validation('Operating hours must be between 0 and 100000'));
    }

    if (!this.props.specs) {
      this.props.specs = {};
    }

    this.props.specs.operatingHours = hours;
    this.props.updatedAt = new Date();

    return ok(undefined);
  }

  /**
   * Actualiza la persona asignada a la máquina
   */
  public updateAssignedTo(assignedTo?: string): Result<void, DomainError> {
    if (assignedTo && assignedTo.trim().length > 100) {
      return err(DomainError.validation('Assigned to name cannot exceed 100 characters'));
    }

    this.props.assignedTo = assignedTo?.trim();
    this.props.updatedAt = new Date();

    return ok(undefined);
  }

  /**
   * Actualiza la programación de uso de la máquina
   * Valida el UsageSchedule VO antes de asignar
   */
  public updateUsageSchedule(usageSchedule?: UsageSchedule): Result<void, DomainError> {
    // UsageSchedule ya viene validado por su factory method
    // No necesitamos validaciones adicionales aquí
    this.props.usageSchedule = usageSchedule;
    this.props.updatedAt = new Date();

    return ok(undefined);
  }

  /**
   * Actualiza la URL de la foto de la máquina
   */
  public updateMachinePhotoUrl(photoUrl?: string): Result<void, DomainError> {
    if (photoUrl && photoUrl.trim().length > 500) {
      return err(DomainError.validation('Photo URL cannot exceed 500 characters'));
    }

    // Validación básica de URL
    if (photoUrl && photoUrl.trim().length > 0) {
      try {
        new URL(photoUrl);
      } catch {
        return err(DomainError.validation('Invalid photo URL format'));
      }
    }

    this.props.machinePhotoUrl = photoUrl?.trim();
    this.props.updatedAt = new Date();

    return ok(undefined);
  }

  /**
   * Agrega un registro de QuickCheck al historial de la máquina
   * Aplica validaciones de negocio críticas:
   * - Máquina no debe estar RETIRED
   * - Al menos un item en el checklist
   * - Identificación del responsable (nombre y número de trabajador)
   * - Consistencia entre resultado general y resultados de items
   * - 'notInitiated' solo cuando todos los items están 'omitted'
   * 
   * @param record - Registro de QuickCheck a agregar
   * @returns Result<void> exitoso o DomainError con validación
   */
  public addQuickCheckRecord(record: IQuickCheckRecord): Result<void, DomainError> {
    // Validación 1: No agregar quickcheck a máquina retirada
    if (this.props.status.code === 'RETIRED') {
      return err(DomainError.domainRule('Cannot add QuickCheck to retired machine'));
    }

    // Validación 2: Información del responsable es obligatoria
    if (!record.responsibleName || record.responsibleName.trim().length === 0) {
      return err(DomainError.validation('Responsible name is required for QuickCheck'));
    }

    if (!record.responsibleWorkerId || record.responsibleWorkerId.trim().length === 0) {
      return err(DomainError.validation('Responsible worker ID is required for QuickCheck'));
    }

    if (record.responsibleName.trim().length > 100) {
      return err(DomainError.validation('Responsible name cannot exceed 100 characters'));
    }

    if (record.responsibleWorkerId.trim().length > 50) {
      return err(DomainError.validation('Responsible worker ID cannot exceed 50 characters'));
    }

    // Validación 3: Al menos un item en el checklist
    if (!record.quickCheckItems || record.quickCheckItems.length === 0) {
      return err(DomainError.validation('QuickCheck must have at least one item'));
    }

    // Validación 4: Consistencia de resultados
    const allApproved = record.quickCheckItems.every(item => item.result === 'approved');
    const anyDisapproved = record.quickCheckItems.some(item => item.result === 'disapproved');
    const allOmitted = record.quickCheckItems.every(item => item.result === 'omitted');

    // Si todos los items están aprobados, el resultado general debe ser 'approved'
    if (allApproved && record.result !== 'approved') {
      return err(DomainError.validation('Result should be approved when all items are approved'));
    }

    // Si al menos un item está desaprobado, el resultado general NO puede ser 'approved'
    if (anyDisapproved && record.result === 'approved') {
      return err(DomainError.validation('Result cannot be approved when items are disapproved'));
    }

    // Validación 5: 'notInitiated' solo cuando todos los items están 'omitted'
    // Esto representa una inspección que no fue completada/iniciada apropiadamente
    if (record.result === 'notInitiated' && !allOmitted) {
      return err(DomainError.validation("Result 'notInitiated' is only allowed when all items are 'omitted'"));
    }

    // Validación 6: Límite de historial (soft limit - advisory)
    if (this.props.quickChecks.length >= 100) {
      // Nota: El repositorio usa $slice para mantener solo 100 registros
      // Esta validación es informativa, no bloqueante
      console.warn(`Machine ${this.id.getValue()} has reached 100 QuickCheck records. Oldest will be rotated.`);
    }

    // Agregar al historial (más recientes primero)
    this.props.quickChecks.unshift(record);
    this.props.updatedAt = new Date();

    return ok(undefined);
  }

  /**
   * Agrega un evento al historial de la máquina
   * Patrón IDÉNTICO a addQuickCheckRecord (embedded array)
   * 
   * @param event - Evento a agregar
   * @returns Result<void> exitoso o DomainError con validación
   */
  public addEvent(event: IMachineEvent): Result<void, DomainError> {
    // Validación 1: No agregar eventos a máquina retirada
    if (this.props.status.code === 'RETIRED') {
      return err(DomainError.domainRule('Cannot add event to retired machine'));
    }

    // Validación 2: Campos obligatorios
    if (!event.title || event.title.trim().length === 0) {
      return err(DomainError.validation('Event title is required'));
    }

    if (event.title.trim().length > 200) {
      return err(DomainError.validation('Event title cannot exceed 200 characters'));
    }

    if (event.description && event.description.trim().length > 2000) {
      return err(DomainError.validation('Event description cannot exceed 2000 characters'));
    }

    if (!event.typeId || event.typeId.trim().length === 0) {
      return err(DomainError.validation('Event type is required'));
    }

    if (!event.createdBy || event.createdBy.trim().length === 0) {
      return err(DomainError.validation('Event creator is required'));
    }

    // Validación 3: Soft limit (300 events, warning pero no blocking)
    if (this.props.eventsHistory.length >= 300) {
      console.warn(`Machine ${this.id.getValue()} has ${this.props.eventsHistory.length} events (soft limit: 300)`);
    }

    // Agregar al historial (más recientes primero)
    this.props.eventsHistory.unshift(event);
    this.props.updatedAt = new Date();

    return ok(undefined);
  }

  /**
   * Obtiene el historial de eventos
   * @returns Array inmutable de eventos (readonly)
   */
  public getEventsHistory(): readonly IMachineEvent[] {
    return this.props.eventsHistory;
  }

  // =============================================================================
  // MÉTODOS ESTRATÉGICOS FUTUROS (Comentados para post-MVP)
  // =============================================================================

  /**
   * TODO POST-MVP: Obtener último QuickCheck
   * Útil para mostrar estado actual de inspección en UI
   */
  // public getLatestQuickCheck(): IQuickCheckRecord | undefined {
  //   return this.props.quickChecks[0];
  // }

  /**
   * TODO POST-MVP: Contar QuickChecks no aprobados
   * Útil para alertas y métricas de calidad
   */
  // public countDisapprovedQuickChecks(): number {
  //   return this.props.quickChecks.filter(qc => qc.result === 'disapproved').length;
  // }

  /**
   * TODO POST-MVP: Obtener tasa de aprobación
   * Retorna porcentaje de QuickChecks aprobados (0-100)
   */
  // public getApprovalRate(): number {
  //   if (this.props.quickChecks.length === 0) return 100;
  //   const approved = this.props.quickChecks.filter(qc => qc.result === 'approved').length;
  //   return (approved / this.props.quickChecks.length) * 100;
  // }

  /**
   * TODO POST-MVP: Verificar si requiere inspección
   * Basado en tiempo transcurrido desde último QuickCheck
   */
  // public requiresInspection(thresholdDays: number = 7): boolean {
  //   const latest = this.getLatestQuickCheck();
  //   if (!latest) return true; // Nunca inspeccionada
  //   
  //   const daysSinceInspection = (Date.now() - latest.date.getTime()) / (1000 * 60 * 60 * 24);
  //   return daysSinceInspection >= thresholdDays;
  // }

  /**
   * Actualiza las propiedades básicas de la máquina
   */
  public updateMachineProps(updates: {
    brand?: string;
    modelName?: string;
    nickname?: string;
  }): Result<void, DomainError> {
    // Validar y limpiar inputs antes de aplicar
    const cleanedBrand = updates.brand?.trim();
    const cleanedModelName = updates.modelName?.trim();
    const cleanedNickname = updates.nickname?.trim();

    // Determinar valores finales (usar actuales si no se proporcionan nuevos)
    const finalBrand = cleanedBrand !== undefined ? cleanedBrand : this.props.brand;
    const finalModelName = cleanedModelName !== undefined ? cleanedModelName : this.props.modelName;
    const finalNickname = cleanedNickname !== undefined ? cleanedNickname : this.props.nickname;

    // Validar las propiedades finales
    if (finalBrand.length === 0) {
      return err(DomainError.validation('Brand is required'));
    }

    if (finalModelName.length === 0) {
      return err(DomainError.validation('Model name is required'));
    }

    if (finalBrand.length > 50) {
      return err(DomainError.validation('Brand name is too long'));
    }

    if (finalModelName.length > 50) {
      return err(DomainError.validation('Model name is too long'));
    }

    if (finalNickname && finalNickname.length > 30) {
      return err(DomainError.validation('Nickname is too long'));
    }

    // Aplicar cambios
    this.props.brand = finalBrand;
    this.props.modelName = finalModelName;
    this.props.nickname = finalNickname || undefined;
    this.props.updatedAt = new Date();

    return ok(undefined);
  }

  // =============
  // Métodos de consulta
  // =============

  /**
   * Verifica si la máquina tiene un proveedor asignado
   */
  public hasAssignedProvider(): boolean {
    return !!this.props.assignedProviderId;
  }

  /**
   * Verifica si la máquina está operacional
   */
  public isOperational(): boolean {
    return this.props.status.isOperational;
  }

  /**
   * Verifica si la máquina está retirada
   */
  public isRetired(): boolean {
    return this.props.status.code === 'RETIRED';
  }

  /**
   * Obtiene el nombre de display de la máquina
   */
  public getDisplayName(): string {
    return this.props.nickname || `${this.props.brand} ${this.props.modelName}`;
  }

  /**
   * Obtiene identificación única para la máquina (marca + modelo + serial)
   */
  public getUniqueIdentifier(): string {
    return `${this.props.brand}-${this.props.modelName}-${this.props.serialNumber.getValue()}`;
  }

  /**
   * Obtiene información básica para logs
   */
  public getLogInfo(): string {
    return `Machine(${this.props.id.getValue()}, ${this.getDisplayName()}, ${this.props.serialNumber.toCensoredString()})`;
  }

  // =============
  // Métodos auxiliares privados
  // =============

  /**
   * Valida si una transición de estado es permitida
   */
  /**
   * Compara dos máquinas por ID
   */
  public equals(other: Machine): boolean {
    return this.props.id.equals(other.props.id);
  }
}