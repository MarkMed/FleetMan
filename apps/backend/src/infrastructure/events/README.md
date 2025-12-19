# Infrastructure Events - Real-Time Notifications

Backend infrastructure for Server-Sent Events (SSE) real-time notifications system.

## 📁 Structure

```
infrastructure/events/
├── event-bus.ts      - In-memory pub/sub coordinator
├── sse-manager.ts    - SSE connection & push manager
├── index.ts          - Module wiring & exports
└── README.md         - This file
```

## 🎯 Purpose

Decouple notification creation (use cases) from real-time push (SSE infrastructure) using Event-Driven Architecture.

**Flow**:
```
Use Case → eventBus.emit('notification-created')
             ↓
          EventBus (pub/sub)
             ↓
          SSEManager.publish()
             ↓
          Push to all connected devices (<300ms)
```

## 🔧 Components

### EventBus (`event-bus.ts`)

**Purpose**: Central pub/sub coordinator for domain events.

**Key Methods**:
- `on(eventName, handler)` - Register listener
- `emit(eventName, event)` - Publish event to all listeners
- `off(eventName, handler)` - Unregister listener
- `clear()` - Remove all listeners (testing/shutdown)

**Example**:
```typescript
import { eventBus } from '@/infrastructure/events';

// Register listener
eventBus.on('notification-created', (event) => {
  console.log('Notification created:', event.notificationId);
});

// Emit event
eventBus.emit('notification-created', new NotificationCreatedEvent(...));
```

### SSEManager (`sse-manager.ts`)

**Purpose**: Manage SSE connections and push events to connected devices.

**Architecture**:
```typescript
// FleetMan Context: 1 account per company = multiple devices
Map<userId, Response[]>
  ├─ "empresaabc_123": [PC_Response, Mobile_Response, Tablet_Response]
  ├─ "empresaxyz_456": [PC_Response]
  └─ "empresadef_789": [Mobile_Response, Tablet_Response]
```

**Key Methods**:
- `subscribe(userId, res)` - Register device connection
- `unsubscribe(userId, res)` - Remove device connection
- `publish(event)` - Push event to all user's devices
- `sendKeepAlive(userId)` - Ping to prevent timeout
- `getStats()` - Metrics for monitoring

**Example**:
```typescript
import { sseManager } from '@/infrastructure/events';

// In SSE endpoint
router.get('/stream', authMiddleware, (req, res) => {
  const userId = req.user.userId;
  sseManager.subscribe(userId, res);
  
  res.on('close', () => {
    sseManager.unsubscribe(userId, res);
  });
});
```

### Module Wiring (`index.ts`)

**Purpose**: Connect EventBus to SSEManager on module initialization.

**Wiring**:
```typescript
eventBus.on('notification-created', (event) => {
  sseManager.publish(event);
});
```

This runs automatically when module is imported, ensuring events are pushed via SSE.

## 🚀 Usage

### 1. Emit Event from Use Case

```typescript
// In add-notification.use-case.ts
import { eventBus } from '@/infrastructure/events';
import { NotificationCreatedEvent } from '@packages/domain';

async execute(userId: string, notification: AddNotificationRequest) {
  // Save to DB
  await this.repository.addNotification(userId, notification);
  
  // Emit event for real-time push
  eventBus.emit('notification-created', new NotificationCreatedEvent(
    userId,
    'notif_123',
    'success',
    'QuickCheck completed',
    new Date(),
    '/machines/123/quickchecks',
    'QUICKCHECK'
  ));
}
```

### 2. SSE Endpoint (Already Implemented)

See `apps/backend/src/routes/notification.routes.ts`:
```typescript
GET /api/v1/users/:userId/notifications/stream
```

### 3. Frontend Connection

```javascript
// Frontend SSE client
const eventSource = new EventSource(
  '/api/v1/users/empresaabc_123/notifications/stream',
  { withCredentials: true }
);

eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  showToast(notification.message);
  invalidateCache();
};
```

## 🧪 Testing

### Manual Testing with curl

```bash
# Connect to SSE stream
curl -N -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/v1/users/empresaabc_123/notifications/stream

# Expected output:
# : connected
# : ping
# data: {"userId":"empresaabc_123","notificationId":"notif_123",...}
```

### Create Notification to Trigger Push

```bash
# In another terminal, create notification via use case
# (e.g., finalize QuickCheck, create maintenance reminder)
# You should see event appear in curl terminal immediately
```

### Multi-Device Test

1. Open 2+ browser tabs with same user logged in
2. Create notification in one tab
3. Verify both tabs receive event simultaneously

## 📊 Monitoring

### Check Active Connections

```typescript
import { sseManager } from '@/infrastructure/events';

// Get stats
const stats = sseManager.getStats();
console.log(stats);
// Output: { activeUsers: 15, totalDevices: 23, maxDevicesPerUser: 3, ... }

// Log detailed state
sseManager.logState();
// Output:
// [SSE State] { activeUsers: 3, totalDevices: 5, ... }
//   - empresaabc_123: 3 device(s)
//   - empresaxyz_456: 1 device(s)
//   - empresadef_789: 1 device(s)
```

### Health Check Endpoint (Future)

```typescript
// In routes/health.routes.ts
router.get('/health/sse', (req, res) => {
  const stats = sseManager.getStats();
  res.json({
    healthy: true,
    connections: stats
  });
});
```

## ⚠️ Important Notes

### 1. In-Memory Limitations

Current implementation is **single-instance only**:
- ✅ Works: 1 backend server
- ❌ Doesn't work: Multiple backend instances with load balancer

**Solution for Multi-Instance** (Sprint #10+):
- Replace in-memory EventBus with Redis Pub/Sub
- Each instance subscribes to Redis channel
- Events broadcast across all instances

### 2. Keep-Alive Required

SSE connections timeout without activity (proxies/load balancers ~60s).

**Solution**: 30-second ping interval (already implemented in endpoint):
```typescript
setInterval(() => {
  sseManager.sendKeepAlive(userId);
}, 30000);
```

### 3. Authentication

EventSource doesn't support custom headers (no `Authorization: Bearer TOKEN`).

**Current MVP Approach**:
- Use `withCredentials: true` + HTTP-only cookies, OR
- Query param: `?token=${JWT}` (less secure, acceptable for MVP)

**Future** (Sprint #10):
- Migrate to HTTP-only cookies for security
- Modify login endpoint to set cookie alongside JSON response

### 4. Error Handling

Event emission is **fire-and-forget**:
- If SSE push fails, notification still saved to DB
- Use case logs error but doesn't throw
- Principle: DB persistence critical, real-time push nice-to-have

## 🔮 Future Enhancements

See commented sections in each file for:

### EventBus
- `emitAsync()` - Wait for all handlers to complete
- `once()` - Auto-remove listener after first execution
- Middleware/interceptors for logging, metrics

### SSEManager
- `publishExcept()` - Push to all devices except originator
- `publishTypedEvent()` - Named events for selective listening
- Rate limiting per user

### Multi-Sprint Extension

```typescript
// Sprint #10 - Events Module
eventBus.on('event-created', (event) => {
  sseManager.publish(event);
});

// Sprint #11 - Maintenance Module
eventBus.on('maintenance-reminder', (event) => {
  sseManager.publish(event);
});

// Sprint #12 - Chat Module
eventBus.on('message-received', (event) => {
  sseManager.publish(event);
});
```

## 📚 References

- [MDN EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
- [SSE Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- Architecture Doc: `docs/notifications-realtime-architecture.md`

---

**Sprint #9 - Real-Time Notifications**  
**Status**: ✅ Implemented & Ready for Testing
