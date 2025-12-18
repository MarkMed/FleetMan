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
 */
export interface IUserDocument extends Omit<IUser, 'id' | 'notifications'>, Document {
  _id: Types.ObjectId;
  id: string; // Virtual getter from _id
  passwordHash: string; // Only for persistence, not exposed in domain interfaces
  notifications?: Types.DocumentArray<INotificationSubdoc>; // Sprint #9 - Subdocument array
}

/**
 * Client User Document interface
 */
export interface IClientUserDocument extends Omit<IClientUser, 'id' | 'notifications'>, Document {
  _id: Types.ObjectId;
  id: string;
  passwordHash: string;
  notifications?: Types.DocumentArray<INotificationSubdoc>;
}

/**
 * Provider User Document interface
 */
export interface IProviderUserDocument extends Omit<IProviderUser, 'id' | 'notifications'>, Document {
  _id: Types.ObjectId;
  id: string;
  passwordHash: string;
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
  }
}, { _id: true }); // Auto-generate _id for each notification

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
  notifications: [NotificationSubSchema]
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