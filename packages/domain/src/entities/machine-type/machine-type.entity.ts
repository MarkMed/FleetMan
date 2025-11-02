import { Result, ok, err, DomainError } from '../../errors';
import { MachineTypeId } from '../../value-objects/machine-type-id.vo';

/**
 * Metadata extendida para tipos de máquina
 * Permite configuraciones avanzadas para UI y lógica de negocio
 */
export interface MachineTypeMetadata {
  // UI/Visual
  color?: string;           // Color hex para UI (#FF5733)
  icon?: string;           // Nombre del ícono o URL
  imageUrl?: string;       // URL de imagen representativa
  
  // Organización  
  tags?: string[];         // Tags para búsqueda/filtrado
  sortOrder?: number;      // Orden de visualización (default: 999)
  
  // Configuración de negocio
  requiresLicense?: boolean;        // Si requiere licencia especial
  minimumOperatorLevel?: string;    // Nivel mínimo del operador
  defaultMaintenanceInterval?: number; // Días entre mantenimientos
  
  // Specs por defecto sugeridas
  defaultSpecs?: {
    enginePowerRange?: { min: number; max: number };
    capacityRange?: { min: number; max: number };
    recommendedFuelType?: 'DIESEL' | 'GASOLINE' | 'ELECTRIC' | 'HYBRID';
  };
}

/**
 * Propiedades para crear un tipo de máquina
 */
export interface CreateMachineTypeProps {
  code: string;                    // Código único (EXCAVATOR, REACH_TRUCK)
  displayName: string;             // Nombre para mostrar (Excavadora)
  description?: string;            // Descripción detallada
  category: string;                // Categoría (Construcción Pesada)
  isActive?: boolean;              // Activo/Inactivo (default: true)
  metadata?: MachineTypeMetadata;  // Metadata extendida
}

/**
 * Propiedades internas de MachineType
 */
interface MachineTypeProps {
  id: MachineTypeId;
  code: string;
  displayName: string;
  description: string;
  category: string;
  isActive: boolean;
  metadata: MachineTypeMetadata;
  createdAt: Date;
  updatedAt: Date;
  // Audit fields para tracking
  createdBy?: string;              // Usuario que lo creó
  lastModifiedBy?: string;         // Último usuario que lo modificó
}

/**
 * MachineType - Entidad configurable que representa un tipo de máquina
 * Esta entidad reemplaza las clases hard-coded y permite gestión dinámica
 * 
 * Será la base para:
 * - Schema de Mongoose en persistence layer
 * - API endpoints para gestión CRUD
 * - Dropdowns y selectors en UI
 * - Lógica de negocio relacionada con tipos
 */
export class MachineType {
  private constructor(private props: MachineTypeProps) {}

  /**
   * Crea un nuevo tipo de máquina con validaciones de dominio
   */
  public static create(createProps: CreateMachineTypeProps): Result<MachineType, DomainError> {
    // Validar código
    const codeValidation = MachineType.validateCode(createProps.code);
    if (!codeValidation.success) {
      return err(codeValidation.error);
    }

    // Validar display name
    const nameValidation = MachineType.validateDisplayName(createProps.displayName);
    if (!nameValidation.success) {
      return err(nameValidation.error);
    }

    // Validar categoría
    const categoryValidation = MachineType.validateCategory(createProps.category);
    if (!categoryValidation.success) {
      return err(categoryValidation.error);
    }

    // Validar metadata si está presente
    if (createProps.metadata) {
      const metadataValidation = MachineType.validateMetadata(createProps.metadata);
      if (!metadataValidation.success) {
        return err(metadataValidation.error);
      }
    }

    const now = new Date();
    const props: MachineTypeProps = {
      id: MachineTypeId.generate(),
      code: createProps.code.toUpperCase().trim(),
      displayName: createProps.displayName.trim(),
      description: createProps.description?.trim() || '',
      category: createProps.category.trim(),
      isActive: createProps.isActive ?? true,
      metadata: createProps.metadata || {},
      createdAt: now,
      updatedAt: now
    };

    return ok(new MachineType(props));
  }

  /**
   * Reconstitute - Crea una instancia desde datos persistidos
   * Usado por el repository para reconstruir la entidad desde DB
   */
  public static reconstitute(props: {
    id: string;
    code: string;
    displayName: string;
    description: string;
    category: string;
    isActive: boolean;
    metadata: MachineTypeMetadata;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    lastModifiedBy?: string;
  }): Result<MachineType, DomainError> {
    const idResult = MachineTypeId.create(props.id);
    if (!idResult.success) {
      return err(idResult.error);
    }

    const machineTypeProps: MachineTypeProps = {
      id: idResult.data,
      code: props.code,
      displayName: props.displayName,
      description: props.description,
      category: props.category,
      isActive: props.isActive,
      metadata: props.metadata,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      createdBy: props.createdBy,
      lastModifiedBy: props.lastModifiedBy
    };

    return ok(new MachineType(machineTypeProps));
  }

  // =============
  // Validaciones privadas
  // =============

  private static validateCode(code: string): Result<void, DomainError> {
    if (!code || code.trim().length === 0) {
      return err(DomainError.validation('Code is required'));
    }

    const trimmed = code.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      return err(DomainError.validation('Code must be between 2 and 30 characters'));
    }

    // Código debe ser alfanumérico + guiones/guiones bajos
    const validFormat = /^[A-Z0-9_-]+$/i.test(trimmed);
    if (!validFormat) {
      return err(DomainError.validation('Code can only contain letters, numbers, hyphens and underscores'));
    }

    return ok(undefined);
  }

  private static validateDisplayName(displayName: string): Result<void, DomainError> {
    if (!displayName || displayName.trim().length === 0) {
      return err(DomainError.validation('Display name is required'));
    }

    const trimmed = displayName.trim();
    if (trimmed.length < 2 || trimmed.length > 50) {
      return err(DomainError.validation('Display name must be between 2 and 50 characters'));
    }

    return ok(undefined);
  }

  private static validateCategory(category: string): Result<void, DomainError> {
    if (!category || category.trim().length === 0) {
      return err(DomainError.validation('Category is required'));
    }

    const trimmed = category.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      return err(DomainError.validation('Category must be between 2 and 30 characters'));
    }

    return ok(undefined);
  }

  private static validateMetadata(metadata: MachineTypeMetadata): Result<void, DomainError> {
    // Validar color hex si está presente
    if (metadata.color && !/^#[0-9A-F]{6}$/i.test(metadata.color)) {
      return err(DomainError.validation('Color must be a valid hex color (#RRGGBB)'));
    }

    // Validar sortOrder
    if (metadata.sortOrder !== undefined && (metadata.sortOrder < 0 || metadata.sortOrder > 9999)) {
      return err(DomainError.validation('Sort order must be between 0 and 9999'));
    }

    // Validar intervalos de specs
    if (metadata.defaultSpecs?.enginePowerRange) {
      const range = metadata.defaultSpecs.enginePowerRange;
      if (range.min < 0 || range.max < 0 || range.min > range.max) {
        return err(DomainError.validation('Invalid engine power range'));
      }
    }

    if (metadata.defaultSpecs?.capacityRange) {
      const range = metadata.defaultSpecs.capacityRange;
      if (range.min < 0 || range.max < 0 || range.min > range.max) {
        return err(DomainError.validation('Invalid capacity range'));
      }
    }

    return ok(undefined);
  }

  // =============
  // Getters públicos (interfaz inmutable)
  // =============

  get id(): MachineTypeId {
    return this.props.id;
  }

  get code(): string {
    return this.props.code;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get description(): string {
    return this.props.description;
  }

  get category(): string {
    return this.props.category;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get metadata(): MachineTypeMetadata {
    return { ...this.props.metadata }; // Copia defensiva
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }

  get updatedAt(): Date {
    return new Date(this.props.updatedAt);
  }

  get createdBy(): string | undefined {
    return this.props.createdBy;
  }

  get lastModifiedBy(): string | undefined {
    return this.props.lastModifiedBy;
  }

  // =============
  // Métodos de negocio
  // =============

  /**
   * Actualiza la información básica del tipo de máquina
   */
  public updateInfo(updates: {
    displayName?: string;
    description?: string;
    category?: string;
    lastModifiedBy?: string;
  }): Result<void, DomainError> {
    if (updates.displayName) {
      const nameValidation = MachineType.validateDisplayName(updates.displayName);
      if (!nameValidation.success) {
        return err(nameValidation.error);
      }
      this.props.displayName = updates.displayName.trim();
    }

    if (updates.description !== undefined) {
      this.props.description = updates.description.trim();
    }

    if (updates.category) {
      const categoryValidation = MachineType.validateCategory(updates.category);
      if (!categoryValidation.success) {
        return err(categoryValidation.error);
      }
      this.props.category = updates.category.trim();
    }

    this.props.updatedAt = new Date();
    if (updates.lastModifiedBy) {
      this.props.lastModifiedBy = updates.lastModifiedBy;
    }

    return ok(undefined);
  }

  /**
   * Actualiza la metadata del tipo de máquina
   */
  public updateMetadata(newMetadata: Partial<MachineTypeMetadata>, lastModifiedBy?: string): Result<void, DomainError> {
    const updatedMetadata = { ...this.props.metadata, ...newMetadata };
    
    const validation = MachineType.validateMetadata(updatedMetadata);
    if (!validation.success) {
      return err(validation.error);
    }

    this.props.metadata = updatedMetadata;
    this.props.updatedAt = new Date();
    if (lastModifiedBy) {
      this.props.lastModifiedBy = lastModifiedBy;
    }

    return ok(undefined);
  }

  /**
   * Activa el tipo de máquina
   */
  public activate(lastModifiedBy?: string): void {
    if (!this.props.isActive) {
      this.props.isActive = true;
      this.props.updatedAt = new Date();
      if (lastModifiedBy) {
        this.props.lastModifiedBy = lastModifiedBy;
      }
    }
  }

  /**
   * Desactiva el tipo de máquina
   */
  public deactivate(lastModifiedBy?: string): void {
    if (this.props.isActive) {
      this.props.isActive = false;
      this.props.updatedAt = new Date();
      if (lastModifiedBy) {
        this.props.lastModifiedBy = lastModifiedBy;
      }
    }
  }

  // =============
  // Métodos de consulta
  // =============

  /**
   * Obtiene el orden de visualización (sortOrder o 999 por defecto)
   */
  public getSortOrder(): number {
    return this.props.metadata.sortOrder ?? 999;
  }

  /**
   * Verifica si tiene configuración de specs por defecto
   */
  public hasDefaultSpecs(): boolean {
    return !!this.props.metadata.defaultSpecs;
  }

  /**
   * Obtiene información para dropdowns/selectors
   */
  public toSelectOption(): { value: string; label: string; category: string } {
    return {
      value: this.props.id.getValue(),
      label: this.props.displayName,
      category: this.props.category
    };
  }

  /**
   * Serializa para API/JSON (sin métodos, solo datos)
   */
  public toJSON(): object {
    return {
      id: this.props.id.getValue(),
      code: this.props.code,
      displayName: this.props.displayName,
      description: this.props.description,
      category: this.props.category,
      isActive: this.props.isActive,
      metadata: this.props.metadata,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
      createdBy: this.props.createdBy,
      lastModifiedBy: this.props.lastModifiedBy
    };
  }

  /**
   * Compara dos tipos de máquina por ID
   */
  public equals(other: MachineType): boolean {
    return this.props.id.equals(other.props.id);
  }

  /**
   * Compara por código (para búsquedas)
   */
  public hasCode(code: string): boolean {
    return this.props.code === code.toUpperCase().trim();
  }

  /**
   * String representation para logs
   */
  public toString(): string {
    return `MachineType(${this.props.code}, ${this.props.displayName})`;
  }
}