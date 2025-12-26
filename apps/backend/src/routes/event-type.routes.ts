import { Router } from 'express';
import { EventTypeController } from '../controllers/event-type.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requestSanitization } from '../middlewares/requestSanitization';
import { z } from 'zod';
import { 
  CreateMachineEventTypeRequestSchema,
  UpdateEventTypeRequestSchema
} from '@packages/contracts';

/**
 * Event Type Routes
 * 
 * Endpoints para CRUD de tipos de eventos (crowdsourcing pattern)
 * Similar a MachineType routes (colección separada)
 * 
 * Routes:
 * - POST   /event-types              - Create type (crowdsourcing)
 * - GET    /event-types              - List types (paginated)
 * - GET    /event-types/search       - Search/autocomplete
 * - GET    /event-types/popular      - Most used types
 * - PATCH  /event-types/:id          - Update type (activate/deactivate, add/remove languages)
 * 
 * Note:
 * - ⚠️ **Sprint #10**: Todos los endpoints requieren autenticación
 * - Create y Update requieren autenticación (cualquier user puede ejecutar)
 * - GET endpoints ahora requieren autenticación por seguridad de datos
 */

const router = Router();
const eventTypeController = new EventTypeController();

/**
 * Zod validation middleware factory
 */
function validateBody(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
}

// =============================================================================
// EVENT TYPE ROUTES
// =============================================================================

/**
 * @swagger
 * /event-types/search:
 *   get:
 *     summary: Buscar tipos de eventos (autocomplete)
 *     description: |
 *       Búsqueda case-insensitive para autocomplete en UI.
 *       Retorna tipos ordenados por popularidad (timesUsed).
 *       
 *       Endpoint público (NO requiere autenticación) para mejor UX.
 *     tags: [Event Types]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *         example: "mantenimiento"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Máximo de resultados
 *       - in: query
 *         name: includeSystem
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir tipos generados por sistema
 *     responses:
 *       200:
 *         description: Tipos encontrados (puede ser array vacío)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Found 5 event types"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       normalizedName:
 *                         type: string
 *                       languages:
 *                         type: array
 *                         items:
 *                           type: string
 *                       systemGenerated:
 *                         type: boolean
 *                       timesUsed:
 *                         type: integer
 */
router.get(
  '/search',
  requestSanitization,
  authMiddleware,
  eventTypeController.searchEventTypes.bind(eventTypeController)
);

/**
 * @swagger
 * /event-types/popular:
 *   get:
 *     summary: Obtener tipos de eventos más usados
 *     description: |
 *       Retorna tipos ordenados por popularidad (timesUsed descendente).
 *       Útil para sugerencias en UI cuando usuario no ha escrito nada.
 *       
 *       ⚠️ **CAMBIO Sprint #10**: Ahora requiere autenticación.
 *     tags: [Event Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Máximo de resultados
 *     responses:
 *       200:
 *         description: Tipos populares obtenidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Retrieved 10 popular event types"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       timesUsed:
 *                         type: integer
 */
router.get(
  '/popular',
  requestSanitization,
  authMiddleware,
  eventTypeController.getPopularEventTypes.bind(eventTypeController)
);

/**
 * @swagger
 * /event-types:
 *   get:
 *     summary: Listar todos los tipos de eventos (paginado)
 *     description: |
 *       Lista completa de tipos con paginación y filtros.
 *       
 *       ⚠️ **CAMBIO Sprint #10**: Ahora requiere autenticación.
 *     tags: [Event Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: systemGenerated
 *         schema:
 *           type: boolean
 *         description: Filtrar por origen (true=sistema, false=usuario)
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Solo tipos activos
 *     responses:
 *       200:
 *         description: Lista de tipos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     types:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */
router.get(
  '/',
  requestSanitization,
  authMiddleware,
  eventTypeController.listEventTypes.bind(eventTypeController)
);

/**
 * @swagger
 * /event-types:
 *   post:
 *     summary: Crear nuevo tipo de evento (crowdsourcing)
 *     description: |
 *       Permite a usuarios crear tipos de eventos dinámicamente.
 *       Si tipo ya existe (case-insensitive), agrega idioma si no lo tiene.
 *       
 *       Patrón crowdsourcing: Todos los usuarios pueden crear tipos.
 *       NO requiere permisos especiales.
 *     tags: [Event Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Nombre del tipo de evento
 *                 example: "Mantenimiento Preventivo"
 *               language:
 *                 type: string
 *                 pattern: ^[a-z]{2}$
 *                 default: "es"
 *                 description: Código ISO 639-1 del idioma
 *                 example: "es"
 *     responses:
 *       201:
 *         description: Tipo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Event type created"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     normalizedName:
 *                       type: string
 *                     languages:
 *                       type: array
 *                       items:
 *                         type: string
 *                     systemGenerated:
 *                       type: boolean
 *                     timesUsed:
 *                       type: integer
 *       200:
 *         description: Tipo ya existía, idioma agregado
 *       400:
 *         description: Error de validación
 */
router.post(
  '/',
  requestSanitization,
  authMiddleware,
  validateBody(CreateMachineEventTypeRequestSchema),
  eventTypeController.createEventType.bind(eventTypeController)
);

/**
 * @swagger
 * /event-types/{id}:
 *   patch:
 *     summary: Actualizar tipo de evento existente
 *     description: |
 *       Permite actualizar propiedades de un tipo de evento:
 *       - Activar/Desactivar (soft delete)
 *       - Agregar idiomas
 *       - Remover idiomas
 *       
 *       Validaciones:
 *       - NO se puede desactivar tipos system-generated
 *       - NO se puede remover el último idioma
 *       - Idiomas deben ser ISO 639-1 (2 letras)
 *     tags: [Event Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tipo de evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: Activar (true) o desactivar (false) el tipo
 *                 example: false
 *               languagesToAdd:
 *                 type: array
 *                 items:
 *                   type: string
 *                   minLength: 2
 *                   maxLength: 2
 *                 description: Idiomas a agregar (ISO 639-1)
 *                 example: ["en", "pt"]
 *               languagesToRemove:
 *                 type: array
 *                 items:
 *                   type: string
 *                   minLength: 2
 *                   maxLength: 2
 *                 description: Idiomas a remover (ISO 639-1)
 *                 example: ["fr"]
 *           examples:
 *             deactivate:
 *               summary: Desactivar tipo
 *               value:
 *                 isActive: false
 *             addLanguages:
 *               summary: Agregar idiomas
 *               value:
 *                 languagesToAdd: ["en", "pt"]
 *             removeLanguage:
 *               summary: Remover idioma
 *               value:
 *                 languagesToRemove: ["fr"]
 *             combined:
 *               summary: Operaciones combinadas
 *               value:
 *                 isActive: true
 *                 languagesToAdd: ["de"]
 *                 languagesToRemove: ["it"]
 *     responses:
 *       200:
 *         description: Tipo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     languages:
 *                       type: array
 *                       items:
 *                         type: string
 *                     isActive:
 *                       type: boolean
 *       400:
 *         description: Error de validación (no updates, idiomas inválidos)
 *       403:
 *         description: No se puede desactivar tipo system-generated o remover último idioma
 *       404:
 *         description: Tipo no encontrado
 */
router.patch(
  '/:id',
  requestSanitization,
  authMiddleware,
  validateBody(UpdateEventTypeRequestSchema),
  eventTypeController.updateEventType.bind(eventTypeController)
);

export default router;
