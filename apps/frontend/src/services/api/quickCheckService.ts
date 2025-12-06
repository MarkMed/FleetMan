import { apiClient, handleApiResponse } from './apiClient';
import { API_ENDPOINTS } from '../../constants';
import type { 
  CreateQuickCheckRecord,
  AddQuickCheckResponse,
  QuickCheckHistoryFilters,
  GetQuickCheckHistoryResponse
} from '@contracts';

/**
 * QuickCheckService - API client for QuickCheck operations
 * 
 * Endpoints:
 * - POST /machines/:machineId/quickchecks - Add new QuickCheck record
 * - GET /machines/:machineId/quickchecks - Get QuickCheck history with filters
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
    const response = await apiClient.post<AddQuickCheckResponse>(
      API_ENDPOINTS.MACHINE_QUICKCHECKS(machineId),
      record,
      headers
    );
    return handleApiResponse(response);
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
    const response = await apiClient.get<GetQuickCheckHistoryResponse>(
      API_ENDPOINTS.MACHINE_QUICKCHECKS(machineId),
      filters as any, // Query params
      headers
    );
    return handleApiResponse(response);
  }
}

// Export singleton instance
export const quickCheckService = new QuickCheckService();
