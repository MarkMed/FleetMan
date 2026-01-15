import { Result, ok, err, DomainError, DomainErrorCodes } from '../../errors';
import { UserId } from '../../value-objects/user-id.vo';
import { Email } from '../../value-objects/email.vo';
import { IUser, UserType, IUserProfile } from '../../models';

/**
 * Tipos de usuario en el sistema
 */
export { UserType } from '../../models';

/**
 * Información del perfil de usuario
 * Los usuarios representan empresas/compañías, no personas individuales
 */
export interface UserProfile extends IUserProfile {}

// Re-export for backwards compatibility
export { IUserProfile };

/**
 * Propiedades para CREAR un usuario
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
 * Datos para reconstruir una entidad User desde persistencia
 * Representa los datos raw que vienen de la base de datos
 */
export type UserEntityData = Omit<UserProps, 'id' | 'email' | 'createdAt' | 'updatedAt'> & {
  id: string;              // Raw string desde MongoDB
  email: string;           // Raw string desde MongoDB
  createdAt: Date | string; // Puede venir como string desde JSON
  updatedAt: Date | string; // Puede venir como string desde JSON
};

/**
 * Entidad base abstracta User
 * Representa la identidad y autenticación base para todos los usuarios del sistema
 * 
 * Esta clase no se puede instanciar directamente. Use las clases derivadas:
 * - ClientUser para usuarios tipo CLIENT
 * - ProviderUser para usuarios tipo PROVIDER
 * 
 * Las clases derivadas deben implementar su propio método create() que use createUserProps()
 */
export abstract class User {
  protected constructor(protected props: UserProps) {}

  /**
   * Método factory protegido para ser usado por las clases derivadas
   * Valida y construye las props básicas del usuario
   * 
   * Ejemplo de uso en una clase derivada:
   * 
   * ```typescript
   * export class ClientUser extends User {
   *   static create(createProps: CreateClientUserProps): Result<ClientUser, DomainError> {
   *     // Validaciones específicas de ClientUser aquí...
   *     
   *     const userPropsResult = User.createUserProps({
   *       email: createProps.email,
   *       passwordHash: createProps.passwordHash,
   *       profile: createProps.profile,
   *       type: UserType.CLIENT
   *     });
   *     
   *     if (!userPropsResult.success) {
   *       return err(userPropsResult.error);
   *     }
   *     
   *     return ok(new ClientUser(userPropsResult.data));
   *   }
   * }
   * ```
   */
  protected static createUserProps(createProps: CreateUserProps): Result<UserProps, DomainError> {
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

    // Generar ID único
    const userIdResult = UserId.create(`user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    if (!userIdResult.success) {
      return err(DomainError.create('USER_ID_GENERATION_FAILED', 'Failed to generate user ID'));
    }

    const now = new Date();
    const props: UserProps = {
      id: userIdResult.data,
      email: emailResult.data,
      passwordHash: createProps.passwordHash,
      profile: createProps.profile,
      type: createProps.type,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    return ok(props);
  }

  /**
   * Reconstruye UserProps desde datos persistidos (para repository)
   * No realiza validaciones de negocio, solo conversión de tipos
   */
  protected static reconstructUserProps(data: UserEntityData): Result<UserProps, DomainError> {
    try {
      // Reconstruir UserId desde string
      const userIdResult = UserId.create(data.id);
      if (!userIdResult.success) {
        return err(userIdResult.error);
      }

      // Reconstruir Email desde string
      const emailResult = Email.create(data.email);
      if (!emailResult.success) {
        return err(emailResult.error);
      }

      // Convertir fechas desde strings si es necesario
      const createdAt = typeof data.createdAt === 'string' 
        ? new Date(data.createdAt) 
        : data.createdAt;
      const updatedAt = typeof data.updatedAt === 'string' 
        ? new Date(data.updatedAt) 
        : data.updatedAt;

      const props: UserProps = {
        id: userIdResult.data,
        email: emailResult.data,
        passwordHash: data.passwordHash,
        profile: { ...data.profile },
        type: data.type,
        isActive: data.isActive,
        createdAt,
        updatedAt,
      };

      return ok(props);
    } catch (error) {
      return err(DomainError.create('ENTITY_RECONSTRUCTION_ERROR', 
        `Failed to reconstruct User entity: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Valida que el hash de password tenga el formato correcto
   */
  protected static validatePasswordHash(passwordHash: string): Result<void, DomainError> {
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
  protected static validateProfile(profile: UserProfile): Result<void, DomainError> {
    // Validar companyName si está presente
    if (profile.companyName !== undefined) {
      if (profile.companyName.trim().length === 0) {
        return err(DomainError.validation('Company name cannot be empty when provided'));
      }
      if (profile.companyName.length > 100) {
        return err(DomainError.validation('Company name is too long (max 100 characters)'));
      }
    }

    // Validar address si está presente
    if (profile.address !== undefined) {
      if (profile.address.trim().length === 0) {
        return err(DomainError.validation('Address cannot be empty when provided'));
      }
      if (profile.address.length > 200) {
        return err(DomainError.validation('Address is too long (max 200 characters)'));
      }
    }

    // Validar teléfono si está presente
    if (profile.phone && profile.phone.trim().length > 0) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(profile.phone.replace(/[\s-()]/g, ''))) {
        return err(DomainError.validation('Invalid phone number format'));
      }
    }

    // 🆕 Sprint #13 Task 10.2: Validar bio si está presente
    if (profile.bio !== undefined) {
      if (profile.bio.trim().length === 0) {
        return err(DomainError.validation('Bio cannot be empty when provided'));
      }
      if (profile.bio.length > 500) {
        return err(DomainError.validation('Bio is too long (max 500 characters)'));
      }
    }

    // 🆕 Sprint #13 Task 10.2: Validar tags si está presente
    if (profile.tags !== undefined) {
      if (profile.tags.length > 5) {
        return err(DomainError.validation('Too many tags (max 5 tags)'));
      }
      
      // Validar cada tag individualmente
      for (const tag of profile.tags) {
        if (typeof tag !== 'string' || tag.trim().length === 0) {
          return err(DomainError.validation('Tags cannot be empty'));
        }
        if (tag.length > 100) {
          return err(DomainError.validation('Tag is too long (max 100 characters)'));
        }
      }
      
      // Validar que no haya tags duplicados (case-insensitive)
      const uniqueTags = new Set(profile.tags.map(t => t.toLowerCase().trim()));
      if (uniqueTags.size !== profile.tags.length) {
        return err(DomainError.validation('Duplicate tags are not allowed'));
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

    switch (action) {
      case 'login':
        return this.props.isActive;
      case 'api_access':
        return this.props.isActive;
      default:
        return true;
    }
  }

  /**
   * Obtiene el nombre para mostrar del usuario (empresa)
   * Usa companyName si está disponible, sino el email
   */
  public getDisplayName(): string {
    if (this.props.profile.companyName && this.props.profile.companyName.trim().length > 0) {
      return this.props.profile.companyName.trim();
    }
    return this.props.email.getValue();
  }

  /**
   * @deprecated Use getDisplayName() instead
   * Mantiene compatibilidad con código existente
   */
  public getFullName(): string {
    return this.getDisplayName();
  }

  /**
   * Obtiene el hash de password para verificación de autenticación
   * Solo debe ser usado por servicios de autenticación
   */
  public getPasswordHash(): string {
    return this.props.passwordHash;
  }

  /**
   * Convierte la entidad a datos públicos seguros (sin passwordHash)
   * Para respuestas de API y serialización
   */
  public toPublicData(): {
    id: string;
    email: string;
    profile: UserProfile;
    type: UserType;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  } {
    // Convertir readonly string[] a string[] para compatibilidad con contratos
    const profileCopy = { ...this.props.profile };
    if (profileCopy.tags) {
      (profileCopy as any).tags = [...profileCopy.tags]; // Cast de readonly a mutable
    }
    
    return {
      id: this.props.id.getValue(),
      email: this.props.email.getValue(),
      profile: profileCopy,
      type: this.props.type,
      isActive: this.props.isActive,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
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