import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { sendMessage, getConversationHistory } from '@services/api/messageService';
import { QUERY_KEYS } from '@constants';
import type { SendMessageRequest, ConversationHistoryResponse } from '@packages/contracts';

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
