/**
 * Infrastructure Events - Module Initialization
 * 
 * Responsibilities:
 * - Wire EventBus with SSEManager (connect pub/sub to SSE push)
 * - Export singletons for use across backend
 * - Initialize event listeners on module load
 * 
 * Architecture:
 * ```
 * Use Case → eventBus.emit('notification-created', event)
 *              ↓
 *         EventBus (pub/sub coordinator)
 *              ↓
 *         SSEManager.publish(event) ← Registered listener
 *              ↓
 *         Push to all connected devices
 * ```
 * 
 * Sprint #9 - Real-Time Notifications
 */

import { eventBus } from './event-bus';
import { sseManager } from './sse-manager';
import { NotificationCreatedEvent } from '@packages/domain';

/**
 * Wire EventBus to SSEManager
 * 
 * When any use case emits 'notification-created' event,
 * SSEManager automatically pushes to connected clients.
 * 
 * This runs on module load (singleton initialization).
 */
eventBus.on('notification-created', (event: NotificationCreatedEvent) => {
  sseManager.publish(event);
});

console.log('✅ [Infrastructure] EventBus wired to SSEManager for notification-created events');

/**
 * Export infrastructure singletons
 * 
 * Usage across backend:
 * ```typescript
 * // In use cases
 * import { eventBus } from '@/infrastructure/events';
 * eventBus.emit('notification-created', event);
 * 
 * // In SSE endpoint
 * import { sseManager } from '@/infrastructure/events';
 * sseManager.subscribe(userId, res);
 * ```
 */
export { eventBus, sseManager };

// ===== FUTURE FEATURES (Commented) =====

/**
 * [FUTURE] Health check endpoint data
 * 
 * Export function to get combined infrastructure health status.
 * Useful for /health or /metrics endpoints.
 * 
 * @example
 * ```typescript
 * export function getInfrastructureHealth() {
 *   return {
 *     eventBus: {
 *       registeredEvents: eventBus.getEventNames(),
 *       totalListeners: eventBus.getListenerCount()
 *     },
 *     sseManager: sseManager.getStats()
 *   };
 * }
 * ```
 */

/**
 * [FUTURE] Graceful shutdown
 * 
 * Close all SSE connections cleanly when server shutting down.
 * 
 * @example
 * ```typescript
 * export async function shutdownInfrastructure() {
 *   console.log('Shutting down infrastructure...');
 *   
 *   // Close all SSE connections
 *   sseManager.disconnectAll();
 *   
 *   // Clear event listeners
 *   eventBus.clear();
 *   
 *   console.log('Infrastructure shutdown complete');
 * }
 * 
 * // In main.ts:
 * process.on('SIGTERM', async () => {
 *   await shutdownInfrastructure();
 *   process.exit(0);
 * });
 * ```
 */

/**
 * [FUTURE] Multiple event types
 * 
 * Wire additional events for future sprints:
 * 
 * @example
 * ```typescript
 * // Sprint #10 - Events Module
 * eventBus.on('event-created', (event) => {
 *   sseManager.publishTypedEvent(event.userId, 'event-created', event);
 * });
 * 
 * // Sprint #11 - Maintenance Module
 * eventBus.on('maintenance-reminder', (event) => {
 *   sseManager.publishTypedEvent(event.userId, 'maintenance-reminder', event);
 * });
 * 
 * // Sprint #12 - Chat Module
 * eventBus.on('message-received', (event) => {
 *   sseManager.publishTypedEvent(event.userId, 'message-received', event);
 * });
 * ```
 */
