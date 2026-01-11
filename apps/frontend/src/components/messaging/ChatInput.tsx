import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { Button, Textarea } from '@components/ui';
import { cn } from '@utils/cn';

interface ChatInputProps {
  /**
   * Callback when user sends a message
   * Receives the message text (trimmed, non-empty)
   */
  onSend: (text: string) => void;
  
  /**
   * Whether message sending is in progress
   * Disables input and shows loading state
   */
  isLoading?: boolean;
  
  /**
   * Placeholder text for the input
   */
  placeholder?: string;
  
  /**
   * Optional className for custom styling
   */
  className?: string;
  
  /**
   * Maximum character limit (default: 1000 from backend)
   */
  maxLength?: number;
}

/**
 * ChatInput Component
 * 
 * Text input with send button for composing messages.
 * 
 * Features:
 * - Auto-growing textarea (max 5 lines)
 * - Character counter (shows when > 80% of limit)
 * - Enter to send, Shift+Enter for new line
 * - Auto-focus on mount
 * - Clear after send
 * - Disabled state during loading
 * - Trim whitespace validation
 * 
 * Design:
 * - Minimalist border with focus ring
 * - Send button with primary color
 * - Responsive sizing
 * - Dark mode support
 * 
 * MVP Scope:
 * - ✅ Text input only
 * - ❌ NO emoji picker (future)
 * - ❌ NO file attachments (future)
 * - ❌ NO voice messages (future)
 * - ❌ NO typing indicators (future)
 * 
 * @example
 * ```tsx
 * <ChatInput
 *   onSend={(text) => sendMessage({ receiverId, content: text })}
 *   isLoading={isSending}
 *   placeholder={t('messages.typeMessage')}
 * />
 * ```
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading = false,
  placeholder,
  className = '',
  maxLength = 1000,
}) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);
  
  // Auto-grow textarea based on content (max 5 lines)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 5 lines (~24px per line)
      textarea.style.height = `${newHeight}px`;
    }
  }, [text]);
  
  const handleSend = () => {
    const trimmedText = text.trim();
    
    // Validate non-empty
    if (!trimmedText) {
      return;
    }
    
    // Validate length
    if (trimmedText.length > maxLength) {
      return;
    }
    
    // Send and clear
    onSend(trimmedText);
    setText('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send (Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Character counter visibility
  const characterCount = text.length;
  const showCounter = characterCount > maxLength * 0.8; // Show when > 80%
  const isOverLimit = characterCount > maxLength;
  
  return (
    <div className={cn('flex flex-col gap-2 p-4 border-t bg-background', className)}>
      {/* Input row */}
      <div className="flex items-start gap-2">
        {/* Textarea using shared component */}
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={text}
            onChangeText={setText}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || t('messages.typeMessage')}
            disabled={isLoading}
            maxLength={maxLength}
            showCharacterCount={showCounter}
            rows={1}
            className={cn(
              'resize-none min-h-[35px] max-h-[60px]'
            )}
          />
        </div>
        
        {/* Send button */}
        <Button
          onPress={handleSend}
          disabled={isLoading || !text.trim() || isOverLimit}
          size="icon"
          className="flex-shrink-0 mb-[34px]" // Align with textarea (accounting for character counter)
          aria-label={t('messages.send')}
        >
          {isLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        {t('messages.sendHint', 'Enter para enviar, Shift+Enter para nueva línea')}
      </p>
      
      {/* TODO: Future features (commented for reference) */}
      
      {/* Emoji Picker Button
       * Opens emoji picker popover
       * Inserts emoji at cursor position
       * @future Sprint #13 - Emoji Support
       */}
      {/* <Button variant="ghost" size="icon" onClick={openEmojiPicker}>
        <Smile className="h-5 w-5" />
      </Button> */}
      
      {/* File Attachment Button
       * Opens file picker (images, documents, PDFs)
       * Shows upload progress
       * @future Sprint #14 - File Attachments
       */}
      {/* <Button variant="ghost" size="icon" onClick={openFilePicker}>
        <Paperclip className="h-5 w-5" />
      </Button> */}
      
      {/* Voice Message Button
       * Records audio message
       * Shows waveform during recording
       * @future Sprint #15 - Voice Messages
       */}
      {/* <Button variant="ghost" size="icon" onClick={startRecording}>
        <Mic className="h-5 w-5" />
      </Button> */}
    </div>
  );
};
