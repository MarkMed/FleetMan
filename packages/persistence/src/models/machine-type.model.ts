
import { Schema, model, Document, type Types } from 'mongoose';
import { type IMachineType } from '@packages/domain';

/**
 * MachineType Document interface extending domain IMachineType
 * Excluimos 'id' (usamos _id virtual)
 */
export interface IMachineTypeDocument extends Omit<IMachineType, 'id'>, Document {
  _id: Types.ObjectId;
  id: string; // Virtual getter from _id
  name: string; // Re-declaramos explícitamente
  languages: string[]; // Re-declaramos explícitamente
}

// Esquema mínimo para MachineType
const machineTypeSchema = new Schema<IMachineTypeDocument>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  languages: {
    type: [String],
    required: true,
    default: [],
    validate: [(arr: string[]) => arr.length > 0, 'Debe tener al menos un idioma']
  }
}, {
  collection: 'machine_types',
  timestamps: true
});

// Virtual para id
machineTypeSchema.virtual('id').get(function (this: IMachineTypeDocument) {
  return (this as any)._id.toHexString();
});

// Serialización limpia
machineTypeSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc: any, ret: any) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Índice único y case-insensitive para name
machineTypeSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export const MachineTypeModel = model<IMachineTypeDocument>('MachineType', machineTypeSchema);