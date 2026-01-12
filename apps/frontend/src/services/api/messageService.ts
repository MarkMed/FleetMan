import { apiClient, handleBackendApiResponse } from './apiClient';
import { API_ENDPOINTS } from '../../constants';
import type { SendMessageRequest, SendMessageResponse, ConversationHistoryResponse } from '@packages/contracts';

/**
 * Messaging Service
 * 
 * Handles API calls for 1-to-1 direct messaging between users.
 * Part of Sprint #12 - Module 3: User Communication System (Messaging).
 * 
 * Purpose:
 * - Send text messages to contacts
 * - Retrieve conversation history with pagination
 * - Real-time message reception via SSE (handled in useNotificationObserver)
 * 
 * Architecture:
 * - Consumes /api/v1/messages endpoints
 * - Uses Zod-validated contracts from @packages/contracts
 * - Integrates with TanStack Query via useMessages hooks
 * - SSE delivers NEW_MESSAGE events for real-time updates
 * 
 * MVP Scope:
 * - ✅ Send text messages (max 1000 chars)
 * - ✅ Get paginated conversation history (max 50 messages/page)
 * - ❌ NO read/unread tracking (client-side counter only)
 * - ❌ NO edit/delete messages
 * - ❌ NO multimedia (text only)
 * - ❌ NO typing indicators
 * 
 * @example
 * ```tsx
 * // Send message
 * await messageService.sendMessage({
 *   receiverId: 'user_abc123',
 *   content: 'Hello, how can I help?'
 * });
 * 
 * // Get conversation history
 * const { messages, hasMore, total } = await messageService.getConversationHistory('user_abc123', { page: 1 });
 * ```
 */

/**
 * Send a text message to a contact
 * 
 * @param request - Message data (receiverId, content)
 * @returns Promise<SendMessageResponse> - Created message with metadata
 * 
 * Backend validation:
 * - receiverId must be in sender's contact list (isContact check)
 * - content max 1000 characters
 * - Both users must be active
 * 
 * Post-conditions:
 * - Message stored in MongoDB
 * - SSE notification sent to receiver (type: 'NEW_MESSAGE')
 * - Real-time delivery via EventSource
 * 
 * @throws {Error} If receiver not found, not a contact, or validation fails
 */
export async function sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
  const response = await apiClient.post<{ success: boolean; message: string; data: SendMessageResponse }>(
    API_ENDPOINTS.MESSAGES,
    request
  );
  
  return handleBackendApiResponse(response);
}

/**
 * Get paginated conversation history with another user
 * 
 * @param otherUserId - ID of the other user in the conversation
 * @param options - Pagination options (page number, default: 1)
 * @returns Promise<GetConversationHistoryResponse> - Messages + pagination metadata
 * 
 * Response structure:
 * - messages: Message[] (sorted ASC by createdAt after reversing backend DESC)
 * - total: number (total messages in conversation)
 * - page: number (current page)
 * - totalPages: number (total available pages)
 * - hasMore: boolean (whether more pages exist)
 * 
 * Backend behavior:
 * - Returns messages DESC (newest first) for efficient pagination
 * - Frontend MUST reverse to ASC (oldest first) for chat UI
 * - Max 50 messages per page
 * - Only returns messages between authenticated user and otherUserId
 * 
 * Notes:
 * - No backend read/unread tracking in MVP
 * - Client-side unread counter managed by Zustand
 * - Messages ordered chronologically for chat display
 */
export async function getConversationHistory(
  otherUserId: string,
  options?: { page?: number }
): Promise<ConversationHistoryResponse> {
  const page = options?.page ?? 1;
  
  const response = await apiClient.get<{ success: boolean; message: string; data: ConversationHistoryResponse }>(
    `${API_ENDPOINTS.CONVERSATION_HISTORY(otherUserId)}?page=${page}`
  );
  
  const data = handleBackendApiResponse(response);
  
  // CRITICAL: Backend returns messages DESC (newest first)
  // Reverse to ASC (oldest first) for chat UI display
  return {
    ...data,
    messages: data.messages.reverse()
  };
}

// Strategic future features (commented for reference)

/**
 * Mark all messages in a conversation as read (Future Feature)
 * 
 * Purpose:
 * - Update lastReadAt timestamp for conversation
 * - Clear unread count badge
 * - Sync read status across devices
 * 
 * Implementation:
 * - POST /messages/conversations/:otherUserId/mark-as-read
 * - Updates conversation document with lastReadAt
 * - Emits READ_RECEIPT event via SSE
 * 
 * @future Sprint #13 - Read Receipts
 */
// export async function markConversationAsRead(otherUserId: string): Promise<void> {
//   await apiClient.post<{ success: boolean; message: string }>(
//     API_ENDPOINTS.MARK_CONVERSATION_READ(otherUserId)
//   );
// }

/**
 * Get list of active conversations with metadata (Future Feature)
 * 
 * Purpose:
 * - Display conversations list with last message preview
 * - Show unread count per conversation
 * - Sort by most recent activity
 * 
 * Implementation:
 * - GET /messages/conversations
 * - Returns aggregated data: lastMessage, unreadCount, lastActivity
 * - Paginated response (20 conversations per page)
 * 
 * Response:
 * - conversations: ConversationPreview[]
 * - total: number
 * - page: number
 * 
 * @future Sprint #13 - Conversation Metadata
 */
// export async function getConversations(options?: { page?: number }): Promise<GetConversationsResponse> {
//   const page = options?.page ?? 1;
//   
//   const response = await apiClient.get<{ success: boolean; message: string; data: GetConversationsResponse }>(
//     API_ENDPOINTS.CONVERSATIONS,
//     { params: { page } }
//   );
//   
//   return handleBackendApiResponse(response);
// }

/**
 * Delete a message (soft delete) (Future Feature)
 * 
 * Purpose:
 * - Allow users to delete sent messages
 * - Soft delete (mark as deleted, don't remove from DB)
 * - Show "Message deleted" placeholder in UI
 * 
 * Implementation:
 * - DELETE /messages/:messageId
 * - Sets message.deletedAt = Date.now()
 * - Emits MESSAGE_DELETED event via SSE
 * 
 * Rules:
 * - Only sender can delete their own messages
 * - Cannot delete after 24 hours (configurable)
 * - Deleted messages still count towards conversation total
 * 
 * @future Sprint #14 - Message Management
 */
// export async function deleteMessage(messageId: string): Promise<void> {
//   await apiClient.delete<{ success: boolean; message: string }>(
//     API_ENDPOINTS.MESSAGE(messageId)
//   );
// }

/**
 * Edit a message (Future Feature)
 * 
 * Purpose:
 * - Allow users to edit sent messages
 * - Track edit history
 * - Show "(edited)" indicator in UI
 * 
 * Implementation:
 * - PATCH /messages/:messageId
 * - Updates message.content
 * - Adds to message.editHistory array
 * - Emits MESSAGE_EDITED event via SSE
 * 
 * Rules:
 * - Only sender can edit their own messages
 * - Cannot edit after 15 minutes (configurable)
 * - Max 5 edits per message
 * 
 * @future Sprint #14 - Message Management
 */
// export async function editMessage(messageId: string, newContent: string): Promise<EditMessageResponse> {
//   const response = await apiClient.patch<{ success: boolean; message: string; data: EditMessageResponse }>(
//     API_ENDPOINTS.MESSAGE(messageId),
//     { content: newContent }
//   );
//   
//   return handleBackendApiResponse(response);
// }

/**
 * Search messages in conversation (Future Feature)
 * 
 * Purpose:
 * - Full-text search within conversation history
 * - Find specific messages by content
 * - Navigate to message in timeline
 * 
 * Implementation:
 * - GET /messages/conversations/:otherUserId/search?q=query
 * - Uses MongoDB text index on content field
 * - Returns matches with surrounding context
 * 
 * @future Sprint #15 - Search & Navigation
 */
// export async function searchMessages(otherUserId: string, query: string): Promise<SearchMessagesResponse> {
//   const response = await apiClient.get<{ success: boolean; message: string; data: SearchMessagesResponse }>(
//     API_ENDPOINTS.SEARCH_CONVERSATION(otherUserId),
//     { params: { q: query } }
//   );
//   
//   return handleBackendApiResponse(response);
// }
