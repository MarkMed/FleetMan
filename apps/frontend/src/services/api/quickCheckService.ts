import { apiClient, handleBackendApiResponse } from './apiClient';
import { API_ENDPOINTS } from '../../constants';
import type { 
  CreateQuickCheckRecord,
  AddQuickCheckResponse,
  QuickCheckHistoryFilters,
  GetQuickCheckHistoryResponse,
  GetQuickCheckItemsTemplateResponse
} from '@contracts';

/**
 * QuickCheckService - API client for QuickCheck operations
 * 
 * Endpoints:
 * - POST /machines/:machineId/quickchecks - Add new QuickCheck record
 * - GET /machines/:machineId/quickchecks - Get QuickCheck history with filters
 * - GET /machines/:machineId/quickcheck/items-template - Get items template from last QuickCheck
 */
export class QuickCheckService {
  /**
   * Add new QuickCheck record to a machine
   * 
   * @param machineId - Target machine ID
   * @param record - QuickCheck record (without date and executedById - server generates them)
   * @param headers - Optional headers (e.g., Authorization)
   * @returns Promise with response including machineId, added record, and total count
   */
  async addQuickCheck(
    machineId: string,
    record: CreateQuickCheckRecord,
    headers?: Record<string, string>
  ): Promise<AddQuickCheckResponse> {
    const response = await apiClient.post<{ success: boolean; message: string; data: AddQuickCheckResponse }>(
      API_ENDPOINTS.MACHINE_QUICKCHECKS(machineId),
      record,
      headers
    );
    return handleBackendApiResponse(response);
  }

  /**
   * Get QuickCheck history for a machine
   * 
   * @param machineId - Target machine ID
   * @param filters - Optional filters (result, dateRange, executor, pagination)
   * @param headers - Optional headers (e.g., Authorization)
   * @returns Promise with history data (quickChecks array, total count, applied filters)
   */
  async getHistory(
    machineId: string,
    filters?: QuickCheckHistoryFilters,
    headers?: Record<string, string>
  ): Promise<GetQuickCheckHistoryResponse> {
    const response = await apiClient.get<{ success: boolean; message: string; data: GetQuickCheckHistoryResponse }>(
      API_ENDPOINTS.MACHINE_QUICKCHECKS(machineId),
      filters as any, // Query params
      headers
    );
    return handleBackendApiResponse(response);
  }

  /**
   * Get items template derived from last QuickCheck execution
   * 
   * Strategy: Backend extracts items (without result field) from the most recent QuickCheck.
   * Enables "continue where you left off" pattern - users can build on previous checklists.
   * Supports multi-device sync: changes from user A on device A visible to user B on device B.
   * 
   * @param machineId - Target machine ID
   * @param headers - Optional headers (e.g., Authorization)
   * @returns Promise with template data (uses contract type - SSOT)
   */
  async getItemsTemplate(
    machineId: string,
    headers?: Record<string, string>
  ): Promise<GetQuickCheckItemsTemplateResponse['data']> {
    const response = await apiClient.get<{ success: boolean; message: string; data: GetQuickCheckItemsTemplateResponse['data'] }>(
      `/machines/${machineId}/quickcheck/items-template`,
      undefined,
      headers
    );
    return handleBackendApiResponse(response);
  }
}

// Export singleton instance
export const quickCheckService = new QuickCheckService();
