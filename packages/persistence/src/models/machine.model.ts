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
 * Excluimos 'id' (usamos _id virtual) y 'model' (conflicto con Document.model de Mongoose)
 */
export interface IMachineDocument extends Omit<IMachine, 'id' | 'model'>, Document {
  // Use string _id because domain entities use string IDs like `machine_xxx`
  _id: string;
  id: string; // Virtual getter from _id
  modelName: string; // Re-declaramos explícitamente para evitar conflicto con Document.model
}

// =============================================================================
// MACHINE SCHEMA DEFINITION
// =============================================================================

/**
 * Machine Schema implementing IMachine interface
 */
const machineSchema = new Schema<IMachineDocument>({
  // Explicit string _id to support domain-generated string identifiers
  _id: {
    type: String,
    required: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  
  brand: {
    type: String,
    required: true,
    trim: true
  },
  
  modelName: {
    type: String,
    required: true,
    trim: true
  },
  
  nickname: {
    type: String,
    trim: true,
    sparse: true
  },
  
  machineTypeId: {
    type: String,
    required: true,
    ref: 'MachineType'
  },
  
  ownerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  
  createdById: {
    type: String,
    required: true,
    ref: 'User'
  },
  
  assignedProviderId: {
    type: String,
    ref: 'User',
    sparse: true
  },
  
  providerAssignedAt: {
    type: Date,
    sparse: true
  },
  
  status: {
    code: {
      type: String,
      enum: ['ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'RETIRED'],
      required: true,
      default: 'ACTIVE'
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
      required: true
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
      sparse: true
    },
    year: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 2,
      sparse: true
    },
    weight: {
      type: Number,
      min: 0,
      sparse: true
    },
    operatingHours: {
      type: Number,
      min: 0,
      default: 0
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
      default: Date.now
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'machines'
});

// Virtual for id
machineSchema.virtual('id').get(function(this: IMachineDocument) {
  // _id is stored as string in this schema
  return this._id;
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
machineSchema.index({ brand: 1, modelName: 1 });

// GeoSpatial index for location-based queries
machineSchema.index({ 'location.coordinates': '2dsphere' });

// Text index for search functionality
machineSchema.index({
  serialNumber: 'text',
  brand: 'text',
  modelName: 'text',
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