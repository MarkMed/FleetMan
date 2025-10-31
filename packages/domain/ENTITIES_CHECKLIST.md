# Checklist de Implementación de Entidades del Dominio

## 📋 Resumen

Este documento rastrea el progreso de implementación de las entidades principales del dominio para FleetMan. Cada entidad debe implementarse siguiendo principios DDD con invariantes adecuadas, value objects y reglas de negocio.

## 🎯 Estado de Implementación de Entidades

### **Entidades de Usuario Principales**

- [ ] **`User`** (Entidad Base Abstracta)
  - **Propósito**: Identidad base y autenticación para todos los usuarios
  - **Propiedades Clave**: `id`, `email`, `passwordHash`, `profile`, `createdAt`, `updatedAt`
  - **Reglas de Negocio**: 
    - Email debe ser único en todo el sistema
    - Password debe cumplir requisitos de seguridad
    - Información de perfil requerida para ambos tipos de usuario
  - **Archivo**: `packages/domain/src/entities/user.entity.ts`
  - **Dependencias**: `Email` (VO), `UserId` (VO)

- [ ] **`ClientUser`** (extiende User)
  - **Propósito**: Usuario final que posee/gestiona flota de máquinas
  - **Propiedades Clave**: `ownedMachines[]`, `subscriptionLevel`, `companyInfo?`
  - **Reglas de Negocio**:
    - Puede registrar y gestionar sus propias máquinas
    - Puede crear recordatorios de mantenimiento
    - Puede ejecutar QuickChecks en sus máquinas
  - **Archivo**: `packages/domain/src/entities/client-user.entity.ts`
  - **Dependencias**: `User`, `MachineId[]`

- [ ] **`ProviderUser`** (extiende User)
  - **Propósito**: Proveedor de servicios que mantiene máquinas para clientes
  - **Propiedades Clave**: `managedClients[]`, `serviceAreas[]`, `certifications[]`
  - **Reglas de Negocio**:
    - Puede gestionar máquinas para múltiples clientes
    - Puede registrar máquinas en nombre de clientes
    - Puede proporcionar información de contacto para reparaciones
  - **Archivo**: `packages/domain/src/entities/provider-user.entity.ts`
  - **Dependencias**: `User`, `UserId[]` (clientes gestionados)

### **Entidades de Máquina y Activos Principales**

- [ ] **`Machine`**
  - **Propósito**: Equipo/activo físico siendo gestionado
  - **Propiedades Clave**: `id`, `serialNumber`, `brand`, `model`, `ownerId`, `providerContact?`, `installDate`, `specs`
  - **Reglas de Negocio**:
    - Número de serie + marca/modelo debe ser único
    - Debe tener un propietario (ClientUser)
    - Puede tener contacto de proveedor opcional
    - No puede eliminarse si tiene recordatorios activos o eventos recientes
  - **Archivo**: `packages/domain/src/entities/machine.entity.ts`
  - **Dependencias**: `MachineId` (VO), `SerialNumber` (VO), `UserId`

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

- [ ] **`MachineEvent`**
  - **Propósito**: Registro unificado del historial para todas las actividades relacionadas con máquinas
  - **Propiedades Clave**: `id`, `machineId`, `type`, `description`, `createdBy`, `createdAt`, `metadata?`
  - **Tipos de Eventos**:
    - `MAINTENANCE_REMINDER_TRIGGERED`
    - `QUICK_CHECK_COMPLETED` (con resultados)
    - `MANUAL_EVENT` (creado por usuario)
    - `SPARE_PART_CHANGED`
    - `CONTACT_PROVIDER_ATTEMPTED`
  - **Reglas de Negocio**:
    - Los eventos son inmutables una vez creados
    - Debe tener referencia válida a máquina
    - CreatedBy debe ser usuario válido
  - **Archivo**: `packages/domain/src/entities/machine-event.entity.ts`
  - **Dependencias**: `MachineId`, `UserId`, `MachineEventType` (VO)

### **Entidades de Comunicación y Notificación**

- [ ] **`Notification`**
  - **Propósito**: Sistema de notificaciones para alertas y recordatorios
  - **Propiedades Clave**: `id`, `userId`, `type`, `title`, `message`, `isRead`, `sourceEntityId?`, `createdAt`
  - **Reglas de Negocio**:
    - Debe ser entregada a usuario válido
    - No puede volver a estado no leída una vez marcada como leída
    - Auto-limpieza después de 90 días si está leída
  - **Archivo**: `packages/domain/src/entities/notification.entity.ts`
  - **Dependencias**: `UserId`, `NotificationType` (VO)

- [ ] **`ContactMethod`**
  - **Propósito**: Información de contacto de proveedor externo para máquinas
  - **Propiedades Clave**: `id`, `machineId`, `type`, `value`, `label`, `isPrimary`
  - **Tipos de Contacto**: `PHONE`, `EMAIL`, `WHATSAPP`, `WEBSITE`
  - **Reglas de Negocio**:
    - Debe tener valor de contacto válido para el tipo
    - Solo un contacto primario por tipo por máquina
    - Teléfono/WhatsApp debe tener formato válido
  - **Archivo**: `packages/domain/src/entities/contact-method.entity.ts`
  - **Dependencias**: `MachineId`, `ContactInfo` (VO)

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
- Terminar con **Repuesto + ContactMethod**

## 📊 Progreso de Implementación

**Total de Entidades**: 11
**Completadas**: 0 ✅  
**En Progreso**: 0 🔄  
**Pendientes**: 11 ⏳  

## 🔗 Value Objects Relacionados Necesarios

- [ ] `UserId`, `MachineId`, `Email`, `SerialNumber`
- [ ] `ContactInfo`, `MaintenanceSchedule`, `NotificationType`
- [ ] `MachineEventType`, `QuickCheckId`, `RepuestoId`

## 📝 Próximos Pasos

1. **Crear Value Objects** primero (fundación)
2. **Implementar jerarquía User** (User → ClientUser → ProviderUser)
3. **Agregar entidad Machine** con propiedades básicas
4. **Construir sistema de eventos** (MachineEvent → Notification)
5. **Agregar funciones de mantenimiento** (MaintenanceReminder)
6. **Implementar funciones de seguridad** (QuickCheck + Items)
7. **Completar con inventario** (Repuesto + ContactMethod)

---
*Última Actualización: 31 de Octubre, 2025*  
*Próxima Revisión: Después de completar las primeras 3 entidades*