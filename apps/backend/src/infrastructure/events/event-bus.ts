/**
 * EventBus - In-Memory Pub/Sub Coordinator
 * 
 * Responsibilities:
 * - Decouple event emitters from event consumers
 * - Allow multiple listeners for the same event type
 * - Provide type-safe event registration and emission
 * 
 * Pattern: Observer/Pub-Sub
 * - Publishers emit events without knowing who listens
 * - Subscribers register handlers without knowing who emits
 * - EventBus acts as central coordinator
 * 
 * Use Case:
 * ```typescript
 * // Use Case emits event
 * eventBus.emit('notification-created', new NotificationCreatedEvent(...));
 * 
 * // SSEManager listens
 * eventBus.on('notification-created', (event) => sseManager.publish(event));
 * ```
 * 
 * Sprint #9 - Real-Time Notifications
 */

type EventHandler = (event: any) => void | Promise<void>;

class EventBus {
  private listeners: Map<string, EventHandler[]> = new Map();

  /**
   * Register event listener
   * 
   * @param eventName - Event type to listen for (e.g., 'notification-created')
   * @param handler - Callback function to execute when event is emitted
   * 
   * @example
   * ```typescript
   * eventBus.on('notification-created', (event: NotificationCreatedEvent) => {
   *   console.log('Notification created:', event.notificationId);
   * });
   * ```
   */
  on(eventName: string, handler: EventHandler): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)!.push(handler);
  }

  /**
   * Emit event to all registered listeners
   * 
   * Executes handlers synchronously in registration order.
   * Errors in individual handlers don't prevent other handlers from executing.
   * 
   * @param eventName - Event type being emitted
   * @param event - Event payload (typically a domain event instance)
   * 
   * @example
   * ```typescript
   * eventBus.emit('notification-created', new NotificationCreatedEvent(
   *   userId,
   *   notificationId,
   *   'success',
   *   'Machine updated successfully',
   *   new Date()
   * ));
   * ```
   */
  emit(eventName: string, event: any): void {
    const handlers = this.listeners.get(eventName) || [];
    
    if (handlers.length === 0) {
      // No listeners registered - not necessarily an error (e.g., SSE disabled)
      return;
    }

    // Execute all handlers, catching errors to prevent cascade failures
    handlers.forEach((handler, index) => {
      try {
        handler(event);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[EventBus] Error in handler ${index} for event '${eventName}':`, errorMessage);
        // Continue executing other handlers despite error
      }
    });
  }

  /**
   * Remove specific event listener
   * 
   * Useful for cleanup when features are disabled or components unmount.
   * 
   * @param eventName - Event type
   * @param handler - Handler function to remove (must be same reference)
   * 
   * @example
   * ```typescript
   * const handler = (event) => console.log(event);
   * eventBus.on('notification-created', handler);
   * // Later...
   * eventBus.off('notification-created', handler);
   * ```
   */
  off(eventName: string, handler: EventHandler): void {
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Remove all listeners for a specific event type
   * 
   * @param eventName - Event type to clear
   */
  removeAllListeners(eventName: string): void {
    this.listeners.delete(eventName);
  }

  /**
   * Clear all registered listeners
   * 
   * Useful for testing or graceful shutdown.
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Get count of listeners for debugging/monitoring
   * 
   * @param eventName - Optional event type filter
   * @returns Number of listeners (for specific event or total)
   */
  getListenerCount(eventName?: string): number {
    if (eventName) {
      return this.listeners.get(eventName)?.length || 0;
    }
    
    // Total listeners across all events
    let total = 0;
    this.listeners.forEach(handlers => {
      total += handlers.length;
    });
    return total;
  }

  /**
   * Get all registered event names
   * 
   * Useful for debugging and health checks.
   */
  getEventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  // ===== FUTURE FEATURES (Commented) =====

  /**
   * [FUTURE] Emit event asynchronously with Promise support
   * 
   * Useful when handlers need to perform async operations (e.g., HTTP calls, DB writes)
   * and you want to wait for all handlers to complete.
   * 
   * @param eventName - Event type
   * @param event - Event payload
   * @returns Promise that resolves when all handlers complete
   * 
   * @example
   * ```typescript
   * await eventBus.emitAsync('notification-created', event);
   * console.log('All handlers completed');
   * ```
   */
  // async emitAsync(eventName: string, event: any): Promise<void> {
  //   const handlers = this.listeners.get(eventName) || [];
  //   await Promise.all(handlers.map(handler => handler(event)));
  // }

  /**
   * [FUTURE] Once listener - auto-removes after first execution
   * 
   * Useful for one-time events (e.g., first user login, app initialization).
   * 
   * @param eventName - Event type
   * @param handler - Handler to execute once
   * 
   * @example
   * ```typescript
   * eventBus.once('app-initialized', () => console.log('App ready'));
   * ```
   */
  // once(eventName: string, handler: EventHandler): void {
  //   const onceHandler: EventHandler = (event) => {
  //     handler(event);
  //     this.off(eventName, onceHandler);
  //   };
  //   this.on(eventName, onceHandler);
  // }

  /**
   * [FUTURE] Event middleware/interceptors
   * 
   * Allows transforming/validating events before reaching handlers.
   * Useful for logging, metrics, or filtering.
   * 
   * @param middleware - Function that transforms/validates event
   * 
   * @example
   * ```typescript
   * eventBus.use((eventName, event) => {
   *   console.log(`Event: ${eventName}`, event);
   *   return event; // Must return event (or transformed version)
   * });
   * ```
   */
  // private middlewares: Array<(eventName: string, event: any) => any> = [];
  // use(middleware: (eventName: string, event: any) => any): void {
  //   this.middlewares.push(middleware);
  // }
}

/**
 * Singleton instance - imported across entire backend
 * 
 * Singleton ensures all use cases and infrastructure components
 * share the same EventBus instance for proper pub/sub coordination.
 */
export const eventBus = new EventBus();

/**
 * Export class for testing purposes (mocking, DI containers)
 */
export { EventBus };
