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

| Total Horas Estimadas (sin buffer) | Total Horas Reales | Consumo |
|:---:|:----------:|:-------:|
| **No est.** hs | **16**hs | **N/A** |

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

| Total Horas Estimadas (sin buffer) | Total Horas Reales | Consumo |
|:---:|:----------:|:-------:|
| **16**hs | **22.86**hs | **142.9%** |

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
| Documentación | 20.1 Reporte Académico (dominical) | 1 | 0.9 | 1.8 |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | 1 |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | 0.6 |
| Capacitación | 21.2 Tutorías (guía con tutor asignado) | 4 | 1 | 0 |
| Desarrollo | 1.2 Esquemas DB (Mongoose + índices clave) | 5 | 5 | 0 |
| Desarrollo | 1.3 DTOs + Zod (contratos compartidos) | 6 | 7 | 9.02 |
| Desarrollo | 0.6 User Journey mapping | 7 | 6 | 14.8 |
| QA | 13.1 Estrategia & DoD QA | 8 | 5 | 1.5 |
| Capacitación | 16.1 Taller Deploy - Conceptos Generales (miérc 30 Oct) | 9 | 3 | 3 |

| Total Horas Estimadas (sin buffer) | Total Horas Reales | Consumo |
|:---:|:----------:|:-------:|
| **34.7**hs | **31.72**hs | **91.4%** |

Buffer reservado: **0.3**hs
Total con buffer: **35**hs

```mermaid
xychart-beta
    title "Sprint #2: Horas Estimadas #40;azul#41; vs Reales #40;verde#41;"
    x-axis "Tareas" ["20.1", "20.2", "20.3", "21.2", "1.2", "1.3", "0.6", "13.1", "16.1", "TOTAL"]
    y-axis "Horas" 0 --> 35
	
	%% Green line
    line [0.9, 1.5, 1.3, 1, 5, 7, 6, 5, 3, 34.7]

	%% Black line
    line [1.8, 1, 0.6, 0, 0, 9.02, 14.8, 1.5, 3, 31.72]
```

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **2.5**hs | **23.82**hs | **1.5**hs | **3**hs | **0.9**hs |

**Riesgos:** El design system puede requerir iteraciones con feedback del cliente.

### **Sprint #3**: dom 2 nov → sáb 8 nov 2025

**Objetivo:** Establecer la infraestructura básica de backend y frontend necesaria para el desarrollo posterior de funcionalidades de dominio.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Documentación | 20.1 Reporte Académico (dominical) | 1 | 0.9 | 6.8 |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | 1.1 |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | 1.9 |
| Capacitación | 21.2 Tutorías (guía con tutor asignado) | 4 | 1 | 0.9 |
| Desarrollo | 0.11 Setup Backend Básico | 5 | 8 | 3.5 |
| Desarrollo | 0.13 Setup Frontend Básico | 6 | 8 | 4.2 |
| Desarrollo | 1.3 DTOs + Zod (contratos compartidos) - continuación | 7 | 6 | 8.3 |
| Capacitación | 16.2 Taller Deploy - Conceptos Generales (miérc 6 Nov) | 8 | 3 | 3 |

| Total Horas Estimadas (sin buffer) | Total Horas Reales | Consumo |
|:---:|:----------:|:-------:|
| **29.7**hs | **29.7**hs | **100.0%** |

Buffer reservado: **5.3**hs
Total con buffer: **35**hs

```mermaid
xychart-beta
    title "Sprint #3: Horas Estimadas #40;azul#41; vs Reales #40;verde#41;"
    x-axis "Tareas" ["20.1", "20.2", "20.3", "21.2", "0.11", "0.13", "1.3", "16.2", "TOTAL"]
    y-axis "Horas" 0 --> 30
	
	%% Green line
    line [0.9, 1.5, 1.3, 1, 8, 8, 6, 3, 29.7]

	%% Black line
    line [6.8, 1.1, 1.9, 0.9, 3.5, 4.2, 8.3, 3, 29.7]
```

Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **8.9**hs | **16.0**hs | **0**hs | **3.9**hs | **0.9**hs |

### **Sprint #4**: dom 9 nov → sáb 15 nov 2025

**Objetivo:** 🎯 Auth Básico Funcional - Registro, login, autologin, session JWT y logout.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Documentación | 20.1 Reporte Académico (dominical) | 1 | 0.9 | 7.1 |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | 1.6 |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | 4.1 |
| Capacitación | 21.2 Tutorías (guía con tutor asignado) | 4 | 1 | 0.88 |
| Desarrollo | 2.1 Registro de usuario (RF-001) | 5 | 10 | 12.9 |
| Desarrollo | 2.2 Login de usuario (RF-002) | 6 | 8 | 8.2 |
| Desarrollo | 2.3 Logout (RF-003) | 7 | 4 | 0.6 |
| Desarrollo | 2.5 AutZ por rol básico | 8 | 7 | 1.2 |
| Capacitación | 16.5 Taller Deploy - Azure (mar 11 Nov) | 9 | 3 |0|
| Capacitación | 16.6 Taller Deploy - Azure (jue 13 Nov) | 10 | 3 | 2.9 |

| Total Horas Estimadas (sin buffer) | Total Horas Reales | Consumo |
|:---:|:----------:|:-------:|
| **39.7**hs | **39.48**hs | **99.4%** |

Buffer reservado: **-4.7**hs
Total con buffer: **35**hs

```mermaid
xychart-beta
    title "Sprint #4: Horas Estimadas #40;azul#41; vs Reales #40;verde#41;"
    x-axis "Tareas" ["20.1", "20.2", "20.3", "21.2", "2.1", "2.2", "2.3", "2.5", "16.5", "16.6", "TOTAL"]
    y-axis "Horas" 0 --> 40
	
	%% Green line
    line [0.9, 1.5, 1.3, 1, 10, 8, 4, 7, 3, 3, 39.7]

	%% Black line
    line [7.1, 1.6, 4.1, 0.88, 12.9, 8.2, 0.6, 1.2, 0, 2.9, 39.48]
```
Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **11.9**hs | **22.9**hs | **0**hs | **3.78**hs | **0.9**hs |

### **Sprint #5**: dom 16 nov → sáb 22 nov 2025

**Objetivo:** 🎯 Mejoras en Formularios y registro de máquina - ReactHookForms + Wizard Component + Alta máquinas.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Documentación | 20.1 Reporte Académico (dominical) | 1 | 0.9 | 6.6 |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | 0.9 |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | 1.2 |
| Capacitación | 21.2 Tutorías (guía con tutor asignado) | 4 | 1 | 0.5 |
| Desarrollo | 3.1 Alta de máquina (RF-005) + ReactHookForms + Wizard Component | 5 | 16 | 23.8 |
| Capacitación | 16.3 Taller Deploy - AWS (mar 18 Nov) | 6 | 3 | 2.5 |
| Capacitación | 16.4 Taller Deploy - AWS (jue 20 Nov) | 7 | 3 | 1.4 |

| Total Horas Estimadas (sin buffer) | Total Horas Reales | Consumo |
|:---:|:----------:|:-------:|
| **26.7**hs | **36.9**hs | **138.2%** |

Buffer reservado: **8.3**hs
Total con buffer: **35**hs

```mermaid
xychart-beta
    title "Sprint #5: Horas Estimadas #40;azul#41; vs Reales #40;verde#41;"
    x-axis "Tareas" ["20.1", "20.2", "20.3", "21.2", "3.1", "16.3", "16.4", "TOTAL"]
    y-axis "Horas" 0 --> 40
    
    %% Green line
    line [0.9, 1.5, 1.3, 1, 16, 3, 3, 26.7]

    %% Black line
    line [6.6, 0.9, 1.2, 0.5, 23.8, 2.5, 1.4, 36.9]
```
Distribución por categoría:
| Gestión | Desarrollo | QA | Capacitación | Documentación |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **2.8**hs | **23.8**hs | **0**hs | **6**hs | **0.9**hs |

### **Sprint #6**: dom 23 nov → sáb 29 nov 2025

**Objetivo:** 🚀 Deploy Azure + PWA + i18n + Theme + Settings — Disponibilizar demo deployada y pulir UX con internacionalización y tema.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Documentación | 20.1 Reporte Académico (dominical) | 1 | 5 | 5.8 |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | 0.9 |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | 2.9 |
| Capacitación | 21.2 Tutorías (guía con tutor asignado) | 4 | 1 | 0.75 |
| Desarrollo | 16.11 Azure Deploy - Config práctica (Azure App Service) | 5 | 9 | 19.7 |
| Desarrollo | 0.5 PWA base (manifest + SW básico) | 6 | 6 | |
| Desarrollo | 0.15 i18n - Implementación mínima (strings + en/es) | 7 | 2 | |
| Desarrollo | 12.5 Theme toggle (UI + persistencia) | 8 | 2 | |
| Desarrollo | 12.6 Settings screen (pantalla de ajustes: tema + idioma + prefs) | 9 | 2 | |
| Desarrollo | 16.8 Build & deploy demo (front estático + API) | 10 | 8 | 9.2 |
| Capacitación | 16.7 Taller Deploy - Deploy en Práctica (miérc 27 Nov) | 11 | 3 | 3.1 |

| Total Horas Estimadas (sin buffer) | Total Horas Reales | Consumo |
|:---:|:----------:|:-------:|
| **40.8**hs | **42.35**hs | **103.8%** |

Buffer reservado: **-5.8**hs
Total con buffer: **35**hs

```mermaid
xychart-beta
    title "Sprint #6: Horas Estimadas #40.8;azul#41; vs Reales #40;verde#41;"
    x-axis "Tareas" ["20.1", "20.2", "20.3", "21.2", "16.11", "0.5", "0.15", "12.5", "12.6", "16.8", "16.7", "TOTAL"]
    y-axis "Horas" 0 --> 40
    
    %% Green line (estimadas)
    line [5, 1.5, 1.3, 1, 9, 6, 2, 2, 2, 8, 3, 40.8]

    %% Black line (reales)
    line [5.8, 0.9, 2.9, 0.75, 19.7, 0, 0, 0, 0, 9.2, 3.1, 42.35]
```

Distribución por categoría:
| Documentación | Desarrollo | QA | Capacitación | Gestión |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **5**hs | **29**hs | **0**hs | **4**hs | **2.8**hs |

### **Sprint #7**: dom 30 nov → sáb 6 dic 2025

**Objetivo:** 📋 QuickCheck MVP + Azure Deploy - Sistema completo de inspecciones rápidas por capas (Domain → Application → UI → Integration).

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Documentación | 20.1 Reporte Académico (dominical) | 1 | 5 | 5.7 |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | 0 |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | 1.2 |
| Capacitación | 21.2 Tutorías (guía con tutor asignado) | 4 | 1 | 0.75 |
| Desarrollo | 16.11 Azure Deploy - Config práctica (continuación) | 5 | 5 | 4.7 |
| Desarrollo | 6.1 Domain + Persistence (RF-011) | 6 | 4.5 | 3.5 |
| Desarrollo | 6.3 Application Layer Backend (RF-011) | 7 | 6.5 | 2.9 |
| Desarrollo | 6.2a UI Creación de QuickCheck (RF-011) | 8 | 5 | 4.6 |
| Desarrollo | 6.2b UI Ejecución de QuickCheck (RF-011) | 9 | 7.5 | 3.5 |
| Desarrollo | 6.4 API Integration Frontend (RF-011) | 10 | 3.5 | 4.3 |
| Capacitación | 16.7 Taller Deploy - Deploy en Práctica (jue 4 Dic) | 11 | 3 | 2.5 |

| Total Horas Estimadas (sin buffer) | Total Horas Reales | Consumo |
|:---:|:----------:|:-------:|
| **43.5**hs | **33.65**hs | **77.4%** |

Buffer reservado: **-8.5**hs ⚠️
Total con buffer: **35**hs

```mermaid
xychart-beta
    title "Sprint #7: Horas Estimadas (azul) vs Reales (verde)"
    x-axis "Tareas" ["20.1", "20.2", "20.3", "21.2", "16.11", "6.1", "6.3", "6.2a", "6.2b", "6.4", "16.7", "TOTAL"]
    y-axis "Horas" 0 --> 45
    
    %% Green line (estimadas)
    line [5, 1.5, 1.3, 1, 5, 4.5, 6.5, 5, 7.5, 3.5, 3, 43.5]

    %% Black line (reales)
    line [5.7, 0, 1.2, 0.75, 4.7, 3.5, 2.9, 4.6, 3.5, 4.3, 2.5, 33.65]
```

Distribución por categoría:
| Documentación | Desarrollo | QA | Capacitación | Gestión |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **5**hs | **32.5**hs | **0**hs | **4**hs | **2.8**hs |

**Estrategia de Implementación por Capas:**
1. **Capa Base (6.1):** Domain models + Persistence schemas + Contracts → Backend operativo para recibir datos
2. **Capa Application (6.3):** Use cases + Controllers + Routes → API REST funcional
3. **Capa Presentación (6.2a + 6.2b):** 
   - 6.2a: UI para crear templates (ToDo-like para items)
   - 6.2b: UI para ejecutar checklist (toggles ✅/❌ + scoring)
4. **Capa Integración (6.4):** Services + TanStack Query → Conectar front↔back

**Orden de Ejecución Propuesto:**
- **Miércoles 4 Dic:** 16.11 Azure Deploy (5hs) + 16.7 Taller (3hs)
- **Jueves 5 Dic:** 6.1 Domain+Persistence (4.5hs) + 6.3 Application inicio (2hs)
- **Viernes 6 Dic:** 6.3 Application fin (4.5hs) + 6.2a UI Creación inicio (3hs)
- **Sábado 7 Dic:** 6.2a fin (2hs) + 6.2b UI Ejecución (7.5hs) + 6.4 Integration (3.5hs) + Demo

**Simplificaciones Técnicas:**
- Templates con items tipo string simple (no Value Objects complejos)
- Persistencia directa sin eventos de dominio complejos
- UI básica sin validaciones exhaustivas
- Scoring simple: COUNT(FAIL) > 0 ? "FAIL" : "OK"

**Tareas movidas a Sprint #8:**
- 3.2 Listado + detalle de máquinas (9hs)
- 4.1 Crear recordatorios (9hs)
- 6.5 Aviso QuickCheck no aprobado (6hs - Should Have)

**Riesgos Críticos:**
- ⚠️ **Sprint muy sobrecargado** (43.5hs vs 35hs, buffer -8.5hs)
- ⚠️ **Requiere trabajo sábado** para completar 6.2b + 6.4 + Demo
- ⚠️ **Posible descope**: Si tiempo aprieta, mover 6.2a (CRUD templates) a Sprint #8 y usar template hardcoded
- ⚠️ **Dependencias**: Orden estricto de capas (no paralelizable)

### **Sprint #8**: dom 7 dic → sáb 13 dic 2025

**Objetivo:** 🎯 Machine Management Enhancement + PWA Base + QuickCheck Refinement - Mejoras críticas post-MVP QuickCheck y fundación PWA.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Documentación | 20.1 Reporte Académico (dominical) | 1 | 5 | 5.4 |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | 1.2 |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | 4.65 |
| Capacitación | 21.2 Tutorías (guía con tutor asignado) | 4 | 1 | 0 |
| Desarrollo | 12.8 UI Polish (animaciones + reorder inputs) | 5 | 0.75 | 0.1 |
| Desarrollo | 12.7 Navigation Drawer | 6 | 3 | 2.3 |
| Desarrollo | 16.12 Azure Static Web App - Fix 404 routing | 8 | 1 | 0.8 |
| Desarrollo | 6.5 QuickCheck User Tracking | 9 | 4.2 | 3.5 |
| Desarrollo | 3.2a Machine Enhancement (assignedTo, usageRate, fixes) | 10 | 12 | 10.1 |
| Desarrollo | 0.5a PWA Manifest + Icons | 11 | 1 | 1.7 |
| Desarrollo | 0.5b Service Worker Básico | 12 | 1.5 | 0.9 |
| Desarrollo | 0.5c PWA Testing Multi-dispositivo | 14 | 1 | 0.4 |

| Total Horas Estimadas (sin buffer) | Total Horas Reales | Consumo |
|:---:|:----------:|:-------:|
| **37.75**hs | **31.05**hs | **82.3%** |

Buffer reservado: **-2.75**hs (absorbido en machinePhotoUrl + SW + testing)
Total con buffer: **35**hs

Distribución por categoría:
| Documentación | Desarrollo | QA | Capacitación | Gestión |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **5**hs | **29**hs | **0**hs | **1**hs | **2.75**hs |

```mermaid
xychart-beta
    title "Sprint #8: Horas Estimadas (azul) vs Reales (verde)"
    x-axis "Tareas" ["20.1", "20.2", "20.3", "21.2", "12.8", "12.7", "16.12", "6.5", "3.2a", "0.5a", "0.5b", "0.5c", "TOTAL"]
    y-axis "Horas" 0 --> 38

    %% Green line (estimadas)
    line [5, 1.5, 1.3, 1, 0.75, 3, 1, 4.2, 12, 1, 1.5, 1, 37.75]

    %% Black line (reales)
    line [5.4, 1.2, 4.65, 0, 0.1, 2.3, 0.8, 3.5, 10.1, 1.7, 0.9, 0.4, 31.05]
```

**Notas de Sprint:**
- **Orden optimizado simple → complejo**: UI Polish → Navigation → QC Tracking → Machine Enhancement → Azure Fix + PWA
- **Miércoles (Quick Wins)**: Animaciones, reorder inputs, navigation drawer base (3.75hs) - Calentamiento con tareas simples
- **Jueves (UX + Feature)**: Navigation drawer responsive + QuickCheck user tracking (8.2hs) - Consolidar UX y feature completa
- **Viernes (Core Enhancement)**: Machine Enhancement completo (12hs) - Día enfocado en la tarea más compleja con base limpia
- **Sábado (Infra + PWA)**: Azure fix crítico + PWA completo (5.5hs) - Infraestructura y testing final
- **Estrategia**: Tareas tempranas "limpian la base" (UI polish, navigation) para que Machine Enhancement se implemente sobre código mejorado
- **PWA Base completa:** Manifest, icons, service worker básico, testing multi-dispositivo
- **Machine Enhancement:** Agrupa 4 mejoras en una sola pasada (assignedTo, usageRate, powerSource fix, machinePhotoUrl básico)
- **Navigation Drawer:** Implementado en 2 partes (día 1: estructura base, día 2: responsive + integración)
- **QuickCheck Tracking:** Metadata del responsable para auditoría y trazabilidad
- **Azure Fix crítico:** Soluciona 404 en refresh de rutas SPA
- **Deferred a Sprint #9:** Sistema de fotos completo Cloudinary (17hs), Scheduler + Alertas (requiere decisión arquitectónica previa)

### **Sprint #9**: dom 14 dic → sáb 20 dic 2025

**Objetivo:** 🔔 Centro de Notificaciones Completo - Sistema completo front/back de bandeja de notificaciones multi-source con primera integración funcional.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Documentación | 20.1 Reporte Académico (dominical) | 1 | 5 | 5.3 |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | 1.45 |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | 2.15 |
| Capacitación | 21.2 Tutorías (guía con tutor asignado) | 4 | 1 | 1.1 |
| Desarrollo | 8.1 Domain+Contracts+Persistence | 5 | 5 | |
| Desarrollo | 8.2 Application Layer Backend | 6 | 6 | |
| Desarrollo | 8.3 Frontend UI Components | 7 | 4 | |
| Desarrollo | 8.4 Frontend Integration+Observer | 8 | 5 | |
| Desarrollo | 6.6 Integración QC→Notificaciones | 9 | 4 | |
| Documentación | 8.5 Documentación Patrón | 10 | 1 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales | Consumo |
|:---:|:----------:|:-------:|
| **33.8**hs | **7.85**hs | **23.2%** |

Buffer reservado: **-0.8**hs
Total con buffer: **35**hs

Distribución por categoría:
| Documentación | Desarrollo | QA | Capacitación | Gestión |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **5**hs | **27**hs | **0**hs | **1**hs | **2.8**hs |

**Riesgos:** Integración entre notificaciones y eventos puede ser compleja.

### **Sprint #10**: dom 21 dic → sáb 27 dic 2025

**Objetivo:** 📅 Reporte Eventos + Eventos Automáticos - Sistema eventos básico sin features no solicitadas.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Documentación | 20.1 Reporte Académico (dominical) | 1 | 5 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| Capacitación | 21.2 Tutorías (guía con tutor asignado) | 4 | 1 | |
| Desarrollo | 4.2 Registrar evento (RF-008) - Parte 2 | 5 | 5 | |
| Desarrollo | 5.3 Hook a Centro de Notificaciones | 6 | 4 | |
| Desarrollo | 8.2 UI lectura/estado | 7 | 7 | |
| Desarrollo | 6.4 Aviso QuickCheck no aprobado (RF-017) | 8 | 6 | |
| Desarrollo | 3.3 Edición con historial (RF-006) | 9 | 8 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales | Consumo |
|:---:|:----------:|:-------:|
| **33.8**hs | **7.85**hs | **23.2%** |

Buffer reservado: **+1.2**hs
Total con buffer: **35**hs

Distribución por categoría:
| Documentación | Desarrollo | QA | Capacitación | Gestión |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **6**hs | **24**hs | **0**hs | **1**hs | **2.8**hs |

**Notas del Sprint:**
- Sprint enfocado 100% en sistema de notificaciones con enfoque por capas
- Arquitectura pragmática: Notification como subdocumento en User (no entidad independiente)
- Use Cases modulares para facilitar testing y reutilización
- Observer Pattern implementado con TanStack Query cache subscription (sin polling manual)
- Integración real con QuickCheck (6.6) valida patrón end-to-end
- Orden secuencial: Domain/Persistence → Application → UI → Integration → QuickCheck hook
- Documentación crítica (8.5) facilita integración futura con Alertas y Eventos

**Distribución semanal sugerida:**
- **Dom 14 dic (planning):** 20.1 (5h) + 20.2 (1.5h) + 20.3 (1.3h) + 21.2 (1h) = 8.8hs [COMPLETADO 7.85hs]
- **Lun 15 dic:** 8.1 Domain+Contracts+Persistence (5hs) = 5hs  
- **Mar 16 dic:** 8.2 Application Layer Backend (5hs) = 5hs  
- **Mié 17 dic:** Completar 8.2 (1h) + 8.3 Frontend UI (4hs) = 5hs  
- **Jue 18 dic:** 8.4 Frontend Integration+Observer (5hs) = 5hs  
- **Vie 19 dic:** 6.6 Integración QC→Notificaciones (4hs) + buffer (1h) = 5hs  
- **Sáb 20 dic:** 8.5 Documentación (1h) + buffer (4hs) = 5hs  

**Total:** 33.8hs planificadas + buffer +1.2hs

**Fortalezas:**
- ✅ Buffer positivo (+1.2hs)
- ✅ Tareas bien acotadas (1-6hs cada una)
- ✅ Dependencias lineales claras
- ✅ Patrón documentado para futuros módulos
- ✅ Testing end-to-end incorporado en 6.6

**Consideraciones técnicas:**
- TanStack Query refetchInterval: 30 segundos (balance tiempo real vs. carga)
- react-hot-toast: toasts 5 segundos duration
- Subdocumento User.notifications: suficiente para MVP (no requiere colección separada)
- Observer valida detección automática sin recargas manuales

**Riesgos:** Período navideño puede afectar productividad levemente.

### **Sprint #11**: dom 28 dic → sáb 3 ene 2026

**Objetivo:** ⚙️ Full Mantenimiento - Feature completa sin cosas no solicitadas.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Documentación | 20.1 Reporte Académico (dominical) | 1 | 5 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| Capacitación | 21.2 Tutorías (guía con tutor asignado) | 4 | 1 | |
| Desarrollo | 4.3 Historial unificado (RF-009) | 5 | 15 | |
| Desarrollo | 9.1 Datos de contacto por distribuidor | 6 | 5 | |
| Desarrollo | 9.2 Acciones de contacto (tel:, mailto:, wa.me) | 7 | 5 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales | Consumo |
|:---:|:----------:|:-------:|
| **33.8**hs | **0**hs | **0.0%** |

Buffer reservado: **1.2**hs
Total con buffer: **35**hs

Distribución por categoría:
| Documentación | Desarrollo | QA | Capacitación | Gestión |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **5**hs | **25**hs | **0**hs | **1**hs | **2.8**hs |

**Riesgos:** Período de fiestas navideñas puede impactar disponibilidad.

### **Sprint #12**: dom 4 ene → sáb 10 ene 2026

**Objetivo:** 💬 Full Comunicaciones - Listado usuarios + gestión contactos + chat sencillo.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Documentación | 20.1 Reporte Académico (dominical) | 1 | 5 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| Capacitación | 21.2 Tutorías (guía con tutor asignado) | 4 | 1 | |
| QA | 13.3a Unit tests Backend | 5 | 12 | |
| QA | 13.4 Datos de prueba (semillas y factories) | 6 | 4 | |
| Desarrollo | 16.2 Semillas demo (usar 1.4) | 7 | 3 | |
| QA | 12.3 Pruebas visuales móviles/desktop | 8 | 5 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales | Consumo |
|:---:|:----------:|:-------:|
| **32.8**hs | **0**hs | **0.0%** |

Buffer reservado: **2.2**hs
Total con buffer: **35**hs

Distribución por categoría:
| Documentación | Desarrollo | QA | Capacitación | Gestión |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **5**hs | **3**hs | **21**hs | **1**hs | **2.8**hs |

### **Sprint #13**: dom 11 ene → sáb 17 ene 2026

**Objetivo:** 🧪 Smoke Tests + Buffer - Testing, refinamientos y mejoras necesarias.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Documentación | 20.1 Reporte Académico (dominical) | 1 | 5 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| Capacitación | 21.2 Tutorías (guía con tutor asignado) | 4 | 1 | |
| QA | 13.3b Unit tests Frontend | 5 | 10 | |
| Desarrollo | 16.1 Build & deploy demo (front estático + API) | 6 | 8 | |
| Documentación | 17.2 API docs (OpenAPI simple) | 7 | 6 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales | Consumo |
|:---:|:----------:|:-------:|
| **32.8**hs | **0**hs | **0.0%** |

Buffer reservado: **2.2**hs
Total con buffer: **35**hs

Distribución por categoría:
| Documentación | Desarrollo | QA | Capacitación | Gestión |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **5**hs | **8**hs | **10**hs | **1**hs | **2.8**hs |

### **Sprint #14**: dom 18 ene → sáb 24 ene 2026

**Objetivo:** 🔧 Feature Básica Repuestos - Módulo repuestos básico funcional.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Documentación | 20.1 Reporte Académico (dominical) | 1 | 5 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| Capacitación | 21.2 Tutorías (guía con tutor asignado) | 4 | 1 | |
| QA | 13.5 Sanitización manual por feature | 5 | 8 | |
| QA | 13.8 Smoke E2E de flujos críticos | 6 | 6 | |
| Gestión | 18.2 Control de cambios | 7 | 3 | |
| Desarrollo | 18.3 Feature toggles | 8 | 5 | |
| Desarrollo | 2.4 Recuperación de contraseña (RF-004) [NiceToHave] | 9 | 8 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales | Consumo |
|:---:|:----------:|:-------:|
| **38.8**hs | **0**hs | **0.0%** |

Buffer reservado: **-3.8**hs
Total con buffer: **35**hs

Distribución por categoría:
| Documentación | Desarrollo | QA | Capacitación | Gestión |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **5**hs | **13**hs | **14**hs | **1**hs | **2.8**hs |

**Riesgos:** Sprint muy denso con poco buffer disponible.

### **Sprint #15**: dom 25 ene → sáb 31 ene 2026

**Objetivo:** 🎁 Full Nice-to-Have + UX - Recuperación password + búsqueda + ayuda + mejoras UX.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Documentación | 20.1 Reporte Académico (dominical) | 1 | 5 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| Capacitación | 21.2 Tutorías (guía con tutor asignado) | 4 | 1 | |
| QA | 13.7 Triage & fix post-UAT | 5 | 10 | |
| QA | 13.9 Gestión de defectos | 6 | 6 | |
| Desarrollo | 11.1 Ayuda inline mínima / "cómo usar esta página" [NiceToHave] | 7 | 6 | |
| Gestión | 19.1 Consolidación y tracking del backlog Post-MVP | 8 | 2 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales | Consumo |
|:---:|:----------:|:-------:|
| **32.8**hs | **0**hs | **0.0%** |

Buffer reservado: **2.2**hs
Total con buffer: **35**hs

Distribución por categoría:
| Documentación | Desarrollo | QA | Capacitación | Gestión |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **5**hs | **6**hs | **16**hs | **1**hs | **2.8**hs |

### **Sprint #16**: dom 1 feb → sáb 7 feb 2026

**Objetivo:** ✨ Último Sprint Desarrollo - Full pulida, nada de features nuevas, documentación.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Documentación | 20.1 Reporte Académico (dominical) | 1 | 5 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| Capacitación | 21.2 Tutorías (guía con tutor asignado) | 4 | 1 | |
| Desarrollo | 7.1 Alta/edición repuesto (RF-012/014) [NiceToHave] | 5 | 8 | |
| Desarrollo | 7.2 Listado por máquina (RF-013) [NiceToHave] | 6 | 6 | |
| Desarrollo | 16.3 Script "reset demo" [NiceToHave] | 7 | 4 | |
| Documentación | 17.3 Manual breve de usuario [NiceToHave] | 8 | 6 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales |
|:---:|:----------:|
| **32.8**hs | **0**hs |

Buffer reservado: **2.2**hs
Total con buffer: **35**hs

Distribución por categoría:
| Documentación | Desarrollo | QA | Capacitación | Gestión |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **5**hs | **18**hs | **0**hs | **1**hs | **2.8**hs |

**Nota:** Este sprint incluye principalmente funcionalidades NiceToHave y puede ajustarse según el estado del proyecto.

### **Sprint #17**: dom 8 feb → sáb 14 feb 2026

**Objetivo:** Buffer final de entrega - refinamientos, documentación y verificaciones finales para la entrega académica.

| Categoría | Tarea | Orden | Horas Estimadas | Horas Reales |
|-----------:|:-------|:---------------:|:---------------:|:------------:|
| Documentación | 20.1 Reporte Académico (dominical) | 1 | 5 | |
| Gestión | 20.2 Demo/UAT con cliente (dominical) | 2 | 1.5 | |
| Gestión | 20.3 Sprint Planning dominguero (dominical) | 3 | 1.3 | |
| Capacitación | 21.2 Tutorías (guía con tutor asignado) | 4 | 1 | |
| Gestión | 21.21 Buffer de entrega final | 5 | 10 | |

| Total Horas Estimadas (sin buffer) | Total Horas Reales | Consumo |
|:---:|:----------:|:-------:|
| **18.8**hs | **0**hs | **0.0%** |

Buffer reservado: **16.2**hs
Total con buffer: **35**hs

Distribución por categoría:
| Documentación | Desarrollo | QA | Capacitación | Gestión |
|:-------:|:----------:|:--:|:------------:|:-------------:|
| **5**hs | **0**hs | **0**hs | **1**hs | **12.8**hs |

**Nota:** Sprint de cierre con amplio buffer para refinamientos finales y preparación de entrega académica.

