import { Router } from 'express';
import authRoutes from './auth.routes';
import machinesRoutes from './machines.routes';
import usersRoutes from './users.routes';

/**
 * Router principal de la API v1
 * Registra todas las rutas del sistema con sus prefijos correspondientes
 */
const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de máquinas
router.use('/machines', machinesRoutes);

// Rutas de usuarios
router.use('/users', usersRoutes);

// TODO: Agregar más rutas según se implementen los módulos
// router.use('/maintenance', maintenanceRoutes);
// router.use('/quickcheck', quickcheckRoutes);
// router.use('/notifications', notificationsRoutes);
// router.use('/messages', messagesRoutes);
// router.use('/admin', adminRoutes);

export default router;