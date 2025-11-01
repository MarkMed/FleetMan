import { Result, ok, err, DomainError, DomainErrorCodes } from '../errors';
import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';

/**
 * Tipos de usuario en el sistema
 */
export enum UserType {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
}

/**
 * Información del perfil de usuario
 */
export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
  position?: string;
}

/**
 * Propiedades para crear un usuario
 */
export interface CreateUserProps {
  email: string;
  passwordHash: string;
  profile: UserProfile;
  type: UserType;
}

/**
 * Propiedades internas del usuario
 */
interface UserProps {
  id: UserId;
  email: Email;
  passwordHash: string;
  profile: UserProfile;
  type: UserType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad base abstracta User
 * Representa la identidad y autenticación base para todos los usuarios del sistema
 */
export abstract class User {
  protected constructor(protected props: UserProps) {}

  /**
   * Crea un nuevo usuario con validaciones de dominio
   * @param createProps - Propiedades para crear el usuario
   * @returns Result con Usuario válido o error de dominio
   */
  public static create(createProps: CreateUserProps): Result<User, DomainError> {
    // Validar email
    const emailResult = Email.create(createProps.email);
    if (!emailResult.success) {
      return err(emailResult.error);
    }

    // Validar password hash
    const passwordValidation = User.validatePasswordHash(createProps.passwordHash);
    if (!passwordValidation.success) {
      return err(passwordValidation.error);
    }

    // Validar perfil
    const profileValidation = User.validateProfile(createProps.profile);
    if (!profileValidation.success) {
      return err(profileValidation.error);
    }

    const now = new Date();
    const props: UserProps = {
      id: UserId.generate(),
      email: emailResult.data,
      passwordHash: createProps.passwordHash,
      profile: createProps.profile,
      type: createProps.type,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    // Retornar la clase concreta basada en el tipo
    switch (createProps.type) {
      case UserType.CLIENT:
        // Esto se implementará en ClientUser
        throw new Error('ClientUser creation not implemented yet');
      case UserType.PROVIDER:
        // Esto se implementará en ProviderUser
        throw new Error('ProviderUser creation not implemented yet');
      default:
        return err(DomainError.create('INVALID_USER_TYPE', 'Invalid user type provided'));
    }
  }

  /**
   * Valida que el hash de password tenga el formato correcto
   */
  private static validatePasswordHash(passwordHash: string): Result<void, DomainError> {
    if (!passwordHash || passwordHash.trim().length === 0) {
      return err(DomainError.create(DomainErrorCodes.INVALID_PASSWORD, 'Password hash cannot be empty'));
    }

    // Validar que parezca un hash válido (por ejemplo, bcrypt empieza con $2)
    if (passwordHash.length < 20) {
      return err(DomainError.create(DomainErrorCodes.INVALID_PASSWORD, 'Password hash appears to be invalid'));
    }

    return ok(undefined);
  }

  /**
   * Valida la información del perfil del usuario
   */
  private static validateProfile(profile: UserProfile): Result<void, DomainError> {
    if (!profile.firstName || profile.firstName.trim().length === 0) {
      return err(DomainError.validation('First name is required'));
    }

    if (!profile.lastName || profile.lastName.trim().length === 0) {
      return err(DomainError.validation('Last name is required'));
    }

    if (profile.firstName.length > 50) {
      return err(DomainError.validation('First name is too long'));
    }

    if (profile.lastName.length > 50) {
      return err(DomainError.validation('Last name is too long'));
    }

    // Validar teléfono si está presente
    if (profile.phone && profile.phone.trim().length > 0) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(profile.phone.replace(/[\s-()]/g, ''))) {
        return err(DomainError.validation('Invalid phone number format'));
      }
    }

    return ok(undefined);
  }

  // =============
  // Getters públicos (interfaz inmutable)
  // =============

  get id(): UserId {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get profile(): UserProfile {
    return { ...this.props.profile }; // Copia defensiva
  }

  get type(): UserType {
    return this.props.type;
  }

  get isActive(): boolean {
    return this.props.isActive;
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
   * Actualiza el perfil del usuario
   */
  public updateProfile(newProfile: Partial<UserProfile>): Result<void, DomainError> {
    const updatedProfile = { ...this.props.profile, ...newProfile };
    
    const validation = User.validateProfile(updatedProfile);
    if (!validation.success) {
      return err(validation.error);
    }

    this.props.profile = updatedProfile;
    this.props.updatedAt = new Date();
    
    return ok(undefined);
  }

  /**
   * Desactiva el usuario
   */
  public deactivate(): Result<void, DomainError> {
    if (!this.props.isActive) {
      return err(DomainError.domainRule('User is already deactivated'));
    }

    this.props.isActive = false;
    this.props.updatedAt = new Date();
    
    return ok(undefined);
  }

  /**
   * Reactiva el usuario
   */
  public reactivate(): Result<void, DomainError> {
    if (this.props.isActive) {
      return err(DomainError.domainRule('User is already active'));
    }

    this.props.isActive = true;
    this.props.updatedAt = new Date();
    
    return ok(undefined);
  }

  /**
   * Actualiza el hash de password
   */
  public updatePasswordHash(newPasswordHash: string): Result<void, DomainError> {
    const validation = User.validatePasswordHash(newPasswordHash);
    if (!validation.success) {
      return err(validation.error);
    }

    this.props.passwordHash = newPasswordHash;
    this.props.updatedAt = new Date();
    
    return ok(undefined);
  }

  /**
   * Verifica si el usuario puede realizar una acción específica
   */
  public canPerformAction(action: string): boolean {
    if (!this.props.isActive) {
      return false;
    }

    // Las reglas específicas de autorización se implementarán en las clases derivadas
    return true;
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  public getFullName(): string {
    return `${this.props.profile.firstName} ${this.props.profile.lastName}`.trim();
  }

  /**
   * Obtiene información básica del usuario para logs
   */
  public getLogInfo(): string {
    return `${this.constructor.name}(${this.props.id.getValue()}, ${this.props.email.toCensoredString()})`;
  }

  // =============
  // Métodos para igualdad
  // =============

  /**
   * Compara dos usuarios por ID
   */
  public equals(other: User): boolean {
    return this.props.id.equals(other.props.id);
  }
}