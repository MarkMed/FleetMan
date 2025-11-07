# Planes de Sprints

### **Sprint #0**: dom 12 oct → sáb 18 oct 2025

**Objetivo:** Finalizar y entregar documento de Anteproyecto.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Capacitación | 21.1 Talleres (instancias de guía general) | 1 | No est. | 2 |
| Capacitación | 21.2 Tutorías (guía con tutor asignado) | 2 | No est. | 0.7 |
| Documentación | 21.17 Diagramar arquitectura | 3 | No est. | 3.2 |
| Documentación | 21.18 Hacer diagrama Conceptual de Dominio | 4 | No est. | 4 |
| Gestión | 21.19 Planear tareas y sprints | 5 | No est. | 5.7 |
| Documentación | 21.20 Refinamientos varios | 6 | No est. | 3 |
| Gestión | 18.1 Scope freeze (MoSCoW) | 7 | 2 | 0.5 |
| Desarrollo | 0.3 Convención ramas & releases (main/dev/feature, Conventional Commits) | 8 | 3 | 0.9 |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **No est.** hs | **16**hs |

Buffer reservado: **No est.** hs
Total con buffer: **No est.** hs

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **No est.** hs | **No est.** hs | **0**hs | **No est.** hs | **No est.** hs |

**Nota:** Las estimaciones no están disponibles para este sprint ya que corresponde a tareas del anteproyecto que se definieron y ejecutaron mientras el sprint estaba en curso. Las tareas incluyen actividades académicas de talleres, tutorías y documentación final del anteproyecto.

**Riesgos:** Sprint retrospectivo sin estimaciones previas; tareas ya completadas o en progreso.

### **Sprint #1**: dom 19 oct → sáb 25 oct 2025

**Objetivo:** Configurar entornos y herramientas de desarrollo (dependencias, monorepo, editor online).

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Gestión | 21.19 Planear tareas y sprints | 1 | No est. | 12.8 |
| Documentación | 21.20 Refinamientos varios | 2 | No est. | 5.9 |
| Capacitación | 21.1 Talleres (instancias de guía general) | 3 | 3 | 0.5 |
| Capacitación | 21.2 Tutorías (guía con tutor asignado) | 4 | 1 | 1,1 |
| Desarrollo | 0.1 Repos & monorepo (front React+Vite, back Node/TS, shared/DTO/Zod) | 5 | 8 | 1.7 |
| Desarrollo | 0.8 Setup VSCode remoto (GitHub Codespaces/Gitpod) | 6 | 4 | 0.86 |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **16**hs | **22.86**hs |

Buffer reservado: **16**hs
Total con buffer: **32**hs

```mermaid
xychart-beta
    title "Sprint #1: Horas Estimadas #40;azul#41; vs Reales #40;verde#41;"
    x-axis "Tareas" ["21.19", "21.20", "21.1", "21.2", "0.1", "0.8", "TOTAL"]
    y-axis "Horas" 0 --> 26
	
	%% Green line
    line [0, 0, 3, 1, 8, 4, 16]

	%% Black line
    line [12.8, 5.9, 0.5, 1.1, 1.7, 0.86, 22.86]
```

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **16.7**hs | **2.56**hs | **0**hs | **1.6**hs | **0**hs |

**Nota:** A mitad del sprint (miércoles 22 oct) se entrega el Documento Anteproyecto. Las tareas 21.19 y 21.20 están relacionadas con esta entrega. No se realiza planning, ni demo, ni reporte académico ya que la etapa de desarrollo comienza post entrega.

**Riesgos:** Sprint denso enfocado en configuración inicial. La configuración del monorepo y entornos es crítica para el resto del proyecto. La entrega del anteproyecto puede requerir ajustes de última hora.

### **Sprint #2**: dom 26 oct → sáb 1 nov 2025

**Objetivo:** Lograr un User Journey refinado y aprobado por el cliente. Crear entidades (clases) básicas.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Gestión | 20.1 Reporte Académico (dominical) | 1 | 0.9 | 1.8 |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | 1 |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | 0.6 |
| Desarrollo | 1.2 Esquemas DB (Mongoose + índices clave) | 4 | 5 | 0 |
| Desarrollo | 1.3 DTOs + Zod (contratos compartidos) | 5 | 7 | 9.02 |
| Desarrollo | 0.6 User Journey mapping | 6 | 6 | 14.8 |
| QA | 13.1 Estrategia & DoD QA | 7 | 5 | 1.5 |
| Capacitación | 16.1 Taller Deploy - Conceptos Generales (miérc 30 Oct) | 8 | 3 | 3 |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **33.7**hs | **31.72**hs |

Buffer reservado: **1.3**hs
Total con buffer: **35**hs

```mermaid
xychart-beta
    title "Sprint #2: Horas Estimadas #40;azul#41; vs Reales #40;verde#41;"
    x-axis "Tareas" ["20.1", "20.2", "20.3", "1.2", "1.3", "0.6", "13.1", "16.1", "TOTAL"]
    y-axis "Horas" 0 --> 35
	
	%% Green line
    line [0.9, 1.5, 1.3, 5, 7, 6, 5, 3, 33.7]

	%% Black line
    line [1.8, 1, 0.6, 0, 9.02, 14.8, 1.5, 3, 31.72]
```

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **3.4**hs | **23.82**hs | **1.5**hs | **3**hs | **0**hs |

**Riesgos:** El design system puede requerir iteraciones con feedback del cliente.

### **Sprint #3**: dom 2 nov → sáb 8 nov 2025

**Objetivo:** Establecer la infraestructura básica de backend y frontend necesaria para el desarrollo posterior de funcionalidades de dominio.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Gestión | 20.1 Reporte Académico (dominical) | 1 | 0.9 | 3.5 |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | 1.1 |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | 1.9 |
| Desarrollo | 0.11 Setup Backend Básico | 4 | 8 | 0.5 |
| Desarrollo | 0.13 Setup Frontend Básico | 5 | 8 | 4.2 |
| QA | 13.2 Config Jest (front/back, TS, coverage) | 6 | 6 | |
| Capacitación | 16.2 Taller Deploy - Conceptos Generales (miérc 6 Nov) | 7 | 3 | 3 |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **28.7**hs | **14.2**hs |

Buffer reservado: **6.3**hs
Total con buffer: **35**hs

```mermaid
xychart-beta
    title "Sprint #3: Horas Estimadas #40;azul#41; vs Reales #40;verde#41;"
    x-axis "Tareas" ["20.1", "20.2", "20.3", "0.11", "0.13", "13.2", "16.2", "TOTAL"]
    y-axis "Horas" 0 --> 30
	
	%% Green line
    line [0.9, 1.5, 1.3, 8, 8, 6, 3, 28.7]

	%% Black line
    line [3.5, 1.1, 1.9, 0.5, 4.2, 0, 3, 14.2]
```

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **6.5**hs | **4.7**hs | **0**hs | **3**hs | **0**hs |

### **Sprint #4**: dom 9 nov → sáb 15 nov 2025

**Objetivo:** Implementar capacidades PWA, internacionalización básica y mejorar accesibilidad y responsive design antes del desarrollo de funcionalidades de dominio.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Gestión | 20.1 Reporte Académico (dominical) | 1 | 0.9 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| Desarrollo | 0.7 i18n groundwork (infra de strings) | 4 | 5 | |
| Desarrollo | 0.5 PWA base (manifest + SW básico) | 5 | 6 | |
| Desarrollo | 12.1 Responsive grid & breakpoints | 6 | 6 | |
| Desarrollo | 12.2 A11y mínima (focus, labels, contraste) | 7 | 6 | |
| Capacitación | 16.5 Taller Deploy - Azure (lun 11 Nov) | 8 | 3 | |
| Capacitación | 16.6 Taller Deploy - Azure (miérc 13 Nov) | 9 | 3 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **32.7**hs | **0**hs |

Buffer reservado: **2.3**hs
Total con buffer: **35**hs

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **3.7**hs | **23**hs | **0**hs | **6**hs | **0**hs |

### **Sprint #5**: dom 16 nov → sáb 22 nov 2025

**Objetivo:** Implementar autenticación completa (RF-001, RF-002, RF-003) y establecer medidas de seguridad básicas del sistema.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Gestión | 20.1 Reporte Académico (dominical) | 1 | 0.9 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| Desarrollo | 2.2 Login de usuario (RF-002) | 4 | 8 | |
| Capacitación | 16.3 Taller Deploy - AWS (lun 18 Nov) | 5 | 3 | |
| Capacitación | 16.4 Taller Deploy - AWS (miérc 20 Nov) | 6 | 3 | |
| Desarrollo | 2.3 Logout (RF-003) | 7 | 4 | |
| Desarrollo | 2.5 AutZ por rol (admin/técnico/distribuidor) | 8 | 7 | |
| Desarrollo | 14.1 Hashing, rate-limit, CORS | 9 | 6 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **34.7**hs | **0**hs |

Buffer reservado: **0.3**hs
Total con buffer: **35**hs

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **3.7**hs | **25**hs | **0**hs | **6**hs | **0**hs |

### **Sprint #6**: dom 23 nov → sáb 29 nov 2025

**Objetivo:** Desarrollar gestión básica de maquinaria (RF-005) con alta de equipos y validaciones robustas en toda la aplicación.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Gestión | 20.1 Reporte Académico (dominical) | 1 | 0.9 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| Desarrollo | 3.1 Alta de máquina (RF-005) | 4 | 10 | |
| Desarrollo | 14.2 Validaciones Zod en controllers | 5 | 8 | |
| Desarrollo | 14.3 Permisos por endpoint (RBAC ligero) | 6 | 6 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **27.7**hs | **0**hs |

Buffer reservado: **7.3**hs
Total con buffer: **35**hs

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **3.7**hs | **24**hs | **0**hs | **0**hs | **0**hs |

### **Sprint #7**: dom 30 nov → sáb 6 dic 2025

**Objetivo:** Completar módulo de maquinaria con listado/detalle y establecer bases del sistema de mantenimiento preventivo (RF-007, RF-011).

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Gestión | 20.1 Reporte Académico (dominical) | 1 | 0.9 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| Desarrollo | 3.2 Listado + detalle | 4 | 9 | |
| Desarrollo | 4.1 Crear recordatorios (RF-007) | 5 | 9 | |
| Desarrollo | 6.1 Plantilla checklist (RF-011) | 6 | 5 | |
| Capacitación | 16.7 Taller Deploy - Deploy en Práctica (miérc 4 Dic) | 7 | 3 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **29.7**hs | **0**hs |

Buffer reservado: **5.3**hs
Total con buffer: **35**hs

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **3.7**hs | **23**hs | **0**hs | **3**hs | **0**hs |

### **Sprint #8**: dom 7 dic → sáb 13 dic 2025

**Objetivo:** Implementar sistema de alertas automáticas (RF-010) y funcionalidad completa de QuickCheck de seguridad (RF-011).

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Gestión | 20.1 Reporte Académico (dominical) | 1 | 0.9 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| Desarrollo | 5.1 Scheduler (agenda/node-cron) | 4 | 10 | |
| Desarrollo | 5.2 Generación + persistencia de alertas | 5 | 7 | |
| Desarrollo | 6.2 UI de ejecución (RF-011) | 6 | 12 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **32.7**hs | **0**hs |

Buffer reservado: **2.3**hs
Total con buffer: **35**hs

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **3.7**hs | **29**hs | **0**hs | **0**hs | **0**hs |

### **Sprint #9**: dom 14 dic → sáb 20 dic 2025

**Objetivo:** Desarrollar centro de notificaciones (RF-016) y módulo de registro de eventos de maquinaria (RF-008) parte 1.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Gestión | 20.1 Reporte Académico (dominical) | 1 | 0.9 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| Desarrollo | 6.3 Persistencia en historial (RF-011) | 4 | 5 | |
| Desarrollo | 8.1 Modelo + bandeja | 5 | 12 | |
| Desarrollo | 4.2 Registrar evento (RF-008) - Parte 1 | 6 | 10 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **30.7**hs | **0**hs |

Buffer reservado: **4.3**hs
Total con buffer: **35**hs

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **3.7**hs | **27**hs | **0**hs | **0**hs | **0**hs |

**Riesgos:** Integración entre notificaciones y eventos puede ser compleja.

### **Sprint #10**: dom 21 dic → sáb 27 dic 2025

**Objetivo:** Completar integración entre eventos, notificaciones y QuickCheck. Implementar edición con historial de máquinas (RF-006, RF-008, RF-017).

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Gestión | 20.1 Reporte Académico (dominical) | 1 | 0.9 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| Desarrollo | 4.2 Registrar evento (RF-008) - Parte 2 | 4 | 5 | |
| Desarrollo | 5.3 Hook a Centro de Notificaciones | 5 | 4 | |
| Desarrollo | 8.2 UI lectura/estado | 6 | 7 | |
| Desarrollo | 6.4 Aviso QuickCheck no aprobado (RF-017) | 7 | 6 | |
| Desarrollo | 3.3 Edición con historial (RF-006) | 8 | 8 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **33.7**hs | **0**hs |

Buffer reservado: **1.3**hs
Total con buffer: **35**hs

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **3.7**hs | **30**hs | **0**hs | **0**hs | **0**hs |

**Riesgos:** Sprint denso con múltiples integraciones críticas. Período navideño puede afectar productividad.

### **Sprint #11**: dom 28 dic → sáb 3 ene 2026

**Objetivo:** Implementar historial unificado de maquinaria (RF-009) y módulo de comunicación con distribuidores (RF-015).

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Gestión | 20.1 Reporte Académico (dominical) | 1 | 0.9 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| Desarrollo | 4.3 Historial unificado (RF-009) | 4 | 15 | |
| Desarrollo | 9.1 Datos de contacto por distribuidor | 5 | 5 | |
| Desarrollo | 9.2 Acciones de contacto (tel:, mailto:, wa.me) | 6 | 5 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **28.7**hs | **0**hs |

Buffer reservado: **6.3**hs
Total con buffer: **35**hs

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **3.7**hs | **25**hs | **0**hs | **0**hs | **0**hs |

**Riesgos:** Período de fiestas navideñas puede impactar disponibilidad.

### **Sprint #12**: dom 4 ene → sáb 10 ene 2026

**Objetivo:** Establecer cobertura robusta de testing unitario en backend y frontend, junto con datos de prueba y semillas demo.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Gestión | 20.1 Reporte Académico (dominical) | 1 | 0.9 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| QA | 13.3a Unit tests Backend | 4 | 12 | |
| QA | 13.4 Datos de prueba (semillas y factories) | 5 | 4 | |
| Desarrollo | 16.2 Semillas demo (usar 1.4) | 6 | 3 | |
| QA | 12.3 Pruebas visuales móviles/desktop | 7 | 5 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **27.7**hs | **0**hs |

Buffer reservado: **7.3**hs
Total con buffer: **35**hs

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **3.7**hs | **3**hs | **21**hs | **0**hs | **0**hs |

### **Sprint #13**: dom 11 ene → sáb 17 ene 2026

**Objetivo:** Completar testing frontend, preparar build de producción y establecer documentación técnica básica (API docs).

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Gestión | 20.1 Reporte Académico (dominical) | 1 | 0.9 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| QA | 13.3b Unit tests Frontend | 4 | 10 | |
| Desarrollo | 16.1 Build & deploy demo (front estático + API) | 5 | 8 | |
| Documentación | 17.2 API docs (OpenAPI simple) | 6 | 6 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **27.7**hs | **0**hs |

Buffer reservado: **7.3**hs
Total con buffer: **35**hs

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **3.7**hs | **8**hs | **10**hs | **0**hs | **6**hs |

### **Sprint #14**: dom 18 ene → sáb 24 ene 2026

**Objetivo:** Realizar validación exhaustiva del MVP con sanitización manual, testing E2E y implementar recuperación de contraseña (RF-004).

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Gestión | 20.1 Reporte Académico (dominical) | 1 | 0.9 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| QA | 13.5 Sanitización manual por feature | 4 | 8 | |
| QA | 13.8 Smoke E2E de flujos críticos | 5 | 6 | |
| Gestión | 18.2 Control de cambios | 6 | 3 | |
| Desarrollo | 18.3 Feature toggles | 7 | 5 | |
| Desarrollo | 2.4 Recuperación de contraseña (RF-004) [NiceToHave] | 8 | 8 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **33.7**hs | **0**hs |

Buffer reservado: **1.3**hs
Total con buffer: **35**hs

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **5.7**hs | **13**hs | **14**hs | **0**hs | **0**hs |

**Riesgos:** Sprint muy denso con poco buffer disponible.

### **Sprint #15**: dom 25 ene → sáb 31 ene 2026

**Objetivo:** Ejecutar ciclo de UAT, triage y corrección de defectos para asegurar calidad del MVP final.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Gestión | 20.1 Reporte Académico (dominical) | 1 | 0.9 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| QA | 13.7 Triage & fix post-UAT | 4 | 10 | |
| QA | 13.9 Gestión de defectos | 5 | 6 | |
| Desarrollo | 11.1 Ayuda inline mínima / "cómo usar esta página" [NiceToHave] | 6 | 6 | |
| Gestión | 19.1 Consolidación y tracking del backlog Post-MVP | 7 | 2 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **27.7**hs | **0**hs |

Buffer reservado: **7.3**hs
Total con buffer: **35**hs

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **5.7**hs | **6**hs | **16**hs | **0**hs | **0**hs |

### **Sprint #16**: dom 1 feb → sáb 7 feb 2026

**Objetivo:** Completar funcionalidades Nice-to-Have del módulo de repuestos (RF-012, RF-013, RF-014) y finalizar documentación para entrega.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Gestión | 20.1 Reporte Académico (dominical) | 1 | 0.9 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| Desarrollo | 7.1 Alta/edición repuesto (RF-012/014) [NiceToHave] | 4 | 8 | |
| Desarrollo | 7.2 Listado por máquina (RF-013) [NiceToHave] | 5 | 6 | |
| Desarrollo | 16.3 Script "reset demo" [NiceToHave] | 6 | 4 | |
| Documentación | 17.3 Manual breve de usuario [NiceToHave] | 7 | 6 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **27.7**hs | **0**hs |

Buffer reservado: **7.3**hs
Total con buffer: **35**hs

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **3.7**hs | **18**hs | **0**hs | **0**hs | **6**hs |

**Nota:** Este sprint incluye principalmente funcionalidades NiceToHave y puede ajustarse según el estado del proyecto.

### **Sprint #17**: dom 8 feb → sáb 14 feb 2026

**Objetivo:** Buffer final de entrega - refinamientos, documentación y verificaciones finales para la entrega académica.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Gestión | 20.1 Reporte Académico (dominical) | 1 | 0.9 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| Gestión | 21.21 Buffer de entrega final | 4 | 10 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **13.7**hs | **0**hs |

Buffer reservado: **21.3**hs
Total con buffer: **35**hs

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **13.7**hs | **0**hs | **0**hs | **0**hs | **0**hs |

**Nota:** Sprint de cierre con amplio buffer para refinamientos finales y preparación de entrega académica.

