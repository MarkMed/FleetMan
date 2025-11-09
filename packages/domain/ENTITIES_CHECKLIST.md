# Checklist de Implementación de Entidades del Dominio

## 📋 Resumen

Este documento rastrea el progreso de implementación de las entidades principales del dominio para FleetMan. Cada entidad debe implementarse siguiendo principios DDD con invariantes adecuadas, value objects y reglas de negocio.

## 🎯 Estado de Implementación de Entidades

### **Entidades de Usuario Principales**

- [x] **`User`** (Entidad Base Abstracta) ✅
  - **Propósito**: Identidad base y autenticación para todos los usuarios
  - **Propiedades Clave**: `id`, `email`, `passwordHash`, `profile`, `createdAt`, `updatedAt`
  - **Reglas de Negocio**: 
    - Email debe ser único en todo el sistema
    - Password debe cumplir requisitos de seguridad
    - Información de perfil requerida para ambos tipos de usuario
  - **Archivo**: `packages/domain/src/entities/user.entity.ts` ✅
  - **Dependencias**: `Email` (VO) ✅, `UserId` (VO) ✅
  - **Estado**: Implementada con validaciones completas y métodos de negocio

- [x] **`ClientUser`** (extiende User) ✅
  - **Propósito**: Usuario final que posee/gestiona flota de máquinas
  - **Propiedades Clave**: `ownedMachines[]`, `subscriptionLevel`, `companyInfo?`
  - **Reglas de Negocio**:
    - Puede registrar y gestionar sus propias máquinas
    - Límites de máquinas según nivel de suscripción (Basic: 5, Premium: 25, Enterprise: 1000)
    - Puede crear recordatorios de mantenimiento
    - Puede ejecutar QuickChecks en sus máquinas
    - Validación de información de empresa opcional
  - **Archivo**: `packages/domain/src/entities/client-user.entity.ts` ✅
  - **Dependencias**: `User` ✅, `MachineId[]` ✅
  - **Estado**: Implementada con gestión completa de máquinas y suscripciones

- [x] **`ProviderUser`** (extiende User) ✅
  - **Propósito**: Proveedor de servicios que mantiene máquinas para clientes
  - **Propiedades Clave**: `specialties[]`, `specs` (experiencia, certificaciones, radio de servicio, rating), `isVerified`
  - **Reglas de Negocio**:
    - Máximo 10 especialidades permitidas
    - Radio de servicio entre 0-1000 km
    - Sistema de rating 1-5 basado en trabajos completados
    - Verificación requerida para asignación a trabajos
    - Gestión de trabajos completados y rating promedio
  - **Archivo**: `packages/domain/src/entities/provider-user/provider-user.entity.ts` ✅
  - **Dependencias**: `User` ✅, herencia completa implementada
  - **Estado**: Implementada con sistema completo de especialidades, verificación y rating

### **Entidades de Máquina y Activos Principales**

- [x] **`Machine`** ✅
  - **Propósito**: Equipo/activo físico siendo gestionado
  - **Propiedades Clave**: `serialNumber`, `brand`, `model`, `ownerId`, `assignedProviderId`, `status`, `specs`, `location`
  - **Reglas de Negocio**:
    - Número de serie + marca/modelo debe ser único
    - Debe tener un propietario (ClientUser)
    - Puede ser creada por el propietario o por un ProviderUser en su nombre
    - Proveedor asignado es opcional pero debe ser ProviderUser registrado si existe
    - El proveedor puede ser oficial, de mantenimiento, casa de repuestos, etc.
    - Estados válidos: ACTIVE, MAINTENANCE, OUT_OF_SERVICE, RETIRED
    - Transiciones de estado controladas
    - No puede eliminarse si tiene recordatorios activos o eventos recientes
  - **Archivo**: `packages/domain/src/entities/machine/machine.entity.ts` ✅
  - **Dependencias**: `MachineId` (VO) ✅, `SerialNumber` (VO) ✅, `UserId` ✅
  - **Estado**: Implementada con gestión completa de estados, proveedor y especificaciones técnicas

- [x] **`MachineType`** ✅ (BONUS - Configuración de tipos)
  - **Propósito**: Definición configurable de tipos de máquinas y sus características
  - **Propiedades Clave**: `name`, `category`, `defaultSpecs`, `customFields`, `isActive`
  - **Reglas de Negocio**:
    - Nombre único por categoría
    - Especificaciones por defecto configurables
    - Campos customizables por tipo de máquina
    - Habilita flexibilidad para diferentes tipos de equipo
  - **Archivo**: `packages/domain/src/entities/machine-type/machine-type.entity.ts` ✅
  - **Dependencias**: `MachineTypeId` (VO), configuración flexible
  - **Estado**: Implementada - Permite configurar diferentes tipos de máquinas

- [ ] **`Repuesto`** (Spare Part)
  - **Propósito**: Gestión de repuestos e inventario para máquinas
  - **Propiedades Clave**: `id`, `name`, `partNumber`, `machineId`, `category`, `quantity`, `status`, `supplier?`
  - **Reglas de Negocio**:
    - Debe estar asociado con una máquina específica
    - La cantidad no puede ser negativa
    - Seguimiento de estado (disponible, pedido, instalado, descontinuado)
  - **Archivo**: `packages/domain/src/entities/spare-part.entity.ts`
  - **Dependencias**: `MachineId`, `RepuestoId` (VO)

### **Entidades de Mantenimiento y Programación**

- [ ] **`MaintenanceReminder`**
  - **Propósito**: Reglas de recordatorio automatizado para mantenimiento preventivo
  - **Propiedades Clave**: `id`, `machineId`, `type`, `intervalDays?`, `intervalHours?`, `description`, `isActive`
  - **Reglas de Negocio**:
    - Debe tener intervalo basado en tiempo O en uso (o ambos)
    - No puede tener intervalos cero
    - Solo un recordatorio por tipo por máquina
    - Genera notificaciones cuando se cumplen criterios
  - **Archivo**: `packages/domain/src/entities/maintenance-reminder.entity.ts`
  - **Dependencias**: `MachineId`, `MaintenanceSchedule` (VO)

### **Entidades de Seguridad e Inspección**

- [ ] **`QuickCheck`**
  - **Propósito**: Plantilla de formulario de inspección de seguridad para una máquina
  - **Propiedades Clave**: `id`, `machineId`, `title`, `description`, `items[]`, `isActive`
  - **Reglas de Negocio**:
    - Un QuickCheck activo por máquina
    - Debe tener al menos un QuickCheckItem
    - No puede eliminarse si tiene historial de ejecución
  - **Archivo**: `packages/domain/src/entities/quick-check.entity.ts`
  - **Dependencias**: `MachineId`, `QuickCheckItemId[]`

- [ ] **`QuickCheckItem`**
  - **Propósito**: Ítem individual de inspección dentro de un QuickCheck
  - **Propiedades Clave**: `id`, `quickCheckId`, `title`, `description?`, `order`, `isRequired`
  - **Reglas de Negocio**:
    - Debe pertenecer a un QuickCheck
    - El orden debe ser único dentro del QuickCheck
    - El título no puede estar vacío
  - **Archivo**: `packages/domain/src/entities/quick-check-item.entity.ts`
  - **Dependencias**: `QuickCheckId` (VO)

### **Entidades de Eventos e Historial**

- [x] **`MachineEvent`** ✅
  - **Propósito**: Registro unificado del historial para todas las actividades relacionadas con máquinas
  - **Propiedades Clave**: `id`, `machineId`, `type`, `description`, `createdBy`, `createdAt`, `metadata?`
  - **Tipos de Eventos**:
    - `MAINTENANCE_REMINDER_TRIGGERED`
    - `QUICK_CHECK_COMPLETED` (con resultados)
    - `MANUAL_EVENT` (creado por usuario)
    - `SPARE_PART_CHANGED`
    - `PROVIDER_CONTACTED` (comunicación mediante mensajería interna)
    - `PROVIDER_ASSIGNED` (cuando se asigna proveedor a máquina)
    - `PROVIDER_REMOVED` (cuando se remueve proveedor de máquina)
  - **Reglas de Negocio**:
    - Los eventos son inmutables una vez creados
    - Debe tener referencia válida a máquina
    - CreatedBy debe ser usuario válido
  - **Archivo**: `packages/domain/src/entities/machine-event/machine-event.entity.ts` ✅
  - **Dependencias**: `MachineId`, `UserId`, `MachineEventType` (VO) ✅
  - **Estado**: Implementada con sistema extensible de tipos y metadatos, factory methods para eventos específicos

### **Entidades de Comunicación y Notificación**

- [ ] **`Notification`**
  - **Propósito**: Sistema de notificaciones para alertas y recordatorios
  - **Propiedades Clave**: `id`, `userId`, `type`, `title`, `message`, `isRead`, `sourceEntityId?`, `createdAt`, `actionData?`
  - **Reglas de Negocio**:
    - Debe ser entregada a usuario válido
    - No puede volver a estado no leída una vez marcada como leída
    - Auto-limpieza después de 90 días si está leída
    - Puede incluir acciones rápidas como "contactar proveedor" o "registrar evento"
  - **Archivo**: `packages/domain/src/entities/notification.entity.ts`
  - **Dependencias**: `UserId`, `NotificationType` (VO)

- [ ] **`InternalMessage`**
  - **Propósito**: Sistema de mensajería interna exclusiva entre usuarios registrados
  - **Propiedades Clave**: `id`, `fromUserId`, `toUserId`, `subject`, `content`, `machineId?`, `threadId?`, `isRead`, `createdAt`
  - **Reglas de Negocio**:
    - Comunicación exclusivamente entre usuarios registrados (ClientUser ↔ ProviderUser)
    - No se permiten contactos externos o comunicación fuera de la plataforma
    - Puede estar asociado con una máquina específica para contexto
    - Soporte para hilos de conversación
  - **Archivo**: `packages/domain/src/entities/internal-message.entity.ts`
  - **Dependencias**: `UserId`, `MachineId?`, `MessageThreadId?` (VO)

## 🏗 Guías de Implementación

### **Patrón de Estructura de Entidad**
```typescript
export class NombreEntidad {
  private constructor(private props: NombreEntidadProps) {}
  
  public static create(props: CreateNombreEntidadProps): Result<NombreEntidad, DomainError> {
    // Validación y reglas de negocio
    // Retorna ok(new NombreEntidad(validatedProps)) o err(domainError)
  }
  
  // Getters (sin setters - interfaz pública inmutable)
  get id(): EntidadId { return this.props.id; }
  
  // Métodos de negocio
  public metodoDeNegocio(): Result<void, DomainError> {
    // Lógica de negocio aquí
  }
}
```

### **Prioridad de Reglas de Negocio**
1. **Integridad de Datos**: Campos requeridos, validación de formato
2. **Invariantes de Negocio**: Unicidad, relaciones, consistencia de estado
3. **Lógica de Dominio**: Cálculos, transiciones de estado, emisión de eventos

### **Estrategia de Dependencias**
- Empezar con **User → Machine → MaintenanceReminder → MachineEvent → Notification**
- Agregar **QuickCheck + QuickCheckItem** después
- Completar con **InternalMessage + Repuesto**

## 📊 Progreso de Implementación

**Total de Entidades**: 12  
**Completadas**: 6 ✅ (User, ClientUser, ProviderUser, Machine, MachineType, MachineEvent)
**Estructuras Creadas**: 6 📁 (con folders y index.ts preparados)
**Pendientes de Implementación**: 6 ⏳

## 🔗 Value Objects Relacionados Necesarios

- [x] `UserId` ✅, `Email` ✅, `MachineId` ✅, `SerialNumber` ✅
- [ ] `MaintenanceSchedule`, `NotificationType`
- [ ] `MachineEventType`, `QuickCheckId`, `RepuestoId`
- [ ] `MessageThreadId` (para hilos de mensajería interna)

## 📝 Próximos Pasos

1. **Implementar sistema de notificaciones** (Notification - habilitado por MachineEvent ✅)
2. **Agregar funciones de mantenimiento** (MaintenanceReminder)
3. **Implementar funciones de seguridad** (QuickCheck + Items)
4. **Construir sistema de comunicación** (InternalMessage)
5. **Completar con inventario** (Repuesto)

### 🚀 **Estado Actual - ¡Excelente Progreso!**

✅ **Base sólida completada**: Jerarquía de usuarios y máquinas implementada  
✅ **Modelo de negocio funcional**: ClientUser ↔ ProviderUser ↔ Machine + MachineType  
✅ **Sistema de eventos implementado**: MachineEvent con tipos extensibles y metadatos ✅
✅ **Todas las entidades core implementadas**: User, ClientUser, ProviderUser, Machine, MachineType, MachineEvent
🎯 **Siguiente prioridad**: Notification (sistema de alertas basado en eventos)  

### 📋 **Estructuras ya creadas (listas para implementar)**:
- `/machine-event/` - Historial unificado de actividades
- `/maintenance-reminder/` - Recordatorios automatizados 
- `/notification/` - Sistema de alertas
- `/quick-check/` y `/quick-check-item/` - Inspecciones de seguridad
- `/internal-message/` - Comunicación entre usuarios
- `/repuesto/` - Gestión de inventario

---
*Última Actualización: 8 de Noviembre, 2024*  
*Próxima Revisión: Después de completar MachineEvent*