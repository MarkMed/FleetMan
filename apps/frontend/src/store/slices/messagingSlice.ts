import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Messaging State Interface
 * 
 * Manages client-side messaging state:
 * - Unread message counters per conversation
 * - Total unread messages badge count
 * - Last seen message timestamps
 * 
 * MVP Scope:
 * - ✅ Simple unread counter (client-side only)
 * - ❌ NO backend read/unread tracking
 * - ❌ NO read receipts
 * - ❌ NO typing indicators
 * 
 * State managed:
 * - unreadCounts: Map<userId, number> - Unread count per conversation
 * - totalUnread: number - Total unread messages across all conversations
 */
interface MessagingState {
  /**
   * Unread message count per conversation
   * Key: otherUserId, Value: unread count
   */
  unreadCounts: Record<string, number>;
  
  /**
   * Total unread messages across all conversations
   * Used for badge display in navigation
   */
  totalUnread: number;
  
  /**
   * Increment unread count for a specific conversation
   * Called when NEW_MESSAGE SSE event arrives
   * 
   * @param otherUserId - ID of the sender
   */
  incrementUnread: (otherUserId: string) => void;
  
  /**
   * Clear unread count for a specific conversation
   * Called when user opens the conversation screen
   * 
   * @param otherUserId - ID of the conversation partner
   */
  clearUnread: (otherUserId: string) => void;
  
  /**
   * Reset all unread counts
   * Called on logout or manual "mark all as read"
   */
  resetUnread: () => void;
  
  // Strategic future features (commented for reference)
  
  /**
   * Track typing indicators per conversation (Future Feature)
   * Key: otherUserId, Value: { isTyping: boolean, lastTypingAt: Date }
   * 
   * @future Sprint #13 - Typing Indicators
   */
  // typingIndicators: Record<string, { isTyping: boolean; lastTypingAt: Date }>;
  // setTyping: (otherUserId: string, isTyping: boolean) => void;
  
  /**
   * Track last read timestamp per conversation (Future Feature)
   * Key: otherUserId, Value: lastReadAt timestamp
   * Used for read receipts and "New messages" separator
   * 
   * @future Sprint #13 - Read Receipts
   */
  // lastReadTimestamps: Record<string, Date>;
  // setLastRead: (otherUserId: string, timestamp: Date) => void;
  
  /**
   * Track draft messages per conversation (Future Feature)
   * Key: otherUserId, Value: draft message text
   * Persisted in localStorage for recovery after browser close
   * 
   * @future Sprint #14 - Draft Messages
   */
  // draftMessages: Record<string, string>;
  // setDraft: (otherUserId: string, text: string) => void;
  // clearDraft: (otherUserId: string) => void;
}

/**
 * Zustand Store: Messaging
 * 
 * Manages client-side messaging state with localStorage persistence.
 * 
 * Features:
 * - Unread counters per conversation
 * - Total unread badge count
 * - Persisted across browser sessions
 * - Synced across multiple tabs (via localStorage)
 * 
 * Usage:
 * ```tsx
 * const { unreadCounts, totalUnread, incrementUnread, clearUnread } = useMessagingStore();
 * 
 * // Show unread badge
 * {totalUnread > 0 && <Badge>{totalUnread}</Badge>}
 * 
 * // Clear on conversation open
 * useEffect(() => {
 *   clearUnread(otherUserId);
 * }, [otherUserId]);
 * ```
 */
export const useMessagingStore = create<MessagingState>()(
  persist(
    (set, get) => ({
      unreadCounts: {},
      totalUnread: 0,
      
      incrementUnread: (otherUserId: string) => {
        set((state) => {
          const currentCount = state.unreadCounts[otherUserId] || 0;
          const newUnreadCounts = {
            ...state.unreadCounts,
            [otherUserId]: currentCount + 1
          };
          
          // Recalculate total unread
          const newTotalUnread = Object.values(newUnreadCounts).reduce(
            (sum, count) => sum + count,
            0
          );
          
          return {
            unreadCounts: newUnreadCounts,
            totalUnread: newTotalUnread
          };
        });
      },
      
      clearUnread: (otherUserId: string) => {
        set((state) => {
          const { [otherUserId]: removed, ...remainingCounts } = state.unreadCounts;
          
          // Recalculate total unread
          const newTotalUnread = Object.values(remainingCounts).reduce(
            (sum, count) => sum + count,
            0
          );
          
          return {
            unreadCounts: remainingCounts,
            totalUnread: newTotalUnread
          };
        });
      },
      
      resetUnread: () => {
        set({
          unreadCounts: {},
          totalUnread: 0
        });
      },
    }),
    {
      name: 'fleetman_messaging', // localStorage key
      // Only persist unread counts, not transient state
      partialize: (state) => ({
        unreadCounts: state.unreadCounts,
        totalUnread: state.totalUnread,
      }),
    }
  )
);
