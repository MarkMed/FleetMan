# Diagramas Gantt de Sprints

**⚠️ Importante - Escala de Tiempo:**
Los diagramas Gantt de este proyecto utilizan una **escala de tiempo basada en horas productivas**, no en tiempo calendario real:

- **1 día en el diagrama = 5 horas productivas de trabajo** (jornada laboral deseada)
- **0.5 días = 2.5 horas**, **0.8 días = 4 horas**, etc.
- Las fechas mostradas son **referencias de calendario**, pero la duración visual representa **esfuerzo en horas** (deseadas y estimadas)

**Ejemplo:**
- Una tarea de "1.6d" significa **8 horas de trabajo** (8h ÷ 5h/día = 1.6 días)
- Si una tarea comienza el lunes y dura "1.6d", visualmente ocupa desde lunes hasta martes en el diagrama
- En la realidad, podrían ser 8 horas distribuidas como mejor convenga (2 días de 4h, 1 día completo + medio día, etc.)

**Ventajas de este enfoque:**
- ✅ Refleja el esfuerzo real estimado para cada tarea
- ✅ Permite visualizar la carga de trabajo proporcional
- ✅ Facilita la planificación basada en capacidad del equipo
- ✅ Las estimaciones originales (en horas) se mantienen visibles en los nombres de las tareas

<style>
.mermaid svg {
  max-width: 100% !important;
  width: 100% !important;
  height: auto !important;
}
</style>

## Sprint #0 (2025-10-12 → 2025-10-18)

```mermaid
%%{initBORRAR: {'theme':'base', 'themeVariables': {'primaryColor':'#9ab4e4ff'}}}%%
gantt
  title Sprint 0 (2025-10-12 → 2025-10-18)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Sprint retrospectivo sin estimaciones previas.

  21.1 Talleres (instancias de guía general)    :t211, 2025-10-12, 1d
  21.2 Tutorías (guía con tutor asignado)      :t212, 2025-10-12, 1d
  21.17 Diagramar arquitectura                 :t2117, 2025-10-12, 1d
  21.18 Hacer diagrama Conceptual de Dominio   :t2118, 2025-10-12, 1d
  0.3 Convención ramas & releases (3 h)        :t03, after t2118, 0.6d
  18.1 Scope freeze (MoSCoW) (2 h)            :t181, after t03, 1d
  21.19 Planear tareas y sprints               :t2119, after t03, 3d
  21.20 Refinamientos varios                   :t2120, after t2119, 1d

  section Hitos
  Cierre Sprint 0                              :milestone, s0, 2025-10-18, 0d
```

---

## Sprint #1 (2025-10-19 → 2025-10-25)

```mermaid
gantt
  title Sprint 1 (2025-10-19 → 2025-10-25)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  21.19 Planear tareas y sprints               :t2119, 2025-10-19, 2d
  21.20 Refinamientos varios                   :t2120, 2025-10-19, 3d
  21.1 Talleres (instancias de guía general) (3 h) :t211, after t2119, 1d
  21.2 Tutorías (guía con tutor asignado) (1 h)    :t212, after t2119, 1d
  0.1 Repos & monorepo (front React+Vite, back Node/TS) (8 h) :t01, after t212, 1.6d
  0.2 CI mínima (lint, type-check, runner Jest) (6 h) :t02, after t01, 1.2d
  0.4 Entornos (local/dev + demo) (7 h)        :t04, after t02, 1.4d

  section Hitos
  Entrega Documento Anteproyecto                :milestone, doc, 2025-10-22, 0d
  Cierre Sprint 1                              :milestone, s1, 2025-10-25, 0d
```

---

## Sprint #2 (2025-10-26 → 2025-11-01)

```mermaid
gantt
  title Sprint 2 (2025-10-26 → 2025-11-01)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9 h)               :t201, 2025-10-26, 0.2d
  20.2 Demo/UAT con cliente (1.5 h)            :t202, after t201, 0.3d
  20.3 Sprint Planning dominguero (1.3 h)      :t203, after t202, 0.3d
  1.2 Esquemas DB (Mongoose + índices) (5 h)   :t12, after t203, 1d
  1.3 DTOs + Zod (contratos compartidos) (7 h) :t13, after t12, 1.4d
  0.6 Design system base (tokens, layout, UI) (10 h) :t06, after t13, 2d
  13.1 Estrategia & DoD QA (5 h)               :t131, after t06, 1d

  section Hitos
  Cierre Sprint 2                              :milestone, s2, 2025-11-01, 0d
```

---

## Sprint #3 (2025-11-02 → 2025-11-08)

```mermaid
gantt
  title Sprint 3 (2025-11-02 → 2025-11-08)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9 h)               :t201, 2025-11-02, 0.2d
  20.2 Demo/UAT con cliente (1.5 h)            :t202, after t201, 0.3d
  20.3 Sprint Planning dominguero (1.3 h)      :t203, after t202, 0.3d
  1.4 Semillas demo (dataset mínimo) (4 h)     :t14, after t203, 0.8d
  2.1 Registro (RF-001) (10 h)                 :t21, after t14, 2d
  13.2 Config Jest (front/back, TS, coverage) (6 h) :t132, after t21, 1.2d
  15.1 Logger estructurado (niveles, request-id) (5 h) :t151, after t132, 1d

  section Hitos
  Cierre Sprint 3                              :milestone, s3, 2025-11-08, 0d
```

---

## Sprint #4 (2025-11-09 → 2025-11-15)

```mermaid
gantt
  title Sprint 4 (2025-11-09 → 2025-11-15)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9 h)               :t201, 2025-11-09, 0.2d
  20.2 Demo/UAT con cliente (1.5 h)            :t202, after t201, 0.3d
  20.3 Sprint Planning dominguero (1.3 h)      :t203, after t202, 0.3d
  2.2 Login de usuario (RF-002) (8 h)          :t22, after t203, 1.6d
  2.3 Logout (RF-003) (4 h)                    :t23, after t22, 0.8d
  2.5 AutZ por rol (admin/técnico/distribuidor) (7 h) :t25, after t23, 1.4d
  14.1 Hashing, rate-limit, CORS (6 h)         :t141, after t25, 1.2d

  section Hitos
  Cierre Sprint 4                              :milestone, s4, 2025-11-15, 0d
```

---

## Sprint #5 (2025-11-16 → 2025-11-22)

```mermaid
gantt
  title Sprint 5 (2025-11-16 → 2025-11-22)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9 h)               :t201, 2025-11-16, 0.2d
  20.2 Demo/UAT con cliente (1.5 h)            :t202, after t201, 0.3d
  20.3 Sprint Planning dominguero (1.3 h)      :t203, after t202, 0.3d
  3.1 Alta de máquina (RF-005) (10 h)          :t31, after t203, 2d
  14.2 Validaciones Zod en controllers (8 h)   :t142, after t31, 1.6d
  14.3 Permisos por endpoint (RBAC ligero) (6 h) :t143, after t142, 1.2d

  section Hitos
  Cierre Sprint 5                              :milestone, s5, 2025-11-22, 0d
```

---

## Sprint #6 (2025-11-23 → 2025-11-29)

```mermaid
gantt
  title Sprint 6 (2025-11-23 → 2025-11-29)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9 h)               :t201, 2025-11-23, 0.2d
  20.2 Demo/UAT con cliente (1.5 h)            :t202, after t201, 0.3d
  20.3 Sprint Planning dominguero (1.3 h)      :t203, after t202, 0.3d
  3.2 Listado + detalle (9 h)                  :t32, after t203, 1.8d
  4.1 Crear recordatorios (RF-007) (9 h)       :t41, after t32, 1.8d
  6.1 Plantilla checklist (RF-011) (5 h)       :t61, after t41, 1d

  section Hitos
  Cierre Sprint 6                              :milestone, s6, 2025-11-29, 0d
```

---

## Sprint #7 (2025-11-30 → 2025-12-06)

```mermaid
gantt
  title Sprint 7 (2025-11-30 → 2025-12-06)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9 h)               :t201, 2025-11-30, 0.2d
  20.2 Demo/UAT con cliente (1.5 h)            :t202, after t201, 0.3d
  20.3 Sprint Planning dominguero (1.3 h)      :t203, after t202, 0.3d
  5.1 Scheduler (agenda/node-cron) (10 h)      :t51, after t203, 2d
  5.2 Generación + persistencia de alertas (7 h) :t52, after t51, 1.4d
  6.2 UI de ejecución (RF-011) (12 h)          :t62, after t52, 2.4d

  section Hitos
  Cierre Sprint 7                              :milestone, s7, 2025-12-06, 0d
```

---

## Sprint #8 (2025-12-07 → 2025-12-13)

```mermaid
gantt
  title Sprint 8 (2025-12-07 → 2025-12-13)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9 h)               :t201, 2025-12-07, 0.2d
  20.2 Demo/UAT con cliente (1.5 h)            :t202, after t201, 0.3d
  20.3 Sprint Planning dominguero (1.3 h)      :t203, after t202, 0.3d
  6.3 Persistencia en historial (RF-011) (5 h) :t63, after t203, 1d
  8.1 Modelo + bandeja (12 h)                  :t81, after t63, 2.4d
  4.2 Registrar evento (RF-008) - Parte 1 (10 h) :t421, after t81, 2d

  section Hitos
  Cierre Sprint 8                              :milestone, s8, 2025-12-13, 0d
```

---

## Sprint #9 (2025-12-14 → 2025-12-20)

```mermaid
gantt
  title Sprint 9 (2025-12-14 → 2025-12-20)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9 h)               :t201, 2025-12-14, 0.2d
  20.2 Demo/UAT con cliente (1.5 h)            :t202, after t201, 0.3d
  20.3 Sprint Planning dominguero (1.3 h)      :t203, after t202, 0.3d
  4.2 Registrar evento (RF-008) - Parte 2 (5 h) :t422, after t203, 1d
  5.3 Hook a Centro de Notificaciones (4 h)    :t53, after t422, 0.8d
  8.2 UI lectura/estado (7 h)                  :t82, after t53, 1.4d
  6.4 Aviso QuickCheck no aprobado (RF-017) (6 h) :t64, after t82, 1.2d
  3.3 Edición con historial (RF-006) (8 h)     :t33, after t64, 1.6d

  section Hitos
  Cierre Sprint 9                              :milestone, s9, 2025-12-20, 0d
```

---

## Sprint #10 (2025-12-21 → 2025-12-27)

```mermaid
gantt
  title Sprint 10 (2025-12-21 → 2025-12-27)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9 h)               :t201, 2025-12-21, 0.2d
  20.2 Demo/UAT con cliente (1.5 h)            :t202, after t201, 0.3d
  20.3 Sprint Planning dominguero (1.3 h)      :t203, after t202, 0.3d
  4.3 Historial unificado (RF-009) (15 h)      :t43, after t203, 3d
  9.1 Datos de contacto por distribuidor (5 h) :t91, after t43, 1d
  9.2 Acciones de contacto (tel, mailto, wa.me) (5 h) :t92, after t91, 1d

  section Hitos
  Cierre Sprint 10                             :milestone, s10, 2025-12-27, 0d
```

---

## Sprint #11 (2025-12-28 → 2026-01-03)

```mermaid
gantt
  title Sprint 11 (2025-12-28 → 2026-01-03)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9 h)               :t201, 2025-12-28, 0.2d
  20.2 Demo/UAT con cliente (1.5 h)            :t202, after t201, 0.3d
  20.3 Sprint Planning dominguero (1.3 h)      :t203, after t202, 0.3d
  0.5 PWA base (manifest + SW básico) (6 h)    :t05, after t203, 1.2d
  0.7 i18n groundwork (infra de strings) (5 h) :t07, after t05, 1d
  12.1 Responsive grid & breakpoints (6 h)     :t121, after t07, 1.2d
  12.2 A11y mínima (focus, labels, contraste) (6 h) :t122, after t121, 1.2d

  section Hitos
  Cierre Sprint 11                             :milestone, s11, 2026-01-03, 0d
```

---

## Sprint #12 (2026-01-04 → 2026-01-10)

```mermaid
gantt
  title Sprint 12 (2026-01-04 → 2026-01-10)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9 h)               :t201, 2026-01-04, 0.2d
  20.2 Demo/UAT con cliente (1.5 h)            :t202, after t201, 0.3d
  20.3 Sprint Planning dominguero (1.3 h)      :t203, after t202, 0.3d
  13.3a Unit tests Backend (12 h)              :t133a, after t203, 2.4d
  13.4 Datos de prueba (semillas y factories) (4 h) :t134, after t133a, 0.8d
  16.2 Semillas demo (usar 1.4) (3 h)          :t162, after t134, 0.6d
  12.3 Pruebas visuales móviles/desktop (5 h)  :t123, after t162, 1d

  section Hitos
  Cierre Sprint 12                             :milestone, s12, 2026-01-10, 0d
```

---

## Sprint #13 (2026-01-11 → 2026-01-17)

```mermaid
gantt
  title Sprint 13 (2026-01-11 → 2026-01-17)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9 h)               :t201, 2026-01-11, 0.2d
  20.2 Demo/UAT con cliente (1.5 h)            :t202, after t201, 0.3d
  20.3 Sprint Planning dominguero (1.3 h)      :t203, after t202, 0.3d
  13.3b Unit tests Frontend (10 h)             :t133b, after t203, 2d
  16.1 Build & deploy demo (front estático + API) (8 h) :t161, after t133b, 1.6d
  17.2 API docs (OpenAPI simple) (6 h)         :t172, after t161, 1.2d

  section Hitos
  Cierre Sprint 13                             :milestone, s13, 2026-01-17, 0d
```

---

## Sprint #14 (2026-01-18 → 2026-01-24)

```mermaid
gantt
  title Sprint 14 (2026-01-18 → 2026-01-24)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9 h)               :t201, 2026-01-18, 0.2d
  20.2 Demo/UAT con cliente (1.5 h)            :t202, after t201, 0.3d
  20.3 Sprint Planning dominguero (1.3 h)      :t203, after t202, 0.3d
  13.5 Sanitización manual por feature (8 h)   :t135, after t203, 1.6d
  13.8 Smoke E2E de flujos críticos (6 h)      :t138, after t135, 1.2d
  18.2 Control de cambios (3 h)                :t182, after t138, 0.6d
  18.3 Feature toggles (5 h)                   :t183, after t182, 1d
  2.4 Recuperación de contraseña (RF-004) (8 h) :t24, after t183, 1.6d

  section Hitos
  Cierre Sprint 14                             :milestone, s14, 2026-01-24, 0d
```

---

## Sprint #15 (2026-01-25 → 2026-01-31)

```mermaid
gantt
  title Sprint 15 (2026-01-25 → 2026-01-31)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9 h)               :t201, 2026-01-25, 0.2d
  20.2 Demo/UAT con cliente (1.5 h)            :t202, after t201, 0.3d
  20.3 Sprint Planning dominguero (1.3 h)      :t203, after t202, 0.3d
  13.7 Triage & fix post-UAT (10 h)            :t137, after t203, 2d
  13.9 Gestión de defectos (6 h)               :t139, after t137, 1.2d
  11.1 Ayuda inline mínima / "cómo usar esta página" (6 h) :t111, after t139, 1.2d
  19.1 Consolidación y tracking del backlog Post-MVP (2 h) :t191, after t111, 0.4d

  section Hitos
  Cierre Sprint 15                             :milestone, s15, 2026-01-31, 0d
```

---

## Sprint #16 (2026-02-01 → 2026-02-07)

```mermaid
gantt
  title Sprint 16 (2026-02-01 → 2026-02-07)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9 h)               :t201, 2026-02-01, 0.2d
  20.2 Demo/UAT con cliente (1.5 h)            :t202, after t201, 0.3d
  20.3 Sprint Planning dominguero (1.3 h)      :t203, after t202, 0.3d
  7.1 Alta/edición repuesto (RF-012/014) (8 h) :t71, after t203, 1.6d
  7.2 Listado por máquina (RF-013) (6 h)       :t72, after t71, 1.2d
  16.3 Script "reset demo" (4 h)               :t163, after t72, 0.8d
  17.3 Manual breve de usuario (6 h)           :t173, after t163, 1.2d

  section Hitos
  Cierre Sprint 16                             :milestone, s16, 2026-02-07, 0d
```

---

## Resumen General

- **Total de sprints:** 16
- **Duración del proyecto:** 12 de octubre 2025 - 7 de febrero 2026
- **Duración por sprint:** 7 días (domingo a sábado)
- **Estimación de trabajo:** 5 horas por día laboral
- **Hitos principales:**
  - Sprint 0: Configuración inicial y documentación del anteproyecto
  - Sprint 1: Entrega del Documento Anteproyecto (22 oct)
  - Sprints 2-11: Desarrollo del MVP
  - Sprints 12-16: Testing, refinamiento y funcionalidades adicionales

**Notas:**
- Cada sprint incluye actividades de gestión dominicales (Reporte, Demo/UAT, Planning)
- Los sprints navideños (10-11) pueden tener productividad reducida
- Las funcionalidades marcadas como `[NiceToHave]` pueden ajustarse según el progreso
- El Sprint 14 es especialmente denso con poco buffer disponible
