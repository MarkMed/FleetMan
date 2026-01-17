import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requestSanitization } from '../middlewares/requestSanitization';
import { validateRequest } from '../middlewares/validation.middleware';
import { 
  SendMessageRequestSchema,
  ConversationParamsSchema,
  ConversationHistoryQuerySchema,
  ChatAccessControlParamsSchema,
  RecentConversationsQuerySchema
} from '@packages/contracts';

/**
 * Message Routes
 * 
 * Endpoints:
 * - POST   /api/v1/messages                                   - Send message to contact
 * - GET    /api/v1/messages/conversations                     - List recent conversations (Sprint #13 Inbox)
 * - GET    /api/v1/messages/conversations/:otherUserId        - Get conversation history
 * - POST   /api/v1/messages/chats/:userId/accept              - Accept chat from user (Sprint #13 Task 9.3g)
 * - POST   /api/v1/messages/chats/:userId/block               - Block user (Sprint #13 Task 9.3g)
 * 
 * Security:
 * - All routes require authentication (authMiddleware)
 * - senderId/userId extracted from JWT token (not from body)
 * - Body/params/query validated by Zod schemas
 * 
 * Middleware Chain:
 * 1. requestSanitization - Remove HTML tags, trim strings
 * 2. authMiddleware - Verify JWT token, extract userId
 * 3. validateRequest - Validate body/params/query with Zod
 * 4. controller - Execute business logic
 * 
 * Sprint #12 - Module 3: Messaging System
 * Sprint #13 - Task 9.3g: Chat Access Control (Backend)
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

// =============================================================================
// CONVERSATIONS ROUTES (Sprint #13 - Recent Conversations Inbox)
// =============================================================================

/**
 * @swagger
 * /api/v1/messages/conversations:
 *   get:
 *     summary: List recent conversations (inbox view)
 *     description: |
 *       Get paginated list of unique conversations ordered by last message timestamp.
 *       
 *       Sprint #13 - Recent Conversations Inbox Feature
 *       
 *       Business Logic:
 *       - Returns ÚNICO último mensaje de cada conversación (par de usuarios)
 *       - Ordenado por lastMessageAt DESC (más reciente primero)
 *       - Soporta filtrado por contactos (onlyContacts)
 *       - Soporta búsqueda por displayName (search)
 *       
 *       Query agregada con MongoDB aggregation pipeline:
 *       1. Match mensajes del usuario (sender OR recipient)
 *       2. Group by conversación única (otherUserId)
 *       3. Lookup User para displayName
 *       4. Compute isContact flag
 *       5. Apply filters y sort
 *       6. Paginate con $facet
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
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
 *         description: Conversations per page (max 50)
 *       - in: query
 *         name: onlyContacts
 *         schema:
 *           type: boolean
 *         description: |
 *           Filter conversations:
 *           - true: Only show contacts
 *           - false: Only show non-contacts
 *           - undefined (omit): Show all conversations
 *         example: true
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description: Search by other user's displayName (companyName or email)
 *         example: "John"
 *     responses:
 *       200:
 *         description: Success - Conversations retrieved
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
 *                   example: "Conversations retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           otherUserId:
 *                             type: string
 *                             example: "user_abc123"
 *                           displayName:
 *                             type: string
 *                             example: "Acme Corp"
 *                           lastMessageAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2026-01-16T14:30:00.000Z"
 *                           lastMessageContent:
 *                             type: string
 *                             example: "Do you have the machine specs?"
 *                           lastMessageSenderId:
 *                             type: string
 *                             example: "user_xyz789"
 *                           isContact:
 *                             type: boolean
 *                             example: true
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
 *       400:
 *         description: Invalid input (malformed page/limit)
 *       401:
 *         description: Unauthorized (missing/invalid JWT token)
 *       500:
 *         description: Internal server error
 */
router.get(
  '/conversations',
  requestSanitization,
  authMiddleware,
  validateRequest({ query: RecentConversationsQuerySchema }),
  controller.listConversations.bind(controller)
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

// =============================================================================
// 🔐 CHAT ACCESS CONTROL ROUTES (Sprint #13 Task 9.3g)
// =============================================================================

/**
 * @swagger
 * /api/v1/messages/chats/{userId}/accept:
 *   post:
 *     summary: Accept chat from user
 *     description: |
 *       Accept receiving messages from a non-contact user (whitelist).
 *       
 *       Sprint #13 Task 9.3g - Chat Access Control (Backend)
 *       
 *       Business Rules:
 *       - Authenticated user can accept chats from specific users without adding as contact
 *       - acceptedChatsFrom and usersBlackList are mutually exclusive
 *       - Cannot accept chat from yourself
 *       - Cannot accept chat from blocked user (unblock first)
 *       - Idempotent operation (OK if already accepted)
 *       
 *       Use Case: User B receives message from User A (non-contact), decides to accept chat
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description: ID of the user to accept chats from
 *         example: "user_abc123"
 *     requestBody:
 *       description: Empty body (userId extracted from JWT token and path params)
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Chat accepted successfully
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
 *                   example: "Chat accepted successfully"
 *       400:
 *         description: Invalid input (malformed userId, empty string)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid user ID format"
 *                 error:
 *                   type: string
 *                   example: "INVALID_INPUT"
 *       403:
 *         description: Forbidden (cannot accept chat from yourself, user is blocked, user inactive)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cannot accept chat from blocked user"
 *                 error:
 *                   type: string
 *                   example: "FORBIDDEN"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *                 error:
 *                   type: string
 *                   example: "NOT_FOUND"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "INTERNAL_ERROR"
 */
router.post(
  '/chats/:userId/accept',
  requestSanitization,
  authMiddleware,
  validateRequest({ params: ChatAccessControlParamsSchema }),
  controller.acceptChat.bind(controller)
);

/**
 * @swagger
 * /api/v1/messages/chats/{userId}/block:
 *   post:
 *     summary: Block user
 *     description: |
 *       Block a user preventing them from sending messages (blacklist).
 *       
 *       Sprint #13 Task 9.3g - Chat Access Control (Backend)
 *       
 *       Business Rules:
 *       - Blocked user cannot send messages (403 Forbidden)
 *       - Atomic operation: Adds to blacklist AND removes from whitelist
 *       - acceptedChatsFrom and usersBlackList are mutually exclusive
 *       - Cannot block yourself
 *       - Idempotent operation (OK if already blocked)
 *       
 *       Effect on Blocked User:
 *       - sendMessage() returns 403 Forbidden
 *       - getConversationHistory() returns 403 Forbidden (blocker)
 *       
 *       Effect on Blocking User:
 *       - getConversationHistory() returns canSendMessages: false
 *       
 *       Use Case: User A receives spam/unwanted messages from User B, decides to block
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description: ID of the user to block
 *         example: "user_xyz789"
 *     requestBody:
 *       description: Empty body (userId extracted from JWT token and path params)
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User blocked successfully
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
 *                   example: "User blocked successfully"
 *       400:
 *         description: Invalid input (malformed userId, empty string)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid user ID format"
 *                 error:
 *                   type: string
 *                   example: "INVALID_INPUT"
 *       403:
 *         description: Forbidden (cannot block yourself, user inactive)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cannot block yourself"
 *                 error:
 *                   type: string
 *                   example: "FORBIDDEN"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *                 error:
 *                   type: string
 *                   example: "NOT_FOUND"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "INTERNAL_ERROR"
 */
router.post(
  '/chats/:userId/block',
  requestSanitization,
  authMiddleware,
  validateRequest({ params: ChatAccessControlParamsSchema }),
  controller.blockUser.bind(controller)
);

export default router;
