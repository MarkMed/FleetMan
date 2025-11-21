import { Schema, model, Document, type Types } from 'mongoose';
import { type IMachineEventType } from '@packages/domain';

// =============================================================================
// MACHINE EVENT TYPE DOCUMENT INTERFACE
// =============================================================================

/**
 * MachineEventType Document interface extending domain IMachineEventType
 * Adds Mongoose-specific _id and document methods
 */
export interface IMachineEventTypeDocument extends Omit<IMachineEventType, 'id'>, Document {
  _id: Types.ObjectId;
  id: string; // Virtual getter from _id
}

// =============================================================================
// MACHINE EVENT TYPE SCHEMA DEFINITION
// =============================================================================

/**
 * MachineEventType Schema implementing IMachineEventType interface
 */
const machineEventTypeSchema = new Schema<IMachineEventTypeDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  normalizedName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  
  systemGenerated: {
    type: Boolean,
    required: true,
    default: false
  },
  
  createdBy: {
    type: String,
    ref: 'User',
    sparse: true
  },
  
  timesUsed: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  
  isActive: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'machine_event_types'
});

// Virtual for id
machineEventTypeSchema.virtual('id').get(function(this: IMachineEventTypeDocument) {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
machineEventTypeSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc: any, ret: any) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Indexes for performance
machineEventTypeSchema.index({ systemGenerated: 1, isActive: 1 });
machineEventTypeSchema.index({ createdBy: 1, isActive: 1 });
machineEventTypeSchema.index({ timesUsed: -1, isActive: 1 }); // Most used types first
machineEventTypeSchema.index({ isActive: 1, timesUsed: -1 });

// Text index for search functionality
machineEventTypeSchema.index({
  name: 'text',
  normalizedName: 'text'
});

// =============================================================================
// MIDDLEWARE HOOKS
// =============================================================================

// Pre-save middleware to auto-generate normalizedName from name
machineEventTypeSchema.pre('save', function(this: IMachineEventTypeDocument, next: any) {
  if (this.isModified('name') || this.isNew) {
    const normalized = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_'); // Replace spaces with underscores
    
    // Use $set to avoid readonly property assignment
    this.set('normalizedName', normalized);
  }
  next();
});

// =============================================================================
// STATIC METHODS
// =============================================================================

// Static method to increment usage count
machineEventTypeSchema.statics.incrementUsage = async function(typeId: string) {
  return this.findByIdAndUpdate(
    typeId,
    { $inc: { timesUsed: 1 } },
    { new: true }
  );
};

// =============================================================================
// MODEL EXPORT
// =============================================================================

export const MachineEventTypeModel = model<IMachineEventTypeDocument>('MachineEventType', machineEventTypeSchema);