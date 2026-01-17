import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage, getConversationHistory, acceptChat, blockUser, getRecentConversations } from '@services/api/messageService';
import { QUERY_KEYS } from '@constants';
import type { SendMessageRequest, ConversationHistoryResponse, RecentConversationsQuery } from '@packages/contracts';

/**
 * Hook: Send Message Mutation
 * 
 * Handles sending text messages to contacts with optimistic updates.
 * 
 * Features:
 * - Mutation for POST /messages
 * - Auto-invalidates conversation history on success
 * - Error handling with toast feedback
 * - Optimistic UI updates (optional)
 * 
 * @example
 * ```tsx
 * const { mutate: send, isPending } = useSendMessage();
 * 
 * send({
 *   receiverId: 'user_123',
 *   content: 'Hello!'
 * });
 * ```
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SendMessageRequest) => sendMessage(request),
    
    onSuccess: (data, variables) => {
      // Invalidate conversation history to show new message
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MESSAGES(variables.recipientId)
      });
      
      // Invalidate conversations list (when implemented)
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CONVERSATIONS
      });
    },
    
    // TODO: Implementar optimistic updates para mejor UX
    // onMutate: async (newMessage) => {
    //   // Cancel outgoing queries to avoid race conditions
    //   await queryClient.cancelQueries({ queryKey: QUERY_KEYS.MESSAGES(newMessage.receiverId) });
    //   
    //   // Snapshot previous value
    //   const previousMessages = queryClient.getQueryData(QUERY_KEYS.MESSAGES(newMessage.receiverId));
    //   
    //   // Optimistically update cache with temporary ID
    //   queryClient.setQueryData(QUERY_KEYS.MESSAGES(newMessage.receiverId), (old) => ({
    //     ...old,
    //     messages: [...old.messages, { ...newMessage, id: 'temp_' + Date.now(), createdAt: new Date() }]
    //   }));
    //   
    //   return { previousMessages };
    // },
    // 
    // onError: (err, variables, context) => {
    //   // Rollback optimistic update on error
    //   if (context?.previousMessages) {
    //     queryClient.setQueryData(QUERY_KEYS.MESSAGES(variables.receiverId), context.previousMessages);
    //   }
    // },
  });
}

/**
 * Hook: Get Conversation History
 * 
 * Fetches paginated message history with another user.
 * Uses "Load More" button pattern (not infinite scroll for MVP).
 * 
 * Features:
 * - Query for GET /messages/conversations/:otherUserId
 * - Manual pagination with page parameter
 * - Auto-refetch on window focus (fresh messages)
 * - Balanced cache configuration
 * 
 * Data Flow:
 * 1. Backend returns messages DESC (newest first)
 * 2. messageService reverses to ASC (oldest first)
 * 3. UI displays chronologically (top = oldest, bottom = newest)
 * 
 * @param otherUserId - ID of the other user in conversation
 * @param page - Current page number (default: 1)
 * 
 * @example
 * ```tsx
 * const { data, isLoading, refetch } = useMessages('user_123', 1);
 * 
 * // data.messages = Message[] (ASC by createdAt)
 * // data.hasMore = boolean
 * // data.total = number
 * ```
 */
export function useMessages(otherUserId: string, page: number = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.MESSAGES(otherUserId, page),
    queryFn: () => getConversationHistory(otherUserId, { page }),
    enabled: !!otherUserId, // Only fetch if otherUserId is provided
    staleTime: 30_000, // 30 seconds - messages are relatively fresh
    gcTime: 5 * 60 * 1000, // 5 minutes - don't cache conversation too long
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: 'always', // Always refetch on component mount for fresh data
  });
}

/**
 * Hook: Get All Messages (with manual pagination via page state)
 * 
 * Alternative approach: Fetch all loaded pages at once.
 * Useful for "Load More" button that appends to existing messages.
 * 
 * @param otherUserId - ID of the other user in conversation
 * @param totalPages - Number of pages to load (managed by parent component)
 * 
 * @example
 * ```tsx
 * const [loadedPages, setLoadedPages] = useState(1);
 * const { data, isLoading } = useAllMessages('user_123', loadedPages);
 * 
 * const handleLoadMore = () => setLoadedPages(p => p + 1);
 * ```
 */
export function useAllMessages(otherUserId: string, totalPages: number) {
  return useQuery({
    queryKey: QUERY_KEYS.MESSAGES(otherUserId),
    queryFn: async () => {
      // Fetch all pages sequentially
      const allPages = await Promise.all(
        Array.from({ length: totalPages }, (_, i) => 
          getConversationHistory(otherUserId, { page: i + 1 })
        )
      );
      
      // Merge all messages (already sorted ASC by messageService)
      const allMessages = allPages.flatMap((page: ConversationHistoryResponse) => page.messages);
      
      return {
        messages: allMessages,
        total: allPages[0]?.total ?? 0,
        hasMore: allPages[allPages.length - 1] ? allPages[allPages.length - 1].page < allPages[allPages.length - 1].totalPages : false,
      };
    },
    enabled: !!otherUserId && totalPages > 0,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });
}

/**
 * Hook: Accept Chat Request Mutation
 * Sprint #13 Task 9.3e - Chat Access Control
 * 
 * Handles accepting chat requests from non-contact users.
 * Adds user to acceptedChatsFrom whitelist, enabling bidirectional messaging.
 * 
 * Features:
 * - Mutation for POST /messages/chats/:userId/accept
 * - Auto-invalidates conversation history to update canSendMessages
 * - Idempotent operation (safe to call multiple times)
 * - Success feedback via parent component (toast/modal)
 * 
 * Post-conditions:
 * - canSendMessages becomes true
 * - ChatInput becomes enabled
 * - User can send/receive messages freely
 * 
 * @example
 * ```tsx
 * const { mutate: accept, isPending } = useAcceptChat();
 * 
 * accept('user_123', {
 *   onSuccess: () => toast.success('Chat aceptado'),
 *   onError: (err) => toast.error(err.message)
 * });
 * ```
 */
export function useAcceptChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => acceptChat(userId),
    
    onSuccess: (_, userId) => {
      // Invalidate conversation history to refetch with updated canSendMessages
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MESSAGES(userId)
      });
      
      // Invalidate conversations list to update access status (when implemented)
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CONVERSATIONS
      });
    },
  });
}

/**
 * Hook: Block User Mutation
 * Sprint #13 Task 9.3f - Chat Access Control
 * 
 * Handles blocking users from sending messages.
 * Adds user to usersBlackList and removes from acceptedChatsFrom.
 * 
 * Features:
 * - Mutation for POST /messages/chats/:userId/block
 * - Auto-invalidates conversation history to update canSendMessages
 * - Atomic operation (blacklist + whitelist removal)
 * - Silent block (no notification to blocked user)
 * 
 * Post-conditions:
 * - canSendMessages becomes false for blocked user
 * - Blocked user gets 403 when attempting to send
 * - Conversation history remains visible
 * - Parent component should navigate away (e.g., to /messages)
 * 
 * Notes:
 * - Parent component should show confirmation modal before calling
 * - Parent component handles navigation after block
 * - Unblock feature deferred to Sprint #14
 * 
 * @example
 * ```tsx
 * const { mutate: block, isPending } = useBlockUser();
 * 
 * // With confirmation modal
 * modal.confirm({
 *   title: 'Bloquear Usuario',
 *   description: '¿Estás seguro?',
 *   onConfirm: () => {
 *     block('user_123', {
 *       onSuccess: () => {
 *         toast.success('Usuario bloqueado');
 *         navigate('/messages');
 *       }
 *     });
 *   }
 * });
 * ```
 */
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => blockUser(userId),
    
    onSuccess: (_, userId) => {
      // Invalidate conversation history to refetch with updated canSendMessages
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MESSAGES(userId)
      });
      
      // Invalidate conversations list (when implemented)
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CONVERSATIONS
      });
    },
  });
}

/**
 * Hook: Get Recent Conversations List
 * 
 * Sprint #13 - Recent Conversations Inbox Feature
 * 
 * Fetches paginated list of all user's conversations with last message preview.
 * Supports filtering by contact status and searching by display name.
 * 
 * Features:
 * - Query for GET /api/v1/messages/conversations
 * - Backend handles all filtering, sorting, and pagination
 * - Auto-refetch on window focus for fresh data
 * - Real-time updates via SSE invalidation (NEW_MESSAGE event)
 * - Conversations ordered by lastMessageAt DESC (most recent first)
 * 
 * Query Parameters:
 * @param query.page - Page number (default: 1)
 * @param query.limit - Items per page (default: 20, max: 50)
 * @param query.onlyContacts - Filter by contact status (true/false/undefined)
 * @param query.search - Search by displayName (optional)
 * 
 * Cache Configuration:
 * - staleTime: 30s (conversations don't change frequently)
 * - gcTime: 5min (keep in cache for quick back navigation)
 * - refetchOnWindowFocus: true (ensure fresh data when user returns)
 * 
 * SSE Integration:
 * - useNotificationObserver invalidates CONVERSATIONS on NEW_MESSAGE
 * - This keeps the list updated in real-time
 * 
 * @example
 * ```tsx
 * // Get all conversations
 * const { data, isLoading } = useRecentConversations({ page: 1, limit: 20 });
 * 
 * // Filter only contacts
 * const { data } = useRecentConversations({ page: 1, onlyContacts: true });
 * 
 * // Search conversations
 * const { data } = useRecentConversations({ search: 'acme', page: 1 });
 * ```
 */
export function useRecentConversations(query: RecentConversationsQuery) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CONVERSATIONS, query],
    queryFn: () => getRecentConversations(query),
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });
}

// Strategic future hooks (commented for reference)

/**
 * Hook: Infinite Scroll Messages (Future Feature)
 * 
 * Uses TanStack Query's useInfiniteQuery for automatic infinite scroll.
 * Better UX than "Load More" button, but more complex state management.
 * 
 * Features:
 * - Auto-load on scroll to top
 * - Maintains scroll position when prepending messages
 * - Efficient pagination with cursor-based API
 * 
 * @future Sprint #13 - Infinite Scroll
 */
// export function useInfiniteMessages(otherUserId: string) {
//   return useInfiniteQuery({
//     queryKey: QUERY_KEYS.MESSAGES(otherUserId),
//     queryFn: ({ pageParam = 1 }) => getConversationHistory(otherUserId, { page: pageParam }),
//     getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
//     enabled: !!otherUserId,
//     staleTime: 30_000,
//     gcTime: 5 * 60 * 1000,
//   });
// }

/**
 * Hook: Get Conversations List (Future Feature)
 * 
 * Fetches list of all conversations with metadata.
 * Shows last message preview, unread count, last activity.
 * 
 * Features:
 * - Query for GET /messages/conversations
 * - Paginated response (20 conversations per page)
 * - Real-time updates via SSE invalidation
 * - Sort by most recent activity
 * 
 * @future Sprint #13 - Conversation Metadata
 */
// export function useConversations(page: number = 1) {
//   return useQuery({
//     queryKey: [...QUERY_KEYS.CONVERSATIONS, { page }],
//     queryFn: () => getConversations({ page }),
//     staleTime: 60_000, // 1 minute
//     gcTime: 10 * 60 * 1000, // 10 minutes
//     refetchOnWindowFocus: true,
//     refetchOnMount: 'always',
//   });
// }

/**
 * Hook: Mark Conversation as Read (Future Feature)
 * 
 * Mutation to mark all messages in conversation as read.
 * Updates lastReadAt timestamp and clears unread badge.
 * 
 * @future Sprint #13 - Read Receipts
 */
// export function useMarkConversationAsRead() {
//   const queryClient = useQueryClient();
//   
//   return useMutation({
//     mutationFn: (otherUserId: string) => markConversationAsRead(otherUserId),
//     onSuccess: (_, otherUserId) => {
//       // Invalidate conversation metadata to update unread count
//       queryClient.invalidateQueries({
//         queryKey: QUERY_KEYS.CONVERSATIONS
//       });
//     },
//   });
// }

/**
 * Hook: Search Messages (Future Feature)
 * 
 * Full-text search within conversation history.
 * Returns matching messages with surrounding context.
 * 
 * @future Sprint #15 - Search & Navigation
 */
// export function useSearchMessages(otherUserId: string, query: string) {
//   return useQuery({
//     queryKey: QUERY_KEYS.MESSAGE_SEARCH?.(otherUserId, query),
//     queryFn: () => searchMessages(otherUserId, query),
//     enabled: !!otherUserId && !!query && query.length >= 3, // Min 3 chars
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });
// }
