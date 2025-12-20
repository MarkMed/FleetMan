import { Response } from 'express';
import { NotificationCreatedEvent } from '@packages/domain';

/**
 * SSEManager - Server-Sent Events Connection Manager
 * 
 * Responsibilities:
 * - Maintain persistent HTTP connections with clients (EventSource)
 * - Push events to connected devices in real-time (<100ms latency)
 * - Handle multi-device scenarios (same company account on PC, mobile, tablet)
 * - Auto-cleanup on disconnect
 * - Keep-alive pings to prevent proxy/load balancer timeouts
 * 
 * Architecture:
 * ```
 * FleetMan Context: 1 cuenta por empresa = múltiples dispositivos
 * 
 * Map<userId, Response[]>
 *   ├─ "empresaabc_123": [PC_Response, Mobile_Response, Tablet_Response]
 *   ├─ "empresaxyz_456": [PC_Response]
 *   └─ "empresadef_789": [Mobile_Response, Tablet_Response]
 * 
 * When notification created for "empresaabc_123":
 *   → Push to ALL 3 devices simultaneously (<300ms total)
 * ```
 * 
 * SSE Protocol:
 * - Client: EventSource connects to GET /notifications/stream
 * - Server: Responds with headers "text/event-stream" + keeps connection open
 * - Data format: `data: ${JSON.stringify(event)}\n\n`
 * - Keep-alive: `: ping\n\n` every 30 seconds
 * 
 * Sprint #9 - Real-Time Notifications
 */
class SSEManager {
  /**
   * Active SSE connections
   * 
   * Key: userId (empresa/cuenta ID)
   * Value: Array of Response objects (one per connected device)
   * 
   * Example:
   * - User opens app on desktop → subscribe adds Response[0]
   * - Same user opens app on mobile → subscribe adds Response[1]
   * - clients.get(userId) = [desktop_res, mobile_res]
   */
  private clients: Map<string, Response[]> = new Map();

  /**
   * Subscribe client to SSE stream
   * 
   * Registers device connection and sets up auto-cleanup on disconnect.
   * 
   * FleetMan Scenario:
   * ```
   * Empresa ABC (userId: "empresaabc_123")
   *   1. Admin opens app on PC → subscribe("empresaabc_123", pc_res)
   *   2. Technician opens app on mobile → subscribe("empresaabc_123", mobile_res)
   *   3. Supervisor opens app on tablet → subscribe("empresaabc_123", tablet_res)
   * 
   * Result: clients["empresaabc_123"] = [pc_res, mobile_res, tablet_res]
   * ```
   * 
   * @param userId - User/company account ID
   * @param res - Express Response object configured for SSE
   */
  subscribe(userId: string, res: Response): void {
    // Initialize array if first device for this account
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }

    // Add device to account's connections
    this.clients.get(userId)!.push(res);
    
    const deviceCount = this.clients.get(userId)!.length;
    console.log(`✅ [SSE] Device connected | userId=${userId} | totalDevices=${deviceCount}`);

    // Auto-cleanup when client disconnects
    res.on('close', () => {
      this.unsubscribe(userId, res);
      const remainingDevices = this.clients.get(userId)?.length || 0;
      console.log(`🔌 [SSE] Device disconnected | userId=${userId} | remainingDevices=${remainingDevices}`);
    });
  }

  /**
   * Unsubscribe client from SSE stream
   * 
   * Removes device connection. If no devices remain for account, removes Map entry.
   * 
   * @param userId - User/company account ID
   * @param res - Response object to remove
   */
  unsubscribe(userId: string, res: Response): void {
    const userDevices = this.clients.get(userId);
    
    if (!userDevices) return;

    // Remove specific device
    const index = userDevices.indexOf(res);
    if (index > -1) {
      userDevices.splice(index, 1);
    }

    // Cleanup: Remove Map entry if no devices remain
    if (userDevices.length === 0) {
      this.clients.delete(userId);
      console.log(`🗑️  [SSE] All devices disconnected, cleaned up userId=${userId}`);
    }
  }

  /**
   * Publish event to all connected devices of a user
   * 
   * Core functionality: Push notification to ALL devices of company account.
   * 
   * FleetMan Flow:
   * ```
   * 1. Technician (Celular) finalizes QuickCheck
   * 2. Backend creates notification for userId="empresaabc_123"
   * 3. EventBus emits → SSEManager.publish(event)
   * 4. SSEManager finds clients["empresaabc_123"] = [PC, Celular, Tablet]
   * 5. Push to ALL 3 devices: res.write(`data: ${JSON}\n\n`)
   * 6. All 3 devices show toast + update cache in <300ms
   * ```
   * 
   * @param event - NotificationCreatedEvent from domain layer
   */
  publish(event: NotificationCreatedEvent): void {
    const userDevices = this.clients.get(event.userId);
    
    // No devices connected - skip (not an error, user might be offline)
    if (!userDevices || userDevices.length === 0) {
      console.log(`ℹ️  [SSE] No devices connected for userId=${event.userId}, skipping push`);
      return;
    }

    // Serialize event to JSON (uses event.toJSON() method)
    const data = JSON.stringify(event.toJSON());

    // Push to ALL devices of this company account
    // Collect failed devices to remove after iteration (avoid modifying array during forEach)
    let successCount = 0;
    const failedDevices: Response[] = [];
    
    userDevices.forEach((deviceResponse, index) => {
      try {
        // SSE format: `data: ${JSON}\n\n`
        deviceResponse.write(`data: ${data}\n\n`);
        successCount++;
        console.log(`📬 [SSE] Event pushed to device #${index + 1} | userId=${event.userId} | notificationId=${event.notificationId}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ [SSE] Error pushing to device #${index + 1}:`, errorMessage);
        failedDevices.push(deviceResponse);
      }
    });

    // Auto-cleanup failed connections after iteration completes
    failedDevices.forEach((deviceResponse) => {
      this.unsubscribe(event.userId, deviceResponse);
    });

    console.log(`✅ [SSE] Event published | userId=${event.userId} | devices=${successCount}/${userDevices.length} | type=${event.notificationType}`);
  }

  /**
   * Send keep-alive ping to all user's devices
   * 
   * SSE connections can timeout due to proxies/load balancers (typically 60s).
   * Sending empty comment every 30s keeps connection alive.
   * 
   * Format: `: ping\n\n` (comment line, ignored by EventSource)
   * 
   * @param userId - User/company account ID
   */
  sendKeepAlive(userId: string): void {
    const userDevices = this.clients.get(userId);
    
    if (!userDevices) return;

    userDevices.forEach((deviceResponse, index) => {
      try {
        // SSE comment format (doesn't trigger onmessage in client)
        deviceResponse.write(': ping\n\n');
      } catch (error) {
        console.error(`❌ [SSE] Keep-alive failed for device #${index + 1}:`, error);
        this.unsubscribe(userId, deviceResponse);
      }
    });
  }

  /**
   * Send keep-alive to ALL connected clients
   * 
   * Used by global interval in endpoint (every 30s).
   */
  sendKeepAliveToAll(): void {
    this.clients.forEach((devices, userId) => {
      this.sendKeepAlive(userId);
    });
  }

  /**
   * Get statistics for monitoring/health checks
   * 
   * @returns Object with active connections metrics
   */
  getStats() {
    const userCount = this.clients.size;
    let totalDevices = 0;
    let maxDevicesPerUser = 0;

    this.clients.forEach((devices) => {
      totalDevices += devices.length;
      if (devices.length > maxDevicesPerUser) {
        maxDevicesPerUser = devices.length;
      }
    });

    return {
      activeUsers: userCount,
      totalDevices,
      maxDevicesPerUser,
      averageDevicesPerUser: userCount > 0 ? (totalDevices / userCount).toFixed(2) : 0
    };
  }

  /**
   * Log current state for debugging
   */
  logState(): void {
    const stats = this.getStats();
    console.log('[SSE State]', stats);
    
    // Log per-user breakdown
    this.clients.forEach((devices, userId) => {
      console.log(`  - ${userId}: ${devices.length} device(s)`);
    });
  }

  // ===== FUTURE FEATURES (Commented) =====

  /**
   * [FUTURE] Targeted push to specific device
   * 
   * Useful when action originated from one device and you want to
   * notify ONLY other devices (avoid echo to originator).
   * 
   * @param userId - User account ID
   * @param event - Event to push
   * @param excludeDeviceId - Device identifier to exclude (e.g., IP address, session ID)
   * 
   * @example
   * ```typescript
   * // User marks notification as seen on mobile
   * // → Push update to desktop and tablet, but NOT mobile
   * sseManager.publishExcept(userId, event, req.sessionID);
   * ```
   */
  // publishExcept(userId: string, event: NotificationCreatedEvent, excludeDeviceId: string): void {
  //   const userDevices = this.clients.get(userId);
  //   if (!userDevices) return;
  //   
  //   userDevices.forEach((res) => {
  //     if (res.req.sessionID !== excludeDeviceId) {
  //       res.write(`data: ${JSON.stringify(event.toJSON())}\n\n`);
  //     }
  //   });
  // }

  /**
   * [FUTURE] Named event types for EventSource
   * 
   * SSE supports named events: `event: notification-created\ndata: ${JSON}\n\n`
   * Frontend can listen selectively: `eventSource.addEventListener('notification-created', handler)`
   * 
   * @param userId - User account ID
   * @param eventType - Event name (e.g., 'notification-created', 'machine-updated')
   * @param data - Event payload
   * 
   * @example
   * ```typescript
   * sseManager.publishTypedEvent(userId, 'notification-created', notificationEvent);
   * sseManager.publishTypedEvent(userId, 'machine-updated', machineEvent);
   * 
   * // Frontend:
   * eventSource.addEventListener('notification-created', handleNotification);
   * eventSource.addEventListener('machine-updated', handleMachine);
   * ```
   */
  // publishTypedEvent(userId: string, eventType: string, data: any): void {
  //   const userDevices = this.clients.get(userId);
  //   if (!userDevices) return;
  //   
  //   const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  //   userDevices.forEach(res => res.write(message));
  // }

  /**
   * [FUTURE] Rate limiting per user
   * 
   * Prevent abuse: Limit events pushed per user per second.
   * Useful when scaling to thousands of users.
   * 
   * @param userId - User account ID
   * @param maxEventsPerSecond - Throttle limit
   */
  // private rateLimits: Map<string, { count: number; resetAt: number }> = new Map();
  // 
  // private checkRateLimit(userId: string, maxEventsPerSecond: number): boolean {
  //   const now = Date.now();
  //   const limit = this.rateLimits.get(userId);
  //   
  //   if (!limit || now > limit.resetAt) {
  //     this.rateLimits.set(userId, { count: 1, resetAt: now + 1000 });
  //     return true;
  //   }
  //   
  //   if (limit.count >= maxEventsPerSecond) {
  //     console.warn(`[SSE] Rate limit exceeded for userId=${userId}`);
  //     return false;
  //   }
  //   
  //   limit.count++;
  //   return true;
  // }
}

/**
 * Singleton instance - imported across backend infrastructure
 * 
 * Singleton ensures all EventBus listeners and SSE endpoints
 * share the same SSEManager for proper connection management.
 */
export const sseManager = new SSEManager();

/**
 * Export class for testing purposes (mocking, DI containers)
 */
export { SSEManager };
