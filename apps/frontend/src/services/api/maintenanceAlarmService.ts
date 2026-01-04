import type { 
  MaintenanceAlarm,
  CreateMaintenanceAlarmRequest,
  UpdateMaintenanceAlarmRequest,
  GetMaintenanceAlarmsResponse,
} from '@contracts';

/**
 * Maintenance Alarm Service
 * 
 * Provides API methods for managing maintenance alarms (subdocuments within machines).
 * Sprint #11: Mock implementation for UI development
 * 
 * Alarms are hour-based triggers that automatically create events + notifications
 * when machine.operatingHours reaches (lastTriggeredHours + intervalHours).
 * 
 * Pattern: Embedded subdocument (stored in Machine.maintenanceAlarms array)
 * Backend: Cronjob checks daily and triggers alarms
 * 
 * TODO Sprint #12: Replace mock data with real API calls to:
 * - POST /api/machines/:machineId/maintenance-alarms
 * - GET /api/machines/:machineId/maintenance-alarms?onlyActive=true
 * - PATCH /api/machines/:machineId/maintenance-alarms/:alarmId
 * - DELETE /api/machines/:machineId/maintenance-alarms/:alarmId (soft delete)
 */

// ============================================
// MOCK DATA for Sprint #11 UI Development
// ============================================

const MOCK_ALARMS: MaintenanceAlarm[] = [
  {
    id: 'alarm_1',
    title: 'Cambiar filtros de aceite y aire',
    description: 'Mantenimiento preventivo esencial para prolongar vida del motor',
    relatedParts: ['Filtro de Aceite', 'Filtro de Aire', 'Aceite Motor 15W-40'],
    intervalHours: 500,
    isActive: true,
    createdBy: 'user_client_1',
    createdAt: new Date('2025-12-01T10:00:00Z'),
    updatedAt: new Date('2025-12-01T10:00:00Z'),
    lastTriggeredAt: new Date('2025-11-15T14:30:00Z'),
    lastTriggeredHours: 1500,
    timesTriggered: 3,
  },
  {
    id: 'alarm_2',
    title: 'Revisión de sistema hidráulico',
    description: 'Inspeccionar mangueras, sellos y nivel de fluido hidráulico',
    relatedParts: ['Fluido Hidráulico', 'Kit de Sellos'],
    intervalHours: 250,
    isActive: true,
    createdBy: 'user_client_1',
    createdAt: new Date('2025-12-05T08:00:00Z'),
    updatedAt: new Date('2025-12-05T08:00:00Z'),
    lastTriggeredAt: new Date('2025-12-20T16:45:00Z'),
    lastTriggeredHours: 1750,
    timesTriggered: 7,
  },
  {
    id: 'alarm_3',
    title: 'Lubricación de cadenas y rodamientos',
    description: 'Aplicar grasa en puntos de lubricación según manual del fabricante',
    relatedParts: ['Grasa Multiuso', 'Aceite Penetrante'],
    intervalHours: 100,
    isActive: true,
    createdBy: 'user_client_1',
    createdAt: new Date('2025-11-20T12:00:00Z'),
    updatedAt: new Date('2025-11-20T12:00:00Z'),
    lastTriggeredAt: new Date('2025-12-28T09:15:00Z'),
    lastTriggeredHours: 1900,
    timesTriggered: 19,
  },
  {
    id: 'alarm_4',
    title: 'Inspección de sistema eléctrico',
    description: 'Revisar conexiones, fusibles y estado de batería',
    relatedParts: ['Fusibles', 'Limpiador de Contactos'],
    intervalHours: 1000,
    isActive: false, // Inactiva
    createdBy: 'user_client_1',
    createdAt: new Date('2025-10-10T15:30:00Z'),
    updatedAt: new Date('2025-12-22T11:20:00Z'),
    lastTriggeredAt: new Date('2025-11-01T10:00:00Z'),
    lastTriggeredHours: 1000,
    timesTriggered: 1,
  },
];

// Simular delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MaintenanceAlarmService {
  /**
   * Get all maintenance alarms for a machine
   * @param machineId - Machine UUID
   * @param onlyActive - Filter only active alarms (default: false)
   * @returns Promise with alarms list
   */
  async getMaintenanceAlarms(
    machineId: string,
    onlyActive: boolean = false
  ): Promise<GetMaintenanceAlarmsResponse> {
    await delay(400); // Simular latencia de red

    console.log('[maintenanceAlarmService.getMaintenanceAlarms] Fetching alarms:', {
      machineId,
      onlyActive,
    });

    // Filtrar según query
    let alarms = [...MOCK_ALARMS];
    if (onlyActive) {
      alarms = alarms.filter(alarm => alarm.isActive);
    }

    const activeCount = MOCK_ALARMS.filter(a => a.isActive).length;

    return {
      alarms,
      total: alarms.length,
      activeCount,
    };
  }

  /**
   * Create a new maintenance alarm
   * @param machineId - Machine UUID
   * @param alarmData - Alarm creation data
   * @returns Promise with created alarm
   */
  async createMaintenanceAlarm(
    machineId: string,
    alarmData: CreateMaintenanceAlarmRequest
  ): Promise<MaintenanceAlarm> {
    await delay(600);

    console.log('[maintenanceAlarmService.createMaintenanceAlarm] Creating alarm:', {
      machineId,
      alarmData,
    });

    // Simular creación
    const newAlarm: MaintenanceAlarm = {
      id: `alarm_${Date.now()}`,
      ...alarmData,
      createdBy: 'user_client_1', // Mock user
      createdAt: new Date(),
      updatedAt: new Date(),
      timesTriggered: 0,
    };

    MOCK_ALARMS.push(newAlarm);

    return newAlarm;
  }

  /**
   * Update an existing maintenance alarm
   * @param machineId - Machine UUID
   * @param alarmId - Alarm subdocument ID
   * @param alarmData - Partial alarm update data
   * @returns Promise with updated alarm
   */
  async updateMaintenanceAlarm(
    machineId: string,
    alarmId: string,
    alarmData: UpdateMaintenanceAlarmRequest
  ): Promise<MaintenanceAlarm> {
    await delay(500);

    console.log('[maintenanceAlarmService.updateMaintenanceAlarm] Updating alarm:', {
      machineId,
      alarmId,
      alarmData,
    });

    // Simular actualización
    const alarmIndex = MOCK_ALARMS.findIndex(a => a.id === alarmId);
    if (alarmIndex === -1) {
      throw new Error(`Alarm ${alarmId} not found`);
    }

    const updatedAlarm: MaintenanceAlarm = {
      ...MOCK_ALARMS[alarmIndex],
      ...alarmData,
      updatedAt: new Date(),
    };

    MOCK_ALARMS[alarmIndex] = updatedAlarm;

    return updatedAlarm;
  }

  /**
   * Delete (soft delete) a maintenance alarm
   * @param machineId - Machine UUID
   * @param alarmId - Alarm subdocument ID
   * @returns Promise<void>
   */
  async deleteMaintenanceAlarm(
    machineId: string,
    alarmId: string
  ): Promise<void> {
    await delay(400);

    console.log('[maintenanceAlarmService.deleteMaintenanceAlarm] Deleting alarm:', {
      machineId,
      alarmId,
    });

    // Simular soft delete (set isActive = false)
    const alarmIndex = MOCK_ALARMS.findIndex(a => a.id === alarmId);
    if (alarmIndex !== -1) {
      MOCK_ALARMS[alarmIndex].isActive = false;
      MOCK_ALARMS[alarmIndex].updatedAt = new Date();
    }
  }

  // ============================================
  // POST-MVP: Strategic Features (Commented)
  // ============================================

  /**
   * Get alarm trigger history (events created by this alarm)
   * Useful for showing alarm effectiveness and maintenance patterns
   * 
   * @param machineId - Machine UUID
   * @param alarmId - Alarm subdocument ID
   * @returns Promise with MachineEvent[] filtered by alarm metadata
   * 
   * Implementation: Query MachineEvents with metadata.alarmId === alarmId
   */
  // async getAlarmHistory(machineId: string, alarmId: string): Promise<MachineEvent[]> { }

  /**
   * Bulk activate/deactivate alarms
   * Useful for seasonal machines (activate all alarms when season starts)
   * 
   * @param machineId - Machine UUID
   * @param alarmIds - Array of alarm IDs
   * @param isActive - New active state
   * @returns Promise<void>
   */
  // async bulkUpdateAlarmStatus(machineId: string, alarmIds: string[], isActive: boolean): Promise<void> { }

  /**
   * Clone alarm from one machine to another
   * Useful for fleet management (apply same maintenance schedule to all machines of same type)
   * 
   * @param sourceMachineId - Source machine UUID
   * @param alarmId - Alarm to clone
   * @param targetMachineIds - Array of target machine UUIDs
   * @returns Promise with created alarms
   */
  // async cloneAlarmToMachines(sourceMachineId: string, alarmId: string, targetMachineIds: string[]): Promise<MaintenanceAlarm[]> { }

  /**
   * Get alarm statistics
   * Useful for analytics dashboard (most triggered alarms, average interval, etc.)
   * 
   * @param machineId - Machine UUID
   * @returns Promise with alarm stats
   */
  // async getAlarmStatistics(machineId: string): Promise<AlarmStatistics> { }
}

export const maintenanceAlarmService = new MaintenanceAlarmService();
