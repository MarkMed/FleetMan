import { Response } from 'express';
import { logger } from '../config/logger.config';
import {
  CreateMachineEventTypeUseCase,
  SearchEventTypesUseCase,
  UpdateEventTypeUseCase
} from '../application/machine-events';
import { MachineEventTypeRepository } from '@packages/persistence';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import type { Request } from 'express';

/**
 * EventTypeController handles Machine Event Type HTTP requests
 * 
 * Responsibilities:
 * - CRUD de tipos de eventos
 * - Autocomplete/search para UI
 * - Listar tipos populares
 * - Patrón crowdsourcing (como MachineTypeController)
 * 
 * Endpoints:
 * - POST   /event-types              - Create type (crowdsourcing)
 * - GET    /event-types              - List types (paginated)
 * - GET    /event-types/search       - Search/autocomplete
 * - GET    /event-types/popular      - Most used types
 * 
 * Note:
 * - Search endpoint NO requiere autenticación (público para autocomplete)
 * - Create endpoint requiere autenticación (cualquier user autenticado puede crear)
 * - Delete/Update serían admin-only (futuro)
 */
export class EventTypeController {
  private createTypeUseCase: CreateMachineEventTypeUseCase;
  private searchTypesUseCase: SearchEventTypesUseCase;
  private updateTypeUseCase: UpdateEventTypeUseCase;
  private eventTypeRepository: MachineEventTypeRepository;

  constructor() {
    this.createTypeUseCase = new CreateMachineEventTypeUseCase();
    this.searchTypesUseCase = new SearchEventTypesUseCase();
    this.updateTypeUseCase = new UpdateEventTypeUseCase();
    this.eventTypeRepository = new MachineEventTypeRepository();
  }

  /**
   * POST /event-types
   * Crear nuevo tipo de evento (crowdsourcing)
   * 
   * Body (validated by Zod):
   * - name: string (nombre del tipo)
   * - language?: string (ISO 639-1, default: 'es')
   * 
   * Authorization: Required (cualquier usuario autenticado)
   * 
   * Response:
   * - 201: Type created successfully
   * - 200: Type already exists, reusing
   * - 400: Validation error
   * - 500: Server error
   */
  async createEventType(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, language = 'es' } = req.body;
      const userId = req.user!.userId;

      logger.info({ name, language, userId }, 'Creating machine event type');

      const eventType = await this.createTypeUseCase.execute(
        name,
        userId,
        language,
        false // Not system generated
      );

      const isNew = !req.body.id; // Si viene ID, es update de idioma

      res.status(isNew ? 201 : 200).json({
        success: true,
        message: isNew ? 'Event type created' : 'Language added to existing type',
        data: {
          id: eventType.id,
          name: eventType.name,
          normalizedName: eventType.normalizedName,
          languages: eventType.languages,
          systemGenerated: eventType.systemGenerated,
          timesUsed: eventType.timesUsed
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ 
        error: errorMessage,
        userId: req.user?.userId
      }, 'Failed to create machine event type');

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'EVENT_TYPE_CREATION_FAILED'
      });
    }
  }

  /**
   * GET /event-types/search?q=mantenimiento&limit=10
   * Buscar tipos de eventos para autocomplete
   * 
   * Query params:
   * - q: string (término de búsqueda)
   * - limit?: number (default: 10, max: 50)
   * - includeSystem?: boolean (default: true)
   * 
   * Authorization: NOT required (público para UX)
   * 
   * Response:
   * - 200: Types found (puede ser array vacío)
   */
  async searchEventTypes(req: Request, res: Response): Promise<void> {
    try {
      const query = (req.query.q as string) || '';
      const limit = Math.min(Number(req.query.limit) || 10, 50);
      const includeSystem = req.query.includeSystem !== 'false';

      logger.debug({ query, limit, includeSystem }, 'Searching event types');

      const types = await this.searchTypesUseCase.execute(
        query,
        limit,
        includeSystem
      );

      res.status(200).json({
        success: true,
        message: `Found ${types.length} event types`,
        data: types.map(type => ({
          id: type.id,
          name: type.name,
          normalizedName: type.normalizedName,
          languages: type.languages,
          systemGenerated: type.systemGenerated,
          timesUsed: type.timesUsed
        }))
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ error: errorMessage }, 'Event types search failed');

      // Graceful degradation: retornar array vacío en vez de error 500
      res.status(200).json({
        success: true,
        message: 'Search failed, returning empty results',
        data: []
      });
    }
  }

  /**
   * GET /event-types/popular?limit=10
   * Obtener tipos de eventos más usados
   * 
   * Query params:
   * - limit?: number (default: 10, max: 50)
   * 
   * Authorization: NOT required
   * 
   * Response:
   * - 200: Popular types (ordenados por timesUsed desc)
   */
  async getPopularEventTypes(req: Request, res: Response): Promise<void> {
    try {
      const limit = Math.min(Number(req.query.limit) || 10, 50);

      logger.debug({ limit }, 'Fetching popular event types');

      const types = await this.eventTypeRepository.findMostUsed(limit);

      res.status(200).json({
        success: true,
        message: `Retrieved ${types.length} popular event types`,
        data: types.map(type => ({
          id: type.id,
          name: type.name,
          normalizedName: type.normalizedName,
          languages: type.languages,
          systemGenerated: type.systemGenerated,
          timesUsed: type.timesUsed
        }))
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ error: errorMessage }, 'Failed to fetch popular event types');

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'FETCH_POPULAR_TYPES_FAILED'
      });
    }
  }

  /**
   * GET /event-types
   * Listar todos los tipos de eventos (paginado)
   * 
   * Query params:
   * - page?: number (default: 1)
   * - limit?: number (default: 20, max: 100)
   * - systemGenerated?: boolean (filtro)
   * - onlyActive?: boolean (default: true)
   * 
   * Authorization: NOT required (datos públicos)
   * 
   * Response:
   * - 200: Types list with pagination
   */
  async listEventTypes(req: Request, res: Response): Promise<void> {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const systemGenerated = req.query.systemGenerated === 'true' ? true 
                            : req.query.systemGenerated === 'false' ? false 
                            : undefined;
      const onlyActive = req.query.onlyActive !== 'false';

      logger.debug({ page, limit, systemGenerated, onlyActive }, 'Listing event types');

      const result = await this.eventTypeRepository.findPaginated({
        page,
        limit,
        filter: {
          systemGenerated,
          isActive: onlyActive ? true : undefined
        }
      });

      res.status(200).json({
        success: true,
        message: `Retrieved ${result.items.length} event types`,
        data: {
          types: result.items.map(type => ({
            id: type.id,
            name: type.name,
            normalizedName: type.normalizedName,
            languages: type.languages,
            systemGenerated: type.systemGenerated,
            timesUsed: type.timesUsed,
            isActive: type.isActive
          })),
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
          }
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ error: errorMessage }, 'Failed to list event types');

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'LIST_EVENT_TYPES_FAILED'
      });
    }
  }

  // ============================================================================
  // MÉTODOS ESTRATÉGICOS (Comentados para futuras features)
  // ============================================================================

  /**
   * TODO: PATCH /event-types/:id/deactivate - Desactivar tipo (soft delete)
   * 
   * Propósito:
   * - Admin desactiva tipo obsoleto o duplicado
   * - NO eliminar físicamente (mantener integridad referencial)
   * - Eventos existentes mantienen referencia
   * 
   * Authorization: Admin only
   * 
   * async deactivateEventType(req: AuthenticatedRequest, res: Response): Promise<void> {
   *   // 1. Verificar que user es admin
   *   // 2. Marcar tipo como isActive: false
   *   // 3. No aparecerá en autocomplete pero eventos existentes válidos
   * }
   */

  /**
   * TODO: POST /event-types/merge - Fusionar tipos duplicados
   * 
   * Propósito:
   * - Admin fusiona "Mantenimiento" y "Mantencion" (typo)
   * - Actualiza todos los eventos que usan sourceTypeId
   * - Suma timesUsed, fusiona languages
   * 
   * Body:
   * - sourceTypeId: string (tipo a eliminar)
   * - targetTypeId: string (tipo destino)
   * 
   * Authorization: Admin only
   * 
   * async mergeEventTypes(req: AuthenticatedRequest, res: Response): Promise<void> {
   *   // 1. Validar admin perms
   *   // 2. Actualizar todos los eventos (aggregation update)
   *   // 3. Sumar timesUsed
   *   // 4. Fusionar languages
   *   // 5. Desactivar sourceType
   *   // 6. Log auditoría
   * }
   */

  /**
   * PATCH /event-types/:id
   * Actualizar tipo de evento existente
   * 
   * Body (validated by Zod):
   * - isActive?: boolean (activar/desactivar)
   * - languagesToAdd?: string[] (agregar idiomas)
   * - languagesToRemove?: string[] (remover idiomas)
   * 
   * Authorization: Required (cualquier usuario autenticado)
   * 
   * Response:
   * - 200: Type updated successfully
   * - 400: Validation error (no updates provided, invalid languages, etc.)
   * - 403: Cannot deactivate system-generated type
   * - 404: Type not found
   * - 500: Server error
   */
  async updateEventType(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive, languagesToAdd, languagesToRemove } = req.body;
      const userId = req.user!.userId;

      logger.info({ 
        eventTypeId: id, 
        isActive, 
        languagesToAdd, 
        languagesToRemove,
        userId 
      }, 'Updating machine event type');

      const eventType = await this.updateTypeUseCase.execute(id, {
        isActive,
        languagesToAdd,
        languagesToRemove
      });

      res.status(200).json({
        success: true,
        message: 'Event type updated successfully',
        data: {
          id: eventType.id,
          name: eventType.name,
          normalizedName: eventType.normalizedName,
          languages: eventType.languages,
          systemGenerated: eventType.systemGenerated,
          isActive: eventType.isActive,
          timesUsed: eventType.timesUsed
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error({ 
        error: errorMessage,
        eventTypeId: req.params.id,
        userId: req.user?.userId
      }, 'Failed to update machine event type');

      // Map domain errors to HTTP status codes
      let statusCode = 500;
      if (errorMessage.includes('not found')) {
        statusCode = 404;
      } else if (errorMessage.includes('system-generated') || errorMessage.includes('last language')) {
        statusCode = 403;
      } else if (errorMessage.includes('Language') || errorMessage.includes('At least one')) {
        statusCode = 400;
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: 'EVENT_TYPE_UPDATE_FAILED'
      });
    }
  }

  /**
   * TODO: POST /event-types/:id/translations - Agregar traducción
   * 
   * Propósito:
   * - Usuario bilingüe propone traducción de tipo existente
   * - Community-driven i18n
   * 
   * Body:
   * - language: string (e.g., 'en', 'pt')
   * - translatedName: string
   * 
   * Authorization: Required
   * 
   * async addTranslation(req: AuthenticatedRequest, res: Response): Promise<void> {
   *   // 1. Cargar tipo existente
   *   // 2. Validar que idioma no existe
   *   // 3. Agregar idioma con nombre traducido
   *   // 4. Guardar actualización
   *   // 5. Log contribución (gamification)
   * }
   */

  /**
   * TODO: GET /event-types/trending - Tipos en tendencia
   * 
   * Propósito:
   * - Dashboard admin: "Tipos más reportados este mes"
   * - Detectar patterns de la industria
   * 
   * Query params:
   * - period: '7d' | '30d' | '90d'
   * - limit: number
   * 
   * Response:
   * - Array<{ type, currentUsage, previousUsage, growthRate }>
   * 
   * async getTrendingTypes(req: Request, res: Response): Promise<void> {
   *   // Requiere tracking histórico de timesUsed
   *   // Alternativa: Analizar timestamps de eventos
   * }
   */

  /**
   * TODO: GET /event-types/suggest - Sugerencias contextuales
   * 
   * Propósito:
   * - Sugerir tipos relevantes según contexto del usuario
   * - Personalización basada en historial
   * 
   * Query params:
   * - machineId?: string (tipos más usados en esa máquina)
   * - limit: number
   * 
   * Authorization: Required (para personalización)
   * 
   * async getSuggestedTypes(req: AuthenticatedRequest, res: Response): Promise<void> {
   *   // 1. Obtener últimos eventos del usuario
   *   // 2. Si machineId: obtener tipos más usados en esa máquina
   *   // 3. Combinar con tipos globales populares
   *   // 4. Retornar personalizados
   * }
   */
}
