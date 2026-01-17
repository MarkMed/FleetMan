import {
  type IMessageRepository,
  type IGetConversationHistoryResult,
  type ConversationHistoryOptions,
  type IGetRecentConversationsResult,
  type IConversationSummary,
  type RecentConversationsOptions,
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
  async getRecentConversations(
    userId: UserId,
    options: RecentConversationsOptions
  ): Promise<Result<IGetRecentConversationsResult, DomainError>> {
    try {
      const { page, limit, onlyContacts, search } = options;
      const skip = (page - 1) * limit;
      const userIdValue = userId.getValue();

      // Debug logging para verificar tipos de datos
      console.log('=== getRecentConversations DEBUG START ===');
      console.log('userId from parameter:', userId);
      console.log('typeof userId:', typeof userId);
      console.log('userIdValue (getValue()):', userIdValue);
      console.log('typeof userIdValue:', typeof userIdValue);
      console.log('page:', page, 'typeof:', typeof page);
      console.log('limit:', limit, 'typeof:', typeof limit);
      console.log('skip:', skip, 'typeof:', typeof skip);
      console.log('onlyContacts:', onlyContacts, 'typeof:', typeof onlyContacts);
      console.log('search:', search, 'typeof:', typeof search);

      // Build aggregation pipeline
      const pipeline: any[] = [
        // Stage 1: Match messages where userId is sender OR recipient
        {
          $match: {
            $or: [
              { senderId: userIdValue },
              { recipientId: userIdValue }
            ]
          }
        },

        // Stage 2: Add otherUserId field (the user we're conversing with)
        {
          $addFields: {
            otherUserId: {
              $cond: {
                if: { $eq: ['$senderId', userIdValue] },
                then: '$recipientId',
                else: '$senderId'
              }
            }
          }
        },

        // Stage 3: Sort by sentAt DESC BEFORE grouping (important for $first to get latest)
        {
          $sort: { sentAt: -1 }
        },

        // Stage 4: Group by otherUserId, keep FIRST (latest) message per conversation
        {
          $group: {
            _id: '$otherUserId',
            lastMessageAt: { $first: '$sentAt' },
            lastMessageContent: { $first: '$content' },
            lastMessageSenderId: { $first: '$senderId' }
          }
        },

        // Stage 5: Lookup User collection to get otherUser data
        // CRITICAL FIX: Use pipeline with $toObjectId because:
        // - MessageModel stores senderId/recipientId as strings
        // - UserModel uses _id as ObjectId
        // - Need to convert string to ObjectId for $match to work
        {
          $lookup: {
            from: 'users', // MongoDB collection name
            let: { otherUserId: '$_id' }, // Pass otherUserId (string) to pipeline
            pipeline: [
              {
                $match: {
                  $expr: { 
                    $eq: ['$_id', { $toObjectId: '$$otherUserId' }] // Convert string to ObjectId
                  }
                }
              },
              {
                $project: {
                  _id: 1,
                  email: 1,
                  'profile.companyName': 1,
                  contacts: 1
                }
              }
            ],
            as: 'otherUserData'
          }
        },

        // Stage 6: Unwind otherUserData (convert array to object)
        // preserveNullAndEmptyArrays: false = exclude if user deleted
        {
          $unwind: {
            path: '$otherUserData',
            preserveNullAndEmptyArrays: false
          }
        },

        // Stage 7: Add computed fields (displayName, isContact)
        {
          $addFields: {
            displayName: {
              $cond: {
                if: {
                  $and: [
                    { $ne: ['$otherUserData.profile.companyName', null] },
                    { $ne: ['$otherUserData.profile.companyName', ''] }
                  ]
                },
                then: '$otherUserData.profile.companyName',
                else: '$otherUserData.email'
              }
            },
            isContact: {
              $in: [
                userIdValue, 
                { 
                  $map: {
                    input: { $ifNull: ['$otherUserData.contacts', []] },
                    as: 'contact',
                    in: '$$contact.contactUserId'
                  }
                }
              ]
            }
          }
        }
      ];

      // Stage 8: Conditional match for onlyContacts filter
      if (onlyContacts !== undefined) {
        console.log('Adding onlyContacts filter:', onlyContacts);
        pipeline.push({
          $match: {
            isContact: onlyContacts
          }
        });
      }

      // Stage 9: Conditional match for search filter (regex case-insensitive)
      if (search) {
        console.log('Adding search filter:', search);
        pipeline.push({
          $match: {
            displayName: {
              $regex: search,
              $options: 'i' // case-insensitive
            }
          }
        });
      }

      // Stage 10: Sort by lastMessageAt DESC
      pipeline.push({
        $sort: { lastMessageAt: -1 }
      });

      // Stage 11: Facet for pagination (count + data in single query)
      pipeline.push({
        $facet: {
          metadata: [
            { $count: 'total' }
          ],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                otherUserId: '$_id',
                displayName: 1,
                lastMessageAt: 1,
                lastMessageContent: 1,
                lastMessageSenderId: 1,
                isContact: 1,
                _id: 0
              }
            }
          ]
        }
      });

      console.log('Pipeline stages count:', pipeline.length);
      console.log('Executing aggregation pipeline...');

      // Execute aggregation
      const result = await MessageModel.aggregate(pipeline);

      console.log('Aggregation result:', result);
      console.log('typeof result:', typeof result);
      console.log('result.length:', result.length);
      console.log('result[0]:', result[0]);

      // Extract results from facet
      const metadata = result[0]?.metadata[0];
      const data = result[0]?.data || [];
      const total = metadata?.total || 0;

      console.log('metadata:', metadata);
      console.log('data:', data);
      console.log('typeof data:', typeof data);
      console.log('data.length:', data.length);
      console.log('total:', total, 'typeof:', typeof total);

      // Map aggregation results to domain interface
      const conversations: IConversationSummary[] = data.map((doc: any) => {
        console.log('Mapping doc:', doc);
        return {
          otherUserId: doc.otherUserId,
          displayName: doc.displayName,
          lastMessageAt: doc.lastMessageAt,
          lastMessageContent: doc.lastMessageContent,
          lastMessageSenderId: doc.lastMessageSenderId,
          isContact: doc.isContact
        };
      });

      const totalPages = Math.ceil(total / limit);

      console.log('conversations mapped:', conversations);
      console.log('conversations.length:', conversations.length);
      console.log('totalPages:', totalPages);
      console.log('=== getRecentConversations DEBUG END ===');

      return ok({
        conversations,
        total,
        page,
        limit,
        totalPages
      });
    } catch (error: any) {
      console.error('=== getRecentConversations ERROR ===');
      console.error('error:', error);
      console.error('error.message:', error.message);
      console.error('error.stack:', error.stack);
      return err(DomainError.create('PERSISTENCE_ERROR', `Error getting recent conversations: ${error.message}`));
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
