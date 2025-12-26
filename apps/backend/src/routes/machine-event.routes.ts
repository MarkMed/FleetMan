import { Router } from 'express';
import { MachineEventController } from '../controllers/machine-event.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requestSanitization } from '../middlewares/requestSanitization';
import { z } from 'zod';
import { CreateMachineEventRequestSchema, ListMachineEventsRequestSchema } from '@packages/contracts';

/**
 * Machine Events Routes
 * 
 * Endpoints para historial de eventos de máquina
 * Patrón: Subdocumento en Machine.eventsHistory (como QuickCheck)
 * 
 * Routes:
 * - POST   /machines/:machineId/events       - Create event
 * - GET    /machines/:machineId/events       - Get history (paginated + filters)
 * 
 * Middleware:
 * - authMiddleware: JWT validation
 * - requestSanitization: XSS prevention
 * - Zod validation: Request body/query params
 * 
 * Ownership Validation:
 * - Controller valida que user es owner o provider asignado
 */

const router = Router();
const machineEventController = new MachineEventController();

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

function validateQuery(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
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
// MACHINE EVENTS ROUTES
// =============================================================================

/**
 * @swagger
 * /machines/{machineId}/events:
 *   post:
 *     summary: Crear evento de máquina (reportado por usuario)
 *     description: |
 *       Permite a usuarios reportar eventos que le suceden a una máquina.
 *       Soporta crowdsourcing de tipos: usuario puede crear nuevos tipos dinámicamente.
 *       
 *       Acceso:
 *       - Owner de la máquina
 *       - Provider asignado a la máquina
 *     tags: [Machine Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la máquina
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               typeId:
 *                 type: string
 *                 description: ID de tipo existente (mutually exclusive con typeName)
 *                 example: "evt_type_abc123"
 *               typeName:
 *                 type: string
 *                 description: Nombre para crear nuevo tipo (mutually exclusive con typeId)
 *                 example: "Mantenimiento Preventivo"
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 description: Título del evento
 *                 example: "Cambio de aceite motor"
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 description: Descripción detallada (opcional)
 *                 example: "Se realizó cambio de aceite sintético 15W-40. Próximo cambio en 200 horas."
 *               metadata:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Datos adicionales flexibles (JSON)
 *                 example: { "hoursOfUse": 1500, "oilBrand": "Shell", "technicianName": "Juan Pérez" }
 *           examples:
 *             conTipoExistente:
 *               summary: Usando tipo existente
 *               value:
 *                 typeId: "evt_type_abc123"
 *                 title: "Mantenimiento preventivo completado"
 *                 description: "Se realizó mantenimiento preventivo de 1000 horas."
 *                 metadata:
 *                   hoursOfUse: 1000
 *             conTipoNuevo:
 *               summary: Creando tipo nuevo (crowdsourcing)
 *               value:
 *                 typeName: "Reparación de Motor"
 *                 title: "Motor reparado tras sobrecalentamiento"
 *                 description: "Se reemplazó radiador y bomba de agua."
 *                 metadata:
 *                   cost: 1500
 *                   downtime: 48
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
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
 *                   example: "Event reported successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                       example: "evt_xyz789"
 *                     machineId:
 *                       type: string
 *                       example: "machine_abc123"
 *       400:
 *         description: Error de validación
 *       403:
 *         description: Acceso denegado (no es owner ni provider)
 *       404:
 *         description: Máquina no encontrada
 */
router.post(
  '/:machineId/events',
  requestSanitization,
  authMiddleware,
  validateBody(CreateMachineEventRequestSchema),
  machineEventController.createEvent.bind(machineEventController)
);

/**
 * @swagger
 * /machines/{machineId}/events:
 *   get:
 *     summary: Obtener historial de eventos de máquina (paginado + filtros)
 *     description: |
 *       Retorna lista de eventos de una máquina con paginación y filtros.
 *       
 *       Acceso:
 *       - Owner de la máquina
 *       - Provider asignado a la máquina
 *     tags: [Machine Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la máquina
 *       - in: query
 *         name: typeId
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de evento
 *       - in: query
 *         name: isSystemGenerated
 *         schema:
 *           type: boolean
 *         description: Filtrar eventos automáticos (true) o manuales (false)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha inicio (ISO 8601)
 *         example: "2024-01-01T00:00:00Z"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha fin (ISO 8601)
 *         example: "2024-12-31T23:59:59Z"
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Búsqueda en título/descripción
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items por página
 *     responses:
 *       200:
 *         description: Historial obtenido exitosamente
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
 *                   example: "Retrieved 15 events"
 *                 data:
 *                   type: object
 *                   properties:
 *                     events:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           typeId:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           createdBy:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           isSystemGenerated:
 *                             type: boolean
 *                           metadata:
 *                             type: object
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
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Máquina no encontrada
 */
router.get(
  '/:machineId/events',
  requestSanitization,
  authMiddleware,
  validateQuery(ListMachineEventsRequestSchema),
  machineEventController.getEventsHistory.bind(machineEventController)
);

export default router;
