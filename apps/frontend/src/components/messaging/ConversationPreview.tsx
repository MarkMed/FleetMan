import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, BodyText, Badge } from '@components/ui';
import { MessageSquare, UserPlus } from 'lucide-react';
import { cn } from '@utils/cn';
import { ROUTES } from '@constants';
import { useAuthStore } from '@store';
import type { ConversationSummary } from '@packages/contracts';

interface ConversationPreviewProps {
  /**
   * Conversation data from backend
   * Sprint #13 - Recent Conversations Inbox Feature
   */
  conversation: ConversationSummary;
  
  /**
   * Unread message count for this conversation
   * MVP: From client-side Zustand store
   * Future: Will come from backend
   */
  unreadCount?: number;
  
  /**
   * Optional onClick handler (overrides default navigation)
   */
  onClick?: (userId: string) => void;
  
  /**
   * Optional className for custom styling
   */
  className?: string;
}

/**
 * ConversationPreview Component
 * 
 * Sprint #13 - Recent Conversations Inbox Feature
 * 
 * Displays a conversation in the messages inbox with last message preview.
 * 
 * Features (Sprint #13):
 * - ✅ Display name (companyName or email fallback)
 * - ✅ Last message content preview (truncated)
 * - ✅ Relative timestamp ("hace 5m", "ayer")
 * - ✅ Unread badge (client-side count)
 * - ✅ Contact vs non-contact indicator badge
 * - ✅ "You: " prefix if current user sent last message
 * - ✅ Hover effect for better UX
 * 
 * MVP Scope:
 * - ✅ Last message preview and timestamp
 * - ✅ isContact badge visual indicator
 * - ✅ Unread count from Zustand
 * - ❌ NO online/offline status
 * - ❌ NO typing indicators
 * - ❌ NO pinned conversations
 * 
 * Design:
 * - Horizontal layout optimized for list view
 * - Clear visual hierarchy (name → message → timestamp)
 * - Badge placement: isContact (left), unread (right)
 * - Highlight background if unread
 * 
 * @example
 * ```tsx
 * <ConversationPreview
 *   conversation={convo}
 *   unreadCount={unreadCounts[convo.otherUserId]}
 * />
 * ```
 */
export const ConversationPreview: React.FC<ConversationPreviewProps> = ({
  conversation,
  unreadCount = 0,
  onClick,
  className = '',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const handleClick = () => {
    if (onClick) {
      onClick(conversation.otherUserId);
    } else {
      navigate(ROUTES.CHAT(conversation.otherUserId));
    }
  };
  
  // Format relative timestamp
  const formattedTime = formatRelativeTime(conversation.lastMessageAt, t);
  
  // Check if current user sent the last message
  const isSentByMe = conversation.lastMessageSenderId === user?.id;
  
  // Truncate message content (max 60 chars)
  const truncatedMessage = conversation.lastMessageContent
    ? conversation.lastMessageContent.length > 60
      ? conversation.lastMessageContent.substring(0, 60) + '...'
      : conversation.lastMessageContent
    : t('messages.noMessages', 'Sin mensajes');
  
  return (
    <Card
      className={cn(
        'p-4 hover:shadow-md transition-all cursor-pointer',
        'hover:bg-accent/5',
        unreadCount > 0 && 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-800', // Highlight if unread
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        {/* Left: Message icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
        </div>
        
        {/* Center: User info + last message */}
        <div className="flex-1 min-w-0">
          {/* Top row: Name + isContact badge */}
          <div className="flex items-center gap-2 mb-1">
            <BodyText weight="medium" className="truncate">
              {conversation.displayName}
            </BodyText>
            {!conversation.isContact && (
              <Badge variant="secondary" className="flex-shrink-0 text-xs">
                <UserPlus className="w-3 h-3 mr-1" />
                {t('messages.newChat', 'Nuevo')}
              </Badge>
            )}
          </div>
          
          {/* Last message preview */}
          <p className={cn(
            "text-sm truncate",
            unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {isSentByMe && (
              <span className="text-muted-foreground">{t('messages.you', 'Tú')}: </span>
            )}
            {truncatedMessage}
          </p>
        </div>
        
        {/* Right: Timestamp + Unread badge */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {/* Timestamp */}
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formattedTime}
          </span>
          
          {/* Unread badge */}
          {unreadCount > 0 && (
            <Badge variant="default" className="rounded-full px-2 py-0.5 text-xs font-bold bg-blue-600">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};

/**
 * Format relative timestamp
 * 
 * Examples:
 * - "hace 2m" (2 minutes ago)
 * - "hace 3h" (3 hours ago)
 * - "ayer" (yesterday)
 * - "15 Ene" (15 January)
 * 
 * @param date - Message timestamp
 * @param t - i18n translation function
 * @returns Formatted relative time string
 */
function formatRelativeTime(date: Date, t: (key: string, options?: any) => string): string {
  const now = new Date();
  const messageDate = new Date(date);
  const diffMs = now.getTime() - messageDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  // Less than 1 hour: "hace Xm"
  if (diffMinutes < 60) {
    return t('messages.timeAgo.minutes', { count: diffMinutes, defaultValue: 'hace {{count}}m' });
  }
  
  // Less than 24 hours: "hace Xh"
  if (diffHours < 24) {
    return t('messages.timeAgo.hours', { count: diffHours, defaultValue: 'hace {{count}}h' });
  }
  
  // Yesterday: "ayer"
  if (diffDays === 1) {
    return t('messages.timeAgo.yesterday', 'ayer');
  }
  
  // Less than 7 days: "hace Xd"
  if (diffDays < 7) {
    return t('messages.timeAgo.days', { count: diffDays, defaultValue: 'hace {{count}}d' });
  }
  
  // Older: "15 Ene" or "15/01"
  return messageDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}
