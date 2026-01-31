import { Schema, model, Document, type Types } from 'mongoose';
import { 
  type IUser, 
  type IClientUser, 
  type IProviderUser,
  type UserType,
  type SubscriptionLevel,
  type INotification,
  NOTIFICATION_TYPES,
  NOTIFICATION_SOURCE_TYPES
} from '@packages/domain';
import { USER_PROFILE_LIMITS } from '@packages/contracts';

// =============================================================================
// USER DOCUMENT INTERFACES
// =============================================================================

/**
 * Notification subdocument type (with Mongoose _id)
 * Extends domain INotification, replacing 'id' with MongoDB '_id'
 * Pattern: Same as IMachineDocument extends Omit<IMachine, 'id'>
 */
interface INotificationSubdoc extends Omit<INotification, 'id'> {
  _id: Types.ObjectId;
}

/**
 * Base User Document interface extending domain IUser
 * Adds Mongoose-specific _id, document methods, and passwordHash for persistence
 * Sprint #15 - Task 2.4: Added passwordResetToken and passwordResetExpires
 */
export interface IUserDocument extends Omit<IUser, 'id' | 'notifications'>, Document {
  _id: Types.ObjectId;
  id: string; // Virtual getter from _id
  passwordHash: string; // Only for persistence, not exposed in domain interfaces
  passwordResetToken?: string; // 🆕 Sprint #15 - Password reset token
  passwordResetExpires?: Date; // 🆕 Sprint #15 - Token expiration time
  notifications?: Types.DocumentArray<INotificationSubdoc>; // Sprint #9 - Subdocument array
}

/**
 * Client User Document interface
 * Sprint #15 - Task 2.4: Added passwordResetToken and passwordResetExpires
 */
export interface IClientUserDocument extends Omit<IClientUser, 'id' | 'notifications'>, Document {
  _id: Types.ObjectId;
  id: string;
  passwordHash: string;
  passwordResetToken?: string; // 🆕 Sprint #15
  passwordResetExpires?: Date; // 🆕 Sprint #15
  notifications?: Types.DocumentArray<INotificationSubdoc>;
}

/**
 * Provider User Document interface
 * Sprint #15 - Task 2.4: Added passwordResetToken and passwordResetExpires
 */
export interface IProviderUserDocument extends Omit<IProviderUser, 'id' | 'notifications'>, Document {
  _id: Types.ObjectId;
  id: string;
  passwordHash: string;
  passwordResetToken?: string; // 🆕 Sprint #15
  passwordResetExpires?: Date; // 🆕 Sprint #15
  notifications?: Types.DocumentArray<INotificationSubdoc>;
}

// =============================================================================
// NOTIFICATION SUBDOCUMENT SCHEMA (Sprint #9)
// =============================================================================

/**
 * Notification Subdocument Schema
 * Embedded in User similar to QuickCheck in Machine
 */
const NotificationSubSchema = new Schema({
  notificationType: {
    type: String,
    enum: NOTIFICATION_TYPES,
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  wasSeen: {
    type: Boolean,
    default: false,
    required: true
  },
  notificationDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  actionUrl: {
    type: String,
    sparse: true
  },
  sourceType: {
    type: String,
    enum: NOTIFICATION_SOURCE_TYPES,
    sparse: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    required: false
  }
}, { _id: true }); // Auto-generate _id for each notification

// =============================================================================
// CONTACT SUBDOCUMENT SCHEMA (Sprint #12 Module 2)
// =============================================================================

/**
 * Contact Subdocument Schema
 * Embedded in User for personal contact list management
 * Relación unidireccional: userId guarda a contactUserId (no viceversa)
 */
const ContactSubSchema = new Schema({
  contactUserId: {
    type: String, // UserId string (no ObjectId)
    required: true,
    index: true // Optimize queries: "is X a contact of Y?"
  },
  addedAt: {
    type: Date,
    default: Date.now,
    required: true
  }
  // TODO: Campos estratégicos para futuro (personalización de agenda)
  // nickname: { type: String, maxlength: 100 }, // Alias personalizado
  // tags: [{ type: String, maxlength: 50 }], // Etiquetas: ['proveedor-confiable', 'urgente']
  // notes: { type: String, maxlength: 500 }, // Notas privadas
  // isFavorite: { type: Boolean, default: false } // Marcar como favorito
}, { _id: false }); // No auto-generate _id (simplificar subdocumento)

// =============================================================================
// USER SCHEMA DEFINITION
// =============================================================================

/**
 * Base User Schema
 * Uses discriminators for CLIENT/PROVIDER types
 */
const userSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  
  passwordHash: {
    type: String,
    required: true,
    select: false // No incluir en queries por defecto (seguridad)
  },
  
  profile: {
    phone: {
      type: String,
      trim: true,
      sparse: true
    },
    companyName: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    // 🆕 Sprint #13 Task 10.2: Bio & Tags
    bio: {
      type: String,
      trim: true,
      maxlength: USER_PROFILE_LIMITS.MAX_BIO_LENGTH,
      sparse: true // Índice sparse: solo indexa documentos donde bio existe
    },
    tags: {
      type: [String],
      default: [], // Array vacío por default (idiomático Mongoose, consistente con contacts)
      validate: {
        validator: function(tags: string[] | undefined) {
          // Permitir undefined/null (edge case) y arrays válidos
          if (!tags) return true;
          if (!Array.isArray(tags)) return false;
          if (tags.length > USER_PROFILE_LIMITS.MAX_TAGS) return false;
          
          // Validar cada tag individualmente
          return tags.every(tag => 
            typeof tag === 'string' && 
            tag.trim().length > 0 && 
            tag.length <= USER_PROFILE_LIMITS.MAX_TAG_LENGTH
          );
        },
        message: `Tags must be an array of max ${USER_PROFILE_LIMITS.MAX_TAGS} strings, each max ${USER_PROFILE_LIMITS.MAX_TAG_LENGTH} characters`
      }
    },
    // 📧 Sprint #15 Task 8.7: Email Notification Preferences
    emailNotifications: {
      type: Boolean,
      default: true // Opt-out approach: usuarios reciben emails por defecto, pueden desactivar
    }
  },
  
  type: {
    type: String,
    enum: ['CLIENT', 'PROVIDER'],
    required: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },

  // 🔔 Sprint #9: Embedded notifications array
  notifications: [NotificationSubSchema],

  // 📏 Sprint #12 Module 2: Embedded contacts array
  contacts: {
    type: [ContactSubSchema],
    default: []  },

  // 🔐 Sprint #13 Task 9.3e: Chat Access Control - Whitelist (acceptedChatsFrom)
  // Array de UserIds de los cuales el usuario ha aceptado recibir chats
  // Permite abrir conversaciones aunque no sean contactos mutuos
  acceptedChatsFrom: {
    type: [String],
    default: []
  },

  // 🚫 Sprint #13 Task 9.3e: Chat Access Control - Blacklist (usersBlackList)
  // Array de UserIds bloqueados por el usuario
  // Bloquea envío de mensajes y remueve de acceptedChatsFrom (mutuamente excluyente)
  usersBlackList: {
    type: [String],
    default: []
  },

  // 🔐 Sprint #15 Task 2.4: Password Recovery Fields
  // Token JWT temporal para resetear contraseña (opcional)
  passwordResetToken: {
    type: String,
    sparse: true, // Solo indexa documentos donde el campo existe
    select: false // No incluir en queries por defecto (seguridad)
  },

  // Fecha de expiración del token de reset (opcional)
  passwordResetExpires: {
    type: Date,
    sparse: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  discriminatorKey: 'type',
  collection: 'users'
});

// Virtual for id
userSchema.virtual('id').get(function(this: IUserDocument) {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc: any, ret: any) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Indexes for performance
userSchema.index({ type: 1, isActive: 1 });

// Sprint #12 User Discovery: Compound index for findForDiscovery queries
// Optimizes queries with isActive + type filter + companyName regex search
// Query pattern: { isActive: true, type: 'PROVIDER', 'profile.companyName': /regex/i }
userSchema.index({ isActive: 1, type: 1, 'profile.companyName': 1 });

// Sprint #12 Contact Management: Compound index for contact lookups
// Optimizes queries: "is contactUserId in userId's contacts?"
// Query pattern: { _id: userId, 'contacts.contactUserId': contactUserId }
userSchema.index({ _id: 1, 'contacts.contactUserId': 1 });

// 🆕 Sprint #13 Task 10.2: Tags index for future search functionality
// Optimizes queries: { 'profile.tags': 'tag-value' } or { 'profile.tags': { $in: [...] } }
// Sparse index: only indexes documents where tags array exists
userSchema.index({ 'profile.tags': 1 }, { sparse: true });

// 🆕 Sprint #13 Task 9.3e: Chat Access Control - Whitelist index
// Optimizes queries: { acceptedChatsFrom: userId } to check if chat is accepted
// Sparse index: only indexes documents where acceptedChatsFrom array exists and is non-empty
userSchema.index({ acceptedChatsFrom: 1 }, { sparse: true });

// 🆕 Sprint #13 Task 9.3e: Chat Access Control - Blacklist index
// Optimizes queries: { usersBlackList: userId } to check if user is blocked
// Sparse index: only indexes documents where usersBlackList array exists and is non-empty
userSchema.index({ usersBlackList: 1 }, { sparse: true });

// 🔐 Sprint #15 Task 2.4: Password Reset Token index
// Optimizes queries: UserRepository.findByResetToken({ passwordResetToken, passwordResetExpires: { $gt: now } })
// Compound index for both token and expiry to support queries checking valid (non-expired) tokens
// Sparse index: only indexes documents where passwordResetToken exists (most users won't have one)
userSchema.index({ passwordResetToken: 1, passwordResetExpires: 1 }, { sparse: true });

// Note: Notification queries use in-memory filtering (not MongoDB queries),
// so a compound index on notification fields wouldn't be beneficial.
// If we implement aggregation pipeline in the future, consider adding:
// userSchema.index({ 'notifications.wasSeen': 1, 'notifications.notificationDate': -1 });

// =============================================================================
// CLIENT USER DISCRIMINATOR
// =============================================================================

const clientUserSchema = new Schema<IClientUserDocument>({
  subscriptionLevel: {
    type: String,
    enum: ['FREE', 'BASIC', 'PREMIUM'],
    default: 'FREE'
  },
  
  subscriptionExpiry: {
    type: Date
  }
});

// =============================================================================
// PROVIDER USER DISCRIMINATOR
// =============================================================================

const providerUserSchema = new Schema<IProviderUserDocument>({
  serviceAreas: {
    type: [String],
    default: []
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verificationDate: {
    type: Date
  }
});

// =============================================================================
// MODELS EXPORT
// =============================================================================

// Base User model
export const UserModel = model<IUserDocument>('User', userSchema);

// Discriminator models
export const ClientUserModel = UserModel.discriminator<IClientUserDocument>('CLIENT', clientUserSchema);
export const ProviderUserModel = UserModel.discriminator<IProviderUserDocument>('PROVIDER', providerUserSchema);

// Type guards for runtime type checking
export function isClientUser(user: IUserDocument): user is IClientUserDocument {
  return user.type === 'CLIENT';
}

export function isProviderUser(user: IUserDocument): user is IProviderUserDocument {
  return user.type === 'PROVIDER';
}