import { Response } from 'express';
import { logger } from '../config/logger.config';
import {
  CreateMachineEventUseCase,
  GetMachineEventsHistoryUseCase
} from '../application/machine-events';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { DomainError } from '@packages/domain';

/**
 * MachineEventController handles Machine Event HTTP requests
 * 
 * Responsibilities:
 * - Call appropriate Use Cases
 * - Transform domain responses to HTTP responses
 * - Handle HTTP-specific concerns (status codes, headers)
 * - Map domain errors to HTTP status codes
 * - Validate ownership/access at controller level
 * 
 * Endpoints:
 * - POST   /machines/:machineId/events       - Create event
 * - GET    /machines/:machineId/events       - Get history (paginated + filters)
 * 
 * Patrón:
 * - Similar a QuickCheckController (subdocumento pattern)
 * - Ownership validation (owner o provider asignado)
 * - Zod validation en middleware
 */
export class MachineEventController {
  private createEventUseCase: CreateMachineEventUseCase;
  private getHistoryUseCase: GetMachineEventsHistoryUseCase;

  constructor() {
    this.createEventUseCase = new CreateMachineEventUseCase();
    this.getHistoryUseCase = new GetMachineEventsHistoryUseCase();
  }

  /**
   * POST /machines/:machineId/events
   * Crear nuevo evento de máquina (reportado por usuario)
   * 
   * Body (validated by Zod middleware):
   * - typeId?: string (ID de tipo existente)
   * - typeName?: string (nombre para crear nuevo tipo - crowdsourcing)
   * - title: string (3-200 chars)
   * - description?: string (10-2000 chars)
   * - metadata?: Record<string, any>
   * 
   * Authorization:
   * - Owner de la máquina
   * - Provider asignado a la máquina
   * 
   * Response:
   * - 201: Event created successfully
   * - 400: Validation error
   * - 403: Access denied
   * - 404: Machine not found
   * - 500: Server error
   */
  async createEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { machineId } = req.params;
      const userId = req.user!.userId;
      const eventData = req.body;

      logger.info({ 
        machineId, 
        userId,
        hasTypeId: !!eventData.typeId,
        hasTypeName: !!eventData.typeName
      }, 'Creating machine event');

      const result = await this.createEventUseCase.execute(
        machineId,
        userId,
        eventData,
        undefined, // actionUrl - usar default
        false // isSystemGenerated - eventos manuales reportados por usuarios
      );

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          eventId: result.eventId,
          machineId: result.machineId
        }
      });

    } catch (error) {
      const statusCode = this.mapErrorToHttpStatus(error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ 
        error: errorMessage,
        machineId: req.params.machineId,
        userId: req.user?.userId
      }, 'Failed to create machine event');

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: this.getErrorCode(error as Error)
      });
    }
  }

  /**
   * GET /machines/:machineId/events
   * Obtener historial de eventos de máquina (paginado + filtros)
   * 
   * Query params (validated by Zod middleware):
   * - typeId?: string (filtrar por tipo)
   * - isSystemGenerated?: boolean (filtrar automáticos vs manuales)
   * - startDate?: string (ISO date)
   * - endDate?: string (ISO date)
   * - searchTerm?: string (búsqueda en título/descripción)
   * - page?: number (default: 1)
   * - limit?: number (default: 20, max: 100)
   * 
   * Authorization:
   * - Owner de la máquina
   * - Provider asignado a la máquina
   * 
   * Response:
   * - 200: Events retrieved successfully
   * - 400: Invalid query params
   * - 403: Access denied
   * - 404: Machine not found
   * - 500: Server error
   */
  async getEventsHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { machineId } = req.params;
      const userId = req.user!.userId;
      const filters = req.query;

      logger.info({ 
        machineId, 
        userId,
        filters
      }, 'Fetching machine events history');

      const result = await this.getHistoryUseCase.execute(
        machineId,
        userId,
        filters as any // Zod middleware ya validó
      );

      res.status(200).json({
        success: true,
        message: `Retrieved ${result.events.length} events`,
        data: {
          events: result.events,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
          },
          filters: result.filters
        }
      });

    } catch (error) {
      const statusCode = this.mapErrorToHttpStatus(error as Error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ 
        error: errorMessage,
        machineId: req.params.machineId,
        userId: req.user?.userId
      }, 'Failed to fetch machine events history');

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: this.getErrorCode(error as Error)
      });
    }
  }

  /**
   * Map domain errors to HTTP status codes
   */
  private mapErrorToHttpStatus(error: Error): number {
    const message = error.message.toLowerCase();

    // 404 - Not Found
    if (message.includes('not found')) {
      return 404;
    }

    // 403 - Forbidden
    if (message.includes('access denied') || message.includes('permission')) {
      return 403;
    }

    // 400 - Bad Request
    if (
      message.includes('invalid') ||
      message.includes('validation') ||
      message.includes('must be provided')
    ) {
      return 400;
    }

    // 422 - Unprocessable Entity (domain validation)
    if (error instanceof DomainError) {
      return 422;
    }

    // 500 - Internal Server Error
    return 500;
  }

  /**
   * Get error code for client-side handling
   */
  private getErrorCode(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('not found')) return 'MACHINE_NOT_FOUND';
    if (message.includes('access denied')) return 'ACCESS_DENIED';
    if (message.includes('invalid machine id')) return 'INVALID_MACHINE_ID';
    if (message.includes('invalid user id')) return 'INVALID_USER_ID';
    if (message.includes('event type') && message.includes('not found')) return 'EVENT_TYPE_NOT_FOUND';
    if (message.includes('must be provided')) return 'MISSING_REQUIRED_FIELD';
    if (error instanceof DomainError) return 'DOMAIN_VALIDATION_ERROR';

    return 'INTERNAL_SERVER_ERROR';
  }

  // ============================================================================
  // MÉTODOS ESTRATÉGICOS (Comentados para futuras features)
  // ============================================================================

  /**
   * TODO: GET /machines/:machineId/events/:eventId - Obtener evento específico
   * 
   * Propósito:
   * - Ver detalles completos de un evento específico
   * - Incluir información enriquecida (tipo de evento, usuario que reportó, etc.)
   * - Útil para navegación desde notificaciones o links directos
   * 
   * async getEventById(req: AuthenticatedRequest, res: Response): Promise<void> {
   *   const { machineId, eventId } = req.params;
   *   const userId = req.user!.userId;
   *   
   *   // 1. Validar ownership/access
   *   // 2. Buscar evento específico en eventsHistory array
   *   // 3. Enriquecer con datos de MachineEventType
   *   // 4. Enriquecer con datos de User (createdBy)
   *   // 5. Retornar evento completo
   * }
   */

  /**
   * TODO: PATCH /machines/:machineId/events/:eventId - Editar evento
   * 
   * Propósito:
   * - Usuario corrige typos o agrega información faltante
   * - Solo eventos manuales (isSystemGenerated: false)
   * - Solo creador original puede editar (security)
   * 
   * Body:
   * - title?: string
   * - description?: string
   * - metadata?: Record<string, any>
   * 
   * Validaciones:
   * - Usuario debe ser el creador (createdBy === userId)
   * - Evento no debe ser systemGenerated
   * - Mantener auditoría (agregar updatedAt, updatedBy)
   * 
   * async updateEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
   *   // 1. Validar ownership y que sea el creador
   *   // 2. Validar que evento sea manual (no system)
   *   // 3. Actualizar campos permitidos
   *   // 4. Agregar metadata de auditoría
   *   // 5. Guardar cambios
   * }
   */

  /**
   * TODO: DELETE /machines/:machineId/events/:eventId - Eliminar evento
   * 
   * Propósito:
   * - Usuario eliminó evento creado por error
   * - Solo eventos manuales y recientes (<24h)
   * - Soft delete (marcar como deleted, no eliminar físicamente)
   * 
   * Validaciones:
   * - Usuario debe ser el creador
   * - Evento debe ser manual (no system)
   * - Evento debe ser reciente (createdAt < 24h)
   * - Admin puede eliminar cualquier evento (override)
   * 
   * async deleteEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
   *   // 1. Validar ownership y permisos
   *   // 2. Verificar que no sea system event
   *   // 3. Verificar que sea reciente o user sea admin
   *   // 4. Soft delete (agregar campo 'deleted: true' a metadata)
   *   // 5. Opcional: Decrementar timesUsed del tipo
   * }
   */

  /**
   * TODO: POST /machines/:machineId/events/bulk - Crear múltiples eventos
   * 
   * Propósito:
   * - Importar historial desde sistema legacy
   * - Usuario reporta múltiples eventos de una sesión (batch)
   * 
   * Body:
   * - events: Array<CreateMachineEventRequest>
   * 
   * Ventajas:
   * - 1 validación de ownership para todos
   * - 1 save() transaccional para todos
   * - Mejor performance que N requests individuales
   * 
   * async createBulkEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
   *   // 1. Validar ownership una vez
   *   // 2. Validar todos los eventos
   *   // 3. Obtener/crear tipos necesarios
   *   // 4. Agregar todos con 1 operación $push
   *   // 5. Incrementar contadores en batch
   *   // 6. Retornar summary
   * }
   */

  /**
   * TODO: GET /machines/:machineId/events/stats - Estadísticas de eventos
   * 
   * Propósito:
   * - Dashboard de insights de la máquina
   * - Visualizar patrones y tendencias
   * 
   * Query params:
   * - period: '7d' | '30d' | '90d' | '1y' | 'all'
   * 
   * Response:
   * - totalEvents: number
   * - byType: Array<{ typeId, typeName, count }>
   * - systemVsManual: { system: number, manual: number }
   * - timeline: Array<{ date, count }>
   * - topReporters: Array<{ userId, userName, count }>
   * 
   * async getEventStats(req: AuthenticatedRequest, res: Response): Promise<void> {
   *   // Usar aggregation pipeline
   *   // Agrupar por tipo, contar, proyectar
   *   // Generar timeline (bucket por día/semana/mes)
   * }
   */

  /**
   * TODO: GET /machines/:machineId/events/export - Exportar historial
   * 
   * Propósito:
   * - Auditoría externa (enviar a inspectores)
   * - Backup de historial
   * 
   * Query params:
   * - format: 'csv' | 'pdf' | 'json'
   * - filters: mismo que getEventsHistory
   * 
   * Response:
   * - Content-Type según formato
   * - Content-Disposition: attachment; filename="events-{machineId}-{date}.{ext}"
   * 
   * async exportHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
   *   // 1. Obtener todos los eventos (sin paginación)
   *   // 2. Generar archivo según formato
   *   // 3. Stream al cliente
   * }
   */
}
