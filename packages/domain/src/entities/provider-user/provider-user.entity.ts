/**
 * Entidad ProviderUser - Usuario Proveedor de Servicios
 * 
 * Representa un usuario que actúa como proveedor de servicios
 * para las máquinas en el sistema FleetMan.
 * Hereda de la clase base User.
 */

import { User, UserType, CreateUserProps, UserProfile } from '../user/user.entity';
import { Result, ok, err, DomainError } from '../../errors';

// =============================================================================
// Interfaces específicas de ProviderUser
// =============================================================================

/**
 * Propiedades específicas para crear un ProviderUser
 */
export interface CreateProviderUserProps {
  email: string;
  passwordHash: string;
  profile: UserProfile;
  specialties?: string[];
  isVerified?: boolean;
  serviceRadius?: number; // km
}

/**
 * Información de especialidades y servicios del proveedor
 */
export interface ProviderSpecs {
  readonly experienceYears?: number;
  readonly certifications?: string[];
  readonly serviceRadius?: number; // km
  readonly averageResponseTime?: number; // hours
  readonly rating?: number; // 1-5
  readonly completedJobs?: number;
  readonly isVerified?: boolean;
}

// =============================================================================
// Propiedades internas específicas de ProviderUser
// =============================================================================

interface ProviderUserProps {
  specialties: string[];
  specs: ProviderSpecs | null;
}

// =============================================================================
// Entidad ProviderUser
// =============================================================================

export class ProviderUser extends User {
  private constructor(
    userProps: any, // UserProps from base class
    private providerProps: ProviderUserProps
  ) {
    super(userProps);
  }

  // ==========================================================================
  // Factory method - Implementación polimórfica
  // ==========================================================================

  static create(createProps: CreateProviderUserProps): Result<ProviderUser, DomainError> {
    // Validaciones específicas de ProviderUser
    const providerValidation = ProviderUser.validateProviderProps(createProps);
    if (!providerValidation.success) {
      return err(providerValidation.error);
    }

    // Usar el factory method protegido de la clase base
    const userPropsResult = User.createUserProps({
      email: createProps.email,
      passwordHash: createProps.passwordHash,
      profile: createProps.profile,
      type: UserType.PROVIDER
    });

    if (!userPropsResult.success) {
      return err(userPropsResult.error);
    }

    // Construir props específicas del proveedor
    const providerProps: ProviderUserProps = {
      specialties: createProps.specialties ? 
        ProviderUser.cleanSpecialties(createProps.specialties) : [],
      specs: {
        serviceRadius: createProps.serviceRadius,
        isVerified: createProps.isVerified ?? false,
        experienceYears: 0,
        completedJobs: 0,
        rating: 0
      }
    };

    return ok(new ProviderUser(userPropsResult.data, providerProps));
  }

  // ==========================================================================
  // Validaciones específicas
  // ==========================================================================

  private static validateProviderProps(props: CreateProviderUserProps): Result<void, DomainError> {
    // Validar especialidades
    if (props.specialties && props.specialties.length > 10) {
      return err(DomainError.validation('Maximum 10 specialties allowed'));
    }

    // Validar radio de servicio
    if (props.serviceRadius !== undefined) {
      if (props.serviceRadius < 0 || props.serviceRadius > 1000) {
        return err(DomainError.validation('Service radius must be between 0 and 1000 km'));
      }
    }

    return ok(undefined);
  }

  private static cleanSpecialties(specialties: string[]): string[] {
    return specialties
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .filter((s, index, arr) => arr.indexOf(s) === index); // remove duplicates
  }

  // ==========================================================================
  // Getters específicos de ProviderUser
  // ==========================================================================

  get specialties(): readonly string[] {
    return [...this.providerProps.specialties];
  }

  get specs(): ProviderSpecs | null {
    return this.providerProps.specs ? { ...this.providerProps.specs } : null;
  }

  get isVerified(): boolean {
    return this.providerProps.specs?.isVerified ?? false;
  }

  get serviceRadius(): number | undefined {
    return this.providerProps.specs?.serviceRadius;
  }

  get rating(): number {
    return this.providerProps.specs?.rating ?? 0;
  }

  get completedJobs(): number {
    return this.providerProps.specs?.completedJobs ?? 0;
  }

  // ==========================================================================
  // Métodos de negocio específicos
  // ==========================================================================

  /**
   * Actualiza las especialidades del proveedor
   */
  public updateSpecialties(specialties: string[]): Result<void, DomainError> {
    if (specialties.length > 10) {
      return err(DomainError.validation('Maximum 10 specialties allowed'));
    }

    this.providerProps.specialties = ProviderUser.cleanSpecialties(specialties);
    return ok(undefined);
  }

  /**
   * Verifica la cuenta del proveedor
   */
  public verify(): Result<void, DomainError> {
    if (this.isVerified) {
      return err(DomainError.conflict('Provider is already verified'));
    }

    if (!this.providerProps.specs) {
      this.providerProps.specs = {
        isVerified: true,
        experienceYears: 0,
        completedJobs: 0,
        rating: 0
      };
    } else {
      this.providerProps.specs = {
        ...this.providerProps.specs,
        isVerified: true
      };
    }

    return ok(undefined);
  }

  /**
   * Actualiza el radio de servicio
   */
  public updateServiceRadius(radiusKm: number): Result<void, DomainError> {
    if (radiusKm < 0 || radiusKm > 1000) {
      return err(DomainError.validation('Service radius must be between 0 and 1000 km'));
    }

    if (!this.providerProps.specs) {
      this.providerProps.specs = {
        serviceRadius: radiusKm,
        isVerified: false,
        experienceYears: 0,
        completedJobs: 0,
        rating: 0
      };
    } else {
      this.providerProps.specs = {
        ...this.providerProps.specs,
        serviceRadius: radiusKm
      };
    }

    return ok(undefined);
  }

  /**
   * Registra un trabajo completado
   */
  public addCompletedJob(rating?: number): Result<void, DomainError> {
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return err(DomainError.validation('Rating must be between 1 and 5'));
    }

    if (!this.providerProps.specs) {
      this.providerProps.specs = {
        completedJobs: 1,
        rating: rating || 0,
        isVerified: false,
        experienceYears: 0
      };
    } else {
      const currentJobs = this.providerProps.specs.completedJobs ?? 0;
      const currentRating = this.providerProps.specs.rating ?? 0;
      
      // Calcular nueva rating promedio si se proporciona
      let newRating = currentRating;
      if (rating !== undefined && currentJobs > 0) {
        newRating = ((currentRating * currentJobs) + rating) / (currentJobs + 1);
      } else if (rating !== undefined && currentJobs === 0) {
        newRating = rating;
      }

      this.providerProps.specs = {
        ...this.providerProps.specs,
        completedJobs: currentJobs + 1,
        rating: newRating
      };
    }

    return ok(undefined);
  }

  // ==========================================================================
  // Métodos de consulta específicos
  // ==========================================================================

  /**
   * Verifica si el proveedor tiene una especialidad específica
   */
  public hasSpecialty(specialty: string): boolean {
    return this.providerProps.specialties.some(s => 
      s.toLowerCase() === specialty.toLowerCase()
    );
  }

  /**
   * Verifica si el proveedor puede ser asignado a trabajos
   */
  public canBeAssigned(): boolean {
    return this.isActive && this.isVerified;
  }

  /**
   * Obtiene información específica del proveedor para logs
   */
  public getProviderLogInfo(): string {
    const baseInfo = this.getLogInfo();
    const specs = this.providerProps.specialties.length > 0 
      ? ` - Specialties: ${this.providerProps.specialties.slice(0, 3).join(', ')}`
      : '';
    const verified = this.isVerified ? ' - VERIFIED' : ' - UNVERIFIED';
    
    return `${baseInfo}${specs}${verified}`;
  }

  /**
   * Obtiene un resumen del proveedor
   */
  public getProviderSummary(): {
    displayName: string;
    specialties: string[];
    isVerified: boolean;
    rating: number;
    completedJobs: number;
    serviceRadius?: number;
  } {
    return {
      displayName: this.getDisplayName(),
      specialties: [...this.providerProps.specialties],
      isVerified: this.isVerified,
      rating: this.rating,
      completedJobs: this.completedJobs,
      serviceRadius: this.serviceRadius
    };
  }
}