import { Result, ok, err, DomainError, DomainErrorCodes } from '../../errors';
import { MessageId } from '../../value-objects/message-id.vo';
import { UserId } from '../../value-objects/user-id.vo';
import { IMessage, MESSAGE_CONTENT_MAX_LENGTH } from '../../models';

/**
 * Propiedades para CREAR un mensaje
 * Sprint #12 - Módulo 3: Messaging System
 */
export interface CreateMessageProps {
  senderId: string;
  recipientId: string;
  content: string;
}

/**
 * Propiedades internas del mensaje
 */
interface MessageProps {
  id: MessageId;
  senderId: UserId;
  recipientId: UserId;
  content: string;
  sentAt: Date;
}

/**
 * Datos para reconstruir una entidad Message desde persistencia
 * Representa los datos raw que vienen de la base de datos
 */
export type MessageEntityData = {
  id: string;              // Raw string desde MongoDB
  senderId: string;        // Raw string desde MongoDB
  recipientId: string;     // Raw string desde MongoDB
  content: string;
  sentAt: Date | string;   // Puede venir como string desde JSON
};

/**
 * Entidad Message
 * Representa un mensaje 1-a-1 entre dos usuarios contactos
 * 
 * Reglas de negocio:
 * - Content no vacío, máximo 1000 caracteres
 * - senderId ≠ recipientId (no auto-mensajes)
 * - Solo entre contactos (validado en use case)
 * 
 * Sprint #12 - Módulo 3: Messaging System
 */
export class Message {
  private constructor(private readonly props: MessageProps) {}

  /**
   * Factory method para crear un nuevo mensaje
   * @param createProps - Datos del mensaje a crear
   * @returns Result con Message válido o error de dominio
   */
  public static create(createProps: CreateMessageProps): Result<Message, DomainError> {
    // 1. Validar senderId
    const senderIdResult = UserId.create(createProps.senderId);
    if (!senderIdResult.success) {
      return err(DomainError.create(DomainErrorCodes.INVALID_INPUT, `Invalid sender ID: ${senderIdResult.error.message}`));
    }

    // 2. Validar recipientId
    const recipientIdResult = UserId.create(createProps.recipientId);
    if (!recipientIdResult.success) {
      return err(DomainError.create(DomainErrorCodes.INVALID_INPUT, `Invalid recipient ID: ${recipientIdResult.error.message}`));
    }

    // 3. Validar que no sea auto-mensaje
    if (createProps.senderId === createProps.recipientId) {
      return err(DomainError.create(DomainErrorCodes.INVALID_INPUT, 'Cannot send message to yourself'));
    }

    // 4. Validar contenido
    const contentValidation = Message.validateContent(createProps.content);
    if (!contentValidation.success) {
      return err(contentValidation.error);
    }

    // 5. Generar ID único
    const messageId = MessageId.generate();

    // 6. Construir props
    const props: MessageProps = {
      id: messageId,
      senderId: senderIdResult.data,
      recipientId: recipientIdResult.data,
      content: createProps.content.trim(),
      sentAt: new Date(),
    };

    return ok(new Message(props));
  }

  /**
   * Reconstruye una entidad Message desde datos persistidos
   * Usado por el repository al recuperar de base de datos
   * @param data - Datos raw desde persistencia
   * @returns Result con Message reconstruido o error
   */
  public static fromPersistence(data: MessageEntityData): Result<Message, DomainError> {
    try {
      // Reconstruir MessageId desde string
      const messageIdResult = MessageId.create(data.id);
      if (!messageIdResult.success) {
        return err(messageIdResult.error);
      }

      // Reconstruir UserId sender
      const senderIdResult = UserId.create(data.senderId);
      if (!senderIdResult.success) {
        return err(senderIdResult.error);
      }

      // Reconstruir UserId recipient
      const recipientIdResult = UserId.create(data.recipientId);
      if (!recipientIdResult.success) {
        return err(recipientIdResult.error);
      }

      // Convertir sentAt a Date si viene como string
      const sentAt = typeof data.sentAt === 'string' ? new Date(data.sentAt) : data.sentAt;

      const props: MessageProps = {
        id: messageIdResult.data,
        senderId: senderIdResult.data,
        recipientId: recipientIdResult.data,
        content: data.content,
        sentAt,
      };

      return ok(new Message(props));
    } catch (error) {
      return err(DomainError.create(DomainErrorCodes.PERSISTENCE_ERROR, `Failed to reconstruct Message: ${(error as Error).message}`));
    }
  }

  /**
   * Valida el contenido del mensaje
   */
  private static validateContent(content: string): Result<void, DomainError> {
    if (!content || content.trim().length === 0) {
      return err(DomainError.create(DomainErrorCodes.INVALID_INPUT, 'Message content cannot be empty'));
    }

    if (content.length > MESSAGE_CONTENT_MAX_LENGTH) {
      return err(DomainError.create(
        DomainErrorCodes.INVALID_INPUT,
        `Message content exceeds maximum length of ${MESSAGE_CONTENT_MAX_LENGTH} characters`
      ));
    }

    return ok(undefined);
  }

  // ==================== GETTERS ====================

  /**
   * Obtiene el ID del mensaje
   */
  public getId(): MessageId {
    return this.props.id;
  }

  /**
   * Obtiene el ID del remitente
   */
  public getSenderId(): UserId {
    return this.props.senderId;
  }

  /**
   * Obtiene el ID del destinatario
   */
  public getRecipientId(): UserId {
    return this.props.recipientId;
  }

  /**
   * Obtiene el contenido del mensaje
   */
  public getContent(): string {
    return this.props.content;
  }

  /**
   * Obtiene la fecha de envío
   */
  public getSentAt(): Date {
    return this.props.sentAt;
  }

  // ==================== PUBLIC INTERFACE ====================

  /**
   * Convierte la entidad a su representación pública (IMessage)
   * Usado para enviar al frontend y en responses HTTP
   * @returns IMessage interface
   */
  public toPublicInterface(): IMessage {
    return {
      id: this.props.id.getValue(),
      senderId: this.props.senderId.getValue(),
      recipientId: this.props.recipientId.getValue(),
      content: this.props.content,
      sentAt: this.props.sentAt,
      createdAt: this.props.sentAt, // IBaseEntity requirement
      updatedAt: this.props.sentAt, // IBaseEntity requirement
    };
  }

  /**
   * Convierte la entidad a datos para persistencia
   * Usado por el repository al guardar en base de datos
   * @returns Objeto plano con datos persistibles
   */
  public toPersistence(): Record<string, any> {
    return {
      _id: this.props.id.getValue(),
      senderId: this.props.senderId.getValue(),
      recipientId: this.props.recipientId.getValue(),
      content: this.props.content,
      sentAt: this.props.sentAt,
    };
  }

  // ==================== TODO: FEATURES POST-MVP ====================

  /**
   * Marca el mensaje como leído
   * @returns Nuevo Message con estado actualizado
   * 
   * TODO: Implementar cuando se agregue feature de read receipts
   */
  // public markAsRead(): Message {
  //   const updatedProps = {
  //     ...this.props,
  //     isRead: true,
  //     readAt: new Date()
  //   };
  //   return new Message(updatedProps);
  // }

  /**
   * Edita el contenido del mensaje
   * @param newContent - Nuevo contenido
   * @returns Result con Message editado o error
   * 
   * TODO: Implementar cuando se agregue feature de message editing
   */
  // public edit(newContent: string): Result<Message, DomainError> {
  //   const contentValidation = Message.validateContent(newContent);
  //   if (!contentValidation.success) {
  //     return err(contentValidation.error);
  //   }
  //   
  //   const updatedProps = {
  //     ...this.props,
  //     content: newContent.trim(),
  //     isEdited: true,
  //     editedAt: new Date()
  //   };
  //   return ok(new Message(updatedProps));
  // }
}
