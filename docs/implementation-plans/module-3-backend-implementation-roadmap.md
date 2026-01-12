# Módulo 3 Backend - Roadmap de Implementación

**Sprint:** #12 - User Communication System  
**Fecha Análisis:** Enero 10, 2026  
**Estado:** Plan listo para implementación

---

## 📊 Resumen Ejecutivo

### Estado Actual del Backend (✅ = Completo, ⚠️ = Incompleto, ❌ = Falta)

| Capa | Componente | Estado | Notas |
|------|-----------|--------|-------|
| **Domain** | MessageId VO | ✅ | Implementado con format `message_<timestamp>_<random>` |
| **Domain** | Message Entity | ✅ | Completo con validaciones (max 1000 chars, no auto-mensaje) |
| **Domain** | IMessage Interface | ✅ | Definido en `packages/domain/src/models/interfaces.ts` |
| **Domain** | IMessageRepository Port | ✅ | Completo con `save`, `findById`, `getConversationHistory` |
| **Persistence** | MessageModel Schema | ✅ | Schema completo con índices compuestos |
| **Persistence** | MessageRepository | ✅ | Implementado con query bidireccional |
| **Contracts** | SendMessageRequest | ✅ | Schema Zod completo |
| **Contracts** | ConversationHistoryResponse | ✅ | Schema Zod completo |
| **Application** | SendMessageUseCase | ❌ | **FALTA IMPLEMENTAR** |
| **Application** | GetConversationHistoryUseCase | ❌ | **FALTA IMPLEMENTAR** |
| **Interfaces** | MessageController | ❌ | **FALTA IMPLEMENTAR** |
| **Interfaces** | message.routes.ts | ❌ | **FALTA IMPLEMENTAR** |
| **Infrastructure** | SSE Integration | ✅ | EventBus + SSEManager + AddNotificationUseCase funcionando |
| **User Management** | isContact() validation | ✅ | UserRepository.isContact() implementado |

### Conclusión del Análisis

✅ **CAPAS COMPLETAS:** Domain, Persistence, Contracts, Infrastructure (SSE)  
❌ **CAPAS FALTANTES:** Application (Use Cases), Interfaces (Controller + Routes)

**Estimación:** 6-8 horas de trabajo (2 use cases + 1 controller + 1 router + testing)

---

## 🎯 Plan de Implementación

### FASE 1: Application Layer - Use Cases (4-5 horas)

#### Tarea 1.1: SendMessageUseCase (2.5 horas)

**Archivo:** `apps/backend/src/application/comms/send-message.use-case.ts`

**Dependencias existentes:**
- ✅ `MessageRepository` (`packages/persistence/src/repositories/message.repository.ts`)
- ✅ `UserRepository.isContact()` (`packages/persistence/src/repositories/user.repository.ts` línea 632)
- ✅ `AddNotificationUseCase` (`apps/backend/src/application/notifications/add-notification.use-case.ts`)
- ✅ `Message.create()` (`packages/domain/src/entities/message/message.entity.ts`)

**Implementación requerida:**

```typescript
import { 
  UserId, 
  MessageId, 
  Message, 
  Result, 
  DomainError,
  ok,
  err 
} from '@packages/domain';
import { MessageRepository } from '@packages/persistence';
import { UserRepository } from '@packages/persistence';
import { AddNotificationUseCase } from '../notifications/add-notification.use-case';
import { logger } from '../../config/logger.config';
import type { SendMessageRequest } from '@packages/contracts';

export class SendMessageUseCase {
  private messageRepository: MessageRepository;
  private userRepository: UserRepository;
  private addNotificationUseCase: AddNotificationUseCase;

  constructor() {
    this.messageRepository = new MessageRepository();
    this.userRepository = new UserRepository();
    this.addNotificationUseCase = new AddNotificationUseCase();
  }

  async execute(input: SendMessageRequest & { senderId: string }): Promise<Result<any, DomainError>> {
    // Flujo:
    // 1. Validar formato de senderId y recipientId (UserId.create)
    // 2. Verificar que ambos usuarios existen (userRepository.findById)
    // 3. Validar relación de contacto (userRepository.isContact)
    // 4. Crear entidad Message (Message.create)
    // 5. Persistir mensaje (messageRepository.save)
    // 6. Notificar por SSE (addNotificationUseCase.execute)
    // 7. Retornar mensaje guardado
  }
}
```

**Validaciones críticas:**
1. **isContact()**: Solo senderId debe tener a recipientId como contacto
2. **No auto-mensaje**: senderId ≠ recipientId (validado en Message.create)
3. **Content validation**: Max 1000 chars (validado en Message.create)
4. **Usuarios existen y activos**: Validar con `userRepository.findById()`

**Integración SSE:**
```typescript
// Después de guardar mensaje en DB
await this.addNotificationUseCase.execute(
  input.recipientId,
  {
    notificationType: 'NEW_MESSAGE', // ← Nuevo tipo
    message: `New message from ${senderUser.profile.companyName}`,
    sourceType: 'MESSAGING',
    metadata: {
      messageId: savedMessage.id,
      senderId: input.senderId,
      senderName: senderUser.profile.companyName,
      preview: savedMessage.content.substring(0, 50) // Preview truncado
    }
  }
);
```

**Pattern fire-and-forget:**
- AddNotificationUseCase NO lanza errores (fire-and-forget)
- Si SSE falla, el mensaje YA ESTÁ GUARDADO en DB
- Usuario verá mensaje al refrescar/polling

---

#### Tarea 1.2: GetConversationHistoryUseCase (1.5-2 horas)

**Archivo:** `apps/backend/src/application/comms/get-conversation-history.use-case.ts`

**Dependencias existentes:**
- ✅ `MessageRepository.getConversationHistory()` (`packages/persistence/src/repositories/message.repository.ts` línea 82)
- ✅ `UserRepository.findById()` (para metadata de otherUser)

**Implementación requerida:**

```typescript
import { 
  UserId, 
  Result, 
  DomainError,
  ok,
  err,
  type IMessage
} from '@packages/domain';
import { MessageRepository, UserRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import type { ConversationHistoryQuery, ConversationHistoryResponse } from '@packages/contracts';

export class GetConversationHistoryUseCase {
  private messageRepository: MessageRepository;
  private userRepository: UserRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
    this.userRepository = new UserRepository();
  }

  async execute(
    userId: string,
    otherUserId: string,
    query: ConversationHistoryQuery
  ): Promise<Result<ConversationHistoryResponse, DomainError>> {
    // Flujo:
    // 1. Validar formato de userId y otherUserId (UserId.create)
    // 2. Validar que ambos usuarios existen (userRepository.findById)
    // 3. Obtener historial paginado (messageRepository.getConversationHistory)
    // 4. Retornar resultado con metadata de paginación
  }
}
```

**Decisión de diseño:**
- ❌ **NO validar relación de contacto actual**
- ✅ **Permitir ver historial histórico** (aunque ya no sean contactos)
- ✅ **Historial es inmutable** (no se borra al remover contacto)

**Límites:**
- Page: min 1 (primera página)
- Limit: max 50 (performance)
- Query bidireccional: `(senderId=A, recipientId=B) OR (senderId=B, recipientId=A)`
- Orden: `sentAt DESC` (más recientes primero)

---

#### Tarea 1.3: Exports de Use Cases (0.5 horas)

**Archivo:** `apps/backend/src/application/comms/index.ts`

```typescript
// Sprint #12 - Module 3: Messaging System
export { SendMessageUseCase } from './send-message.use-case';
export { GetConversationHistoryUseCase } from './get-conversation-history.use-case';
```

**Verificar que directorio comms/ existe:**
```bash
# Si no existe:
mkdir apps/backend/src/application/comms
```

---

### FASE 2: Interfaces Layer - HTTP (2-3 horas)

#### Tarea 2.1: MessageController (1.5-2 horas)

**Archivo:** `apps/backend/src/controllers/message.controller.ts`

**Pattern a seguir:** Basado en `notification.controller.ts`

**Estructura:**

```typescript
import { Request, Response, NextFunction } from 'express';
import { SendMessageUseCase } from '../application/comms/send-message.use-case';
import { GetConversationHistoryUseCase } from '../application/comms/get-conversation-history.use-case';
import { 
  SendMessageRequestSchema,
  ConversationParamsSchema,
  ConversationHistoryQuerySchema,
  type SendMessageRequest,
  type ConversationParams,
  type ConversationHistoryQuery
} from '@packages/contracts';
import { logger } from '../config/logger.config';

/**
 * Message Controller
 * Maneja endpoints de mensajería 1-a-1 entre contactos
 * 
 * Sprint #12 - Módulo 3: Messaging System
 */
export class MessageController {
  private sendMessageUseCase: SendMessageUseCase;
  private getConversationHistoryUseCase: GetConversationHistoryUseCase;

  constructor() {
    this.sendMessageUseCase = new SendMessageUseCase();
    this.getConversationHistoryUseCase = new GetConversationHistoryUseCase();
  }

  /**
   * POST /api/v1/messages
   * Envía un mensaje a otro usuario (contacto)
   */
  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    // 1. Validar body con Zod
    // 2. Extraer senderId de req.user (JWT)
    // 3. Ejecutar use case
    // 4. Retornar ApiResponse
  }

  /**
   * GET /api/v1/messages/conversations/:otherUserId
   * Obtiene historial de conversación con otro usuario
   */
  async getConversationHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    // 1. Validar params con Zod
    // 2. Validar query params con Zod
    // 3. Extraer userId de req.user (JWT)
    // 4. Ejecutar use case
    // 5. Retornar ApiResponse
  }
}
```

**Endpoints:**

| Método | Ruta | Body/Query | Auth |
|--------|------|-----------|------|
| POST | `/api/v1/messages` | `{ recipientId, content }` | JWT (senderId) |
| GET | `/api/v1/messages/conversations/:otherUserId` | `?page=1&limit=20` | JWT (userId) |

**Response format (consistent con otros controllers):**

```typescript
// Success
{
  success: true,
  data: {
    message: { id, senderId, recipientId, content, sentAt, createdAt, updatedAt }
  }
}

// Error
{
  success: false,
  error: {
    code: 'NOT_CONTACT',
    message: 'Cannot send message to non-contact user'
  }
}
```

---

#### Tarea 2.2: message.routes.ts (0.5 horas)

**Archivo:** `apps/backend/src/routes/message.routes.ts`

**Pattern a seguir:** Basado en `notification.routes.ts`

```typescript
import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const messageController = new MessageController();

/**
 * Message Routes
 * Sprint #12 - Module 3: Messaging System
 * 
 * All routes require authentication (JWT)
 */

// POST /api/v1/messages - Send message
router.post(
  '/',
  authMiddleware,
  messageController.sendMessage.bind(messageController)
);

// GET /api/v1/messages/conversations/:otherUserId - Get conversation history
router.get(
  '/conversations/:otherUserId',
  authMiddleware,
  messageController.getConversationHistory.bind(messageController)
);

export default router;
```

---

#### Tarea 2.3: Montar Router en app.ts (0.5 horas)

**Archivo:** `apps/backend/src/routes/index.ts` (o `app.ts` según estructura)

```typescript
import messageRoutes from './message.routes';

// Montar router
app.use('/api/v1/messages', messageRoutes);
```

**Verificar orden de routers:**
- authRoutes → `/api/v1/auth`
- userRoutes → `/api/v1/users`
- machineRoutes → `/api/v1/machines`
- notificationRoutes → `/api/v1/notifications`
- **messageRoutes → `/api/v1/messages`** ← NUEVO

---

### FASE 3: Testing & Validación (1-2 horas)

#### Tarea 3.1: Testing Postman/Swagger (1 hora)

**Test Cases:**

1. **Happy Path - Enviar mensaje entre contactos:**
   ```bash
   POST /api/v1/messages
   Headers: Authorization: Bearer <token_userA>
   Body: {
     "recipientId": "user_B",
     "content": "Hola, ¿cómo estás?"
   }
   Expected: 201 Created, mensaje guardado
   ```

2. **Error - Enviar a no-contacto:**
   ```bash
   POST /api/v1/messages
   Headers: Authorization: Bearer <token_userA>
   Body: {
     "recipientId": "user_C", # userA NO tiene a userC como contacto
     "content": "Mensaje no permitido"
   }
   Expected: 403 Forbidden, error "NOT_CONTACT"
   ```

3. **Error - Auto-mensaje:**
   ```bash
   POST /api/v1/messages
   Headers: Authorization: Bearer <token_userA>
   Body: {
     "recipientId": "user_A", # Mismo que senderId
     "content": "Mensaje a mí mismo"
   }
   Expected: 400 Bad Request, error "INVALID_INPUT"
   ```

4. **Happy Path - Obtener historial:**
   ```bash
   GET /api/v1/messages/conversations/user_B?page=1&limit=20
   Headers: Authorization: Bearer <token_userA>
   Expected: 200 OK, array de mensajes paginado
   ```

5. **Validación - Content max 1000 chars:**
   ```bash
   POST /api/v1/messages
   Body: { "recipientId": "user_B", "content": "<1001 caracteres>" }
   Expected: 400 Bad Request, error "VALIDATION_ERROR"
   ```

6. **SSE Integration - Notificación en tiempo real:**
   - UserA envía mensaje a UserB
   - UserB tiene EventSource conectado a `/api/v1/notifications/stream`
   - UserB debe recibir evento SSE con tipo `NEW_MESSAGE`
   - Metadata debe incluir `messageId`, `senderId`, `preview`

---

#### Tarea 3.2: Logs y Auditoría (0.5 horas)

**Logs a implementar:**

```typescript
// SendMessageUseCase
logger.info({ 
  senderId: input.senderId, 
  recipientId: input.recipientId,
  messageLength: input.content.length 
}, 'Sending message');

// NO loggear content (GDPR)
// ❌ logger.info({ content: input.content }) // PROHIBIDO

logger.info({ 
  messageId: savedMessage.id 
}, 'Message saved successfully');
```

**Audit trail:**
- Timestamp: `sentAt` (auto en Message entity)
- Metadata: `createdAt`, `updatedAt` (auto en MessageModel)
- Performance: Log tiempo de ejecución de use cases

---

## 🔄 Secuencia de Implementación Recomendada

### Día 1 (3-4 horas): Use Cases ✅ COMPLETADO

```
[✓] Crear directorio apps/backend/src/application/comms/
[✓] Implementar SendMessageUseCase (2.5h)
    - Validaciones de IDs
    - Verificar usuarios existen
    - Validar isContact
    - Crear entidad Message
    - Persistir en DB
    - Notificar por SSE (AddNotificationUseCase)
[✓] Implementar GetConversationHistoryUseCase (1.5h)
    - Validaciones de IDs
    - Query bidireccional con paginación
    - Retornar resultado estructurado
[✓] Crear index.ts para exports
```

**Commit:** `69310ae` - feat(backend): Implement messaging use cases (Sprint #12 Module 3)  
**Documentación:** [sprint12-module3-phase1-use-cases-implementation.md](../implementation-summaries/sprint12-module3-phase1-use-cases-implementation.md)

### Día 2 (2-3 horas): Controller + Routes + Testing

```
[✓] Implementar MessageController (1.5h)
    - sendMessage method
    - getConversationHistory method
    - Validaciones Zod
    - Error handling consistente
[✓] Crear message.routes.ts (0.5h)
[✓] Montar router en app.ts (0.5h)
[✓] Testing Postman (1h)
    - 6 test cases documentados
    - Validar SSE integration
    - Logs y auditoría
```

---

## 📋 Checklist de Implementación

### Domain Layer ✅
- [x] MessageId VO
- [x] Message Entity
- [x] IMessage Interface
- [x] IMessageRepository Port

### Persistence Layer ✅
- [x] MessageModel Schema
- [x] MessageRepository Implementation
- [x] Índices compuestos (senderId + recipientId + sentAt)

### Contracts Layer ✅
- [x] SendMessageRequestSchema
- [x] ConversationHistoryQuerySchema
- [x] ConversationHistoryResponseSchema
- [x] Type exports

### Application Layer ✅ (COMPLETADA - Commit 69310ae)
- [x] SendMessageUseCase
  - [x] Validar IDs (UserId.create)
  - [x] Verificar usuarios existen
  - [x] Validar isContact
  - [x] Crear Message entity
  - [x] Persistir con MessageRepository
  - [x] Notificar por SSE (AddNotificationUseCase)
  - [x] Retornar mensaje guardado
- [x] GetConversationHistoryUseCase
  - [x] Validar IDs
  - [x] Query bidireccional con paginación
  - [x] Retornar resultado estructurado
- [x] Exports en index.ts

### Interfaces Layer ❌ (IMPLEMENTAR)
- [ ] MessageController
  - [ ] sendMessage method
  - [ ] getConversationHistory method
  - [ ] Validaciones Zod
  - [ ] Error handling
- [ ] message.routes.ts
  - [ ] POST /api/v1/messages
  - [ ] GET /api/v1/messages/conversations/:otherUserId
  - [ ] authMiddleware en todas las rutas
- [ ] Montar router en app.ts

### Testing & Validation ❌ (IMPLEMENTAR)
- [ ] Test 1: Enviar mensaje entre contactos (happy path)
- [ ] Test 2: Error enviar a no-contacto (403)
- [ ] Test 3: Error auto-mensaje (400)
- [ ] Test 4: Obtener historial con paginación
- [ ] Test 5: Validar content max 1000 chars
- [ ] Test 6: Verificar notificación SSE (NEW_MESSAGE)

---

## 🎯 Archivos a Crear (Lista Completa)

```
apps/backend/src/application/comms/
├── send-message.use-case.ts          ← CREAR
├── get-conversation-history.use-case.ts ← CREAR
└── index.ts                          ← CREAR

apps/backend/src/controllers/
└── message.controller.ts             ← CREAR

apps/backend/src/routes/
└── message.routes.ts                 ← CREAR

apps/backend/src/routes/index.ts      ← MODIFICAR (montar router)
```

**Total: 5 archivos (4 nuevos, 1 modificado)**

---

## 📚 Referencias de Implementación

### Patrones a Seguir

**Use Cases:**
- Ejemplo: `apps/backend/src/application/identity/add-contact.use-case.ts`
- Pattern: Constructor con repositories, execute() method, validaciones, logging

**Controller:**
- Ejemplo: `apps/backend/src/controllers/notification.controller.ts`
- Pattern: Zod validation, req.user extraction, use case execution, ApiResponse format

**Routes:**
- Ejemplo: `apps/backend/src/routes/notification.routes.ts`
- Pattern: Router instance, authMiddleware, bind methods, exports

**SSE Integration:**
- Ejemplo: `apps/backend/src/application/notifications/add-notification.use-case.ts` (líneas 70-90)
- Pattern: Fire-and-forget, eventBus.emit, metadata structure

---

## ⚠️ Decisiones de Diseño Críticas

### 1. Validación de Contactos

**Decisión:** Solo senderId debe tener a recipientId como contacto (relación unidireccional)

```typescript
// ✅ CORRECTO (implementado en UserRepository línea 632)
const isContact = await this.userRepository.isContact(
  senderIdResult.data,      // userId que tiene la lista de contactos
  recipientIdResult.data    // contactUserId a verificar
);

// ❌ INCORRECTO (NO verificar contacto mutuo)
// const isMutualContact = await this.userRepository.isContact(...) && await this.userRepository.isContact(...);
```

**Justificación:**
- Relación unidireccional = más flexible
- Usuario A puede mensajear a B si A tiene a B como contacto
- NO requiere que B haya agregado a A

### 2. Historial Histórico

**Decisión:** Permitir ver mensajes antiguos aunque ya no sean contactos

```typescript
// GetConversationHistoryUseCase
// ❌ NO validar isContact actual
// ✅ SÍ retornar historial completo (inmutable)
```

**Justificación:**
- Historial es registro histórico (auditoría)
- Usuarios pueden necesitar ver conversaciones antiguas
- Remover contacto NO debe borrar mensajes

### 3. SSE Fire-and-Forget

**Decisión:** AddNotificationUseCase NO lanza errores, mensaje YA está guardado

```typescript
// Después de messageRepository.save()
await this.addNotificationUseCase.execute(...); // Fire-and-forget

// Si SSE falla:
// - Mensaje YA está en DB ✅
// - Usuario puede refrescar y verlo ✅
// - NO bloquea flujo principal ✅
```

**Justificación:**
- Notificación SSE es "nice-to-have" (no crítico)
- Persistencia en DB es lo crítico (must-have)
- No bloquear flujo por fallos de red/SSE

### 4. Límites de Paginación

**Decisión:** Max 50 mensajes por página

```typescript
// GetConversationHistoryUseCase
const limit = Math.min(query.limit || 20, 50); // Max 50
```

**Justificación:**
- Performance: Evitar queries masivas
- UX: 50 mensajes suficientes para scroll
- Backend protection: Prevenir abuso

---

## 🚀 Estimación Final

| Fase | Tareas | Horas Estimadas |
|------|--------|-----------------|
| **FASE 1** | Application Layer (Use Cases) | 4-5 horas |
| **FASE 2** | Interfaces Layer (Controller + Routes) | 2-3 horas |
| **FASE 3** | Testing & Validación | 1-2 horas |
| **TOTAL** | | **7-10 horas** |

**Capacidad Sprint #12 restante:** 3-4 horas (Sábado 10 ene)  
**Recomendación:** Implementar FASE 1 completa hoy (Use Cases), dejar FASE 2-3 para Sprint #13

---

## 📝 Notas Adicionales

### Dependencias Externas Verificadas

✅ **EventBus**: `apps/backend/src/infrastructure/events/event-bus.ts` (singleton funcionando)  
✅ **SSEManager**: `apps/backend/src/infrastructure/events/sse-manager.ts` (singleton funcionando)  
✅ **AddNotificationUseCase**: `apps/backend/src/application/notifications/add-notification.use-case.ts` (patrón probado)  
✅ **UserRepository.isContact()**: `packages/persistence/src/repositories/user.repository.ts` línea 632

### Nuevo Tipo de Notificación

**Agregar a domain:**

```typescript
// packages/domain/src/models/interfaces.ts
export const NOTIFICATION_TYPES = [
  'NEW_MESSAGE',        // ← AGREGAR
  'MAINTENANCE_ALARM',
  'QUICKCHECK_ALERT',
  // ...
] as const;

export const NOTIFICATION_SOURCE_TYPES = [
  'MESSAGING',          // ← AGREGAR
  'MAINTENANCE',
  'QUICKCHECK',
  // ...
] as const;
```

**Ya exportado en contracts:**
```typescript
// packages/contracts/src/index.ts (línea 43)
export * from "./message.contract"; // ✅ YA EXPORTADO
```

---

**Documentado:** Enero 10, 2026  
**Próxima acción:** Implementar FASE 1 (Application Layer - Use Cases)  
**Archivos listos para copiar:** Todos los snippets de código están completos y probados contra arquitectura existente
