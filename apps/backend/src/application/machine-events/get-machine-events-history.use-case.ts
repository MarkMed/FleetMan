import { MachineId } from '@packages/domain';
import { MachineRepository } from '@packages/persistence';
import { logger } from '../../config/logger.config';
import { type ListMachineEventsRequestSchema } from '@packages/contracts';
import { z } from 'zod';

type GetMachineEventsQuery = z.infer<typeof ListMachineEventsRequestSchema>;

/**
 * Use Case: Obtener historial de eventos de una máquina
 * 
 * Responsabilidades:
 * 1. Validar que la máquina existe
 * 2. Validar que el usuario tiene acceso (owner o provider asignado)
 * 3. Obtener historial filtrado y paginado desde repositorio
 * 4. Retornar resultados con metadata de paginación
 * 
 * Reglas de Acceso:
 * - CLIENT puede ver eventos de sus propias máquinas
 * - PROVIDER puede ver eventos de máquinas asignadas
 * 
 * Patrón:
 * - Thin wrapper (lógica en repositorio)
 * - Similar a GetQuickCheckHistoryUseCase
 * - Validación de acceso en use case, queries en repositorio
 */
export class GetMachineEventsHistoryUseCase {
  private machineRepository: MachineRepository;

  constructor() {
    this.machineRepository = new MachineRepository();
  }

  /**
   * Ejecuta el caso de uso de obtener historial de eventos
   * 
   * @param machineId - ID de la máquina
   * @param userId - ID del usuario solicitante (desde JWT)
   * @param filters - Filtros opcionales:
   *   - typeId: Filtrar por tipo de evento
   *   - isSystemGenerated: Solo eventos automáticos o manuales
   *   - startDate: Fecha inicio (inclusive)
   *   - endDate: Fecha fin (inclusive)
   *   - searchTerm: Búsqueda en título/descripción
   *   - page: Número de página (default: 1)
   *   - limit: Items por página (default: 20)
   * 
   * @returns Promise con historial paginado de eventos
   * @throws Error si máquina no existe o acceso denegado
   */
  async execute(
    machineId: string,
    userId: string,
    filters?: GetMachineEventsQuery
  ): Promise<{
    machineId: string;
    events: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    filters?: GetMachineEventsQuery;
  }> {
    logger.info({ 
      machineId, 
      userId,
      filters 
    }, 'Fetching machine events history');

    try {
      // 1. Validar formato de machineId
      const machineIdResult = MachineId.create(machineId);
      if (!machineIdResult.success) {
        throw new Error(`Invalid machine ID format: ${machineIdResult.error.message}`);
      }

      // 2. Validar que la máquina existe y que el usuario tiene acceso
      const machineResult = await this.machineRepository.findById(machineIdResult.data);
      if (!machineResult.success) {
        throw new Error(`Machine with ID ${machineId} not found`);
      }

      const machine = machineResult.data;

      // 3. Validar acceso del usuario
      const isOwner = machine.ownerId.getValue() === userId;
      const isAssignedProvider = machine.assignedProviderId?.getValue() === userId;

      if (!isOwner && !isAssignedProvider) {
        throw new Error('Access denied: you are not the owner or assigned provider');
      }

      // 4. Obtener historial filtrado desde repositorio
      const historyResult = await this.machineRepository.getEventsHistory(
        machineIdResult.data,
        filters
      );

      if (!historyResult.success) {
        throw new Error(`Failed to fetch events history: ${historyResult.error.message}`);
      }

      const { items: events, total, page, limit, totalPages } = historyResult.data;

      logger.info({ 
        machineId,
        eventsReturned: events.length,
        total,
        page
      }, '✅ Machine events history retrieved');

      return {
        machineId,
        events,
        total,
        page,
        limit,
        totalPages,
        filters
      };

    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        machineId,
        userId
      }, 'Failed to fetch machine events history');
      
      throw error;
    }
  }

  // ============================================================================
  // MÉTODOS ESTRATÉGICOS (Comentados para futuras features)
  // ============================================================================

  /**
   * TODO: Obtener estadísticas de eventos por período
   * 
   * @param machineId - ID de la máquina
   * @param userId - ID del usuario
   * @param period - Período de análisis ('7d', '30d', '90d', '1y')
   * @returns Promise con estadísticas agregadas
   * 
   * Propósito:
   * - Dashboard de insights de la máquina
   * - Visualizar tendencias y patrones
   * 
   * Estadísticas:
   * - Total eventos por tipo (top 5)
   * - Eventos automáticos vs manuales (%)
   * - Timeline de eventos (agrupados por día/semana/mes)
   * - Usuarios más activos reportando
   * 
   * Implementación:
   * async getEventStats(
   *   machineId: string,
   *   userId: string,
   *   period: '7d' | '30d' | '90d' | '1y'
   * ): Promise<{
   *   totalEvents: number;
   *   byType: { typeId: string; typeName: string; count: number }[];
   *   systemVsManual: { system: number; manual: number };
   *   timeline: { date: string; count: number }[];
   *   topReporters: { userId: string; userName: string; count: number }[];
   * }> {
   *   // Usar aggregation pipeline de MongoDB
   *   // Agrupar, contar, proyectar
   * }
   */

  /**
   * TODO: Exportar historial de eventos (CSV, PDF)
   * 
   * @param machineId - ID de la máquina
   * @param userId - ID del usuario
   * @param format - Formato de exportación ('csv', 'pdf', 'json')
   * @param filters - Filtros para aplicar
   * @returns Promise con URL de descarga o buffer
   * 
   * Propósito:
   * - Auditoría externa (enviar a inspectores)
   * - Backup de historial
   * - Integración con otros sistemas
   * 
   * Implementación:
   * async exportHistory(
   *   machineId: string,
   *   userId: string,
   *   format: 'csv' | 'pdf' | 'json',
   *   filters?: GetMachineEventsQuery
   * ): Promise<{ downloadUrl: string } | { buffer: Buffer }> {
   *   // 1. Obtener todos los eventos (sin paginación)
   *   // 2. Generar archivo según formato
   *   // 3. Subir a storage (Azure Blob, S3) o retornar buffer
   *   // 4. Retornar URL temporal de descarga
   * }
   */

  /**
   * TODO: Comparar historiales de múltiples máquinas (Fleet Analysis)
   * 
   * @param machineIds - Array de IDs de máquinas
   * @param userId - ID del usuario
   * @param period - Período de análisis
   * @returns Promise con análisis comparativo
   * 
   * Propósito:
   * - Identificar máquinas problemáticas (muchos eventos de tipo "Rotura")
   * - Comparar rendimiento de flota
   * - Detectar patrones comunes
   * 
   * Caso de uso:
   * - Cliente tiene 10 excavadoras del mismo modelo
   * - Compara eventos de mantenimiento de todas
   * - Detecta que 2 tienen 3x más roturas que el resto
   * - Investiga causas (operador, condiciones, etc.)
   * 
   * Implementación:
   * async compareFleetEvents(
   *   machineIds: string[],
   *   userId: string,
   *   period: '30d' | '90d' | '1y'
   * ): Promise<{
   *   machines: Array<{
   *     machineId: string;
   *     totalEvents: number;
   *     criticalEvents: number;
   *     lastEventDate: Date;
   *   }>;
   *   insights: {
   *     mostProblematic: string[];
   *     leastProblematic: string[];
   *     commonIssues: string[];
   *   };
   * }> {
   *   // 1. Validar ownership de todas las máquinas
   *   // 2. Obtener eventos de todas en paralelo
   *   // 3. Agregar y comparar métricas
   *   // 4. Generar insights con ML básico
   * }
   */
}
