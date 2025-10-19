
# 2.7.1. Requerimientos Funcionales

## 2.7.1.1. Gestión de usuarios.
- RF-001 – Registro de usuarios. Permitir el alta de usuarios mediante email y contraseña, incluyendo la selección inicial del rol (“Distribuidor” o “Usuario de maquinaria”) como primer paso del registro. Dependencias: (ninguna) Prioridad: Must Have
- RF-002 – Verificación de email. Autenticar credenciales válidas y establecer una sesión segura para el usuario. Dependencias: RF-001 Prioridad: Must Have
- RF-003 – Cierre de sesión. Permitir al usuario cerrar sesión manualmente y también por inactividad prolongada. Dependencias: RF-002 Prioridad: Must Have
- RF-004 – Recuperación de contraseña. Permitir recuperar el acceso mediante un enlace temporal enviado al correo registrado. Dependencias: RF-001 Prioridad: Should Have 
## 2.7.1.2. Gestión de maquinaria.
- RF-005 – Registro de maquinaria. Registrar equipos, sus datos técnicos y poder asignar contactos de distribuidor de servicio/repuestos Dependencias: RF-002 Prioridad: Must Have
- RF-006 – Edición de datos y estado de maquinaria. Permitir editar los datos y estado actual de equipos guardando su historial de cambios. Dependencias: RF-005 Prioridad: Must Have 
## 2.7.1.3. Gestión de mantenimiento.
- RF-007 – Programación de mantenimiento. Crear y gestionar recordatorios de mantenimientos preventivos o correctivos asociados a una máquina, definiendo fechas, tipo de tarea y otros detalles. Dependencias: RF-005 Prioridad: Must Have
- RF-008 – Registro de evento para maquinaria Permite registrar manualmente distintos tipos de eventos asociados a una máquina (mantenimiento, incidente, falla, detención, etc.), con formularios específicos según el tipo de evento. Dependencias: RF-005 Prioridad: Must Have
- RF-009 – Historial de mantenimientos. Poder acceder al historial de mantenimientos del equipo, incluyendo incidencias y QuickChecks asociados. Dependencias: RF-008 Prioridad: Must Have
- RF-010 – Alertas de mantenimiento. Generar y enviar recordatorios automáticos cuando se acerque o se venza la fecha para un mantenimiento programado. Dependencias: RF-007 Prioridad: Must Have
- RF-011 – QuickCheck de seguridad. Crearción y uso de formulario sencillo tipo check list para realizar un chequeo rápido de seguridad previo a la operación de maquinaria cuyos resultados se almacenen en el historial del equipo. Dependencias: RF-005 Prioridad: Must have 
## 2.7.1.3. Gestión de Repuestos
- RF-012 – Registrar repuestos de máquina. Permitir registrar repuestos asociados a una máquina, indicando nombre, tipo, cantidad, estado y observaciones. Dependencias: RF-005 Prioridad: Should Have
- RF-013 – Ver lista de repuestos de una máquina Permitir visualizar todos los repuestos asociados a una máquina, incluyendo su estado actual (solicitado, instalado, faltante). Dependencias: RF-012 Prioridad: Should Have
- RF-014 – Modificar detalles de repuestos de máquina. Permitir editar los detalles de repuestos asociados a una máquina (cantidad, estado, observaciones). Dependencias: RF-012 Prioridad: Should Have
## 2.7.1.4. Comunicaciones y facilidades
- RF-015 – Comunicación con distribuidores/proveedores. Permitir a los usuarios contactar distribuidores directamente desde la aplicación mediante los medios disponibles (llamada, SMS, correo electrónico, WhatsApp o mensajería interna si el distribuidor posee cuenta registrada). Dependencias: ninguna Prioridad: Must Have
- RF-016 – Centro de notificaciones. Mostrar en una bandeja centralizada las alertas o mensajes generados por mantenimientos, eventos y QuickChecks. Dependencias: RF-010, RF-008, RF-011 Prioridad: Must Have
- RF-017 – Aviso de QuickCheck no aprobado Enviar un aviso (correo o SMS) al usuario loggeado si un QuickCheck resulta no aprobado, indicando los ítems fallidos. El aviso se registra también en el historial y en el centro de notificaciones. Dependencias: RF-011, RF-016 Prioridad: Should have
- RF-018 – Búsqueda y filtrado global. Permitir buscar y filtrar maquinaria, repuestos, mantenimientos o eventos por criterios básicos (nombre, estado, acción, etc). Dependencias: RF-005, RF-008 Prioridad: Could Have
- RF-019 – Centro de ayuda y guías rápidas. Incluir una sección de ayuda dentro de la aplicación con tutoriales o pasos breves de uso. Dependencias: ninguna Prioridad: Could Have
- RF-020 - Multilenguaje (i18n) Estructurar la app para permitir cambiar de idioma, disponibilizando la rápida implementación de nuevos. Dependencias: ninguna Prioridad: Could Have

# Plan de Testing
Las pruebas que se emplearán serán enfocadas en el MVP, cubriendo aspectos de código y usabilidad. El foco para esta fase de desarrollo es contar con pruebas unitarias automatizadas con la herramienta Jest, y pruebas manuales de sanitización y verificación. Por cada módulo, funcionalidad, feature, se planea tener una prueba unitaria que pueda cubrir puntos específicos de dicho modulo. En el backend se cubren casos de uso, servicios, validaciones y control de errores; en el frontend se valida la lógica de módulos, hooks y utilidades cuando aplique. Se aprovechará también tanto las instancias de Demostración como las versiones lanzadas disponibles para que paralelamente el cliente pueda realizar pruebas de validación (UAT). De esta manera se logrará asegurar que tanto la funcionalidad como la usabilidad de cada avance cumplan con las expectativas.

# 2.8 Alcances y limitaciones
## 2.8.1. Alcance obligatorio del Mínimo Producto Viable (MVP)
El alcance contempla entregar una PWA funcional que centralice maquinaria, gestione recordatorios, registre eventos y permita contacto ágil con distribuidores, con calidad verificada vía unit tests (Jest), sanitización manual y UAT en demos.

### Requerimientos incluidos:
- Gestión de usuarios & acceso
	- RF-001 Registro de usuarios
	- RF-002 Login - autenticación/sesión
	- RF-003 Cierre de sesión
	- RF-004 Recuperación de contraseña (si complica, puede degradarse a post-MVP; ver notas)

- Maquinaria
	- RF-005 Registro de maquinaria (datos técnicos + contacto de distribuidor)
	- RF-006 Edición de datos/estado con historial de cambios

- Mantenimiento & eventos
	- RF-007 Programación de mantenimiento (preventivo/correctivo)
	- RF-008 Registro de evento de maquinaria (mantenimiento/incidente/falla/detención)
	- RF-009 Historial unificado de mantenimientos/incidencias/QuickChecks

- Alertas & notificaciones
	- RF-010 Alertas de mantenimiento (generación/envío por fecha)

- QuickCheck
	- RF-011 QuickCheck de seguridad (checklist y registro en historial)

- Comunicaciones & notificaciones
	- RF-015 Comunicación con distribuidores vía medios nativos (tel/SMS/email/WhatsApp link)
	- RF-016 Centro de notificaciones (bandeja unificada)
	- RF-017 Aviso de QuickCheck no aprobado (pequeño y descartable si no cierran tiempos; “conditional must”)

## 2.8.2. Alcance deseado del MVP
Incluyendo los requerimientos/funcionalidades del alcance obligatorio, el alcance deseado agrega las funcionalidades complementarias que serían implementadas si el cronograma y estado del proyecto lo permite. Estos ítems no comprometen los Must. Si hay riesgo en fechas, se prioriza terminar Must con su respectiva calidad.

### Requerimientos incluidos:
- Repuestos (básico)
	- RF-012 Registrar repuestos por máquina
	- RF-013 Ver lista de repuestos por máquina
	- RF-014 Modificar detalles de repuestos

	Solo CRUD simple asociado a máquina. Gestión de stock, reposición automática o pedidos centralizados quedan fuera (ver sección 2.8.3.).

- Productividad & UX
	- RF-018 Búsqueda y filtrado global básico
	- RF-019 Centro de ayuda y guías rápidas (ayuda inline / mini-tutoriales)
	- RF-020 Multilenguaje (infra i18n preparada y al menos 1 idioma adicional si el tiempo alcanza)

## 2.8.3. Elementos fuera del alcance del MVP
- Integración con sistemas externos.
La conexión con ERP, CRM, software contable o plataformas de terceros no se incluirá en esta versión. Se asegura, sin embargo, una arquitectura escalable que permita incorporar estas integraciones en futuras fases.

- Difusión y marketing de la aplicación.
Las tareas de promoción, publicidad y estrategias de adquisición de usuarios estarán fuera del alcance del proyecto. La difusión y comunicación del producto recaerán en el cliente o en un equipo de marketing designado.

- Modelos de monetización y sistema de pagos.
No se definirán ni implementarán modelos de negocio, suscripciones o pasarelas de pago (Stripe, PayPal, etc.). El MVP será de uso libre y demostrativo, sin mecanismos de cobro activos.

- Sitio web institucional o portal público.
La creación de un sitio web o landing page informativa se considerará luego de obtener una versión estable y validada por el cliente y personal académico.

- Módulos avanzados de analítica y reportes.
El desarrollo de dashboards estadísticos, métricas o exportaciones (PDF/CSV) queda fuera del alcance inicial. El foco estará en validar la funcionalidad central del sistema.

- Funcionalidad offline completa.
Aunque la app será una PWA y se desea tener operatividad fuera de línea, en esta primera versión no incluirá persistencia total de datos ni sincronización en diferido debido al costo de desarrollo y complejidad. La primera versión requerirá conexión activa para operar.

- Integración con sistemas de mensajería externos.
La app no se conectará con APIs externas de mensajería (Twilio, WhatsApp Business API, SendGrid, etc.). Los contactos se realizarán mediante medios nativos del dispositivo o simulaciones internas.

- Módulo de inventario avanzado o gestión de stock.
El MVP solo permitirá registrar, visualizar y modificar datos básicos de repuestos asociados a una máquina. No incluirá gestión de stock, reposición automática ni pedidos centralizados.

- Sistema de monitoreo y telemetría
El MVP no incluirá un sistema de monitoreo de actividad, métricas de uso ni registro avanzado de logs o alertas automáticas.
Estas herramientas se implementarán en una fase posterior, una vez validada la estabilidad y aceptación de la solución.

## 2.8.4. Consideraciones generales
El MVP se enfocará exclusivamente en las funcionalidades críticas y probadas.
Las optimizaciones de rendimiento, monitoreo avanzado y automatizaciones mejoradas de CI/CD se contemplarán en versiones posteriores.
Las funcionalidades clasificadas como “Could Have” se desarrollarán solo si el cronograma y la estabilidad lo permiten.
