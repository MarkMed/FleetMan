import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@store/AuthProvider';
import { useMessagingStore } from '@store';
import { useSendMessage, useMessages, useAcceptChat, useBlockUser } from '@hooks/useMessages';
import { useIsContact, useAddContact } from '@hooks/useContacts';
import { toast } from '@hooks/useToast';
import { modal } from '@helpers/modal';
import { QUERY_KEYS } from '@constants';

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
  const queryClient = useQueryClient();
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
  
  // Sprint #13: Chat options modal state (must be declared before useEffects that use it)
  const [isChatOptionsModalOpen, setIsChatOptionsModalOpen] = useState(false);
  
  // Sprint #13: Flag to prevent modal re-opening after user makes a decision
  // Tracks if user has already accepted, added as contact, or blocked in this session
  const [hasUserTakenDecision, setHasUserTakenDecision] = useState(false);

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
  
  // Sprint #13 Task 9.3e-f: Chat Access Control mutations
  const { mutate: acceptChatMutation, isPending: isAcceptingChat } = useAcceptChat();
  const { mutate: blockUserMutation, isPending: isBlockingUser } = useBlockUser();
  
  // Sprint #13: Add Contact mutation (for "Guardar Contacto" option)
  const { mutate: addContactMutation, isPending: isAddingContact } = useAddContact();

  // ========================
  // DERIVED DATA
  // ========================
  
  // Combine all loaded pages into single messages array
  // For MVP: Single page load, no combination needed
  // (If using multiple pages, would need to fetch all pages and merge)
  const messages = messagesData?.messages || [];
  const hasMore = messagesData ? messagesData.page < messagesData.totalPages : false;
  const total = messagesData?.total || 0;
  
  // Sprint #13 Task 9.3h: Check if user can send messages (not blocked)
  const canSendMessages = messagesData?.canSendMessages ?? true; // Default true if loading
  
  // Sprint #13 Task 9.3h: Check if user has already accepted chat from other user (backend field)
  const hasAcceptedChat = messagesData?.hasAcceptedChat ?? false;
  
  // Sprint #13 Task 9.3h: Detect if this is first conversation (no messages)
  const isFirstConversation = total === 0;
  
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
    setHasUserTakenDecision(false); // Reset decision flag for new conversation
  }, [otherUserId]);
  
  // Sprint #13 Task 9.3h: Auto-open chat options modal on first conversation from non-contact
  // Only opens once per conversation (tracked by hasAcceptedChat from backend + hasUserTakenDecision flag)
  useEffect(() => {
    // Detect first conversation: user is not contact AND there are messages AND has NEVER accepted
    // CRITICAL: Use hasAcceptedChat from backend instead of canSendMessages
    // This prevents re-opening modal after user accepts (backend persists acceptance)
    const isFirstConversationFromNonContact = 
      !isCheckingContact && 
      !isContact && 
      messages.length > 0 && 
      !hasAcceptedChat && // Backend: User has NEVER accepted this chat
      !hasUserTakenDecision && // Frontend: User hasn't taken decision in THIS session
      !isLoadingInitial;
    
    if (isFirstConversationFromNonContact && !isChatOptionsModalOpen) {
      // Auto-open modal to let user decide: Accept, Add Contact, or Block
      handleOpenChatOptions();
    }
  }, [isContact, isCheckingContact, messages.length, hasAcceptedChat, hasUserTakenDecision, isLoadingInitial, isChatOptionsModalOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  
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
          // Handle specific error cases
          // Error is thrown directly from apiClient as Error object
          const errorMessage = error?.message || error?.toString() || '';
          
          let displayMessage: string;
          let doesContainBlocked = errorMessage.toLowerCase().includes('blocked');
          
          // Check if user is blocked by checking if error message contains "blocked"
          if (doesContainBlocked) {
            displayMessage = t('messages.cannotSendBlocked');
            
            // Invalidate messages query to refetch conversation with updated canSendMessages
            // Backend will return canSendMessages: false and isBlockedByOther: true
            // This immediately disables the chat input without waiting for periodic refresh
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.MESSAGES(otherUserId)
            });
          } else {
            // Generic error fallback
            displayMessage = errorMessage || t('messages.sendError');
          }
          
          toast.error({
            title: t('errors.sendMessageFailed'),
            description: displayMessage,
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
  // SPRINT #13 ACTIONS: Chat Access Control
  // ========================
  
  /**
   * Accept chat request from non-contact user
   * Enables bidirectional messaging without adding as contact
   */
  const handleAcceptChat = () => {
    if (!otherUserId) return;
    
    acceptChatMutation(otherUserId, {
      onSuccess: () => {
        // Mark that user has taken a decision (prevent modal re-opening)
        setHasUserTakenDecision(true);
        
        // Close modal AFTER successful mutation (prevents race condition)
        setIsChatOptionsModalOpen(false);
        
        toast.success({
          title: t('messages.chatAccepted'),
          description: t('messages.chatAcceptedDesc'),
        });
        
        // Scroll to input to encourage reply
        setIsUserScrolling(false);
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || t('errors.unknownError');
        toast.error({
          title: t('errors.acceptChatFailed'),
          description: errorMessage,
        });
      },
    });
  };
  
  /**
   * Block user from sending messages
   * Shows confirmation modal before blocking
   */
  const handleBlockUser = () => {
    if (!otherUserId) return;
    
    // Mark that user has taken a decision (prevent modal re-opening)
    // MUST be done BEFORE closing modal to prevent useEffect from re-opening it
    setHasUserTakenDecision(true);
    
    // Close chat options modal immediately (will open confirmation modal)
    setIsChatOptionsModalOpen(false);
    
    modal.show({
      title: t('messages.blockUser'),
      description: t('messages.blockUserConfirmation'),
      variant: 'danger',
      showCancel: true,
      confirmButtonVariant: 'ghost',
      confirmButtonClassName: 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white',
      cancelButtonVariant: 'outline',
      cancelButtonClassName: 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
      onConfirm: () => {
        blockUserMutation(otherUserId, {
          onSuccess: () => {
            toast.success({
              title: t('messages.userBlocked'),
              description: t('messages.userBlockedDesc'),
            });
            
            // Close confirmation modal before navigating
            modal.hide();
            
            // Navigate away from conversation after blocking
            navigate('/messages');
          },
          onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || t('errors.unknownError');
            toast.error({
              title: t('errors.blockUserFailed'),
              description: errorMessage,
            });
          },
        });
      },
    });
  };
  
  /**
   * Add user as contact (from chat options)
   * Separate from accepting chat - adds to contacts list
   */
  const handleAddContact = () => {
    if (!otherUserId) return;
    
    addContactMutation({ userId: otherUserId, companyName: t('messages.otherUser') }, {
      onSuccess: () => {
        // Mark that user has taken a decision (prevent modal re-opening)
        setHasUserTakenDecision(true);
        
        // Close modal AFTER successful mutation (prevents race condition)
        setIsChatOptionsModalOpen(false);
        
        // Invalidate messages query to refetch with updated canSendMessages
        // After adding as contact, backend will return canSendMessages: true
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.MESSAGES(otherUserId)
        });
        
        // TODO: Consider invalidating contact status query when implemented
        // queryClient.invalidateQueries({
        //   queryKey: QUERY_KEYS.CONTACT(otherUserId)
        // });
        
        // NOTE: Toast is already shown by useAddContact hook
        // No need for duplicate toast here
      },
      onError: (error: any) => {
        // NOTE: Error toast is already shown by useAddContact hook
        // Keep this for additional error handling if needed
        const errorMessage = error?.response?.data?.message || t('errors.unknownError');
        toast.error({
          title: t('errors.addContactFailed'),
          description: errorMessage,
        });
      },
    });
  };
  
  /**
   * Open chat options modal
   * Modal state managed in STATE MANAGEMENT section (line 88)
   */
  const handleOpenChatOptions = () => {
    setIsChatOptionsModalOpen(true);
  };
  
  const handleCloseChatOptions = () => {
    setIsChatOptionsModalOpen(false);
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
      // Sprint #13: Chat Access Control states
      canSendMessages,
      isFirstConversation,
      isAcceptingChat,
      isBlockingUser,
      isAddingContact,
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
      // Sprint #13: Chat Access Control actions
      handleAcceptChat,
      handleBlockUser,
      handleAddContact,
      handleOpenChatOptions,
      handleCloseChatOptions,
    },
    
    // Sprint #13: Chat options modal state
    modals: {
      chatOptions: {
        isOpen: isChatOptionsModalOpen,
        onOpenChange: setIsChatOptionsModalOpen,
      },
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
