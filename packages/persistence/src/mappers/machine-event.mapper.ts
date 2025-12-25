/**
 * Machine Event Mapper
 * 
 * Convierte entre subdocumentos Mongoose y interfaces de dominio
 * Patrón: Similar a NotificationMapper (subdocument mapper, NO entity mapper)
 * 
 * NOTA: MachineEvent NO es entidad independiente en persistencia (está embedded en Machine)
 * Por lo tanto, el mapper trabaja con IMachineEvent (interface), NO con MachineEvent (entity)
 */

import { type IMachineEvent } from '@packages/domain';
import { type Types } from 'mongoose';

// =============================================================================
// SUBDOCUMENT INTERFACE
// =============================================================================

/**
 * Subdocumento de MachineEvent en Mongoose
 * Representa un evento dentro de Machine.eventsHistory[]
 */
export interface IMachineEventSubdoc {
  _id: Types.ObjectId; // Auto-generado por Mongoose
  typeId: string;
  title: string;
  description?: string;
  createdBy: string;
  isSystemGenerated: boolean;
  metadata?: {
    additionalInfo?: Record<string, any>;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// MAPPER CLASS
// =============================================================================

export class MachineEventMapper {
  /**
   * Convierte subdocumento Mongoose → Domain interface
   * Usado al leer eventos de Machine.eventsHistory[]
   */
  static toDomain(doc: IMachineEventSubdoc): IMachineEvent {
    return {
      id: doc._id.toString(), // ObjectId → string
      typeId: doc.typeId,
      title: doc.title,
      description: doc.description || '',
      createdBy: doc.createdBy,
      isSystemGenerated: doc.isSystemGenerated,
      metadata: doc.metadata ? {
        additionalInfo: doc.metadata.additionalInfo,
        notes: doc.metadata.notes
      } : undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  /**
   * Convierte array de subdocumentos
   * Usado al obtener historial completo
   */
  static toDomainArray(docs: IMachineEventSubdoc[]): IMachineEvent[] {
    if (!docs || docs.length === 0) return [];
    return docs.map(doc => this.toDomain(doc));
  }

  /**
   * Convierte Domain interface → Estructura para MongoDB (sin _id, sin timestamps)
   * Usado al crear nuevo evento (Mongoose genera _id y timestamps automáticamente)
   */
  static toDocument(event: Partial<IMachineEvent>): Partial<IMachineEventSubdoc> {
    return {
      typeId: event.typeId!,
      title: event.title!,
      description: event.description,
      createdBy: event.createdBy!,
      isSystemGenerated: event.isSystemGenerated || false,
      metadata: event.metadata ? {
        additionalInfo: event.metadata.additionalInfo,
        notes: event.metadata.notes
      } : undefined
      // _id, createdAt, updatedAt: Mongoose los genera automáticamente
    };
  }
}

// TODO: Implementar método de búsqueda por metadata
// Razón: Para queries complejas como "eventos con quickCheckResult: disapproved"
// Declaración: static filterByMetadata(events: IMachineEvent[], filter: Record<string, any>): IMachineEvent[]

// TODO: Implementar método de agrupación por tipo
// Razón: Para dashboard de analytics (ej: "10 QuickCheck, 5 Mantenimientos, 3 Reparaciones")
// Declaración: static groupByType(events: IMachineEvent[]): Map<string, IMachineEvent[]>
