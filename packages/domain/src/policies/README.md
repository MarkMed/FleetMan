# 📋 Policies - Reglas de Negocio Complejas

## 📋 **Propósito**
Las **Policies** encapsulan reglas de negocio complejas que determinan **cuándo** y **cómo** se pueden realizar ciertas operaciones. Implementan lógica condicional sofisticada que va más allá de las validaciones simples de entidades.

## 📁 **Estructura Propuesta**
```
policies/
├── machine/
│   ├── provider-assignment.policy.ts        ⏳
│   ├── status-transition.policy.ts          ⏳
│   ├── maintenance-window.policy.ts         ⏳
│   └── index.ts                             ⏳
├── user/
│   ├── provider-promotion.policy.ts         ⏳
│   ├── machine-access.policy.ts             ⏳
│   └── index.ts                             ⏳
├── machine-type/
│   ├── deactivation.policy.ts               ⏳
│   ├── compatibility.policy.ts              ⏳
│   └── index.ts                             ⏳
└── index.ts                                 ← Exportaciones centralizadas ⏳
```

## 🎯 **¿Qué es una Policy?**

### **🧠 Definición:**
Una **Policy** es una regla de negocio compleja que determina si una operación está permitida en un contexto específico. A diferencia de las validaciones simples, las policies evalúan múltiples factores y condiciones.

### **🎯 Características:**
- **📊 Evaluación Contextual** - Considera estado actual y histórico
- **🔄 Lógica Compleja** - Múltiples condiciones y criterios
- **🎭 Reutilizable** - Se aplica en diferentes casos de uso
- **📋 Explicativa** - Proporciona razones claras de por qué algo está permitido/prohibido

## 🔧 **Patrón de Implementación**

### **🏗️ Policy Base:**
```typescript
export abstract class Policy<TContext, TResult = void> {
  abstract evaluate(context: TContext): Promise<Result<PolicyDecision<TResult>, DomainError>>;
}

export class PolicyDecision<TResult = void> {
  constructor(
    public readonly isAllowed: boolean,
    public readonly reason: string,
    public readonly data?: TResult,
    public readonly conditions?: string[]
  ) {}

  static allow<T>(reason: string, data?: T, conditions?: string[]): PolicyDecision<T> {
    return new PolicyDecision(true, reason, data, conditions);
  }

  static deny(reason: string, conditions?: string[]): PolicyDecision {
    return new PolicyDecision(false, reason, undefined, conditions);
  }
}
```

### **🎯 Policy Específica:**
```typescript
export interface ProviderAssignmentContext {
  machine: Machine;
  providerId: UserId;
  assignedBy: UserId;
  assignmentDate: Date;
}

export class ProviderAssignmentPolicy extends Policy<ProviderAssignmentContext> {
  constructor(
    private userRepo: IUserRepository,
    private machineRepo: IMachineRepository
  ) {
    super();
  }

  async evaluate(context: ProviderAssignmentContext): Promise<Result<PolicyDecision, DomainError>> {
    // 1. Verificar estado de la máquina
    const machineStatusCheck = this.checkMachineStatus(context.machine);
    if (!machineStatusCheck.isAllowed) {
      return ok(machineStatusCheck);
    }

    // 2. Verificar capacidad del proveedor
    const providerCapacityCheck = await this.checkProviderCapacity(context.providerId);
    if (!providerCapacityCheck.success) return err(providerCapacityCheck.error);
    if (!providerCapacityCheck.data.isAllowed) {
      return ok(providerCapacityCheck.data);
    }

    // 3. Verificar compatibilidad geográfica
    const locationCheck = await this.checkGeographicCompatibility(context);
    if (!locationCheck.success) return err(locationCheck.error);
    if (!locationCheck.data.isAllowed) {
      return ok(locationCheck.data);
    }

    // 4. Verificar restricciones de tiempo
    const timeCheck = this.checkTimeRestrictions(context.assignmentDate);
    if (!timeCheck.isAllowed) {
      return ok(timeCheck);
    }

    // ✅ Todo OK - permitir asignación
    return ok(PolicyDecision.allow(
      'Provider assignment is allowed',
      undefined,
      [
        'Machine is operational',
        'Provider has capacity',
        'Geographic compatibility verified',
        'Time restrictions satisfied'
      ]
    ));
  }

  private checkMachineStatus(machine: Machine): PolicyDecision {
    if (machine.isRetired()) {
      return PolicyDecision.deny('Cannot assign provider to retired machine');
    }

    if (!machine.isOperational()) {
      return PolicyDecision.deny(
        'Machine must be operational for provider assignment',
        ['Current status: ' + machine.status.displayName]
      );
    }

    if (machine.hasAssignedProvider()) {
      return PolicyDecision.deny(
        'Machine already has an assigned provider',
        ['Current provider: ' + machine.assignedProviderId?.getValue()]
      );
    }

    return PolicyDecision.allow('Machine status allows provider assignment');
  }

  private async checkProviderCapacity(providerId: UserId): Promise<Result<PolicyDecision, DomainError>> {
    const providerResult = await this.userRepo.findById(providerId);
    if (!providerResult.success) return err(providerResult.error);

    const provider = providerResult.data;
    if (!provider.isProvider()) {
      return ok(PolicyDecision.deny('User is not a registered provider'));
    }

    const assignedMachines = await this.machineRepo.countByProvider(providerId);
    if (!assignedMachines.success) return err(assignedMachines.error);

    const maxCapacity = provider.getMaxMachineCapacity();
    if (assignedMachines.data >= maxCapacity) {
      return ok(PolicyDecision.deny(
        `Provider has reached maximum capacity (${maxCapacity} machines)`,
        [`Currently assigned: ${assignedMachines.data} machines`]
      ));
    }

    return ok(PolicyDecision.allow(
      `Provider has capacity for additional machines (${assignedMachines.data}/${maxCapacity})`
    ));
  }

  private async checkGeographicCompatibility(
    context: ProviderAssignmentContext
  ): Promise<Result<PolicyDecision, DomainError>> {
    const machine = context.machine;
    const machineLocation = machine.location;

    if (!machineLocation?.coordinates) {
      return ok(PolicyDecision.allow('No geographic restrictions (machine location unknown)'));
    }

    const providerResult = await this.userRepo.findById(context.providerId);
    if (!providerResult.success) return err(providerResult.error);

    const provider = providerResult.data;
    const serviceRadius = provider.getServiceRadius();

    if (!serviceRadius) {
      return ok(PolicyDecision.allow('Provider has no geographic restrictions'));
    }

    const distance = this.calculateDistance(
      machineLocation.coordinates,
      provider.getLocation()
    );

    if (distance > serviceRadius) {
      return ok(PolicyDecision.deny(
        `Machine is outside provider's service radius`,
        [
          `Distance: ${distance.toFixed(2)} km`,
          `Service radius: ${serviceRadius} km`
        ]
      ));
    }

    return ok(PolicyDecision.allow(
      `Machine is within provider's service radius (${distance.toFixed(2)} km of ${serviceRadius} km)`
    ));
  }

  private checkTimeRestrictions(assignmentDate: Date): PolicyDecision {
    const hour = assignmentDate.getHours();
    const dayOfWeek = assignmentDate.getDay();

    // No asignaciones en domingo
    if (dayOfWeek === 0) {
      return PolicyDecision.deny('Provider assignments are not allowed on Sundays');
    }

    // Solo horario laboral (8 AM - 6 PM)
    if (hour < 8 || hour >= 18) {
      return PolicyDecision.deny(
        'Provider assignments are only allowed during business hours (8 AM - 6 PM)',
        [`Current time: ${hour}:00`]
      );
    }

    return PolicyDecision.allow('Assignment time is within business hours');
  }

  private calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    // Implementación de fórmula de distancia (Haversine)
    // ... cálculo real aquí
    return 0; // Placeholder
  }
}
```

## 💡 **Beneficios del Sistema**

### **🧩 Separación de Responsabilidades:**
```typescript
// ✅ Entidad: Lógica simple de estado
export class Machine {
  public assignProvider(providerId: UserId): Result<void, DomainError> {
    // Solo validaciones básicas de estado interno
    if (this.props.assignedProviderId) {
      return err(DomainError.domainRule('Provider already assigned'));
    }
    
    this.props.assignedProviderId = providerId;
    return ok(undefined);
  }
}

// ✅ Policy: Lógica compleja de reglas de negocio
export class ProviderAssignmentPolicy {
  async evaluate(context: ProviderAssignmentContext): Promise<Result<PolicyDecision, DomainError>> {
    // Evaluación compleja con múltiples factores externos
  }
}

// ✅ Application Service: Orquestación
export class AssignProviderHandler {
  async handle(command: AssignProviderCommand): Promise<Result<void, ApplicationError>> {
    // 1. Aplicar policy
    const policyResult = await this.providerAssignmentPolicy.evaluate(context);
    if (!policyResult.success) return err(ApplicationError.fromDomain(policyResult.error));
    if (!policyResult.data.isAllowed) {
      return err(ApplicationError.policyViolation(policyResult.data.reason));
    }
    
    // 2. Ejecutar operación
    const assignResult = machine.assignProvider(command.providerId);
    // ...
  }
}
```

### **🔄 Reutilización en Múltiples Contextos:**
```typescript
// ✅ Misma policy usada en diferentes casos de uso
export class BulkAssignProviderHandler {
  async handle(command: BulkAssignCommand): Promise<Result<BulkAssignResult, ApplicationError>> {
    const results: AssignmentResult[] = [];
    
    for (const assignment of command.assignments) {
      // ✅ Reutilizar la misma policy
      const policyResult = await this.providerAssignmentPolicy.evaluate({
        machine: assignment.machine,
        providerId: assignment.providerId,
        assignedBy: command.userId,
        assignmentDate: new Date()
      });
      
      results.push({
        machineId: assignment.machine.id,
        allowed: policyResult.success && policyResult.data.isAllowed,
        reason: policyResult.success ? policyResult.data.reason : policyResult.error.message
      });
    }
    
    return ok(new BulkAssignResult(results));
  }
}

export class ScheduledAssignmentService {
  async processScheduledAssignments(): Promise<void> {
    const scheduled = await this.getScheduledAssignments();
    
    for (const assignment of scheduled) {
      // ✅ Misma policy para asignaciones programadas
      const policyResult = await this.providerAssignmentPolicy.evaluate(assignment);
      
      if (policyResult.success && policyResult.data.isAllowed) {
        await this.executeAssignment(assignment);
      } else {
        await this.postponeAssignment(assignment, policyResult.data?.reason);
      }
    }
  }
}
```

### **🧪 Testing Granular:**
```typescript
describe('ProviderAssignmentPolicy', () => {
  let policy: ProviderAssignmentPolicy;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockMachineRepo: jest.Mocked<IMachineRepository>;

  beforeEach(() => {
    mockUserRepo = createMockUserRepository();
    mockMachineRepo = createMockMachineRepository();
    policy = new ProviderAssignmentPolicy(mockUserRepo, mockMachineRepo);
  });

  describe('machine status validation', () => {
    it('should deny assignment to retired machine', async () => {
      const context = createContext({
        machine: createRetiredMachine()
      });

      const result = await policy.evaluate(context);

      expect(result.success).toBe(true);
      expect(result.data.isAllowed).toBe(false);
      expect(result.data.reason).toContain('retired machine');
    });

    it('should allow assignment to operational machine', async () => {
      mockUserRepo.findById.mockResolvedValue(ok(createProviderWithCapacity()));
      mockMachineRepo.countByProvider.mockResolvedValue(ok(2));

      const context = createContext({
        machine: createOperationalMachine()
      });

      const result = await policy.evaluate(context);

      expect(result.success).toBe(true);
      expect(result.data.isAllowed).toBe(true);
    });
  });

  describe('provider capacity validation', () => {
    it('should deny assignment when provider at capacity', async () => {
      mockUserRepo.findById.mockResolvedValue(ok(createProviderWithCapacity(5)));
      mockMachineRepo.countByProvider.mockResolvedValue(ok(5)); // At capacity

      const context = createContext();

      const result = await policy.evaluate(context);

      expect(result.success).toBe(true);
      expect(result.data.isAllowed).toBe(false);
      expect(result.data.reason).toContain('maximum capacity');
    });
  });

  describe('geographic compatibility', () => {
    it('should deny assignment outside service radius', async () => {
      mockUserRepo.findById.mockResolvedValue(ok(createProviderWithLocation({
        lat: 40.7128,
        lng: -74.0060,
        serviceRadius: 50 // 50 km radius
      })));

      const context = createContext({
        machine: createMachineWithLocation({
          lat: 41.8781, // Chicago - ~1000km from NYC
          lng: -87.6298
        })
      });

      const result = await policy.evaluate(context);

      expect(result.success).toBe(true);
      expect(result.data.isAllowed).toBe(false);
      expect(result.data.reason).toContain('outside provider\'s service radius');
    });
  });
});
```

## 🔮 **Policies Adicionales**

### **🔄 Status Transition Policy:**
```typescript
export class StatusTransitionPolicy extends Policy<StatusTransitionContext> {
  async evaluate(context: StatusTransitionContext): Promise<Result<PolicyDecision, DomainError>> {
    const { machine, fromStatus, toStatus, requestedBy, reason } = context;

    // 1. Verificar transición válida
    if (!fromStatus.canTransitionTo(toStatus)) {
      return ok(PolicyDecision.deny(`Invalid transition from ${fromStatus.displayName} to ${toStatus.displayName}`));
    }

    // 2. Verificar permisos del usuario
    const permissionCheck = await this.checkUserPermissions(requestedBy, machine, toStatus);
    if (!permissionCheck.success) return err(permissionCheck.error);
    if (!permissionCheck.data.isAllowed) return ok(permissionCheck.data);

    // 3. Verificar restricciones específicas del estado
    const stateSpecificCheck = await this.checkStateSpecificRestrictions(context);
    if (!stateSpecificCheck.success) return err(stateSpecificCheck.error);
    if (!stateSpecificCheck.data.isAllowed) return ok(stateSpecificCheck.data);

    return ok(PolicyDecision.allow('Status transition is allowed'));
  }

  private async checkStateSpecificRestrictions(context: StatusTransitionContext): Promise<Result<PolicyDecision, DomainError>> {
    const { machine, toStatus } = context;

    switch (toStatus.code) {
      case 'MAINTENANCE':
        // Verificar que no haya trabajos activos
        const activeJobs = await this.jobRepo.findActiveMachineJobs(machine.id);
        if (!activeJobs.success) return err(activeJobs.error);
        if (activeJobs.data.length > 0) {
          return ok(PolicyDecision.deny(
            'Cannot transition to maintenance while machine has active jobs',
            [`Active jobs: ${activeJobs.data.length}`]
          ));
        }
        break;

      case 'RETIRED':
        // Verificar que no haya contratos activos
        const activeContracts = await this.contractRepo.findActiveMachineContracts(machine.id);
        if (!activeContracts.success) return err(activeContracts.error);
        if (activeContracts.data.length > 0) {
          return ok(PolicyDecision.deny(
            'Cannot retire machine with active contracts',
            [`Active contracts: ${activeContracts.data.length}`]
          ));
        }
        break;
    }

    return ok(PolicyDecision.allow('State-specific restrictions satisfied'));
  }
}
```

### **👤 Provider Promotion Policy:**
```typescript
export class ProviderPromotionPolicy extends Policy<ProviderPromotionContext> {
  async evaluate(context: ProviderPromotionContext): Promise<Result<PolicyDecision, DomainError>> {
    const { user, certifications, requestedBy } = context;

    // 1. Verificar que el usuario es elegible
    const eligibilityCheck = this.checkUserEligibility(user);
    if (!eligibilityCheck.isAllowed) return ok(eligibilityCheck);

    // 2. Verificar certificaciones requeridas
    const certificationCheck = this.checkRequiredCertifications(certifications);
    if (!certificationCheck.isAllowed) return ok(certificationCheck);

    // 3. Verificar historial del usuario
    const historyCheck = await this.checkUserHistory(user.id);
    if (!historyCheck.success) return err(historyCheck.error);
    if (!historyCheck.data.isAllowed) return ok(historyCheck.data);

    // 4. Verificar límites del sistema
    const systemLimitsCheck = await this.checkSystemLimits();
    if (!systemLimitsCheck.success) return err(systemLimitsCheck.error);
    if (!systemLimitsCheck.data.isAllowed) return ok(systemLimitsCheck.data);

    return ok(PolicyDecision.allow('User promotion to provider is allowed'));
  }

  private checkRequiredCertifications(certifications: Certification[]): PolicyDecision {
    const required = ['BASIC_SAFETY', 'EQUIPMENT_OPERATION'];
    const provided = certifications.map(cert => cert.type);
    const missing = required.filter(req => !provided.includes(req));

    if (missing.length > 0) {
      return PolicyDecision.deny(
        'Missing required certifications for provider status',
        [`Missing: ${missing.join(', ')}`]
      );
    }

    return PolicyDecision.allow('All required certifications provided');
  }
}
```

## 🎯 **Reglas de Oro**

1. **🎯 Una Policy = Una Decisión** - Evalúa un solo tipo de operación
2. **📊 Contextual** - Considera estado actual y factores externos
3. **📋 Explicativa** - Siempre proporciona razón clara
4. **🔄 Stateless** - No mantiene estado entre evaluaciones
5. **🧪 Testeable** - Fácil de unit test con mocks
6. **⚡ Async cuando necesario** - Para consultas a repositorios
7. **🚫 Sin Efectos Secundarios** - Solo evalúa, no modifica

## 📚 **Uso en Application Layer**

```typescript
export class AssignProviderHandler {
  constructor(
    private machineRepo: IMachineRepository,
    private providerAssignmentPolicy: ProviderAssignmentPolicy,
    private eventDispatcher: IEventDispatcher
  ) {}

  async handle(command: AssignProviderCommand): Promise<Result<void, ApplicationError>> {
    // 1. Obtener entidades
    const machineResult = await this.machineRepo.findById(command.machineId);
    if (!machineResult.success) return err(ApplicationError.fromDomain(machineResult.error));

    // 2. ✅ Evaluar policy ANTES de modificar entidades
    const policyContext: ProviderAssignmentContext = {
      machine: machineResult.data,
      providerId: command.providerId,
      assignedBy: command.userId,
      assignmentDate: new Date()
    };

    const policyResult = await this.providerAssignmentPolicy.evaluate(policyContext);
    if (!policyResult.success) {
      return err(ApplicationError.fromDomain(policyResult.error));
    }

    if (!policyResult.data.isAllowed) {
      return err(ApplicationError.policyViolation(policyResult.data.reason));
    }

    // 3. Solo si policy permite, ejecutar operación
    const assignResult = machineResult.data.assignProvider(command.providerId);
    if (!assignResult.success) {
      return err(ApplicationError.fromDomain(assignResult.error));
    }

    // 4. Persistir y disparar eventos
    const saveResult = await this.machineRepo.save(machineResult.data);
    if (!saveResult.success) {
      return err(ApplicationError.fromDomain(saveResult.error));
    }

    const events = machineResult.data.getDomainEvents();
    await this.eventDispatcher.dispatchAll(events);
    machineResult.data.clearDomainEvents();

    return ok(undefined);
  }
}
```

---

> 💡 **Recuerda**: Las Policies son los **guardianes** del dominio. Evalúan si las operaciones están permitidas considerando el contexto completo del negocio, no solo el estado interno de las entidades.