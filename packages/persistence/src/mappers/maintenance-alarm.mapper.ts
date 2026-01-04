/**
 * Maintenance Alarm Mapper
 * 
 * Convierte entre subdocumentos Mongoose y interfaces de dominio
 * Patrón: Similar a MachineEventMapper (subdocument mapper, NO entity mapper)
 * 
 * NOTA: MaintenanceAlarm NO es entidad independiente en persistencia (está embedded en Machine)
 * Por lo tanto, el mapper trabaja con IMaintenanceAlarm (interface), NO con MaintenanceAlarm (entity)
 * 
 * Sprint #11: Cronjob - Maintenance Alarms System
 */

import { type IMaintenanceAlarm } from '@packages/domain';
import { type Types } from 'mongoose';

// =============================================================================
// SUBDOCUMENT INTERFACE
// =============================================================================

/**
 * Subdocumento de MaintenanceAlarm en Mongoose
 * Representa una alarma de mantenimiento dentro de Machine.maintenanceAlarms[]
 */
export interface IMaintenanceAlarmSubdoc {
  _id: Types.ObjectId; // Auto-generado por Mongoose
  title: string;
  description?: string;
  relatedParts: string[];
  intervalHours: number;
  accumulatedHours: number; // 🆕 NUEVO: Accumulator pattern field
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastTriggeredAt?: Date;
  lastTriggeredHours?: number; // ⚠️ DEPRECATED - mantener para compatibilidad
  timesTriggered: number;
}

// =============================================================================
// MAPPER CLASS
// =============================================================================

export class MaintenanceAlarmMapper {
  /**
   * Convierte subdocumento Mongoose → Domain interface
   * Usado al leer alarmas de Machine.maintenanceAlarms[]
   */
  static toDomain(doc: IMaintenanceAlarmSubdoc): IMaintenanceAlarm {
    // 🆕 DEBUG: Ver estructura del subdocumento
    // console.log('🔍 DEBUG: MaintenanceAlarmMapper.toDomain input:', {
    //   hasDoc: !!doc,
    //   docType: typeof doc,
    //   docKeys: doc ? Object.keys(doc) : [],
    //   _id: doc?._id,
    //   title: doc?.title,
    //   intervalHours: doc?.intervalHours,
    //   accumulatedHours: doc?.accumulatedHours,
    //   isActive: doc?.isActive,
    //   fullDoc: doc
    // });

    const result = {
      id: doc._id.toString(), // ObjectId → string
      title: doc.title,
      description: doc.description,
      relatedParts: doc.relatedParts,
      intervalHours: doc.intervalHours,
      accumulatedHours: doc.accumulatedHours, // 🆕 NUEVO
      isActive: doc.isActive,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      lastTriggeredAt: doc.lastTriggeredAt,
      lastTriggeredHours: doc.lastTriggeredHours,
      timesTriggered: doc.timesTriggered
    };

    // console.log('🔍 DEBUG: MaintenanceAlarmMapper.toDomain output:', result);

    return result;
  }

  /**
   * Convierte array de subdocumentos
   * Usado al obtener todas las alarmas de una máquina
   */
  static toDomainArray(docs: IMaintenanceAlarmSubdoc[]): IMaintenanceAlarm[] {
    if (!docs || docs.length === 0) return [];
    return docs.map(doc => this.toDomain(doc));
  }

  /**
   * Convierte Domain interface → Estructura para MongoDB (sin _id, sin timestamps)
   * Usado al crear nueva alarma (Mongoose genera _id y createdAt automáticamente)
   */
  static toDocument(alarm: Partial<IMaintenanceAlarm>): Partial<IMaintenanceAlarmSubdoc> {
    return {
      title: alarm.title!,
      description: alarm.description,
      relatedParts: alarm.relatedParts ? [...alarm.relatedParts] : [], // Cast readonly to mutable for Mongoose
      intervalHours: alarm.intervalHours!,
      accumulatedHours: alarm.accumulatedHours !== undefined ? alarm.accumulatedHours : 0, // 🆕 NUEVO: Default 0
      isActive: alarm.isActive !== undefined ? alarm.isActive : true,
      createdBy: alarm.createdBy!,
      lastTriggeredAt: alarm.lastTriggeredAt,
      lastTriggeredHours: alarm.lastTriggeredHours,
      timesTriggered: alarm.timesTriggered || 0
      // _id, createdAt: Mongoose los genera automáticamente
    };
  }
}

// TODO: Implementar método para calcular próximo trigger
// Razón: Para cronjob que verifica qué alarmas deben dispararse
// Declaración: static calculateNextTrigger(alarm: IMaintenanceAlarm, currentHours: number): Date | null
// Uso: Si currentHours - lastTriggeredHours >= intervalHours → trigger()

// TODO: Implementar método de filtrado por proximidad
// Razón: Dashboard que muestre alarmas próximas a dispararse (ej: "faltan 10 horas")
// Declaración: static filterByProximity(alarms: IMaintenanceAlarm[], currentHours: number, hoursThreshold: number): IMaintenanceAlarm[]
// Ejemplo: filterByProximity(alarms, 1000, 50) → alarmas que se dispararán en las próximas 50 horas

// TODO: Implementar método de estadísticas de alarmas
// Razón: Analytics sobre qué alarmas se disparan más frecuentemente
// Declaración: static getStatistics(alarms: IMaintenanceAlarm[]): { mostTriggered: IMaintenanceAlarm, avgInterval: number, totalTriggers: number }
