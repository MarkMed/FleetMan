# 2.9. Arquitectura 

La solución adopta un monolito por capas con separación estricta de responsabilidades y límites de dependencia bien definidos. Operamos en un mono-repo basado en TypeScript con workspaces para aislar preocupaciones aumentando la calidad de experiencia de desarrollo.

## 2.9.0. Stack Tecnológico

### Frontend (MVVM-lite)
- **Core:** React + TypeScript, Vite (build tool)
- **Routing:** React Router
- **State Management:** TanStack Query (server state), Zustand (client state)
- **Forms & Validation:** React Hook Form + Zod
- **UI & Styling:** Radix UI + shadcn/ui + Tailwind CSS
- **PWA:** vite-plugin-pwa + workbox-window
- **Internacionalización:** react-i18next

### Backend (Layered + Features)
- **Core:** Node.js + Express + TypeScript
- **Dependency Injection:** tsyringe
- **Validation:** Zod (compartido con frontend)
- **Authentication:** JWT
- **Database:** MongoDB + Mongoose
- **Scheduling:** node-cron
- **Email:** nodemailer
- **Configuration:** dotenv, envalid
- **Security:** helmet + cors, express-rate-limit, argon2 (hashing)
- **Logging:** pino

### Shared Packages
- **packages/contracts:** Esquemas Zod compartidos para validación y tipado
- **packages/shared:** Utilidades comunes (Result/Either, error factories, feature flags) 

## 2.9.1. Estructura de folders
 

- /apps/frontend: encapsula la UI (React, TanStack Query, RHF+Zod, i18n, PWA). No contiene reglas de negocio. Consume únicamente contratos tipados de /packages/contracts. 

- /apps/backend: expone Interfaces (HTTP controllers, routers, jobs/cron) y orquesta Casos de Uso (Aplicación). No conoce detalles de DB ni librerías de envío de correo; usa puertos del Dominio. 

- /packages/domain: "corazón" del sistema: Entidades, Value Objects, Policies/Strategies, Servicios de dominio y Puertos (interfaces) para repositorios, notificaciones, scheduler, reloj, etc. 100% framework-agnostic. 

- /packages/contracts: una fuente de verdad para validar y tipar requests/responses con Zod (y derivar OpenAPI si se desea). Evita "drift" entre front y back. 

- /packages/persistence: implementa repositorios contra MongoDB/Mongoose y mapeadores Persistence ↔ Domain. Incluye migraciones y seeders. No expone modelos a otras capas. 

- /packages/infra: adapters de mensajería interna, scheduler/cron, clock, logger. Implementa puertos del Dominio para servicios de comunicación (exclusivamente entre usuarios registrados) y otros servicios externos. 

- /packages/shared: helpers puros (Result/Either, error factory, feature flags, utils). Nada de lógica de negocio. 

## 2.9.2. Capas (y responsabilidades) 

- Presentación (apps/frontend) 
Renderiza páginas y componentes, maneja estado de UI y server state (React Query), valida formularios con Zod (desde /contracts). Nunca decide reglas de negocio. 

- Aplicación (apps/backend/src/application) 
Casos de uso por bounded context (Assets, Maintenance, QuickCheck, Inventory, Comms, Identity, Scheduling). Orquesta repositorios y servicios de dominio. Aplica políticas de autorización livianas. No conoce Mongoose ni librerías de correo: depende de puertos del Dominio. 

- Dominio (packages/domain) 
Reglas puras del negocio: entidades, VOs, policies, domain services. Define puertos (interfaces) para repositorios, notificaciones, scheduler, reloj, etc. No hay frameworks ni acceso a red/DB. 

- Persistencia (packages/persistence) 
Implementaciones concretas de los repositorios (Mongoose) y mappers Document ↔ Aggregate. Ejecuta migraciones y mantiene Outbox para entrega confiable de notificaciones/eventos. 

Aclaración: Infraestructura "no-DB" se considera una extensión de la capa de detalles técnicos, separada de Persistencia para mantener bajo acoplamiento a proveedores. 

## 2.9.3. Flujo 
El flujo de las peticiones y lógica sería el siguiente:
1. Usuario → Presentación (UI) 
La PWA muestra formularios, valida shape con Zod (contracts) y arma el request. No hay reglas de negocio; sólo UX, accesibilidad y estado de UI. 

2. Presentación → Interfaces (HTTP Routers/Controllers) 
Envía HTTP (headers: auth token, x-request-id opcional). El controller parsea/valida DTO con Zod, autentica y aplica autorización. 

3. Interfaces → Aplicación (Use Case) 
El controller crea el Command/Input y llama al Use Case. 
El controller no decide reglas; sólo hace de borde. 

4. Aplicación (Use Case) → Dominio (lectura) 
El Use Case orquesta: usa puertos (repos definidos en Dominio) para cargar agregados/entidades necesarias. 
Maneja unidad de trabajo/transacción si aplica (Mongo session). 

5. Dominio (reglas de negocio) Entidades/VOs/Policies/Domain Services aplican invariantes, cálculos y transiciones de estado. Pueden emitir eventos de dominio (colección outbox) como resultado de cambios válidos. 

6. Aplicación (Use Case)→ Dominio (puertos) → Persistencia (escritura). 
Si hubo cambios, el Use Case persiste a través de los mismos puertos (repos concretos detrás). Registra eventos en outbox (si hay notificaciones/side-effects). Confirma la transacción (commit) o revierte (rollback) ante errores. 

7. Persistencia (Repos + Mappers) 
Implementa puertos del Dominio (p. ej., IMachineRepository) con Mongoose. Mapea Document ↔ Entidad (sin filtrar reglas; sólo I/O y conversión). El Dominio no conoce Mongoose; la Persistencia no decide negocio. 

8. Aplicación (Use Case) → Interfaces (Controllers con respuestas) 
El Use Case devuelve resultado de dominio (éxito/errores tipados). El controller mapea Dominio → DTO de respuesta (contracts) y define el status code correcto. 

9. Interfaces → Presentación (UI) 
La UI recibe el DTO; React Query cachea/invalida keys y el app state se actualiza. La PWA muestra feedback (toasts, redirecciones) y refresca vistas.

## 2.9.4. Ventajas de la arquitectura propuesta 

- Separación de responsabilidades (SRP): Presentación, Aplicación, Dominio y Persistencia delimitan funciones; cada capa mantiene un propósito único y acotado. Este enfoque refuerza la modularidad del proyecto, lo cual da base solida con buena escalabilidad. 

- Inversión de dependencias (DIP): El Dominio define puertos; Persistencia e Infraestructura los implementan. La lógica de negocio no depende de detalles técnicos ni frameworks. 

- Contratos compartidos y tipados únicos: Zod elimina posibles inconsistencias entre front y back, habilita validación isomórfica y reduce bugs de integración. 

- Orquestación explícita en Aplicación: Los Use Cases hacen visible el flujo de negocio, simplificando auditoría, razonamiento y mantenimiento. 

- Repositorios encapsulados y mapeo claro: Mongoose queda confinado a Persistencia con mappers Persistence ↔ Domain, evitando filtraciones de detalles de DB. 

# 2.10. Modelos y documentos de diseño

## Jerarquía de usuarios
La base del modelo es User, de la cual heredan ClientUser y ProviderUser. Esta herencia es estructural: comparten identidad, credenciales y datos comunes de usuario, y cada subtipo agrega su comportamiento/uso esperado en la app. 

Un ProviderUser puede registrar una cartera de clientes: ProviderUser 1 → 0..* ClientUser. Esto refleja que un proveedor puede dar servicio a varios clientes desde su propia cuenta.

## Gestión de máquinas
Adicionalmente, para cada cliente que atiende, el proveedor puede registrar el parque de equipos de ese cliente: ClientUser 1 → 0..* Machine (creadas por el proveedor dentro de su ámbito). Este mismo vínculo existe del lado del cliente: un ClientUser (autogestionado) también puede registrar su propio parque de Machine: ClientUser 1 → 0..* Machine. 

En el MVP, ambos caminos coexisten; por lo tanto, es recomendable definir reglas de unicidad (por ejemplo, número de serie + marca/modelo) y, si es necesario, un mecanismo de "vincular/conciliar" más adelante para evitar duplicados del mismo equipo registrado por ambas partes.

## Contactos con distribuidores
Cada Machine puede tener definido un contacto hacia un proveedor/distribuidor para servicio o repuestos. Ese contacto debe apuntar obligatoriamente a un ProviderUser registrado (Machine 0..1 → 0..1 ProviderUser como contacto primario), ya que la comunicación se realiza exclusivamente mediante mensajería interna entre usuarios registrados. 

No se admiten contactos externos o medios de comunicación nativos fuera de la plataforma. Esta combinación cubre únicamente el caso de distribuidores registrados con un único modelo simple que asegura que todos los distribuidores estén registrados en el sistema y la comunicación se mantenga dentro del ecosistema de la aplicación.

## Mantenimiento preventivo
En cuanto a mantenimiento preventivo, cada Machine puede tener cero o muchas reglas de recordatorio: Machine 1 → 0..* MaintenanceReminder. Cada reminder describe el criterio por tiempo y/o por horas de uso (por ejemplo, "cada 60 días" o "cada 500 horas"). 

Cuando se cumple la condición, el reminder genera una notificación operativa: MaintenanceReminder 1 → 0..* Notification (en la práctica, una por "disparo"), dirigida al dueño/gestor que corresponda (el ClientUser si es una máquina de su cuenta; el ProviderUser si la administra desde su cuenta). El reminder también debería dejar rastros en el historial de la máquina (ver párrafo de eventos).

## QuickCheck de seguridad
Respecto a seguridad operativa, cada Machine puede definir un único formulario de chequeo rápido: Machine 0..1 → 1 QuickCheck. Ese QuickCheck está compuesto por ítems editables en cualquier momento: QuickCheck 1 → 1..* QuickCheckItem (cada ítem con label/título obligatorio y descripción opcional). 

El operador selecciona la máquina, inicia el chequeo y marca cada ítem como "ok", "fail" u "omit". Al concluir, se genera un registro en el historial de la máquina con el resultado completo del chequeo (ver eventos). No hay versionado ni ejecuciones separadas en el MVP: el resultado completo se persiste dentro del evento, evitando complejidad extra. Si el resultado global del chequeo es no aprobado (algún "fail"), además se emite una Notification para el usuario pertinente.

## Historial y trazabilidad
Toda la trazabilidad operativa se concentra en el historial de cada equipo mediante MachineEvent: Machine 1 → 0..* MachineEvent. Los eventos pueden ser creados manualmente por un ClientUser o un ProviderUser (por ejemplo, para reportar roturas, detenciones o cambios de piezas) y también generados automáticamente por el sistema en tres situaciones principales: 

- **(a)** al concluir un QuickCheck (se guarda el detalle de resultados por ítem dentro del propio evento)
- **(b)** cuando un MaintenanceReminder dispara una Notification (se registra el vencimiento/condición que lo ocasionó)
- **(c)** cuando se produce comunicación relevante disparada por los usuarios (por ejemplo, un contacto al proveedor mediante mensajería interna, si se decide registrar ese "intento de contacto" como evento de la máquina)

MachineEvent funciona, así, como una bitácora unificada, suficientemente expresiva para consultas y reportes sin introducir entidades adicionales de ejecución/versionado en el MVP.

## Centro de notificaciones
Por último, Notification es la bandeja de avisos para cada cuenta: User 1 → 0..* Notification. En el MVP, las notificaciones se originan principalmente por reminders vencidos/por vencer y por QuickCheck no aprobado. 

Se recomienda que cada notificación lleve metadatos mínimos (tipo, referencia a la máquina y al origen —p. ej., maintenanceReminderId o "quickcheck result"— y acciones rápidas como "contactar proveedor" o "registrar evento"), manteniendo el flujo simple y accionable.