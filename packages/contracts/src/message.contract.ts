import { z } from 'zod';
import type { IMessage } from '@packages/domain';
import { MESSAGE_CONTENT_MAX_LENGTH } from '@packages/domain';

// =============================================================================
// MESSAGE SCHEMAS (Sprint #12 Module 3 - Messaging System)
// =============================================================================

/**
 * Schema para enviar un mensaje (POST body)
 * Usado en: POST /api/v1/messages
 * 
 * senderId viene del JWT (no en body)
 * recipientId y content vienen en el body
 */
export const SendMessageRequestSchema = z.object({
  recipientId: z.string()
    .min(1, 'Recipient ID is required')
    .max(100, 'Recipient ID too long'),
  content: z.string()
    .min(1, 'Message content cannot be empty')
    .max(MESSAGE_CONTENT_MAX_LENGTH, `Message content cannot exceed ${MESSAGE_CONTENT_MAX_LENGTH} characters`)
    .trim()
});

/**
 * Schema para path params de conversación
 * Usado en: GET /api/v1/messages/conversations/:otherUserId
 */
export const ConversationParamsSchema = z.object({
  otherUserId: z.string()
    .min(1, 'Other user ID is required')
    .max(100, 'Other user ID too long')
});

/**
 * Schema para path params de aceptar chat
 * Usado en: POST /api/v1/messages/chats/:userId/accept
 * Sprint #13 Task 9.3e: Agrega userId a lista blanca (acceptedChatsFrom)
 */
export const AcceptChatParamsSchema = z.object({
  userId: z.string()
    .min(1, 'User ID is required')
    .max(100, 'User ID too long')
});

/**
 * Schema para path params de bloquear usuario
 * Usado en: POST /api/v1/messages/chats/:userId/block
 * Sprint #13 Task 9.3f: Agrega userId a lista negra (usersBlackList)
 */
export const BlockUserParamsSchema = z.object({
  userId: z.string()
    .min(1, 'User ID is required')
    .max(100, 'User ID too long')
});

/**
 * Schema para query params de historial de conversación
 * Usado en: GET /api/v1/messages/conversations/:otherUserId?page=1&limit=20
 * 
 * Query params arrival as strings from Express:
 * - page: Default 1, minimum 1 (first page)
 * - limit: Default 20, max 50 (prevent excessive data transfer)
 */
export const ConversationHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().min(1).max(50).default(20)
});

/**
 * Schema para un mensaje individual (DTO)
 * Matches IMessage from domain
 * Uses satisfies to ensure compile-time validation
 */
export const MessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  recipientId: z.string(),
  content: z.string(),
  sentAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
  
  // TODO: Features POST-MVP (descomentar cuando se implementen)
  // isRead: z.boolean().optional(),
  // readAt: z.coerce.date().optional(),
  // parentMessageId: z.string().optional(),
  // attachmentUrls: z.array(z.string()).optional(),
  // isEdited: z.boolean().optional(),
  // editedAt: z.coerce.date().optional()
}) satisfies z.ZodType<IMessage>;

/**
 * Schema para respuesta de envío de mensaje
 * Retorna el mensaje guardado para actualizar UI inmediatamente
 */
export const SendMessageResponseSchema = z.object({
  message: MessageSchema
});

/**
 * Schema para historial de conversación paginado (SSOT)
 * Representa SOLO los datos de la respuesta, sin el wrapper ApiResponse
 * Esto permite reutilizar la estructura en Use Cases y Controllers
 * 
 * PRINCIPIO DRY: Esta estructura se define UNA sola vez
 * PRINCIPIO SSOT: Cualquier cambio aquí se propaga automáticamente
 * 
 * Sprint #13 Task 9.3f-h: Agregado campos para Chat Access Control:
 * - canSendMessages: indica si puede enviar mensajes (contacto OR chat aceptado) AND !bloqueado
 * - hasAcceptedChat: indica si usuario ya aceptó chat del otro
 * - isBlockedByOther: indica si usuario está bloqueado por el otro (para mostrar banner en frontend)
 */
export const ConversationHistoryResponseSchema = z.object({
  recipientName: z.string().optional(), // Nombre para mostrar del destinatario
  messages: z.array(MessageSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  canSendMessages: z.boolean(), // Sprint #13: true si puede enviar, false si bloqueado o sin permisos
  hasAcceptedChat: z.boolean(), // Sprint #13: true si usuario ya aceptó chat del otro
  isBlockedByOther: z.boolean() // Sprint #13 UX: true si usuario está bloqueado (mostrar banner en frontend)
});

// =============================================================================
// TYPE EXPORTS (inferred from Zod schemas)
// =============================================================================

export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;
export type ConversationParams = z.infer<typeof ConversationParamsSchema>;
export type ConversationHistoryQuery = z.infer<typeof ConversationHistoryQuerySchema>;
export type MessageDTO = z.infer<typeof MessageSchema>;
export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>;
export type AcceptChatParams = z.infer<typeof AcceptChatParamsSchema>;
export type BlockUserParams = z.infer<typeof BlockUserParamsSchema>;

/**
 * Tipo para datos paginados de mensajes (SSOT)
 * Use Cases retornan este tipo directamente
 * Controllers lo envuelven en ApiResponse<ConversationHistoryResponse>
 */
export type ConversationHistoryResponse = z.infer<typeof ConversationHistoryResponseSchema>;

// =============================================================================
// RECENT CONVERSATIONS SCHEMAS (Sprint #13 - Conversations Inbox)
// =============================================================================

/**
 * Schema para query params de lista de conversaciones recientes
 * Usado en: GET /api/v1/messages/conversations?page=1&limit=20&onlyContacts=true&search=John
 * 
 * Sprint #13 - Recent Conversations Inbox Feature
 */
export const RecentConversationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().min(1).max(50).default(20),
  onlyContacts: z.coerce.boolean().optional(), // true = solo contactos, false = solo no-contactos, undefined = todos
  search: z.string().trim().min(1).max(100).optional() // Búsqueda por displayName (companyName o email)
});

/**
 * Schema para un resumen de conversación individual
 * Sprint #13 - Recent Conversations Inbox Feature
 */
export const ConversationSummarySchema = z.object({
  otherUserId: z.string(),
  displayName: z.string(),
  lastMessageAt: z.coerce.date(),
  lastMessageContent: z.string(),
  lastMessageSenderId: z.string(),
  isContact: z.boolean()
  // TODO POST-MVP: unreadCount: z.number().int().nonnegative()
});

/**
 * Schema para response de lista de conversaciones
 * Sprint #13 - Recent Conversations Inbox Feature
 */
export const RecentConversationsResponseSchema = z.object({
  conversations: z.array(ConversationSummarySchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative()
}) satisfies z.ZodType<any>; // Type inference compatible

// Type exports
export type RecentConversationsQuery = z.infer<typeof RecentConversationsQuerySchema>;
export type ConversationSummary = z.infer<typeof ConversationSummarySchema>;
export type RecentConversationsResponse = z.infer<typeof RecentConversationsResponseSchema>;

// export const ConversationsListResponseSchema = z.object({
//   conversations: z.array(ConversationSummarySchema),
//   total: z.number().int().nonnegative()
// });

/**
 * Schema para marcar mensajes como leídos
 * Usado en: PATCH /api/v1/messages/read
 * 
 * TODO: Implementar cuando se agregue feature de read receipts
 */
// export const MarkMessagesAsReadRequestSchema = z.object({
//   messageIds: z.array(z.string()).min(1).max(100)
// });

/**
 * Schema para buscar mensajes
 * Usado en: GET /api/v1/messages/search?q=term
 * 
 * TODO: Implementar cuando se necesite búsqueda de mensajes
 */
// export const SearchMessagesQuerySchema = z.object({
//   q: z.string().min(1).max(100),
//   page: z.coerce.number().int().positive().default(1),
//   limit: z.coerce.number().int().positive().min(1).max(50).default(20)
// });
