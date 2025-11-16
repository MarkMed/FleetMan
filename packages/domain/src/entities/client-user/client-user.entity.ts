import { Result, ok, err, DomainError } from '../../errors';
import { User, UserType, UserProfile, CreateUserProps, UserEntityData } from '../user/user.entity';
import { MachineId } from '../../value-objects/machine-id.vo';

/**
 * Niveles de suscripción para ClientUser
 */
export enum SubscriptionLevel {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

/**
 * Información de la empresa del cliente
 */
export interface CompanyInfo {
  name: string;
  industry?: string;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';
  taxId?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

/**
 * Propiedades específicas para crear un ClientUser
 */
export interface CreateClientUserProps extends Omit<CreateUserProps, 'type'> {
  subscriptionLevel?: SubscriptionLevel;
  companyInfo?: CompanyInfo;
}

/**
 * Propiedades internas específicas de ClientUser
 */
interface ClientUserProps {
  ownedMachineIds: MachineId[];
  subscriptionLevel: SubscriptionLevel;
  companyInfo?: CompanyInfo;
}

/**
 * ClientUser - Usuario final que posee y gestiona una flota de máquinas
 * Extiende User agregando funcionalidad específica para clientes que poseen equipos
 */
export class ClientUser extends User {
  private clientProps: ClientUserProps;

  private constructor(userProps: any, clientProps: ClientUserProps) {
    super(userProps);
    this.clientProps = clientProps;
  }

  /**
   * Reconstruye ClientUser desde datos persistidos (para repository)
   * @param data - Datos de la entidad desde base de datos
   * @returns Result con ClientUser reconstruido
   */
  public static fromEntityData(data: any): Result<ClientUser, DomainError> {
    // Usar el método de reconstrucción de la clase base
    const userPropsResult = User.reconstructUserProps(data);
    if (!userPropsResult.success) {
      return err(userPropsResult.error);
    }

    // Construir props específicas del cliente (con defaults seguros)
    const clientProps: ClientUserProps = {
      ownedMachineIds: [],
      subscriptionLevel: data.subscriptionLevel || SubscriptionLevel.BASIC,
      companyInfo: data.companyInfo || undefined,
    };

    return ok(new ClientUser(userPropsResult.data, clientProps));
  }

  /**
   * Crea un nuevo ClientUser con validaciones de dominio
   * Usa el factory method polimórfico de la clase base User
   * @param createProps - Propiedades para crear el cliente
   * @returns Result con ClientUser válido o error de dominio
   */
  public static create(createProps: CreateClientUserProps): Result<ClientUser, DomainError> {
    // Validar información de la empresa si está presente
    if (createProps.companyInfo) {
      const companyValidation = ClientUser.validateCompanyInfo(createProps.companyInfo);
      if (!companyValidation.success) {
        return err(companyValidation.error);
      }
    }

    // Usar el factory method protegido de la clase base User
    const userPropsResult = User.createUserProps({
      email: createProps.email,
      passwordHash: createProps.passwordHash,
      profile: createProps.profile,
      type: 'CLIENT'
    });

    if (!userPropsResult.success) {
      return err(userPropsResult.error);
    }

    // Construir props específicas del cliente
    const clientProps: ClientUserProps = {
      ownedMachineIds: [],
      subscriptionLevel: createProps.subscriptionLevel || SubscriptionLevel.BASIC,
      companyInfo: createProps.companyInfo,
    };

    return ok(new ClientUser(userPropsResult.data, clientProps));
  }

  /**
   * Valida la información de la empresa
   */
  private static validateCompanyInfo(companyInfo: CompanyInfo): Result<void, DomainError> {
    if (!companyInfo.name || companyInfo.name.trim().length === 0) {
      return err(DomainError.validation('Company name is required'));
    }

    if (companyInfo.name.length > 100) {
      return err(DomainError.validation('Company name is too long'));
    }

    // Validar taxId si está presente
    if (companyInfo.taxId && companyInfo.taxId.trim().length > 0) {
      if (companyInfo.taxId.length > 20) {
        return err(DomainError.validation('Tax ID is too long'));
      }
    }

    return ok(undefined);
  }

  // =============
  // Getters públicos específicos de ClientUser
  // =============

  get ownedMachineIds(): MachineId[] {
    return [...this.clientProps.ownedMachineIds]; // Copia defensiva
  }

  get subscriptionLevel(): SubscriptionLevel {
    return this.clientProps.subscriptionLevel;
  }

  get companyInfo(): CompanyInfo | undefined {
    return this.clientProps.companyInfo ? { ...this.clientProps.companyInfo } : undefined;
  }

  get machineCount(): number {
    return this.clientProps.ownedMachineIds.length;
  }

  // =============
  // Métodos de negocio específicos de ClientUser
  // =============

  /**
   * Registra una nueva máquina bajo la propiedad de este cliente
   */
  public addMachine(machineId: MachineId): Result<void, DomainError> {
    if (!this.isActive) {
      return err(DomainError.domainRule('Cannot add machine to inactive user'));
    }

    // Verificar que no esté ya registrada
    const alreadyOwned = this.clientProps.ownedMachineIds.some(id => id.equals(machineId));
    if (alreadyOwned) {
      return err(DomainError.conflict('Machine is already owned by this user'));
    }

    // Verificar límites según suscripción
    const maxMachines = this.getMaxMachinesForSubscription();
    if (this.clientProps.ownedMachineIds.length >= maxMachines) {
      return err(DomainError.domainRule(`Subscription level ${this.clientProps.subscriptionLevel} allows maximum ${maxMachines} machines`));
    }

    this.clientProps.ownedMachineIds.push(machineId);
    return ok(undefined);
  }

  /**
   * Remueve una máquina de la propiedad de este cliente
   */
  public removeMachine(machineId: MachineId): Result<void, DomainError> {
    const index = this.clientProps.ownedMachineIds.findIndex(id => id.equals(machineId));
    
    if (index === -1) {
      return err(DomainError.notFound('Machine not found in user\'s owned machines'));
    }

    this.clientProps.ownedMachineIds.splice(index, 1);
    return ok(undefined);
  }

  /**
   * Actualiza el nivel de suscripción del cliente
   */
  public upgradeSubscription(newLevel: SubscriptionLevel): Result<void, DomainError> {
    if (!this.isActive) {
      return err(DomainError.domainRule('Cannot upgrade subscription for inactive user'));
    }

    // Verificar que sea un upgrade válido
    const currentPriority = this.getSubscriptionPriority(this.clientProps.subscriptionLevel);
    const newPriority = this.getSubscriptionPriority(newLevel);

    if (newPriority <= currentPriority) {
      return err(DomainError.domainRule('New subscription level must be higher than current level'));
    }

    this.clientProps.subscriptionLevel = newLevel;
    return ok(undefined);
  }

  /**
   * Actualiza la información de la empresa
   */
  public updateCompanyInfo(companyInfo: CompanyInfo): Result<void, DomainError> {
    const validation = ClientUser.validateCompanyInfo(companyInfo);
    if (!validation.success) {
      return err(validation.error);
    }

    this.clientProps.companyInfo = { ...companyInfo };
    return ok(undefined);
  }

  /**
   * Verifica si el cliente puede agregar más máquinas
   */
  public canAddMoreMachines(): boolean {
    const maxMachines = this.getMaxMachinesForSubscription();
    return this.clientProps.ownedMachineIds.length < maxMachines;
  }

  /**
   * Verifica si el cliente posee una máquina específica
   */
  public ownsMachine(machineId: MachineId): boolean {
    return this.clientProps.ownedMachineIds.some(id => id.equals(machineId));
  }

  /**
   * Obtiene estadísticas básicas del cliente
   */
  public getStats(): {
    totalMachines: number;
    subscriptionLevel: string;
    maxMachinesAllowed: number;
    remainingSlots: number;
  } {
    const maxMachines = this.getMaxMachinesForSubscription();
    return {
      totalMachines: this.clientProps.ownedMachineIds.length,
      subscriptionLevel: this.clientProps.subscriptionLevel,
      maxMachinesAllowed: maxMachines,
      remainingSlots: maxMachines - this.clientProps.ownedMachineIds.length,
    };
  }

  // =============
  // Métodos auxiliares privados
  // =============

  /**
   * Obtiene el número máximo de máquinas permitidas según la suscripción
   */
  private getMaxMachinesForSubscription(): number {
    switch (this.clientProps.subscriptionLevel) {
      case SubscriptionLevel.BASIC:
        return 5;
      case SubscriptionLevel.PREMIUM:
        return 25;
      case SubscriptionLevel.ENTERPRISE:
        return 1000;
      default:
        return 5;
    }
  }

  /**
   * Obtiene la prioridad numérica de un nivel de suscripción
   */
  private getSubscriptionPriority(level: SubscriptionLevel): number {
    switch (level) {
      case SubscriptionLevel.BASIC:
        return 1;
      case SubscriptionLevel.PREMIUM:
        return 2;
      case SubscriptionLevel.ENTERPRISE:
        return 3;
      default:
        return 0;
    }
  }

  /**
   * Override del método de información para logs incluyendo datos de cliente
   */
  public getLogInfo(): string {
    const baseInfo = super.getLogInfo();
    return `${baseInfo} [Machines: ${this.machineCount}, Subscription: ${this.clientProps.subscriptionLevel}]`;
  }
}