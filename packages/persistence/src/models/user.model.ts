import { Schema, model, Document, type Types } from 'mongoose';
import { 
  type IUser, 
  type IClientUser, 
  type IProviderUser,
  type UserType,
  type SubscriptionLevel
} from '@packages/domain';

// =============================================================================
// USER DOCUMENT INTERFACES
// =============================================================================

/**
 * Base User Document interface extending domain IUser
 * Adds Mongoose-specific _id, document methods, and passwordHash for persistence
 */
export interface IUserDocument extends Omit<IUser, 'id'>, Document {
  _id: Types.ObjectId;
  id: string; // Virtual getter from _id
  passwordHash: string; // Solo para persistencia, no expuesta en domain interfaces
}

/**
 * Client User Document interface
 */
export interface IClientUserDocument extends Omit<IClientUser, 'id'>, Document {
  _id: Types.ObjectId;
  id: string;
  passwordHash: string;
}

/**
 * Provider User Document interface
 */
export interface IProviderUserDocument extends Omit<IProviderUser, 'id'>, Document {
  _id: Types.ObjectId;
  id: string;
  passwordHash: string;
}

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