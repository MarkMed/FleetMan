import { Schema, model, Document, type Types } from 'mongoose';
import { 
  type IMachine, 
  type MachineStatusCode, 
  type FuelType,
  FUEL_TYPE, // SSOT const para enum validation
  type IQuickCheckRecord,
  type QuickCheckItemResult,
  type QuickCheckResult,
  DayOfWeek
} from '@packages/domain';

// =============================================================================
// MACHINE DOCUMENT INTERFACE
// =============================================================================

/**
 * Machine Document interface extending domain IMachine
 * Excluimos 'id' (usamos _id virtual) y 'model' (conflicto con Document.model de Mongoose)
 */
// Use a lightweight document type compatible with domain string IDs.
// We avoid forcing the Mongoose `Document` _id type (ObjectId) here because
// the domain produces string IDs like `machine_xxx` and we persist them as strings.
export interface IMachineDocument extends Omit<IMachine, 'id' | 'model'> {
  _id: string;
  id: string; // Virtual getter from _id
  modelName: string;
}

// =============================================================================
// MACHINE SCHEMA DEFINITION
// =============================================================================

/**
 * Machine Schema implementing IMachine interface
 */
const machineSchema = new Schema<IMachineDocument>({
  // Persist domain string IDs as the document _id (type: String)
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

  // [NUEVO] Persona asignada (temporal string)
  assignedTo: {
    type: String,
    trim: true,
    maxlength: 100,
    sparse: true
  },

  // [NUEVO] Programación de uso para cálculo de alertas
  usageSchedule: {
    type: {
      dailyHours: {
        type: Number,
        required: true,
        min: 1,
        max: 24
      },
      operatingDays: {
        type: [String],
        required: true,
        enum: Object.values(DayOfWeek), // SSOT: Usa el enum de domain
        validate: {
          validator: function(v: string[]) {
            // Al menos 1 día, máximo 7, sin duplicados
            return v.length > 0 && v.length <= 7 && new Set(v).size === v.length;
          },
          message: 'Must have 1-7 unique operating days'
        }
      },
      weeklyHours: {
        type: Number,
        required: true // Campo calculado requerido
      }
    },
    required: false,
    sparse: true
  },

  // [NUEVO] URL de foto de la máquina (preparación para Cloudinary)
  machinePhotoUrl: {
    type: String,
    trim: true,
    maxlength: 500,
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
      enum: Object.values(FUEL_TYPE), // SSOT: usar const de domain
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
  },

  // 🆕 Sprint #10: Machine Events embedded as subdocuments (like QuickCheck pattern)
  // Patrón: Embedded array (NO separate collection) para historial acotado ~300 eventos
  eventsHistory: [{
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
      trim: true,
      maxlength: 2000
    },
    createdBy: {
      type: String,
      required: true,
      ref: 'User'
    },
    isSystemGenerated: {
      type: Boolean,
      required: true,
      default: false
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
    createdAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  }],

  // 🆕 Sprint #11: Maintenance Alarms embedded as subdocuments (like QuickCheck/Events pattern)
  // Patrón: Embedded array (NO separate collection) para alarmas programadas
  maintenanceAlarms: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    relatedParts: {
      type: [String],
      required: true,
      default: [],
      validate: {
        validator: function(arr: string[]) {
          return arr.every(part => typeof part === 'string' && part.trim().length > 0);
        },
        message: 'All related parts must be non-empty strings'
      }
    },
    intervalHours: {
      type: Number,
      required: true,
      min: 1
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true
    },
    createdBy: {
      type: String,
      required: true,
      ref: 'User'
    },
    lastTriggeredAt: {
      type: Date
    },
    lastTriggeredHours: {
      type: Number,
      min: 0
    },
    timesTriggered: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  }],

  // QuickCheck records embedded as subdocuments
  quickChecks: [{
    result: {
      type: String,
      enum: ['approved', 'disapproved', 'notInitiated'],
      required: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    executedById: {
      type: String,
      required: true,
      ref: 'User'
    },
    responsibleName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    responsibleWorkerId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    quickCheckItems: [{
      name: {
        type: String,
        required: true,
        maxlength: 100
      },
      description: {
        type: String,
        maxlength: 500
      },
      result: {
        type: String,
        enum: ['approved', 'disapproved', 'omitted'],
        required: true
      }
    }],
    observations: {
      type: String,
      maxlength: 1000
    }
  }]
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'machines'
});

// Virtual for id
machineSchema.virtual('id').get(function(this: any) {
  // Return the string _id for domain compatibility
  return String(this._id);
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

// 🆕 Sprint #10: Indexes para queries de eventsHistory (embedded array)
machineSchema.index({ 'eventsHistory.typeId': 1, 'eventsHistory.createdAt': -1 });
machineSchema.index({ 'eventsHistory.isSystemGenerated': 1, 'eventsHistory.createdAt': -1 });
machineSchema.index({ 'eventsHistory.createdBy': 1, 'eventsHistory.createdAt': -1 });

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
machineSchema.pre('save', function(this: any, next: any) {
  if (this.isModified && this.isModified('location.coordinates')) {
    // Use $set to update nested properties without readonly conflicts
    this.set('location.lastUpdated', new Date());
  }
  next();
});

// =============================================================================
// MODEL EXPORT
// =============================================================================

export const MachineModel = model<IMachineDocument>('Machine', machineSchema);