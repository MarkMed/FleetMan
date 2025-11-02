# 🧠 Services - Lógica de Negocio Compleja

## 📋 **Propósito**
Los **Domain Services** encapsulan lógica de negocio que no pertenece naturalmente a una sola entidad o que requiere coordinación entre múltiples agregados. Mantienen el dominio libre de lógica de aplicación.

## 📁 **Estructura Actual**
```
services/
├── machine-type.domain-service.ts    ← Lógica compleja de MachineType ✅
└── index.ts                          ← Exportaciones centralizadas ✅
```

## 🎯 **¿Cuándo Usar Domain Services?**

### **✅ USAR Domain Service cuando:**
- 🔄 **Operación cruza múltiples entidades**
- 🔍 **Validación requiere consulta externa** (repositorio)
- 📊 **Cálculos complejos** que no pertenecen a una entidad
- 🎯 **Lógica de negocio pura** sin efectos secundarios
- 📋 **Orquestación de reglas** de múltiples Value Objects/Entidades

### **❌ NO usar Domain Service cuando:**
- 🏠 **Lógica pertenece claramente a una entidad**
- 🌐 **Operación incluye I/O** (bases de datos, APIs externas)
- 📧 **Efectos secundarios** (emails, notificaciones)
- 🎨 **Lógica de presentación** o transformación de DTOs

## 🔧 **Patrón de Implementación**

### **🏭 Service con Dependencies Injection:**
```typescript
export class MachineTypeDomainService {
  constructor(
    private machineTypeRepo: IMachineTypeRepository // ← Port injection
  ) {}

  async createMachineType(props: CreateProps): Promise<Result<MachineType, DomainError>> {
    // 1. Validaciones que requieren consulta externa
    const codeValidation = await this.validateUniqueCode(props.code);
    if (!codeValidation.success) return err(codeValidation.error);

    // 2. Lógica de negocio pura
    const entityResult = MachineType.create(props);
    if (!entityResult.success) return err(entityResult.error);

    // 3. Aplicar reglas de negocio complejas
    const businessRulesResult = this.applyCreationRules(entityResult.data, props);
    if (!businessRulesResult.success) return err(businessRulesResult.error);

    // 4. Persistir
    const saveResult = await this.machineTypeRepo.save(entityResult.data);
    if (!saveResult.success) return err(saveResult.error);

    return ok(entityResult.data);
  }
}
```

### **🛡️ Validaciones de Negocio:**
```typescript
private async validateUniqueCode(code: string): Promise<Result<void, DomainError>> {
  const existsResult = await this.machineTypeRepo.existsByCode(code);
  if (!existsResult.success) return err(existsResult.error);
  
  if (existsResult.data) {
    return err(DomainError.validation(`Code '${code}' already exists`));
  }
  
  return ok(undefined);
}

private validateCategoryConstraints(category: string, metadata: any): Result<void, DomainError> {
  // Reglas específicas por categoría
  switch (category) {
    case 'Construcción Pesada':
      if (!metadata.enginePowerRange || metadata.enginePowerRange.min < 100) {
        return err(DomainError.validation('Heavy construction requires min 100 HP'));
      }
      break;
    case 'Transporte':
      if (!metadata.capacityRange) {
        return err(DomainError.validation('Transport category requires capacity range'));
      }
      break;
  }
  
  return ok(undefined);
}
```

## 💡 **Beneficios**

### **🧩 Separación de Responsabilidades:**
```typescript
// ✅ Entidad: Reglas simples de una instancia
export class MachineType {
  public activate(): Result<void, DomainError> {
    if (this.props.isActive) {
      return err(DomainError.domainRule('MachineType is already active'));
    }
    this.props.isActive = true;
    return ok(undefined);
  }
}

// ✅ Domain Service: Reglas complejas que cruzan agregados
export class MachineTypeDomainService {
  async deactivateMachineType(id: MachineTypeId): Promise<Result<void, DomainError>> {
    // 1. Verificar que no hay máquinas usando este tipo
    const usageCount = await this.machineTypeRepo.countUsages(id);
    if (!usageCount.success) return err(usageCount.error);
    
    if (usageCount.data > 0) {
      return err(DomainError.domainRule(
        `Cannot deactivate: ${usageCount.data} machines still use this type`
      ));
    }
    
    // 2. Obtener y desactivar entidad
    const entityResult = await this.machineTypeRepo.findById(id);
    if (!entityResult.success) return err(entityResult.error);
    
    const deactivateResult = entityResult.data.deactivate();
    if (!deactivateResult.success) return err(deactivateResult.error);
    
    // 3. Persistir cambio
    return await this.machineTypeRepo.save(entityResult.data);
  }
}
```

### **🔄 Reutilización de Lógica:**
```typescript
export class MachineTypeDomainService {
  // ✅ Lógica reutilizable para diferentes casos de uso
  async validateTypeCompatibility(
    machineTypeId: MachineTypeId, 
    specs: MachineSpecs
  ): Promise<Result<void, DomainError>> {
    const typeResult = await this.machineTypeRepo.findById(machineTypeId);
    if (!typeResult.success) return err(typeResult.error);
    
    const type = typeResult.data;
    
    // Validar compatibilidad de specs con tipo
    if (type.metadata.defaultSpecs) {
      const compatibility = this.checkSpecsCompatibility(
        specs, 
        type.metadata.defaultSpecs
      );
      if (!compatibility.success) return err(compatibility.error);
    }
    
    return ok(undefined);
  }
  
  // ✅ Usado en CreateMachine y UpdateMachine
  private checkSpecsCompatibility(
    actualSpecs: MachineSpecs, 
    expectedSpecs: any
  ): Result<void, DomainError> {
    // Lógica compleja de validación de compatibilidad
  }
}
```

### **🧪 Testing Enfocado:**
```typescript
describe('MachineTypeDomainService', () => {
  let service: MachineTypeDomainService;
  let mockRepo: jest.Mocked<IMachineTypeRepository>;

  beforeEach(() => {
    mockRepo = createMockRepository();
    service = new MachineTypeDomainService(mockRepo);
  });

  describe('createMachineType', () => {
    it('should prevent duplicate codes', async () => {
      // ✅ Test enfocado en regla de negocio específica
      mockRepo.existsByCode.mockResolvedValue(ok(true));
      
      const result = await service.createMachineType(validProps);
      
      expect(result.success).toBe(false);
      expect(result.error.message).toContain('already exists');
    });

    it('should apply category constraints', async () => {
      // ✅ Test de regla compleja
      mockRepo.existsByCode.mockResolvedValue(ok(false));
      
      const heavyConstructionProps = {
        ...validProps,
        category: 'Construcción Pesada',
        metadata: { enginePowerRange: { min: 50 } } // ← Debería fallar
      };
      
      const result = await service.createMachineType(heavyConstructionProps);
      
      expect(result.success).toBe(false);
      expect(result.error.message).toContain('min 100 HP');
    });
  });
});
```

## 🔮 **Domain Services Pendientes**

### **👥 UserDomainService:**
```typescript
export class UserDomainService {
  // Promoción de ClientUser a ProviderUser
  async promoteToProvider(userId: UserId, certifications: Certification[]): Promise<Result<ProviderUser, DomainError>>;
  
  // Validación de unicidad de email
  async validateUniqueEmail(email: Email): Promise<Result<void, DomainError>>;
  
  // Verificación de permisos
  async canAccessMachine(userId: UserId, machineId: MachineId): Promise<Result<boolean, DomainError>>;
}
```

### **🔧 MachineDomainService:**
```typescript
export class MachineDomainService {
  // Asignación inteligente de proveedor
  async assignBestProvider(machineId: MachineId, criteria: AssignmentCriteria): Promise<Result<void, DomainError>>;
  
  // Validación de transferencia
  async validateOwnershipTransfer(fromUserId: UserId, toUserId: UserId, machineId: MachineId): Promise<Result<void, DomainError>>;
  
  // Cálculo de disponibilidad
  calculateAvailabilityScore(machine: Machine, dateRange: DateRange): Result<number, DomainError>;
}
```

### **📋 MaintenanceDomainService:**
```typescript
export class MaintenanceDomainService {
  // Programación automática de mantenimiento
  async scheduleMaintenanceReminders(machine: Machine): Promise<Result<MaintenanceSchedule[], DomainError>>;
  
  // Validación de ventana de mantenimiento
  async validateMaintenanceWindow(machineId: MachineId, window: TimeWindow): Promise<Result<void, DomainError>>;
  
  // Cálculo de costos
  calculateMaintenanceCost(history: MaintenanceRecord[], specs: MachineSpecs): Result<Money, DomainError>;
}
```

## 📚 **Ejemplos de Lógica Compleja**

### **🔍 Búsqueda Inteligente:**
```typescript
export class MachineTypeDomainService {
  async findRecommendedTypes(criteria: {
    category?: string;
    maxPrice?: Money;
    minPower?: number;
    location?: Coordinates;
  }): Promise<Result<MachineType[], DomainError>> {
    // 1. Filtros básicos
    const baseResults = await this.machineTypeRepo.findByCategory(criteria.category);
    if (!baseResults.success) return err(baseResults.error);
    
    // 2. Aplicar algoritmo de recomendación
    const scored = this.calculateRecommendationScores(baseResults.data, criteria);
    
    // 3. Ordenar por score y retornar top 10
    const sorted = scored.sort((a, b) => b.score - a.score).slice(0, 10);
    
    return ok(sorted.map(item => item.machineType));
  }
  
  private calculateRecommendationScores(
    types: MachineType[], 
    criteria: any
  ): Array<{machineType: MachineType, score: number}> {
    return types.map(type => ({
      machineType: type,
      score: this.calculateScore(type, criteria)
    }));
  }
}
```

### **📊 Analytics de Negocio:**
```typescript
export class MachineTypeDomainService {
  async generateUsageStatistics(
    timeRange: DateRange
  ): Promise<Result<MachineTypeStatistics, DomainError>> {
    // 1. Obtener datos base
    const allTypes = await this.machineTypeRepo.findActiveTypes();
    if (!allTypes.success) return err(allTypes.error);
    
    // 2. Calcular métricas para cada tipo
    const statistics = await Promise.all(
      allTypes.data.map(async type => {
        const usage = await this.machineTypeRepo.countUsages(type.id);
        const satisfaction = await this.calculateSatisfactionScore(type.id);
        
        return {
          type,
          usageCount: usage.success ? usage.data : 0,
          satisfactionScore: satisfaction.success ? satisfaction.data : 0,
          // ... más métricas
        };
      })
    );
    
    return ok(new MachineTypeStatistics(statistics));
  }
}
```

## 🎯 **Reglas de Oro**

1. **🎯 Lógica de Negocio Pura** - Sin efectos secundarios
2. **🔄 Stateless Services** - Sin estado interno
3. **📋 Dependencies via Constructor** - Injection de ports
4. **✅ Result Types Consistentes** - Manejo de errores uniforme
5. **🧪 Altamente Testeable** - Mocks de dependencies
6. **📝 Métodos Expresivos** - Nombres que explican qué hacen
7. **🚫 Sin Lógica de Aplicación** - No orchestration de use cases

## 📈 **Evolución de Services**

```typescript
// ✅ Empezar simple
export class MachineTypeDomainService {
  async createMachineType(props: CreateProps): Promise<Result<MachineType, DomainError>> {
    // Lógica básica
  }
}

// ✅ Crecer según necesidades del negocio
export class MachineTypeDomainService {
  async createMachineType(props: CreateProps): Promise<Result<MachineType, DomainError>>;
  async validateTypeCompatibility(type: MachineTypeId, specs: MachineSpecs): Promise<Result<void, DomainError>>;
  async findRecommendedTypes(criteria: SearchCriteria): Promise<Result<MachineType[], DomainError>>;
  async generateUsageStatistics(range: DateRange): Promise<Result<Statistics, DomainError>>;
}
```

---

> 💡 **Recuerda**: Los Domain Services son el **cerebro** del dominio. Coordinan entidades y VOs para implementar las reglas de negocio más sofisticadas.