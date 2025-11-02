# 🔔 Events - Sistema de Eventos del Dominio

## 📋 **Propósito**
Los **Domain Events** capturan y comunican cambios importantes que ocurren en el dominio, permitiendo reacciones desacopladas y manteniendo la separación de responsabilidades. Implementan el patrón **Event Sourcing** y **Event-Driven Architecture**.

## 📁 **Estructura Propuesta**
```
events/
├── base/
│   ├── domain-event.ts          ← Clase abstracta base ⏳
│   ├── domain-entity.ts         ← Entity base con eventos ⏳
│   └── index.ts                 ← Exportaciones base ⏳
├── machine/
│   ├── machine-provider-assigned.event.ts     ⏳
│   ├── machine-status-changed.event.ts        ⏳
│   ├── machine-specs-updated.event.ts         ⏳
│   ├── machine-props-updated.event.ts         ⏳
│   └── index.ts                 ← Exportaciones machine ⏳
├── machine-type/
│   ├── machine-type-created.event.ts          ⏳
│   ├── machine-type-activated.event.ts        ⏳
│   ├── machine-type-deactivated.event.ts      ⏳
│   └── index.ts                 ← Exportaciones machine-type ⏳
├── user/
│   ├── user-created.event.ts               ⏳
│   ├── user-upgraded-to-provider.event.ts  ⏳
│   └── index.ts                 ← Exportaciones user ⏳
└── index.ts                     ← Exportaciones centralizadas ⏳
```

## 🎯 **¿Cuándo Disparar Domain Events?**

### **✅ USAR Events para:**
- 🔄 **Cambios de estado importantes** en entidades
- 👥 **Asignaciones/Transferencias** entre usuarios
- 📊 **Métricas y Analytics** automáticos
- 📧 **Notificaciones** asíncronas
- 🔄 **Sincronización** con sistemas externos
- 📋 **Auditoría** automática de cambios

### **❌ NO usar Events para:**
- 🏠 **Validaciones simples** dentro de la entidad
- 🔧 **Operaciones síncronas** críticas
- 🎨 **Cambios de presentación** sin impacto de negocio
- 📝 **Logs técnicos** de debugging

## 🏗️ **Arquitectura Base**

### **🎯 Domain Event Abstracto:**
```typescript
export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly eventVersion: number;

  constructor(
    public readonly aggregateId: string,
    public readonly eventType: string,
    eventVersion: number = 1
  ) {
    this.eventId = this.generateEventId();
    this.occurredAt = new Date();
    this.eventVersion = eventVersion;
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Serialización para persistencia
  public toJSON(): Record<string, any> {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      aggregateId: this.aggregateId,
      occurredAt: this.occurredAt.toISOString(),
      eventVersion: this.eventVersion,
      payload: this.getPayload()
    };
  }

  protected abstract getPayload(): Record<string, any>;
}
```

### **🏠 Entity Base con Eventos:**
```typescript
export abstract class DomainEntity {
  private _domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  public hasEvents(): boolean {
    return this._domainEvents.length > 0;
  }
}
```

## 🎨 **Eventos Específicos del Dominio**

### **🔧 Machine Events:**
```typescript
export class MachineProviderAssignedEvent extends DomainEvent {
  constructor(
    public readonly machineId: MachineId,
    public readonly providerId: UserId,
    public readonly ownerId: UserId,
    public readonly assignedAt: Date,
    public readonly previousProviderId?: UserId
  ) {
    super(machineId.getValue(), 'MachineProviderAssigned');
  }

  protected getPayload(): Record<string, any> {
    return {
      machineId: this.machineId.getValue(),
      providerId: this.providerId.getValue(),
      ownerId: this.ownerId.getValue(),
      assignedAt: this.assignedAt.toISOString(),
      previousProviderId: this.previousProviderId?.getValue()
    };
  }
}

export class MachineStatusChangedEvent extends DomainEvent {
  constructor(
    public readonly machineId: MachineId,
    public readonly previousStatus: MachineStatusCode,
    public readonly newStatus: MachineStatusCode,
    public readonly changedAt: Date,
    public readonly reason?: string
  ) {
    super(machineId.getValue(), 'MachineStatusChanged');
  }

  protected getPayload(): Record<string, any> {
    return {
      machineId: this.machineId.getValue(),
      previousStatus: this.previousStatus,
      newStatus: this.newStatus,
      changedAt: this.changedAt.toISOString(),
      reason: this.reason
    };
  }
}

export class MachineSpecsUpdatedEvent extends DomainEvent {
  constructor(
    public readonly machineId: MachineId,
    public readonly previousSpecs: MachineSpecs,
    public readonly newSpecs: MachineSpecs,
    public readonly updatedAt: Date,
    public readonly significantChanges: string[]
  ) {
    super(machineId.getValue(), 'MachineSpecsUpdated');
  }

  protected getPayload(): Record<string, any> {
    return {
      machineId: this.machineId.getValue(),
      previousSpecs: this.previousSpecs,
      newSpecs: this.newSpecs,
      updatedAt: this.updatedAt.toISOString(),
      significantChanges: this.significantChanges
    };
  }
}
```

### **🎛️ Machine Type Events:**
```typescript
export class MachineTypeCreatedEvent extends DomainEvent {
  constructor(
    public readonly machineTypeId: MachineTypeId,
    public readonly code: string,
    public readonly category: string,
    public readonly createdBy: UserId,
    public readonly createdAt: Date
  ) {
    super(machineTypeId.getValue(), 'MachineTypeCreated');
  }

  protected getPayload(): Record<string, any> {
    return {
      machineTypeId: this.machineTypeId.getValue(),
      code: this.code,
      category: this.category,
      createdBy: this.createdBy.getValue(),
      createdAt: this.createdAt.toISOString()
    };
  }
}

export class MachineTypeActivatedEvent extends DomainEvent {
  constructor(
    public readonly machineTypeId: MachineTypeId,
    public readonly activatedAt: Date,
    public readonly activatedBy: UserId
  ) {
    super(machineTypeId.getValue(), 'MachineTypeActivated');
  }

  protected getPayload(): Record<string, any> {
    return {
      machineTypeId: this.machineTypeId.getValue(),
      activatedAt: this.activatedAt.toISOString(),
      activatedBy: this.activatedBy.getValue()
    };
  }
}
```

## 💡 **Beneficios del Sistema**

### **🔄 Desacoplamiento Total:**
```typescript
// ✅ Entidad solo se preocupa de su lógica
export class Machine extends DomainEntity {
  public assignProvider(providerId: UserId): Result<void, DomainError> {
    // 1. Validaciones de negocio
    if (this.props.status.code === 'RETIRED') {
      return err(DomainError.domainRule('Cannot assign provider to retired machine'));
    }

    // 2. Cambio de estado
    const previousProvider = this.props.assignedProviderId;
    this.props.assignedProviderId = providerId;
    this.props.providerAssignedAt = new Date();

    // 3. ✅ Disparar evento (sin saber quién lo escucha)
    this.addDomainEvent(new MachineProviderAssignedEvent(
      this.props.id,
      providerId,
      this.props.ownerId,
      this.props.providerAssignedAt,
      previousProvider
    ));

    return ok(undefined);
  }
}
```

### **📧 Handlers Especializados:**
```typescript
// ✅ Handler para notificaciones por email
export class EmailNotificationHandler {
  async handle(event: MachineProviderAssignedEvent): Promise<void> {
    // Notificar al proveedor
    await this.emailService.sendTemplate('provider-assignment', {
      to: await this.getUserEmail(event.providerId),
      data: {
        machineId: event.machineId,
        assignedAt: event.assignedAt
      }
    });

    // Notificar al cliente
    await this.emailService.sendTemplate('provider-assigned-notification', {
      to: await this.getUserEmail(event.ownerId),
      data: {
        machineId: event.machineId,
        providerId: event.providerId
      }
    });
  }
}

// ✅ Handler para analytics
export class AnalyticsHandler {
  async handle(event: MachineProviderAssignedEvent): Promise<void> {
    await this.analyticsService.track('machine.provider.assigned', {
      machineId: event.machineId,
      providerId: event.providerId,
      timestamp: event.occurredAt,
      hadPreviousProvider: !!event.previousProviderId
    });
  }
}

// ✅ Handler para auditoría
export class AuditLogHandler {
  async handle(event: MachineProviderAssignedEvent): Promise<void> {
    await this.auditRepo.save(new AuditEntry({
      entityType: 'Machine',
      entityId: event.machineId,
      action: 'PROVIDER_ASSIGNED',
      details: event.getPayload(),
      timestamp: event.occurredAt
    }));
  }
}
```

### **🚀 Escalabilidad Horizontal:**
```typescript
// ✅ Fácil agregar nuevos handlers sin tocar código existente
export class SlackNotificationHandler {
  async handle(event: MachineProviderAssignedEvent): Promise<void> {
    await this.slackService.postMessage('#fleet-updates', {
      text: `🔧 Machine ${event.machineId} assigned to provider ${event.providerId}`,
      timestamp: event.occurredAt
    });
  }
}

// ✅ Handlers condicionales por ambiente
export class DevNotificationHandler {
  async handle(event: MachineProviderAssignedEvent): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔔 [DEV] Machine provider assigned:', event.getPayload());
    }
  }
}
```

## 🔧 **Implementación en Entidades**

### **🏗️ Machine con Eventos:**
```typescript
export class Machine extends DomainEntity {
  public assignProvider(providerId: UserId): Result<void, DomainError> {
    // ... validaciones ...

    this.addDomainEvent(new MachineProviderAssignedEvent(/*...*/));
    return ok(undefined);
  }

  public changeStatus(newStatus: MachineStatus): Result<void, DomainError> {
    const previousStatus = this.props.status;
    // ... lógica de cambio ...

    this.addDomainEvent(new MachineStatusChangedEvent(
      this.props.id,
      previousStatus.code,
      newStatus.code,
      new Date()
    ));

    return ok(undefined);
  }

  public updateSpecs(newSpecs: Partial<MachineSpecs>): Result<void, DomainError> {
    const previousSpecs = { ...this.props.specs };
    // ... lógica de actualización ...

    // Solo disparar evento si hay cambios significativos
    const significantChanges = this.detectSignificantChanges(previousSpecs, this.props.specs);
    if (significantChanges.length > 0) {
      this.addDomainEvent(new MachineSpecsUpdatedEvent(
        this.props.id,
        previousSpecs,
        this.props.specs!,
        new Date(),
        significantChanges
      ));
    }

    return ok(undefined);
  }

  private detectSignificantChanges(previous: MachineSpecs, current: MachineSpecs): string[] {
    const changes: string[] = [];
    
    if (previous.enginePower !== current.enginePower) changes.push('enginePower');
    if (previous.maxCapacity !== current.maxCapacity) changes.push('maxCapacity');
    if (previous.fuelType !== current.fuelType) changes.push('fuelType');
    
    return changes;
  }
}
```

## 📊 **Event Dispatcher Pattern**

### **🎯 Dispatcher en Application Layer:**
```typescript
export interface IEventDispatcher {
  dispatch(event: DomainEvent): Promise<void>;
  dispatchAll(events: DomainEvent[]): Promise<void>;
  subscribe<T extends DomainEvent>(eventType: string, handler: (event: T) => Promise<void>): void;
}

export class EventDispatcher implements IEventDispatcher {
  private handlers = new Map<string, Array<(event: DomainEvent) => Promise<void>>>();

  subscribe<T extends DomainEvent>(eventType: string, handler: (event: T) => Promise<void>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler as any);
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];
    
    // Ejecutar todos los handlers en paralelo
    await Promise.allSettled(
      handlers.map(handler => handler(event))
    );
  }

  async dispatchAll(events: DomainEvent[]): Promise<void> {
    await Promise.allSettled(
      events.map(event => this.dispatch(event))
    );
  }
}
```

### **🔄 Uso en Application Services:**
```typescript
export class AssignProviderHandler {
  constructor(
    private machineRepo: IMachineRepository,
    private eventDispatcher: IEventDispatcher
  ) {}

  async handle(command: AssignProviderCommand): Promise<Result<void, ApplicationError>> {
    // 1. Obtener máquina
    const machineResult = await this.machineRepo.findById(command.machineId);
    if (!machineResult.success) return err(ApplicationError.fromDomain(machineResult.error));

    // 2. Ejecutar operación de dominio
    const assignResult = machineResult.data.assignProvider(command.providerId);
    if (!assignResult.success) return err(ApplicationError.fromDomain(assignResult.error));

    // 3. Persistir cambios
    const saveResult = await this.machineRepo.save(machineResult.data);
    if (!saveResult.success) return err(ApplicationError.fromDomain(saveResult.error));

    // 4. ✅ Disparar eventos después de persistir
    const events = machineResult.data.getDomainEvents();
    await this.eventDispatcher.dispatchAll(events);
    machineResult.data.clearDomainEvents();

    return ok(undefined);
  }
}
```

## 🔮 **Casos de Uso Futuros**

### **📊 Event Sourcing:**
```typescript
// Reconstruir estado desde eventos
export class EventSourcingRepository {
  async reconstructMachine(machineId: MachineId): Promise<Result<Machine, DomainError>> {
    const events = await this.eventStore.getEvents(machineId.getValue());
    
    let machine: Machine | null = null;
    
    for (const event of events) {
      machine = this.applyEvent(machine, event);
    }
    
    return machine ? ok(machine) : err(DomainError.notFound('Machine not found'));
  }
}
```

### **📈 Analytics en Tiempo Real:**
```typescript
// Métricas calculadas desde eventos
export class RealTimeMetricsHandler {
  async handle(event: MachineProviderAssignedEvent): Promise<void> {
    // Actualizar contadores en tiempo real
    await this.metricsService.increment('machines.providers.assigned');
    await this.metricsService.gauge('machines.with-provider', await this.countMachinesWithProvider());
    
    // Actualizar dashboard WebSocket
    await this.websocketService.broadcast('metrics-updated', {
      type: 'provider-assignment',
      machineId: event.machineId,
      timestamp: event.occurredAt
    });
  }
}
```

## 🎯 **Reglas de Oro**

1. **🎯 Eventos = Hechos Pasados** - Nombres en pasado (MachineProviderAssigned)
2. **🔒 Inmutable Events** - Una vez creados, no se modifican
3. **📋 Payload Completo** - Toda la información necesaria en el evento
4. **🚫 Sin Lógica de Negocio** - Solo datos y metadata
5. **⚡ Handlers Idempotentes** - Poder procesar el mismo evento múltiples veces
6. **🔄 Async Processing** - Eventos no bloquean la operación principal
7. **📊 Structured Payload** - JSON serializable para persistencia

## 📚 **Implementación Gradual**

### **🚀 Fase 1: Infraestructura Base**
```typescript
// 1. Crear DomainEvent base
// 2. Modificar entidades para extender DomainEntity
// 3. Implementar EventDispatcher simple
```

### **⚡ Fase 2: Eventos Críticos**
```typescript
// 1. MachineProviderAssignedEvent
// 2. MachineStatusChangedEvent
// 3. MachineTypeCreatedEvent
```

### **📈 Fase 3: Handlers Especializados**
```typescript
// 1. EmailNotificationHandler
// 2. AnalyticsHandler
// 3. AuditLogHandler
```

---

> 💡 **Recuerda**: Los Domain Events convierten tu sistema en una **orquesta** donde cada componente toca su parte sin necesidad de dirigir a los demás. El resultado es **música** (software) más armoniosa y mantenible.