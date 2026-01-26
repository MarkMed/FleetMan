# Diagramas Gantt de Sprints
<style>
.mermaid svg {
  max-width: 100% !important;
  width: 100% !important;
  height: auto !important;
}
</style>
**⚠️ Importante - Escala de Tiempo:**
Los diagramas Gantt de este proyecto utilizan una **escala de tiempo basada en horas productivas**, no en tiempo calendario real:

- **1 día en el diagrama = 5 horas productivas de trabajo** (jornada laboral deseada)
- **0.5 días = 2.5 horas**, **0.8 días = 4 horas**, etc.
- Las fechas mostradas son **referencias de calendario**, pero la duración visual representa **esfuerzo en horas** (deseadas y estimadas)

**Ejemplo:**
- Una tarea de "1.6d" significa **8 horas de trabajo** (8hs ÷ 5hs/día = 1.6 días)
- Si una tarea comienza el lunes y dura "1.6d", visualmente ocupa desde lunes hasta martes en el diagrama
- En la realidad, podrían ser 8 horas distribuidas como mejor convenga (2 días de 4hs, 1 día completo + medio día, etc.)

**Ventajas de este enfoque:**
- ✅ Refleja el esfuerzo real estimado para cada tarea
- ✅ Permite visualizar la carga de trabajo proporcional
- ✅ Facilita la planificación basada en capacidad del equipo
- ✅ Las estimaciones originales (en horas) se mantienen visibles en los nombres de las tareas

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
  0.3 Convención ramas & releases (3hs)        :t03, after t2118, 0.6d
  18.1 Scope freeze (MoSCoW) (2hs)            :t181, after t03, 1d
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
  21.1 Talleres (instancias de guía general) (3hs) :t211, after t2119, 1d
  21.2 Tutorías (guía con tutor asignado) (1hs)    :t212, after t2119, 1d
  21.20 Refinamientos varios (5.9hs)           :t2120, 2025-10-22, 3d
  0.8 Setup VSCode remoto (4hs)                   :t08, 2025-10-23, 2d

  section Hitos
  Entrega Documento Anteproyecto                :milestone, doc, 2025-10-22, 1d
  Cierre Sprint 1                              :milestone, s1, 2025-10-25, 1d
```

---

## Sprint #2 (2025-10-26 → 2025-11-01)

```mermaid
gantt
  title Sprint 2 (2025-10-26 → 2025-11-01)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9hs)               :t201, 2025-10-26, 1d
  20.2 Demo/UAT de Sprint #1 (1.5hs)           :t202, 2025-10-26, 1d
  20.3 Sprint Planning de Sprint #2 (1.3hs)      :t203, 2025-10-26, 1d
  0.6 User Journey mapping (flujos clave) (6hs) :t06, after t203, 2d
  1.3 DTOs + Zod (contratos compartidos) (7hs) :t13, after t06, 2d
  16.1 Taller Deploy - Conceptos Generales (3hs) :t161, 2025-10-30, 1d
  1.2 Esquemas DB (Mongoose + índices) (5hs)   :t12, after t13, 1d
  13.1 Estrategia & DoD QA (5hs)               :t131, after t12, 1d

  section Hitos
  Cierre Sprint 2                              :milestone, s2, 2025-11-01, 1d
```

---

## Sprint #3 (2025-11-02 → 2025-11-08)

```mermaid
gantt
  title Sprint 3 (2025-11-02 → 2025-11-08)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9hs)               :t201, 2025-11-02, 1d
  20.2 Demo/UAT de Sprint #2 (1.5hs)           :t202, 2025-11-02, 1d
  20.3 Sprint Planning de Sprint #3 (1.3hs)      :t203, 2025-11-02, 1d
  0.11 Setup Backend Básico (8hs)              :t011, after t203, 2d
  0.13 Setup Frontend Básico (8hs)             :t013, after t011, 2d
  16.2 Taller Deploy - Conceptos Generales (3hs) :t162, 2025-11-06, 1d
  13.2 Config Jest (front/back, TS, coverage) (6hs) :t132, after t013, 2d

  section Hitos
  Cierre Sprint 3                              :milestone, s3, 2025-11-08, 1d
```

---

## Sprint #4 (2025-11-09 → 2025-11-15)

```mermaid
gantt
  title Sprint 4 (2025-11-09 → 2025-11-15)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9hs)               :t201, 2025-11-09, 1d
  20.2 Demo/UAT de Sprint #3 (1.5hs)           :t202, 2025-11-09, 1d
  20.3 Sprint Planning de Sprint #4 (1.3hs)      :t203, 2025-11-09, 1d
  21.2 Tutorías (guía con tutor asignado) (1hs) :t212, 2025-11-09, 1d
  2.1 Registro de usuario (RF-001) (10hs)      :t21, after t203, 2d
  16.5 Taller Deploy - Azure (3hs)             :t165, 2025-11-11, 1d
  2.2 Login de usuario (RF-002) (8hs)          :t22, after t21, 2d
  16.6 Taller Deploy - Azure (3hs)             :t166, 2025-11-13, 1d
  2.3 Logout (RF-003) (4hs)                    :t23, after t22, 1d
  2.5 AutZ por rol básico (7hs)                :t25, after t23, 2d

  section Hitos
  Cierre Sprint 4                              :milestone, s4, 2025-11-15, 1d
  Auth Básico Funcional Completado             :milestone, auth, 2025-11-15, 1d
```

---

## Sprint #5 (2025-11-16 → 2025-11-22)

```mermaid
gantt
  title Sprint 5 (2025-11-16 → 2025-11-22)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9hs)               :t201, 2025-11-16, 1d
  20.2 Demo/UAT de Sprint #4 (1.5hs)           :t202, 2025-11-16, 1d
  20.3 Sprint Planning de Sprint #5 (1.3hs)      :t203, 2025-11-16, 1d
  3.1 Alta de máquina + ReactHookForms + Wizard Component (16hs) :t31, after t203, 4d
  21.2 Tutorías (guía con tutor asignado) (1hs) :t212, 2025-11-18, 1d
  16.3 Taller Deploy - AWS (3hs)               :t163, 2025-11-18, 1d
  16.4 Taller Deploy - AWS (3hs)               :t164, 2025-11-20, 1d
  Buffer/tareas extras                         :bextra, after t31, 2d

  section Hitos
  Cierre Sprint 5                              :milestone, s5, 2025-11-22, 1d
  Infraestructura Formularios Completada       :milestone, forms, 2025-11-22, 1d
```

---

## Sprint #6 (2025-11-23 → 2025-11-29)

```mermaid
gantt
  title Sprint 6 (2025-11-23 → 2025-11-29) - Deploy + PWA + i18n + Theme
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.
  %% ⚠️ Sprint ligeramente sobrecargado (40.8hs vs 35hs objetivo).

  20.1 Reporte Académico (5hs)                 :t201, 2025-11-23, 1d
  20.2 Demo/UAT de Sprint #5 (1.5hs)           :t202, 2025-11-23, 1d
  20.3 Sprint Planning de Sprint #6 (1.3hs)      :t203, 2025-11-23, 1d
  21.2 Tutorías (guía con tutor asignado) (1hs) :t212, 2025-11-24, 1d
  16.11 Azure Deploy - Config práctica (9hs)   :t1611, 2025-11-24, 2d
  0.5 PWA base (manifest + SW) (6hs)           :t05, after t1611, 1d
  16.7 Taller Deploy - Deploy en Práctica (3hs) :t167, 2025-11-27, 1d
  0.15 i18n - Implementación mínima (2hs)      :t015, after t05, 1d
  16.8 Build & deploy demo (8hs)               :t168, 2025-11-27, 2d
  12.5 Theme toggle (2hs)                      :t125, after t015, 1d
  12.6 Settings screen (2hs +1h buffer)        :t126, after t125, 1d

  section Hitos
  Taller Azure Deploy (Jue 27)                 :milestone, taller, 2025-11-27, 0d
  Cierre Sprint 6                              :milestone, s6, 2025-11-29, 1d
```

- **Notas del Sprint #6:**
- **Estado:** Sprint planificado con **40.8hs** estimadas vs 35hs objetivo (buffer -5.8hs)
- **Taller clave:** Jueves 27 nov — Taller universitario de Azure Deploy, sincronizar tarea 16.11 con este evento
- **Recomendación:** Priorizar deploy + PWA + i18n + theme + settings; mantener 1.2/1.4 como tareas just-in-time o mover trabajo adicional a Sprint #7 si se necesita más capacidad
- **Milestone crítico:** Dejar app deployada y accesible para validación con cliente

---

## Sprint #7 (2025-11-30 → 2025-12-06)

```mermaid
gantt
  title Sprint 7 (2025-11-30 → 2025-12-06) - QuickCheck por Capas
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (5hs)                  :t201, 2025-11-30, 1d
  20.2 Demo/UAT de Sprint #6 (1.5hs)            :t202, 2025-11-30, 1d
  20.3 Sprint Planning de Sprint #7 (1.3hs)       :t203, 2025-11-30, 1d
  21.2 Tutorías (1hs)                           :t212, 2025-12-01, 1d
  6.1 Domain + Persistence (4.5hs)              :t61, 2025-12-02, 1d
  6.3 Application Layer Backend (6.5hs)         :t63, after t61, 2d
  16.11 Azure Deploy - continuación (5hs)       :t1611, 2025-12-04, 1d
  16.7 Taller Deploy Práctica (3hs)             :t167, 2025-12-04, 1d
  6.2a UI Creación QuickCheck (5hs)             :t62a, after t63, 1d
  6.2b UI Ejecución QuickCheck (7.5hs)          :t62b, after t63, 2d
  6.4 API Integration Frontend (3.5hs)          :t64, 2025-12-06, 1d

  section Hitos
  Cierre Sprint 7                               :milestone, s7, 2025-12-06, 1d
  QuickCheck MVP Funcional                      :milestone, qc, 2025-12-06, 1d
```


---

## Sprint #8 (2025-12-07 → 2025-12-13)

```mermaid
gantt
  title Sprint 8 (2025-12-07 → 2025-12-13)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  section Domingo (Overhead)
  20.1 Reporte Académico (5hs)                 :t201, 2025-12-07, 1d
  20.2 Demo/UAT de Sprint #7 (1.5hs)           :t202, 2025-12-07, 1d
  20.3 Sprint Planning (1.3hs)                 :t203, 2025-12-08, 1d
  21.2 Tutorías (1hs)                          :t212, 2025-12-08, 1d

  12.8 UI Polish (0.75hs)                      :t128, 2025-12-09, 1d
  12.7 Navigation Drawer (3hs)              :t127a, 2025-12-09, 2d
  16.12 Azure Fix 404 (1hs)                    :t1612, 2025-12-10, 1d
  6.5 QuickCheck Tracking (4.2hs)              :t65, 2025-12-10, 2d
  3.2a Machine Enhancement (12hs)              :t32a, 2025-12-10, 3d
  0.5a PWA Manifest + Icons (1hs)              :t05a, 2025-12-13, 1d
  0.5b Service Worker Inicio (1.5hs)           :t05b1, 2025-12-13, 1d
  0.5b Service Worker Final (1.5hs)            :t05b2, 2025-12-13, 1d
  0.5c PWA Testing (1hs)                       :t05c, 2025-12-13, 1d

  section Hitos
  Cierre Sprint 8                              :milestone, s8, 2025-12-13, 1d
```

**Notas de distribución:**
- **Domingo:** Overhead académico y gestión (8.8hs)
- **Miércoles:** Quick wins UI - animaciones, reorder inputs, navigation drawer base, PWA manifest (4.75hs)
- **Jueves:** Machine Enhancement Day - navigation drawer responsive + machine enhancements completos (16hs - día extendido)
- **Viernes:** Critical fixes - Azure routing, QuickCheck tracking, service worker inicio (6.7hs)
- **Sábado:** PWA completion - service worker final + testing multi-dispositivo + buffer (2.5hs+)
- **Total desarrollo:** ~29hs (distribución flexible según avance real)

---

## Sprint #9 (2025-12-14 → 2025-12-20)

```mermaid
gantt
  title Sprint 9 (2025-12-14 → 2025-12-20) - Centro Notificaciones por Capas
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.
  %% Sprint enfocado 100% en sistema de notificaciones con arquitectura por capas

  section Domingo (Overhead)
  20.2 Demo/UAT de Sprint #8 (1.5hs)           :t202, 2025-12-14, 1d
  20.3 Sprint Planning de Sprint #9 (1.3hs)      :t203, 2025-12-14, 1d
  20.1 Reporte Académico (5hs)                 :t201, 2025-12-15, 1d
  21.2 Tutorías (1hs)                          :t212, 2025-12-15, 1d
  8.1 Domain+Contracts+Persistence (5hs)       :t81, 2025-12-16, 1d
  8.2 Application Layer Backend (6hs)          :t82, after t81, 1d
  8.3 Frontend UI Components (4hs)             :t83, after t82, 1d
  8.4 Frontend Integration+Observer (5hs)      :t84, after t83, 1d
  6.6 Integración QC→Notificaciones (4hs)      :t66, after t84, 1d
  8.5 Documentación Patrón (1hs)               :t85, after t84, 1d

  section Hitos
  Cierre Sprint 9                              :milestone, s9, 2025-12-20, 1d
```

**Notas del Sprint #9:**
- **Enfoque:** Sistema completo de notificaciones con arquitectura por capas (Domain → Application → UI → Integration)
- **Arquitectura:** Notification como subdocumento en User (no entidad independiente)
- **Orden secuencial:** Backend primero (Lun-Mar) → Frontend después (Mié-Jue) → Integración real (Vie) → Documentación (Sáb)
- **Observer Pattern:** Implementado con TanStack Query cache subscription (polling 30s automático)
- **Primera integración:** QuickCheck FAIL → Notificación → Toast automático
- **Buffer:** +1.2hs (33.8hs planificadas vs 35hs capacidad)
- **Distribución:**
  - Lunes: 8.1 Backend base (Domain + Persistence + Contracts)
  - Martes: 8.2 Application Layer (Use Cases + Controllers + API REST)
  - Miércoles: 8.3 Frontend UI (Badge + Bandeja + Toast components)
  - Jueves: 8.4 Frontend Integration (Services + TanStack Query + Observer)
  - Viernes: 6.6 Integración real con QuickCheck + Testing e2e
  - Sábado: 8.5 Documentación patrón + Buffer 1.2hs

---

## Sprint #10 (2025-12-21 → 2025-12-27)

```mermaid
gantt
  title Sprint 10 (2025-12-21 → 2025-12-27)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.2 Demo/UAT de Sprint #9 (1.5hs)           :t202, 2025-12-21, 1d
  20.3 Sprint Planning de Sprint #10 (1.3hs)      :t203, 2025-12-21, 1d
  20.1 Reporte Académico del Sprint #9 (5hs)    :t201, 2025-12-22, 1d
  21.2 Tutorías (1hs)                          :t212, 2025-12-23, 1d
  4.2a Domain+Contracts+Persistence (5hs)      :t42a, 2025-12-23, 1d
  4.2b Application Layer Backend (6hs)         :t42b, after t42a, 1.2d
  4.2c Frontend UI - Historial y Reportar (6hs) :t42c, after t42b, 1.2d
  4.2d Frontend Integration (4hs)              :t42d, after t42c, 0.8d
  6.6 QuickCheck FAIL → Evento + Notif (2hs)  :t66, after t42d, 0.4d

  section Hitos
  Cierre Sprint 10                             :milestone, s10, 2025-12-27, 1d
```

---

## Sprint #11 (2025-12-28 → 2026-01-03)

```mermaid
gantt
  title Sprint 11 (2025-12-28 → 2026-01-03) - Mantenimientos Programados
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.2 Demo/UAT de Sprint #10 (1.5hs)          :t202, 2025-12-28, 1d
  20.3 Sprint Planning de Sprint #11 (1.3hs)      :t203, 2025-12-28, 1d
  20.1 Reporte Académico (5hs)                 :t201, 2025-12-29, 1d
  21.2 Tutorías (1hs)                          :t212, 2025-12-29, 1d
  4.1a Domain+Contracts+Persistence (6hs)      :t41a, 2025-12-30, 1d
  4.1d CronJob Scheduler (3hs)                 :t41d, 2025-12-31, 0.6d
  4.1b Application Layer Backend (5hs)         :t41b, 2026-01-01, 1d
  4.1c Use Cases Automatización (5hs)          :t41c, 2026-01-01, 1d
  4.1e Frontend UI (6hs)                       :t41e, 2026-01-02, 1.2d
  4.1f Frontend Integration (4hs)              :t41f, 2026-01-02, 0.8d

  section Hitos
  Cierre Sprint 11                             :milestone, s11, 2026-01-03, 1d
```

---

## Sprint #12 (2026-01-04 → 2026-01-10)

```mermaid
gantt
  title Sprint 12 (2026-01-04 → 2026-01-10) - Comunicación entre Usuarios
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.2 Demo/UAT de Sprint #11 (1.5hs)          :t202, 2026-01-04, 1d
  20.3 Sprint Planning de Sprint #12 (1.3hs)      :t203, 2026-01-04, 1d
  20.1 Reporte Académico (5hs)                 :t201, 2026-01-05, 1d
  9.1a Domain+Contracts UserDirectory (2hs)    :t91a, 2026-01-06, 1d
  9.1b Application Backend UserDirectory (3hs) :t91b, 2026-01-06, 1d
  9.1c Frontend UserDiscovery (3hs)            :t91c, 2026-01-07, 1d
  9.2a Domain+Contracts Contacts (3hs)         :t92a, 2026-01-07, 1d
  9.2b Application Backend Contacts (4hs)      :t92b, 2026-01-08, 1d
  9.2c Frontend MyContacts (4hs)               :t92c, 2026-01-08, 1d
  9.3a Domain+Contracts Messages (4hs)         :t93a, 2026-01-09, 1d
  9.3b Application Backend Messages (5hs)      :t93b, 2026-01-09, 1d

  section Hitos
  Cierre Sprint 12                             :milestone, s12, 2026-01-10, 1d
```

---

## Sprint #13 (2026-01-11 → 2026-01-17)

```mermaid
gantt
  title Sprint 13 (2026-01-11 → 2026-01-17) - Quality & Refinement Sprint
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.
  %% Orden estratégico: simple → complejo para momentum

  20.2 Demo/UAT de Sprint #12 (1.5hs)          :t202, 2026-01-11, 1d
  20.3 Sprint Planning de Sprint #13 (1.3hs)   :t203, 2026-01-11, 1d
  21.2 Tutorías (1hs)                          :t212, 2026-01-12, 1d
  20.1 Reporte Académico Sprint #12 (5hs)      :t201, 2026-01-12, 1d

  10.1a User Editing Domain+Persistence (2hs)  :t101a, 2026-01-13, 1d
  10.1b User Editing Application Backend (3hs) :t101b, 2026-01-13, 1d
  10.1c User Editing Frontend UI (3hs)         :t101c, 2026-01-13, 1d

  10.2a Bio & Tags Domain+Persistence (2hs)    :t102a, 2026-01-14, 1d
  10.2b Bio & Tags Application Backend (2hs)   :t102b, 2026-01-14, 1d
  10.2c Bio & Tags Frontend UI (2hs)           :t102c, 2026-01-14, 1d

  9.3e Accept Chat Requests (4hs)              :t93e, 2026-01-15, 1d
  9.3f Block Users (3hs)                       :t93f, 2026-01-15, 1d
  9.3g Request Tracking (2hs)                  :t93g, 2026-01-15, 1d
  9.3h UI Integration (3hs)                    :t93h, 2026-01-15, 1d

  3.3a Machine Editing Domain+Persistence (2hs) :t33a, 2026-01-16, 1d
  3.3b Machine Editing Application (2hs)       :t33b, 2026-01-16, 1d
  3.3c Machine Editing Frontend (3hs)          :t33c, 2026-01-16, 1d
  10.3 Image Upload Adaptation (3hs)           :t103, 2026-01-16, 1d

  section Hitos
  Cierre Sprint 13                             :milestone, s13, 2026-01-17, 0d
```

---

## Sprint #14 (2026-01-18 → 2026-01-24)

```mermaid
gantt
  title Sprint 14 (2026-01-18 → 2026-01-24) - UX & Usability Boost + Dashboard Refresh
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.
  %% Orden según tabla: Overhead → UX/Nav/Settings → Dashboard → Registro → Reporte

  22.2 Demo/UAT de Sprint #13 (1.5hs)          :t222, 2026-01-18, 1d
  22.3 Sprint Planning de Sprint #14 (1.3hs)   :t223, 2026-01-18, 1d
  22.4 Tutorías (1hs)                          :t224, 2026-01-19, 1d
  22.1 Reporte Académico Sprint #13 (5hs)      :t221, 2026-01-19, 1d

  14.10 Mini Perfil Navbar + Logout (4hs)      :t1410, 2026-01-20, 1d
  14.5 Theme toggle (2hs)                      :t145, 2026-01-20, 1d
  14.6 Settings screen + Email Toggle (6hs)    :t146, 2026-01-20, 1d

  12.1 Dashboard Últimos QuickChecks (5hs)     :t121, 2026-01-21, 1d
  12.2 Dashboard Últimos Eventos (5hs)         :t122, 2026-01-21, 2d
  12.3 Dashboard Layout Final (2hs)            :t123, 2026-01-22, 1d
  2.1b Registro Extendido Wizard (8hs)         :t21b, 2026-01-23, 1d

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

  20.1 Reporte Académico (0.9hs)               :t201, 2026-01-25, 1d
  20.2 Demo/UAT de Sprint #14 (1.5hs)          :t202, 2026-01-25, 1d
  20.3 Sprint Planning de Sprint #15 (1.3hs)      :t203, 2026-01-25, 1d
  13.7 Triage & fix post-UAT (10hs)            :t137, after t203, 2d
  13.9 Gestión de defectos (6hs)               :t139, after t137, 2d
  11.1 Ayuda inline mínima / "cómo usar esta página" (6hs) :t111, after t139, 2d
  19.1 Consolidación y tracking del backlog Post-MVP (2hs) :t191, after t111, 1d

  section Hitos
  Cierre Sprint 15                             :milestone, s15, 2026-01-31, 1d
```

---

## Sprint #16 (2026-02-01 → 2026-02-07)

```mermaid
gantt
  title Sprint 16 (2026-02-01 → 2026-02-07)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9hs)               :t201, 2026-02-01, 1d
  20.2 Demo/UAT de Sprint #15 (1.5hs)          :t202, 2026-02-01, 1d
  20.3 Sprint Planning de Sprint #16 (1.3hs)      :t203, 2026-02-01, 1d
  7.1 Alta/edición repuesto (RF-012/014) (8hs) :t71, after t203, 2d
  7.2 Listado por máquina (RF-013) (6hs)       :t72, after t71, 2d
  16.3 Script "reset demo" (4hs)               :t163, after t72, 1d
  17.3 Manual breve de usuario (6hs)           :t173, after t163, 2d

  section Hitos
  Cierre Sprint 16                             :milestone, s16, 2026-02-07, 1d
```

---

## Sprint #17 (2026-02-08 → 2026-02-14)

```mermaid
gantt
  title Sprint 17 (2026-02-08 → 2026-02-14)
  dateFormat  YYYY-MM-DD
  axisFormat  %d

  %% Asumimos 5 h/día. Horas estimadas incluidas en el nombre.

  20.1 Reporte Académico (0.9hs)               :t201, 2026-02-08, 1d
  20.2 Demo/UAT de Sprint #16 (1.5hs)          :t202, 2026-02-08, 1d
  20.3 Sprint Planning de Sprint #17 (1.3hs)      :t203, 2026-02-08, 1d
  21.21 Buffer de entrega final (10hs)         :t2121, after t203, 2d

  section Hitos
  Cierre Sprint 17                             :milestone, s17, 2026-02-14, 1d
  Entrega Final del Proyecto                    :milestone, acadfinal, 2026-02-14, 1d
```

---

## Eventos Académicos Post-MVP (2026-02-08 → 2026-04-30)

```mermaid
gantt
  title Eventos Académicos Post-MVP (Feb-Abr 2026)
  dateFormat  YYYY-MM-DD
  axisFormat  %d/%m

  %% Eventos académicos sin horas de desarrollo, solo hitos

  section Transición
  Buffer de Entrega (10hs desarrollo)         :buffer, 2026-02-08, 2d

  section Eventos Académicos
  Preparación Defensa                          :prep, 2026-02-11, 32d
  Defensa del Proyecto                         :milestone, defense, 2026-03-15, 0d
  Correcciones Post-Defensa                    :corrections, after defense, 21d
  Cierre Académico                             :milestone, closure, 2026-04-15, 0d

  section Hitos
  Defensa del Proyecto                         :milestone, acaddefense, 2026-03-15, 0d
  Cierre Académico Final                       :milestone, acadclosure, 2026-04-15, 0d
```

---

## Resumen General

- **Total de sprints:** 17 (Sprint #0 a Sprint #17)
- **Duración del desarrollo:** 12 de octubre 2025 - 14 de febrero 2026
- **Duración por sprint:** 7 días (domingo a sábado)
- **Estimación de trabajo:** 5 horas por día laboral
- **Hitos principales de desarrollo:**
  - Sprint 0: Configuración inicial y documentación del anteproyecto
  - Sprint 1: Entrega del Documento Anteproyecto (22 oct)
  - Sprint 2-3: Configuración base de desarrollo
  - Sprint 4: PWA y UX (movido desde posición anterior del Sprint #11)
  - Sprints 5-11: Desarrollo del MVP core
  - Sprints 12-17: Testing, refinamiento y funcionalidades adicionales
- **Eventos académicos principales:**
  - Primera Instancia: Noviembre 2025
  - Segunda Instancia: Diciembre 2025
  - Entrega Final: Febrero 2026
  - Defensa del Proyecto: Marzo 2026
  - Cierre Académico: Abril 2026

**Notas:**
- Cada sprint incluye actividades de gestión dominicales (Reporte, Demo/UAT, Planning)
- Los sprints navideños (10-11) pueden tener productividad reducida
- Las funcionalidades marcadas como `[NiceToHave]` pueden ajustarse según el progreso
- El Sprint 14 es especialmente denso con poco buffer disponible
- **Cambio importante:** El Sprint #4 ahora se enfoca en PWA/UX (anteriormente era Sprint #11), estableciendo las bases de UX antes del desarrollo de funcionalidades de dominio
- **Sprint #17:** Buffer final para refinamientos, documentación y verificaciones de calidad antes de la entrega académica
