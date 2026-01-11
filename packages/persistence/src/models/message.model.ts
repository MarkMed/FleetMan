import { Schema, model, Document, type Types } from 'mongoose';
import { type IMessage, MESSAGE_CONTENT_MAX_LENGTH } from '@packages/domain';

// =============================================================================
// MESSAGE DOCUMENT INTERFACE
// =============================================================================

/**
 * Message Document interface extending domain IMessage
 * Adds Mongoose-specific _id and document methods
 * 
 * Sprint #12 - Módulo 3: Messaging System
 */
export interface IMessageDocument extends Omit<IMessage, 'id'>, Document {
  _id: string; // Custom ID: message_<timestamp>_<random> (NOT ObjectId)
  id: string;  // Virtual getter from _id for consistency with domain
}

// =============================================================================
// MESSAGE SCHEMA DEFINITION
// =============================================================================

/**
 * Message Schema
 * Collection independiente para mensajes 1-a-1 entre contactos
 * 
 * Decisión de diseño: Entidad independiente (NO subdocumento)
 * - Permite queries complejas bidireccionales
 * - Escalabilidad: sharding futuro si crece volumen
 * - Paginación eficiente con índices compuestos
 * 
 * Sprint #12 - Módulo 3: Messaging System
 */
const messageSchema = new Schema<IMessageDocument>({
  _id: {
    type: String, // Custom ID format: message_<timestamp>_<random>
    required: true
  },
  
  senderId: {
    type: String, // UserId string (no ObjectId reference)
    required: true,
    index: true
  },
  
  recipientId: {
    type: String, // UserId string (no ObjectId reference)
    required: true,
    index: true
  },
  
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MESSAGE_CONTENT_MAX_LENGTH // 1000 chars (SSOT constant)
  },
  
  sentAt: {
    type: Date,
    default: Date.now,
    required: true,
    index: true // Optimize sorting by date
  }
  
  // TODO: Features POST-MVP (descomentar cuando se implementen)
  // isRead: {
  //   type: Boolean,
  //   default: false,
  //   required: false
  // },
  // readAt: {
  //   type: Date,
  //   required: false
  // },
  // parentMessageId: {
  //   type: String, // For threading/replies
  //   required: false,
  //   index: true
  // },
  // attachmentUrls: [{
  //   type: String, // URLs to multimedia files (images, docs)
  //   required: false
  // }],
  // isEdited: {
  //   type: Boolean,
  //   default: false,
  //   required: false
  // },
  // editedAt: {
  //   type: Date,
  //   required: false
  // }
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  collection: 'messages' // Nombre explícito de la collection
});

// =============================================================================
// ÍNDICES COMPUESTOS (CRÍTICOS PARA PERFORMANCE)
// =============================================================================

/**
 * Índice compuesto bidireccional #1
 * Optimiza queries: "mensajes de A → B" ordenados por fecha descendente
 * Usado en: getConversationHistory cuando senderId es el primer filtro
 */
messageSchema.index({ senderId: 1, recipientId: 1, sentAt: -1 });

/**
 * Índice compuesto bidireccional #2
 * Optimiza queries: "mensajes de B → A" ordenados por fecha descendente
 * Usado en: getConversationHistory cuando recipientId es el primer filtro
 */
messageSchema.index({ recipientId: 1, senderId: 1, sentAt: -1 });

/**
 * TODO: Índice para búsqueda por contenido (POST-MVP)
 * Requiere MongoDB Atlas Search o text index
 */
// messageSchema.index({ content: 'text' });

/**
 * TODO: Índice para obtener mensajes no leídos (POST-MVP)
 * Optimiza queries: "todos los mensajes no leídos de userId"
 */
// messageSchema.index({ recipientId: 1, isRead: 1, sentAt: -1 });

// =============================================================================
// VIRTUAL GETTERS
// =============================================================================

/**
 * Virtual getter para 'id'
 * Mapea _id → id para consistencia con interfaces de dominio
 * Patrón: Igual que en User, Machine, etc.
 */
messageSchema.virtual('id').get(function(this: IMessageDocument) {
  return this._id.toString();
});

/**
 * Ensure virtuals are included when converting to JSON
 * Remueve __v y _id del output JSON (solo retorna 'id')
 */
messageSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(_doc: any, ret: any) {
    delete ret._id;
    return ret;
  }
});

/**
 * Ensure virtuals are included when converting to Object
 */
messageSchema.set('toObject', {
  virtuals: true,
  versionKey: false
});

// =============================================================================
// MODEL EXPORT
// =============================================================================

/**
 * Message Model
 * Collection: 'messages'
 * 
 * Usado por MessageRepository para persistencia
 * Sprint #12 - Módulo 3: Messaging System
 */
export const MessageModel = model<IMessageDocument>('Message', messageSchema);
