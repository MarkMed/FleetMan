# Persistence Package - Capa de Datos

## 📋 Propósito

El paquete `persistence` implementa la **capa de persistencia** usando **MongoDB/Mongoose**, proporcionando implementaciones concretas de los repositorios definidos en el dominio. Actúa como un **adapter** que traduce entre el mundo del dominio y el mundo de la base de datos.

## 🎯 Principios Arquitectónicos

- **Dependency Inversion**: Implementa interfaces definidas en el dominio
- **Encapsulation**: Mongoose queda completamente encapsulado, no se filtra a otras capas
- **Mapping Separation**: Conversión explícita Document ↔ Domain Entity
- **Transaction Support**: Manejo de transacciones para operaciones complejas
- **Outbox Pattern**: Para entrega confiable de eventos/notificaciones

## 📁 Estructura de Carpetas

### `/models` (Interno - No Exportado)
Define los **esquemas de Mongoose** y tipos de documentos:

**Archivos a implementar:**
- `user.model.ts` - Schema de User con discriminators para ClientUser/ProviderUser
- `machine.model.ts` - Schema de Machine con referencias y embedidos
- `maintenance-reminder.model.ts` - Schema de recordatorios preventivos
- `machine-event.model.ts` - Schema de eventos del historial
- `quickcheck.model.ts` - Schema de chequeos rápidos
- `notification.model.ts` - Schema de notificaciones
- `outbox.model.ts` - Schema para patrón Outbox

**Características:**
```typescript
// Ejemplo de estructura
export interface UserDocument extends Document {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  userType: 'client' | 'provider';
  profile: {
    firstName: string;
    lastName: string;
    // ...
  };
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true },
  // ... definición completa
});
```

### `/mappers`
Contiene **mappers bidireccionales** para convertir entre Documents y Domain Entities:

**Archivos a implementar:**
- `user.mapper.ts` - UserDocument ↔ User/ClientUser/ProviderUser
- `machine.mapper.ts` - MachineDocument ↔ Machine
- `maintenance-reminder.mapper.ts` - MaintenanceReminderDocument ↔ MaintenanceReminder
- `machine-event.mapper.ts` - MachineEventDocument ↔ MachineEvent
- `quickcheck.mapper.ts` - QuickCheckDocument ↔ QuickCheck
- `notification.mapper.ts` - NotificationDocument ↔ Notification

**Características:**
```typescript
// Ejemplo de mapper
export class UserMapper {
  static toDomain(doc: UserDocument): User {
    // Conversión Document → Domain Entity
    return User.create({
      id: new UserId(doc._id.toString()),
      email: new Email(doc.email),
      // ... mapping completo
    }).unwrap(); // Asumimos que doc es válido
  }

  static toDocument(user: User): Partial<UserDocument> {
    // Conversión Domain Entity → Document
    return {
      email: user.email.value,
      userType: user.type,
      // ... mapping completo
    };
  }
}
```

### `/repositories`
Implementa los **repositorios concretos** definidos como puertos en el dominio:

**Archivos a implementar:**
- `user.repository.ts` - Implementa `IUserRepository`
- `machine.repository.ts` - Implementa `IMachineRepository`
- `maintenance-reminder.repository.ts` - Implementa `IMaintenanceReminderRepository`
- `machine-event.repository.ts` - Implementa `IMachineEventRepository`
- `quickcheck.repository.ts` - Implementa `IQuickCheckRepository`
- `notification.repository.ts` - Implementa `INotificationRepository`

**Características:**
```typescript
// Ejemplo de repositorio
export class UserRepository implements IUserRepository {
  constructor(private userModel: Model<UserDocument>) {}

  async findById(id: UserId): Promise<Option<User>> {
    const doc = await this.userModel.findById(id.value);
    return doc ? some(UserMapper.toDomain(doc)) : none();
  }

  async save(user: User): Promise<Result<User, RepositoryError>> {
    try {
      const doc = UserMapper.toDocument(user);
      const saved = await this.userModel.findByIdAndUpdate(
        user.id.value, 
        doc, 
        { upsert: true, new: true }
      );
      return ok(UserMapper.toDomain(saved));
    } catch (error) {
      return err(new RepositoryError('Failed to save user', error));
    }
  }
}
```

## 🛠 Patterns Implementados

### Unit of Work & Transactions
```typescript
export class UnitOfWork {
  private session: ClientSession;
  
  async withTransaction<T>(work: () => Promise<T>): Promise<Result<T, TransactionError>> {
    const session = await mongoose.startSession();
    try {
      return await session.withTransaction(async () => {
        this.session = session;
        const result = await work();
        return ok(result);
      });
    } catch (error) {
      return err(new TransactionError('Transaction failed', error));
    } finally {
      await session.endSession();
    }
  }
}
```

### Outbox Pattern
```typescript
export class OutboxRepository {
  async addEvent(event: DomainEvent): Promise<void> {
    await OutboxModel.create({
      eventType: event.type,
      payload: event.payload,
      aggregateId: event.aggregateId,
      status: 'pending'
    });
  }

  async markAsProcessed(eventId: string): Promise<void> {
    await OutboxModel.findByIdAndUpdate(eventId, { status: 'processed' });
  }
}
```

### Repository Base Class
```typescript
export abstract class BaseRepository<TEntity, TDocument extends Document> {
  constructor(protected model: Model<TDocument>) {}

  protected abstract toDomain(doc: TDocument): TEntity;
  protected abstract toDocument(entity: TEntity): Partial<TDocument>;

  async findById(id: string): Promise<Option<TEntity>> {
    const doc = await this.model.findById(id);
    return doc ? some(this.toDomain(doc)) : none();
  }
}
```

## 🔧 Configuración y Setup

### Database Connection
```typescript
export class DatabaseConnection {
  static async connect(connectionString: string): Promise<void> {
    await mongoose.connect(connectionString, {
      retryWrites: true,
      w: 'majority'
    });
  }

  static async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }
}
```

### Indexes y Performance
```typescript
// En los schemas
UserSchema.index({ email: 1 }, { unique: true });
MachineSchema.index({ serialNumber: 1, brand: 1 }, { unique: true });
MachineEventSchema.index({ machineId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
```

## 📊 Migrations y Seeders

### Migration Framework
```typescript
export abstract class Migration {
  abstract up(): Promise<void>;
  abstract down(): Promise<void>;
}

export class CreateUsersCollection extends Migration {
  async up(): Promise<void> {
    // Create collection and indexes
  }
  
  async down(): Promise<void> {
    // Rollback changes
  }
}
```

### Data Seeders
```typescript
export class UserSeeder {
  static async seed(): Promise<void> {
    const adminUser = await UserModel.create({
      email: 'admin@fleetman.com',
      userType: 'provider',
      // ... datos de prueba
    });
  }
}
```

## 🚫 Qué NO va en este paquete

- ❌ Lógica de negocio (eso va en domain)
- ❌ Validaciones de negocio (solo validaciones de BD)
- ❌ Controladores HTTP (eso va en interfaces)
- ❌ Servicios de dominio

## 🔄 Dependencias

```typescript
// Depende de:
import { IUserRepository, User } from '@packages/domain';

// NO expone:
// - Mongoose models
// - Database-specific types
// - Implementation details
```

## 📚 Referencias

- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Unit of Work](https://martinfowler.com/eaaCatalog/unitOfWork.html)
- [Outbox Pattern](https://microservices.io/patterns/data/transactional-outbox.html)