import { apiClient } from './apiClient';
import type { 
  CreateSparePartRequest,
  UpdateSparePartRequest,
  CreateSparePartResponse,
  GetSparePartResponse,
  ListSparePartsResponse,
  UpdateSparePartResponse,
  DeleteSparePartResponse,
} from '@contracts';

// =============================================================================
// API ENDPOINTS - Centralized URL constants for maintenance
// =============================================================================
// TODO (Future): Move to shared constants file when refactoring all services
const SPARE_PARTS_ENDPOINTS = {
  // RESTful nested routes under /machines/:machineId
  list: (machineId: string) => `/machines/${machineId}/spare-parts`,
  create: (machineId: string) => `/machines/${machineId}/spare-parts`,
  detail: (machineId: string, sparePartId: string) => `/machines/${machineId}/spare-parts/${sparePartId}`,
  update: (machineId: string, sparePartId: string) => `/machines/${machineId}/spare-parts/${sparePartId}`,
  delete: (machineId: string, sparePartId: string) => `/machines/${machineId}/spare-parts/${sparePartId}`,
} as const;

/**
 * Spare Part Service
 * 
 * Provides API methods for managing spare parts (independent entities with machineId reference).
 * Sprint #15/16 Task 7.1: Connected to real backend API endpoints
 * 
 * Spare parts are inventory items tracked per machine with:
 * - name: Part identification (2-200 chars)
 * - serialId: Unique serial number per machine (1-100 chars)
 * - amount: Quantity in stock (integer >= 0)
 * - machineId: Reference to parent machine (immutable after creation)
 * 
 * Pattern: Independent entity (NOT subdocument, unlike MaintenanceAlarm)
 * Backend: Owner-only access control enforced via JWT
 * 
 * RESTful API Endpoints (Nested under /machines/:machineId):
 * - GET /api/machines/:machineId/spare-parts - List all parts for machine
 * - POST /api/machines/:machineId/spare-parts - Create new part
 * - GET /api/machines/:machineId/spare-parts/:id - Get single part
 * - PATCH /api/machines/:machineId/spare-parts/:id - Update part
 * - DELETE /api/machines/:machineId/spare-parts/:id - Delete part
 * - GET /api/spare-parts/:id - Get single part details
 * - PATCH /api/spare-parts/:id - Update part (machineId immutable)
 * - DELETE /api/spare-parts/:id - Delete part permanently
 */

class SparePartService {
  /**
   * Get all spare parts for a machine
   * @param machineId - Machine UUID
   * @returns Promise with parts list
   */
  async getSpareParts(machineId: string): Promise<ListSparePartsResponse> {
    console.log('[sparePartService.getSpareParts] Fetching spare parts:', {
      machineId,
    });

    const response = await apiClient.get<ListSparePartsResponse>(
      SPARE_PARTS_ENDPOINTS.list(machineId)
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch spare parts');
    }

    return response.data;
  }

  /**
   * Get single spare part by ID
   * @param machineId - Machine UUID (for RESTful route)
   * @param sparePartId - Spare part UUID
   * @returns Promise with part details
   */
  async getSparePartById(machineId: string, sparePartId: string): Promise<GetSparePartResponse> {
    console.log('[sparePartService.getSparePartById] Fetching spare part:', {
      machineId,
      sparePartId,
    });

    const response = await apiClient.get<GetSparePartResponse>(
      SPARE_PARTS_ENDPOINTS.detail(machineId, sparePartId)
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch spare part');
    }

    return response.data;
  }

  /**
   * Create a new spare part
   * @param machineId - Machine UUID (from URL params, not body)
   * @param sparePartData - Spare part creation data (name, serialId, amount)
   * @returns Promise with created part
   */
  async createSparePart(
    machineId: string,
    sparePartData: Omit<CreateSparePartRequest, 'machineId'>
  ): Promise<CreateSparePartResponse> {
    console.log('[sparePartService.createSparePart] Creating spare part:', {
      machineId,
      sparePartData,
    });

    const response = await apiClient.post<CreateSparePartResponse>(
      SPARE_PARTS_ENDPOINTS.create(machineId),
      sparePartData // machineId comes from URL, not body
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create spare part');
    }

    return response.data;
  }

  /**
   * Update a spare part
   * @param machineId - Machine UUID (for RESTful route)
   * @param sparePartId - Spare part UUID
   * @param updates - Partial update data (machineId cannot be changed)
   * @returns Promise with updated part
   */
  async updateSparePart(
    machineId: string,
    sparePartId: string,
    updates: UpdateSparePartRequest
  ): Promise<UpdateSparePartResponse> {
    console.log('[sparePartService.updateSparePart] Updating spare part:', {
      machineId,
      sparePartId,
      updates,
    });

    const response = await apiClient.patch<UpdateSparePartResponse>(
      SPARE_PARTS_ENDPOINTS.update(machineId, sparePartId),
      updates
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update spare part');
    }

    return response.data;
  }

  /**
   * Delete a spare part permanently
   * @param machineId - Machine UUID (for RESTful route)
   * @param sparePartId - Spare part UUID
   * @returns Promise with success message
   */
  async deleteSparePart(machineId: string, sparePartId: string): Promise<DeleteSparePartResponse> {
    console.log('[sparePartService.deleteSparePart] Deleting spare part:', {
      machineId,
      sparePartId,
    });

    const response = await apiClient.delete<DeleteSparePartResponse>(
      SPARE_PARTS_ENDPOINTS.delete(machineId, sparePartId)
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to delete spare part');
    }

    return response.data;
  }

  // 🔮 POST-MVP: Strategic methods (commented for future implementation)
  
  /**
   * TODO (v0.0.2): Get low stock spare parts
   * Useful for proactive inventory management
   * @param machineId - Machine UUID
   * @param threshold - Minimum amount to consider low stock
   * @returns Promise with low stock parts list
   */
  // async getLowStockParts(machineId: string, threshold: number = 5): Promise<ListSparePartsResponse> {
  //   const response = await apiClient.get<{ success: boolean; data: ListSparePartsResponse }>(
  //     `${API_ENDPOINTS.SPARE_PARTS}/machine/${machineId}/low-stock?threshold=${threshold}`
  //   );
  //   
  //   if (!response.success || !response.data) {
  //     throw new Error(response.error || 'Failed to fetch low stock parts');
  //   }
  //   
  //   return response.data.data;
  // }

  /**
   * TODO (v0.0.3): Bulk update spare parts
   * Useful for adjusting inventory after maintenance
   * @param updates - Array of {sparePartId, amount} updates
   * @returns Promise with updated parts count
   */
  // async bulkUpdateAmounts(updates: Array<{ sparePartId: string; amount: number }>): Promise<{ updated: number }> {
  //   const response = await apiClient.patch<{ success: boolean; data: { updated: number } }>(
  //     `${API_ENDPOINTS.SPARE_PARTS}/bulk-update`,
  //     { updates }
  //   );
  //   
  //   if (!response.success || !response.data) {
  //     throw new Error(response.error || 'Failed to bulk update');
  //   }
  //   
  //   return response.data.data;
  // }

  /**
   * TODO (v0.0.4): Export spare parts to CSV
   * Useful for external inventory management systems
   * @param machineId - Machine UUID
   * @returns Promise with CSV blob
   */
  // async exportToCSV(machineId: string): Promise<Blob> {
  //   const response = await fetch(`${API_ENDPOINTS.SPARE_PARTS}/machine/${machineId}/export`, {
  //     headers: { Authorization: `Bearer ${getAuthToken()}` }
  //   });
  //   
  //   if (!response.ok) {
  //     throw new Error('Failed to export spare parts');
  //   }
  //   
  //   return response.blob();
  // }
}

export const sparePartService = new SparePartService();
