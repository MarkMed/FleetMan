import { Router } from 'express';
import { requestSanitization } from '../middlewares/requestSanitization';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { NotificationController } from '../controllers/notification.controller';
import {
  GetNotificationsQuerySchema,
  MarkAsSeenRequestSchema
} from '@packages/contracts';
import { sseManager } from '../infrastructure/events';
import { AuthService } from '../services/auth.service';
import { logger } from '../config/logger.config';

const router = Router();
const notificationController = new NotificationController();

/**
 * Notification Routes
 * 
 * Endpoints for user notification management.
 * All routes require authentication and validate ownership.
 * 
 * Sprint #9 - Notification System
 * 
 * IMPORTANT: Route order matters! More specific routes must come before generic ones.
 * '/:userId/notifications/unread-count' must be before '/:userId/notifications'
 * to avoid Express matching 'unread-count' as a userId parameter.
 */

/**
 * @swagger
 * /api/v1/users/{userId}/notifications/unread-count:
 *   get:
 *     summary: Get unread notifications count
 *     description: |
 *       Returns the count of unread notifications for the authenticated user.
 *       Lightweight endpoint used for badge display in navbar/header.
 *       Typically polled every 30 seconds for real-time updates.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user (must match authenticated user)
 *         example: "user_abc123"
 *       - in: query
 *         name: onlyUnread
 *         schema:
 *           type: boolean
 *         description: Filter only unread notifications
 *         example: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of notifications per page
 *         example: 20
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notifications retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "6576f2b9e4c8a9b4d2a3c1e5"
 *                           notificationType:
 *                             type: string
 *                             enum: [success, warning, error, info]
 *                             example: "success"
 *                           message:
 *                             type: string
 *                             example: "QuickCheck completado: approved"
 *                           wasSeen:
 *                             type: boolean
 *                             example: false
 *                           notificationDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-12-18T10:30:00Z"
 *                           actionUrl:
 *                             type: string
 *                             example: "/machines/machine_123/quickchecks"
 *                           sourceType:
 *                             type: string
 *                             enum: [QUICKCHECK, EVENT, MAINTENANCE, SYSTEM]
 *                             example: "QUICKCHECK"
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Unauthorized - Missing or invalid authentication
 *       403:
 *         description: Forbidden - User trying to access another user's notifications
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:userId/notifications/unread-count',
  requestSanitization,
  authMiddleware,
  (req, res) => notificationController.countUnread(req, res)
);

/**
 * @swagger
 * /api/v1/users/{userId}/notifications:
 *   get:
 *     summary: Get user notifications
 *     description: |
 *       Retrieves paginated notifications for the authenticated user.
 *       Users can only access their own notifications (ownership validation).
 *       Supports filtering by read/unread status and pagination.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user (must match authenticated user)
 *         example: "user_abc123"
 *       - in: query
 *         name: onlyUnread
 *         schema:
 *           type: boolean
 *         description: Filter only unread notifications
 *         example: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of notifications per page
 *         example: 20
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notifications retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "6576f2b9e4c8a9b4d2a3c1e5"
 *                           notificationType:
 *                             type: string
 *                             enum: [success, warning, error, info]
 *                             example: "success"
 *                           message:
 *                             type: string
 *                             example: "QuickCheck completado: approved"
 *                           wasSeen:
 *                             type: boolean
 *                             example: false
 *                           notificationDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-12-18T10:30:00Z"
 *                           actionUrl:
 *                             type: string
 *                             example: "/machines/machine_123/quickchecks"
 *                           sourceType:
 *                             type: string
 *                             enum: [QUICKCHECK, EVENT, MAINTENANCE, SYSTEM]
 *                             example: "QUICKCHECK"
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Unauthorized - Missing or invalid authentication
 *       403:
 *         description: Forbidden - User trying to access another user's notifications
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:userId/notifications',
  requestSanitization,
  authMiddleware,
  validateRequest({ query: GetNotificationsQuerySchema }),
  (req, res) => notificationController.getNotifications(req, res)
);

/**
 * @swagger
 * /api/v1/users/{userId}/notifications/mark-as-seen:
 *   patch:
 *     summary: Mark notifications as seen
 *     description: |
 *       Marks multiple notifications as seen (wasSeen = true) in a single batch operation.
 *       Users can only mark their own notifications (ownership validation).
 *       Invalid notification IDs are silently ignored.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user (must match authenticated user)
 *         example: "user_abc123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notificationIds
 *             properties:
 *               notificationIds:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 100
 *                 items:
 *                   type: string
 *                   pattern: "^[a-f\\d]{24}$"
 *                 description: Array of notification IDs to mark as seen (MongoDB ObjectIds)
 *                 example: ["6576f2b9e4c8a9b4d2a3c1e5", "6576f2b9e4c8a9b4d2a3c1e6"]
 *     responses:
 *       200:
 *         description: Notifications marked as seen successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notifications marked as seen successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     markedCount:
 *                       type: integer
 *                       example: 5
 *       400:
 *         description: Invalid request - malformed notification IDs
 *       401:
 *         description: Unauthorized - Missing or invalid authentication
 *       403:
 *         description: Forbidden - User trying to mark another user's notifications
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  '/:userId/notifications/mark-as-seen',
  requestSanitization,
  authMiddleware,
  validateRequest({ body: MarkAsSeenRequestSchema }),
  (req, res) => notificationController.markAsSeen(req, res)
);

/**
 * @swagger
 * /api/v1/users/{userId}/notifications/stream:
 *   get:
 *     summary: Real-time notification stream (SSE)
 *     description: |
 *       Server-Sent Events (SSE) endpoint for receiving notifications in real-time.
 *       Maintains persistent HTTP connection to push updates as they occur.
 *       
 *       **Authentication:**
 *       Token can be provided via:
 *       - Query parameter: ?token=JWT (recommended for EventSource compatibility)
 *       - Authorization header: Bearer JWT (fallback)
 *       
 *       Note: EventSource API doesn't support custom headers, so query parameter
 *       is the standard approach for SSE authentication.
 *       
 *       **FleetMan Multi-Device Context:**
 *       - 1 account per company/client (not individual users)
 *       - Same account logged in on multiple devices (PC, mobile, tablet)
 *       - When notification created → Pushed to ALL devices simultaneously
 *       
 *       **Use Case:**
 *       1. Technician (mobile) finalizes QuickCheck
 *       2. Backend creates notification for company account
 *       3. SSE pushes to: Admin PC + Technician mobile + Supervisor tablet
 *       4. All devices show toast + update notification list in <300ms
 *       
 *       **Technical:**
 *       - Protocol: Server-Sent Events (text/event-stream)
 *       - Keep-alive: 30-second ping to prevent timeout
 *       - Auto-reconnect: Browser handles reconnection automatically
 *       - Format: `data: ${JSON}\n\n`
 *       
 *       **Client Example:**
 *       ```javascript
 *       // EventSource with query param authentication
 *       const streamUrl = `${API_BASE_URL}/api/v1/users/${userId}/notifications/stream?token=${encodeURIComponent(token)}`;
 *       const eventSource = new EventSource(streamUrl);
 *       
 *       eventSource.onmessage = (event) => {
 *         if (event.data === ': connected' || event.data === ': ping') return;
 *         const notification = JSON.parse(event.data);
 *         showToast(notification.message);
 *       };
 *       ```
 *       
 *       Sprint #9 - Real-Time Notifications
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user/company account (must match authenticated user)
 *         example: "empresaabc_123"
 *       - in: query
 *         name: token
 *         required: false
 *         schema:
 *           type: string
 *         description: JWT access token (preferred for EventSource, alternative to Authorization header)
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: SSE connection established (stream remains open)
 *         headers:
 *           Content-Type:
 *             schema:
 *               type: string
 *               example: text/event-stream
 *           Cache-Control:
 *             schema:
 *               type: string
 *               example: no-cache
 *           Connection:
 *             schema:
 *               type: string
 *               example: keep-alive
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: |
 *                 : connected
 *                 
 *                 data: {"userId":"empresaabc_123","notificationId":"notif_123","notificationType":"success","message":"QuickCheck completado","createdAt":"2025-12-19T10:30:00Z","actionUrl":"/machines/123/quickchecks","sourceType":"QUICKCHECK"}
 *                 
 *                 : ping
 *                 
 *                 data: {"userId":"empresaabc_123","notificationId":"notif_124","notificationType":"warning","message":"Mantenimiento vencido","createdAt":"2025-12-19T10:31:00Z","actionUrl":"/machines/456/maintenance","sourceType":"MAINTENANCE"}
 *       401:
 *         description: Unauthorized - Missing or invalid authentication
 *       403:
 *         description: Forbidden - User trying to access another user's stream
 */
router.get(
  '/:userId/notifications/stream',
  requestSanitization,
  async (req, res) => {
    try {
      const { userId } = req.params;

      // 1. Extract token from query param OR Authorization header
      // EventSource can't send custom headers, so query param is standard approach
      const token = (req.query.token as string) || req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        logger.warn({
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          path: req.path,
          userId
        }, 'SSE connection attempt without token');

        res.status(401).json({
          success: false,
          message: 'Authentication required. Provide token via query parameter (?token=JWT) or Authorization header.',
          error: 'MISSING_TOKEN'
        });
        return;
      }

      // 2. Manually verify token (can't use authMiddleware because EventSource doesn't support headers)
      let decodedToken: any;
      try {
        decodedToken = AuthService.verifyAccessToken(token);
        
        if (!decodedToken) {
          throw new Error('Invalid token');
        }

        logger.debug({
          userId: decodedToken.userId,
          email: decodedToken.email,
          requestedUserId: userId
        }, 'SSE token verified successfully');

      } catch (error) {
        logger.warn({
          ip: req.ip,
          userId,
          error: error instanceof Error ? error.message : 'Token verification failed'
        }, 'SSE connection attempt with invalid token');

        res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
          error: 'INVALID_TOKEN'
        });
        return;
      }

      // 3. Verify ownership - user can only subscribe to their own stream
      if (decodedToken.userId !== userId) {
        logger.warn({
          authenticatedUserId: decodedToken.userId,
          requestedUserId: userId,
          ip: req.ip
        }, 'SSE ownership validation failed');

        res.status(403).json({
          success: false,
          message: 'Forbidden. You can only subscribe to your own notification stream.',
          error: 'FORBIDDEN'
        });
        return;
      }

      // 4. Configure SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering

      // 5. Flush headers immediately to establish stream
      res.flushHeaders();

      // 6. Send initial confirmation message
      res.write(': connected\n\n');

      // 7. Register client in SSEManager
      sseManager.subscribe(userId, res);
      
      const stats = sseManager.getStats();
      logger.info({
        userId,
        email: decodedToken.email,
        ip: req.ip,
        totalDevices: stats.totalDevices,
        activeUsers: stats.activeUsers
      }, '✅ SSE stream established successfully');

      // 8. Keep-alive ping every 30 seconds
      // Prevents timeout by proxies/load balancers (typically 60s)
      const keepAliveInterval = setInterval(() => {
        try {
          sseManager.sendKeepAlive(userId);
        } catch (error) {
          clearInterval(keepAliveInterval);
          logger.error({ 
            userId, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }, 'SSE keep-alive failed');
        }
      }, 30000);

      // 9. Cleanup on client disconnect
      req.on('close', () => {
        clearInterval(keepAliveInterval);
        sseManager.unsubscribe(userId, res);
        
        const remainingStats = sseManager.getStats();
        logger.info({
          userId,
          remainingDevices: remainingStats.totalDevices,
          remainingUsers: remainingStats.activeUsers
        }, '🔌 SSE client disconnected');
        
        res.end();
      });

      // 10. Handle errors
      req.on('error', (error) => {
        clearInterval(keepAliveInterval);
        sseManager.unsubscribe(userId, res);
        
        logger.error({
          userId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 'SSE connection error');
      });

    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        userId: req.params.userId
      }, 'SSE endpoint exception');

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to establish SSE stream',
          error: 'INTERNAL_SERVER_ERROR'
        });
      }
    }
  }
);

export default router;
