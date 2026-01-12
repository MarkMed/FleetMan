# Real-time Communication Architecture: Server-Sent Events (SSE)

**Fecha:** Enero 2026  
**Sprint:** #12 - User Communication System  
**Documentado por:** Sistema de análisis técnico

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [¿Qué es SSE y Por Qué Lo Usamos?](#qué-es-sse-y-por-qué-lo-usamos)
3. [Arquitectura del Sistema Actual](#arquitectura-del-sistema-actual)
4. [Implementación Backend](#implementación-backend)
5. [Implementación Frontend](#implementación-frontend)
6. [SSE vs WebSockets](#sse-vs-websockets)
7. [Integración con Mensajería (Módulo 3)](#integración-con-mensajería-módulo-3)
8. [Ventajas y Limitaciones](#ventajas-y-limitaciones)
9. [Troubleshooting y Best Practices](#troubleshooting-y-best-practices)

---

## Resumen Ejecutivo

**FleetMan utiliza Server-Sent Events (SSE)** para comunicación en tiempo real del servidor hacia los clientes. Este sistema ya está implementado y funcionando para el sistema de notificaciones, y será reutilizado para el Módulo 3 (Mensajería).

### Características Clave

✅ **Push notifications en tiempo real** (< 1 segundo de latencia)  
✅ **Auto-reconexión automática** (hasta 5 intentos con backoff exponencial)  
✅ **HTTP estándar** (no requiere protocolos especiales como WebSocket)  
✅ **EventEmitter pattern** (escalable y desacoplado)  
✅ **Heartbeat cada 30s** (mantiene conexión viva)  
✅ **Cleanup automático** (libera recursos al desconectar)

---

## ¿Qué es SSE y Por Qué Lo Usamos?

### Definición

**Server-Sent Events (SSE)** es un estándar HTML5 que permite al servidor enviar actualizaciones al cliente a través de una conexión HTTP persistente y unidireccional.

### Casos de Uso Ideales

- ✅ **Notificaciones push** (nuestro caso principal)
- ✅ **Actualizaciones de estado en tiempo real**
- ✅ **Feeds de actividad**
- ✅ **Mensajería simple** (solo recepción de mensajes)
- ✅ **Alertas de sistema**

### Por Qué NO Elegimos WebSockets

| Criterio | SSE (Nuestra elección) | WebSockets |
|----------|------------------------|------------|
| **Complejidad** | Baja (EventSource nativo) | Alta (requiere Socket.IO) |
| **Dirección** | Unidireccional (server → client) ✅ | Bidireccional (ambos) |
| **Nuestro caso de uso** | Solo necesitamos server → client | Overkill para nuestras necesidades |
| **Firewall/Proxy** | Rara vez bloqueado | A veces bloqueado |
| **Reconexión** | Automática (nativa del navegador) | Manual (con librerías) |
| **Infraestructura** | HTTP estándar | Protocolo ws:// especial |
| **Tiempo de desarrollo** | 1-2 días ✅ | 1-2 semanas |

**Conclusión:** SSE es más simple, más rápido de implementar, y suficiente para nuestras necesidades (notificaciones + mensajería de recepción).

---

## Arquitectura del Sistema Actual

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ useNotificationObserver Hook                             │   │
│  │ ────────────────────────────────────────────────────────│   │
│  │ - Se ejecuta al montar el componente raíz               │   │
│  │ - Conecta SSE automáticamente si hay token JWT          │   │
│  │ - Escucha eventos en tiempo real                        │   │
│  │ - Maneja reconexión si falla la conexión                │   │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │                                             │
│  ┌──────────────────▼───────────────────────────────────────┐   │
│  │ SSEClient (Service Layer)                                │   │
│  │ ────────────────────────────────────────────────────────│   │
│  │ - Wrapper sobre EventSource API nativo                  │   │
│  │ - Reconexión automática (5 intentos, backoff)           │   │
│  │ - Manejo de errores y cleanup                            │   │
│  │ - withCredentials: true (envía JWT en cookies)          │   │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │                                             │
└─────────────────────┼─────────────────────────────────────────┘
                      │
                      │ HTTP GET /api/v1/notifications/stream
                      │ (long-lived connection, permanece abierta)
                      │ Headers: text/event-stream
                      │
┌─────────────────────▼─────────────────────────────────────────┐
│                         BACKEND                                 │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ GET /notifications/stream                                │   │
│  │ (NotificationController.streamNotifications)             │   │
│  │ ────────────────────────────────────────────────────────│   │
│  │ 1. Configura headers SSE:                                │   │
│  │    - Content-Type: text/event-stream                     │   │
│  │    - Cache-Control: no-cache                             │   │
│  │    - Connection: keep-alive                              │   │
│  │                                                            │   │
│  │ 2. Envía heartbeat cada 30s (": heartbeat\n\n")         │   │
│  │                                                            │   │
│  │ 3. Registra listener para userId en NotificationService │   │
│  │                                                            │   │
│  │ 4. Cuando llega notificación para userId:                │   │
│  │    res.write(`data: ${JSON.stringify(notif)}\n\n`)       │   │
│  │                                                            │   │
│  │ 5. Cleanup al desconectar: clearInterval + removeListener│  │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │                                             │
│  ┌──────────────────▼───────────────────────────────────────┐   │
│  │ NotificationService (EventEmitter Pattern)               │   │
│  │ ────────────────────────────────────────────────────────│   │
│  │ - Extiende EventEmitter de Node.js                      │   │
│  │ - Mantiene Map<userId, Function[]> de listeners         │   │
│  │ - emit('notification', data) → dispara todos listeners  │   │
│  │                                                            │   │
│  │ addListener(userId, callback): void                      │   │
│  │ removeListener(userId, callback): void                   │   │
│  │ createNotification(data): Promise<void>                  │   │
│  │   ↓ 1. Guarda en MongoDB                                 │   │
│  │   ↓ 2. emit('notification') → SSE envía a cliente ✅    │   │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │                                             │
│  ┌──────────────────▼───────────────────────────────────────┐   │
│  │ ANY Use Case que Crea Notificaciones                     │   │
│  │ ────────────────────────────────────────────────────────│   │
│  │ - CheckMaintenanceAlarmsUseCase                          │   │
│  │ - AddQuickCheckUseCase                                   │   │
│  │ - SendMessageUseCase (NUEVO - Módulo 3) ⭐              │   │
│  │                                                            │   │
│  │ await notificationService.createNotification({           │   │
│  │   userId: 'user_abc123',                                 │   │
│  │   type: 'MAINTENANCE_ALERT',                             │   │
│  │   title: 'Alerta de mantenimiento',                      │   │
│  │   message: 'Máquina X requiere atención',                │   │
│  │   metadata: { machineId: 'machine_123' }                 │   │
│  │ });                                                       │   │
│  │   ↓                                                        │   │
│  │ Usuario recibe notificación en < 1 segundo ⚡            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementación Backend

### 1. Endpoint SSE

**Archivo:** `apps/backend/src/routes/notification.routes.ts`

```typescript
/**
 * @swagger
 * /api/v1/notifications/stream:
 *   get:
 *     summary: Stream notifications via SSE
 *     description: |
 *       Establishes a Server-Sent Events (SSE) connection for real-time notifications.
 *       Connection remains open and server pushes new notifications as they occur.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SSE connection established
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: object
 */
router.get(
  '/stream',
  requestSanitization,
  authMiddleware, // ✅ Requiere JWT válido
  notificationController.streamNotifications.bind(notificationController)
);
```

---

### 2. Controller SSE

**Archivo:** `apps/backend/src/controllers/notification.controller.ts`

```typescript
import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Establece conexión SSE para notificaciones en tiempo real
   * 
   * Flujo:
   * 1. Configura headers SSE (text/event-stream, keep-alive)
   * 2. Envía heartbeat cada 30s para mantener conexión viva
   * 3. Registra listener para userId en NotificationService
   * 4. Cuando NotificationService emite evento, envía al cliente
   * 5. Cleanup automático al desconectar
   */
  async streamNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;

    // 1. Configurar headers para SSE (CRÍTICO)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Nginx compatibility

    // 2. Enviar mensaje de conexión inicial
    res.write('data: {"type":"connected","message":"SSE connection established"}\n\n');

    // 3. Crear intervalo de heartbeat (mantiene conexión viva)
    // Sin esto, proxies/firewalls pueden cerrar la conexión
    const heartbeatInterval = setInterval(() => {
      res.write(': heartbeat\n\n'); // Comentario SSE (el cliente lo ignora)
    }, 30000); // 30 segundos

    // 4. Crear listener para notificaciones de este usuario
    const notificationListener = (notification: any) => {
      // Solo enviar notificaciones para este userId
      if (notification.userId === userId) {
        // Formato SSE: "data: {JSON}\n\n"
        res.write(`data: ${JSON.stringify(notification)}\n\n`);
      }
    };

    // 5. Registrar listener en NotificationService
    this.notificationService.addListener(userId, notificationListener);

    // 6. Cleanup cuando el cliente se desconecta
    req.on('close', () => {
      console.log(`SSE connection closed for user ${userId}`);
      clearInterval(heartbeatInterval);
      this.notificationService.removeListener(userId, notificationListener);
    });
  }
}
```

**Puntos clave:**

- ✅ **Headers SSE:** `Content-Type: text/event-stream` es obligatorio
- ✅ **Heartbeat:** Sin esto, la conexión se cierra en ~60s
- ✅ **Formato de mensaje:** `data: {JSON}\n\n` (doble salto de línea obligatorio)
- ✅ **Cleanup:** SIEMPRE limpiar listeners para evitar memory leaks

---

### 3. NotificationService con EventEmitter

**Archivo:** `apps/backend/src/services/notification.service.ts`

```typescript
import { EventEmitter } from 'events';
import { NotificationModel } from '@packages/persistence';

export class NotificationService extends EventEmitter {
  private listeners: Map<string, Function[]> = new Map();

  /**
   * Crea una notificación y la envía por SSE a usuarios conectados
   */
  async createNotification(data: CreateNotificationInput): Promise<void> {
    try {
      // 1. Persistir en MongoDB (para historial)
      const notification = await NotificationModel.create({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata,
        actionUrl: data.actionUrl,
        priority: data.priority || 'NORMAL',
        source: data.source || 'SYSTEM'
      });

      // 2. EMITIR EVENTO para SSE listeners
      // Todos los listeners registrados para este userId reciben la notificación
      this.emit('notification', notification.toObject());

      console.log(`Notification sent to user ${data.userId} via SSE`);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Registra un listener para recibir notificaciones de un usuario
   * Llamado por NotificationController.streamNotifications()
   */
  addListener(userId: string, callback: Function): void {
    const userListeners = this.listeners.get(userId) || [];
    userListeners.push(callback);
    this.listeners.set(userId, userListeners);
    
    console.log(`Listener added for user ${userId}. Total: ${userListeners.length}`);
  }

  /**
   * Remueve un listener (cleanup al desconectar)
   */
  removeListener(userId: string, callback: Function): void {
    const userListeners = this.listeners.get(userId) || [];
    const filtered = userListeners.filter(cb => cb !== callback);
    
    if (filtered.length > 0) {
      this.listeners.set(userId, filtered);
    } else {
      this.listeners.delete(userId); // Liberar memoria si no hay más listeners
    }
    
    console.log(`Listener removed for user ${userId}. Remaining: ${filtered.length}`);
  }
}
```

**Patrón de diseño:**

- ✅ **Observer Pattern:** Los controllers se suscriben a eventos
- ✅ **Pub/Sub:** Use cases publican, SSE listeners consumen
- ✅ **Desacoplamiento:** Use cases no conocen cómo se entregan las notificaciones

---

### 4. Uso desde Use Cases

**Ejemplo:** Enviar notificación de mantenimiento

```typescript
// apps/backend/src/application/maintenance/check-maintenance-alarms.use-case.ts
import { NotificationService } from '../../services/notification.service';

export class CheckMaintenanceAlarmsUseCase {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async execute(): Promise<void> {
    // ... lógica de chequeo de alarmas ...

    // Crear notificación (automáticamente enviada por SSE)
    await this.notificationService.createNotification({
      userId: machine.ownerId,
      type: 'MAINTENANCE_ALERT',
      title: 'notification.maintenance.alert.title',
      message: 'notification.maintenance.alert.description',
      metadata: {
        machineId: machine.id,
        machineName: machine.serialNumber,
        alarmType: alarm.type
      },
      actionUrl: `/machines/${machine.id}`,
      priority: 'HIGH'
    });

    // ✅ Usuario recibe notificación en tiempo real (< 1 segundo)
  }
}
```

---

## Implementación Frontend

### 1. SSEClient Service

**Archivo:** `apps/frontend/src/services/sseClient.ts`

```typescript
/**
 * Cliente SSE con reconexión automática
 * 
 * Características:
 * - Auto-reconexión con backoff exponencial
 * - Manejo de errores
 * - Cleanup automático
 */
export class SSEClient {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 3000; // 3 segundos

  /**
   * Conecta al endpoint SSE
   * 
   * @param url - URL del endpoint SSE (ej: http://localhost:3000/api/v1/notifications/stream)
   * @param onMessage - Callback para mensajes recibidos
   * @param onError - Callback para errores (opcional)
   */
  connect(
    url: string, 
    onMessage: (data: any) => void, 
    onError?: (error: any) => void
  ): void {
    try {
      // EventSource es API nativa del navegador (HTML5)
      this.eventSource = new EventSource(url, {
        withCredentials: true // ✅ Envía cookies/JWT automáticamente
      });

      // Evento: conexión establecida
      this.eventSource.onopen = () => {
        console.log('✅ SSE connection established');
        this.reconnectAttempts = 0; // Reset contador de intentos
      };

      // Evento: mensaje recibido del servidor
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Ignorar mensajes de conexión inicial
          if (data.type === 'connected') {
            console.log('SSE:', data.message);
            return;
          }

          // Procesar notificación
          onMessage(data);
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      // Evento: error de conexión
      this.eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error);
        this.handleReconnect(url, onMessage, onError);
        onError?.(error);
      };

    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      onError?.(error);
    }
  }

  /**
   * Maneja reconexión automática con backoff exponencial
   */
  private handleReconnect(
    url: string, 
    onMessage: (data: any) => void, 
    onError?: (error: any) => void
  ): void {
    // Cerrar conexión existente
    this.disconnect();

    // Verificar si aún hay intentos disponibles
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      // Backoff exponencial: 3s, 6s, 9s, 12s, 15s
      const delay = this.reconnectDelay * this.reconnectAttempts;
      
      console.log(
        `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`
      );
      
      setTimeout(() => {
        this.connect(url, onMessage, onError);
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached. Please refresh the page.');
    }
  }

  /**
   * Desconecta y limpia recursos
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('SSE connection closed');
    }
  }
}
```

**Características clave:**

- ✅ **EventSource nativo:** No requiere librerías externas
- ✅ **withCredentials:** Envía JWT en cookies automáticamente
- ✅ **Reconexión exponencial:** Evita saturar el servidor
- ✅ **Max 5 intentos:** Previene loops infinitos

---

### 2. Hook de Notificaciones

**Archivo:** `apps/frontend/src/hooks/useNotificationObserver.ts`

```typescript
import { useEffect } from 'react';
import { SSEClient } from '@/services/sseClient';
import { useNotifications } from './useNotifications';
import { useBrowserNotification } from './useBrowserNotification';
import { getAuthToken } from '@/utils/authUtils';

/**
 * Hook que conecta SSE para recibir notificaciones en tiempo real
 * 
 * Uso:
 * - Se ejecuta en el componente raíz (App.tsx)
 * - Conecta automáticamente si hay token JWT
 * - Maneja reconexión y cleanup
 */
export function useNotificationObserver() {
  const { addNotification } = useNotifications(); // Store de notificaciones
  const { showNotification } = useBrowserNotification(); // Notificaciones del navegador

  useEffect(() => {
    const token = getAuthToken();
    
    // Solo conectar si hay usuario autenticado
    if (!token) {
      console.log('No auth token found, skipping SSE connection');
      return;
    }

    const sseClient = new SSEClient();
    const url = `${import.meta.env.VITE_API_URL}/api/v1/notifications/stream`;

    console.log('Connecting to SSE endpoint:', url);

    // Conectar SSE
    sseClient.connect(
      url,
      // Callback: mensaje recibido
      (notification) => {
        console.log('📩 New notification received:', notification);

        // 1. Agregar al store de notificaciones (para badge en header)
        addNotification(notification);

        // 2. Mostrar notificación del navegador
        if (Notification.permission === 'granted') {
          showNotification(notification.title, {
            body: notification.message,
            icon: '/icon.png',
            tag: notification.id, // Previene duplicados
            data: {
              actionUrl: notification.actionUrl
            }
          });
        }

        // 3. Log para debugging
        console.log(`Notification added to store. Total unread: ${notification.count || '?'}`);
      },
      // Callback: error
      (error) => {
        console.error('SSE connection error:', error);
        // No hacer nada - SSEClient maneja reconexión automáticamente
      }
    );

    // Cleanup: desconectar al desmontar
    return () => {
      console.log('Disconnecting SSE...');
      sseClient.disconnect();
    };
  }, []); // Solo ejecutar una vez al montar

  // Este hook no retorna nada - funciona en background
}
```

---

### 3. Integración en App

**Archivo:** `apps/frontend/src/App.tsx`

```typescript
import { useNotificationObserver } from '@/hooks/useNotificationObserver';

function App() {
  // ✅ Conectar SSE automáticamente al cargar la app
  useNotificationObserver();

  return (
    <Router>
      {/* ... resto de la app ... */}
    </Router>
  );
}
```

**Resultado:** Cualquier notificación creada en el backend llega instantáneamente al frontend ⚡

---

## SSE vs WebSockets

### Comparación Técnica Detallada

| Aspecto | Server-Sent Events (SSE) | WebSockets |
|---------|-------------------------|------------|
| **Protocolo** | HTTP/HTTPS estándar | ws:// o wss:// (protocolo especial) |
| **Dirección** | Unidireccional (server → client) | Bidireccional (client ↔ server) |
| **Formato de datos** | Texto (generalmente JSON) | Binario o texto |
| **Reconexión** | Automática (nativa del navegador) | Manual (requiere lógica adicional) |
| **Complejidad backend** | Baja (res.write) | Media/Alta (Socket.IO, ws library) |
| **Complejidad frontend** | Baja (EventSource API nativo) | Media (socket.io-client) |
| **Compatibilidad firewalls** | Excelente (es HTTP) | Regular (a veces bloqueado) |
| **Soporte navegadores** | Excelente (excepto IE) | Excelente |
| **Overhead** | Bajo (HTTP headers solo al inicio) | Bajo (handshake inicial) |
| **Latencia** | ~100-500ms | ~50-200ms |
| **Use case ideal** | Notificaciones, feeds, actualizaciones | Chat bidireccional, gaming |
| **Fallback HTTP** | No necesita (es HTTP) | Long-polling |
| **Escalabilidad** | Buena (con sticky sessions) | Buena (con Redis adapter) |

### Cuándo Usar SSE (Nuestro Caso) ✅

- ✅ Solo necesitas **server → client** (push notifications)
- ✅ Actualizaciones **no son críticas** en tiempo (< 1s está bien)
- ✅ Quieres **implementación rápida** (1-2 días)
- ✅ Infraestructura **HTTP estándar**
- ✅ No tienes tiempo/presupuesto para WebSockets

### Cuándo Usar WebSockets

- ❌ Necesitas **bidireccionalidad** (client → server en tiempo real)
- ❌ Latencia **crítica** (< 50ms)
- ❌ **Gaming** o colaboración en tiempo real
- ❌ **Binarios** (streaming de audio/video)

---

## Integración con Mensajería (Módulo 3)

### Flujo de Envío de Mensaje

```
Usuario A (Sender)                Backend                     Usuario B (Recipient)
     │                               │                               │
     │ POST /api/v1/messages         │                               │
     │ { recipientId, content }      │                               │
     ├──────────────────────────────>│                               │
     │                               │                               │
     │                      SendMessageUseCase                       │
     │                        1. Validar usuarios                    │
     │                        2. Verificar isContact()               │
     │                        3. Guardar mensaje en DB               │
     │                               │                               │
     │                        ┌──────▼──────┐                        │
     │                        │ BIFURCACIÓN │                        │
     │                        └──────┬──────┘                        │
     │                               │                               │
     │                        Path A: Responder a Usuario A          │
     │<──────────────────────────────┤                               │
     │ 200 OK                        │                               │
     │ { success: true, data: {...} }│                               │
     │                               │                               │
     │                        Path B: Notificar a Usuario B          │
     │                      NotificationService                      │
     │                        .createNotification()                  │
     │                               │                               │
     │                        1. Guardar en DB                       │
     │                        2. emit('notification')                │
     │                               │                               │
     │                        SSE Controller                         │
     │                        (tiene listener registrado)            │
     │                               │                               │
     │                        res.write('data: {...}\n\n')           │
     │                               ├──────────────────────────────>│
     │                               │                 📩 NOTIFICACIÓN
     │                               │                    RECIBIDA   │
     │                               │                               │
     │                               │              Frontend procesa:│
     │                               │              1. Agrega a store│
     │                               │              2. Muestra badge │
     │                               │              3. Si está en la │
     │                               │                 conversación, │
     │                               │                 agrega mensaje│
     │                               │              4. Notificación  │
     │                               │                 del navegador │
```

### Código de Implementación

**SendMessageUseCase:**

```typescript
// apps/backend/src/application/comms/send-message.use-case.ts
import { NotificationService } from '../../services/notification.service';
import { MessageRepository } from '@packages/persistence';

export class SendMessageUseCase {
  private messageRepository: MessageRepository;
  private notificationService: NotificationService;
  private userRepository: UserRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
    this.notificationService = new NotificationService();
    this.userRepository = new UserRepository();
  }

  async execute(input: SendMessageInput): Promise<Result<IMessage, DomainError>> {
    try {
      // 1. Validar que ambos usuarios existen y están activos
      const [senderResult, recipientResult] = await Promise.all([
        this.userRepository.findById(UserId.create(input.senderId).data),
        this.userRepository.findById(UserId.create(input.recipientId).data)
      ]);

      if (!senderResult.success || !recipientResult.success) {
        return err(DomainError.notFound('User not found'));
      }

      // 2. CRÍTICO: Validar relación de contacto
      const isContact = await this.userRepository.isContact(
        UserId.create(input.senderId).data,
        UserId.create(input.recipientId).data
      );

      if (!isContact) {
        return err(DomainError.forbidden('Can only message contacts'));
      }

      // 3. Crear entidad Message
      const messageResult = Message.create({
        senderId: input.senderId,
        recipientId: input.recipientId,
        content: input.content
      });

      if (!messageResult.success) {
        return err(messageResult.error);
      }

      // 4. Persistir mensaje en DB
      const saveResult = await this.messageRepository.save(messageResult.data);

      if (!saveResult.success) {
        return err(saveResult.error);
      }

      // ============================================================
      // 5. BIFURCACIÓN: Notificar a Usuario B por SSE
      // ============================================================
      await this.notificationService.createNotification({
        userId: input.recipientId, // Usuario B recibe la notificación
        type: 'NEW_MESSAGE',
        title: 'notification.message.received', // i18n key
        message: 'notification.message.received.description',
        metadata: {
          messageId: messageResult.data.id.getValue(),
          senderId: input.senderId,
          senderName: senderResult.data.profile.businessName,
          messagePreview: input.content.substring(0, 100),
          conversationWith: input.senderId
        },
        actionUrl: `/messages/conversations/${input.senderId}`,
        priority: 'NORMAL',
        source: 'MESSAGING' // Nuevo source type
      });

      // ✅ Usuario B recibe notificación en < 1 segundo por SSE

      // 6. Responder a Usuario A con el mensaje guardado
      return ok(messageResult.data.toPublicInterface());

    } catch (error) {
      return err(DomainError.create('INTERNAL_ERROR', error.message));
    }
  }
}
```

---

### Frontend: Manejo de Notificaciones de Mensajes

**Archivo:** `apps/frontend/src/hooks/useNotificationObserver.ts` (modificado)

```typescript
sseClient.connect(
  url,
  (notification) => {
    console.log('📩 New notification:', notification);

    // 1. Agregar al store (para badge en header)
    addNotification(notification);

    // 2. SI es notificación de mensaje nuevo
    if (notification.type === 'NEW_MESSAGE') {
      // 2a. Mostrar notificación del navegador
      if (Notification.permission === 'granted') {
        showNotification(notification.title, {
          body: notification.message,
          icon: '/icon.png'
        });
      }

      // 2b. Si Usuario B está EN LA CONVERSACIÓN con el sender
      const currentRoute = window.location.pathname;
      const conversationWith = notification.metadata.conversationWith;

      if (currentRoute === `/messages/conversations/${conversationWith}`) {
        // Opción A: Agregar mensaje directamente (más rápido)
        addMessageToConversation({
          id: notification.metadata.messageId,
          content: notification.metadata.messagePreview,
          senderId: notification.metadata.senderId,
          recipientId: notification.userId,
          sentAt: new Date().toISOString()
        });

        // Opción B: Refrescar toda la conversación (más confiable)
        // await refreshConversation(conversationWith);
      }
    }
  },
  (error) => {
    console.error('SSE error:', error);
  }
);
```

**Resultado:**
- ✅ Usuario B recibe mensaje en **tiempo real** (< 1 segundo)
- ✅ Si está en la conversación, ve el mensaje **instantáneamente**
- ✅ Si está en otra página, ve **badge** de notificación no leída
- ✅ Notificación del navegador se muestra **automáticamente**

---

## Ventajas y Limitaciones

### ✅ Ventajas de Nuestro Sistema SSE

| Ventaja | Descripción |
|---------|-------------|
| **Simplicidad** | EventSource nativo, res.write() en backend |
| **Infraestructura existente** | HTTP estándar, no requiere ws:// |
| **Auto-reconexión** | El navegador reconecta automáticamente |
| **Latencia aceptable** | < 1 segundo para notificaciones |
| **Firewall-friendly** | HTTP rara vez es bloqueado |
| **Escalable** | EventEmitter pattern + sticky sessions |
| **Debugging simple** | Logs HTTP estándar |
| **Sin dependencias** | No requiere Socket.IO |

### ⚠️ Limitaciones

| Limitación | Impacto | Mitigación |
|------------|---------|------------|
| **Unidireccional** | Solo server → client | OK para nuestro caso (notificaciones + mensajería de recepción) |
| **Límite de conexiones** | ~6 conexiones por dominio (HTTP/1.1) | Usar HTTP/2 o subdominios |
| **Latencia vs WebSocket** | ~100-500ms vs ~50ms | Aceptable para notificaciones |
| **Binary data** | No soporta binarios nativamente | Usar base64 (o migrar a WS si necesario) |

### Cuándo Migrar a WebSockets (POST-MVP)

Considera WebSockets si:
- ❌ Latencia > 500ms se vuelve crítica
- ❌ Necesitas **bidireccionalidad** (enviar desde cliente sin HTTP)
- ❌ Tráfico supera 10,000+ conexiones concurrentes
- ❌ Requieres **streaming de binarios** (audio, video)

---

## Troubleshooting y Best Practices

### 🐛 Problemas Comunes

#### 1. Conexión se cierra cada ~60 segundos

**Causa:** Proxy/firewall cierra conexiones HTTP idle

**Solución:**
```typescript
// Backend: Enviar heartbeat cada 30s
const heartbeatInterval = setInterval(() => {
  res.write(': heartbeat\n\n'); // Comentario SSE
}, 30000);
```

---

#### 2. "EventSource failed" en consola

**Causa:** CORS no configurado correctamente

**Solución:**
```typescript
// apps/backend/src/app.ts
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true // ✅ CRÍTICO para SSE
}));
```

---

#### 3. Memory leaks en backend

**Causa:** Listeners no se limpian al desconectar

**Solución:**
```typescript
// SIEMPRE limpiar en req.on('close')
req.on('close', () => {
  clearInterval(heartbeatInterval);
  this.notificationService.removeListener(userId, notificationListener);
});
```

---

#### 4. No recibe notificaciones

**Checklist:**
- ✅ JWT válido en cookies?
- ✅ authMiddleware en `/stream` endpoint?
- ✅ `withCredentials: true` en EventSource?
- ✅ NotificationService emite eventos correctamente?
- ✅ Listener registrado para el userId correcto?

---

### ✅ Best Practices

#### Backend

```typescript
// ✅ DO: Usar heartbeat
setInterval(() => res.write(': heartbeat\n\n'), 30000);

// ✅ DO: Validar userId antes de enviar
if (notification.userId === userId) {
  res.write(`data: ${JSON.stringify(notification)}\n\n`);
}

// ✅ DO: Limpiar listeners SIEMPRE
req.on('close', () => {
  clearInterval(heartbeatInterval);
  service.removeListener(userId, listener);
});

// ❌ DON'T: Olvidar el doble salto de línea
res.write(`data: ${JSON.stringify(data)}\n\n`); // ✅ Doble \n\n

// ❌ DON'T: Enviar notificaciones a usuarios equivocados
// Siempre filtrar por userId
```

---

#### Frontend

```typescript
// ✅ DO: Reconectar automáticamente
this.eventSource.onerror = () => {
  this.handleReconnect();
};

// ✅ DO: Desconectar al desmontar
useEffect(() => {
  return () => sseClient.disconnect();
}, []);

// ✅ DO: Validar token antes de conectar
const token = getAuthToken();
if (!token) return;

// ❌ DON'T: Crear múltiples conexiones SSE
// Solo una conexión por usuario
```

---

### 📊 Monitoring y Debugging

#### Logs útiles (Backend)

```typescript
// Log al conectar
console.log(`SSE connection established for user ${userId}`);

// Log al enviar notificación
console.log(`Notification sent to ${userId} via SSE:`, notification.type);

// Log al desconectar
console.log(`SSE connection closed for user ${userId}`);

// Log de listeners activos
console.log(`Active SSE listeners: ${this.listeners.size}`);
```

#### Debugging en Chrome DevTools

1. **Network tab** → Filtrar "stream" → Ver eventos en tiempo real
2. **EventSource en Sources** → Breakpoints en callbacks
3. **Console** → `console.log` en `eventSource.onmessage`

---

## Conclusión

**FleetMan utiliza Server-Sent Events (SSE)** como solución de comunicación en tiempo real porque:

✅ Es **más simple** que WebSockets  
✅ Es **suficiente** para nuestras necesidades (notificaciones + mensajería)  
✅ Está **ya implementado y funcionando**  
✅ Tiene **reconexión automática**  
✅ Es **HTTP estándar** (firewall-friendly)  

Para el **Módulo 3 (Mensajería)**, simplemente reutilizamos este sistema agregando un nuevo tipo de notificación `'NEW_MESSAGE'` sin necesidad de cambiar infraestructura.

**Latencia típica:** < 1 segundo ⚡

---

## Referencias

- [MDN: Using Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [HTML5 Rocks: Stream Updates with SSE](https://www.html5rocks.com/en/tutorials/eventsource/basics/)
- [EventSource API Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)

---

**Documentado:** Enero 2026  
**Última actualización:** Enero 10, 2026
