# 🔌 Ports - Interfaces del Dominio

## 📋 **Propósito**
Los **Ports** son interfaces que define el dominio para comunicarse con el mundo exterior, siguiendo el principio de **Dependency Inversion**. El dominio define QUÉ necesita, la infraestructura define CÓMO lo hace.

## 📁 **Estructura Actual**
```
ports/
├── machine-type.repository.ts    ← Repository para MachineType ✅
└── index.ts                      ← Exportaciones centralizadas ✅
```

## 🎯 **Principio Fundamental: Dependency Inversion**

### **❌ Sin Ports (Acoplamiento Directo):**
```typescript
// ❌ Domain depende de detalles de infraestructura
import { MongooseMachineRepository } from '../../../infrastructure/mongoose';

export class MachineService {
  constructor(private repo: MongooseMachineRepository) {} // ← Acoplado
}
```

### **✅ Con Ports (Inversión de Dependencia):**
```typescript
// ✅ Domain define la interface
export interface IMachineRepository {
  save(machine: Machine): Promise<Result<void, DomainError>>;
  findById(id: MachineId): Promise<Result<Machine, DomainError>>;
}

// ✅ Domain usa la interface
export class MachineService {
  constructor(private repo: IMachineRepository) {} // ← Desacoplado
}

// ✅ Infrastructure implementa la interface
export class MongooseMachineRepository implements IMachineRepository {
  // Implementación específica
}
```

## 🏗️ **Tipos de Ports**

### **🗄️ Repository Ports:**
```typescript
// Persistencia de agregados
export interface IMachineTypeRepository {
  // CRUD básico
  save(entity: MachineType): Promise<Result<void, DomainError>>;
  findById(id: MachineTypeId): Promise<Result<MachineType, DomainError>>;
  delete(id: MachineTypeId): Promise<Result<void, DomainError>>;
  
  // Queries específicas del dominio
  findByCode(code: string): Promise<Result<MachineType, DomainError>>;
  findActiveTypes(): Promise<Result<MachineType[], DomainError>>;
  findByCategory(category: string): Promise<Result<MachineType[], DomainError>>;
  
  // Operaciones de validación
  existsByCode(code: string): Promise<Result<boolean, DomainError>>;
  countUsages(typeId: MachineTypeId): Promise<Result<number, DomainError>>;
  
  // Paginación y búsqueda
  findPaginated(params: PaginationParams): Promise<Result<PaginatedResult<MachineType>, DomainError>>;
  searchByText(query: string): Promise<Result<MachineType[], DomainError>>;
}
```

### **📧 Service Ports:**
```typescript
// Servicios externos
export interface INotificationService {
  sendEmail(to: Email, subject: string, body: string): Promise<Result<void, DomainError>>;
  sendSMS(to: PhoneNumber, message: string): Promise<Result<void, DomainError>>;
  sendPushNotification(userId: UserId, message: string): Promise<Result<void, DomainError>>;
}

export interface IFileStorageService {
  uploadFile(file: File, path: string): Promise<Result<string, DomainError>>;
  deleteFile(path: string): Promise<Result<void, DomainError>>;
  getFileUrl(path: string): Promise<Result<string, DomainError>>;
}
```

### **🔐 Authentication Ports:**
```typescript
export interface IAuthenticationService {
  validateToken(token: string): Promise<Result<UserId, DomainError>>;
  generateToken(userId: UserId): Promise<Result<string, DomainError>>;
  revokeToken(token: string): Promise<Result<void, DomainError>>;
}
```

## 💡 **Beneficios**

### **🧪 Testabilidad Extrema:**
```typescript
// ✅ Test con mock repository
describe('MachineTypeDomainService', () => {
  it('should create machine type', async () => {
    // Mock simple de la interface
    const mockRepo: IMachineTypeRepository = {
      save: jest.fn().mockResolvedValue(ok(undefined)),
      findByCode: jest.fn().mockResolvedValue(err(DomainError.notFound())),
      // ... otros métodos
    };
    
    const service = new MachineTypeDomainService(mockRepo);
    const result = await service.createMachineType(props);
    
    expect(result.success).toBe(true);
    expect(mockRepo.save).toHaveBeenCalledWith(expect.any(MachineType));
  });
});
```

### **🔄 Flexibilidad de Implementación:**
```typescript
// ✅ Múltiples implementaciones de la misma interface
export class MongooseMachineTypeRepository implements IMachineTypeRepository {
  // Implementación para MongoDB
}

export class PostgreSQLMachineTypeRepository implements IMachineTypeRepository {
  // Implementación para PostgreSQL
}

export class InMemoryMachineTypeRepository implements IMachineTypeRepository {
  // Implementación para testing
}

// ✅ Cambio de implementación en DI container
container.bind<IMachineTypeRepository>(
  process.env.DB_TYPE === 'mongo' 
    ? MongooseMachineTypeRepository 
    : PostgreSQLMachineTypeRepository
);
```

### **🔒 Dominio Protegido:**
```typescript
// ✅ Domain no sabe de tecnologías específicas
// - No importa mongoose, pg, redis, etc.
// - No sabe de HTTP, gRPC, GraphQL
// - No sabe de AWS, Azure, GCP
// - Puro TypeScript + lógica de negocio
```

## 🔧 **Patrón de Implementación**

### **📋 Interface Completa:**
```typescript
export interface IMachineTypeRepository {
  // Métodos base
  save(entity: MachineType): Promise<Result<void, DomainError>>;
  findById(id: MachineTypeId): Promise<Result<MachineType, DomainError>>;
  delete(id: MachineTypeId): Promise<Result<void, DomainError>>;
  
  // Queries específicas
  findByCode(code: string): Promise<Result<MachineType, DomainError>>;
  findActiveTypes(): Promise<Result<MachineType[], DomainError>>;
  
  // Validaciones
  existsByCode(code: string): Promise<Result<boolean, DomainError>>;
  
  // Búsqueda y paginación
  findPaginated(params: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
  }): Promise<Result<{
    items: MachineType[];
    totalCount: number;
    page: number;
    totalPages: number;
  }, DomainError>>;
}
```

### **🎯 Separación Clara:**
```typescript
// ✅ Port define el contrato (Domain Layer)
export interface IMachineTypeRepository {
  save(entity: MachineType): Promise<Result<void, DomainError>>;
}

// ✅ Implementación específica (Infrastructure Layer)
export class MongooseMachineTypeRepository implements IMachineTypeRepository {
  async save(entity: MachineType): Promise<Result<void, DomainError>> {
    try {
      const document = this.toMongooseDocument(entity);
      await document.save();
      return ok(undefined);
    } catch (error) {
      return err(DomainError.persistence(`Failed to save: ${error.message}`));
    }
  }
  
  private toMongooseDocument(entity: MachineType): MachineTypeDocument {
    // Mapeo específico de Mongoose
  }
}
```

## 🔮 **Ports Pendientes**

### **🗄️ Repository Ports:**
```typescript
// Repositorios para otras entidades
interface IMachineRepository { /* ... */ }
interface IUserRepository { /* ... */ }
interface IProviderUserRepository { /* ... */ }
interface IMaintenanceRecordRepository { /* ... */ }
```

### **📧 External Service Ports:**
```typescript
// Servicios de comunicación
interface IEmailService { /* ... */ }
interface ISMSService { /* ... */ }
interface IPushNotificationService { /* ... */ }

// Servicios de archivos
interface IFileStorageService { /* ... */ }
interface IImageProcessingService { /* ... */ }

// Servicios de terceros
interface IPaymentService { /* ... */ }
interface IGeocodingService { /* ... */ }
interface IWeatherService { /* ... */ }
```

### **🔐 Security Ports:**
```typescript
// Autenticación y autorización
interface IAuthenticationService { /* ... */ }
interface IAuthorizationService { /* ... */ }
interface IEncryptionService { /* ... */ }
```

## 📚 **Uso en Domain Services**

```typescript
export class MachineTypeDomainService {
  constructor(
    private machineTypeRepo: IMachineTypeRepository, // ← Port injection
    private notificationService: INotificationService // ← Port injection
  ) {}
  
  async createMachineType(props: CreateProps): Promise<Result<MachineType, DomainError>> {
    // 1. Verificar código único
    const existsResult = await this.machineTypeRepo.existsByCode(props.code);
    if (!existsResult.success) return err(existsResult.error);
    if (existsResult.data) {
      return err(DomainError.validation('Code already exists'));
    }
    
    // 2. Crear entidad
    const entityResult = MachineType.create(props);
    if (!entityResult.success) return err(entityResult.error);
    
    // 3. Persistir
    const saveResult = await this.machineTypeRepo.save(entityResult.data);
    if (!saveResult.success) return err(saveResult.error);
    
    // 4. Notificar (opcional, no crítico)
    await this.notificationService.sendEmail(
      props.adminEmail, 
      'New Machine Type Created', 
      `Type ${props.code} has been created`
    ); // ← No afecta el resultado principal
    
    return ok(entityResult.data);
  }
}
```

## 🎯 **Reglas de Oro**

1. **🎯 Domain Define Contratos** - Las interfaces son del dominio
2. **🔄 Infrastructure Implementa** - Detalles técnicos en infrastructure
3. **📋 Result Types Consistentes** - Todos los métodos retornan Result<T, E>
4. **🚫 Sin Dependencias Técnicas** - Ports no importan bibliotecas externas
5. **🎭 Granularidad Apropiada** - Una interface por responsabilidad
6. **📝 Documentación Clara** - Comportamiento esperado bien definido

---

> 💡 **Recuerda**: Los Ports son los **contratos** entre el dominio puro y el mundo real. Bien diseñados, garantizan flexibilidad total.