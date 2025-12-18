import { Router } from 'express';
import authRoutes from './auth.routes';
import machinesRoutes from './machines.routes';
import usersRoutes from './users.routes';
import machineTypeRoutes from './machine-type.routes';
import quickCheckRoutes from './quickcheck.routes';
import notificationRoutes from './notification.routes';

/**
 * Router principal de la API v1
 * Registra todas las rutas del sistema con sus prefijos correspondientes
 */
const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de máquinas
router.use('/machines', machinesRoutes);

// Rutas de tipos de máquina
router.use('/machine-types', machineTypeRoutes);

// Rutas de usuarios
router.use('/users', usersRoutes);

// QuickCheck routes (quick inspections)
router.use('/machines', quickCheckRoutes);

// Notification routes (Sprint #9)
router.use('/users', notificationRoutes);

// TODO: Agregar más rutas según se implementen los módulos
// router.use('/maintenance', maintenanceRoutes);
// router.use('/messages', messagesRoutes);
// router.use('/admin', adminRoutes);

export default router;