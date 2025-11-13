import { Schema, model, Document, type Types } from 'mongoose';
import { type IMachine, type MachineStatusCode, type FuelType } from '@packages/domain';

// =============================================================================
// MACHINE DOCUMENT INTERFACE
// =============================================================================

// =============================================================================
// MACHINE DOCUMENT INTERFACE
// =============================================================================

/**
 * Machine Document interface extending domain IMachine
 * Uses intersection with Mongoose Document methods while preserving domain typing
 * Removes 'id' from domain interface and adds Mongoose-specific properties
 */
export interface IMachineDocument extends Omit<IMachine, 'id'> {
  _id: Types.ObjectId;
  id: string; // Virtual getter from _id
  
  // Mongoose document methods (manually added to avoid conflicts)
  save(): Promise<this>;
  isModified(path?: string): boolean;
  set(path: string, value: any): void;
  toObject(): any;
}

// =============================================================================
// MACHINE SCHEMA DEFINITION
// =============================================================================

/**
 * Machine Schema implementing IMachine interface
 */
const machineSchema = new Schema<IMachineDocument>({
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  
  brand: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  model: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  nickname: {
    type: String,
    trim: true,
    sparse: true
  },
  
  machineTypeId: {
    type: String,
    required: true,
    ref: 'MachineType',
    index: true
  },
  
  ownerId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  
  createdById: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  
  assignedProviderId: {
    type: String,
    ref: 'User',
    sparse: true,
    index: true
  },
  
  providerAssignedAt: {
    type: Date,
    sparse: true,
    index: true
  },
  
  status: {
    code: {
      type: String,
      enum: ['ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'RETIRED'],
      required: true,
      default: 'ACTIVE',
      index: true
    },
    displayName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true,
      match: /^#[0-9A-F]{6}$/i // Hex color validation
    },
    isOperational: {
      type: Boolean,
      required: true,
      index: true
    }
  },
  
  specs: {
    enginePower: {
      type: Number,
      min: 0,
      sparse: true
    },
    maxCapacity: {
      type: Number,
      min: 0,
      sparse: true
    },
    fuelType: {
      type: String,
      enum: ['DIESEL', 'GASOLINE', 'ELECTRIC', 'HYBRID'],
      sparse: true,
      index: true
    },
    year: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 2,
      sparse: true,
      index: true
    },
    weight: {
      type: Number,
      min: 0,
      sparse: true
    },
    operatingHours: {
      type: Number,
      min: 0,
      default: 0,
      index: true
    }
  },
  
  location: {
    siteName: {
      type: String,
      trim: true,
      sparse: true
    },
    address: {
      type: String,
      trim: true,
      sparse: true
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
        sparse: true
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
        sparse: true
      }
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
      index: true
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'machines'
});

// Virtual for id
machineSchema.virtual('id').get(function(this: IMachineDocument) {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
machineSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc: any, ret: any) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Compound indexes for performance
machineSchema.index({ ownerId: 1, 'status.code': 1 });
machineSchema.index({ assignedProviderId: 1, 'status.isOperational': 1 });
machineSchema.index({ machineTypeId: 1, 'status.code': 1 });
machineSchema.index({ serialNumber: 1 }, { unique: true });
machineSchema.index({ brand: 1, model: 1 });

// GeoSpatial index for location-based queries
machineSchema.index({ 'location.coordinates': '2dsphere' });

// Text index for search functionality
machineSchema.index({
  serialNumber: 'text',
  brand: 'text',
  model: 'text',
  nickname: 'text',
  'location.siteName': 'text',
  'location.address': 'text'
});

// =============================================================================
// MIDDLEWARE HOOKS
// =============================================================================

// Pre-save middleware to update location.lastUpdated when coordinates change
machineSchema.pre('save', function(this: IMachineDocument, next: any) {
  if (this.isModified('location.coordinates')) {
    // Use $set to update nested properties without readonly conflicts
    this.set('location.lastUpdated', new Date());
  }
  next();
});

// =============================================================================
// MODEL EXPORT
// =============================================================================

export const MachineModel = model<IMachineDocument>('Machine', machineSchema);