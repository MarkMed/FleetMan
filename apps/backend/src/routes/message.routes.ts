import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requestSanitization } from '../middlewares/requestSanitization';
import { validateRequest } from '../middlewares/validation.middleware';
import { 
  SendMessageRequestSchema,
  ConversationParamsSchema,
  ConversationHistoryQuerySchema
} from '@packages/contracts';

/**
 * Message Routes
 * 
 * Endpoints:
 * - POST   /api/v1/messages                          - Send message to contact
 * - GET    /api/v1/messages/conversations/:otherUserId - Get conversation history
 * 
 * Security:
 * - All routes require authentication (authMiddleware)
 * - senderId extracted from JWT token (not from body)
 * - Body/params/query validated by Zod schemas
 * 
 * Middleware Chain:
 * 1. requestSanitization - Remove HTML tags, trim strings
 * 2. authMiddleware - Verify JWT token, extract userId
 * 3. validateRequest - Validate body/params/query with Zod
 * 4. controller - Execute business logic
 * 
 * Sprint #12 - Module 3: Messaging System
 */

const router = Router();
const controller = new MessageController();

/**
 * @swagger
 * /api/v1/messages:
 *   post:
 *     summary: Send message to contact
 *     description: Send a 1-to-1 message to a user in your contact list
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - content
 *             properties:
 *               recipientId:
 *                 type: string
 *                 description: ID of the recipient user (must be a contact)
 *                 example: "user_abc123"
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: Message content
 *                 example: "Hello, do you have the machine specifications?"
 *     responses:
 *       201:
 *         description: Message sent successfully
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
 *                   example: "Message sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         senderId:
 *                           type: string
 *                         recipientId:
 *                           type: string
 *                         content:
 *                           type: string
 *                         sentAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Invalid input (validation error, auto-message)
 *       403:
 *         description: Not a contact or user inactive
 *       404:
 *         description: Sender or recipient not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  requestSanitization,
  authMiddleware,
  validateRequest({ body: SendMessageRequestSchema }),
  controller.sendMessage.bind(controller)
);

/**
 * @swagger
 * /api/v1/messages/conversations/{otherUserId}:
 *   get:
 *     summary: Get conversation history with another user
 *     description: Retrieve paginated bidirectional messages between authenticated user and another user
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the other user in the conversation
 *         example: "user_xyz789"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Messages per page (max 50)
 *     responses:
 *       200:
 *         description: Conversation history retrieved successfully
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
 *                   example: "Conversation history retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           senderId:
 *                             type: string
 *                           recipientId:
 *                             type: string
 *                           content:
 *                             type: string
 *                           sentAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total number of messages
 *                         page:
 *                           type: integer
 *                           description: Current page number
 *                         limit:
 *                           type: integer
 *                           description: Messages per page
 *                         totalPages:
 *                           type: integer
 *                           description: Total number of pages
 *       400:
 *         description: Invalid input (validation error)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/conversations/:otherUserId',
  requestSanitization,
  authMiddleware,
  validateRequest({ 
    params: ConversationParamsSchema,
    query: ConversationHistoryQuerySchema 
  }),
  controller.getConversationHistory.bind(controller)
);

export default router;
