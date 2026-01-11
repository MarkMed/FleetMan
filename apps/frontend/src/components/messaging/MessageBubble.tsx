import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@utils/cn';
import type { ConversationHistoryResponse } from '@packages/contracts';

// Extract message type from response
type Message = ConversationHistoryResponse['messages'][number];

interface MessageBubbleProps {
  /**
   * Message object from backend
   */
  message: Message;
  
  /**
   * Whether this message was sent by the authenticated user
   * Determines alignment (right) and styling (primary color)
   */
  isMine: boolean;
  
  /**
   * Display name of the sender
   * Used for messages from other users
   */
  senderName?: string;
  
  /**
   * Optional className for custom styling
   */
  className?: string;
}

/**
 * MessageBubble Component
 * 
 * Displays a single message in a chat conversation.
 * 
 * Features:
 * - Auto-alignment: Mine (right), Theirs (left)
 * - Color coding: Mine (primary), Theirs (muted)
 * - Timestamp display (adaptive: time if today, date+time if older)
 * - Long text wrapping with word-break
 * - Dark mode support
 * 
 * Design:
 * - WhatsApp-inspired bubble layout
 * - Rounded corners with tail (future)
 * - Subtle shadow for depth
 * - Responsive typography
 * 
 * MVP Scope:
 * - ✅ Text display
 * - ❌ NO read receipts (future)
 * - ❌ NO edit/delete indicators (future)
 * - ❌ NO multimedia (future)
 * 
 * @example
 * ```tsx
 * <MessageBubble
 *   message={message}
 *   isMine={message.senderId === currentUserId}
 *   senderName="Juan Pérez"
 * />
 * ```
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMine,
  senderName,
  className = '',
}) => {
  const { t } = useTranslation();
  
  // Format timestamp adaptively (simple format without date-fns)
  const messageDate = new Date(message.createdAt);
  const now = new Date();
  const isToday = messageDate.toDateString() === now.toDateString();
  
  const formattedTime = isToday 
    ? messageDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    : messageDate.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  
  return (
    <div
      className={cn(
        'flex w-full mb-2',
        isMine ? 'justify-end' : 'justify-start',
        className
      )}
    >
      <div
        className={cn(
          'max-w-[75%] px-3 py-2 rounded-lg shadow-sm',
          'break-words', // Word wrap for long text
          isMine
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted text-foreground rounded-bl-none'
        )}
      >
        {/* Sender name (only for messages from others) */}
        {!isMine && senderName && (
          <p className="text-xs font-medium opacity-70 mb-1">
            {senderName}
          </p>
        )}
        
        {/* Message content */}
        <p className="text-sm whitespace-pre-wrap">
          {message.content}
        </p>
        
        {/* Timestamp */}
        <p
          className={cn(
            'text-[10px] mt-1 text-right',
            isMine ? 'opacity-70' : 'opacity-60'
          )}
        >
          {formattedTime}
        </p>
        
        {/* TODO: Read receipt indicator (Future Feature)
         * Show double checkmark when message is read
         * Single checkmark when delivered but not read
         * Clock icon when sending
         * 
         * @future Sprint #13 - Read Receipts
         */}
        {/* {isMine && message.readAt && (
          <CheckCheck className="w-3 h-3 inline ml-1 opacity-70" />
        )} */}
        
        {/* TODO: Edited indicator (Future Feature)
         * Show "(edited)" label if message.editedAt exists
         * 
         * @future Sprint #14 - Message Management
         */}
        {/* {message.editedAt && (
          <span className="text-[10px] opacity-60 ml-2">
            {t('messages.edited')}
          </span>
        )} */}
      </div>
    </div>
  );
};
