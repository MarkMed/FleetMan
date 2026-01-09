# Feature Specification: User Communication System (MVP)

## 1. Vision General

### 1.1 Propósito

Habilitar **interacción básica entre usuarios** registrados en la plataforma FleetMan para facilitar comunicación relacionada con gestión de flota, mantenimiento, servicios y coordinación entre clientes y proveedores.

### 1.2 Alcance MVP

La implementación se divide en **tres módulos secuenciales**:

1. **User Discovery** - Exploración de perfiles públicos de usuarios
2. **Contact Management** - Gestión de agenda personal de contactos
3. **Messaging** - Chat 1-a-1 simple entre contactos

**Principios del MVP:**
- ✅ Funcionalidad básica y usable
- ✅ Reutilización de modelos existentes (`User`)
- ✅ Persistencia simple (subdocumentos + documentos independientes)
- ❌ **NO** incluir: grupos, multimedia, estados de lectura, inbox, notificaciones push en tiempo real (por ahora)
- ❌ **NO** sobre-ingenierizar: evitar feature creep

### 1.3 Contexto Arquitectónico

**Integración con sistema existente:**
- Reutiliza modelo `User` (ClientUser, ProviderUser)
- Sigue patrón Models - Contracts/Schemas - Repositories - Use Cases - Controllers - Routes - Frontend (API calls + UI)
- Mantiene separación de capas (Domain, Application, Persistence, Contracts, Presentation)

---

## 2. Módulo 1: User Discovery (Descubrimiento de Usuarios)

### 2.1 Descripción Funcional

Permite que un usuario autenticado **explore otros usuarios registrados** en la plataforma para identificar potenciales contactos (proveedores de servicio, otros gestores de flotas, etc.) a su vez que visualiza la cantidad total de usuarios registrados.

**Características clave:**
- Vista de perfiles públicos (subset de datos)
- Visualización de total de usuarios registrados.
- Paginación de resultados
- **NO** crea relaciones ni vínculos
- **NO** gestiona mensajería

### 2.2 Reglas de Negocio

1. **Datos Públicos Expuestos:**
   - Nombre de compañía (`profile.companyName`)
   - Tipo de usuario (`type`: CLIENT/PROVIDER)
   - Para proveedores: áreas de servicio (`serviceAreas`), verificación (`isVerified`)
   - Cantidad de máquinas asociadas
   - **Excluidos:** email, teléfono, datos de suscripción, notificaciones

2. **Exclusiones de Búsqueda:**
   - Usuario logueado NO aparece en sus propios resultados
   - Solo usuarios activos (`isActive: true`)

3. **Permisos:**
   - Requiere autenticación (JWT)
   - Cualquier usuario autenticado puede explorar

### 2.3 Componentes Técnicos (propuestos)

#### 2.3.1 Domain Layer (`packages/domain`)

**Interfaces/DTOs (Public Contracts):**
```typescript
// packages/domain/src/models/interfaces.ts (EXTEND)
export interface IUserPublicProfile {
  readonly id: string;
  readonly profile: {
    readonly companyName?: string;
  };
  readonly type: 'CLIENT' | 'PROVIDER';
  // Provider-specific (cuando type === 'PROVIDER')
  readonly serviceAreas?: readonly string[];
  readonly isVerified?: boolean;
}
```

**Repository Port (Interface):**
```typescript
// packages/domain/src/ports/user.repository.ts (EXTEND)
interface IUserRepository {
  // ... existing methods ...
  
  /**
   * Busca usuarios para discovery (excluye usuario logueado)
   * @param excludeUserId - ID del usuario que realiza la búsqueda
   * @param options - Filtros, búsqueda, paginación
   */
  findForDiscovery(
    excludeUserId: UserId,
    options: {
      page: number;
      limit: number;
      searchTerm?: string; // Busca en companyName
      type?: 'CLIENT' | 'PROVIDER';
    }
  ): Promise<{
    items: User[]; // Entidades completas (se mapearán a public profile en use case)
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
```

**Notes:**
- NO se requiere nueva entidad
- Reutiliza `User` entity existente
- El use case/controller mapea `User` → `IUserPublicProfile`

#### 2.3.2 Application Layer (`apps/backend/src/application/identity`)

**Use Case:**
```
apps/backend/src/application/identity/
  └── discover-users.use-case.ts (NEW)
```

**Responsabilidades:**
1. Recibir userId del usuario autenticado (desde JWT)
2. Validar paginación y filtros
3. Llamar `userRepository.findForDiscovery()`
4. Mapear `User[]` → `IUserPublicProfile[]` (sanitizar datos)
5. Retornar resultado paginado

**Ejemplo Input:**
```typescript
{
  userId: string; // Usuario autenticado (excluir de resultados)
  page: number;
  limit: number;
  searchTerm?: string;
  type?: 'CLIENT' | 'PROVIDER';
}
```

**Ejemplo Output:**
```typescript
Result<{
  profiles: IUserPublicProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}, DomainError>
```

#### 2.3.3 Persistence Layer (`packages/persistence`)

**Repository Implementation:**
```
packages/persistence/src/repositories/user.repository.ts (EXTEND)
```

**Método a implementar:**
```typescript
async findForDiscovery(
  excludeUserId: UserId,
  options: { ... }
): Promise<PaginatedResult<User>> {
  // MongoDB query:
  // - filter: { _id: { $ne: excludeUserId }, isActive: true }
  // - search: { 'profile.companyName': { $regex: searchTerm, $options: 'i' } }
  // - filter type: { type: options.type }
  // - pagination: skip, limit
  // - projection: excluir passwordHash, notifications
}
```

**Consideraciones:**
- Usar índice existente en `user.name` (si existe) o equivalente
- Proyección para excluir campos sensibles: `passwordHash`, `notifications`
- Mapear documentos → entidades `User` con `documentToEntity()`

#### 2.3.4 Contracts Layer (`packages/contracts`)

**Zod Schemas (propuestas):**
```
packages/contracts/src/user-discovery.contract.ts (NEW)
```

```typescript
// Query params validation
export const DiscoverUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  searchTerm: z.string().min(1).max(100).optional(),
  type: z.enum(['CLIENT', 'PROVIDER']).optional()
});

// Response DTO
export const UserPublicProfileSchema = z.object({
  id: z.string(),
  profile: z.object({
    companyName: z.string().optional()
  }),
  type: z.enum(['CLIENT', 'PROVIDER']),
  // Provider-specific
  serviceAreas: z.array(z.string()).optional(),
  isVerified: z.boolean().optional()
});

export const DiscoverUsersResponseSchema = z.object({
  profiles: z.array(UserPublicProfileSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
});

export type DiscoverUsersQuery = z.infer<typeof DiscoverUsersQuerySchema>;
export type UserPublicProfile = z.infer<typeof UserPublicProfileSchema>;
export type DiscoverUsersResponse = z.infer<typeof DiscoverUsersResponseSchema>;
```

#### 2.3.5 Interfaces Layer (HTTP)

**Controller (propuestas):**
```
apps/backend/src/controllers/user-discovery.controller.ts (NEW)
```

**Endpoint:**
```
GET /api/v1/users/discover
  ?page=1
  &limit=20
  &searchTerm=logistics
  &type=PROVIDER

Authentication: Required (JWT)
Response: 200 OK { success, data: DiscoverUsersResponse }
```

**Router:**
```
apps/backend/src/routes/user-discovery.routes.ts (NEW)
```

```typescript
router.get('/discover',
  authMiddleware,
  validateRequest({ query: DiscoverUsersQuerySchema }),
  userDiscoveryController.discover.bind(userDiscoveryController)
);
```

---

## 3. Módulo 2: Contact Management (Gestión de Contactos)

### 3.1 Descripción Funcional

Permite que un usuario gestione una **agenda personal de contactos** (otros usuarios con los que interactúa frecuentemente).

**Características clave:**
- Relación **unidireccional** (A agrega a B como contacto, pero B no necesariamente a A)
- Agregar/remover contactos
- Listar contactos del usuario
- **NO** requiere aceptación mutua (MVP)
- **NO** gestiona solicitudes pendientes ni "amistades bidireccionales"

### 3.2 Reglas de Negocio

1. **Relación de Contacto:**
   - Un usuario puede tener N contactos
   - Relación es unidireccional (contacto ≠ amistad)
   - Agregar contacto es idempotente (no duplica si ya existe)

2. **Validaciones:**
   - Usuario NO puede agregarse a sí mismo como contacto
   - NO puede agregar usuarios inactivos
   - NO puede agregar usuarios que no existen
   - NO puede tener contactos duplicados

3. **Persistencia:**
   - Contactos se guardan como **subdocumento** en `User`
   - Estructura: `contacts: [{ contactUserId, addedAt }]`
   - Decisión: subdocumento (vs tabla separada) por simplicidad MVP y bajo volumen esperado

### 3.3 Componentes Técnicos Backend

#### 3.3.1 Domain Layer

**Model Interface (propuestas):**
```typescript
// packages/domain/src/models/interfaces.ts (EXTEND IUser)
export interface IContact {
  readonly contactUserId: string;
  readonly addedAt: Date;
}

export interface IUser extends IBaseEntity {
  // ... existing fields ...
  readonly contacts?: readonly IContact[]; // NEW
}
```

**Value Object (propuesto, opcional):**
```
packages/domain/src/value-objects/contact.vo.ts (NEW - opcional)
```

Si se decide encapsular lógica de validación de contacto:
```typescript
export class Contact {
  private constructor(
    private readonly contactUserId: UserId,
    private readonly addedAt: Date
  ) {}
  
  static create(contactUserId: string): Result<Contact, DomainError> {
    const userIdResult = UserId.create(contactUserId);
    if (!userIdResult.success) return err(userIdResult.error);
    
    return ok(new Contact(userIdResult.data, new Date()));
  }
  
  toPublicInterface(): IContact {
    return {
      contactUserId: this.contactUserId.getValue(),
      addedAt: this.addedAt
    };
  }
}
```

**Repository Port (propuesto):**
```typescript
// packages/domain/src/ports/user.repository.ts (EXTEND)
interface IUserRepository {
  // ... existing methods ...
  
  /**
   * Agrega un contacto al array de contactos del usuario
   * Idempotente: no duplica si ya existe
   */
  addContact(
    userId: UserId,
    contactUserId: UserId
  ): Promise<Result<void, DomainError>>;
  
  /**
   * Remueve un contacto del array
   */
  removeContact(
    userId: UserId,
    contactUserId: UserId
  ): Promise<Result<void, DomainError>>;
  
  /**
   * Obtiene los contactos de un usuario con sus perfiles públicos
   * @returns Lista de usuarios que son contactos (entidades completas)
   */
  getContacts(userId: UserId): Promise<Result<User[], DomainError>>;
  
  /**
   * Verifica si un usuario ya es contacto (evitar duplicados)
   */
  isContact(userId: UserId, contactUserId: UserId): Promise<boolean>;
}
```

#### 3.3.2 Application Layer

**Use Cases (propuestos):**
```
apps/backend/src/application/identity/
  ├── add-contact.use-case.ts (NEW)
  ├── remove-contact.use-case.ts (NEW)
  └── list-contacts.use-case.ts (NEW)
```

**1. AddContactUseCase**

Input:
```typescript
{
  userId: string; // Usuario que agrega
  contactUserId: string; // Usuario a agregar
}
```

Flujo:
1. Validar que `contactUserId` existe y está activo
2. Validar `contactUserId !== userId` (no auto-contacto)
3. Verificar si ya es contacto (`isContact`)
4. Llamar `userRepository.addContact()`

Output: `Result<void, DomainError>`

**2. RemoveContactUseCase**

Input:
```typescript
{
  userId: string;
  contactUserId: string;
}
```

Flujo:
1. Llamar `userRepository.removeContact()`
2. Retornar resultado

Output: `Result<void, DomainError>`

**3. ListContactsUseCase**

Input:
```typescript
{
  userId: string;
}
```

Flujo:
1. Llamar `userRepository.getContacts(userId)`
2. Mapear `User[]` → `IUserPublicProfile[]`
3. Retornar lista

Output: `Result<IUserPublicProfile[], DomainError>`

#### 3.3.3 Persistence Layer

**Schema Extension (propuesto):**
```typescript
// packages/persistence/src/models/user.model.ts (EXTEND)

const ContactSchema = new Schema({
  contactUserId: { type: Schema.Types.ObjectId, required: true },
  addedAt: { type: Date, default: Date.now }
}, { _id: false });

const UserSchema = new Schema({
  // ... existing fields ...
  contacts: {
    type: [ContactSchema],
    default: []
  }
});

// Índice para búsquedas rápidas: "¿userId ya tiene a contactUserId?"
UserSchema.index({ _id: 1, 'contacts.contactUserId': 1 });
```

**Repository Methods (propuestos):**
```typescript
// packages/persistence/src/repositories/user.repository.ts (EXTEND)

async addContact(userId: UserId, contactUserId: UserId): Promise<Result<void, DomainError>> {
  // Validar que contactUserId existe y está activo
  const contactExists = await UserModel.findOne({
    _id: new Types.ObjectId(contactUserId.getValue()),
    isActive: true
  });
  
  if (!contactExists) {
    return err(DomainError.notFound('Contact user not found or inactive'));
  }
  
  // Usar $addToSet para evitar duplicados
  await UserModel.updateOne(
    { _id: new Types.ObjectId(userId.getValue()) },
    {
      $addToSet: {
        contacts: {
          contactUserId: new Types.ObjectId(contactUserId.getValue()),
          addedAt: new Date()
        }
      }
    }
  );
  
  return ok(undefined);
}

async removeContact(userId: UserId, contactUserId: UserId): Promise<Result<void, DomainError>> {
  await UserModel.updateOne(
    { _id: new Types.ObjectId(userId.getValue()) },
    {
      $pull: {
        contacts: { contactUserId: new Types.ObjectId(contactUserId.getValue()) }
      }
    }
  );
  
  return ok(undefined);
}

async getContacts(userId: UserId): Promise<Result<User[], DomainError>> {
  // 1. Obtener user con sus contactos
  const userDoc = await UserModel.findById(userId.getValue());
  if (!userDoc) return err(DomainError.notFound('User not found'));
  
  // 2. Extraer IDs de contactos
  const contactIds = userDoc.contacts.map(c => c.contactUserId);
  
  // 3. Buscar usuarios que son contactos
  const contactDocs = await UserModel.find({
    _id: { $in: contactIds },
    isActive: true // Solo contactos activos
  });
  
  // 4. Mapear a entidades
  const contacts = await Promise.all(
    contactDocs.map(doc => this.documentToEntity(doc))
  );
  
  return ok(contacts);
}

async isContact(userId: UserId, contactUserId: UserId): Promise<boolean> {
  const user = await UserModel.findOne({
    _id: new Types.ObjectId(userId.getValue()),
    'contacts.contactUserId': new Types.ObjectId(contactUserId.getValue())
  });
  
  return !!user;
}
```

#### 3.3.4 Contracts Layer

**Zod Schemas (propuestos):**
```
packages/contracts/src/contact.contract.ts (NEW)
```

```typescript
// Path params
export const ContactUserIdParamSchema = z.object({
  contactUserId: z.string().min(1, 'Contact user ID is required')
});

// Response DTOs reutilizan UserPublicProfileSchema de discovery

export type ContactUserIdParam = z.infer<typeof ContactUserIdParamSchema>;
```

#### 3.3.5 Interfaces Layer (HTTP)

**Controller (propuesto):**
```
apps/backend/src/controllers/contact.controller.ts (NEW)
```

**Endpoints:**
```
POST   /api/v1/users/me/contacts/:contactUserId
DELETE /api/v1/users/me/contacts/:contactUserId
GET    /api/v1/users/me/contacts

Authentication: Required (JWT)
```

**Router:**
```
apps/backend/src/routes/contact.routes.ts (NEW)
```

```typescript
router.post('/me/contacts/:contactUserId',
  authMiddleware,
  validateRequest({ params: ContactUserIdParamSchema }),
  contactController.add.bind(contactController)
);

router.delete('/me/contacts/:contactUserId',
  authMiddleware,
  validateRequest({ params: ContactUserIdParamSchema }),
  contactController.remove.bind(contactController)
);

router.get('/me/contacts',
  authMiddleware,
  contactController.list.bind(contactController)
);
```

---

## 4. Módulo 3: Messaging (Chat 1-a-1 Simple)

### 4.1 Descripción Funcional

Permite **comunicación directa entre dos usuarios que son contactos mutuos** (o al menos uno tiene al otro como contacto).

**Características MVP:**
- Chat 1-a-1 (punto a punto)
- Mensajes de texto simple
- Historial con fecha/hora
- Paginación de historial
- **NO** incluir: estados de lectura, multimedia, edición/eliminación de mensajes, notificaciones push en tiempo real (por el momento)

### 4.2 Reglas de Negocio

1. **Permisos:**
   - Validación: verificar que `userId` tiene a `recipientId` como contacto
   - Permitir si al menos uno tiene al otro como contacto

2. **Mensajes:**
   - Contenido: texto plano, máximo 1000 caracteres
   - Metadata: senderId, recipientId, timestamp, texto
   - Mensajes son **inmutables** (no edición/eliminación en MVP)

3. **Persistencia:**
   - Mensajes como **documentos independientes** (no subdocumentos)
   - Colección: `messages`
   - Decisión: evitar crecimiento no controlado de documentos de usuario; mensajes tienen su propio ciclo de vida

4. **Historial:**
   - Paginación obligatoria (límite 50 mensajes por request)
   - Orden cronológico descendente (más recientes primero)
   - Filtro: conversación entre dos usuarios específicos

### 4.3 Componentes Técnicos Backend

#### 4.3.1 Domain Layer

**Entity (propuesta):**
*Evaluar si es realmente necesaria su implementación*
*Considerar si un simple DTO podría ser suficiente para el MVP*
```
packages/domain/src/entities/message/
  ├── message.entity.ts (NEW)
  └── index.ts
```

```typescript
// message.entity.ts
export interface MessageProps {
  id: MessageId; // Value Object (nuevo)
  senderId: UserId;
  recipientId: UserId;
  content: string;
  sentAt: Date;
}

export class Message {
  private constructor(private props: MessageProps) {}
  
  static create(createProps: {
    senderId: string;
    recipientId: string;
    content: string;
  }): Result<Message, DomainError> {
    // Validaciones:
    // - content no vacío, max 1000 chars
    // - senderId !== recipientId
    // - Crear MessageId único
    
    const messageIdResult = MessageId.create();
    const senderIdResult = UserId.create(createProps.senderId);
    const recipientIdResult = UserId.create(createProps.recipientId);
    
    if (!senderIdResult.success) return err(senderIdResult.error);
    if (!recipientIdResult.success) return err(recipientIdResult.error);
    
    if (createProps.senderId === createProps.recipientId) {
      return err(DomainError.validationError('Cannot send message to self'));
    }
    
    if (!createProps.content || createProps.content.trim().length === 0) {
      return err(DomainError.validationError('Message content cannot be empty'));
    }
    
    if (createProps.content.length > 1000) {
      return err(DomainError.validationError('Message content exceeds 1000 characters'));
    }
    
    const props: MessageProps = {
      id: messageIdResult.data,
      senderId: senderIdResult.data,
      recipientId: recipientIdResult.data,
      content: createProps.content.trim(),
      sentAt: new Date()
    };
    
    return ok(new Message(props));
  }
  
  static fromEntityData(data: {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    sentAt: Date | string;
  }): Result<Message, DomainError> {
    // Reconstruir desde persistencia
    const messageIdResult = MessageId.create(data.id);
    const senderIdResult = UserId.create(data.senderId);
    const recipientIdResult = UserId.create(data.recipientId);
    
    if (!messageIdResult.success) return err(messageIdResult.error);
    if (!senderIdResult.success) return err(senderIdResult.error);
    if (!recipientIdResult.success) return err(recipientIdResult.error);
    
    const sentAt = typeof data.sentAt === 'string' ? new Date(data.sentAt) : data.sentAt;
    
    const props: MessageProps = {
      id: messageIdResult.data,
      senderId: senderIdResult.data,
      recipientId: recipientIdResult.data,
      content: data.content,
      sentAt
    };
    
    return ok(new Message(props));
  }
  
  toPublicInterface(): IMessage {
    return {
      id: this.props.id.getValue(),
      senderId: this.props.senderId.getValue(),
      recipientId: this.props.recipientId.getValue(),
      content: this.props.content,
      sentAt: this.props.sentAt
    };
  }
  
  // Getters
  get id() { return this.props.id; }
  get senderId() { return this.props.senderId; }
  get recipientId() { return this.props.recipientId; }
  get content() { return this.props.content; }
  get sentAt() { return this.props.sentAt; }
}
```

**Value Object (propuesto):**
```
packages/domain/src/value-objects/message-id.vo.ts (NEW)
```

Similar a `MachineId`, `UserId`:
```typescript
export class MessageId {
  private constructor(private readonly value: string) {}
  
  static create(id?: string): Result<MessageId, DomainError> {
    const finalId = id || `message_${generateNanoId()}`;
    
    if (!finalId.startsWith('message_')) {
      return err(DomainError.validationError('Invalid MessageId format'));
    }
    
    return ok(new MessageId(finalId));
  }
  
  getValue(): string { return this.value; }
  equals(other: MessageId): boolean { return this.value === other.value; }
}
```

**Interface (propuesta):**
```typescript
// packages/domain/src/models/interfaces.ts (ADD)
export interface IMessage {
  readonly id: string;
  readonly senderId: string;
  readonly recipientId: string;
  readonly content: string;
  readonly sentAt: Date;
}
```

**Repository Port (propuesto):**
```typescript
// packages/domain/src/ports/message.repository.ts (NEW)
export interface IMessageRepository {
  /**
   * Guarda un nuevo mensaje
   */
  save(message: Message): Promise<Result<void, DomainError>>;
  
  /**
   * Obtiene el historial de conversación entre dos usuarios
   * Paginado, orden cronológico descendente (más recientes primero)
   */
  getConversationHistory(
    userId1: UserId,
    userId2: UserId,
    options: {
      page: number;
      limit: number;
    }
  ): Promise<{
    messages: Message[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  
  /**
   * Busca un mensaje por ID (para auditoría futura)
   */
  findById(id: MessageId): Promise<Result<Message, DomainError>>;
}
```

#### 4.3.2 Application Layer

**Use Cases (propuestos):**
```
apps/backend/src/application/comms/
  ├── send-message.use-case.ts (NEW)
  └── get-conversation-history.use-case.ts (NEW)
```

**1. SendMessageUseCase**

Input:
```typescript
{
  senderId: string; // Usuario autenticado
  recipientId: string;
  content: string;
}
```

Flujo:
1. Validar que `senderId` y `recipientId` existen y están activos
2. **Validar relación de contacto:**
   - Verificar `userRepository.isContact(senderId, recipientId)` es true
   - (O permitir si recipientId tiene a senderId como contacto)
3. Crear entidad `Message` con `Message.create()`
4. Persistir con `messageRepository.save(message)`
5. (Opcional POST-MVP: registrar evento de dominio para notificación)

Output: `Result<IMessage, DomainError>`

**2. GetConversationHistoryUseCase**

Input:
```typescript
{
  userId: string; // Usuario autenticado
  otherUserId: string; // Usuario con quien conversa
  page: number;
  limit: number;
}
```

Flujo:
1. Validar que ambos usuarios existen
2. Validar relación de contacto (opcional: permitir ver historial si alguna vez fueron contactos)
3. Llamar `messageRepository.getConversationHistory()`
4. Mapear `Message[]` → `IMessage[]`
5. Retornar historial paginado

Output:
```typescript
Result<{
  messages: IMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}, DomainError>
```

#### 4.3.3 Persistence Layer

**Mongoose Model (propuesto):**
```
packages/persistence/src/models/message.model.ts (NEW)
```

```typescript
import { Schema, model, Document } from 'mongoose';
import type { IMessage } from '@packages/domain';

export interface IMessageDocument extends Omit<IMessage, 'id'>, Document {
  _id: string; // MessageId string (no ObjectId)
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    _id: { type: String, required: true }, // message_xxxx
    senderId: { type: String, required: true, index: true },
    recipientId: { type: String, required: true, index: true },
    content: { type: String, required: true, maxlength: 1000 },
    sentAt: { type: Date, required: true, default: Date.now }
  },
  {
    _id: false, // Usamos _id string custom
    timestamps: false, // Ya tenemos sentAt manual
    collection: 'messages'
  }
);

// Índice compuesto para queries de conversación
MessageSchema.index({ senderId: 1, recipientId: 1, sentAt: -1 });
MessageSchema.index({ recipientId: 1, senderId: 1, sentAt: -1 });

export const MessageModel = model<IMessageDocument>('Message', MessageSchema);
```

**Repository Implementation (propuesto):**
```
packages/persistence/src/repositories/message.repository.ts (NEW)
```

```typescript
import { IMessageRepository } from '@packages/domain/ports';
import { Message, MessageId, UserId, Result, ok, err, DomainError } from '@packages/domain';
import { MessageModel } from '../models/message.model';
import { Types } from 'mongoose';

export class MessageRepository implements IMessageRepository {
  async save(message: Message): Promise<Result<void, DomainError>> {
    try {
      const messageData = message.toPublicInterface();
      
      await MessageModel.create({
        _id: messageData.id,
        senderId: messageData.senderId,
        recipientId: messageData.recipientId,
        content: messageData.content,
        sentAt: messageData.sentAt
      });
      
      return ok(undefined);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error saving message: ${error.message}`));
    }
  }
  
  async getConversationHistory(
    userId1: UserId,
    userId2: UserId,
    options: { page: number; limit: number }
  ): Promise<{
    messages: Message[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    
    const user1Id = userId1.getValue();
    const user2Id = userId2.getValue();
    
    // Query: mensajes donde (sender=user1 AND recipient=user2) OR (sender=user2 AND recipient=user1)
    const filter = {
      $or: [
        { senderId: user1Id, recipientId: user2Id },
        { senderId: user2Id, recipientId: user1Id }
      ]
    };
    
    const [messageDocs, total] = await Promise.all([
      MessageModel.find(filter)
        .sort({ sentAt: -1 }) // Más recientes primero
        .skip(skip)
        .limit(limit)
        .lean(),
      MessageModel.countDocuments(filter)
    ]);
    
    // Mapear a entidades
    const messages = messageDocs
      .map(doc => Message.fromEntityData({
        id: doc._id,
        senderId: doc.senderId,
        recipientId: doc.recipientId,
        content: doc.content,
        sentAt: doc.sentAt
      }))
      .filter(result => result.success)
      .map(result => result.data as Message);
    
    const totalPages = Math.ceil(total / limit);
    
    return { messages, total, page, limit, totalPages };
  }
  
  async findById(id: MessageId): Promise<Result<Message, DomainError>> {
    try {
      const doc = await MessageModel.findById(id.getValue()).lean();
      
      if (!doc) {
        return err(DomainError.notFound('Message not found'));
      }
      
      return Message.fromEntityData({
        id: doc._id,
        senderId: doc.senderId,
        recipientId: doc.recipientId,
        content: doc.content,
        sentAt: doc.sentAt
      });
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error finding message: ${error.message}`));
    }
  }
}
```

#### 4.3.4 Contracts Layer

**Zod Schemas (propuestos):**
```
packages/contracts/src/message.contract.ts (NEW)
```

```typescript
import { z } from 'zod';

// Request body para enviar mensaje
export const SendMessageRequestSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
  content: z.string()
    .min(1, 'Message content cannot be empty')
    .max(1000, 'Message content exceeds 1000 characters')
    .trim()
});

// Path params para obtener historial
export const ConversationParamsSchema = z.object({
  otherUserId: z.string().min(1, 'Other user ID is required')
});

// Query params para paginación
export const ConversationHistoryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20)
});

// Response DTO para mensaje
export const MessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  recipientId: z.string(),
  content: z.string(),
  sentAt: z.coerce.date()
});

// Response DTO para historial
export const ConversationHistoryResponseSchema = z.object({
  messages: z.array(MessageSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
});

// Type exports
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;
export type ConversationParams = z.infer<typeof ConversationParamsSchema>;
export type ConversationHistoryQuery = z.infer<typeof ConversationHistoryQuerySchema>;
export type MessageDTO = z.infer<typeof MessageSchema>;
export type ConversationHistoryResponse = z.infer<typeof ConversationHistoryResponseSchema>;
```

#### 4.3.5 Interfaces Layer (HTTP)

**Controller (propuesto):**
```
apps/backend/src/controllers/message.controller.ts (NEW)
```

**Endpoints (propuestos):**
```
POST /api/v1/messages
  Body: { recipientId, content }
  Response: 201 Created { success, data: MessageDTO }

GET /api/v1/messages/conversations/:otherUserId
  Query: ?page=1&limit=20
  Response: 200 OK { success, data: ConversationHistoryResponse }

Authentication: Required (JWT)
```

**Router (propuesto):**
```
apps/backend/src/routes/message.routes.ts (NEW)
```

```typescript
import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { requestSanitization } from '../middlewares/requestSanitization';
import {
  SendMessageRequestSchema,
  ConversationParamsSchema,
  ConversationHistoryQuerySchema
} from '@packages/contracts';

const router = Router();
const messageController = new MessageController();

router.post('/',
  requestSanitization,
  authMiddleware,
  validateRequest({ body: SendMessageRequestSchema }),
  messageController.send.bind(messageController)
);

router.get('/conversations/:otherUserId',
  authMiddleware,
  validateRequest({
    params: ConversationParamsSchema,
    query: ConversationHistoryQuerySchema
  }),
  messageController.getHistory.bind(messageController)
);

export default router;
```

---

## 5. Consideraciones Transversales

### 5.1 Seguridad y Permisos

1. **Autenticación:**
   - Todos los endpoints requieren JWT válido
   - Usuario autenticado se extrae del token

2. **Autorización:**
   - User Discovery: cualquier usuario autenticado
   - Contact Management: solo el dueño puede modificar sus contactos
   - Messaging: solo entre contactos (validar relación)

3. **Rate Limiting:**
   - Aplicar rate limit específico a endpoints de mensajería
   - Ejemplo: máximo 50 mensajes por hora por usuario

4. **Sanitización:**
   - Sanitizar contenido de mensajes (evitar XSS)
   - Middleware `requestSanitization` ya existe

### 5.2 Consistencia de Datos

1. **Integridad Referencial:**
   - Validar que `contactUserId` y `recipientId` existen antes de guardar
   - No usar referencias de MongoDB (mantener IDs como strings por diseño actual)

2. **Transacciones:**
   - No son críticas para MVP (operaciones atómicas simples)
   - POST-MVP: considerar para operaciones complejas

3. **Cleanup:**
   - Si un usuario se desactiva (`isActive: false`):
     - Mantener contactos intactos (para historial)
     - Prevenir nuevos mensajes (validar `isActive` en SendMessageUseCase)

### 5.3 Escalabilidad

1. **Paginación Obligatoria:**
   - Discovery: límite 50 resultados
   - Historial de mensajes: límite 50 mensajes
   - Previene carga excesiva de datos

2. **Índices MongoDB:**
   - User: `{ _id: 1, 'contacts.contactUserId': 1 }`
   - Message: `{ senderId: 1, recipientId: 1, sentAt: -1 }`

3. **Límites de Crecimiento:**
   - Contactos: sin límite técnico (realista <1000 por usuario)
   - Mensajes: documentos independientes (no afecta tamaño de User)

### 5.4 Puntos de Extensión Futura (POST-MVP)

**NO implementar ahora, solo documentar:**

1. **Messaging Avanzado:**
   - Estados de lectura (`isRead`, `readAt`)
   - Notificaciones push en tiempo real (WebSocket)
   - Edición/eliminación de mensajes
   - Mensajes con multimedia (imágenes, archivos)

2. **Contact Management:**
   - Solicitudes de contacto (aceptar/rechazar)
   - Relación bidireccional ("amistad")
   - Etiquetas/grupos de contactos

3. **User Discovery:**
   - Búsqueda avanzada (por ubicación, servicios)
   - Recomendaciones de contactos
   - Perfiles públicos enriquecidos

4. **Grupos y Canales:**
   - Chat grupal (1-a-N)
   - Canales de difusión
   - Roles y permisos en grupos

5. **Notificaciones:**
   - Integrar con sistema de notificaciones existente
   - Notificar nuevo mensaje recibido
   - Email/SMS para mensajes importantes

---

## 6. Checklist de Implementación

### Módulo 1: User Discovery

- [ ] **Domain Layer**
  - [ ] Extender `IUserPublicProfile` en `interfaces.ts`
  - [ ] Agregar método `findForDiscovery()` a `IUserRepository`
- [ ] **Application Layer**
  - [ ] Implementar `DiscoverUsersUseCase`
- [ ] **Persistence Layer**
  - [ ] Implementar `findForDiscovery()` en `UserRepository`
  - [ ] Crear índice en `profile.companyName` (si no existe)
- [ ] **Contracts Layer**
  - [ ] Crear `user-discovery.contract.ts` con schemas Zod
  - [ ] Exportar en `index.ts`
- [ ] **Interfaces Layer**
  - [ ] Crear `UserDiscoveryController`
  - [ ] Crear `user-discovery.routes.ts`
  - [ ] Montar router en `routes/index.ts`
- [ ] **Testing**
  - [ ] Unit tests para use case
  - [ ] Integration tests para endpoint

### Módulo 2: Contact Management

- [ ] **Domain Layer**
  - [ ] Extender `IUser` con `contacts: IContact[]`
  - [ ] (Opcional) Crear `Contact` Value Object
  - [ ] Agregar métodos de contactos a `IUserRepository`
- [ ] **Application Layer**
  - [ ] Implementar `AddContactUseCase`
  - [ ] Implementar `RemoveContactUseCase`
  - [ ] Implementar `ListContactsUseCase`
- [ ] **Persistence Layer**
  - [ ] Extender `UserSchema` con `contacts` subdocumento
  - [ ] Crear índice `{ _id: 1, 'contacts.contactUserId': 1 }`
  - [ ] Implementar métodos en `UserRepository`
- [ ] **Contracts Layer**
  - [ ] Crear `contact.contract.ts`
  - [ ] Exportar en `index.ts`
- [ ] **Interfaces Layer**
  - [ ] Crear `ContactController`
  - [ ] Crear `contact.routes.ts`
  - [ ] Montar router en `routes/index.ts`
- [ ] **Testing**
  - [ ] Unit tests para use cases
  - [ ] Integration tests para endpoints

### Módulo 3: Messaging

- [ ] **Domain Layer**
  - [ ] Crear entidad `Message` (`message.entity.ts`)
  - [ ] Crear `MessageId` Value Object
  - [ ] Agregar `IMessage` interface
  - [ ] Crear `IMessageRepository` port
  - [ ] Exportar en `index.ts`
- [ ] **Application Layer**
  - [ ] Implementar `SendMessageUseCase`
  - [ ] Implementar `GetConversationHistoryUseCase`
- [ ] **Persistence Layer**
  - [ ] Crear `MessageModel` (Mongoose schema)
  - [ ] Crear índices compuestos
  - [ ] Implementar `MessageRepository`
  - [ ] Exportar en `repositories/index.ts`
- [ ] **Contracts Layer**
  - [ ] Crear `message.contract.ts`
  - [ ] Exportar en `index.ts`
- [ ] **Interfaces Layer**
  - [ ] Crear `MessageController`
  - [ ] Crear `message.routes.ts`
  - [ ] Montar router en `routes/index.ts`
- [ ] **Testing**
  - [ ] Unit tests para entidad `Message`
  - [ ] Unit tests para use cases
  - [ ] Integration tests para endpoints

### Transversal

- [ ] **Documentación**
  - [ ] Actualizar Swagger/OpenAPI con nuevos endpoints
  - [ ] Documentar decisiones de arquitectura
- [ ] **Seguridad**
  - [ ] Configurar rate limiting para messaging
  - [ ] Verificar sanitización de inputs
- [ ] **Monitoreo**
  - [ ] Agregar logs estructurados (pino)
  - [ ] Métricas de uso (opcional)

---

## 7. Decisiones Técnicas Clave

| Decisión | Opción Elegida | Justificación |
|----------|---------------|---------------|
| **Persistencia de contactos** | Subdocumento en `User` | Simplicidad MVP, bajo volumen esperado, acceso frecuente junto a datos de usuario |
| **Persistencia de mensajes** | Documentos independientes | Evitar crecimiento no controlado de documentos de usuario; mensajes tienen ciclo de vida propio |
| **Relación de contacto** | Unidireccional | MVP simplificado; no requiere aceptación mutua |
| **Permisos de mensajería** | Solo entre contactos | Prevenir spam; flujo natural: discovery → contacto → mensaje |
| **Paginación de historial** | Obligatoria (max 50) | Prevenir carga excesiva; optimizar performance |
| **ID de mensaje** | String custom (`message_xxx`) | Consistencia con `MachineId`, `UserId`; facilita debugging |
| **Índices MongoDB** | Compuestos en conversaciones | Optimizar queries frecuentes (historial entre dos usuarios) |
| **Value Objects** | `MessageId` necesario, `Contact` opcional | Encapsular lógica de validación; mantener consistencia con patrón DDD |

---

## 8. Notas de Alcance MVP

### ✅ Incluido en MVP

- Exploración básica de usuarios
- Gestión simple de contactos (agregar/remover/listar)
- Chat 1-a-1 entre contactos
- Historial paginado
- Validaciones de seguridad básicas

### ❌ Fuera de Alcance MVP (POST-MVP)

- Grupos y chat grupal
- Estados de lectura
- Notificaciones push en tiempo real (WebSocket)
- Multimedia (imágenes, archivos)
- Edición/eliminación de mensajes
- Solicitudes de contacto con aceptación
- Búsqueda avanzada de usuarios
- Recomendaciones de contactos
- Roles y permisos complejos

---

## 9. Glosario

- **Discovery:** Proceso de explorar y encontrar otros usuarios en la plataforma
- **Contacto:** Usuario agregado a la agenda personal (relación unidireccional)
- **Conversación:** Historial de mensajes entre dos usuarios
- **Subdocumento:** Estructura embebida dentro de un documento MongoDB
- **Documento independiente:** Colección separada en MongoDB con su propia identidad
- **Value Object (VO):** Objeto inmutable que encapsula un valor con validaciones (DDD)
- **Port:** Interface que define un contrato (patrón Hexagonal/Clean Architecture)
- **Use Case:** Orquestador de lógica de aplicación (capa Application)

---

**Fin del Documento de Especificación**

Este documento es una referencia técnica para el desarrollo completo de la feature de comunicación entre usuarios. No incluye implementación detallada de código ni diseño de UI, pero proporciona toda la información necesaria para que el equipo de desarrollo implemente la solución de forma consistente con la arquitectura existente de FleetMan.
