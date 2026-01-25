import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@constants';
import type {
  GetRecentQuickChecksResponse,
  GetRecentMachineEventsResponse,
} from '@packages/contracts';

/**
 * Dashboard Service - Sprint #12 (Bundle 12)
 * 
 * Servicios para obtener datos de actividad reciente en el dashboard.
 * Soporta paginación incremental estilo "Load More".
 * 
 * Endpoints:
 * - GET /api/v1/dashboard/recent-quickchecks
 * - GET /api/v1/dashboard/recent-events
 */

export const dashboardService = {
  /**
   * Obtiene los QuickChecks más recientes de todas las máquinas del usuario
   * 
   * @param limit - Cantidad de registros a obtener (default 5, max 50)
   * @param offset - Offset para paginación "Ver más" (default 0)
   * @returns Promise con QuickChecks enriquecidos + metadata de paginación
   * 
   * @example
   * // Primera carga
   * const initialData = await dashboardService.getRecentQuickChecks(5, 0);
   * 
   * // Cargar más (botón "Ver más")
   * const moreData = await dashboardService.getRecentQuickChecks(5, 5);
   */
  getRecentQuickChecks: async (
    limit: number = 5,
    offset: number = 0
  ): Promise<GetRecentQuickChecksResponse> => {
    const response = await apiClient.get<GetRecentQuickChecksResponse>(
      API_ENDPOINTS.DASHBOARD_RECENT_QUICKCHECKS,
      {
        limit: limit.toString(),
        offset: offset.toString(),
      }
    );

    // El backend devuelve los datos directamente, sin wrapper
    return response.data || {
      data: [],
      total: 0,
      limit,
      offset,
      hasMore: false,
    };
  },

  /**
   * Obtiene los eventos de máquina más recientes del usuario
   * 
   * @param limit - Cantidad de registros a obtener (default 5, max 50)
   * @param offset - Offset para paginación "Ver más" (default 0)
   * @returns Promise con eventos enriquecidos + metadata de paginación
   * 
   * @example
   * // Primera carga
   * const initialData = await dashboardService.getRecentEvents(5, 0);
   * 
   * // Cargar más (botón "Ver más")
   * const moreData = await dashboardService.getRecentEvents(5, 5);
   */
  getRecentEvents: async (
    limit: number = 5,
    offset: number = 0
  ): Promise<GetRecentMachineEventsResponse> => {
    const response = await apiClient.get<GetRecentMachineEventsResponse>(
      API_ENDPOINTS.DASHBOARD_RECENT_EVENTS,
      {
        limit: limit.toString(),
        offset: offset.toString(),
      }
    );

    // El backend devuelve los datos directamente, sin wrapper
    return response.data || {
      data: [],
      total: 0,
      limit,
      offset,
      hasMore: false,
    };
  },

  // Future: Dashboard summary stats
  /**
   * TODO: Obtiene estadísticas agregadas del dashboard
   * 
   * Purpose: Single request para múltiples métricas (total máquinas, QuickChecks hoy, etc.)
   * Endpoint: GET /api/v1/dashboard/summary-stats
   * 
   * getDashboardStats: async (): Promise<DashboardStatsResponse> => {
   *   const response = await apiClient.request<DashboardStatsResponse>(
   *     '/api/v1/dashboard/summary-stats',
   *     { method: 'GET' }
   *   );
   *   return response.data;
   * },
   */

  // Future: Compliance rate
  /**
   * TODO: Obtiene tasa de cumplimiento de QuickChecks
   * 
   * Purpose: KPI de compliance por período (daily/weekly/monthly)
   * Endpoint: GET /api/v1/dashboard/compliance-rate?period=weekly
   * 
   * getComplianceRate: async (period: 'daily' | 'weekly' | 'monthly'): Promise<ComplianceRateResponse> => {
   *   const response = await apiClient.request<ComplianceRateResponse>(
   *     '/api/v1/dashboard/compliance-rate',
   *     { method: 'GET', params: { period } }
   *   );
   *   return response.data;
   * },
   */
};
