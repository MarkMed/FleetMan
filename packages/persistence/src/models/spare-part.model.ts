import { Schema, model, Document, type Types } from 'mongoose';
import { type ISparePart } from '@packages/domain';

/**
 * Spare Part Document interface extending domain ISparePart
 * Adds Mongoose-specific _id and document methods
 * 
 * Sprint #15/16 - Task 7.1: Alta/edición repuesto (RF-012/014)
 */
export interface ISparePartDocument extends Omit<ISparePart, 'id'>, Document {
  _id: Types.ObjectId;
  id: string; // Virtual getter from _id
}

/**
 * Spare Part Schema implementing ISparePart interface
 * 
 * Colección independiente con referencia a machineId
 * Estructura mínima v0.0.1: name, serialId, amount, machineId
 */
const sparePartSchema = new Schema<ISparePartDocument>({
  name: {
    type: String,
    required: [true, 'Spare part name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [200, 'Name must be 200 characters or less']
  },
  
  serialId: {
    type: String,
    required: [true, 'Serial ID is required'],
    trim: true,
    minlength: [1, 'Serial ID must be at least 1 character'],
    maxlength: [100, 'Serial ID must be 100 characters or less']
  },
  
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: 'Amount must be an integer'
    }
  },
  
  machineId: {
    type: String,
    required: [true, 'Machine ID is required'],
    ref: 'Machine',
    index: true // Index for fast queries by machine
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  collection: 'spare_parts'
});

// =============================================================================
// VIRTUALS
// =============================================================================

/**
 * Virtual for id (converts _id to string)
 */
sparePartSchema.virtual('id').get(function(this: ISparePartDocument) {
  return this._id.toHexString();
});

// =============================================================================
// SERIALIZATION
// =============================================================================

/**
 * Ensure virtual fields are serialized
 * Remove Mongoose-specific fields from JSON output
 */
sparePartSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc: any, ret: any) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// =============================================================================
// INDEXES
// =============================================================================

/**
 * Compound index for queries by machine
 * Optimizes: Find all spare parts for a specific machine, sorted by name
 */
sparePartSchema.index({ machineId: 1, name: 1 });

/**
 * Index for queries by serial ID within a machine
 * Optimizes: Find spare part by serial ID for a specific machine
 * Useful for preventing duplicate serial IDs per machine
 */
sparePartSchema.index({ machineId: 1, serialId: 1 });

/**
 * TODO (v0.0.2): Text index for search functionality
 * sparePartSchema.index({ 
 *   name: 'text', 
 *   serialId: 'text' 
 * }, {
 *   weights: { name: 2, serialId: 1 },
 *   name: 'spare_part_text_index'
 * });
 */

/**
 * TODO (v0.0.3): Index for low stock alerts
 * sparePartSchema.index({ amount: 1, machineId: 1 }, {
 *   partialFilterExpression: { amount: { $lte: 5 } }
 * });
 */

// =============================================================================
// EXPORT
// =============================================================================

export const SparePartModel = model<ISparePartDocument>('SparePart', sparePartSchema);
