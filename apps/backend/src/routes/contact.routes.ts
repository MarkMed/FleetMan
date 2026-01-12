import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { requestSanitization } from '../middlewares/requestSanitization';
import { ContactUserIdParamSchema } from '@packages/contracts';

/**
 * Contact Management Routes (Sprint #12 Module 2)
 * 
 * Endpoints para gestión de contactos personales:
 * - POST   /me/contacts/:contactUserId - Agregar contacto
 * - DELETE /me/contacts/:contactUserId - Remover contacto
 * - GET    /me/contacts - Listar contactos
 * 
 * Todos los endpoints requieren autenticación JWT
 * Base path: /api/v1/users (montado en routes/index.ts)
 */

const router = Router();
const contactController = new ContactController();

/**
 * POST /api/v1/users/me/contacts/:contactUserId
 * 
 * Agrega un usuario como contacto en la agenda personal
 * 
 * Middleware chain:
 * 1. requestSanitization - Sanitiza inputs (prevenir XSS)
 * 2. authMiddleware - Valida JWT token y extrae userId
 * 3. validateRequest - Valida params con Zod schema
 * 4. controller - Ejecuta lógica de negocio
 */
router.post(
  '/me/contacts/:contactUserId',
  requestSanitization,
  authMiddleware,
  validateRequest({ params: ContactUserIdParamSchema }),
  (req, res) => contactController.add(req, res)
);

/**
 * DELETE /api/v1/users/me/contacts/:contactUserId
 * 
 * Remueve un usuario de la lista de contactos
 * 
 * Middleware chain: Same as POST
 */
router.delete(
  '/me/contacts/:contactUserId',
  requestSanitization,
  authMiddleware,
  validateRequest({ params: ContactUserIdParamSchema }),
  (req, res) => contactController.remove(req, res)
);

/**
 * GET /api/v1/users/me/contacts
 * 
 * Lista todos los contactos del usuario con sus perfiles públicos
 * 
 * Middleware chain:
 * 1. authMiddleware - Valida JWT token y extrae userId
 * 2. controller - Ejecuta lógica de negocio
 * 
 * No requiere validateRequest (no hay params/query)
 */
router.get(
  '/me/contacts',
  authMiddleware,
  (req, res) => contactController.list(req, res)
);

export default router;
