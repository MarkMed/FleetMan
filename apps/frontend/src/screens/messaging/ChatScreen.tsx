import React from 'react';
import { Heading1, BodyText, Button, Card } from '@components/ui';
import { ArrowLeft, AlertCircle, UserX, Loader2, MessageSquare } from 'lucide-react';
import { MessageBubble, ChatInput } from '@components/messaging';
import { useChatViewModel } from '../../viewModels/messaging/useChatViewModel';
import type { ConversationHistoryResponse } from '@packages/contracts';

// Extract message type
type Message = ConversationHistoryResponse['messages'][number];

/**
 * ChatScreen (View Layer - MVVM)
 * 
 * Sprint #12 - Module 3: User Communication System (Messaging)
 * 
 * Purpose:
 * - Display conversation history with another user
 * - Send new text messages
 * - Load more messages (pagination)
 * - Auto-scroll to bottom
 * 
 * MVP Scope:
 * - ✅ Text messages only (max 1000 chars)
 * - ✅ "Load More" button for pagination
 * - ✅ Auto-scroll to bottom on new messages
 * - ❌ NO infinite scroll (use button for MVP)
 * - ❌ NO read receipts
 * - ❌ NO typing indicators
 * - ❌ NO multimedia attachments
 * 
 * Architecture:
 * - View Layer: Only rendering and UI structure (this file)
 * - Business Logic: Handled by useChatViewModel
 * - Data Layer: API calls via messageService
 * 
 * Pattern:
 * - Consumes ViewModel via useChatViewModel()
 * - NO business logic in this component
 * - Renders based on ViewModel state/data/actions
 * 
 * @example
 * ```tsx
 * // Route: /messages/:otherUserId
 * <Route path="/messages/:otherUserId" element={<ChatScreen />} />
 * ```
 */
export function ChatScreen() {
  
  // ========================
  // ViewModel (Business Logic)
  // ========================
  
  const vm = useChatViewModel();

  // ========================
  // RENDER SECTIONS
  // ========================

  // ========================
  // NOT CONTACT WARNING
  // ========================

  if (vm.state.isNotContact) {
    return (
      <div className="container mx-auto max-w-4xl py-6 px-4">
        <Card className="p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <UserX className="h-16 w-16 text-destructive" />
            <Heading1 size="medium" className="text-destructive">
              {vm.t('messages.notContact')}
            </Heading1>
            <BodyText className="text-muted-foreground max-w-md text-center">
              {vm.t('messages.notContactDescription')}
            </BodyText>
            <Button 
              variant="filled" 
              onPress={vm.actions.handleBackToConversations}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {vm.t('messages.backToConversations')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ========================
  // ERROR STATE
  // ========================

  if (vm.state.isError) {
    // Check if error is 404 User not found (backend incomplete implementation)
    const errorMessage = vm.state.error?.message || '';
    const isUserNotFound = errorMessage.includes('User not found') || errorMessage.includes('NOT_FOUND');
    
    return (
      <div className="container mx-auto max-w-4xl py-6 px-4">
        <Card className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {isUserNotFound ? (
              <UserX className="h-12 w-12 text-warning" />
            ) : (
              <AlertCircle className="h-12 w-12 text-destructive" />
            )}
            <Heading1 size="medium" className={isUserNotFound ? 'text-warning' : 'text-destructive'}>
              {isUserNotFound 
                ? vm.t('messages.userNotFoundTitle', 'Usuario no encontrado')
                : vm.t('common.error')
              }
            </Heading1>
            <BodyText size="small" className="text-muted-foreground max-w-md text-center">
              {isUserNotFound 
                ? vm.t('messages.userNotFoundDescription', 'Este usuario no existe o ha sido eliminado. Por favor, verifica que el ID sea correcto o intenta con otro contacto.')
                : errorMessage || vm.t('messages.loadError')
              }
            </BodyText>
            <div className="flex gap-2">
              <Button variant="outline" onPress={vm.actions.handleBackToConversations}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {vm.t('messages.backToConversations', 'Volver a mensajes')}
              </Button>
              {!isUserNotFound && (
                <Button variant="filled" onPress={vm.actions.handleRetry}>
                  {vm.t('common.retry')}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ========================
  // LOADING INITIAL STATE
  // ========================

  if (vm.state.isLoadingInitial) {
    return (
      <div className="container mx-auto max-w-4xl py-6 px-4">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <BodyText className="text-muted-foreground">
            {vm.t('messages.loading', 'Cargando conversación...')}
          </BodyText>
        </div>
      </div>
    );
  }

  // ========================
  // MAIN CHAT RENDER
  // ========================

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b bg-background px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onPress={vm.actions.handleBackToConversations}
          aria-label={vm.t('common.back')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex-1">
          <BodyText weight="medium">
            {vm.t('messages.chatWith', 'Conversación')}
          </BodyText>
          <BodyText size="small" className="text-muted-foreground">
            {vm.data.total > 0 && vm.t('messages.messagesCount', { count: vm.data.total, defaultValue: `${vm.data.total} mensajes` })}
          </BodyText>
        </div>
        
        {/* TODO: Future - Menu with options (mute, block, report) */}
      </div>

      {/* Messages Container */}
      <div 
        ref={vm.refs.messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/20"
      >
        {/* Load More Button (top) */}
        {vm.data.hasMore && (
          <div className="flex justify-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onPress={vm.actions.handleLoadMore}
              disabled={vm.state.isLoadingMore}
            >
              {vm.state.isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {vm.t('messages.loadingMore', 'Cargando...')}
                </>
              ) : (
                vm.t('messages.loadMore', 'Cargar más mensajes')
              )}
            </Button>
          </div>
        )}

        {/* Empty State (no messages yet) */}
        {vm.state.isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <MessageSquare className="h-12 w-12 text-muted-foreground" />
            <BodyText className="text-muted-foreground">
              {vm.t('messages.noMessagesYet', 'No hay mensajes aún')}
            </BodyText>
            <BodyText size="small" className="text-muted-foreground">
              {vm.t('messages.startConversation', 'Envía un mensaje para iniciar la conversación')}
            </BodyText>
          </div>
        )}

        {/* Messages List */}
        {vm.data.messages.map((message: Message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isMine={message.senderId === vm.data.currentUserId}
            senderName={message.senderId === vm.data.currentUserId ? undefined : vm.t('messages.otherUser', 'Contacto')}
          />
        ))}

        {/* Auto-scroll anchor */}
        <div ref={vm.refs.messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={vm.actions.handleSendMessage}
        isLoading={vm.state.isSending}
        placeholder={vm.t('messages.typeMessage', 'Escribe un mensaje...')}
        maxLength={1000}
      />
    </div>
  );
}
