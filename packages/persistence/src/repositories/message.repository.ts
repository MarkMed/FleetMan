import {
  type IMessageRepository,
  type IGetConversationHistoryResult,
  type ConversationHistoryOptions,
  type IMessage,
  Message,
  MessageId,
  UserId,
  Result,
  DomainError,
  ok,
  err
} from '@packages/domain';
import { MessageModel, type IMessageDocument } from '../models/message.model';

/**
 * Message Repository Implementation
 * Maneja persistencia de mensajes 1-a-1 en MongoDB
 * 
 * Sprint #12 - Módulo 3: Messaging System
 */
export class MessageRepository implements IMessageRepository {

  /**
   * Guarda un nuevo mensaje en la base de datos
   * @param message - Entidad Message a persistir
   * @returns Result con el mensaje guardado (IMessage) para enviar al frontend
   */
  async save(message: Message): Promise<Result<IMessage, DomainError>> {
    try {
      // 1. Convertir entidad a datos de persistencia
      const persistenceData = message.toPersistence();

      // 2. Guardar en MongoDB
      const savedDoc = await MessageModel.create(persistenceData);

      // 3. Convertir documento guardado a IMessage para el frontend
      const savedMessage: IMessage = {
        id: savedDoc._id,
        senderId: savedDoc.senderId,
        recipientId: savedDoc.recipientId,
        content: savedDoc.content,
        sentAt: savedDoc.sentAt,
        createdAt: savedDoc.createdAt,
        updatedAt: savedDoc.updatedAt
      };

      return ok(savedMessage);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error saving message: ${error.message}`));
    }
  }

  /**
   * Busca un mensaje por su ID
   * @param id - MessageId del mensaje
   * @returns Result con Message entity reconstruida o error
   */
  async findById(id: MessageId): Promise<Result<Message, DomainError>> {
    try {
      const messageDoc = await MessageModel.findById(id.getValue()).lean();

      if (!messageDoc) {
        return err(DomainError.notFound(`Message with ID ${id.getValue()} not found`));
      }

      // Mapear documento a entidad de dominio
      const messageEntity = this.documentToEntity(messageDoc);
      return messageEntity;
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error finding message by ID: ${error.message}`));
    }
  }

  /**
   * Obtiene el historial de conversación entre dos usuarios (query bidireccional)
   * Ordena por sentAt descendente (más recientes primero)
   * 
   * @param userId1 - ID del primer usuario
   * @param userId2 - ID del segundo usuario
   * @param options - Opciones de paginación (page, limit)
   * @returns Result con mensajes paginados o error
   */
  async getConversationHistory(
    userId1: UserId,
    userId2: UserId,
    options: ConversationHistoryOptions
  ): Promise<Result<IGetConversationHistoryResult, DomainError>> {
    try {
      const { page, limit } = options;
      const skip = (page - 1) * limit;

      // Query bidireccional: mensajes donde (A→B) OR (B→A)
      const query = {
        $or: [
          { senderId: userId1.getValue(), recipientId: userId2.getValue() },
          { senderId: userId2.getValue(), recipientId: userId1.getValue() }
        ]
      };

      // Ejecutar query con paginación (usa índices compuestos para performance)
      const [messageDocs, total] = await Promise.all([
        MessageModel
          .find(query)
          .sort({ sentAt: -1 }) // Más recientes primero
          .limit(limit)
          .skip(skip)
          .lean(),
        MessageModel.countDocuments(query)
      ]);

      // Mapear documentos a IMessage interface (para frontend)
      const messages: IMessage[] = messageDocs.map(doc => ({
        id: doc._id,
        senderId: doc.senderId,
        recipientId: doc.recipientId,
        content: doc.content,
        sentAt: doc.sentAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      }));

      // Calcular metadata de paginación
      const totalPages = Math.ceil(total / limit);

      const result: IGetConversationHistoryResult = {
        messages,
        total,
        page,
        limit,
        totalPages
      };

      return ok(result);
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error getting conversation history: ${error.message}`));
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  /**
   * Convierte un documento MongoDB a entidad de dominio Message
   * @param doc - Documento lean de MongoDB
   * @returns Result con Message entity reconstruida
   */
  private documentToEntity(doc: any): Result<Message, DomainError> {
    try {
      // Usar método fromPersistence de la entidad para reconstrucción
      return Message.fromPersistence({
        id: doc._id,
        senderId: doc.senderId,
        recipientId: doc.recipientId,
        content: doc.content,
        sentAt: doc.sentAt
      });
    } catch (error: any) {
      return err(DomainError.create('PERSISTENCE_ERROR', `Error mapping document to entity: ${error.message}`));
    }
  }

  // =============================================================================
  // TODO: FEATURES POST-MVP
  // =============================================================================

  /**
   * Cuenta mensajes no leídos para un usuario
   * @param userId - ID del usuario destinatario
   * @returns Cantidad de mensajes no leídos
   * 
   * TODO: Implementar cuando se agregue feature de read receipts
   */
  // async countUnreadMessages(userId: UserId): Promise<number> {
  //   try {
  //     const count = await MessageModel.countDocuments({
  //       recipientId: userId.getValue(),
  //       isRead: false
  //     });
  //     return count;
  //   } catch (error) {
  //     console.error('Error counting unread messages:', error);
  //     return 0;
  //   }
  // }

  /**
   * Marca mensajes como leídos
   * @param messageIds - Array de IDs de mensajes a marcar
   * @returns Result con void o error
   * 
   * TODO: Implementar cuando se agregue feature de read receipts
   */
  // async markAsRead(messageIds: MessageId[]): Promise<Result<void, DomainError>> {
  //   try {
  //     const ids = messageIds.map(id => id.getValue());
  //     await MessageModel.updateMany(
  //       { _id: { $in: ids } },
  //       { 
  //         $set: { 
  //           isRead: true, 
  //           readAt: new Date() 
  //         } 
  //       }
  //     );
  //     return ok(undefined);
  //   } catch (error: any) {
  //     return err(DomainError.create('PERSISTENCE_ERROR', `Error marking messages as read: ${error.message}`));
  //   }
  // }

  /**
   * Obtiene lista de conversaciones recientes del usuario
   * @param userId - ID del usuario
   * @param limit - Cantidad de conversaciones a retornar
   * @returns Lista de conversaciones con último mensaje y contador unread
   * 
   * TODO: Implementar para vista de lista de conversaciones (inbox)
   * Requiere aggregation pipeline complejo:
   * 1. Match mensajes donde userId es sender o recipient
   * 2. Group by conversación (pair de userIds)
   * 3. Project último mensaje + count unread
   * 4. Sort por sentAt del último mensaje
   * 5. Limit
   */
  // async getRecentConversations(userId: UserId, limit: number): Promise<ConversationSummary[]> {
  //   // Implementación con aggregation pipeline
  // }

  /**
   * Busca mensajes por contenido (full-text search)
   * @param userId - ID del usuario que busca
   * @param searchTerm - Término a buscar
   * @returns Lista de mensajes que contienen el término
   * 
   * TODO: Implementar cuando se necesite búsqueda de mensajes
   * Requiere text index en campo 'content'
   */
  // async searchMessages(userId: UserId, searchTerm: string): Promise<IMessage[]> {
  //   // Implementación con $text search
  // }

  /**
   * Elimina mensajes antiguos (data retention policy)
   * @param olderThan - Fecha límite
   * @returns Cantidad de mensajes eliminados
   * 
   * TODO: Implementar para cumplimiento GDPR/data retention
   */
  // async deleteOlderThan(olderThan: Date): Promise<number> {
  //   try {
  //     const result = await MessageModel.deleteMany({
  //       sentAt: { $lt: olderThan }
  //     });
  //     return result.deletedCount || 0;
  //   } catch (error) {
  //     console.error('Error deleting old messages:', error);
  //     return 0;
  //   }
  // }
}
