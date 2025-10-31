# Domain Package - El Corazón del Sistema

## 📋 Propósito

El paquete `domain` es el núcleo del sistema FleetMan, implementando toda la lógica de negocio pura según los principios de **Domain-Driven Design (DDD)** y **Clean Architecture**. Este paquete es completamente **framework-agnostic** y no tiene dependencias externas, garantizando que las reglas de negocio permanezcan puras e independientes de detalles técnicos.

## 🎯 Principios Arquitectónicos

- **100% Framework-Agnostic**: No conoce Express, Mongoose, ni ninguna librería externa
- **Inversión de Dependencias**: Define puertos (interfaces) que son implementados por capas externas
- **Single Responsibility**: Cada entidad, servicio y política tiene una responsabilidad específica
- **Domain-First**: Las reglas de negocio dictan la estructura, no la tecnología

## 📁 Estructura de Carpetas

### `/entities`
Contiene las **entidades principales** del dominio con sus invariantes y comportamientos:

**Entidades a implementar:**
- `User` (base) - Identidad y credenciales comunes
- `ClientUser extends User` - Usuario cliente que gestiona su flota
- `ProviderUser extends User` - Proveedor de servicios/repuestos
- `Machine` - Equipo/activo con historial y configuración
- `MaintenanceReminder` - Reglas de recordatorios preventivos
- `MachineEvent` - Eventos del historial de máquinas
- `QuickCheck` - Formulario de chequeo rápido de seguridad
- `QuickCheckItem` - Ítem individual de un chequeo
- `Notification` - Notificaciones para usuarios
- `ContactMethod` - Métodos de contacto ad-hoc

### `/value-objects`
Contiene **Value Objects** inmutables que encapsulan conceptos del dominio:

**Value Objects a implementar:**
- `Email` - Validación y normalización de emails
- `UserId` - Identificador tipado de usuario
- `MachineId` - Identificador tipado de máquina
- `SerialNumber` - Número de serie con validaciones
- `ContactInfo` - Información de contacto estructurada
- `MaintenanceSchedule` - Programación de mantenimiento

### `/ports`
Define **interfaces** para la inversión de dependencias:

**Puertos a implementar:**
- **Repositorios**: `IUserRepository`, `IMachineRepository`, `INotificationRepository`
- **Servicios externos**: `INotificationService`, `ISchedulerService`, `IMailerService`
- **Infraestructura**: `IClock`, `ILogger`, `IEventDispatcher`

### `/services`
Contiene **servicios de dominio** que orquestan lógica compleja:

**Servicios a implementar:**
- `MaintenanceSchedulingService` - Cálculo de vencimientos y programación
- `QuickCheckValidationService` - Validación de chequeos de seguridad
- `NotificationDispatchService` - Orquestación de envío de notificaciones
- `MachineRegistrationService` - Registro y validación de equipos

### `/policies`
Implementa **políticas de negocio** y reglas de decisión:

**Políticas a implementar:**
- `MaintenanceReminderPolicy` - Cuándo disparar recordatorios
- `QuickCheckPolicy` - Reglas de aprobación/rechazo de chequeos
- `AuthorizationPolicy` - Qué usuarios pueden hacer qué acciones
- `MachineUniquenessPolicy` - Reglas de unicidad por serie/modelo

### `/events`
Define **eventos de dominio** para comunicación asíncrona:

**Eventos a implementar:**
- `UserRegistered` - Usuario registrado exitosamente
- `MachineAdded` - Nueva máquina agregada al sistema
- `MaintenanceReminderTriggered` - Recordatorio disparado
- `QuickCheckCompleted` - Chequeo completado (exitoso o fallido)
- `NotificationSent` - Notificación enviada exitosamente

## 🔄 Flujo de Dependencias

```
Domain (este paquete)
    ↑ define puertos
    ↓ implementados por
Persistence + Infrastructure
```

El dominio **define qué necesita** (puertos) pero **no sabe cómo se implementa**. Las capas externas se adaptan a las necesidades del dominio.

## 📝 Convenciones de Código

### Entidades
- Método `create()` estático para construcción validada
- Propiedades inmutables usando `readonly`
- Métodos que retornan `Result<T, DomainError>` para operaciones que pueden fallar

### Value Objects
- Completamente inmutables
- Constructor privado con factory method `create()`
- Método `equals()` para comparación de valor
- Validación en el constructor

### Servicios
- Un método público principal por responsabilidad
- Dependencias inyectadas via constructor (puertos)
- Retorna `Result<T>` para operaciones que pueden fallar

## 🚫 Qué NO va en este paquete

- ❌ Dependencias de Express, Mongoose, o librerías HTTP
- ❌ Conocimiento de base de datos o JSON
- ❌ Lógica de presentación o validación de UI
- ❌ Configuración de infraestructura

## 📚 Referencias

- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Ports and Adapters](https://alistair.cockburn.us/hexagonal-architecture/)