# 🗄️ Storage Optimization Tasks - Resumen Ejecutivo

**Fecha de creación**: 31 Diciembre 2025  
**Clasificación**: NFR (Non-Functional Requirements)  
**Sprint tentativo**: #14 o #15 (Post-MVP)  
**Prioridad**: Media (no bloqueante, mejora de performance/escalabilidad)

---

## 📋 Contexto

### Problema Identificado
El sistema actual permite **crecimiento ilimitado** de subdocumentos en:
1. **`Machine.eventsHistory[]`** - Eventos de máquina (manuales + automáticos)
2. **`User.notifications[]`** - Notificaciones de usuario

Esto genera:
- ❌ **Problemas de almacenamiento**: Base de datos crece sin control
- ❌ **Problemas de performance**: Queries lentas al cargar arrays grandes
- ❌ **Mala UX**: Usuario abrumado con historial infinito sin control
- ❌ **Falta de configurabilidad**: Usuario no puede decidir qué eventos registrar

---

## 🎯 Solución Propuesta

Se crearon **2 nuevas tareas en el WBS** para abordar ambos problemas:

### **Tarea 4.2e: Optimización de Almacenamiento - Eventos**
- **Ubicación WBS**: Después de 4.2d, antes de 4.3
- **Estimación**: 8hs (PERT: 6-8-11hs)
- **Dependencias**: 4.2a, 4.2b (sistema base de eventos implementado)

### **Tarea 8.6: Optimización de Almacenamiento - Notificaciones**
- **Ubicación WBS**: Después de 8.5, antes de sección 9
- **Estimación**: 7hs (PERT: 5-7-10hs)
- **Dependencias**: 8.1, 8.2, 8.3 (sistema base de notificaciones implementado)

**Total estimado**: 15hs

---

## 🔧 Tarea 4.2e - Optimización de Eventos

### Objetivo
Evitar crecimiento ilimitado de `Machine.eventsHistory[]` implementando límite configurable (~100 eventos/máquina) con eliminación FIFO automática y permitir al usuario configurar qué tipos de eventos automáticos desea registrar.

### Alcance Técnico

#### Backend - Domain/Persistence
- ✅ Agregar campo `eventHistoryLimit` en `Machine` (default: 100)
- ✅ Agregar campo `eventTypePreferences` en `User` (array de typeIds ignorados)
- ✅ Middleware Mongoose pre-save:
  - Verificar límite antes de guardar
  - Eliminar eventos más antiguos (FIFO) si excede límite
  - Ordenar por `createdAt` para determinar antiguos

#### Backend - Application Layer
- ✅ Modificar `CreateMachineEventUseCase`:
  - Verificar `user.eventTypePreferences` antes de crear evento automático
  - Si `typeId` está en lista ignorados Y `isSystemGenerated=true` → NO crear evento
- ✅ Nuevo `UpdateEventPreferencesUseCase`:
  - Endpoint: `PATCH /users/me/event-preferences`
  - Body: `{ ignoredEventTypeIds: string[] }`
  - Validación: verificar que typeIds existan

#### Frontend - UI
- ✅ Sección "Gestión de Eventos Automáticos" en Configuración/Ajustes
- ✅ Lista de tipos de eventos del sistema con toggle on/off
- ✅ Warning: "Desactivar registro puede afectar historial y notificaciones"
- ✅ Indicador visual en EventHistoryScreen: "Mostrando últimos X eventos (límite: 100)"

#### Frontend - Integration
- ✅ Hook: `useEventPreferences()` con GET/UPDATE mutations
- ✅ Caché optimista para actualizaciones instantáneas

### Descripción Funcional

1. **Límite Automático FIFO**:
   - Cuando `eventsHistory.length > eventHistoryLimit` (100 por default)
   - Middleware elimina eventos más antiguos (ordenados por `createdAt`)
   - **Hard delete** (no soft delete) - datos históricos antiguos no críticos

2. **Configurabilidad por Usuario**:
   - Usuario marca ciertos tipos de eventos automáticos como "no registrar"
   - Ejemplos: "Inicio de operación diaria", "Fin de turno", etc.
   - Solo aplica a eventos con `isSystemGenerated=true`

3. **Preservación de Eventos Críticos**:
   - Eventos **manuales** (creados por usuario) NUNCA se ignoran por preferencias
   - Solo se eliminan por límite FIFO si son los más antiguos

### Consideraciones de Optimización
- **Performance**: Usar Mongoose `$slice` en queries para eficiencia
- **Migración**: Script para aplicar límite a máquinas existentes (eliminar eventos viejos)
- **Testing**: Unit tests con mocks, verificar orden FIFO, verificar preferencias
- **Documentación**: Actualizar `docs/machine-events-system-architecture.md`

---

## 🔔 Tarea 8.6 - Optimización de Notificaciones

### Objetivo
Evitar crecimiento ilimitado de `User.notifications[]` implementando límite configurable (~50-100 notificaciones/usuario) con eliminación FIFO automática y permitir eliminación manual por parte del usuario.

### Alcance Técnico

#### Backend - Domain/Persistence
- ✅ Agregar campo `notificationLimit` en `User` (default: 100)
- ✅ Middleware Mongoose pre-save:
  - Verificar límite antes de guardar
  - **Prioridad de eliminación**: 
    1. Notificaciones VISTAS más antiguas (`wasSeen=true`)
    2. Notificaciones NO vistas más antiguas si aún hace falta
  - Preservar notificaciones recientes y no leídas
- ✅ Método `deleteNotification(userId, notificationId)` en UserRepository

#### Backend - Application Layer
- ✅ Modificar `AddNotificationUseCase`:
  - Verificar límite antes de agregar
  - Priorizar eliminación de vistas sobre no vistas
- ✅ Nuevo `DeleteNotificationUseCase`:
  - Endpoint: `DELETE /users/me/notifications/{notificationId}`
  - Validación: verificar que notificación pertenezca al usuario
  - Uso: eliminación manual individual
- ✅ Nuevo `DeleteAllSeenNotificationsUseCase`:
  - Endpoint: `DELETE /users/me/notifications/seen`
  - Elimina todas las notificaciones con `wasSeen=true`
  - Uso: botón "Limpiar leídas"

#### Frontend - UI
- ✅ Botón de eliminación individual en `NotificationItem` (ícono X o trash)
- ✅ Botón "Limpiar todas las leídas" en header de `NotificationList`
- ✅ Confirmación modal para "Limpiar todas"
- ✅ Indicador visual: "Mostrando X de máximo Y notificaciones"

#### Frontend - Integration
- ✅ Mutation: `useDeleteNotification()` con **optimistic update**
- ✅ Mutation: `useDeleteAllSeenNotifications()` con invalidación de cache
- ✅ Toast de confirmación: "Notificación eliminada" / "X notificaciones eliminadas"

### Descripción Funcional

1. **Límite Automático con Prioridad**:
   - Cuando `notifications.length > notificationLimit` (100 por default)
   - Middleware elimina **primero** notificaciones VISTAS más antiguas
   - Luego elimina NO vistas más antiguas si aún hace falta
   - **Preserva**: Notificaciones recientes y no leídas

2. **Eliminación Manual**:
   - **Individual**: Botón X en cada notificación
   - **Masiva**: Botón "Limpiar leídas" elimina todas las vistas
   - **Útil**: Mantener lista limpia sin esperar límite automático

3. **Hard Delete**:
   - No soft delete (no `isArchived` flag)
   - Notificaciones antiguas no son críticas (solo alertas puntuales)

### Consideraciones de Optimización
- **Performance**: Middleware eficiente, ordenar por `notificationDate`
- **Migración**: Script para aplicar límite a usuarios existentes
- **UX**: Optimistic updates para eliminación instantánea en UI (sin esperar respuesta)
- **Testing**: Unit tests verificando prioridad (vistas primero, luego no vistas)
- **Documentación**: Actualizar `docs/Real-time-Notification-System.md`

---

## 📊 Comparativa: Antes vs Después

| Aspecto | ❌ Antes | ✅ Después |
|---------|---------|-----------|
| **Eventos por máquina** | Ilimitado | Máximo ~100 (configurable) |
| **Notificaciones por usuario** | Ilimitado | Máximo ~100 (configurable) |
| **Eliminación automática** | Ninguna | FIFO inteligente (prioriza vistas) |
| **Control del usuario** | Ninguno | Configurar eventos + eliminar notificaciones |
| **Crecimiento DB** | Exponencial sin límite | Controlado y predecible |
| **Performance queries** | Degrada con tiempo | Constante (arrays limitados) |
| **UX** | Abrumador (historial infinito) | Limpio y manejable |

---

## 🔗 Dependencies & Integration

### Tarea 4.2e (Eventos)
**Requiere completado:**
- ✅ Tarea 4.2a (Domain + Persistence de MachineEvent)
- ✅ Tarea 4.2b (Application Layer - CreateMachineEventUseCase)

**Integra con:**
- 🔗 Tarea 4.1c (Automatización MaintenanceAlarms) - respetar preferencias
- 🔗 Tarea 6.3 (QuickCheck) - respetar preferencias en eventos automáticos

### Tarea 8.6 (Notificaciones)
**Requiere completado:**
- ✅ Tarea 8.1 (Domain + Persistence de Notification)
- ✅ Tarea 8.2 (Application Layer - AddNotificationUseCase)
- ✅ Tarea 8.3 (Frontend UI - NotificationList, NotificationItem)

**Integra con:**
- 🔗 Todas las tareas que generen notificaciones (4.1c, 6.3, etc.)

---

## 🚀 Roadmap de Implementación

### Sprint #14 o #15 (Post-MVP)
**Secuencia recomendada:**

1. **Semana 1 - Backend Foundations** (7hs):
   - Día 1-2: Tarea 8.6 Backend (Domain + Use Cases) - 4hs
   - Día 3-4: Tarea 4.2e Backend (Domain + Use Cases) - 3hs

2. **Semana 2 - Frontend & Integration** (8hs):
   - Día 1-2: Tarea 8.6 Frontend (UI + Integration) - 3hs
   - Día 3-5: Tarea 4.2e Frontend (UI + Integration) - 5hs

**Justificación del orden:**
- Notificaciones primero porque es más simple (solo eliminación)
- Eventos segundo porque incluye configurabilidad (más complejo)
- Aprendizajes de notificaciones aplican a eventos

---

## ✅ Definition of Done (DoD)

### Backend
- [ ] Middlewares Mongoose implementados y testeados
- [ ] Use Cases con unit tests (coverage >80%)
- [ ] Endpoints REST documentados en Swagger
- [ ] Script de migración probado en datos existentes

### Frontend
- [ ] UI components implementados con ShadCN UI
- [ ] Hooks con TanStack Query (cache + optimistic updates)
- [ ] Toast notifications funcionando
- [ ] Responsive design validado

### Integration
- [ ] Flujo end-to-end testeado (crear evento → límite → eliminación FIFO)
- [ ] Flujo end-to-end testeado (crear notificación → eliminar manual)
- [ ] Performance validada (queries rápidas con arrays limitados)

### Documentation
- [ ] `docs/machine-events-system-architecture.md` actualizado
- [ ] `docs/Real-time-Notification-System.md` actualizado
- [ ] README con instrucciones de configuración (límites personalizados)

---

## 📝 Notas Adicionales

### Valores por Default Recomendados
```typescript
// Backend - Default values
const DEFAULT_EVENT_HISTORY_LIMIT = 100;
const DEFAULT_NOTIFICATION_LIMIT = 100;

// Frontend - Warnings
const EVENT_LIMIT_WARNING_THRESHOLD = 90; // Mostrar warning al 90%
const NOTIFICATION_LIMIT_WARNING_THRESHOLD = 90;
```

### Consideraciones de Migración
```javascript
// Script de migración (ejemplo)
db.machines.updateMany(
  { "eventsHistory.100": { $exists: true } }, // Máquinas con >100 eventos
  [
    {
      $set: {
        eventsHistory: {
          $slice: [
            { $sortArray: { input: "$eventsHistory", sortBy: { createdAt: -1 } } },
            100
          ]
        }
      }
    }
  ]
);
```

### Métricas de Éxito
- ✅ **Reducción de almacenamiento**: -X% en tamaño promedio de documentos
- ✅ **Mejora de performance**: -Y% en tiempo de carga de eventos/notificaciones
- ✅ **Satisfacción del usuario**: Encuesta post-implementación
- ✅ **Estabilidad**: Sin errores de límite en producción (monitoreo 30 días)

---

## 🔍 Referencias

- [WBS.md](./WBS.md) - Tareas 4.2e y 8.6
- [machine-events-system-architecture.md](./machine-events-system-architecture.md) - Arquitectura de eventos
- [Real-time-Notification-System.md](./Real-time-Notification-System.md) - Sistema de notificaciones
- [architecture&domainModel.md](./architecture&domainModel.md) - Modelo de dominio

---

**Estado**: ✅ Documentado y listo para planificación  
**Próximo paso**: Asignar a Sprint #14 o #15 según capacidad
