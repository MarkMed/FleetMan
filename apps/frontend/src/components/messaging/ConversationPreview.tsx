import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, BodyText, Badge } from '@components/ui';
import { Building2, MessageSquare } from 'lucide-react';
import { cn } from '@utils/cn';
import { ROUTES } from '@constants';
import type { UserPublicProfile } from '@packages/contracts';

interface ConversationPreviewProps {
  /**
   * Contact user's public profile
   */
  contact: UserPublicProfile;
  
  /**
   * Unread message count for this conversation
   * Shows badge if > 0
   */
  unreadCount?: number;
  
  /**
   * Optional last message preview (Future Feature)
   * For MVP: Not implemented (no backend endpoint)
   */
  lastMessage?: {
    content: string;
    createdAt: Date;
    senderId: string;
  };
  
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
 * Displays a contact in the conversations list (messages inbox).
 * Shows user info, unread badge, and optionally last message preview.
 * 
 * Features:
 * - Contact name and company
 * - User type badge (CLIENT | PROVIDER)
 * - Unread messages badge
 * - Last message preview (future)
 * - Timestamp (future)
 * - Hover effect
 * - Click to navigate to chat screen
 * 
 * MVP Scope:
 * - ✅ Display all contacts (no filtering)
 * - ✅ Unread badge from client-side counter
 * - ❌ NO last message preview (no backend endpoint)
 * - ❌ NO last activity timestamp
 * - ❌ NO online/offline status
 * 
 * Design:
 * - Similar to UserCard but optimized for list view
 * - Horizontal layout with clear visual hierarchy
 * - Badge placement: type (left), unread (right)
 * 
 * @example
 * ```tsx
 * <ConversationPreview
 *   contact={contact}
 *   unreadCount={unreadCounts[contact.id]}
 * />
 * ```
 */
export const ConversationPreview: React.FC<ConversationPreviewProps> = ({
  contact,
  unreadCount = 0,
  lastMessage,
  onClick,
  className = '',
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick(contact.id);
    } else {
      navigate(ROUTES.CHAT(contact.id));
    }
  };
  
  // Type badge colors
  const typeBadgeVariant = contact.type === 'CLIENT' ? 'secondary' : 'success';
  
  // Format last message timestamp (future)
  let formattedTime = '';
  if (lastMessage) {
    const messageDate = new Date(lastMessage.createdAt);
    const now = new Date();
    const isToday = messageDate.toDateString() === now.toDateString();
    
    formattedTime = isToday 
      ? messageDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      : messageDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  }
  
  return (
    <Card
      className={cn(
        'p-4 hover:shadow-md transition-all cursor-pointer',
        'hover:bg-accent/5',
        unreadCount > 0 && 'bg-accent/10', // Highlight if unread
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
          {/* Top row: Name + Type badge */}
          <div className="flex items-center gap-2 mb-1">
            <BodyText weight="medium" className="truncate">
              {contact.profile.companyName || t('users.noCompanyName')}
            </BodyText>
            <Badge variant={typeBadgeVariant} className="flex-shrink-0 text-xs">
              {t(`users.type.${contact.type.toLowerCase()}`)}
            </Badge>
          </div>
          
          {/* Last message preview (future) */}
          {lastMessage ? (
            <p className="text-sm text-muted-foreground truncate">
              {lastMessage.senderId === contact.id ? '' : t('messages.you') + ': '}
              {lastMessage.content}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {t('messages.noMessages', 'Sin mensajes aún')}
            </p>
          )}
        </div>
        
        {/* Right: Timestamp + Unread badge */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {/* Timestamp (future) */}
          {lastMessage && (
            <span className="text-xs text-muted-foreground">
              {formattedTime}
            </span>
          )}
          
          {/* Unread badge */}
          {unreadCount > 0 && (
            <Badge variant="default" className="rounded-full px-2 py-0.5 text-xs font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </div>
      
      {/* TODO: Future features (commented for reference) */}
      
      {/* Online/Offline Status Indicator
       * Green dot for online, gray for offline
       * Requires WebSocket presence tracking
       * @future Sprint #14 - Online Status
       */}
      {/* <div className={cn(
        'w-2 h-2 rounded-full',
        contact.isOnline ? 'bg-green-500' : 'bg-gray-400'
      )} /> */}
      
      {/* Typing Indicator
       * Show "Typing..." when other user is composing
       * Requires WebSocket typing events
       * @future Sprint #13 - Typing Indicators
       */}
      {/* {contact.isTyping && (
        <p className="text-xs text-muted-foreground italic animate-pulse">
          {t('messages.typing')}
        </p>
      )} */}
      
      {/* Pinned Conversation Indicator
       * Pin icon for pinned conversations
       * Requires backend support for pinning
       * @future Sprint #15 - Conversation Management
       */}
      {/* {conversation.isPinned && (
        <Pin className="w-4 h-4 text-primary" />
      )} */}
    </Card>
  );
};
