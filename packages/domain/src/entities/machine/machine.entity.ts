import { Result, ok, err, DomainError, DomainErrorCodes } from '../../errors';
import { MachineId } from '../../value-objects/machine-id.vo';
import { MachineTypeId } from '../../value-objects/machine-type-id.vo';
import { SerialNumber } from '../../value-objects/serial-number.vo';
import { UserId } from '../../value-objects/user-id.vo';
import { 
  MachineStatus, 
  MachineStatusRegistry, 
  MachineStatuses,
  MachineStatusCode 
} from './machineStatus';

/**
 * Especificaciones técnicas de la máquina
 */
export interface MachineSpecs {
  enginePower?: number; // HP
  maxCapacity?: number; // kg o m3
  fuelType?: 'DIESEL' | 'GASOLINE' | 'ELECTRIC' | 'HYBRID';
  year?: number;
  weight?: number; // kg
  operatingHours?: number; // Horas acumuladas de uso
}

/**
 * Información de ubicación de la máquina
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
  model: string;
  machineTypeId: string; // Se recibe como string y se valida internamente
  ownerId: string; // UserId string
  createdById: string; // UserId string
  specs?: MachineSpecs;
  location?: MachineLocation;
  nickname?: string; // Nombre amigable para la máquina
  initialStatus?: MachineStatusCode
}

/**
 * Propiedades internas de la máquina
 */
interface MachineProps {
  id: MachineId;
  serialNumber: SerialNumber;
  brand: string;
  model: string;
  machineTypeId: MachineTypeId;
  nickname?: string;
  status: MachineStatus; // Ahora usa la clase MachineStatus
  ownerId: UserId;
  createdById: UserId;
  assignedProviderId?: UserId;
  providerAssignedAt?: Date;
  specs?: MachineSpecs;
  location?: MachineLocation;
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
      model: createProps.model.trim(),
      machineTypeId: machineTypeIdResult.data,
      nickname: createProps.nickname?.trim(),
      status: initialStatus,
      ownerId: ownerIdResult.data,
      createdById: creatorIdResult.data,
      specs: createProps.specs,
      location: createProps.location,
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

    if (!props.model || props.model.trim().length === 0) {
      return err(DomainError.validation('Model is required'));
    }

    if (props.brand.length > 50) {
      return err(DomainError.validation('Brand name is too long'));
    }

    if (props.model.length > 50) {
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

  get model(): string {
    return this.props.model;
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
   * Actualiza las propiedades básicas de la máquina
   */
  public updateMachineProps(updates: {
    brand?: string;
    model?: string;
    nickname?: string;
  }): Result<void, DomainError> {
    // Validar y limpiar inputs antes de aplicar
    const cleanedBrand = updates.brand?.trim();
    const cleanedModel = updates.model?.trim();
    const cleanedNickname = updates.nickname?.trim();

    // Determinar valores finales (usar actuales si no se proporcionan nuevos)
    const finalBrand = cleanedBrand !== undefined ? cleanedBrand : this.props.brand;
    const finalModel = cleanedModel !== undefined ? cleanedModel : this.props.model;
    const finalNickname = cleanedNickname !== undefined ? cleanedNickname : this.props.nickname;

    // Validar las propiedades finales
    if (finalBrand.length === 0) {
      return err(DomainError.validation('Brand is required'));
    }

    if (finalModel.length === 0) {
      return err(DomainError.validation('Model is required'));
    }

    if (finalBrand.length > 50) {
      return err(DomainError.validation('Brand name is too long'));
    }

    if (finalModel.length > 50) {
      return err(DomainError.validation('Model name is too long'));
    }

    if (finalNickname && finalNickname.length > 30) {
      return err(DomainError.validation('Nickname is too long'));
    }

    // Aplicar cambios
    this.props.brand = finalBrand;
    this.props.model = finalModel;
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
    return this.props.nickname || `${this.props.brand} ${this.props.model}`;
  }

  /**
   * Obtiene identificación única para la máquina (marca + modelo + serial)
   */
  public getUniqueIdentifier(): string {
    return `${this.props.brand}-${this.props.model}-${this.props.serialNumber.getValue()}`;
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