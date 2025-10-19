# WBS

0. **Fundaciones / Setup**
	- 0.1 Repos & monorepo (front React+Vite, back Node/TS, shared/DTO/Zod).
Crear el monorepo con workspaces, configs TS, scripts y shared/ para contratos.
		- Horas estimadas: 8 h
		- Margen: ±1.5 h (P80)
		- Incertidumbre: Baja
		- Dependencias: —
		- Spike: No

	- 0.2 CI mínima (lint, type-check, runner Jest).
Pipeline básico en PR/push con lint, type-check y jest.
		- Horas estimadas: 6 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 0.1 (FS)
		- Spike: No

	- 0.3 Convención ramas & releases (main/dev/feature, Conventional Commits).
Flujo de ramas, convención de commits y tagging.
		- Horas estimadas: 3 h
		- Margen: ±0.5 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 0.1 (FS)
		- Spike: No

	- 0.4 Entornos (local/dev + demo).
Variables .env, targets de build y entorno de demo.
		- Horas estimadas: 7 h
		- Margen: ±1.5 h (P80)
		- Incertidumbre: Media
		- Dependencias: 0.1 (FS)
		- Spike: No

	- 0.5 PWA base (manifest + SW básico).
Manifest, iconos y SW liviano (sin offline completo).
		- Horas estimadas: 6 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Media
		- Dependencias: 0.1 (FS)
		- Spike: No

	- 0.6 Design system base (tokens, layout, UI core).
Tokens de diseño, tipografía, grid y 3–4 componentes base.
		- Horas estimadas: 10 h
		- Margen: ±2.0 h (P80)
		- Incertidumbre: Media
		- Dependencias: 0.1 (FS)
		- Spike: No

	- 0.7 i18n groundwork (infra de strings).
Setup de i18n sin traducciones (solo infraestructura).
		- Horas estimadas: 5 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 0.6 (FS)
		- Spike: No

1. **Dominio & Datos**

	- 1.1 Modelo (User, Machine, MaintenanceReminder, MachineEvent, QuickCheck, Notification, SparePart, etc.).
Entidades, relaciones e invariantes del dominio.
		- Horas estimadas: 12 h
		- Margen: ±2.5 h (P80)
		- Incertidumbre: Media
		- Dependencias: 0.1 (FS)
		- Spike: No

	- 1.2 Esquemas DB (Mongoose + índices clave).
Schemas Mongoose y 2–3 índices críticos del MVP.
		- Horas estimadas: 5 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 1.1 (FS)
		- Spike: No

	- 1.3 DTOs + Zod (contratos compartidos).
DTOs de entrada/salida y validaciones Zod en shared/.
		- Horas estimadas: 7 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 1.1 (FS)
		- Spike: No

	- 1.4 Semillas demo (dataset mínimo).
Datos de ejemplo para dev, pruebas y demo.
		- Horas estimadas: 4 h
		- Margen: ±0.7 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 1.2 (FS)
		- Spike: No

2. **Autenticación & Roles** (RF-001..004)

	- 2.1 Registro (RF-001).
Endpoint y formulario de alta con validaciones.
		- Horas estimadas: 10 h
		- Margen: ±2.0 h (P80)
		- Incertidumbre: Media
		- Dependencias: 1.2, 1.3 (FS)
		- Spike: No

	- 2.2 Login de usuario (RF-002).
Autenticación (JWT/refresh), sesiones y expiración.
		- Horas estimadas: 8 h
		- Margen: ±1.5 h (P80)
		- Incertidumbre: Media
		- Dependencias: 2.1 (FS)
		- Spike: No

	- 2.3 Logout (RF-003).
Cierre manual/por inactividad.
		- Horas estimadas: 4 h
		- Margen: ±0.7 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 2.2 (FS)
		- Spike: No

	- 2.4 Recuperación de contraseña (RF-004) [NiceToHave].
Flujo de reset vía token temporal.
		- Horas estimadas: 8 h
		- Margen: ±1.5 h (P80)
		- Incertidumbre: Media
		- Dependencias: 2.1 (FS)
		- Spike: No

	- 2.5 AutZ por rol (admin/técnico/distribuidor).
Guards/claims por rol en API y UI.
		- Horas estimadas: 7 h
		- Margen: ±1.2 h (P80)
		- Incertidumbre: Media
		- Dependencias: 2.2 (FS)
		- Spike: No

3. **Maquinaria** (RF-005, RF-006)

	- 3.1 Alta de máquina (RF-005).
Formulario, validaciones y contacto distribuidor.
		- Horas estimadas: 10 h
		- Margen: ±2.0 h (P80)
		- Incertidumbre: Media
		- Dependencias: 2.2, 1.2 (FS)
		- Spike: No

	- 3.2 Listado + detalle.
Lista/tiles, vista detalle y paginado simple.
		- Horas estimadas: 9 h
		- Margen: ±1.8 h (P80)
		- Incertidumbre: Media
		- Dependencias: 3.1 (FS)
		- Spike: No

	- 3.3 Edición con historial (RF-006).
Edición + auditoría básica de cambios.
		- Horas estimadas: 8 h
		- Margen: ±1.5 h (P80)
		- Incertidumbre: Media
		- Dependencias: 3.2 (FS)
		- Spike: No

4. **Mantenimiento & Eventos** (RF-007..RF-009)

	- 4.1 Crear recordatorios (RF-007).
CRUD recordatorios por máquina.
		- Horas estimadas: 9 h
		- Margen: ±1.8 h (P80)
		- Incertidumbre: Media
		- Dependencias: 3.1 (FS)
		- Spike: No

	- 4.2 Registrar evento (RF-008).
Alta de mantenimiento/incidente/falla/detención.
		- Horas estimadas: 12 h
		- Margen: ±2.5 h (P80)
		- Incertidumbre: Media
		- Dependencias: 3.1 (FS)
		- Spike: No

	- 4.3 Historial unificado (RF-009).
Timeline consolidado de manttos, incidencias y quickchecks.
		- Horas estimadas: 12 h
		- Margen: ±2.5 h (P80)
		- Incertidumbre: Media
		- Dependencias: 4.2, 6.3 (FS)
		- Spike: No

5. **Alertas & Scheduling** (RF-010)

	- 5.1 Scheduler (agenda/node-cron).
Job runner por fecha/hora; tolerante a reinicios simples.
		- Horas estimadas: 8 h
		- Margen: ±1.5 h (P80)
		- Incertidumbre: Media
		- Dependencias: 4.1 (FS)
		- Spike: No

	- 5.2 Generación + persistencia de alertas.
Creación, estados y trazabilidad de alertas.
		- Horas estimadas: 7 h
		- Margen: ±1.2 h (P80)
		- Incertidumbre: Media
		- Dependencias: 5.1 (FS)
		- Spike: No

	- 5.3 Hook a Centro de Notificaciones.
Emisión hacia la bandeja central de 8.x.
		- Horas estimadas: 4 h
		- Margen: ±0.7 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 5.2 (FS), SS con 8.1
		- Spike: No

6. **QuickCheck** (RF-011, RF-017)

	- 6.1 Plantilla checklist (RF-011).
Estructura de ítems, estados y notas.
		- Horas estimadas: 5 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 1.1 (FS)
		- Spike: No

	- 6.2 UI de ejecución (RF-011).
Flujo mobile-first, validaciones y envío.
		- Horas estimadas: 10 h
		- Margen: ±2.0 h (P80)
		- Incertidumbre: Media
		- Dependencias: 6.1, 3.1 (FS)
		- Spike: No

	- 6.3 Persistencia en historial (RF-011).
Guarda resultados y vincula a máquina.
		- Horas estimadas: 5 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 6.2 (FS)
		- Spike: No

	- 6.4 Aviso QuickCheck no aprobado (RF-017) [Conditional-Must].
Genera notificación y registra fallos.
		- Horas estimadas: 6 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 6.3, 8.1 (FS)
		- Spike: No

7. **Repuestos** (RF-012..RF-014) [NiceToHave]

	- 7.1 Alta/edición repuesto (RF-012/014).
CRUD simple atado a máquina.
		- Horas estimadas: 8 h
		- Margen: ±1.5 h (P80)
		- Incertidumbre: Media
		- Dependencias: 3.1 (FS)
		- Spike: No

	- 7.2 Listado por máquina (RF-013).
Vista de repuestos con estados básicos.
		- Horas estimadas: 6 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 7.1 (FS)
		- Spike: No

8. **Centro de Notificaciones** (RF-016)

	- 8.1 Modelo + bandeja.
Entidad notificación, estados (leída/no) y fuentes (alertas, eventos, QC).
		- Horas estimadas: 10 h
		- Margen: ±2.0 h (P80)
		- Incertidumbre: Media
		- Dependencias: 1.1, 5.2, 4.2, 6.3 (FS)
		- Spike: No

	- 8.2 UI lectura/estado.
Filtros, marcar leído y paginado.
		- Horas estimadas: 7 h
		- Margen: ±1.2 h (P80)
		- Incertidumbre: Media
		- Dependencias: 8.1 (FS)
		- Spike: No

9. **Comunicación con Distribuidores** (RF-015)

	- 9.1 Datos de contacto por distribuidor.
Tel/mail/WA y validaciones mínimas.
		- Horas estimadas: 5 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 3.1 (FS)
		- Spike: No

	- 9.2 Acciones de contacto (tel:, mailto:, wa.me).
CTA desde UI con fallback por dispositivo.
		- Horas estimadas: 5 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 9.1 (FS)
		- Spike: No

	- 9.3 Mensajería interna (si ambos tienen cuenta) [Post-MVP].
Canal in-app con hilos y lectura.
		- Horas estimadas: 14 h
		- Margen: ±3.0 h (P80)
		- Incertidumbre: Alta
		- Dependencias: 2.5, 8.1 (FS)
		- Spike: Sí (8 h)

10. **Búsqueda & Filtros** (RF-018) [Post-MVP]

	- 10.1 Query service + índices.
Texto simple/estado y endpoints de búsqueda.
		- Horas estimadas: 9 h
		- Margen: ±1.8 h (P80)
		- Incertidumbre: Media
		- Dependencias: 1.2 (FS)
		- Spike: No

	- 10.2 UI de búsqueda global.
Barra, filtros y resultados.
		- Horas estimadas: 10 h
		- Margen: ±2.0 h (P80)
		- Incertidumbre: Media
		- Dependencias: 10.1 (FS)
		- Spike: No

11. **Ayuda & Guías** (RF-019)

	- 11.1 Ayuda inline mínima / "cómo usar esta página" [NiceToHave].
Tooltips/accordions por pantalla.
		- Horas estimadas: 6 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 0.6 (FS)
		- Spike: No

	- 11.2 Tutorial overlay / tours [Post-MVP].
Onboarding guiado paso a paso.
		- Horas estimadas: 12 h
		- Margen: ±2.5 h (P80)
		- Incertidumbre: Media
		- Dependencias: 11.1 (FS)
		- Spike: No

12. **Accesibilidad & UX**

	- 12.1 Responsive grid & breakpoints.
Layouts móviles/desktop.
		- Horas estimadas: 6 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 0.6 (FS)
		- Spike: No

	- 12.2 A11y mínima (focus, labels, contraste).
Roles/ARIA y navegación con teclado.
		- Horas estimadas: 6 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 0.6 (FS)
		- Spike: No

	- 12.3 Pruebas visuales móviles/desktop.
Validación en 2–3 navegadores + móvil.
		- Horas estimadas: 5 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 12.1 (FS)
		- Spike: No

13. **Calidad & Pruebas** (alineado a SQA)

	- 13.1 Estrategia & DoD QA.
Criterios de listo y enfoque de pruebas.
		- Horas estimadas: 5 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 0.2 (FS)
		- Spike: No

	- 13.2 Config Jest (front/back, TS, coverage).
Presets, scripts y coverage.
		- Horas estimadas: 6 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 0.2 (FS)
		- Spike: No

	- 13.3a Unit tests Backend.
Casos de uso, servicios, validaciones y errores.
		- Horas estimadas: 12 h
		- Margen: ±2.5 h (P80)
		- Incertidumbre: Media
		- Dependencias: SS con 2–8
		- Spike: No

	- 13.3b Unit tests Frontend.
Hooks, utils y lógica de módulos.
		- Horas estimadas: 10 h
		- Margen: ±2.0 h (P80)
		- Incertidumbre: Media
		- Dependencias: SS con 2–8
		- Spike: No

	- 13.4 Datos de prueba (semillas y factories).
Fixtures y factories para tests.
		- Horas estimadas: 4 h
		- Margen: ±0.7 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 1.4 (FS)
		- Spike: No

	- 13.5 Sanitización manual por feature.
Checklist de smoke por pantalla/flujo.
		- Horas estimadas: 8 h
		- Margen: ±1.5 h (P80)
		- Incertidumbre: Media
		- Dependencias: SS con 2–9
		- Spike: No

	- 13.7 Triage & fix post-UAT.
Registro, severidades, fixes y verificación.
		- Horas estimadas: 10 h
		- Margen: ±2.0 h (P80)
		- Incertidumbre: Media
		- Dependencias: 20.2 (FS)
		- Spike: No

	- 13.8 Smoke E2E de flujos críticos.
Auth → máquina → recordatorio → notificación → QC.
		- Horas estimadas: 6 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Media
		- Dependencias: 2–8 (FS)
		- Spike: No

	- 13.9 Gestión de defectos.
Triage continuo, hotfix path y mini-regresión.
		- Horas estimadas: 6 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Media
		- Dependencias: SS con 13.5–13.8
		- Spike: No

14. **Seguridad & Hardening**

	- 14.1 Hashing, rate-limit, CORS.
Config seguro básico en API.
		- Horas estimadas: 6 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 2.2 (FS)
		- Spike: No

	- 14.2 Validaciones Zod en controllers.
Validación exhaustiva en endpoints.
		- Horas estimadas: 8 h
		- Margen: ±1.5 h (P80)
		- Incertidumbre: Media
		- Dependencias: 1.3 (FS)
		- Spike: No

	- 14.3 Permisos por endpoint (RBAC ligero).
Chequeos de rol en rutas.
		- Horas estimadas: 6 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Media
		- Dependencias: 2.5 (FS)
		- Spike: No

15. **Observabilidad ligera**

	- 15.1 Logger estructurado (niveles, request-id).
Logging JSON y correlación simple.
		- Horas estimadas: 5 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 0.2 (FS)
		- Spike: No

	- 15.2 Métricas mínimas en logs (contadores) [Post-MVP].
Contadores por evento/acción en logs.
		- Horas estimadas: 6 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Media
		- Dependencias: 15.1 (FS)
		- Spike: No

16. **Deploy & Demo**

	- 16.1 Build & deploy demo (front estático + API).
Empaquetado, hosting y health-check simple.
		- Horas estimadas: 8 h
		- Margen: ±1.5 h (P80)
		- Incertidumbre: Media
		- Dependencias: 0.4, 13.2 (FS)
		- Spike: No

	- 16.2 Semillas demo (usar 1.4).
Carga inicial del dataset de demo.
		- Horas estimadas: 3 h
		- Margen: ±0.5 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 1.4 (FS)
		- Spike: No

	- 16.3 Script "reset demo" [NiceToHave].
Script idempotente de reinicialización.
		- Horas estimadas: 4 h
		- Margen: ±0.7 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 16.2 (FS)
		- Spike: No

17. **Documentación & Capacitación**

	- 17.1 README + guía arranque dev.
Setup, scripts y troubleshooting breve.
		- Horas estimadas: 4 h
		- Margen: ±0.7 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 0.1 (FS)
		- Spike: No

	- 17.2 API docs (OpenAPI simple).
Endpoints principales y ejemplos.
		- Horas estimadas: 6 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Media
		- Dependencias: 2–9 (FS)
		- Spike: No

	- 17.3 Manual breve de usuario [NiceToHave].
Guía funcional mínima por pantalla.
		- Horas estimadas: 6 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Media
		- Dependencias: 11.1 (FS)
		- Spike: No

18. **Gobernanza de Alcance** (MVP)

	- 18.1 Scope freeze (MoSCoW).
Cierre de alcance y criterios.
		- Horas estimadas: 2 h
		- Margen: ±0.3 h (P80)
		- Incertidumbre: Baja
		- Dependencias: —
		- Spike: No

	- 18.2 Control de cambios.
Registro de desvíos y pases a Post-MVP.
		- Horas estimadas: 3 h
		- Margen: ±0.5 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 18.1 (FS)
		- Spike: No

	- 18.3 Feature toggles.
Flags para diferir capacidades.
		- Horas estimadas: 5 h
		- Margen: ±1.0 h (P80)
		- Incertidumbre: Media
		- Dependencias: 0.2 (FS)
		- Spike: No

19. **Backlog Post-MVP (consolidado)**

	- 19.1 Consolidación y tracking del backlog Post-MVP.
Curaduría y priorización para fases futuras.
		- Horas estimadas: 2 h
		- Margen: ±0.3 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 18.2 (FS)
		- Spike: No

20. **Gestión del Proyecto & Scrumban** (LOE dominical encadenado)

	- 20.1 Reporte Académico (dominical).
Informe semanal de avances/bloqueos y decisiones; "precalienta" la demo.
		- Horas estimadas: 0.9 h/sprint
		- Margen: ±0.1 h (P80)
		- Incertidumbre: Baja
		- Dependencias: Cierre sprint previo (FS)
		- Spike: No

	- 20.2 Demo/UAT con cliente (dominical).
Demostración, sincronización y feedback/UAT inmediato.
		- Horas estimadas: 1.5 h/sprint
		- Margen: ±0.1 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 20.1 (FS)
		- Spike: No

	- 20.3 Sprint Planning dominguero (dominical).
Planificación de la iteración con foco en ruta crítica.
		- Horas estimadas: 1.3 h/sprint
		- Margen: ±0.1 h (P80)
		- Incertidumbre: Baja
		- Dependencias: 20.2 (FS)
		- Spike: No

# Camino Crítico

### Análisis basado en Requerimientos Must Have (MVP Obligatorio)

**Requerimientos Must Have identificados:**
- RF-001, RF-002, RF-003: Gestión de usuarios básica
- RF-005, RF-006: Gestión de maquinaria
- RF-007, RF-008, RF-009: Mantenimiento & eventos
- RF-010: Alertas de mantenimiento
- RF-011: QuickCheck de seguridad
- RF-015: Comunicación con distribuidores
- RF-016: Centro de notificaciones

### Red de Precedencias y Análisis CPM (Solo Must Have)

**RUTA CRÍTICA PRINCIPAL - Flujo Must Have:**

**0.1 Repos & monorepo** (Fundacional)
- ES: 0h, EF: 8h, LS: 0h, LF: 8h
- Holgura total: 0h - **CRÍTICO**

**1.1 Modelo** (depende de 0.1) - Soporte RF-001,005,007,008,011
- ES: 8h, EF: 20h, LS: 8h, LF: 20h
- Holgura total: 0h - **CRÍTICO**

**1.2 Esquemas DB** (depende de 1.1) - Soporte RF-001,005
- ES: 20h, EF: 25h, LS: 20h, LF: 25h
- Holgura total: 0h - **CRÍTICO**

**1.3 DTOs + Zod** (depende de 1.1) - Contratos API Must Have
- ES: 20h, EF: 27h, LS: 20h, LF: 27h
- Holgura total: 0h - **CRÍTICO**

**2.1 Registro** (depende de 1.2, 1.3) - RF-001
- ES: 27h, EF: 37h, LS: 27h, LF: 37h
- Holgura total: 0h - **CRÍTICO**

**2.2 Login** (depende de 2.1) - RF-002
- ES: 37h, EF: 45h, LS: 37h, LF: 45h
- Holgura total: 0h - **CRÍTICO**

**3.1 Alta de máquina** (depende de 2.2, 1.2) - RF-005
- ES: 45h, EF: 55h, LS: 45h, LF: 55h
- Holgura total: 0h - **CRÍTICO**

**4.1 Crear recordatorios** (depende de 3.1) - RF-007
- ES: 55h, EF: 64h, LS: 55h, LF: 64h
- Holgura total: 0h - **CRÍTICO**

**4.2 Registrar evento** (depende de 3.1) - RF-008
- ES: 55h, EF: 67h, LS: 67h, LF: 79h
- Holgura total: 12h

**5.1 Scheduler** (depende de 4.1) - RF-010
- ES: 64h, EF: 72h, LS: 64h, LF: 72h
- Holgura total: 0h - **CRÍTICO**

**5.2 Generación alertas** (depende de 5.1) - RF-010
- ES: 72h, EF: 79h, LS: 72h, LF: 79h
- Holgura total: 0h - **CRÍTICO**

**6.2 UI QuickCheck** (depende de 6.1, 3.1) - RF-011
- ES: 55h, EF: 65h, LS: 69h, LF: 79h
- Holgura total: 14h

**6.3 Persistencia QuickCheck** (depende de 6.2) - RF-011
- ES: 65h, EF: 70h, LS: 74h, LF: 79h
- Holgura total: 9h

**8.1 Centro notificaciones** (depende de 5.2, 4.2, 6.3) - RF-016
- ES: 79h, EF: 89h, LS: 79h, LF: 89h
- Holgura total: 0h - **CRÍTICO**

**9.1 Contacto distribuidores** (depende de 3.1) - RF-015
- ES: 55h, EF: 60h, LS: 84h, LF: 89h
- Holgura total: 29h

**4.3 Historial unificado** (depende de 4.2, 6.3) - RF-009
- ES: 79h, EF: 91h, LS: 77h, LF: 89h
- Holgura total: -2h - **CRÍTICO** (sobrepaso)

**Corrección ruta crítica:**
**4.3 Historial unificado** (depende de 4.2, 6.3) - RF-009
- ES: 79h, EF: 91h, LS: 79h, LF: 91h
- Holgura total: 0h - **CRÍTICO**

### Ruta Crítica Identificada (Must Have MVP)

**(a) Ruta crítica corregida:**
**0.1 → 1.1 → 1.2 → 1.3 → 2.1 → 2.2 → 3.1 → 4.1 → 5.1 → 5.2 → 8.1 → [paralelo con] → 4.3**

**(b) Duración total del proyecto (MVP Must Have):**
- **91 horas** (ruta crítica más larga)
- **18.2 días** de 5h/día laborables
- **~13 sprints** de trabajo efectivo para Must Have

**(c) Buffers propuestos (MVP Must Have):**

**Project Buffer:** 14h (15% de 91h) ≈ 2.8 días de 5h
- Ubicación: Al final de 4.3 Historial unificado
- Protege la entrega del MVP Must Have

**Feeding Buffers:**
- **4.2 → 4.3:** 6h (50% de holgura original de 12h)
- **6.3 → 4.3:** 5h (50% de holgura original de 9h) 
- **9.1 → Entrega:** 15h (50% de holgura de 29h)

### Nivelación por Recurso Único (MVP Must Have)

**Ajustes críticos:**
- Must Have requiere ~91h + 14h buffer = 105h total
- Equivale a ~13 sprints efectivos (vs 17 planificados)
- **Margen de 4 sprints** para Should Have y Nice to Have

**Conclusión crítica:**
El MVP Must Have está **bien dimensionado** y permite cumplir con las fechas. Los 4 sprints adicionales (14-17) pueden dedicarse a:
- RF-004 (Should Have): Recuperación contraseña
- RF-017 (Should Have): Aviso QuickCheck no aprobado  
- RF-012,013,014 (Should Have): Gestión repuestos
- Funcionalidades Could Have según disponibilidad

# Planes de Sprints

### **Sprint #0**: dom 12 oct → sáb 18 oct 2025

| Tarea | Orden | Horas | Categoría |
|-------|-------|-------|:-----------|
| 20.1 Reporte Académico (dominical) | 1 | 0.9 | Gestión |
| 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | Gestión |
| 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | Gestión |
| 0.1 Repos & monorepo (front React+Vite, back Node/TS, shared/DTO/Zod) | 4 | 8 | Desarrollo |
| 18.1 Scope freeze (MoSCoW) | 5 | 2 | Gestión |
| 0.2 CI mínima (lint, type-check, runner Jest) | 6 | 6 | Desarrollo |
| 0.3 Convención ramas & releases (main/dev/feature, Conventional Commits) | 7 | 3 | Gestión |

**Horas comprometidas (sin buffer): 22.7 h · Buffer reservado: 7.3 h · Total con buffer: 30 h**  
**Distribución por categoría: Gestión 8.7 h · Desarrollo 14 h · QA 0 h · Capacitación 0 h · Documentación 0 h**

**Riesgos:** Configuración inicial del monorepo puede tomar más tiempo del estimado.

### **Sprint #1**: dom 19 oct → sáb 25 oct 2025

| Tarea | Orden | Horas | Categoría |
|-------|-------|-------|:-----------|
| 20.1 Reporte Académico (dominical) | 1 | 0.9 | Gestión |
| 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | Gestión |
| 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | Gestión |
| 0.4 Entornos (local/dev + demo) | 4 | 7 | Desarrollo |
| 1.1 Modelo (User, Machine, MaintenanceReminder, MachineEvent, QuickCheck, Notification, SparePart, etc.) | 5 | 12 | Desarrollo |
| 17.1 README + guía arranque dev | 6 | 4 | Documentación |

**Horas comprometidas (sin buffer): 26.7 h · Buffer reservado: 8.3 h · Total con buffer: 35 h**  
**Distribución por categoría: Gestión 3.7 h · Desarrollo 19 h · QA 0 h · Capacitación 0 h · Documentación 4 h**

**Riesgos:** El modelado del dominio es crítico y puede requerir refinamientos.

### **Sprint #2**: dom 26 oct → sáb 1 nov 2025

| Tarea | Orden | Horas | Categoría |
|-------|-------|-------|:-----------|
| 20.1 Reporte Académico (dominical) | 1 | 0.9 | Gestión |
| 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | Gestión |
| 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | Gestión |
| 1.2 Esquemas DB (Mongoose + índices clave) | 4 | 5 | Desarrollo |
| 1.3 DTOs + Zod (contratos compartidos) | 5 | 7 | Desarrollo |
| 0.6 Design system base (tokens, layout, UI core) | 6 | 10 | Desarrollo |
| 13.1 Estrategia & DoD QA | 7 | 5 | QA |

**Horas comprometidas (sin buffer): 30.7 h · Buffer reservado: 4.3 h · Total con buffer: 35 h**  
**Distribución por categoría: Gestión 3.7 h · Desarrollo 22 h · QA 5 h · Capacitación 0 h · Documentación 0 h**

**Riesgos:** El design system puede requerir iteraciones con feedback del cliente.

### **Sprint #3**: dom 2 nov → sáb 8 nov 2025

| Tarea | Orden | Horas | Categoría |
|-------|-------|-------|:-----------|
| 20.1 Reporte Académico (dominical) | 1 | 0.9 | Gestión |
| 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | Gestión |
| 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | Gestión |
| 1.4 Semillas demo (dataset mínimo) | 4 | 4 | Desarrollo |
| 2.1 Registro (RF-001) | 5 | 10 | Desarrollo |
| 13.2 Config Jest (front/back, TS, coverage) | 6 | 6 | QA |
| 15.1 Logger estructurado (niveles, request-id) | 7 | 5 | Desarrollo |

**Horas comprometidas (sin buffer): 28.7 h · Buffer reservado: 6.3 h · Total con buffer: 35 h**  
**Distribución por categoría: Gestión 3.7 h · Desarrollo 19 h · QA 6 h · Capacitación 0 h · Documentación 0 h**

### **Sprint #4**: dom 9 nov → sáb 15 nov 2025

| Tarea | Orden | Horas | Categoría |
|-------|-------|-------|:-----------|
| 20.1 Reporte Académico (dominical) | 1 | 0.9 | Gestión |
| 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | Gestión |
| 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | Gestión |
| 2.2 Login de usuario (RF-002) | 4 | 8 | Desarrollo |
| 2.3 Logout (RF-003) | 5 | 4 | Desarrollo |
| 2.5 AutZ por rol (admin/técnico/distribuidor) | 6 | 7 | Desarrollo |
| 14.1 Hashing, rate-limit, CORS | 7 | 6 | Desarrollo |

**Horas comprometidas (sin buffer): 28.7 h · Buffer reservado: 6.3 h · Total con buffer: 35 h**  
**Distribución por categoría: Gestión 3.7 h · Desarrollo 25 h · QA 0 h · Capacitación 0 h · Documentación 0 h**

### **Sprint #5**: dom 16 nov → sáb 22 nov 2025

| Tarea | Orden | Horas | Categoría |
|-------|-------|-------|:-----------|
| 20.1 Reporte Académico (dominical) | 1 | 0.9 | Gestión |
| 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | Gestión |
| 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | Gestión |
| 3.1 Alta de máquina (RF-005) | 4 | 10 | Desarrollo |
| 14.2 Validaciones Zod en controllers | 5 | 8 | Desarrollo |
| 14.3 Permisos por endpoint (RBAC ligero) | 6 | 6 | Desarrollo |

**Horas comprometidas (sin buffer): 27.7 h · Buffer reservado: 7.3 h · Total con buffer: 35 h**  
**Distribución por categoría: Gestión 3.7 h · Desarrollo 24 h · QA 0 h · Capacitación 0 h · Documentación 0 h**

### **Sprint #6**: dom 23 nov → sáb 29 nov 2025

| Tarea | Orden | Horas | Categoría |
|-------|-------|-------|:-----------|
| 20.1 Reporte Académico (dominical) | 1 | 0.9 | Gestión |
| 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | Gestión |
| 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | Gestión |
| 3.2 Listado + detalle | 4 | 9 | Desarrollo |
| 4.1 Crear recordatorios (RF-007) | 5 | 9 | Desarrollo |
| 6.1 Plantilla checklist (RF-011) | 6 | 5 | Desarrollo |

**Horas comprometidas (sin buffer): 26.7 h · Buffer reservado: 8.3 h · Total con buffer: 35 h**  
**Distribución por categoría: Gestión 3.7 h · Desarrollo 23 h · QA 0 h · Capacitación 0 h · Documentación 0 h**

### **Sprint #7**: dom 30 nov → sáb 6 dic 2025

| Tarea | Orden | Horas | Categoría |
|-------|-------|-------|:-----------|
| 20.1 Reporte Académico (dominical) | 1 | 0.9 | Gestión |
| 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | Gestión |
| 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | Gestión |
| 5.1 Scheduler (agenda/node-cron) | 4 | 8 | Desarrollo |
| 5.2 Generación + persistencia de alertas | 5 | 7 | Desarrollo |
| 6.2 UI de ejecución (RF-011) | 6 | 10 | Desarrollo |

**Horas comprometidas (sin buffer): 28.7 h · Buffer reservado: 6.3 h · Total con buffer: 35 h**  
**Distribución por categoría: Gestión 3.7 h · Desarrollo 25 h · QA 0 h · Capacitación 0 h · Documentación 0 h**

### **Sprint #8**: dom 7 dic → sáb 13 dic 2025

| Tarea | Orden | Horas | Categoría |
|-------|-------|-------|:-----------|
| 20.1 Reporte Académico (dominical) | 1 | 0.9 | Gestión |
| 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | Gestión |
| 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | Gestión |
| 6.3 Persistencia en historial (RF-011) | 4 | 5 | Desarrollo |
| 8.1 Modelo + bandeja | 5 | 10 | Desarrollo |
| 4.2 Registrar evento (RF-008) - Parte 1 | 6 | 8 | Desarrollo |

**Horas comprometidas (sin buffer): 26.7 h · Buffer reservado: 8.3 h · Total con buffer: 35 h**  
**Distribución por categoría: Gestión 3.7 h · Desarrollo 23 h · QA 0 h · Capacitación 0 h · Documentación 0 h**

**Riesgos:** Integración entre notificaciones y eventos puede ser compleja.

### **Sprint #9**: dom 14 dic → sáb 20 dic 2025

| Tarea | Orden | Horas | Categoría |
|-------|-------|-------|:-----------|
| 20.1 Reporte Académico (dominical) | 1 | 0.9 | Gestión |
| 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | Gestión |
| 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | Gestión |
| 4.2 Registrar evento (RF-008) - Parte 2 | 4 | 4 | Desarrollo |
| 5.3 Hook a Centro de Notificaciones | 5 | 4 | Desarrollo |
| 8.2 UI lectura/estado | 6 | 7 | Desarrollo |
| 6.4 Aviso QuickCheck no aprobado (RF-017) | 7 | 6 | Desarrollo |
| 3.3 Edición con historial (RF-006) | 8 | 8 | Desarrollo |

**Horas comprometidas (sin buffer): 32.7 h · Buffer reservado: 2.3 h · Total con buffer: 35 h**  
**Distribución por categoría: Gestión 3.7 h · Desarrollo 29 h · QA 0 h · Capacitación 0 h · Documentación 0 h**

**Riesgos:** Sprint denso con múltiples integraciones críticas.

### **Sprint #10**: dom 21 dic → sáb 27 dic 2025

| Tarea | Orden | Horas | Categoría |
|-------|-------|-------|:-----------|
| 20.1 Reporte Académico (dominical) | 1 | 0.9 | Gestión |
| 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | Gestión |
| 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | Gestión |
| 4.3 Historial unificado (RF-009) | 4 | 12 | Desarrollo |
| 9.1 Datos de contacto por distribuidor | 5 | 5 | Desarrollo |
| 9.2 Acciones de contacto (tel:, mailto:, wa.me) | 6 | 5 | Desarrollo |

**Horas comprometidas (sin buffer): 25.7 h · Buffer reservado: 9.3 h · Total con buffer: 35 h**  
**Distribución por categoría: Gestión 3.7 h · Desarrollo 22 h · QA 0 h · Capacitación 0 h · Documentación 0 h**

**Riesgos:** Período navideño puede afectar productividad.

### **Sprint #11**: dom 28 dic → sáb 3 ene 2026

| Tarea | Orden | Horas | Categoría |
|-------|-------|-------|:-----------|
| 20.1 Reporte Académico (dominical) | 1 | 0.9 | Gestión |
| 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | Gestión |
| 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | Gestión |
| 0.5 PWA base (manifest + SW básico) | 4 | 6 | Desarrollo |
| 0.7 i18n groundwork (infra de strings) | 5 | 5 | Desarrollo |
| 12.1 Responsive grid & breakpoints | 6 | 6 | Desarrollo |
| 12.2 A11y mínima (focus, labels, contraste) | 7 | 6 | Desarrollo |

**Horas comprometidas (sin buffer): 26.7 h · Buffer reservado: 8.3 h · Total con buffer: 35 h**  
**Distribución por categoría: Gestión 3.7 h · Desarrollo 23 h · QA 0 h · Capacitación 0 h · Documentación 0 h**

**Riesgos:** Período de fiestas navideñas puede impactar disponibilidad.

### **Sprint #12**: dom 4 ene → sáb 10 ene 2026

| Tarea | Orden | Horas | Categoría |
|-------|-------|-------|:-----------|
| 20.1 Reporte Académico (dominical) | 1 | 0.9 | Gestión |
| 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | Gestión |
| 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | Gestión |
| 13.3a Unit tests Backend | 4 | 12 | QA |
| 13.4 Datos de prueba (semillas y factories) | 5 | 4 | QA |
| 16.2 Semillas demo (usar 1.4) | 6 | 3 | Desarrollo |
| 12.3 Pruebas visuales móviles/desktop | 7 | 5 | QA |

**Horas comprometidas (sin buffer): 27.7 h · Buffer reservado: 7.3 h · Total con buffer: 35 h**  
**Distribución por categoría: Gestión 3.7 h · Desarrollo 3 h · QA 21 h · Capacitación 0 h · Documentación 0 h**

### **Sprint #13**: dom 11 ene → sáb 17 ene 2026

| Tarea | Orden | Horas | Categoría |
|-------|-------|-------|:-----------|
| 20.1 Reporte Académico (dominical) | 1 | 0.9 | Gestión |
| 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | Gestión |
| 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | Gestión |
| 13.3b Unit tests Frontend | 4 | 10 | QA |
| 16.1 Build & deploy demo (front estático + API) | 5 | 8 | Desarrollo |
| 17.2 API docs (OpenAPI simple) | 6 | 6 | Documentación |

**Horas comprometidas (sin buffer): 27.7 h · Buffer reservado: 7.3 h · Total con buffer: 35 h**  
**Distribución por categoría: Gestión 3.7 h · Desarrollo 8 h · QA 10 h · Capacitación 0 h · Documentación 6 h**

### **Sprint #14**: dom 18 ene → sáb 24 ene 2026

| Tarea | Orden | Horas | Categoría |
|-------|-------|-------|:-----------|
| 20.1 Reporte Académico (dominical) | 1 | 0.9 | Gestión |
| 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | Gestión |
| 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | Gestión |
| 13.5 Sanitización manual por feature | 4 | 8 | QA |
| 13.8 Smoke E2E de flujos críticos | 5 | 6 | QA |
| 18.2 Control de cambios | 6 | 3 | Gestión |
| 18.3 Feature toggles | 7 | 5 | Desarrollo |
| 2.4 Recuperación de contraseña (RF-004) [NiceToHave] | 8 | 8 | Desarrollo |

**Horas comprometidas (sin buffer): 33.7 h · Buffer reservado: 1.3 h · Total con buffer: 35 h**  
**Distribución por categoría: Gestión 5.7 h · Desarrollo 13 h · QA 14 h · Capacitación 0 h · Documentación 0 h**

**Riesgos:** Sprint muy denso con poco buffer disponible.

### **Sprint #15**: dom 25 ene → sáb 31 ene 2026

| Tarea | Orden | Horas | Categoría |
|-------|-------|-------|:-----------|
| 20.1 Reporte Académico (dominical) | 1 | 0.9 | Gestión |
| 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | Gestión |
| 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | Gestión |
| 13.7 Triage & fix post-UAT | 4 | 10 | QA |
| 13.9 Gestión de defectos | 5 | 6 | QA |
| 11.1 Ayuda inline mínima / "cómo usar esta página" [NiceToHave] | 6 | 6 | Desarrollo |
| 19.1 Consolidación y tracking del backlog Post-MVP | 7 | 2 | Gestión |

**Horas comprometidas (sin buffer): 27.7 h · Buffer reservado: 7.3 h · Total con buffer: 35 h**  
**Distribución por categoría: Gestión 5.7 h · Desarrollo 6 h · QA 16 h · Capacitación 0 h · Documentación 0 h**

### **Sprint #16**: dom 1 feb → sáb 7 feb 2026

| Tarea | Orden | Horas | Categoría |
|-------|-------|-------|:-----------|
| 20.1 Reporte Académico (dominical) | 1 | 0.9 | Gestión |
| 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | Gestión |
| 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | Gestión |
| 7.1 Alta/edición repuesto (RF-012/014) [NiceToHave] | 4 | 8 | Desarrollo |
| 7.2 Listado por máquina (RF-013) [NiceToHave] | 5 | 6 | Desarrollo |
| 16.3 Script "reset demo" [NiceToHave] | 6 | 4 | Desarrollo |
| 17.3 Manual breve de usuario [NiceToHave] | 7 | 6 | Documentación |

**Horas comprometidas (sin buffer): 27.7 h · Buffer reservado: 7.3 h · Total con buffer: 35 h**  
**Distribución por categoría: Gestión 3.7 h · Desarrollo 18 h · QA 0 h · Capacitación 0 h · Documentación 6 h**

**Nota:** Este sprint incluye principalmente funcionalidades NiceToHave y puede ajustarse según el estado del proyecto.

