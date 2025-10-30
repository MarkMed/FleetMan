# Estrategia de Testing & Definition of Done

**Proyecto:** FleetMan MVP  
**Fecha:** Octubre 2025  
**Scope:** Sprint #2 - Tarea 13.1  

---

## 1. Estrategia de Testing - MVP FleetMan

### 1.1. Alcance de Testing

#### **✅ Incluido en Testing**
- **Funcionalidades Must Have:**
  - RF-001 a RF-011: Gestión de usuarios, maquinaria y mantenimiento
  - RF-015, RF-016: Notificaciones y logging básico
- **Flujos críticos:**
  - Login → Registro máquina → Crear recordatorio → Ejecutar QuickCheck → Recibir notificación
- **Componentes core:**
  - Autenticación y autorización
  - CRUD de entidades principales
  - Lógica de negocio del scheduler
  - API endpoints públicos

#### **❌ Excluido del Testing (Post-MVP)**
- Features Should Have y Could Have
- Integraciones externas (WhatsApp, email masivo)
- Performance testing detallado
- Pruebas de carga/stress
- Compatibilidad cross-browser exhaustiva

### 1.2. Tipos de Pruebas

#### **🔧 Unit Tests (Automatizados)**
- **Herramienta:** Jest + TypeScript
- **Cobertura:** Backend y Frontend
- **Target:** Lógica de negocio, utilidades, validaciones
- **Ejecución:** CI/CD en cada PR

#### **🕵️ Manual Testing**
- **Tipo:** Sanitización por feature
- **Enfoque:** Smoke testing de flujos críticos
- **Ejecutor:** Developer + UAT con cliente
- **Frecuencia:** Por sprint/feature completada

#### **👥 User Acceptance Testing (UAT)**
- **Formato:** Demos dominicales con cliente
- **Feedback:** Estructurado y documentado
- **Criterio:** Validación de AC (Acceptance Criteria)

#### **🚀 E2E Smoke Testing**
- **Scope:** Flujos críticos únicamente
- **Tool:** Manual (por ahora)
- **Objetivo:** Verificar integración end-to-end

### 1.3. Herramientas y Setup

```
📦 Testing Stack
├── Jest (Unit Tests)
│   ├── Backend: API endpoints, business logic
│   ├── Frontend: Components, utilities
│   └── Coverage reports
├── Manual Checklists
│   ├── Smoke testing templates
│   └── UAT feedback forms
└── CI/CD Integration
    ├── Automated test runs
    └── Coverage reporting
```

### 1.4. Criterios de Entrada y Salida

#### **🚪 Criterios de Entrada (Testing)**
- Feature implementada según AC
- Code review inicial completado
- Build pasando en entorno local
- Documentación básica presente

#### **✅ Criterios de Salida (Testing)**
- Unit tests escritos y pasando
- Coverage mínimo alcanzado
- Smoke testing manual ejecutado
- No bugs críticos/bloqueantes identificados
- UAT positiva (si aplica)

---

## 2. Definition of Done (DoD)

### 2.1. Para cada Feature/Tarea

#### **💻 Código**
- [ ] Implementación completa según Acceptance Criteria
- [ ] Code review aprobado por otro developer
- [ ] Convenciones de código respetadas (ESLint, Prettier)
- [ ] Validaciones Zod implementadas (si aplica)
- [ ] Error handling adecuado

#### **🧪 Testing**
- [ ] Unit tests escritos para lógica nueva
- [ ] Tests pasando al 100%
- [ ] Coverage mínimo: **80%** para lógica crítica
- [ ] Smoke testing manual ejecutado y documentado
- [ ] No hay bugs críticos (severity: high/critical)

#### **📚 Documentación**
- [ ] README actualizado (si aplica)
- [ ] Comentarios en código complejo
- [ ] API docs actualizadas (si nuevos endpoints)
- [ ] Notas de implementación en PR

#### **🔄 Integración**
- [ ] Build pasando en CI
- [ ] No rompe funcionalidades existentes (regression)
- [ ] Deploy en entorno de demo exitoso
- [ ] Verificación post-deploy

### 2.2. Para cada Sprint

#### **📋 Sprint DoD**
- [ ] Todas las tareas individuales cumplen DoD
- [ ] Demo exitosa con cliente
- [ ] Feedback de UAT documentado
- [ ] Retrospectiva completada
- [ ] Planning del siguiente sprint realizado

---

## 3. Templates y Checklists

### 3.1. Template de Smoke Testing

```markdown
## Smoke Test - [Feature Name]

**Tester:** [Nombre]  
**Fecha:** [DD/MM/YYYY]  
**Build:** [Version/Commit]  

### Pre-condiciones
- [ ] Usuario logueado
- [ ] Datos de prueba disponibles
- [ ] Entorno funcional

### Casos de Prueba
1. **Flujo Principal**
   - [ ] Paso 1: [Descripción]
   - [ ] Paso 2: [Descripción]
   - [ ] Resultado esperado: [OK/FAIL]

2. **Casos Borde**
   - [ ] Validaciones funcionando
   - [ ] Manejo de errores

### Resultado General
- [ ] ✅ PASS - Feature lista para UAT
- [ ] ❌ FAIL - Issues encontrados (ver abajo)

### Issues Encontrados
| Severidad | Descripción | Estado |
|-----------|------------|--------|
| High      | [Issue]    | Open   |
```

### 3.2. Template de UAT Feedback

```markdown
## UAT Feedback - Sprint #[X]

**Cliente:** [Nombre]  
**Fecha:** [DD/MM/YYYY]  
**Features demostradas:** [Lista]

### Feedback por Feature
| Feature | Rating (1-5) | Comentarios | Action Items |
|---------|--------------|-------------|--------------|
| RF-XXX  | 4/5         | [Feedback]  | [Acciones]   |

### Feedback General
- **Positivo:** [Lo que gustó]
- **A mejorar:** [Sugerencias]
- **Prioridades:** [Cambios urgentes]

### Decisiones
- [ ] Feature aprobada para producción
- [ ] Requiere ajustes menores
- [ ] Requiere cambios significativos
```

---

## 4. Métricas de Calidad

### 4.1. KPIs de Testing

- **Coverage objetivo:** 80% mínimo en lógica crítica
- **Bug density:** Max 1 bug crítico por feature
- **UAT satisfaction:** Min 4/5 rating promedio
- **Test execution time:** Max 5min para suite completa

### 4.2. Reportes

- **Semanal:** Coverage report + bugs abiertos
- **Por Sprint:** UAT summary + testing retrospective
- **Mensual:** Quality trends + improvements

---

## 5. Responsabilidades

### 5.1. Developer
- Escribir unit tests
- Ejecutar smoke testing
- Documentar issues encontrados
- Participar en UAT

### 5.2. Cliente
- Proveer feedback en UAT
- Validar AC de features
- Priorizar fixes necesarios

---

**Notas:**
- Este documento será revisado y actualizado cada 2 sprints
- Los templates pueden adaptarse según las necesidades del proyecto
- La estrategia se enfoca en **calidad práctica** más que cobertura exhaustiva