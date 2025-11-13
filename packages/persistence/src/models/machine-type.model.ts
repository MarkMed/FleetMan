import { Schema, model, Document, type Types } from 'mongoose';
import { type IMachineType, type FuelType } from '@packages/domain';

// =============================================================================
// MACHINE TYPE DOCUMENT INTERFACE
// =============================================================================

/**
 * MachineType Document interface extending domain IMachineType
 * Adds Mongoose-specific _id and document methods
 */
export interface IMachineTypeDocument extends Omit<IMachineType, 'id'>, Document {
  _id: Types.ObjectId;
  id: string; // Virtual getter from _id
}

// =============================================================================
// MACHINE TYPE SCHEMA DEFINITION
// =============================================================================

/**
 * MachineType Schema implementing IMachineType interface
 */
const machineTypeSchema = new Schema<IMachineTypeDocument>({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  
  displayName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  description: {
    type: String,
    trim: true,
    sparse: true
  },
  
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  metadata: {
    color: {
      type: String,
      match: /^#[0-9A-F]{6}$/i, // Hex color validation
      sparse: true
    },
    icon: {
      type: String,
      trim: true,
      sparse: true
    },
    imageUrl: {
      type: String,
      trim: true,
      sparse: true
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true
    },
    requiresLicense: {
      type: Boolean,
      default: false,
      sparse: true
    },
    minimumOperatorLevel: {
      type: String,
      trim: true,
      sparse: true
    },
    defaultMaintenanceInterval: {
      type: Number,
      min: 1,
      sparse: true
    },
    defaultSpecs: {
      enginePowerRange: {
        min: {
          type: Number,
          min: 0,
          sparse: true
        },
        max: {
          type: Number,
          min: 0,
          sparse: true
        }
      },
      capacityRange: {
        min: {
          type: Number,
          min: 0,
          sparse: true
        },
        max: {
          type: Number,
          min: 0,
          sparse: true
        }
      },
      recommendedFuelType: {
        type: String,
        enum: ['DIESEL', 'GASOLINE', 'ELECTRIC', 'HYBRID'],
        sparse: true
      }
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'machine_types'
});

// Virtual for id
machineTypeSchema.virtual('id').get(function(this: IMachineTypeDocument) {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
machineTypeSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc: any, ret: any) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Indexes for performance
machineTypeSchema.index({ code: 1 }, { unique: true });
machineTypeSchema.index({ category: 1, isActive: 1 });
machineTypeSchema.index({ 'metadata.sortOrder': 1, displayName: 1 });
machineTypeSchema.index({ 'metadata.tags': 1 });

// Text index for search functionality
machineTypeSchema.index({
  code: 'text',
  displayName: 'text',
  description: 'text',
  category: 'text',
  'metadata.tags': 'text'
});

// =============================================================================
// VALIDATION MIDDLEWARE
// =============================================================================

// Validate engine power range
machineTypeSchema.pre('save', function(this: IMachineTypeDocument, next: any) {
  if (this.metadata?.defaultSpecs?.enginePowerRange) {
    const { min, max } = this.metadata.defaultSpecs.enginePowerRange;
    if (min !== undefined && max !== undefined && min > max) {
      throw new Error('Engine power range: min cannot be greater than max');
    }
  }
  
  if (this.metadata?.defaultSpecs?.capacityRange) {
    const { min, max } = this.metadata.defaultSpecs.capacityRange;
    if (min !== undefined && max !== undefined && min > max) {
      throw new Error('Capacity range: min cannot be greater than max');
    }
  }
  
  next();
});

// =============================================================================
// MODEL EXPORT
// =============================================================================

export const MachineTypeModel = model<IMachineTypeDocument>('MachineType', machineTypeSchema);