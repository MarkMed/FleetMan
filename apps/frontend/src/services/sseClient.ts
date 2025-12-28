import { config } from '../config';
import type { NotificationType, NotificationSourceType } from '@packages/domain';

/**
 * SSE Event Data Structure from Backend
 * 
 * This represents the real-time event payload sent via Server-Sent Events
 * when a notification is created. It contains the notification data plus
 * metadata for real-time updates.
 * 
 * Note: Uses proper types from @packages/domain to maintain SSOT
 */
export type NotificationEventData = {
  userId: string;
  notificationId: string;
  notificationType: NotificationType; // 'success' | 'warning' | 'error' | 'info'
  message: string;
  createdAt: string;
  actionUrl?: string;
  sourceType?: NotificationSourceType; // 'QUICKCHECK' | 'EVENT' | 'MAINTENANCE' | 'SYSTEM'
  metadata?: Record<string, any>; // For i18n interpolation (machineName, userName, etc.)
};

/**
 * Handler function signature for notification events
 */
export type NotificationEventHandler = (event: NotificationEventData) => void;

/**
 * SSE Client for Real-Time Notifications
 * 
 * Singleton service that maintains persistent EventSource connection to backend,
 * handles reconnection with exponential backoff, and notifies observers using
 * internal Observer pattern.
 * 
 * Architecture:
 * - connect() establishes EventSource to /notifications/stream
 * - subscribe() registers observer handlers
 * - notify() broadcasts events to all observers
 * - Automatic reconnection on disconnect (max 5 attempts)
 * 
 * @example
 * ```ts
 * // In hook or component
 * useEffect(() => {
 *   sseClient.connect(token);
 *   const unsubscribe = sseClient.subscribe((event) => {
 *     console.log('Notification received:', event);
 *   });
 *   return () => {
 *     unsubscribe();
 *     sseClient.disconnect();
 *   };
 * }, [token]);
 * ```
 */
class SSEClient {
  private eventSource: EventSource | null = null;
  private observers: NotificationEventHandler[] = [];
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly baseReconnectDelay = 1000; // Base delay in ms
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;

  /**
   * Connect to SSE stream endpoint
   * 
   * @param token - JWT token for authentication (query param for MVP)
   * @param userId - User ID for endpoint path
   * 
   * NOTE: EventSource doesn't support custom headers, so we use query param for MVP.
   * Security trade-off accepted for MVP:
   * - Token visible in server logs (but HTTPS encrypts in transit)
   * - EventSource API limitation (no header support)
   * 
   * TODO Sprint #10: Migrate to HTTP-only cookies for better security
   */
  connect(token: string, userId: string): void {
    if (this.eventSource) {
      console.warn('[SSE] Already connected, skipping reconnect');
      return;
    }

    // Encode token to handle special characters in JWT
    const encodedToken = encodeURIComponent(token);
    
    // Construct full URL: /api/v1/users/:userId/notifications/stream?token=JWT
    const url = `${config.API_BASE_URL}/users/${userId}/notifications/stream?token=${encodedToken}`;
    
    console.log('[SSE] Connecting to:', url.replace(encodedToken, 'TOKEN_HIDDEN'));

    try {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('✅ [SSE] Connected successfully');
        this.reconnectAttempts = 0; // Reset on successful connection
        
        // Clear any pending reconnect timeout
        if (this.reconnectTimeoutId !== null) {
          clearTimeout(this.reconnectTimeoutId);
          this.reconnectTimeoutId = null;
        }
      };

      this.eventSource.onmessage = (event: MessageEvent) => {
        // Ignore keep-alive pings and connection confirmation from backend
        const data = event.data.trim();
        if (data === ': ping' || data === ': connected' || data === '' || data.startsWith(':')) {
          return;
        }

        try {
          const notificationEvent: NotificationEventData = JSON.parse(event.data);
          console.log('📨 [SSE] Event received:', notificationEvent);
          console.log('📬 [SSE] Notification received:', {
            id: notificationEvent.notificationId,
            notificationType: notificationEvent.notificationType,
            sourceType: notificationEvent.sourceType,
            message: notificationEvent.message,
            hasMetadata: !!notificationEvent.metadata
          });
          
          this.notify(notificationEvent);
        } catch (err) {
          console.error('❌ [SSE] Failed to parse event data:', err, event.data);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ [SSE] Connection error:', error);
        this.disconnect();
        this.attemptReconnect(token, userId);
      };
    } catch (err) {
      console.error('❌ [SSE] Failed to create EventSource:', err);
      this.attemptReconnect(token, userId);
    }
  }

  /**
   * Disconnect from SSE stream
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('🔌 [SSE] Disconnected');
    }

    // Clear any pending reconnect timeout
    if (this.reconnectTimeoutId !== null) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   * 
   * Strategy: 1s → 2s → 4s → 8s → 16s → max 30s
   */
  private attemptReconnect(token: string, userId: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `❌ [SSE] Max reconnect attempts (${this.maxReconnectAttempts}) reached. Giving up.`
      );
      return;
    }

    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000 // Max 30s
    );

    console.log(
      `🔄 [SSE] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(token, userId);
    }, delay);
  }

  /**
   * Subscribe to notification events (Observer pattern)
   * 
   * @param handler - Function to call when notification arrives
   * @returns Unsubscribe function
   * 
   * @example
   * ```ts
   * const unsubscribe = sseClient.subscribe((event) => {
   *   console.log('Notification:', event.message);
   * });
   * 
   * // Later, cleanup
   * unsubscribe();
   * ```
   */
  subscribe(handler: NotificationEventHandler): () => void {
    this.observers.push(handler);
    console.log(`[SSE] Observer subscribed (total: ${this.observers.length})`);
    
    // Return unsubscribe function
    return () => {
      const index = this.observers.indexOf(handler);
      if (index > -1) {
        this.observers.splice(index, 1);
        console.log(`[SSE] Observer unsubscribed (remaining: ${this.observers.length})`);
      }
    };
  }

  /**
   * Notify all observers of new event
   */
  private notify(event: NotificationEventData): void {
    console.log(`[SSE] Notifying ${this.observers.length} observer(s)`);
    
    this.observers.forEach((handler) => {
      try {
        handler(event);
      } catch (err) {
        console.error('[SSE] Error in observer handler:', err);
      }
    });
  }

  /**
   * Get current connection state
   */
  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }

  /**
   * Get connection stats for debugging
   */
  getStats() {
    return {
      connected: this.isConnected(),
      observerCount: this.observers.length,
      reconnectAttempts: this.reconnectAttempts,
      readyState: this.eventSource?.readyState,
    };
  }

  // TODO Sprint #10+: Advanced features (commented for future)
  
  /**
   * FUTURE: Unsubscribe all observers (useful for testing/cleanup)
   */
  // clearObservers(): void {
  //   this.observers = [];
  //   console.log('[SSE] All observers cleared');
  // }

  /**
   * FUTURE: Filter events by sourceType before notifying
   * Useful if we want selective subscriptions (e.g., only QUICKCHECK events)
   */
  // subscribeToType(
  //   sourceType: NotificationEventData['sourceType'],
  //   handler: NotificationEventHandler
  // ): () => void {
  //   const wrappedHandler: NotificationEventHandler = (event) => {
  //     if (event.sourceType === sourceType) {
  //       handler(event);
  //     }
  //   };
  //   return this.subscribe(wrappedHandler);
  // }
}

// Singleton instance
export const sseClient = new SSEClient();
