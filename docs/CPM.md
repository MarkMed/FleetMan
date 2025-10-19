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
- ES: 8h, EF: 23h, LS: 8h, LF: 23h
- Holgura total: 0h - **CRÍTICO**

**1.2 Esquemas DB** (depende de 1.1) - Soporte RF-001,005
- ES: 23h, EF: 28h, LS: 23h, LF: 28h
- Holgura total: 0h - **CRÍTICO**

**1.3 DTOs + Zod** (depende de 1.1) - Contratos API Must Have
- ES: 23h, EF: 30h, LS: 23h, LF: 30h
- Holgura total: 0h - **CRÍTICO**

**2.1 Registro** (depende de 1.2, 1.3, 0.6) - RF-001
- ES: 30h, EF: 40h, LS: 30h, LF: 40h
- Holgura total: 0h - **CRÍTICO**

**2.2 Login** (depende de 2.1) - RF-002
- ES: 40h, EF: 48h, LS: 40h, LF: 48h
- Holgura total: 0h - **CRÍTICO**

**3.1 Alta de máquina** (depende de 2.2, 1.2, 0.6) - RF-005
- ES: 48h, EF: 58h, LS: 48h, LF: 58h
- Holgura total: 0h - **CRÍTICO**

**6.1 Plantilla checklist** (depende de 1.1) - RF-011
- ES: 23h, EF: 28h, LS: 23h, LF: 28h
- Holgura total: 0h - **CRÍTICO**

**4.1 Crear recordatorios** (depende de 3.1) - RF-007
- ES: 58h, EF: 67h, LS: 70h, LF: 79h
- Holgura total: 12h

**4.2 Registrar evento** (depende de 3.1) - RF-008
- ES: 58h, EF: 73h, LS: 72h, LF: 87h
- Holgura total: 14h

**5.1 Scheduler** (depende de 4.1) - RF-010
- ES: 67h, EF: 77h, LS: 79h, LF: 89h
- Holgura total: 12h

**6.2 UI QuickCheck** (depende de 6.1, 3.1, 0.6) - RF-011
- ES: 58h, EF: 70h, LS: 58h, LF: 70h
- Holgura total: 0h - **CRÍTICO**

**6.3 Persistencia QuickCheck** (depende de 6.2) - RF-011
- ES: 70h, EF: 75h, LS: 70h, LF: 75h
- Holgura total: 0h - **CRÍTICO**

**5.2 Generación alertas** (depende de 5.1) - RF-010
- ES: 77h, EF: 84h, LS: 89h, LF: 96h
- Holgura total: 12h

**4.3 Historial unificado** (depende de 4.2, 6.3) - RF-009
- ES: 75h, EF: 90h, LS: 75h, LF: 90h
- Holgura total: 0h - **CRÍTICO**

**8.1 Centro notificaciones** (depende de 5.2, 4.2, 6.3) - RF-016
- ES: 90h, EF: 102h, LS: 90h, LF: 102h
- Holgura total: 0h - **CRÍTICO**

**9.1 Contacto distribuidores** (depende de 3.1) - RF-015
- ES: 58h, EF: 63h, LS: 97h, LF: 102h
- Holgura total: 39h

### Ruta Crítica Identificada (Must Have MVP)

**(a) Ruta crítica corregida:**
**Ruta A (QuickCheck):** 0.1 → 1.1 → 6.1 → 6.2 → 6.3 → 4.3 → 8.1
**Ruta B (Autenticación):** 0.1 → 1.1 → 1.2 → 1.3 → 2.1 → 2.2 → 3.1 → (converge con Ruta A)

**(b) Duración total del proyecto (MVP Must Have):**
- **102 horas** (ruta crítica más larga: Ruta A)
- **20.4 días** de 5h/día laborables
- **~14-15 sprints** de trabajo efectivo para Must Have

**(c) Buffers propuestos (MVP Must Have):**

**Project Buffer:** 15h (15% de 102h) ≈ 3 días de 5h
- Ubicación: Al final de 8.1 Centro notificaciones
- Protege la entrega del MVP Must Have

**Feeding Buffers:**
- **4.2 → 4.3:** 7h (50% de holgura de 14h)
- **5.1 → 5.2:** 6h (50% de holgura de 12h)
- **4.1 → 5.1:** 6h (50% de holgura de 12h)
- **9.1 → Entrega:** 19h (50% de holgura de 39h)

### Nivelación por Recurso Único (MVP Must Have)

**Ajustes críticos:**
- Must Have requiere ~102h + 15h buffer = 117h total
- Equivale a ~14-15 sprints efectivos (vs 17 planificados)
- **Margen de 2-3 sprints** para Should Have y Nice to Have

**Conclusión crítica:**
El MVP Must Have está **bien dimensionado** y permite cumplir con las fechas. Los 3 sprints adicionales (15-17) pueden dedicarse a:
- Compensar tiempos invertidos en fixes, tareas no planeadas, o como gap "salvavidas".
- RF-004 (Should Have): Recuperación contraseña
- RF-017 (Should Have): Aviso QuickCheck no aprobado  
- RF-012,013,014 (Should Have): Gestión repuestos
- Funcionalidades Could Have según disponibilidad
