import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@store/AuthProvider';
import { useMessagingStore } from '@store';
import { useSendMessage, useMessages } from '@hooks/useMessages';
import { useIsContact } from '@hooks/useContacts';
import { toast } from '@hooks/useToast';
import type { UserPublicProfile } from '@packages/contracts';

/**
 * ViewModel: ChatScreen Business Logic
 * 
 * Responsibilities (MVVM-lite):
 * - Fetch conversation history with pagination
 * - Send new messages
 * - Clear unread counter on mount
 * - Auto-scroll to bottom on new messages
 * - Handle "Load More" pagination
 * - Validate contact relationship
 * - Provide i18n access for View
 * 
 * MVP Scope:
 * - ✅ Display messages chronologically (oldest → newest)
 * - ✅ Send text messages (max 1000 chars)
 * - ✅ "Load More" button for pagination
 * - ✅ Clear unread on conversation open
 * - ❌ NO infinite scroll (use button for MVP)
 * - ❌ NO read receipts
 * - ❌ NO typing indicators
 * 
 * Architecture:
 * - View (ChatScreen.tsx) calls this hook
 * - ViewModel returns { state, data, actions, t }
 * - View renders messages + input
 * 
 * Data Flow:
 * 1. Backend returns messages DESC (newest first)
 * 2. messageService reverses to ASC (oldest first)
 * 3. UI displays ASC with auto-scroll to bottom
 * 4. "Load More" prepends older messages to top
 * 
 * @example
 * ```tsx
 * function ChatScreen() {
 *   const vm = useChatViewModel();
 *   
 *   if (vm.state.isLoadingInitial) return <Loading />;
 *   if (vm.state.isNotContact) return <NotContactWarning />;
 *   
 *   return (
 *     <>
 *       <ChatHeader otherUser={vm.data.otherUser} />
 *       {vm.data.hasMore && (
 *         <Button onClick={vm.actions.handleLoadMore} loading={vm.state.isLoadingMore}>
 *           {vm.t('messages.loadMore')}
 *         </Button>
 *       )}
 *       <MessagesList messages={vm.data.messages} currentUserId={vm.data.currentUserId} />
 *       <ChatInput onSend={vm.actions.handleSendMessage} isLoading={vm.state.isSending} />
 *     </>
 *   );
 * }
 * ```
 */
export function useChatViewModel() {
  const { t } = useTranslation();
  const { otherUserId } = useParams<{ otherUserId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearUnread } = useMessagingStore();

  // ========================
  // STATE MANAGEMENT
  // ========================
  
  // Current page (for "Load More" pagination)
  const [currentPage, setCurrentPage] = useState(1);
  
  // Scroll container ref (for auto-scroll)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Track if user manually scrolled up (disable auto-scroll)
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // ========================
  // VALIDATION
  // ========================
  
  // Validate otherUserId exists
  if (!otherUserId) {
    console.error('[useChatViewModel] Missing otherUserId in route params');
    navigate('/messages'); // Redirect to conversations list
  }
  
  // Validate current user is authenticated
  if (!user) {
    console.error('[useChatViewModel] User not authenticated');
    navigate('/auth/login');
  }

  // ========================
  // DATA FETCHING
  // ========================
  
  // Check if other user is a contact (required for messaging)
  const isContact = useIsContact(otherUserId!);
  const isCheckingContact = false; // useIsContact returns boolean directly
  
  // Fetch conversation history (current page)
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    isError,
    error,
    refetch,
  } = useMessages(otherUserId!, currentPage);
  
  // Send message mutation
  const { mutate: sendMessageMutation, isPending: isSending } = useSendMessage();

  // ========================
  // DERIVED DATA
  // ========================
  
  // Combine all loaded pages into single messages array
  // For MVP: Single page load, no combination needed
  // (If using multiple pages, would need to fetch all pages and merge)
  const messages = messagesData?.messages || [];
  const hasMore = messagesData ? messagesData.page < messagesData.totalPages : false;
  const total = messagesData?.total || 0;
  
  const currentUserId = user?.id || '';
  
  const isEmpty = messages.length === 0;
  const isLoadingInitial = currentPage === 1 && isLoadingMessages;
  const isLoadingMore = currentPage > 1 && isLoadingMessages;

  // ========================
  // EFFECTS
  // ========================
  
  // Clear unread counter on mount (user opened conversation)
  useEffect(() => {
    if (otherUserId) {
      clearUnread(otherUserId);
    }
  }, [otherUserId, clearUnread]);
  
  // Auto-scroll to bottom on new messages (if user not scrolling)
  useEffect(() => {
    if (!isUserScrolling && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isUserScrolling]);
  
  // Reset scroll tracking when switching conversations
  useEffect(() => {
    setIsUserScrolling(false);
    setCurrentPage(1);
  }, [otherUserId]);
  
  // Detect user scroll (disable auto-scroll if scrolling up)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const isAtBottom = 
        container.scrollHeight - container.scrollTop <= container.clientHeight + 100; // 100px threshold
      
      setIsUserScrolling(!isAtBottom);
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // ========================
  // ACTIONS
  // ========================
  
  const handleSendMessage = (text: string) => {
    if (!otherUserId || !text.trim()) {
      return;
    }
    
    sendMessageMutation(
      {
        recipientId: otherUserId,
        content: text.trim(),
      },
      {
        onSuccess: () => {
          // Auto-scroll to bottom after sending
          setIsUserScrolling(false);
          
          // Optional: Show success toast
          // toast.success({ title: t('messages.sent') });
        },
        onError: (error: any) => {
          // Show error toast
          const errorMessage = error?.response?.data?.message || t('messages.sendError');
          toast.error({
            title: t('errors.sendMessageFailed'),
            description: errorMessage,
          });
        },
      }
    );
  };
  
  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      setCurrentPage((prev) => prev + 1);
      
      // Keep scroll position when loading older messages
      const container = messagesContainerRef.current;
      if (container) {
        const scrollHeightBefore = container.scrollHeight;
        
        // After new messages load, restore scroll position
        setTimeout(() => {
          const scrollHeightAfter = container.scrollHeight;
          const scrollDiff = scrollHeightAfter - scrollHeightBefore;
          container.scrollTop += scrollDiff;
        }, 100);
      }
    }
  };
  
  const handleRetry = () => {
    refetch();
  };
  
  const handleBackToConversations = () => {
    navigate('/messages');
  };

  // ========================
  // RETURN VIEWMODEL
  // ========================
  
  return {
    // State flags
    state: {
      isLoadingInitial,
      isLoadingMore,
      isSending,
      isError,
      error: error as Error | null,
      isEmpty,
      isNotContact: !isCheckingContact && !isContact, // Show warning if not contact
      isCheckingContact,
    },
    
    // Data for rendering
    data: {
      messages,
      hasMore,
      total,
      currentUserId,
      otherUserId: otherUserId!,
      currentPage,
      // otherUser: UserPublicProfile | undefined (fetch from contacts list if needed)
    },
    
    // Refs for View
    refs: {
      messagesEndRef,
      messagesContainerRef,
    },
    
    // Actions
    actions: {
      handleSendMessage,
      handleLoadMore,
      handleRetry,
      handleBackToConversations,
    },
    
    // i18n helper
    t,
  };
}

// Strategic future enhancements (commented for reference)

/**
 * Infinite Scroll (Future Feature)
 * 
 * Replace "Load More" button with automatic loading on scroll to top.
 * 
 * Implementation:
 * - Use useInfiniteMessages hook with useInfiniteQuery
 * - Detect scroll to top with IntersectionObserver
 * - Auto-fetch next page when trigger element visible
 * - Maintain scroll position with react-window or manual calculation
 * 
 * Benefits:
 * - Smoother UX (no button clicks)
 * - Natural chat app behavior
 * 
 * @future Sprint #13 - Infinite Scroll
 */
// const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteMessages(otherUserId);

/**
 * Typing Indicator (Future Feature)
 * 
 * Show "User is typing..." when other user composes message.
 * 
 * Implementation:
 * - Emit typing event via WebSocket when user types
 * - Listen for typing events from other user
 * - Show indicator with 3-second timeout
 * - Debounce typing emission (500ms)
 * 
 * @future Sprint #13 - Typing Indicators
 */
// const { isTyping } = useTypingIndicator(otherUserId);

/**
 * Message Reactions (Future Feature)
 * 
 * Allow users to react to messages with emojis.
 * 
 * Implementation:
 * - Add reaction button on message hover
 * - POST /messages/:messageId/reactions
 * - Update message.reactions array
 * - Real-time via SSE
 * 
 * @future Sprint #14 - Message Reactions
 */
// const { mutate: addReaction } = useAddMessageReaction();

/**
 * Voice Messages (Future Feature)
 * 
 * Record and send audio messages.
 * 
 * Implementation:
 * - Use MediaRecorder API for recording
 * - Upload audio to cloud storage (S3)
 * - Store URL in message.attachments
 * - Render audio player in MessageBubble
 * 
 * @future Sprint #15 - Voice Messages
 */
// const { startRecording, stopRecording, audioBlob } = useVoiceRecorder();

/**
 * Search Messages (Future Feature)
 * 
 * Full-text search within conversation.
 * 
 * Implementation:
 * - Add search input in chat header
 * - Call useSearchMessages hook
 * - Highlight matching messages
 * - Navigate to message with scroll
 * 
 * @future Sprint #15 - Message Search
 */
// const { data: searchResults } = useSearchMessages(otherUserId, searchQuery);
