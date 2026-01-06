# WBS

0. **Fundaciones / Setup**
	- 0.1 **Repos & monorepo** (front React+Vite, back Node/TS, shared/DTO/Zod).
Crear el monorepo con workspaces, configs TS, scripts y shared/ para contratos.
		- Horas estimadas: **8**hs
		- Margen: ±**1.5**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: —
		- Spike: **No**

	- 0.2 **CI mínima** (lint, type-check, runner Jest).
Pipeline básico en PR/push con lint, type-check y jest.
		- Horas estimadas: **6**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 0.1 (FS)
		- Spike: **No**

	- 0.3 **Convención ramas & releases** (main/dev/feature, Conventional Commits).
Flujo de ramas, convención de commits y tagging.
		- Horas estimadas: **3**hs
		- Margen: ±**0.5**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 0.1 (FS)
		- Spike: **No**

	- 0.4 **Entornos** (local/dev + demo).
Variables .env, targets de build y entorno de demo.
		- Horas estimadas: **7**hs
		- Margen: ±**1.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 0.1 (FS)
		- Spike: **No**

	- 0.5 **PWA base** (manifest + SW básico + testing).
Implementación completa de Progressive Web App básica. Desglosado en subtareas para mejor tracking.
		- Horas estimadas: **5**hs (total desglosado)
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 0.1 (FS)
		- Spike: **No**

	- 0.5a **PWA - Manifest + Icons**.
Crear manifest.json con metadata de la app, generar íconos 192x192 y 512x512, agregar meta tags HTML para PWA (theme-color, apple-mobile-web-app-capable).
		- Horas estimadas: **1**hs
		- Margen: ±**0.2**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 0.5 (FS)
		- Spike: **No**

	- 0.5b **PWA - Service Worker Básico**.
Implementar service worker con estrategia de caching básica. Cache de assets críticos (HTML, CSS, JS). Registro del SW en app. Fallback offline simple. NO incluye sync avanzado.
		- Horas estimadas: **3**hs
		- Margen: ±**0.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 0.5a (FS)
		- Spike: **No**

	- 0.5c **PWA - Testing Multi-dispositivo**.
Testing de instalación en desktop (Chrome, Edge) y mobile (Android, iOS). Verificar funcionalidad offline básica. Lighthouse audit PWA score. Ajustes finales basados en testing.
		- Horas estimadas: **1**hs
		- Margen: ±**0.3**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 0.5b (FS)
		- Spike: **No**

	- 0.6 **User Journey mapping** (flujos clave).
Mapeo de flujos principales del usuario: Login → Máquina → Recordatorio → QuickCheck → Notificación → Contacto proveedor. Define los paths críticos de interacción y navegación del sistema.
		- Horas estimadas: **6**hs
		- Margen: ±**1.2**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 1.1 (FS)
		- Spike: **No**

	- 0.7 **i18n groundwork** (infra de strings).
Setup de i18n sin traducciones (solo infraestructura).
		- Horas estimadas: **5**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 0.10 (FS)
		- Spike: **No**

	- 0.8 **Setup VSCode remoto** (GitHub Codespaces/Gitpod).
Configuración de entorno de desarrollo remoto para acceso desde cualquier dispositivo sin dependencia de hardware local.
		- Horas estimadas: **4**hs
		- Margen: ±**0.8**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 0.1 (FS)
		- Spike: **No**

	- 0.9 **Investigación y definición de estilos**.
User research básico con cliente para definir identidad visual. Incluye definición de paleta de colores, tipografías primarias, elementos de interfaz básicos y guía de estilo mínima. Establece las bases visuales que guiarán tanto el desarrollo frontend como la creación de mockups.
		- Horas estimadas: **5**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 0.6 (FS)
		- Spike: **No**

	- 0.10 **Mockups básicos** (fidelidad 0.5).
Wireframes con elementos estilísticos básicos aplicando la guía de estilos definida - entre wireframe puro (fidelidad 0) y mockup completo (fidelidad 1). Incluye layouts definidos, tipografías, paleta de colores y componentes con estilo mínimo para las pantallas principales del flujo de usuario.
		- Horas estimadas: **8**hs
		- Margen: ±**1.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 0.9 (FS)
		- Spike: **No**

	- 0.11 **Setup Backend Básico**.
Instalación y configuración de dependencias core del backend: Express, MongoDB, Mongoose, JWT, Swagger, bcrypt, cors, dotenv, helmet y otras librerías fundamentales. Configuración inicial de servidor, conexión a base de datos y middleware básico.
		- Horas estimadas: **8**hs
		- Margen: ±**1.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 0.1 (FS)
		- Spike: **No**

	- 0.12 **Archivos Backend Básicos**.
Creación de estructura inicial del backend: controladores ping-pong/health-check, rutas básicas, middleware de manejo de errores, configuración de conexión a BD, archivos de configuración de entorno y estructura de carpetas básica para el desarrollo.
		- Horas estimadas: **6**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 0.11 (FS)
		- Spike: **No**

	- 0.13 **Setup Frontend Básico**.
Instalación y configuración de dependencias core del frontend: React, Vite, ShadCN UI, TanStack Query, React Hook Form, Zod, i18next, React Router, Tailwind CSS y otras librerías fundamentales. Configuración inicial de build y desarrollo.
		- Horas estimadas: **8**hs
		- Margen: ±**1.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 0.1 (FS)
		- Spike: **No**

	- 0.14 **Archivos Frontend Básicos**.
	Creación de estructura inicial del frontend: componentes base, páginas iniciales, configuración de routing, viewModels básicos, configuración de i18n, setup de TanStack Query, y estructura de carpetas para el desarrollo del frontend.
		- Horas estimadas: **6**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 0.13 (FS)
		- Spike: **No**

	- 0.15 **i18n - Implementación mínima** (strings + en/es).
	Implementación básica de i18n en frontend: configuración de i18next con recursos para Español e Inglés, hook/componente de selección de idioma, persistencia en localStorage, y aplicación en 2-3 pantallas principales como prueba de concepto.
		- Horas estimadas: **2**hs
		- Margen: ±**0.4**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 0.7, 0.14 (FS)
		- Spike: **No**

1. **Dominio & Datos**

	- 1.1 **Modelo** (User, Machine, MaintenanceReminder, MachineEvent, QuickCheck, Notification, SparePart, etc.).
Entidades, relaciones e invariantes del dominio.
		- Horas estimadas: **15**hs
		- Margen: ±**3.5**hs (P80)
		- Incertidumbre: **Alta**
		- Dependencias: 0.1 (FS)
		- Spike: **No**

	- 1.2 **Esquemas DB** (Mongoose + índices clave).
Schemas Mongoose y 2–3 índices críticos del MVP.
		- Horas estimadas: **5**hs
		- Nota: **Enfoque incremental / just-in-time** — implementar y ajustar los esquemas por partes según las necesidades del sprint, evitando grandes tareas monolíticas y permitiendo iteraciones rápidas.
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 1.1 (FS)
		- Spike: **No**

	- 1.3 **DTOs + Zod** (contratos compartidos).
DTOs de entrada/salida y validaciones Zod en shared/.
		- Horas estimadas: **7**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 1.1, 0.12, 0.14 (FS)
		- Spike: **No**

	- 1.4 **Semillas demo** (dataset mínimo).
Datos de ejemplo para dev, pruebas y demo.
		- Horas estimadas: **4**hs
		- Nota: **Semillas incrementales** — añadir datos mínimos necesarios por feature; evitar crear datasets completos que requieran retrabajo al cambiar esquemas.
		- Margen: ±**0.7**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 1.2 (FS)
		- Spike: **No**

2. **Autenticación & Roles** (RF-001..004)

	- 2.1 **Registro** (RF-001).
Frontend: Wizard form component con validación multi-step (datos personales, 
credenciales, confirmación), estados de loading/success/error, navegación 
post-registro y integración con backend. Backend: Endpoint POST /auth/register, 
controller con validaciones Zod, middleware de sanitización, hash de contraseñas, 
respuestas estructuradas y manejo de errores (email duplicado, etc.).
		- Horas estimadas: **10**hs
		- Margen: ±**2.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 1.2, 1.3, 0.10, 0.12, 0.14 (FS)
		- Spike: **No**

	- 2.2 **Login de usuario** (RF-002).
Frontend: Formulario de login con validación, recordar usuario, estados de error,
loading y redirección post-auth. Backend: Endpoint POST /auth/login, generación 
JWT + refresh token, middleware de rate limiting, manejo de credenciales inválidas.
		- Horas estimadas: **8**hs
		- Margen: ±**1.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 2.1 (FS)
		- Spike: **No**

	- 2.3 **Logout** (RF-003).
Cierre manual/por inactividad.
		- Horas estimadas: **4**hs
		- Margen: ±**0.7**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 2.2 (FS)
		- Spike: **No**

	- 2.4 **Recuperación de contraseña** (RF-004) [NiceToHave].
Flujo de reset vía token temporal.
		- Horas estimadas: **8**hs
		- Margen: ±**1.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 2.1 (FS)
		- Spike: **No**

	- 2.5 **AutZ por rol** (admin/técnico/distribuidor).
Guards/claims por rol en API y UI.
		- Horas estimadas: **7**hs
		- Margen: ±**1.2**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 2.2 (FS)
		- Spike: **No**

	- 2.6 **Edición de Perfil de Usuario** [Should Have].
Permitir a usuarios modificar su información personal. Frontend: Formulario de edición de perfil con campos editables (nombre, apellido, email, teléfono, empresa), validación en tiempo real con Zod, estados de loading/success/error, confirmación de cambios. Backend: Endpoint PATCH /users/:userId, validaciones (email único si cambió, formato de datos), middleware de autorización (usuario solo puede editar su propio perfil o admin puede editar cualquiera), actualización parcial (solo campos enviados), respuesta con usuario actualizado. Excluir cambio de contraseña (flujo separado en 2.4).
		- Horas estimadas: **7**hs
		- Margen: ±**1.3**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 2.2, 2.5 (FS)
		- Spike: **No**
		- PERT: Optimista 5hs, Probable 7hs, Pesimista 10hs
		- MoSCoW: **Should Have**

3. **Maquinaria** (RF-005, RF-006)

	- 3.1 **Alta de máquina (RF-005) + ReactHookForms + Wizard Component**.
Frontend: Implementación de ReactHookForms como sistema de formularios estándar + 
Wizard Component reutilizable multi-step + aplicación en registro de máquina con 
datos de máquina, selección/búsqueda de distribuidor, validaciones tiempo real y 
confirmación. Establece patterns escalables para todos los formularios futuros. 
Backend: Endpoint POST /machines, controller con validaciones Zod, asociación con 
usuario/distribuidor, respuestas estructuradas.
		- Horas estimadas: **16**hs
		- Margen: ±**2.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 2.2, 1.2, 0.10 (FS)
		- Spike: **No**

	- 3.2 **Listado + detalle**.
Lista/tiles, vista detalle y paginado simple.
		- Horas estimadas: **9**hs
		- Margen: ±**1.8**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 3.1, 0.10 (FS)
		- Spike: **No**

	- 3.2a **Machine Registration Enhancement** (Sprint #8 Refinement).
Grupo de mejoras al modelo y formulario de máquina implementadas en una sola pasada por eficiencia. Frontend: Agregar campo "Asignar a" (assignedTo), componente UsageRate (dailyHours + weeklyDays), campo machinePhotoUrl,reordenamiento de inputs Step 1 (Marca →Modelo → Type → Nombre), fix display tipo máquina (mapping enum a labels español). Backend: Agregar campos assignedTo, usageRate {dailyHours, weeklyDays}, machinePhotoUrl a Machine model/schema/DTOs. Fix validación powerSource en backend (actualmente rechazado). Implementar todas las capas (Domain, Persistence, Application, Presentation) en una sola iteración para aprovechar contexto.
		- Horas estimadas: **12**hs
		- Margen: ±**2.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 3.1 (FS)
		- Spike: **No**
		- PERT: Optimista 10hs, Probable 12hs, Pesimista 15hs
		- **Tareas agrupadas:** [5] Asignar a, [6] Fix display tipo, [7] Fix powerSource, [8] UsageRate, [NUEVA] machinePhotoUrl

	- 3.3 **Edición con historial** (RF-006).
Edición + auditoría básica de cambios.
		- Horas estimadas: **8**hs
		- Margen: ±**1.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 3.2 (FS)
		- Spike: **No**

	- 3.4 **QuickActions Dashboard** (UX).
Componente de acciones rápidas en Dashboard con overlay blur. Incluye: QuickCheck, Reportar Evento, Solicitar Repuesto, Nueva Máquina. Modal intermedio para selección de máquina en las primeras 3 acciones.
		- Horas estimadas: **12**hs
		- Margen: ±**2.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 3.1, 0.10 (FS), SS con 4.2, 6.2, 7.1
		- Spike: **No**

	- 3.5 **Paginación de Lista de Máquinas** [Should Have].
Implementación completa de paginación para escalabilidad. Backend: Verificar y ajustar endpoints GET /machines para soportar parámetros page, limit, total count en headers/metadata, optimización de queries con skip/limit. Frontend: Componente de paginación reutilizable con controles prev/next/pages, integración con lista de máquinas, gestión de estado de página actual, peticiones correctas con query params, estados de loading entre páginas.
		- Horas estimadas: **8**hs
		- Margen: ±**1.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 3.2 (FS)
		- Spike: **No**
		- PERT: Optimista 6hs, Probable 8hs, Pesimista 11hs
		- MoSCoW: **Should Have**

	- 3.6 **Subida de Foto de Máquina** [Must Have].
Integración completa de carga de imágenes con Cloudinary. Frontend: Componente PhotoUpload reutilizable con opciones para capturar desde cámara o seleccionar desde galería/archivos, preview de imagen antes de guardar, crop/resize básico (opcional), estados de loading/progress durante upload, manejo de errores (tamaño, formato). Backend: Verificar/implementar integración con Cloudinary SDK, endpoint para obtener signed upload URL o manejar upload directo, validaciones de formato (jpg, png, webp) y tamaño máximo (ej. 5MB), almacenar URL retornada por Cloudinary en machinePhotoUrl, manejo de eliminación de fotos antiguas. Integración con formularios de registro (3.1) y edición (3.3) de máquina.
		- Horas estimadas: **14**hs
		- Margen: ±**2.5**hs (P80)
		- Incertidumbre: **Alta**
		- Dependencias: 3.1, 3.2a (FS)
		- Spike: **Sí** (Cloudinary setup y flow de upload)
		- PERT: Optimista 10hs, Probable 14hs, Pesimista 20hs
		- MoSCoW: **Must Have**

	- 3.7 **Compartir Acceso de Máquinas entre Usuarios** [Should Have].
Sistema de permisos granulares para compartir datos de máquinas (read-only). Domain: Agregar entidad MachineAccess con campos {machineId, ownerId, sharedWithUserId, permissions: ['viewDetails', 'viewHistory', 'viewEvents'], sharedAt, expiresAt?, status: 'active'|'revoked'}. Backend: Endpoints POST /machines/:id/share (body: {targetUserId, permissions[]}), GET /machines/shared-with-me, DELETE /machines/:id/access/:accessId (revocar), middleware de autorización para verificar ownership o shared access en endpoints GET /machines/:id, GET /machines/:id/events, GET /machines/:id/history. Validar que usuario proveedor solo acceda a recursos compartidos específicamente. Frontend: Modal "Compartir Máquina" desde detalle de máquina con búsqueda de usuarios (por email/nombre), selector de permisos (checkboxes: Detalles, Historial, Eventos), lista de usuarios con acceso actual con opción de revocar, badge visual "Compartida" en máquinas compartidas, sección "Máquinas Compartidas Conmigo" en lista con indicador visual diferente. Notificación al usuario receptor cuando le comparten acceso.
		- Horas estimadas: **16**hs
		- Margen: ±**3.0**hs (P80)
		- Incertidumbre: **Alta**
		- Dependencias: 3.2, 4.3, 2.5, 8.2 (FS)
		- Spike: **No**
		- PERT: Optimista 12hs, Probable 16hs, Pesimista 22hs
		- MoSCoW: **Should Have**

4. **Mantenimiento & Eventos** (RF-007..RF-009)

	- 4.1a **MaintenanceAlarm - Domain + Contracts + Persistence** (RF-007).
Infraestructura de datos para alarmas de mantenimiento programado. Domain: Crear entidad MaintenanceAlarm como subdocumento de Machine (patrón igual a MachineEvent y Notification). Campos MaintenanceAlarm: {id, name, description?, targetOperatingHours, isActive, createdBy, createdAt, lastTriggeredAt?, timesTriggered}. Modificar Machine model para agregar maintenanceAlarms?: IMaintenanceAlarm[] como subdocumento array. Verificar existencia de machine.operatingHours (número acumulado de horas de uso), agregar si no existe. Extender IMachineRepository con métodos: addMaintenanceAlarm, getMaintenanceAlarms, updateMaintenanceAlarm, deleteMaintenanceAlarm (soft delete con isActive:false). Contracts: Crear maintenance-alarm.contract.ts con schemas Zod (MaintenanceAlarmSchema, CreateMaintenanceAlarmRequestSchema, UpdateMaintenanceAlarmRequestSchema, GetMaintenanceAlarmsResponseSchema). Persistence: Crear MaintenanceAlarmSubSchema en machine.model.ts como subdocumento embedded, implementar métodos CRUD en MachineRepository, índices para queries eficientes. Mapper: Crear maintenance-alarm.mapper.ts para conversión Document ↔ Domain.
		- Horas estimadas: **6**hs
		- Margen: ±**1.2**hs (P80)
		- Incertidumbre: **Baja-Media**
		- Dependencias: 3.1, 3.2a, 1.1, 1.2 (FS)
		- Spike: **No**
		- PERT: Optimista 4hs, Probable 6hs, Pesimista 8hs
		- Patrón: Subdocumento en Machine, NO entidad independiente (como MachineEvent, no como MachineEventType)
		- Nota: Requiere usageSchedule ya implementado en 3.2a para calcular horas diarias

	- 4.1b **MaintenanceAlarm - Application Layer Backend** (RF-007).
Lógica de negocio y API REST para alarmas de mantenimiento. Use Cases: Crear 4 casos modulares: (1) CreateMaintenanceAlarmUseCase (validaciones ownership, targetOperatingHours > 0, construir MaintenanceAlarm, invocar MachineRepository.addMaintenanceAlarm), (2) GetMaintenanceAlarmsUseCase (obtener lista de alarmas de una máquina, filtrar por isActive opcional), (3) UpdateMaintenanceAlarmUseCase (validaciones ownership, actualizar subdocumento específico), (4) DeleteMaintenanceAlarmUseCase (soft delete marcando isActive: false). Controllers: MaintenanceAlarmController con 4 endpoints: POST /api/machines/:machineId/maintenance-alarms (crear alarma), GET /api/machines/:machineId/maintenance-alarms?onlyActive=true (listar), PATCH /api/machines/:machineId/maintenance-alarms/:alarmId (actualizar), DELETE /api/machines/:machineId/maintenance-alarms/:alarmId (desactivar). Middleware autorización: Validar ownership (machine.ownerId === userId). Validaciones Zod en controllers. DI con tsyringe. Result pattern para manejo errores. NO implementar lógica de disparo aquí (eso va en 4.1c CronJob).
		- Horas estimadas: **5**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 4.1a (FS)
		- Spike: **No**
		- PERT: Optimista 4hs, Probable 5hs, Pesimista 7hs
		- Nota: CRUD básico, sin lógica de scheduling

	- 4.1c **MaintenanceAlarm - Use Cases de Automatización** (RF-007 + RF-010).
Lógica de negocio pura para actualización automática de horas y disparo de alarmas. Use Cases: (1) UpdateMachinesOperatingHoursUseCase: Query máquinas ACTIVE con usageSchedule definido, por cada máquina verificar si hoy es día operativo (check usageSchedule.operatingDays.includes(currentDay)), si sí sumar usageSchedule.dailyHours a machine.operatingHours, actualizar en BD vía MachineRepository, retornar {updated: number, skipped: number, errors: Error[]}. (2) CheckMaintenanceAlarmsUseCase: Query máquinas con maintenanceAlarms donde isActive === true, por cada alarma verificar si machine.operatingHours >= alarm.targetOperatingHours, si sí disparar secuencia: (a) Crear MachineEvent usando CreateMachineEventUseCase (typeId: 'Mantenimiento Requerido' sistemático, metadata: {alarmId, alarmName, targetHours, currentHours, triggeredAt}), (b) Notificar AL OWNER ÚNICAMENTE: const machine = await machineRepo.findById(machineId); await addNotificationUseCase.execute({userId: machine.ownerId, notification: {notificationType: 'warning', message: `⚠️ Mantenimiento requerido: ${machine.name} alcanzó ${alarm.targetOperatingHours} horas`, sourceId: alarm.id, sourceType: 'MAINTENANCE_ALARM'}}), (c) Actualizar alarma: lastTriggeredAt = now, timesTriggered++, opcional isActive = false. Retornar {alarmsTriggered: number, notificationsSent: number, errors: Error[]}. Testing: Unitario con mocks de repositorios, validar que notificación va SOLO a machine.ownerId.
		- Horas estimadas: **5**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 4.1a, 4.1b, 4.2b (CreateMachineEventUseCase), 8.2 (AddNotificationUseCase), 3.2a (FS)
		- Spike: **No**
		- PERT: Optimista 4hs, Probable 5hs, Pesimista 7hs
		- Nota: CRÍTICO - Lógica de negocio donde se garantiza notificación solo al dueño

	- 4.1d **MaintenanceAlarm - CronJob Scheduler & Orquestación** (RF-007 + RF-010).
Infraestructura de scheduling para ejecutar automáticamente los Use Cases. Setup node-cron: Archivo apps/backend/src/services/cron/maintenance-cron.service.ts, schedule configurable vía ENV (CRON_MAINTENANCE_SCHEDULE: desarrollo '*/10 * * * *' cada 10min, producción '0 2 * * *' diario 2am). Orquestación secuencial: (1) Ejecutar UpdateMachinesOperatingHoursUseCase primero, (2) Si paso 1 exitoso ejecutar CheckMaintenanceAlarmsUseCase después. Logging estructurado: timestamps inicio/fin, métricas (máquinas actualizadas, alarmas disparadas), level INFO para éxito, ERROR para fallos sin detener cron. Registrar en app startup: cron.schedule(process.env.CRON_MAINTENANCE_SCHEDULE, () => cronService.execute()). Testing: Script manual para invocar cronService.execute() sin esperar schedule, verificar logs con datos mockeados.
		- Horas estimadas: **3**hs
		- Margen: ±**0.6**hs (P80)
		- Incertidumbre: **Baja-Media**
		- Dependencias: 4.1c (Use Cases listos) (FS)
		- Spike: **No**
		- PERT: Optimista 2hs, Probable 3hs, Pesimista 5hs
		- Nota: Orquestador simple, complejidad está en 4.1c

	- 4.1e **MaintenanceAlarm - Frontend UI** (RF-007).
Componentes visuales para gestión de alarmas de mantenimiento. Componentes: MaintenanceAlarmsListScreen (página principal desde MachineDetailScreen), AlarmCard (nombre, descripción, target hours, veces disparada, badges Activa/Inactiva, botones Ver/Editar/Desactivar), AlarmDetailModal (popup con info completa: historial de disparos, última vez, metadata), CreateEditAlarmScreen (página formulario con inputs: name required max 100, description optional max 500, targetOperatingHours required number > 0, isActive toggle default true, validaciones React Hook Form + Zod), ConfirmationModal (resumen datos, '¿Estás seguro?', botones Cancelar/Confirmar). Navegación: Desde MachineDetailScreen botón/tab 'Alarmas de Mantenimiento' → /machines/:id/maintenance-alarms. Filtros: Activas/Todas. Estados: loading skeleton, empty state 'No hay alarmas programadas. Crea la primera.', error con retry. Estilos Tailwind, responsive. NO lógica de API - solo UI con props mockeadas.
		- Horas estimadas: **6**hs
		- Margen: ±**1.2**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 0.14, 3.2 (FS)
		- Spike: **No**
		- PERT: Optimista 4hs, Probable 6hs, Pesimista 8hs
		- Patrón: Similar a 4.2c (MachineEvent UI) y 8.3 (Notification UI)

	- 4.1f **MaintenanceAlarm - Frontend Integration** (RF-007).
Integración con API y gestión de estado. Service: Crear maintenanceAlarmService.ts con métodos type-safe (getMachineAlarms, createAlarm, updateAlarm, deleteAlarm). TanStack Query Hooks: useMachineAlarms(machineId) con refetch on focus, useCreateAlarm(machineId) mutation con invalidación cache + toast, useUpdateAlarm(machineId) mutation, useDeleteAlarm(machineId) mutation. Integration: Conectar MaintenanceAlarmsListScreen con useMachineAlarms, conectar CreateEditAlarmScreen con create/update mutations, implementar filtros reactivos, conectar AlarmDetailModal con data seleccionada. Forms: React Hook Form + Zod validation alineado con contracts, estados loading/error/success, toast notifications. Navegación: Integrar botón en MachineDetailScreen. Testing: Flujo completo crear → API → BD → toast → lista actualizada → editar → desactivar.
		- Horas estimadas: **4**hs
		- Margen: ±**0.8**hs (P80)
		- Incertidumbre: **Baja-Media**
		- Dependencias: 4.1b, 4.1e (FS)
		- Spike: **No**
		- PERT: Optimista 3hs, Probable 4hs, Pesimista 6hs
		- Patrón: Similar a 4.2d (MachineEvent Integration) y 8.4 (Notification Integration)

	- 4.2a **MachineEvent - Domain + Contracts + Persistence ** (RF-008).
Infraestructura de datos para eventos de máquina (historial homemade). Domain: Entidades MachineEvent y MachineEventType YA existen (verificar machine-event.entity.ts y machine-event-type.entity.ts). MachineEvent usa typeId (string) referenciando a MachineEventType (patrón crowdsourcing similar a MachineType). Campos MachineEvent: {id, machineId, typeId, title, description, createdBy, createdAt, isSystemGenerated, metadata?}. NO usar enums hardcodeados (category, severity) - typeId da flexibilidad total. MachineEventType: {id, name, normalizedName, systemGenerated, createdBy?, timesUsed, isActive}. Modificar Machine model para agregar eventsHistory?: IMachineEvent[] como subdocumento. Extender IMachineRepository con métodos: addEvent(machineId, event), getMachineEvents(machineId, filters), searchEventTypes(query) para autocompletar. Contracts: Verificar/crear machine-event.contract.ts con schemas Zod (MachineEventSchema, CreateMachineEventRequestSchema sin category/severity, GetMachineEventsQuerySchema con filtros typeId/dateRange/search, EventTypeSchema para CRUD tipos). Persistence: Verificar/crear MachineEventSubSchema en machine.model.ts, implementar métodos en MachineRepository, índices compuestos para performance. Verificar MachineEventTypeSchema separado (colección independiente como MachineType).
		- Horas estimadas: **5**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja-Media**
		- Dependencias: 3.1, 1.1, 1.2 (FS)
		- Spike: **No**
		- PERT: Optimista 3hs, Probable 5hs, Pesimista 7hs
		- Patrón: MachineEvent subdocumento en Machine + MachineEventType entidad independiente (como MachineType)
		- Nota: Entidades base YA existen, tarea enfocada en integración con Machine y contratos

	- 4.2b **MachineEvent - Application Layer Backend** (RF-008).
Lógica de negocio y API REST para eventos y tipos de eventos. Use Cases: Crear 5 casos modulares: (1) CreateMachineEventUseCase (validaciones ownership/shared-access, construir MachineEvent, invocar MachineRepository.addEvent), (2) GetMachineEventsUseCase (filtros typeId/dateRange/search + paginación), (3) CreateEventTypeUseCase (crear nuevo tipo si no existe, normalizar nombre para evitar duplicados, incrementar timesUsed), (4) SearchEventTypesUseCase (autocomplete para UI, búsqueda por nombre normalizado), (5) GetPopularEventTypesUseCase (tipos más usados para sugerencias). Controllers: (A) MachineEventController con 2 endpoints: POST /api/machines/:machineId/events (reportar evento manual, body: {typeId o typeName si es nuevo, title, description, metadata?}), GET /api/machines/:machineId/events?typeId&dateFrom&dateTo&search&page&limit (historial con filtros). (B) EventTypeController con 2 endpoints: GET /api/event-types/search?q=mantenimiento (autocomplete), GET /api/event-types/popular?limit=10 (sugerencias). Middleware autorización: Validar ownership (machine.ownerId === userId) o shared access con permissions 'viewEvents'. Integración notificaciones: Eventos user-created NO generan notificación automática (evitar spam), solo eventos sistemáticos críticos (QUICKCHECK_FAIL en 6.6) invocan AddNotificationUseCase. Validaciones Zod en controllers. DI con tsyringe. Result pattern para manejo errores.
		- Horas estimadas: **6**hs
		- Margen: ±**1.2**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 4.2a, 8.2 (FS)
		- Spike: **No**
		- PERT: Optimista 4hs, Probable 6hs, Pesimista 9hs
		- Nota: CRUD de MachineEventType es clave para crowdsourcing de tipos

	- 4.2c **MachineEvent - Frontend UI - Historial y Reportar Eventos** (RF-008).
Componentes visuales para historial y reporte de eventos. Componentes: EventHistoryScreen (página completa accesible desde MachineDetailScreen con breadcrumbs), EventList (lista con items), EventItem (card con preview: icono genérico por tipo sistema/manual, título, tipo de evento, timestamp relativo, badge "Automático"/"Manual", click expande modal detalle), EventDetailModal (modal con info completa: título, descripción full, tipo de evento, reportado por, createdAt, metadata renderizado como JSON pretty, botones acciones rápidas placeholder: "Contactar Proveedor", "Crear Tarea" - no funcionales), ReportEventModal (formulario: Autocomplete typeId con SearchEventTypesAPI (permite crear nuevo si no existe), input title, textarea description, textarea metadata JSON opcional con validación, botón "Reportar Evento"). Filtros simplificados: Select tipo de evento (cargado dinámicamente desde EventTypes), DateRangePicker, buscador texto (filtra por title/description client-side). Estados: loading skeleton, empty state ("No hay eventos registrados. Reporta el primero."), error con retry. Estilos Tailwind, responsive. NO lógica de API - solo UI con props mockeadas.
		- Horas estimadas: **6**hs
		- Margen: ±**1.2**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 0.14, 3.2 (FS)
		- Spike: **No**
		- PERT: Optimista 4hs, Probable 6hs, Pesimista 8hs
		- Nota: Autocomplete EventType es clave para UX crowdsourcing

	- 4.2d **MachineEvent - Frontend Integration** (RF-008).
Integración con API y lógica de estado. Service: Crear machineEventService.ts con métodos type-safe (getMachineEvents, createMachineEvent, getEventDetail). TanStack Query Hooks: useMachineEvents(machineId, filters) con refetchInterval: 60000 (polling cada 60s, menos frecuente que notificaciones), useCreateMachineEvent() mutation con invalidación cache + toast success. Integration: Conectar EventHistoryScreen con useMachineEvents, conectar ReportEventModal con useCreateMachineEvent, implementar filtros reactivos (URL query params sync), conectar EventDetailModal con data del item seleccionado. Navegación: Agregar botón "Ver Historial" en MachineDetailScreen que navega a /machines/:id/events, agregar botón "Reportar Evento" en MachineDetailScreen que abre ReportEventModal. Validaciones: Usar schemas Zod compartidos, manejo de errores con mensajes claros. Testing: Flujo completo reportar evento → API → BD → toast success → lista actualizada.
		- Horas estimadas: **4**hs
		- Margen: ±**0.8**hs (P80)
		- Incertidumbre: **Baja-Media**
		- Dependencias: 4.2b, 4.2c (FS)
		- Spike: **No**
		- PERT: Optimista 3hs, Probable 4hs, Pesimista 6hs
		- Patrón: Similar a 8.4 (Notifications Integration)

	- 4.2e **Optimización de almacenamiento - Eventos** (NFR).
Limitación automática de eventos por máquina y configurabilidad de registro.
		- **Objetivo**: Evitar crecimiento ilimitado de `Machine.eventsHistory[]` que afecta 
		performance y almacenamiento. Implementar límite configurable (~100 eventos/máquina) con 
		eliminación FIFO automática y permitir al usuario configurar qué tipos de eventos 
		automáticos desea registrar.
		
		- **Alcance**:
			- **Backend - Domain/Persistence**:
				- Agregar campo en `Machine`: `eventHistoryLimit` (número, default 100)
				- Agregar en `User`: `eventTypePreferences` (array de typeIds a ignorar)
				- Middleware Mongoose pre-save: verificar límite y eliminar eventos más antiguos (FIFO)
			- **Backend - Application Layer**:
				- Modificar `CreateMachineEventUseCase`:
					- Verificar `user.eventTypePreferences` antes de crear evento automático
					- Si typeId está en lista de ignorados Y es isSystemGenerated=true → NO crear
				- Nuevo `UpdateEventPreferencesUseCase`:
					- Endpoint: PATCH `/users/me/event-preferences`
					- Body: `{ ignoredEventTypeIds: string[] }`
					- Validación: verificar que typeIds existan
			- **Frontend - UI**:
				- Sección en Configuración/Ajustes: "Gestión de Eventos Automáticos"
				- Lista de tipos de eventos del sistema con toggle on/off
				- Warning: "Desactivar registro puede afectar historial y notificaciones"
			- **Frontend - Integration**:
				- Hook: `useEventPreferences()` con GET/UPDATE mutations
				- Indicador visual en EventHistoryScreen: "Mostrando últimos X eventos (límite: 100)"
		
		- **Descripción Funcional**:
			1. **Límite Automático**: Cuando `Machine.eventsHistory.length > eventHistoryLimit`, 
			el middleware elimina los eventos más antiguos (ordenados por `createdAt`) antes de 
			guardar. Hard delete (no soft delete) porque datos históricos antiguos no son críticos.
			2. **Configurabilidad por Usuario**: Usuario puede marcar ciertos tipos de eventos 
			automáticos como "no registrar" (ej: "Inicio de operación diaria", "Fin de turno"). 
			Solo aplica a eventos con `isSystemGenerated=true`.
			3. **Preservación de Eventos Críticos**: Eventos manuales (creados por usuario) NUNCA 
			se ignoran por preferencias (solo por límite FIFO).
		
		- **Consideraciones de Optimización**:
			- **Performance**: Middleware eficiente usando Mongoose `$slice` en queries
			- **Migración**: Script para aplicar límite a máquinas existentes (eliminar eventos viejos)
			- **Testing**: Unit tests con mocks, verificar orden FIFO, verificar preferencias
			- **Documentación**: Actualizar docs/machine-events-system-architecture.md
		
		- Horas estimadas: **8**hs
		- Margen: ±**1.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 4.2a, 4.2b (FS) - Requiere sistema base implementado
		- Spike: **No**
		- Sprint tentativo: **Sprint #14 o #15** (Post-MVP, NFR)
		- PERT: Optimista 6hs, Probable 8hs, Pesimista 11hs

	- 4.3 **Historial unificado** (RF-009).
Timeline consolidado de manttos, incidencias y quickchecks.
		- Horas estimadas: **15**hs
		- Margen: ±**3.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 4.2, 6.3 (FS)
		- Spike: **No**

5. **Alertas & Scheduling** (RF-010)

	- 5.1 **Scheduler** (agenda/node-cron).
Job runner por fecha/hora; tolerante a reinicios simples.
		- Horas estimadas: **10**hs
		- Margen: ±**2.5**hs (P80)
		- Incertidumbre: **Alta**
		- Dependencias: 4.1 (FS)
		- Spike: **No**

	- 5.2 **Generación + persistencia de alertas**.
Creación, estados y trazabilidad de alertas.
		- Horas estimadas: **7**hs
		- Margen: ±**1.2**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 5.1 (FS)
		- Spike: **No**

	- 5.3 **Hook a Centro de Notificaciones**.
Emisión hacia la bandeja central de 8.x.
		- Horas estimadas: **4**hs
		- Margen: ±**0.7**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 5.2 (FS), SS con 8.1
		- Spike: **No**

	- 5.4 **Posponer Alertas de Mantenimiento** [Should Have].
Funcionalidad para posponer temporalmente alertas sin afectar configuración base. Backend: Agregar campo postponedUntil (Date) a Alert model, endpoint PATCH /alerts/:alertId/postpone con body {postponeDays}, lógica para calcular fecha de reactivación (now + postponeDays), modificar scheduler para evaluar postponedUntil antes de disparar alerta (if currentDate < postponedUntil, skip trigger), mantener configuración original de intervalos (cada X horas de uso). Frontend: Modal de acciones en notificación de alerta con botones "Tomar Acción" y "Posponer", formulario posponer con input numérico para días (validación 1-365 días), confirmación con fecha calculada de reactivación, opciones de acción rápida (contactar proveedor, hacer QuickCheck, ver historial). UI debe mostrar estado "Pospuesta hasta [fecha]" en alertas postponidas. Historial de posposiciones para auditoría.
		- Horas estimadas: **11**hs
		- Margen: ±**2.0**hs (P80)
		- Incertidumbre: **Media-Alta**
		- Dependencias: 5.2, 5.3, 8.2 (FS)
		- Spike: **No**
		- PERT: Optimista 8hs, Probable 11hs, Pesimista 15hs
		- MoSCoW: **Should Have**

6. **QuickCheck** (RF-011, RF-017)

	- 6.1 **Domain + Persistence** (RF-011).
Capa de Dominio y Persistencia: Definir entidades QuickCheckTemplate y QuickCheckItem con Value Objects y reglas de negocio. Crear interfaces de repositorios (IQuickCheckTemplateRepository). Implementar schemas Mongoose (QuickCheckTemplateSchema, QuickCheckItemSchema) con índices. Crear contratos Zod compartidos (CreateQuickCheckTemplateDTO, QuickCheckItemDTO) para validación isomórfica. Mappers entre Domain ↔ Persistence.
		- Horas estimadas: **4.5**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja-Media**
		- Dependencias: 1.1, 1.2, 1.3 (FS)
		- Spike: **No**
		- PERT: Optimista 3hs, Probable 4hs, Pesimista 6hs

	- 6.2a **UI Creación de QuickCheck** (RF-011).
Capa de Presentación - Creación: Screen CreateQuickCheckScreen con formulario para nombrar template. Componente QuickCheckItemEditor (similar a ToDo app) para agregar/eliminar items dinámicamente. ViewModel useQuickCheckTemplate para gestionar estado local del template y su lista de items. Validaciones en tiempo real. Preparar objeto para envío: {name, items: ["Frenos", "Luces", ...]}.
		- Horas estimadas: **5**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 6.3, 0.14 (FS)
		- Spike: **No**
		- PERT: Optimista 3hs, Probable 5hs, Pesimista 7hs

	- 6.2b **UI Ejecución de QuickCheck** (RF-011).
Capa de Presentación - Ejecución: Screen ExecuteQuickCheckScreen con selección de máquina y template. Componente QuickCheckExecutionForm renderizando items con toggles ✅/❌. TextArea para observaciones. ViewModel useQuickCheckExecution para gestionar estado de ejecución y resultado (OK/FAIL). Calcular scoring básico. Preparar objeto resultado para envío: {templateId, machineId, results: [{itemId, status: "OK"/"FAIL"}], observations, overallResult}.
		- Horas estimadas: **7.5**hs
		- Margen: ±**1.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 6.3, 3.1, 0.14 (FS)
		- Spike: **No**
		- PERT: Optimista 5hs, Probable 7hs, Pesimista 10hs

	- 6.3 **Application Layer Backend** (RF-011).
Capa de Aplicación: Implementar Use Cases (CreateQuickCheckTemplateUseCase, GetTemplatesUseCase, UpdateTemplateUseCase, ExecuteQuickCheckUseCase). Controllers y Routes REST (POST/GET/PUT /api/quickcheck/templates, POST /api/machines/:id/quickcheck/execute). Validación de DTOs con Zod. Orquestación de repositorios. Lógica de negocio para scoring de resultados. Manejo de errores estructurado. Integración con DI container (tsyringe).
		- Horas estimadas: **6.5**hs
		- Margen: ±**1.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 6.1 (FS)
		- Spike: **No**
		- PERT: Optimista 4hs, Probable 6hs, Pesimista 9hs

	- 6.4 **API Integration Frontend** (RF-011).
Capa de Integración Frontend: Crear/actualizar services (quickCheckService.ts, templateService.ts). Implementar métodos para CRUD de templates y ejecución de QuickCheck. Integración con TanStack Query (queries y mutations). Manejo de estados de loading/error/success. Invalidación de cache apropiada. Type-safe API calls usando contratos compartidos. Conectar ViewModels con API services.
		- Horas estimadas: **3.5**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 6.3, 6.2a, 6.2b (FS)
		- Spike: **No**
		- PERT: Optimista 2hs, Probable 3hs, Pesimista 5hs

	- 6.5 **QuickCheck User Tracking** (RF-011 Enhancement).
Capturar metadata del responsable al ejecutar QuickCheck para trazabilidad y auditoría. Frontend: Modal pre-submit con inputs para technicianName (requerido) y technicianId (opcional: DNI, matrícula). Backend: Agregar campos technicianName, technicianId, executorUserId al QuickCheckExecution model/schema/DTO. Implementación en todas las capas (Domain → Persistence → Application → Presentation). Validaciones Zod en shared/.
		- Horas estimadas: **4.2**hs
		- Margen: ±**0.8**hs (P80)
		- Incertidumbre: **Baja-Media**
		- Dependencias: 6.4 (FS)
		- Spike: **No**
		- PERT: Optimista 3hs, Probable 4hs, Pesimista 6hs
		- **Tarea agrupada:** [1] QuickCheck tracking

	- 6.6 **Aviso QuickCheck no aprobado + Evento Automático** (RF-017) [Should-Have].
Doble integración: Notificaciones + Eventos de Máquina. Funcionalidad: Cuando ExecuteQuickCheckUseCase detecta resultado FAIL: (1) Crear/obtener MachineEventType sistemático "QuickCheck Desaprobado" (systemGenerated: true) si no existe. (2) Invocar CreateMachineEventUseCase para registrar evento automático {typeId: [QuickCheck Desaprobado], title: 'QuickCheck FAIL: [machine]', description: 'Detalle de items fallidos...', isSystemGenerated: true, createdBy: executorUserId, metadata: {quickCheckId, failedItems: [...], score, totalItems, technicianName}}. (3) Invocar AddNotificationUseCase para notificar owner {notificationType: 'warning', message: 'QuickCheck FAIL: [machine] tiene [N] items reprobados', actionUrl: '/machines/:id/quickchecks/:qcId', sourceType: 'QUICKCHECK'}. Validar Observer Pattern detecta notificación y dispara toast. Validar evento visible en historial de máquina con metadata completo. Testing e2e: QC fail → tipo evento creado/obtenido → evento + notificación guardados → toast disparado → historial actualizado. Manejo errores: Log si falla creación evento/notificación (NO bloquear flujo QC principal).
		- Horas estimadas: **2**hs
		- Margen: ±**0.5**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 6.3, 8.2, 8.4, 4.2b (FS)
		- Spike: **No**
		- PERT: Optimista 1.5hs, Probable 2hs, Pesimista 3hs

7. **Repuestos** (RF-012..RF-014) [NiceToHave]

	- 7.1 **Alta/edición repuesto** (RF-012/014).
CRUD simple atado a máquina.
		- Horas estimadas: **8**hs
		- Margen: ±**1.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 3.1 (FS)
		- Spike: **No**

	- 7.2 **Listado por máquina** (RF-013).
Vista de repuestos con estados básicos.
		- Horas estimadas: **6**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 7.1 (FS)
		- Spike: **No**

8. **Centro de Notificaciones** (RF-016)

	- 8.1 **Domain + Contracts + Persistence**.
Capa de Dominio y Persistencia: Definir estructura Notification como subdocumento de User (notificationType, message, wasSeen, notificationDate, sourceId, sourceType). Extender User schema en Mongoose agregando array de notifications con índices apropiados. Crear contratos Zod compartidos (AddNotificationDTO, NotificationDTO, MarkAsSeenDTO). NO crear entidad independiente ni repositorio separado - extender UserRepository. Implementar métodos básicos para add/get/markAsSeen en UserRepository.
		- Horas estimadas: **5**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja-Media**
		- Dependencias: 1.1, 1.2, 1.3 (FS)
		- Spike: **No**
		- PERT: Optimista 4hs, Probable 5hs, Pesimista 7hs

	- 8.2 **Application Layer Backend**.
Capa de Aplicación: Implementar 4 Use Cases modulares: AddNotificationUseCase (llamado desde otros módulos), GetUserNotificationsUseCase (retorna lista filtrada por tipo/estado), MarkNotificationsAsSeenUseCase (batch update), CountUnreadNotificationsUseCase (para badge). Controllers y Routes REST: GET /api/notifications, PATCH /api/notifications/mark-as-seen, GET /api/notifications/unread-count. Validación de DTOs con Zod. Integración con UserRepository. Manejo estructurado de errores. DI con tsyringe.
		- Horas estimadas: **6**hs
		- Margen: ±**1.2**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 8.1 (FS)
		- Spike: **No**
		- PERT: Optimista 5hs, Probable 6hs, Pesimista 8hs

	- 8.3 **Frontend UI Components**.
Componentes visuales: NotificationBadge (contador navbar con badge rojo), NotificationList (página completa con lista), NotificationItem (card individual), NotificationToast (wrapper react-hot-toast, config 5s duration). Estilos con Tailwind. Responsive. Estados vacío/loading/error. Filtros básicos por tipo/estado. Lista paginada simple. NO implementar observer aquí - solo UI.
		- Horas estimadas: **4**hs
		- Margen: ±**0.8**hs (P80)
		- Incertidumbre: **Baja-Media**
		- Dependencias: 0.14, 8.2 (FS)
		- Spike: **No**
		- PERT: Optimista 3hs, Probable 4hs, Pesimista 6hs

	- 8.4 **Frontend Integration + Observer Pattern**.
Integración y tiempo real: Hooks (useNotifications con TanStack Query refetchInterval 30s, useUnreadCount, useMarkAsSeen). NotificationObserver component implementando Observer Pattern: subscription a TanStack Query cache detecta nuevas notificaciones → dispara toasts automáticamente. Services (notificationService.ts con métodos API). Type-safe calls con contratos compartidos. Invalidación cache apropiada. Testing del flujo completo: polling → detección cambios → toast → actualización badge.
		- Horas estimadas: **5**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 8.3, 8.2 (FS)
		- Spike: **No**
		- PERT: Optimista 4hs, Probable 5hs, Pesimista 7hs

	- 8.5 **Documentación del Patrón**.
Documentar patrón de integración para futuros módulos: Cómo llamar AddNotificationUseCase desde otros casos de uso, estructura del DTO, tipos de notificaciones soportados, ejemplos de uso (QuickCheck fail, alerta vencida, evento crítico). README específico en docs/ explicando arquitectura subdocumento y flujo Observer. Facilitar replicación por otros desarrolladores.
		- Horas estimadas: **1**hs
		- Margen: ±**0.3**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 8.2 (FS)
		- Spike: **No**
		- PERT: Optimista 0.5hs, Probable 1hs, Pesimista 1.5hs

	- 8.6 **Optimización de almacenamiento - Notificaciones** (NFR).
Limitación automática de notificaciones por usuario y capacidad de eliminación manual.
		- **Objetivo**: Evitar crecimiento ilimitado de `User.notifications[]` que afecta 
		performance y almacenamiento. Implementar límite configurable (~50-100 
		notificaciones/usuario) con eliminación FIFO automática y permitir eliminación manual 
		por parte del usuario.
		
		- **Alcance**:
			- **Backend - Domain/Persistence**:
				- Agregar campo en `User`: `notificationLimit` (número, default 100)
				- Middleware Mongoose pre-save: verificar límite y eliminar notificaciones más 
				antiguas vistas (`wasSeen=true`) primero, luego las más antiguas en general (FIFO)
				- Método en UserRepository: `deleteNotification(userId, notificationId)`
			- **Backend - Application Layer**:
				- Modificar `AddNotificationUseCase`:
					- Antes de agregar: verificar si se alcanzó límite
					- Priorizar eliminación de notificaciones vistas antes que no vistas
				- Nuevo `DeleteNotificationUseCase`:
					- Endpoint: DELETE `/users/me/notifications/{notificationId}`
					- Validación: verificar que notificación pertenezca al usuario
					- Uso: eliminación manual por el usuario
				- Nuevo `DeleteAllSeenNotificationsUseCase`:
					- Endpoint: DELETE `/users/me/notifications/seen`
					- Elimina todas las notificaciones con `wasSeen=true`
					- Botón "Limpiar leídas" en UI
		
			- **Frontend - UI**:
				- Botón de eliminación individual en `NotificationItem` (ícono X o trash)
				- Botón "Limpiar todas las leídas" en header de `NotificationList`
				- Confirmación modal para "Limpiar todas"
				- Indicador visual: "Mostrando X de máximo Y notificaciones"
			
			- **Frontend - Integration**:
				- Mutation: `useDeleteNotification()` con optimistic update
				- Mutation: `useDeleteAllSeenNotifications()` con invalidación de cache
				- Toast de confirmación: "Notificación eliminada" / "X notificaciones eliminadas"
		
		- **Descripción Funcional**:
			1. **Límite Automático con Prioridad**: Cuando `User.notifications.length > 
			notificationLimit`, el middleware elimina primero notificaciones VISTAS más antiguas, 
			luego NO vistas más antiguas si aún hace falta. Esto preserva notificaciones recientes 
			y no leídas.
			2. **Eliminación Manual**: Usuario puede eliminar notificaciones individuales (botón X) 
			o todas las leídas a la vez (botón "Limpiar leídas"). Útil para mantener lista limpia.
			3. **Hard Delete**: No soft delete porque notificaciones antiguas no son críticas 
			(solo alertas puntuales).
		
		- **Consideraciones de Optimización**:
			- **Performance**: Middleware eficiente, ordenar por `notificationDate`
			- **Migración**: Script para aplicar límite a usuarios existentes (eliminar notificaciones antiguas)
			- **UX**: Optimistic updates para eliminación instantánea en UI
			- **Testing**: Unit tests verificando prioridad de eliminación (vistas primero)
			- **Documentación**: Actualizar docs/Real-time-Notification-System.md
		
		- Horas estimadas: **7**hs
		- Margen: ±**1.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 8.1, 8.2, 8.3 (FS) - Requiere sistema base implementado
		- Spike: **No**
		- Sprint tentativo: **Sprint #14 o #15** (Post-MVP, NFR)
		- PERT: Optimista 5hs, Probable 7hs, Pesimista 10hs

9. **Comunicación entre Usuarios** (RF-015)

	- 9.1 **User Discovery - Descubrimiento de usuarios**.
Módulo para descubrir y explorar usuarios registrados en la plataforma. NO incluye relación de contactos (eso es 9.2).

		- 9.1a **Domain + Contracts + Persistence**.
		Definir UserDirectory como DTO para exponer datos públicos de usuarios (id, nombre, empresa, rubro, especialidad, rol). Crear contratos Zod compartidos: UserDirectoryDTO (output), UserDirectoryQueryDTO (input con filtros: rol?, search?, page, limit). NO crear entidad independiente - reutilizar User existente pero con datos filtrados (public profile). Extender UserRepository con método findPublicProfiles(query) que retorna datos públicos paginados con filtros básicos. Excluir datos sensibles (password, email completo, etc.).
			- Horas estimadas: **2**hs
			- Margen: ±**0.5**hs (P80)
			- Incertidumbre: **Baja**
			- Dependencias: 2.5 (User CRUD completo)
			- Spike: **No**
			- PERT: Optimista 1.5hs, Probable 2hs, Pesimista 3hs

		- 9.1b **Application Layer Backend**.
		Implementar GetUserDirectoryUseCase con lógica de paginación y filtrado por rol/búsqueda. Crear UserDirectoryController con endpoint GET /users/directory?page=1&limit=20&role=cliente&search=palabra. Validaciones: página mínima 1, límite máximo 50, search mínimo 2 caracteres. Response paginado: {users: UserDirectoryDTO[], total, page, limit, hasMore}. NO incluir usuario logueado en resultados (filtrar por id). Manejo de errores: 400 si query params inválidos.
			- Horas estimadas: **3**hs
			- Margen: ±**0.5**hs (P80)
			- Incertidumbre: **Baja**
			- Dependencias: 9.1a (FS)
			- Spike: **No**
			- PERT: Optimista 2hs, Probable 3hs, Pesimista 4hs

		- 9.1c **Frontend UI + Integration**.
		Crear UserDiscoveryScreen con lista paginada de usuarios mostrando avatar, nombre, empresa/rubro, especialidad, rol badge. Incluir barra de búsqueda (debounced 500ms), filtro por rol (dropdown), paginación infinita o botón "Cargar más". Botón "Agregar contacto" en cada item (solo si NO está ya en contactos). Estados: loading, empty ("No hay usuarios"), error. Hook useUserDirectory(filters) con TanStack Query para GET /users/directory. Mutation useAddContact(userId) para agregar contacto (conecta con 9.2b). Navegación: accesible desde menú principal o sección "Descubrir usuarios". Validaciones: deshabilitar "Agregar" si ya es contacto (verificar contra lista de contactos locales).
			- Horas estimadas: **3**hs
			- Margen: ±**0.5**hs (P80)
			- Incertidumbre: **Baja**
			- Dependencias: 9.1b, 9.2b (FS) - Requiere endpoint de contactos para verificar duplicados
			- Spike: **No**
			- PERT: Optimista 2.5hs, Probable 3hs, Pesimista 4hs

	- 9.2 **Contact Management - Gestión de contactos personal**.
Módulo para mantener lista de contactos del usuario (agenda personal). Relación unidireccional (usuario A agrega a B, B no necesita aceptar).

		- 9.2a **Domain + Contracts + Persistence**.
		Definir Contact como subdocumento en User: {userId: string, addedAt: Date}. Extender User schema agregando array contacts: Contact[] con índice en userId para búsquedas rápidas. Crear contratos Zod: AddContactDTO {contactUserId: string}, ContactDTO {id, userId, name, empresa, addedAt} (enriquecido con datos del usuario referenciado). NO crear entidad independiente ContactList - usar subdocumento approach (patrón probado en Notifications/Events). Extender UserRepository con métodos: addContact(userId, contactUserId), removeContact(userId, contactUserId), getContacts(userId) que incluye populate de datos básicos del contacto.
			- Horas estimadas: **3**hs
			- Margen: ±**0.5**hs (P80)
			- Incertidumbre: **Baja**
			- Dependencias: 2.5 (User schema existente)
			- Spike: **No**
			- PERT: Optimista 2hs, Probable 3hs, Pesimista 4hs

		- 9.2b **Application Layer Backend**.
		Implementar 3 Use Cases: AddContactUseCase (validar que contacto exista, que no sea uno mismo, que no esté duplicado), RemoveContactUseCase (validar que exista en lista), GetUserContactsUseCase (retornar lista enriquecida con datos públicos). Crear ContactController con endpoints: POST /users/me/contacts (body: {contactUserId}), DELETE /users/me/contacts/:contactId, GET /users/me/contacts (retorna lista con populate de nombre, empresa, etc.). Validaciones: usuario no puede agregarse a sí mismo, contacto debe existir y estar activo, máximo 100 contactos por usuario (límite soft para MVP). Manejo de errores: 404 si contacto no existe, 409 si ya está agregado, 400 si es el mismo usuario.
			- Horas estimadas: **4**hs
			- Margen: ±**0.5**hs (P80)
			- Incertidumbre: **Media**
			- Dependencias: 9.2a (FS)
			- Spike: **No**
			- PERT: Optimista 3hs, Probable 4hs, Pesimista 5hs

		- 9.2c **Frontend UI + Integration**.
		Crear MyContactsScreen con lista de contactos mostrando avatar, nombre, empresa, fecha agregado. Acciones por contacto: botón "Enviar mensaje" (navega a chat, requiere 9.3c), botón "Eliminar" (confirmación modal). Acceso desde múltiples lugares: menú principal, botón floating en UserDiscoveryScreen, shortcut en navigation bar. Estados: loading, empty ("No tienes contactos aún. Descubre usuarios y agrégalos"), error con retry. Hooks: useContacts() para GET /users/me/contacts, useAddContact() para POST, useRemoveContact() para DELETE con confirmación y optimistic update. Integración: al agregar contacto desde UserDiscoveryScreen (9.1c), mostrar toast success y actualizar caché. Al eliminar, confirmación: "¿Eliminar a [nombre] de tus contactos?". Navegación: desde ContactItem → botón mensaje → navega a /chat/:contactUserId (requiere 9.3c).
			- Horas estimadas: **4**hs
			- Margen: ±**0.5**hs (P80)
			- Incertidumbre: **Media**
			- Dependencias: 9.2b (FS)
			- Spike: **No**
			- PERT: Optimista 3hs, Probable 4hs, Pesimista 5hs

	- 9.3 **Messaging - Mensajería interna simple**.
Sistema de chat básico 1-a-1 entre contactos. NO incluir features avanzadas (grupos, multimedia, presencia online, typing indicators). Versión 0.1 / MVP.

		- 9.3a **Domain + Contracts + Persistence**.
		Definir Message como entidad independiente (NO subdocumento, NO crear colección chats) con schema SIMPLIFICADO: {id, participants: [userIdA, userIdB] (array ordenado alfabéticamente para evitar duplicados A-B vs B-A), senderId: string (quién envió, necesario para UI burbujas), content: string (trim, non-empty, máx 500 chars), sentAt: Date}. Crear índice compuesto ÚNICO: {participants: 1, sentAt: -1} para queries eficientes de conversación. Crear MessageRepository con métodos REDUCIDOS: create(message), findConversationMessages(participants, options: {limit, before?: Date}) para cursor-based pagination. Definir contratos Zod: SendMessageDTO {toUserId, content}, MessageDTO {id, participants, senderId, content, sentAt}. Validación: content non-empty después de trim, máx 500 caracteres, participants siempre ordenado [min, max] al crear.
			- Horas estimadas: **3**hs
			- Margen: ±**0.5**hs (P80)
			- Incertidumbre: **Baja**
			- Dependencias: 2.5, 9.2a (FS) - Requiere User y Contact existentes
			- Spike: **No**
			- PERT: Optimista 2hs, Probable 3hs, Pesimista 4hs
			- Nota: Reducido de 4hs a 3hs por simplificación (eliminar wasRead, ConversationDTO, getUnreadCount)

		- 9.3b **Application Layer Backend**.
		Implementar SOLO 2 Use Cases: SendMessageUseCase (validar que destinatario sea contacto del sender, crear mensaje con participants ordenado [min, max], NO enviar notificación en MVP), GetConversationMessagesUseCase (retornar mensajes paginados entre dos usuarios con cursor-based pagination usando before=sentAt). Crear MessageController con SOLO 2 endpoints: POST /messages (body: {toUserId, content}), GET /messages/:contactUserId?limit=50&before=<ISODate> (mensajes de conversación específica). ELIMINAR: GET /conversations (lista de conversaciones), PATCH /messages/read (mark as read), endpoints de unread count. Validaciones: sender debe tener a receiver como contacto (unidireccional), content requerido y no vacío después de trim, contactUserId debe existir. Paginación cursor-based: limit default 50, máximo 100, before opcional para mensajes más viejos que timestamp dado. Response: {messages: MessageDTO[], hasMore: boolean}. Ordenamiento: sentAt DESC (más recientes primero).
			- Horas estimadas: **3**hs
			- Margen: ±**0.5**hs (P80)
			- Incertidumbre: **Baja**
			- Dependencias: 9.3a (FS)
			- Spike: **No**
			- PERT: Optimista 2hs, Probable 3hs, Pesimista 4hs
			- Nota: Reducido de 5hs a 3hs por simplificación (eliminar GetConversationsList, MarkAsRead, validaciones complejas)

		- 9.3c **Frontend UI - Chat Components**.
		Crear componentes SIMPLIFICADOS (sin ConversationList): ChatScreen (pantalla completa accesible SOLO desde contacto vía /chat/:contactUserId), MessageList (lista de mensajes con cursor-based pagination al hacer scroll up, alineación izq/der según senderId), MessageInput (textarea con botón enviar, contador caracteres 0/500, deshabilitar si vacío), MessageItem (burbuja con contenido, timestamp, SIN indicador de leído). ELIMINAR: ConversationList, badge unread, last message preview, indicadores de leído. Estilos: burbujas diferenciadas por color (senderId === currentUserId → derecha/azul, sino → izquierda/gris), timestamps formato relativo ("hace 5 min", "ayer 14:30"), scroll automático al fondo al abrir chat y al enviar mensaje, scroll sticky al recibir nuevo (solo si ya estaba al fondo). Estados: loading inicial, empty ("Inicia la conversación enviando un mensaje"), error con retry. Paginación: botón "Cargar más antiguos" al hacer scroll top o infinite scroll con IntersectionObserver.
			- Horas estimadas: **4**hs
			- Margen: ±**0.5**hs (P80)
			- Incertidumbre: **Media**
			- Dependencias: 9.3b (FS)
			- Spike: **No**
			- PERT: Optimista 3hs, Probable 4hs, Pesimista 5hs
			- Nota: Reducido de 5hs a 4hs por eliminar ConversationList y lógica de unread

		- 9.3d **Frontend Integration + Polling**.
		Integrar componentes con backend: hook useConversationMessages(contactUserId) con polling cada 10s SOLO cuando ChatScreen está montado (useEffect con enabled flag), useSendMessage(contactUserId) con optimistic update (agregar mensaje temporalmente a caché con id generado, reemplazar con real al recibir response). ELIMINAR: useConversations() (no hay lista de conversaciones), markAsRead hooks, badge unread global. Navegación ÚNICA: desde MyContactsScreen → botón "Enviar mensaje" → navega a /chat/:contactUserId. Caché: usar TanStack Query con queryKey ['messages', contactUserId], agregar mensaje optimistamente con onMutate, invalidar caché al enviar (onSuccess). Cursor pagination: al hacer scroll top, cargar mensajes más antiguos con before=oldestMessage.sentAt. Testing: flujo completo enviar mensaje → ver en conversación → optimistic update → response confirma → receptor polling (10s) recibe mensaje.
			- Horas estimadas: **3**hs
			- Margen: ±**0.5**hs (P80)
			- Incertidumbre: **Baja**
			- Dependencias: 9.3c (FS)
			- Spike: **No**
			- PERT: Optimista 2hs, Probable 3hs, Pesimista 4hs
			- Nota: Reducido de 4hs a 3hs por eliminar useConversations, markAsRead, badge unread

10. **Búsqueda & Filtros** (RF-018) [Post-MVP]

	- 10.1 **Query service + índices**.
Texto simple/estado y endpoints de búsqueda.
		- Horas estimadas: **9**hs
		- Margen: ±**1.8**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 1.2 (FS)
		- Spike: **No**

	- 10.2 **UI de búsqueda global**.
Barra, filtros y resultados.
		- Horas estimadas: **10**hs
		- Margen: ±**2.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 10.1 (FS)
		- Spike: **No**

11. **Ayuda & Guías** (RF-019)

	- 11.1 **Ayuda inline mínima** / "cómo usar esta página" [NiceToHave].
Tooltips/accordions por pantalla.
		- Horas estimadas: **6**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 0.10 (FS)
		- Spike: **No**

	- 11.2 **Tutorial overlay / tours** [Post-MVP].
Onboarding guiado paso a paso.
		- Horas estimadas: **12**hs
		- Margen: ±**2.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 11.1 (FS)
		- Spike: **No**

12. **Accesibilidad & UX**

	- 12.1 **Responsive grid & breakpoints**.
Layouts móviles/desktop.
		- Horas estimadas: **6**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 0.10 (FS)
		- Spike: **No**

	- 12.2 **A11y mínima** (focus, labels, contraste).
Roles/ARIA y navegación con teclado.
		- Horas estimadas: **6**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 0.10 (FS)
		- Spike: **No**

	- 12.3 **Pruebas visuales móviles/desktop**.
Validación en 2–3 navegadores + móvil.
		- Horas estimadas: **5**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 12.1 (FS)
		- Spike: **No**

	- 12.4a **Setup navegación básica + React Router**.
Frontend: Configuración básica de React Router con definición de rutas principales, navegación entre páginas, actualización de URLs, rutas protegidas simples por autenticación, y layout básico. Establece la navegación fundamental para cambio de páginas y URLs sin complejidades adicionales.
		- Horas estimadas: **4**hs
		- Margen: ±**0.8**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 0.14, 2.2 (FS)
		- Spike: **No**

	- 12.4b **Navegación avanzada + UX**.
	Frontend: Extensión del routing con lazy loading de rutas, breadcrumbs, guards de navegación por rol, navegación programática con hooks personalizados, layouts anidados, y utilidades para transiciones. Mejoras de UX y patrones escalables para desarrollo posterior.
		- Horas estimadas: **4**hs
		- Margen: ±**0.8**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 12.4a, 2.5 (FS)
		- Spike: **No**

	- 12.5 **Theme toggle** (UI + persistencia).
	Implementación del selector de tema claro/oscuro: configuración de Tailwind dark mode, variables CSS para theming, hook `useTheme` para gestión de estado, persistencia en localStorage, toggle UI en header/navbar, y pruebas en componentes principales.
		- Horas estimadas: **2**hs
		- Margen: ±**0.4**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 0.9, 0.14 (FS)
		- Spike: **No**

	- 12.6 **Settings screen** (pantalla de ajustes: tema + idioma + prefs).
	Pantalla de configuración de la app: ruta `/settings`, UI para gestión de preferencias (tema claro/oscuro, idioma español/inglés, otras configuraciones básicas), integración con hooks de tema e i18n, botones para guardar/restaurar defaults, y pruebas de navegación y persistencia.
		- Horas estimadas: **4**hs
		- Margen: ±**0.8**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 12.4a, 12.5, 0.15 (FS)
		- Spike: **No**

	- 12.7 **Navigation Drawer Global**.
	Implementar componente NavigationDrawer/Sidebar para navegación global accesible desde todas las páginas. Tecnología: React Aria o componente custom. Funcionalidad: Estado persistente (abierto/cerrado) con Zustand, responsive (desktop: sidebar, mobile: drawer), links a secciones principales (Dashboard, Máquinas, Mantenimientos, QuickCheck, Notificaciones), animaciones smooth. Integración: Layout wrapper para todas las rutas autenticadas.
		- Horas estimadas: **7**hs
		- Margen: ±**1.2**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 12.4a, 0.10 (FS)
		- Spike: **No**
		- PERT: Optimista 5hs, Probable 7hs, Pesimista 10hs

	- 12.8 **UI Polish - QuickCheck & Wizard**.
	Mejoras rápidas de interfaz usuario. Animaciones de entrada (fade-in/slide-up) para items en QuickCheck results list usando Framer Motion o CSS transitions. Reordenar inputs en MachineRegistrationWizard Step 1 para flujo más natural (Marca → Modelo → Type → Nombre de referencia). Cambios solo en capa de presentación, sin lógica de backend.
		- Horas estimadas: **0.75**hs
		- Margen: ±**0.25**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 6.4, 3.1 (FS)
		- Spike: **No**
		- **Tareas agrupadas:** [2] Animaciones, [4] Reorder inputs

	- 12.9 **UI/UX Enhancement - Simplicidad y Progressive Disclosure** (NFR).
Refinamiento holístico de la experiencia de usuario en todas las pantallas existentes de la aplicación, con foco en simplicidad visual y cognitiva. Objetivo: Mejorar la calidad de uso, comprensión y navegación del sistema sin agregar nuevas funcionalidades core. Aplicar principio de Progressive Disclosure: mostrar primero lo esencial, revelar información adicional de forma gradual y contextual, facilitar exploración sin abrumar. Alcance: (1) Auditoría UX de pantallas principales (Dashboard, Máquinas List/Detail, QuickCheck, Mantenimientos, Notificaciones, Settings), (2) Identificar puntos de sobrecarga cognitiva o información redundante, (3) Rediseño/simplificación de layouts con jerarquía visual clara (tipografía, espaciado, agrupación), (4) Implementar patrones de Progressive Disclosure: tooltips informativos, collapsible sections, tabs/accordions para contenido secundario, estados empty con CTAs claros, (5) Consistencia de componentes: botones, cards, forms, modals con misma estructura y estilo, (6) Testing con usuario (informal) para validar mejoras. NO incluye: nuevas funcionalidades, refactor de backend, cambios en lógica de negocio, rediseño total de identidad visual (mantener guía de estilos existente). Tecnologías: Tailwind CSS utilities, ShadCN UI components (Accordion, Tooltip, Collapsible), Framer Motion para transiciones suaves. Entregables: Pantallas simplificadas con Progressive Disclosure aplicado, documentación de patrones UX adoptados, notas de mejoras implementadas por pantalla.
		- Horas estimadas: **12**hs
		- Margen: ±**2.5**hs (P80)
		- Incertidumbre: **Media-Alta**
		- Dependencias: 12.7, 4.1f, 4.2d, 8.4 (FS) - Requiere features principales implementadas
		- Spike: **No** (refinamiento iterativo sobre código existente)
		- PERT: Optimista 9hs, Probable 12hs, Pesimista 16hs
		- Nota: **Tarea planificada para Sprint #13 o #14** (post-MVP), enfocada en pulido de calidad de uso antes de entregas finales. Se considera requerimiento NO funcional (NFR) que mejora usabilidad sin alterar funcionalidad core.
		- **Tareas conceptuales agrupadas:** [Auditoría UX], [Simplificación layouts], [Progressive Disclosure], [Consistencia componentes], [Testing usuario]

13. **Calidad & Pruebas** (alineado a SQA)

	- 13.1 **Estrategia & DoD QA**.
Criterios de listo y enfoque de pruebas.
		- Horas estimadas: **5**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 0.2 (FS)
		- Spike: **No**

	- 13.2 **Config Jest** (front/back, TS, coverage).
Presets, scripts y coverage.
		- Horas estimadas: **6**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 0.2 (FS)
		- Spike: **No**

	- 13.3a **Unit tests Backend**.
Casos de uso, servicios, validaciones y errores.
		- Horas estimadas: **12**hs
		- Margen: ±**2.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: SS con 2–8
		- Spike: **No**

	- 13.3b **Unit tests Frontend**.
Hooks, utils y lógica de módulos.
		- Horas estimadas: **10**hs
		- Margen: ±**2.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: SS con 2–8
		- Spike: **No**

	- 13.4 **Datos de prueba** (semillas y factories).
Fixtures y factories para tests.
		- Horas estimadas: **4**hs
		- Margen: ±**0.7**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 1.4 (FS)
		- Spike: **No**

	- 13.5 **Sanitización manual por feature**.
Checklist de smoke por pantalla/flujo.
		- Horas estimadas: **8**hs
		- Margen: ±**1.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: SS con 2–9
		- Spike: **No**

	- 13.7 **Triage & fix post-UAT**.
Registro, severidades, fixes y verificación.
		- Horas estimadas: **10**hs
		- Margen: ±**2.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 20.2 (FS)
		- Spike: **No**

	- 13.8 **Smoke E2E de flujos críticos**.
Auth → máquina → recordatorio → notificación → QC.
		- Horas estimadas: **6**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 2–8 (FS)
		- Spike: **No**

	- 13.9 **Gestión de defectos**.
Triage continuo, hotfix path y mini-regresión.
		- Horas estimadas: **6**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: SS con 13.5–13.8
		- Spike: **No**

14. **Seguridad & Hardening**

	- 14.1 **Hashing, rate-limit, CORS**.
Config seguro básico en API.
		- Horas estimadas: **6**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 2.2 (FS)
		- Spike: **No**

	- 14.2 **Validaciones Zod en controllers**.
Validación exhaustiva en endpoints.
		- Horas estimadas: **8**hs
		- Margen: ±**1.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 1.3 (FS)
		- Spike: **No**

	- 14.3 **Permisos por endpoint** (RBAC ligero).
Chequeos de rol en rutas.
		- Horas estimadas: **6**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 2.5 (FS)
		- Spike: **No**

15. **Observabilidad ligera**

	- 15.1 **Logger estructurado** (niveles, request-id).
Logging JSON y correlación simple.
		- Horas estimadas: **5**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 0.2, 0.12 (FS)
		- Spike: **No**

	- 15.2 **Métricas mínimas en logs** (contadores) [Post-MVP].
Contadores por evento/acción en logs.
		- Horas estimadas: **6**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 15.1 (FS)
		- Spike: **No**

16. **Deploy & Demo**

	- 16.1 **Taller Deploy - Conceptos Generales** (Sesión 1).
Primera sesión de conceptos fundamentales de deploy y DevOps.
		- Horas estimadas: **3**hs
		- Margen: ±**0.5**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: —
		- Spike: **No**

	- 16.2 **Taller Deploy - Conceptos Generales** (Sesión 2).
Segunda sesión de conceptos fundamentales de deploy y DevOps.
		- Horas estimadas: **3**hs
		- Margen: ±**0.5**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: —
		- Spike: **No**

	- 16.3 **Taller Deploy - AWS** (Sesión 1).
Primera sesión de capacitación en servicios AWS para deploy.
		- Horas estimadas: **3**hs
		- Margen: ±**0.5**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: —
		- Spike: **No**

	- 16.4 **Taller Deploy - AWS** (Sesión 2).
Segunda sesión de capacitación en servicios AWS para deploy.
		- Horas estimadas: **3**hs
		- Margen: ±**0.5**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: —
		- Spike: **No**

	- 16.5 **Taller Deploy - Azure** (Sesión 1).
Primera sesión de capacitación en servicios Azure para deploy.
		- Horas estimadas: **3**hs
		- Margen: ±**0.5**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: —
		- Spike: **No**

	- 16.6 **Taller Deploy - Azure** (Sesión 2).
Segunda sesión de capacitación en servicios Azure para deploy.
		- Horas estimadas: **3**hs
		- Margen: ±**0.5**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: —
		- Spike: **No**

	- 16.7 **Taller Deploy - Deploy en Práctica**.
Sesión práctica de implementación de deploy en entorno real.
		- Horas estimadas: **3**hs
		- Margen: ±**0.5**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: —
		- Spike: **No**

	- 16.8 **Build & deploy demo** (front estático + API).
Empaquetado, hosting y health-check simple.
		- Horas estimadas: **8**hs
		- Margen: ±**1.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 0.4, 13.2 (FS)
		- Spike: **No**

	- 16.9 **Semillas demo** (usar 1.4).
Carga inicial del dataset de demo.
		- Horas estimadas: **3**hs
		- Margen: ±**0.5**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 1.4 (FS)
		- Spike: **No**

	- 16.10 **Script "reset demo"** [NiceToHave].
	Script idempotente de reinicialización.
		- Horas estimadas: **4**hs
		- Margen: ±**0.7**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 16.9 (FS)
		- Spike: **No**

	- 16.11 **Azure Deploy - Config práctica** (Azure App Service).
		Configuración práctica de deploy en Azure App Service: creación de recursos (App Service + MongoDB Atlas o Cosmos), configuración de variables de entorno, conexión con repositorio GitHub para CI/CD básico, configuración de dominios y SSL, y pruebas de deploy del frontend + backend. Aprovecha el taller universitario del 27 nov.
		- Horas estimadas: **9**hs
		- Margen: ±**1.8**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 16.5, 16.6, 16.8 (FS)
		- Spike: **No**

	- 16.12 **Azure Static Web App - Fix 404 en Refresh**.
		Configurar fallback routing para SPA en Azure Static Web App. Crear archivo staticwebapp.config.json con navigationFallback apuntando a index.html. Soluciona error 404 al refrescar página o acceder directamente a rutas internas (/machines, /quickcheck, etc.). Crítico para usabilidad en producción (compartir links, bookmarks, refresh).
		- Horas estimadas: **1**hs
		- Margen: ±**0.5**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 16.11 (FS)
		- Spike: **No**
		- **Tarea agrupada:** [3] Azure routing fix

17. **Documentación & Capacitación**

	- 17.1 **README + guía arranque dev**.
Setup, scripts y troubleshooting breve.
		- Horas estimadas: **4**hs
		- Margen: ±**0.7**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 0.1 (FS)
		- Spike: **No**

	- 17.2 **API docs** (OpenAPI simple).
Endpoints principales y ejemplos.
		- Horas estimadas: **6**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 2–9 (FS)
		- Spike: **No**

	- 17.3 **Manual breve de usuario** [NiceToHave].
Guía funcional mínima por pantalla.
		- Horas estimadas: **6**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 11.1 (FS)
		- Spike: **No**

18. **Gobernanza de Alcance** (MVP)

	- 18.1 **Scope freeze** (MoSCoW).
Cierre de alcance y criterios.
		- Horas estimadas: **2**hs
		- Margen: ±**0.3**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: —
		- Spike: **No**

	- 18.2 **Control de cambios**.
Registro de desvíos y pases a Post-MVP.
		- Horas estimadas: **3**hs
		- Margen: ±**0.5**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 18.1 (FS)
		- Spike: **No**

	- 18.3 **Feature toggles**.
Flags para diferir capacidades.
		- Horas estimadas: **5**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 0.2 (FS)
		- Spike: **No**

19. **Backlog Post-MVP (consolidado)**

	- 19.1 **Consolidación y tracking del backlog Post-MVP**.
Curaduría y priorización para fases futuras.
		- Horas estimadas: **2**hs
		- Margen: ±**0.3**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 18.2 (FS)
		- Spike: **No**

20. **Gestión del Proyecto & Scrumban** (LOE dominical encadenado)

	- 20.1 **Reporte Académico** (dominical).
Informe semanal de avances/bloqueos y decisiones; "precalienta" la demo.
		- Horas estimadas: **0.9**hs/sprint
		- Margen: ±**0.1**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: Cierre sprint previo (FS)
		- Spike: **No**

	- 20.2 **Demo/UAT con cliente** (dominical).
Demostración, sincronización y feedback/UAT inmediato.
		- Horas estimadas: **1.5**hs/sprint
		- Margen: ±**0.1**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 20.1 (FS)
		- Spike: **No**

	- 20.3 **Sprint Planning dominguero** (dominical).
Planificación de la iteración con foco en ruta crítica.
		- Horas estimadas: **1.3**hs/sprint
		- Margen: ±**0.1**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 20.2 (FS)
		- Spike: **No**

	- 20.4 **Informe de avance** (académico).
Documento extenso que resume y explica todo lo realizado en un conjunto de semanas. Propósito 100% académico, describe progreso, decisiones técnicas, arquitectura implementada, lecciones aprendidas y próximos pasos del proyecto.
		- Horas estimadas: **No aplica** (tarea ya realizada)
		- Horas reales: **1.2**hs
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: Cierre de período de múltiples sprints (FS)
		- Spike: **No**

21. **Pre-Proyecto / Anteproyecto**

	- 21.1 **Talleres** (instancias de guía general).
Participación en sesiones de taller para guía general del proyecto.
		- Horas estimadas: **3**hs
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: —
		- Spike: **No**

	- 21.2 **Tutorías** (guía con tutor asignado).
Sesiones individuales de tutoría con el tutor asignado.
		- Horas estimadas: **1**hs
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: —
		- Spike: **No**

	- 21.3 **Refinamiento de estructura**.
Refinamiento de la estructura general del documento de anteproyecto.
		- Horas estimadas: **No est.**
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: 21.1, 21.2 (FS)
		- Spike: **No**

	- 21.4 **Refinar descripción de cliente**.
Mejora y refinamiento de la descripción del cliente objetivo.
		- Horas estimadas: **No est.**
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: 21.3 (FS)
		- Spike: **No**

	- 21.5 **Refinar introducción**.
Refinamiento de la introducción del proyecto.
		- Horas estimadas: **No est.**
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: 21.3 (FS)
		- Spike: **No**

	- 21.6 **Refinar presentación del problema**.
Mejora en la presentación y definición del problema a resolver.
		- Horas estimadas: **No est.**
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: 21.4, 21.5 (FS)
		- Spike: **No**

	- 21.7 **Investigar competencia**.
Análisis y documentación de la competencia existente.
		- Horas estimadas: **No est.**
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: 21.6 (FS)
		- Spike: **No**

	- 21.8 **Redactar alternativas a la solución**.
Documentación de alternativas consideradas para la solución.
		- Horas estimadas: **No est.**
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: 21.7 (FS)
		- Spike: **No**

	- 21.9 **Refinar arquitectura**.
Refinamiento de la propuesta de arquitectura del sistema.
		- Horas estimadas: **No est.**
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: 21.8 (FS)
		- Spike: **No**

	- 21.10 **Refinar tecnologías**.
Refinamiento de la selección y justificación de tecnologías.
		- Horas estimadas: **No est.**
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: 21.9 (FS)
		- Spike: **No**

	- 21.11 **Refinar lista de necesidades**.
Mejora y completitud de la lista de necesidades del cliente.
		- Horas estimadas: **No est.**
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: 21.4 (FS)
		- Spike: **No**

	- 21.12 **Crear sección de procesos identificados**.
Documentación de los procesos de negocio identificados.
		- Horas estimadas: **No est.**
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: 21.11 (FS)
		- Spike: **No**

	- 21.13 **Refinar objetivos del proyecto**.
Refinamiento de los objetivos generales y específicos del proyecto.
		- Horas estimadas: **No est.**
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: 21.6 (FS)
		- Spike: **No**

	- 21.14 **Redactar actores involucrados**.
Identificación y documentación de todos los actores del sistema.
		- Horas estimadas: **No est.**
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: 21.12 (FS)
		- Spike: **No**

	- 21.15 **Refinar requerimientos**.
Refinamiento de los requerimientos funcionales y no funcionales.
		- Horas estimadas: **No est.**
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: 21.13, 21.14 (FS)
		- Spike: **No**

	- 21.16 **Refinar alcances y limitaciones**.
Definición clara de alcances y limitaciones del proyecto.
		- Horas estimadas: **No est.**
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: 21.15 (FS)
		- Spike: **No**

	- 21.17 **Diagramar arquitectura**.
Creación de diagramas de la arquitectura propuesta.
		- Horas estimadas: **No est.**
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: 21.9 (FS)
		- Spike: **No**

	- 21.18 **Hacer diagrama Conceptual de Dominio**.
Creación del diagrama conceptual del dominio del problema.
		- Horas estimadas: **No est.**
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: 21.14, 21.12 (FS)
		- Spike: **No**

	- 21.19 **Planear tareas y sprints**.
Planificación inicial de tareas y sprints del proyecto.
		- Horas estimadas: **No est.**
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: 21.16, 21.17, 21.18 (FS)
		- Spike: **No**

	- 21.20 **Refinamientos varios**.
Refinamientos menores y ajustes finales del documento.
		- Horas estimadas: **No est.**
		- Margen: **No est.**
		- Incertidumbre: **No est.**
		- Dependencias: 21.19 (FS)
		- Spike: **No**

	- 21.21 **Buffer de entrega final**.
Instancia comodín para refinar últimos detalles del proyecto, completar documentación pendiente, finalizar features en curso, realizar verificaciones finales de calidad y atender ajustes de último momento previos a la entrega académica.
		- Horas estimadas: **10**hs
		- Margen: ±**2.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: Cierre Sprint 16 (FS)
		- Spike: **No**

22. **Eventos Académicos** (Hitos sin horas de desarrollo)

	- 22.1 **Entrega Primera Instancia**.
Presentación de primera instancia del proyecto para revisión académica.
		- Fecha: **Noviembre 2025**
		- Horas de desarrollo: **0**hs (Evento/Hito)
		- Dependencias: Finalización Sprint correspondiente
		- Preparación: Incluida en tareas de documentación existentes

	- 22.2 **Entrega Segunda Instancia**.
Presentación de segunda instancia con correcciones y mejoras.
		- Fecha: **Diciembre 2025**
		- Horas de desarrollo: **0**hs (Evento/Hito)
		- Dependencias: 22.1, avances del MVP
		- Preparación: Incluida en tareas de documentación existentes

	- 22.3 **Entrega Final del Proyecto**.
Entrega completa del MVP y documentación final del proyecto.
		- Fecha: **Febrero 2026**
		- Horas de desarrollo: **0**hs (Evento/Hito)
		- Dependencias: Finalización de todos los sprints del MVP
		- Preparación: Incluida en sprint final

	- 22.4 **Defensa del Proyecto**.
Presentación oral y defensa del proyecto ante tribunal académico.
		- Fecha: **Marzo-Abril 2026**
		- Horas de desarrollo: **0**hs (Evento/Hito)
		- Dependencias: 22.3 (FS)
		- Preparación: Requiere preparación de presentación (incluida en documentación)

	- 22.5 **Cierre Académico**.
Finalización formal del proceso académico y entrega de calificaciones.
		- Fecha: **Abril 2026**
		- Horas de desarrollo: **0**hs (Evento/Hito)
		- Dependencias: 22.4 (FS)
		- Preparación: No requiere trabajo adicional de desarrollo
