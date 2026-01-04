import { 
  Machine, 
  MachineId, 
  SerialNumber, 
  UserId, 
  MachineTypeId,
  MachineStatusRegistry,
  UsageSchedule,
  type MachineSpecs,
  type MachineLocation,
  type IQuickCheckRecord,
  DayOfWeek
} from '@packages/domain';
import { type IMachineDocument } from '../models';

/**
 * Mapper para convertir entre documentos de Mongoose y entidades de dominio Machine
 */
export class MachineMapper {
  
  /**
   * Convierte un documento de Mongoose a entidad de dominio Machine
   * @param doc - Documento de Mongoose
   * @returns Entidad Machine o null si hay error
   */
  static toEntity(doc: IMachineDocument): Machine | null {
    try {
      // Obtener el estado correcto desde el registro
      const status = MachineStatusRegistry.getByCode(doc.status.code);
      if (!status) {
        console.error(`Invalid status code: ${doc.status.code}`);
        return null;
      }

      // Construir specs si existen
      const specs: MachineSpecs | undefined = doc.specs ? {
        enginePower: doc.specs.enginePower,
        maxCapacity: doc.specs.maxCapacity,
        fuelType: doc.specs.fuelType,
        year: doc.specs.year,
        weight: doc.specs.weight,
        operatingHours: doc.specs.operatingHours
      } : undefined;

      // Construir location si existe
      const location: MachineLocation | undefined = doc.location ? {
        siteName: doc.location.siteName,
        address: doc.location.address,
        coordinates: doc.location.coordinates ? {
          latitude: doc.location.coordinates.latitude,
          longitude: doc.location.coordinates.longitude
        } : undefined,
        lastUpdated: doc.location.lastUpdated
      } : undefined;

      // Mapear UsageSchedule si existe
      let usageSchedule: UsageSchedule | undefined;
      if (doc.usageSchedule) {
        const usageScheduleResult = UsageSchedule.create(
          doc.usageSchedule.dailyHours,
          doc.usageSchedule.operatingDays as readonly DayOfWeek[]
        );
        if (usageScheduleResult.success) {
          usageSchedule = usageScheduleResult.data;
        } else {
          console.error('Failed to create UsageSchedule:', usageScheduleResult.error.message);
          return null; // Fail fast - no crear entidad con datos inconsistentes
        }
      }

      // Crear la máquina con las propiedades mínimas requeridas
      const createResult = Machine.create({
        serialNumber: doc.serialNumber,
        brand: doc.brand,
        modelName: doc.modelName,
        machineTypeId: doc.machineTypeId,
        ownerId: doc.ownerId,
        createdById: doc.createdById,
        nickname: doc.nickname,
        specs,
        location,
        initialStatus: doc.status.code,
        assignedTo: doc.assignedTo,
        usageSchedule,
        machinePhotoUrl: doc.machinePhotoUrl
      });

      if (!createResult.success) {
        console.error('Failed to create Machine entity:', createResult.error.message);
        return null;
      }

      const machine = createResult.data;

      // Aplicar propiedades adicionales que no se manejan en create()
      // Usamos reflexión para acceder a las props privadas (solo en mapper)
      const machineAny = machine as any;
      
      // Asignar ID desde el documento (no generar uno nuevo)
      const idResult = MachineId.create(doc.id);
      if (idResult.success) {
        machineAny.props.id = idResult.data;
      }
      
      // Asignar proveedor si existe
      if (doc.assignedProviderId) {
        const providerIdResult = UserId.create(doc.assignedProviderId);
        if (providerIdResult.success) {
          machineAny.props.assignedProviderId = providerIdResult.data;
          machineAny.props.providerAssignedAt = doc.providerAssignedAt;
        }
      }

      // Asignar timestamps
      machineAny.props.createdAt = doc.createdAt;
      machineAny.props.updatedAt = doc.updatedAt;

      // Mapear quickChecks desde documento
      const quickChecks: IQuickCheckRecord[] = (doc.quickChecks || []).map(qc => ({
        result: qc.result,
        date: qc.date,
        executedById: qc.executedById,
        responsibleName: qc.responsibleName,
        responsibleWorkerId: qc.responsibleWorkerId,
        quickCheckItems: qc.quickCheckItems.map(item => ({
          name: item.name,
          description: item.description,
          result: item.result
        })),
        observations: qc.observations
      }));
      
      machineAny.props.quickChecks = quickChecks;

      // 🆕 Mapear maintenanceAlarms desde documento (Sprint #11)
      console.log('🔍 DEBUG: MachineMapper - doc.maintenanceAlarms:', {
        hasMaintenanceAlarms: !!doc.maintenanceAlarms,
        isArray: Array.isArray(doc.maintenanceAlarms),
        length: doc.maintenanceAlarms?.length,
        rawData: doc.maintenanceAlarms
      });

      const maintenanceAlarms = (doc.maintenanceAlarms || []).map((alarm: any) => {
        console.log('🔍 DEBUG: Mapping alarm:', {
          id: alarm._id?.toString(),
          title: alarm.title,
          intervalHours: alarm.intervalHours
        });

        return {
          id: alarm._id?.toString() || alarm.id,
          title: alarm.title,
          description: alarm.description,
          relatedParts: alarm.relatedParts || [],
          intervalHours: alarm.intervalHours,
          accumulatedHours: alarm.accumulatedHours || 0,
          isActive: alarm.isActive,
          createdBy: alarm.createdBy,
          createdAt: alarm.createdAt,
          updatedAt: alarm.updatedAt,
          lastTriggeredAt: alarm.lastTriggeredAt,
          lastTriggeredHours: alarm.lastTriggeredHours,
          timesTriggered: alarm.timesTriggered || 0
        };
      });

      console.log('🔍 DEBUG: Mapped maintenanceAlarms count:', maintenanceAlarms.length);
      
      machineAny.props.maintenanceAlarms = maintenanceAlarms;

      return machine;

    } catch (error) {
      console.error('Error mapping document to Machine entity:', error);
      return null;
    }
  }

  /**
   * Convierte una entidad Machine a documento de Mongoose (para crear o actualizar)
   * @param machine - Entidad de dominio
   * @returns Objeto para persistencia en MongoDB
   */
  static toDocument(machine: Machine): Partial<IMachineDocument> {
    const publicInterface = machine.toPublicInterface();

    return {
      serialNumber: publicInterface.serialNumber,
      brand: publicInterface.brand,
      modelName: publicInterface.modelName,
      nickname: publicInterface.nickname,
      machineTypeId: publicInterface.machineTypeId,
      ownerId: publicInterface.ownerId,
      createdById: publicInterface.createdById,
      assignedProviderId: publicInterface.assignedProviderId,
      providerAssignedAt: publicInterface.providerAssignedAt,
      assignedTo: publicInterface.assignedTo,
      usageSchedule: publicInterface.usageSchedule ? {
        dailyHours: publicInterface.usageSchedule.dailyHours,
        operatingDays: publicInterface.usageSchedule.operatingDays,
        weeklyHours: publicInterface.usageSchedule.weeklyHours
      } : undefined,
      machinePhotoUrl: publicInterface.machinePhotoUrl,
      status: {
        code: publicInterface.status.code,
        displayName: publicInterface.status.displayName,
        description: publicInterface.status.description,
        color: publicInterface.status.color,
        isOperational: publicInterface.status.isOperational
      },
      specs: publicInterface.specs ? {
        enginePower: publicInterface.specs.enginePower,
        maxCapacity: publicInterface.specs.maxCapacity,
        fuelType: publicInterface.specs.fuelType,
        year: publicInterface.specs.year,
        weight: publicInterface.specs.weight,
        operatingHours: publicInterface.specs.operatingHours
      } : undefined,
      location: publicInterface.location ? {
        siteName: publicInterface.location.siteName,
        address: publicInterface.location.address,
        coordinates: publicInterface.location.coordinates,
        lastUpdated: publicInterface.location.lastUpdated
      } : undefined,
      quickChecks: publicInterface.quickChecks?.map(qc => ({
        result: qc.result,
        date: qc.date,
        executedById: qc.executedById,
        responsibleName: qc.responsibleName,
        responsibleWorkerId: qc.responsibleWorkerId,
        quickCheckItems: qc.quickCheckItems.map(item => ({
          name: item.name,
          description: item.description,
          result: item.result
        })),
        observations: qc.observations
      })),
      createdAt: publicInterface.createdAt,
      updatedAt: publicInterface.updatedAt
    };
  }

  /**
   * Convierte un array de documentos a array de entidades
   * @param docs - Array de documentos
   * @returns Array de entidades (filtra nulls)
   */
  static toEntityArray(docs: IMachineDocument[]): Machine[] {
    return docs
      .map(doc => this.toEntity(doc))
      .filter((machine): machine is Machine => machine !== null);
  }
}
