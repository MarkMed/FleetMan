# DRY/SSOT Pattern - Clean Architecture Flow

**Document Purpose**: Architectural guide for implementing new features following DRY (Don't Repeat Yourself) and SSOT (Single Source of Truth) principles across Domain → Contracts → Persistence layers.

**Last Updated**: December 18, 2025 (Sprint #9 - Notifications System)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Layer Responsibilities](#layer-responsibilities)
3. [Implementation Flow](#implementation-flow)
4. [Code Examples](#code-examples)
5. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
6. [Decision Tree](#decision-tree)
7. [Real Examples in Codebase](#real-examples-in-codebase)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER (SSOT)                          │
│  ✓ Interfaces (IUser, IMachine, INotification)                 │
│  ✓ Enums & Constants (NOTIFICATION_TYPES, FUEL_TYPE)           │
│  ✓ Business Rules (no persistence concerns)                     │
└────────────────┬────────────────────────────────────────────────┘
                 │ (imports types/constants)
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                   CONTRACTS LAYER (Validation)                  │
│  ✓ Zod Schemas with validation rules                           │
│  ✓ Uses 'satisfies z.ZodType<DomainInterface>' for type safety │
│  ✓ DTOs inferred from schemas (z.infer<typeof Schema>)         │
└────────────────┬────────────────────────────────────────────────┘
                 │ (imports types for mapping)
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                PERSISTENCE LAYER (Implementation)               │
│  ✓ Mongoose Schemas (with DB-specific fields like _id)         │
│  ✓ Document Interfaces extend Omit<DomainInterface, 'id'>      │
│  ✓ Mappers convert between DB documents ↔ Domain interfaces    │
│  ✓ Repositories implement domain ports                         │
└─────────────────────────────────────────────────────────────────┘
```

**Key Principle**: Types flow **downward** (Domain → Contracts → Persistence), never upward.

---

## Layer Responsibilities

### 1. Domain Layer (`packages/domain`)

**Role**: Single source of truth for all business concepts

**What to define here:**
- ✅ Public interfaces (`IUser`, `IMachine`, `INotification`)
- ✅ Enum constants (`NOTIFICATION_TYPES`, `FUEL_TYPE`, `QUICK_CHECK_RESULTS`)
- ✅ Value Objects (`UserId`, `MachineId`, `Email`)
- ✅ Repository ports (interfaces like `IUserRepository`)
- ✅ Business rules and domain logic

**What NOT to define here:**
- ❌ Validation rules (min/max length, regex patterns)
- ❌ HTTP/API concerns (status codes, response formats)
- ❌ Database schemas or Mongoose models
- ❌ Any persistence implementation details

**Example:**
```typescript
// packages/domain/src/models/interfaces.ts
export const NOTIFICATION_TYPES = ['success', 'warning', 'error', 'info'] as const;
export type NotificationType = typeof NOTIFICATION_TYPES[number];

export interface INotification {
  readonly id: string;
  readonly notificationType: NotificationType;
  readonly message: string;
  readonly wasSeen: boolean;
  readonly notificationDate: Date;
  readonly actionUrl?: string;
}
```

### 2. Contracts Layer (`packages/contracts`)

**Role**: Validate external inputs/outputs, ensure type compatibility with domain

**What to define here:**
- ✅ Zod schemas with validation rules (min/max, regex, custom validators)
- ✅ DTOs inferred from schemas (`z.infer<typeof Schema>`)
- ✅ Use `satisfies z.ZodType<DomainInterface>` for compile-time validation
- ✅ Request/Response schemas for API endpoints

**What NOT to define here:**
- ❌ Business logic or domain rules
- ❌ Database schemas
- ❌ Repository implementations
- ❌ Duplicate type definitions (always import from domain)

**Example:**
```typescript
// packages/contracts/src/notification.contract.ts
import { z } from 'zod';
import type { INotification, NotificationType } from '@packages/domain';
import { NOTIFICATION_TYPES } from '@packages/domain';

export const NotificationSchema = z.object({
  id: z.string(),
  notificationType: z.enum(NOTIFICATION_TYPES),
  message: z.string().min(1).max(500), // ← Validation rules here
  wasSeen: z.boolean(),
  notificationDate: z.coerce.date(),
  actionUrl: z.string().url().optional()
}) satisfies z.ZodType<INotification>; // ← Type safety against domain

export type NotificationDTO = z.infer<typeof NotificationSchema>;
```

### 3. Persistence Layer (`packages/persistence`)

**Role**: Implement persistence logic, map between DB and domain

**What to define here:**
- ✅ Mongoose schemas with DB-specific fields (`_id`, indexes, virtuals)
- ✅ Document interfaces extending `Omit<DomainInterface, 'id'>`
- ✅ Mappers for bidirectional conversion (DB ↔ Domain)
- ✅ Repository implementations

**What NOT to define here:**
- ❌ New business concepts (define in domain first)
- ❌ Validation logic (use contracts layer)
- ❌ Manual type definitions duplicating domain

**Example:**
```typescript
// packages/persistence/src/models/user.model.ts
import type { INotification } from '@packages/domain';
import { NOTIFICATION_TYPES } from '@packages/domain';

interface INotificationSubdoc extends Omit<INotification, 'id'> {
  _id: Types.ObjectId; // Only DB-specific field
}

const NotificationSubSchema = new Schema({
  notificationType: { type: String, enum: NOTIFICATION_TYPES, required: true },
  message: { type: String, required: true, maxlength: 500 },
  // ... other fields match domain interface
});

// packages/persistence/src/mappers/notification.mapper.ts
export class NotificationMapper {
  static toDomain(doc: INotificationSubdoc): INotification {
    return {
      id: doc._id.toString(), // Convert _id → id
      notificationType: doc.notificationType,
      message: doc.message,
      wasSeen: doc.wasSeen,
      notificationDate: doc.notificationDate,
      actionUrl: doc.actionUrl
    };
  }
}
```

---

## Implementation Flow

### Standard Flow (New Feature Implementation)

**Step 1: Define in Domain Layer**

1. Create interface in `packages/domain/src/models/interfaces.ts`
2. Define enum constants if needed (e.g., `NOTIFICATION_TYPES`)
3. Export from `packages/domain/src/index.ts`
4. Add repository methods to port interface (e.g., `IUserRepository`)

**Step 2: Create Contracts Schema**

1. Import domain interface and constants
2. Create Zod schema with validation rules
3. Add `satisfies z.ZodType<DomainInterface>` for type checking
4. Infer DTO types with `z.infer<typeof Schema>`
5. Export from `packages/contracts/src/index.ts`

**Step 3: Implement Persistence**

1. Create Mongoose schema (if new collection) or subdocument schema
2. Define document interface extending `Omit<DomainInterface, 'id'>`
3. Create mapper class (e.g., `NotificationMapper`) if needed
4. Implement repository methods using mapper

**Step 4: Verify Type Safety**

1. Run `pnpm build` in domain, contracts, persistence
2. Verify `satisfies` constraint catches any drift
3. Run `pnpm typecheck` in backend

---

## Code Examples

### Example 1: Embedded Subdocument (Notification in User)

**Domain:**
```typescript
// packages/domain/src/models/interfaces.ts
export interface INotification {
  readonly id: string;
  readonly notificationType: NotificationType;
  readonly message: string;
  readonly wasSeen: boolean;
}

export interface IUser extends IBaseEntity {
  readonly notifications?: readonly INotification[];
}
```

**Contracts:**
```typescript
// packages/contracts/src/notification.contract.ts
import type { INotification } from '@packages/domain';

export const NotificationSchema = z.object({
  id: z.string(),
  notificationType: z.enum(NOTIFICATION_TYPES),
  message: z.string().min(1).max(500),
  wasSeen: z.boolean()
}) satisfies z.ZodType<INotification>;
```

**Persistence:**
```typescript
// packages/persistence/src/models/user.model.ts
interface INotificationSubdoc extends Omit<INotification, 'id'> {
  _id: Types.ObjectId;
}

const NotificationSubSchema = new Schema({
  notificationType: { type: String, enum: NOTIFICATION_TYPES },
  message: { type: String, maxlength: 500 },
  wasSeen: { type: Boolean, default: false }
});

// packages/persistence/src/mappers/notification.mapper.ts
export class NotificationMapper {
  static toDomain(doc: INotificationSubdoc): INotification {
    return { id: doc._id.toString(), ...doc };
  }
}
```

### Example 2: Standalone Entity (Machine)

**Domain:**
```typescript
// packages/domain/src/models/interfaces.ts
export interface IMachine extends IBaseEntity {
  readonly serialNumber: string;
  readonly brand: string;
  readonly modelName: string;
}
```

**Contracts:**
```typescript
// packages/contracts/src/machine.contract.ts
import type { IMachine } from '@packages/domain';

export const MachineResponseSchema = z.object({
  id: z.string(),
  serialNumber: z.string(),
  brand: z.string().min(1),
  modelName: z.string().min(1)
}) satisfies z.ZodType<Omit<IMachine, 'createdAt' | 'updatedAt'>>;
```

**Persistence:**
```typescript
// packages/persistence/src/models/machine.model.ts
interface IMachineDocument extends Omit<IMachine, 'id'>, Document {
  _id: Types.ObjectId;
}

const machineSchema = new Schema({
  serialNumber: { type: String, unique: true },
  brand: { type: String, required: true },
  modelName: { type: String, required: true }
});

// packages/persistence/src/mappers/machine.mapper.ts
export class MachineMapper {
  static toDomain(doc: IMachineDocument): IMachine {
    return {
      id: doc._id.toString(),
      serialNumber: doc.serialNumber,
      brand: doc.brand,
      modelName: doc.modelName
    };
  }
}
```

### Example 3: Enum Constants (Shared Across Layers)

**Domain (SSOT):**
```typescript
// packages/domain/src/enums/NotificationEnums.ts
export const NOTIFICATION_TYPES = ['success', 'warning', 'error', 'info'] as const;
export type NotificationType = typeof NOTIFICATION_TYPES[number];
```

**Contracts (Import & Use):**
```typescript
import { NOTIFICATION_TYPES, type NotificationType } from '@packages/domain';

export const NotificationTypeSchema = z.enum(NOTIFICATION_TYPES) 
  satisfies z.ZodType<NotificationType>;
```

**Persistence (Import & Use):**
```typescript
import { NOTIFICATION_TYPES } from '@packages/domain';

const schema = new Schema({
  notificationType: { type: String, enum: NOTIFICATION_TYPES }
});
```

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern #1: Inline Type Definitions in Repository Ports

**Bad:**
```typescript
// packages/domain/src/ports/user.repository.ts
export interface IUserRepository {
  getUserNotifications(): Promise<Result<{
    notifications: Array<{
      id: string;
      notificationType: string;
      message: string;
      // ... 10 more fields
    }>;
    total: number;
  }, DomainError>>;
}
```

**Good:**
```typescript
export interface IGetNotificationsResult {
  notifications: INotification[]; // ← Use existing interface
  total: number;
}

export interface IUserRepository {
  getUserNotifications(): Promise<Result<IGetNotificationsResult, DomainError>>;
}
```

### ❌ Anti-Pattern #2: Manual Schema Definition Without satisfies

**Bad:**
```typescript
// packages/contracts/src/notification.contract.ts
export const NotificationSchema = z.object({
  id: z.string(),
  type: z.enum(['success', 'warning']), // ← Hardcoded, diverges from domain
  msg: z.string() // ← Different field name than domain
});
```

**Good:**
```typescript
import type { INotification } from '@packages/domain';
import { NOTIFICATION_TYPES } from '@packages/domain';

export const NotificationSchema = z.object({
  id: z.string(),
  notificationType: z.enum(NOTIFICATION_TYPES), // ← Reuses domain constant
  message: z.string()
}) satisfies z.ZodType<INotification>; // ← Compile-time validation
```

### ❌ Anti-Pattern #3: Manual Object Mapping in Repository

**Bad:**
```typescript
// packages/persistence/src/repositories/user.repository.ts
async getUserNotifications() {
  const notifications = await findNotifications();
  
  return notifications.map(n => ({
    id: n._id.toString(),
    notificationType: n.notificationType,
    message: n.message,
    wasSeen: n.wasSeen,
    // ... repeated 10+ times in codebase
  }));
}
```

**Good:**
```typescript
import { NotificationMapper } from '../mappers/notification.mapper';

async getUserNotifications() {
  const notifications = await findNotifications();
  return NotificationMapper.toDomainArray(notifications); // ← DRY
}
```

### ❌ Anti-Pattern #4: Contracts Importing from Persistence

**Bad:**
```typescript
// packages/contracts/src/notification.contract.ts
import { NotificationModel } from '@packages/persistence'; // ❌ NEVER DO THIS
```

**Reason**: Violates clean architecture. Dependency should flow Domain → Contracts → Persistence, never upward.

### ❌ Anti-Pattern #5: Duplicate Type Definitions

**Bad:**
```typescript
// packages/domain/src/models/interfaces.ts
export interface INotification { id: string; message: string; }

// packages/contracts/src/notification.contract.ts
export type NotificationDTO = { id: string; message: string; }; // ❌ Duplicate

// packages/persistence/src/models/user.model.ts
interface INotificationSubdoc { _id: ObjectId; message: string; } // ❌ Duplicate again
```

**Good:**
```typescript
// Domain defines once
export interface INotification { id: string; message: string; }

// Contracts imports and validates
import type { INotification } from '@packages/domain';
export const NotificationSchema = z.object({...}) satisfies z.ZodType<INotification>;

// Persistence extends
interface INotificationSubdoc extends Omit<INotification, 'id'> {
  _id: ObjectId;
}
```

---

## Decision Tree

### When to Create a Mapper?

```
Do you need bidirectional conversion (DB ↔ Domain)?
│
├─ YES (Entity with business logic)
│   → Create mapper class (e.g., MachineMapper, UserMapper)
│   → Use in repository for findById, save, etc.
│
└─ NO (Simple subdocument/DTO)
    │
    ├─ Is it a subdocument embedded in parent?
    │   → Consider lightweight mapper (e.g., NotificationMapper)
    │   → Useful for array mapping (.map() → .toDomainArray())
    │
    └─ Is it a simple DTO/response?
        → No mapper needed, direct object spreading
```

### When to Use Embedded Subdocuments vs Separate Collections?

```
Is the data always accessed with parent?
│
├─ YES (e.g., Notifications in User, QuickChecks in Machine)
│   → Use embedded subdocument
│   → Benefits: Atomic updates, no joins, better performance
│   → Trade-off: Limited query flexibility
│
└─ NO (e.g., Machine, User, MachineType)
    → Use separate collection
    → Benefits: Independent queries, relational flexibility
    → Trade-off: Requires joins/population
```

### When to Use satisfies vs extends?

```
Are you defining a Zod schema?
│
├─ YES
│   → Use 'satisfies z.ZodType<DomainInterface>'
│   → Ensures schema structure matches domain at compile time
│   → Example: NotificationSchema satisfies z.ZodType<INotification>
│
└─ NO (TypeScript interface/type)
    → Use 'extends' or 'Omit<DomainInterface, ...>'
    → Example: INotificationSubdoc extends Omit<INotification, 'id'>
```

---

## Real Examples in Codebase

### ✅ Correct Implementation: QuickCheck (Embedded Subdocument)

**Domain:**
- `IQuickCheckRecord` in `packages/domain/src/models/interfaces.ts` (lines 72-80)
- `QUICK_CHECK_RESULTS` constant (line 68)

**Contracts:**
- `QuickCheckRecordSchema` in `packages/contracts/src/quickcheck.contract.ts`
- Uses `z.enum(QUICK_CHECK_RESULTS) satisfies z.ZodType<QuickCheckResult>`

**Persistence:**
- `QuickCheckRecordSubSchema` in `packages/persistence/src/models/machine.model.ts`
- Mapped inline in `MachineMapper.toDomain()` (lines 119-130)

**Pattern**: ✅ Embedded subdocument, inline mapping (no separate mapper needed)

---

### ✅ Correct Implementation: Machine (Standalone Entity)

**Domain:**
- `IMachine` interface (lines 93-141 in interfaces.ts)
- Complex entity with nested objects (status, specs, location)

**Contracts:**
- `MachineResponseSchema` validates API responses
- Re-exports domain types: `export type { MachineSpecs, MachineLocation }`

**Persistence:**
- `IMachineDocument extends Omit<IMachine, 'id'>` (line 118 in machine.model.ts)
- `MachineMapper` class with `toDomain()` and `toDocument()` methods
- Handles complex mapping including Value Objects (MachineId, UsageSchedule)

**Pattern**: ✅ Standalone entity, dedicated mapper class, proper VO handling

---

### ✅ Correct Implementation: Notification (Embedded Subdocument)

**Domain:**
- `INotification` interface (lines 195-205 in interfaces.ts)
- `NOTIFICATION_TYPES` constant in `enums/NotificationEnums.ts`
- `IGetNotificationsResult` uses `INotification[]` (not inline type)

**Contracts:**
- `NotificationSchema satisfies z.ZodType<INotification>` ✅
- No duplicate `GetNotificationsResultDTO` (removed in DRY refactoring)

**Persistence:**
- `INotificationSubdoc extends Omit<INotification, 'id'>` ✅
- `NotificationMapper.toDomainArray()` for array conversion ✅
- Repository uses mapper instead of manual mapping ✅

**Pattern**: ✅ Embedded subdocument, dedicated mapper for array operations

---

## Checklist for New Feature Implementation

### Domain Layer
- [ ] Interface defined in `models/interfaces.ts`
- [ ] Enum constants defined if needed (e.g., `NOTIFICATION_TYPES`)
- [ ] Repository port methods added to `ports/*.repository.ts`
- [ ] Return types use interfaces, not inline definitions
- [ ] Exported from `domain/src/index.ts`

### Contracts Layer
- [ ] Zod schema created with validation rules
- [ ] Schema uses `satisfies z.ZodType<DomainInterface>`
- [ ] Imports enum constants from domain (no hardcoding)
- [ ] DTOs inferred with `z.infer<typeof Schema>`
- [ ] Exported from `contracts/src/index.ts`

### Persistence Layer
- [ ] Document interface extends `Omit<DomainInterface, 'id'>`
- [ ] Mongoose schema uses domain enum constants
- [ ] Mapper class created (if needed)
- [ ] Repository imports domain types (not contracts)
- [ ] Repository uses mapper for conversions
- [ ] Build succeeds with zero TypeScript errors

### Verification
- [ ] `pnpm build` passes in all packages
- [ ] `satisfies` constraint validates schema structure
- [ ] No duplicate type definitions across layers
- [ ] No manual object mapping in repositories

---

## References

- **Architecture Diagram**: [docs/architecture&domainModel.md](../architecture&domainModel.md)
- **Clean Architecture Flow**: [docs/clean-architecture-flow.md](../clean-architecture-flow.md)
- **Sprint #9 Notifications**: [docs/sprint9-notifications-system-explanation.md](../sprint9-notifications-system-explanation.md)
- **Zod Documentation**: https://zod.dev
- **Mongoose Documentation**: https://mongoosejs.com

---

## Revision History

| Date | Sprint | Changes |
|------|--------|---------|
| 2025-12-18 | Sprint #9 | Initial document creation after Notifications DRY/SSOT refactoring |

---

**Next Steps**: When implementing new features, always refer to this document to maintain architectural consistency and avoid duplicating type definitions across layers.
