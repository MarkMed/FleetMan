import { Router } from 'express';
import { requestSanitization } from '../middlewares/requestSanitization';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { NotificationController } from '../controllers/notification.controller';
import {
  GetNotificationsQuerySchema,
  MarkAsSeenRequestSchema
} from '@packages/contracts';

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

export default router;
