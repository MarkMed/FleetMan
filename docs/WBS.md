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

	- 0.5 **PWA base** (manifest + SW básico).
Manifest, iconos y SW liviano (sin offline completo).
		- Horas estimadas: **6**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 0.1 (FS)
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
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 1.1 (FS)
		- Spike: **No**

	- 1.3 **DTOs + Zod** (contratos compartidos).
DTOs de entrada/salida y validaciones Zod en shared/.
		- Horas estimadas: **7**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 1.1 (FS)
		- Spike: **No**

	- 1.4 **Semillas demo** (dataset mínimo).
Datos de ejemplo para dev, pruebas y demo.
		- Horas estimadas: **4**hs
		- Margen: ±**0.7**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 1.2 (FS)
		- Spike: **No**

2. **Autenticación & Roles** (RF-001..004)

	- 2.1 **Registro** (RF-001).
Endpoint y formulario de alta con validaciones.
		- Horas estimadas: **10**hs
		- Margen: ±**2.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 1.2, 1.3, 0.10 (FS)
		- Spike: **No**

	- 2.2 **Login de usuario** (RF-002).
Autenticación (JWT/refresh), sesiones y expiración.
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

3. **Maquinaria** (RF-005, RF-006)

	- 3.1 **Alta de máquina** (RF-005).
Formulario, validaciones y contacto distribuidor.
		- Horas estimadas: **10**hs
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

4. **Mantenimiento & Eventos** (RF-007..RF-009)

	- 4.1 **Crear recordatorios** (RF-007).
CRUD recordatorios por máquina.
		- Horas estimadas: **9**hs
		- Margen: ±**1.8**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 3.1 (FS)
		- Spike: **No**

	- 4.2 **Registrar evento** (RF-008).
Alta de mantenimiento/incidente/falla/detención.
		- Horas estimadas: **15**hs
		- Margen: ±**3.0**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 3.1 (FS)
		- Spike: **No**

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

6. **QuickCheck** (RF-011, RF-017)

	- 6.1 **Plantilla checklist** (RF-011).
Estructura de ítems, estados y notas.
		- Horas estimadas: **5**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 1.1 (FS)
		- Spike: **No**

	- 6.2 **UI de ejecución** (RF-011).
Flujo mobile-first, validaciones y envío.
		- Horas estimadas: **12**hs
		- Margen: ±**2.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 6.1, 3.1, 0.10 (FS)
		- Spike: **No**

	- 6.3 **Persistencia en historial** (RF-011).
Guarda resultados y vincula a máquina.
		- Horas estimadas: **5**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 6.2 (FS)
		- Spike: **No**

	- 6.4 **Aviso QuickCheck no aprobado** (RF-017) [Conditional-Must].
Genera notificación y registra fallos.
		- Horas estimadas: **6**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 6.3, 8.1 (FS)
		- Spike: **No**

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

	- 8.1 **Modelo + bandeja**.
Entidad notificación, estados (leída/no) y fuentes (alertas, eventos, QC).
		- Horas estimadas: **12**hs
		- Margen: ±**2.5**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 1.1, 5.2, 4.2, 6.3 (FS)
		- Spike: **No**

	- 8.2 **UI lectura/estado**.
Filtros, marcar leído y paginado.
		- Horas estimadas: **7**hs
		- Margen: ±**1.2**hs (P80)
		- Incertidumbre: **Media**
		- Dependencias: 8.1, 0.10 (FS)
		- Spike: **No**

9. **Comunicación con Distribuidores** (RF-015)

	- 9.1 **Datos de contacto por distribuidor**.
Tel/mail/WA y validaciones mínimas.
		- Horas estimadas: **5**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 3.1 (FS)
		- Spike: **No**

	- 9.2 **Acciones de contacto** (tel:, mailto:, wa.me).
CTA desde UI con fallback por dispositivo.
		- Horas estimadas: **5**hs
		- Margen: ±**1.0**hs (P80)
		- Incertidumbre: **Baja**
		- Dependencias: 9.1 (FS)
		- Spike: **No**

	- 9.3 **Mensajería interna** (si ambos tienen cuenta) [Post-MVP].
Canal in-app con hilos y lectura.
		- Horas estimadas: **14**hs
		- Margen: ±**3.0**hs (P80)
		- Incertidumbre: **Alta**
		- Dependencias: 2.5, 8.1 (FS)
		- Spike: **Sí** (8hs)

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
		- Dependencias: 0.2 (FS)
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
