import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../../constants';
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
 * Sprint #11: Connected to real backend API endpoints
 * 
 * Alarms are hour-based triggers that automatically create events + notifications
 * when machine.operatingHours reaches (lastTriggeredHours + intervalHours).
 * 
 * Pattern: Embedded subdocument (stored in Machine.maintenanceAlarms array)
 * Backend: Cronjob checks daily and triggers alarms
 * 
 * API Endpoints:
 * - GET /api/v1/machines/:machineId/maintenance-alarms?onlyActive=boolean
 * - POST /api/v1/machines/:machineId/maintenance-alarms
 * - PATCH /api/v1/machines/:machineId/maintenance-alarms/:alarmId
 * - DELETE /api/v1/machines/:machineId/maintenance-alarms/:alarmId
 */

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
    console.log('[maintenanceAlarmService.getMaintenanceAlarms] Fetching alarms:', {
      machineId,
      onlyActive,
    });

    const params: Record<string, string> = {};
    if (onlyActive) {
      params.onlyActive = 'true';
    }

    const response = await apiClient.get<{ 
      success: boolean; 
      message?: string; 
      data: GetMaintenanceAlarmsResponse | MaintenanceAlarm[]; // Support both formats during transition
    }>(
      API_ENDPOINTS.MAINTENANCE_ALARMS(machineId),
      params
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch maintenance alarms');
    }

    const responseData = response.data.data;

    // Handle both response formats:
    // New format: { alarms: [...], total: number, activeCount: number }
    // Old format: [...] (array directly)
    if (Array.isArray(responseData)) {
      // Old format - transform to new format
      console.warn('[maintenanceAlarmService] Received old format (array), transforming to new format');
      const alarms = responseData;
      return {
        alarms,
        total: alarms.length,
        activeCount: alarms.filter(a => a.isActive).length,
      };
    }

    // New format - return as is
    return responseData;
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
    console.log('[maintenanceAlarmService.createMaintenanceAlarm] Creating alarm:', {
      machineId,
      alarmData,
    });

    const response = await apiClient.post<{ 
      success: boolean; 
      message?: string; 
      data: MaintenanceAlarm 
    }>(
      API_ENDPOINTS.MAINTENANCE_ALARMS(machineId),
      alarmData
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create maintenance alarm');
    }

    return response.data.data;
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
    console.log('[maintenanceAlarmService.updateMaintenanceAlarm] Updating alarm:', {
      machineId,
      alarmId,
      alarmData,
    });

    const response = await apiClient.patch<{ 
      success: boolean; 
      message?: string; 
      data: MaintenanceAlarm 
    }>(
      API_ENDPOINTS.MAINTENANCE_ALARM(machineId, alarmId),
      alarmData
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update maintenance alarm');
    }

    return response.data.data;
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
    console.log('[maintenanceAlarmService.deleteMaintenanceAlarm] Deleting alarm:', {
      machineId,
      alarmId,
    });

    const response = await apiClient.delete(
      API_ENDPOINTS.MAINTENANCE_ALARM(machineId, alarmId)
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete maintenance alarm');
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
