import { Router } from 'express';
import authRoutes from './auth.routes';
import machinesRoutes from './machines.routes';
import usersRoutes from './users.routes';
import machineTypeRoutes from './machine-type.routes';
import quickCheckRoutes from './quickcheck.routes';
import notificationRoutes from './notification.routes';
import machineEventRoutes from './machine-event.routes';
import eventTypeRoutes from './event-type.routes';
import adminRoutes from './admin.routes';
import maintenanceRoutes from './maintenance-alarm.routes';
import userDiscoveryRoutes from './user-discovery.routes';
import contactRoutes from './contact.routes';

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

// Machine Events routes (Sprint #10) - Historial de eventos de máquina
router.use('/machines', machineEventRoutes);

// Event Types routes (Sprint #10) - CRUD de tipos de eventos (crowdsourcing)
router.use('/event-types', eventTypeRoutes);

// Maintenance Alarm routes (Sprint #11) - Gestión de alarmas de mantenimiento
router.use('/machines', maintenanceRoutes);

// Admin routes (Sprint #11) - Gestión de cronjobs y admin tools
router.use('/admin/cronjobs', adminRoutes);

// User Discovery routes (Sprint #12 - Module 1) - Descubrimiento de usuarios
router.use('/users', userDiscoveryRoutes);

// Contact Management routes (Sprint #12 - Module 2) - Gestión de contactos
router.use('/users', contactRoutes);

// TODO: Agregar más rutas según se implementen los módulos
// router.use('/maintenance', maintenanceRoutes);
// router.use('/messages', messagesRoutes); // Sprint #12 - Module 3

export default router;