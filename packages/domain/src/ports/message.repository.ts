import { Result, DomainError } from '../errors';
import { Message } from '../entities/message/message.entity';
import { MessageId } from '../value-objects/message-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import type { IMessage } from '../models/interfaces';

/**
 * Result type for getConversationHistory method
 * Representa una respuesta paginada de mensajes
 * 
 * Sprint #12 - Módulo 3: Messaging System
 */
export interface IGetConversationHistoryResult {
  messages: IMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Opciones de paginación para historial de conversación
 */
export interface ConversationHistoryOptions {
  page: number;
  limit: number;
}

/**
 * Opciones para obtener conversaciones recientes
 * Sprint #13 - Recent Conversations Inbox Feature
 */
export interface RecentConversationsOptions {
  page: number;
  limit: number;
  onlyContacts?: boolean; // Filtrar solo contactos (true) o no-contactos (false), undefined = todos
  search?: string; // Búsqueda por displayName del otro usuario (regex case-insensitive)
}

/**
 * Resumen de una conversación individual
 * Sprint #13 - Recent Conversations Inbox Feature
 */
export interface IConversationSummary {
  otherUserId: string;
  displayName: string; // companyName || email (calculado en aggregation)
  lastMessageAt: Date; // Timestamp del último mensaje
  lastMessageContent: string; // Preview del contenido (truncado)
  lastMessageSenderId: string; // Para determinar dirección (yo→otro vs otro→yo)
  isContact: boolean; // true si el otro usuario está en mis contactos
  // TODO POST-MVP: unreadCount: number; // Cantidad de mensajes no leídos
}

/**
 * Result type para getRecentConversations
 * Sprint #13 - Recent Conversations Inbox Feature
 */
export interface IGetRecentConversationsResult {
  conversations: IConversationSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Puerto (interface) para persistencia de Message
 * Será implementado en packages/persistence
 * 
 * Sprint #12 - Módulo 3: Messaging System
 */
export interface IMessageRepository {
  /**
   * Guarda un nuevo mensaje en la base de datos
   * @param message - Entidad Message a persistir
   * @returns Result con el mensaje guardado (IMessage) para enviar al frontend, o error
   */
  save(message: Message): Promise<Result<IMessage, DomainError>>;

  /**
   * Busca un mensaje por su ID
   * @param id - MessageId del mensaje
   * @returns Result con Message encontrado o error
   */
  findById(id: MessageId): Promise<Result<Message, DomainError>>;

  /**
   * Obtiene el historial de conversación entre dos usuarios (query bidireccional)
   * Ordena por sentAt descendente (más recientes primero)
   * 
   * @param userId1 - ID del primer usuario
   * @param userId2 - ID del segundo usuario
   * @param options - Opciones de paginación
   * @returns Result con mensajes paginados o error
   */
  getConversationHistory(
    userId1: UserId,
    userId2: UserId,
    options: ConversationHistoryOptions
  ): Promise<Result<IGetConversationHistoryResult, DomainError>>;

  /**
   * Obtiene lista de conversaciones recientes del usuario
   * Query optimizado: obtiene ÚLTIMO mensaje de cada conversación única
   * 
   * Business Logic:
   * - Una conversación es un par de usuarios (userA ↔ userB)
   * - Solo retorna el mensaje más reciente de cada conversación
   * - Soporta filtrado por isContact (onlyContacts param)
   * - Soporta búsqueda por displayName del otro usuario (search param)
   * - Ordenado por lastMessageAt DESC (conversación más reciente primero)
   * 
   * Performance: Usa aggregation pipeline con $group, $lookup, $facet
   * 
   * @param userId - ID del usuario autenticado
   * @param options - Opciones de paginación y filtros
   * @returns Result con lista de conversaciones paginadas o error
   * 
   * Sprint #13 - Recent Conversations Inbox Feature
   */
  getRecentConversations(
    userId: UserId,
    options: RecentConversationsOptions
  ): Promise<Result<IGetRecentConversationsResult, DomainError>>;

  // ==================== TODO: FEATURES POST-MVP ====================

  /**
   * Cuenta mensajes no leídos para un usuario
   * @param userId - ID del usuario destinatario
   * @returns Cantidad de mensajes no leídos
   * 
   * TODO: Implementar cuando se agregue feature de read receipts
   */
  // countUnreadMessages(userId: UserId): Promise<number>;

  /**
   * Marca mensajes como leídos
   * @param messageIds - Array de IDs de mensajes a marcar
   * @returns Result con void o error
   * 
   * TODO: Implementar cuando se agregue feature de read receipts
   */
  // markAsRead(messageIds: MessageId[]): Promise<Result<void, DomainError>>;

  /**
   * Obtiene lista de conversaciones recientes del usuario
   * @param userId - ID del usuario
   * @param limit - Cantidad de conversaciones a retornar
   * @returns Lista de conversaciones con último mensaje y contador unread
   * 
   * TODO: Implementar para vista de lista de conversaciones (inbox)
   */
  // getRecentConversations(userId: UserId, limit: number): Promise<ConversationSummary[]>;

  /**
   * Busca mensajes por contenido (full-text search)
   * @param userId - ID del usuario que busca
   * @param searchTerm - Término a buscar
   * @returns Lista de mensajes que contienen el término
   * 
   * TODO: Implementar cuando se necesite búsqueda de mensajes
   */
  // searchMessages(userId: UserId, searchTerm: string): Promise<IMessage[]>;

  /**
   * Elimina mensajes antiguos (data retention policy)
   * @param olderThan - Fecha límite
   * @returns Cantidad de mensajes eliminados
   * 
   * TODO: Implementar para cumplimiento GDPR/data retention
   */
  // deleteOlderThan(olderThan: Date): Promise<number>;
}
