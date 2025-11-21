import { Schema, model, Document, type Types } from 'mongoose';
import { type IMachineEvent } from '@packages/domain';

// =============================================================================
// MACHINE EVENT DOCUMENT INTERFACE
// =============================================================================

/**
 * MachineEvent Document interface extending domain IMachineEvent
 * Adds Mongoose-specific _id and document methods
 */
export interface IMachineEventDocument extends Omit<IMachineEvent, 'id'>, Document {
  _id: Types.ObjectId;
  id: string; // Virtual getter from _id
}

// =============================================================================
// MACHINE EVENT SCHEMA DEFINITION
// =============================================================================

/**
 * MachineEvent Schema implementing IMachineEvent interface
 */
const machineEventSchema = new Schema<IMachineEventDocument>({
  machineId: {
    type: String,
    required: true,
    ref: 'Machine'
  },
  
  createdBy: {
    type: String,
    required: true,
    ref: 'User'
  },
  
  typeId: {
    type: String,
    required: true,
    ref: 'MachineEventType'
  },
  
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  metadata: {
    additionalInfo: {
      type: Schema.Types.Mixed,
      default: {}
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  
  isSystemGenerated: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'machine_events'
});

// Virtual for id
machineEventSchema.virtual('id').get(function(this: IMachineEventDocument) {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
machineEventSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc: any, ret: any) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Compound indexes for performance
machineEventSchema.index({ machineId: 1, createdAt: -1 });
machineEventSchema.index({ createdBy: 1, createdAt: -1 });
machineEventSchema.index({ typeId: 1, machineId: 1 });
machineEventSchema.index({ isSystemGenerated: 1, createdAt: -1 });
machineEventSchema.index({ machineId: 1, isSystemGenerated: 1, createdAt: -1 });

// Text index for search functionality
machineEventSchema.index({
  title: 'text',
  description: 'text',
  'metadata.notes': 'text'
});

// =============================================================================
// MODEL EXPORT
// =============================================================================

export const MachineEventModel = model<IMachineEventDocument>('MachineEvent', machineEventSchema);