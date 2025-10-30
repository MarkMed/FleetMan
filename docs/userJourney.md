# User Journey - FleetMan

## 1. Flujo de Autenticación y Navegación Inicial

```mermaid
flowchart TD
    START[App Launch] --> AUTH{¿Usuario autenticado?}
    AUTH -->|No| LOGIN[Login/Registro]
    AUTH -->|Sí| DASH[Dashboard]
    LOGIN --> REGISTER[Formulario Registro<br/>#40;Email, Contraseña, Rol#41;]
    LOGIN --> SIGNIN[<b>Formulario Login</b><br/>#40;Email, Contraseña#41;]
    LOGIN --> FORGOT[Recuperar Contraseña]
	FORGOT --> SIGNIN
    
    REGISTER --> VERIFY[Verificación Email]
    VERIFY --> DASH
    SIGNIN --> DASH
    
    DASH --> MACHINES[Mis Máquinas]
    DASH --> QUICKACTIONS[QuickActions]
    DASH --> NOTIFICATIONS[Centro de Notificaciones]
    DASH --> MENU[Menú]
    
    MENU --> ACCOUNT[Mi Cuenta]
    MENU --> SETTINGS[Configuración]
    MENU --> LOGOUT[Cerrar Sesión]
    
    LOGOUT --> LOGIN
```

## 2. QuickActions Dashboard

```mermaid
flowchart TD
    DASH[Dashboard] --> QA_TRIGGER[QuickActions Button]
    QA_TRIGGER --> QA_OVERLAY[Overlay con Blur<br/>+ Panel de Acciones]
    
    QA_OVERLAY --> QA_OPTIONS{Seleccionar Acción}
    QA_OPTIONS --> QA_QUICKCHECK[🔍 QuickCheck]
    QA_OPTIONS --> QA_EVENT[📝 Reportar Evento]
    QA_OPTIONS --> QA_MACHINE[➕ Registrar Máquina]
    QA_OPTIONS --> QA_CLOSE[❌ Cerrar]
    QA_OPTIONS --> QA_SPARE[🔧 Solicitar Repuesto]
    
    %% Registrar Máquina - Redirect directo
    QA_MACHINE --> MACHINE_WIZARD[Formulario Wizard<br/>Registrar Máquina]
    MACHINE_WIZARD --> MACHINE_DETAIL[Detalle de Máquina<br/>nueva máquina registrada]
    MACHINE_DETAIL --> MACHINES[Mis Máquinas]
    MACHINES --> DASH
    
    %% Acciones que requieren selección de máquina
    QA_QUICKCHECK --> SELECT_MODAL[Modal: Seleccionar Máquina]
    QA_EVENT --> SELECT_MODAL
    QA_SPARE --> SELECT_MODAL
    
    SELECT_MODAL --> MACHINE_LIST["Lista de Máquinas del Usuario<br/>📋 Cards compactas<br/>🔍 Filtro por nombre/modelo"]
    MACHINE_LIST --> MACHINE_SELECTED{Máquina seleccionada}
    
    %% Redirecciones contextualizadas
    MACHINE_SELECTED -->|QuickCheck| QC_CONTEXTUAL[QuickCheck<br/>para máquina seleccionada]
    MACHINE_SELECTED -->|Evento| EVENT_CONTEXTUAL[Registrar Evento<br/>para máquina seleccionada]
    MACHINE_SELECTED -->|Repuesto| SPARE_CONTEXTUAL[Solicitar Repuesto<br/>para máquina seleccionada]
    
    %% Flujos de salida
    QC_CONTEXTUAL --> QC_FORM[Formulario CheckList]
    EVENT_CONTEXTUAL --> EVENT_FORM[Formulario de Evento]
    SPARE_CONTEXTUAL --> SPARE_FORM[Formulario de Repuesto]
    
    QC_FORM --> HISTORY[Historial de Máquina]
    EVENT_FORM --> HISTORY
    SPARE_FORM --> SPARE_LIST[Lista de Repuestos]
    
    HISTORY --> DETAIL[Detalle de Máquina]
    SPARE_LIST --> DETAIL
    
    %% Navegación de retorno
    QA_CLOSE --> DASH
    DETAIL -.-> MACHINES[Mis Máquinas]
    MACHINES -.-> DASH
    
    %% Overlay interactions
    QA_OVERLAY -.-> |Click fuera| DASH
```

## 3. Mis Máquinas

```mermaid
flowchart TD
    DASH[Dashboard] --> MACHINES[**Mis Máquinas**<br/>*#40;Lísta de máquinas#41;*]
    MACHINES --> DASH
    MACHINES --> CREATE[CTA: ➕ Registrar Máquina]
    MACHINES --> |Selecciona máquina| DETAIL["Detalle de Máquina<br/>Tabs: Overview · Recordatorios · Repuestos · Historial"]
    
    CREATE --> WIZARD["Formulario Wizard Registrar Máquina<br/>Marca/Modelo/Serie/Alias/Año<br/>Contacto de distribuidor #40;opcional#41;"]
    WIZARD -->|Validación OK| DETAIL
    WIZARD -->|Error de validación| WIZARD
    
    DETAIL --> MACHINES
    DETAIL --> EDIT[Editar Máquina]
    DETAIL --> CONTACT[Contactar Distribuidor]
    DETAIL --> QUICKCHECK_MACHINE[QuickCheck]
    DETAIL --> EVENT[Registrar Evento]
    DETAIL --> REPUESTOS[Repuestos]
    
    EDIT --> EDIT_FORM[Formulario de Edición]
    EDIT_FORM --> DETAIL
    
    %% Variante Proveedor
    subgraph "Variante Proveedor"
        PROVIDER[Proveedor Dashboard] --> SELECT_CLIENT[Seleccionar Cliente de cartera]
        SELECT_CLIENT --> CREATE_FOR_CLIENT[➕ Registrar Máquina para Cliente]
        CREATE_FOR_CLIENT --> WIZARD
    end
```

## 4. QuickCheck de Seguridad

```mermaid
flowchart TD
    %% Acceso desde QuickActions
    QA_QUICKCHECK[🔍 QuickCheck desde QuickActions] --> SELECT_MACHINE[Seleccionar Máquina]
    
    %% Acceso directo desde Detalle de Máquina
    DETAIL[Detalle de Máquina] --> QC_MACHINE[QuickCheck para esta máquina]
    
    %% Flujo común
    SELECT_MACHINE --> QC_FORM[Formulario CheckList]
    QC_MACHINE --> QC_FORM
    
    QC_FORM --> CHECKLIST["Lista de Verificación:<br/>☑ Frenos<br/>☑ Direcciones<br/>☑ Item 3: Mantenimiento<br/>☑ Item X: Prevención X<br/>📝 Observaciones"]
    
    CHECKLIST --> QC_SUBMIT[Completar QuickCheck]
    CHECKLIST --> EMERGENCY_REPORT[🚨 Reportar Problema<br/>Inmediato]
    
    QC_SUBMIT --> QC_REPORT[Generar y enviar<br/>QuickCheck]
    EMERGENCY_REPORT --> QC_REPORT
    
    QC_REPORT --> QC_RESULT{¿Hay items fallidos?}
    
    QC_RESULT -->|No| QC_SUCCESS[✅ QuickCheck Aprobado]
    QC_RESULT -->|Sí| QC_FAILED[❌ QuickCheck No Aprobado<br/>⚠️Items fallidos identificados]
    
    %% Flujo común para ambos resultados
    QC_SUCCESS --> SAVE_HISTORY[Guardar en Historial]
    QC_FAILED --> SAVE_HISTORY
    QC_FAILED --> EMAIL_SMS[📧📱 Aviso Email/SMS<br/>al usuario]
    
    SAVE_HISTORY --> GEN_ALERT[Generar Alerta<br/>en Centro de Notificaciones<br/> *#40;envía notificación en app#41;*]
    
    GEN_ALERT --> BACK_TO_DETAIL[Volver a Detalle de Máquina]
    EMAIL_SMS --> BACK_TO_DETAIL
```
## 5. Gestión de Recordatorios de Mantenimiento

```mermaid
flowchart TD
    DETAIL[Detalle de Máquina] -->|presiona en opción de Recordatorios| LIST_REM[Lista de Recordatorios]
    
    FORM_REM -->|Guardar| LIST_REM
    
    LIST_REM <--> DELETE_REM[Eliminar Recordatorio]
    LIST_REM <--> REM_DETAIL_VIEW[Detalles De Recordatorio<br/>de Mantenimiento]
    REM_DETAIL_VIEW --> EDIT_REM[Editar Recordatorio]
    LIST_REM --> EDIT_REM
    EDIT_REM --> FORM_REM
    REM_DETAIL_VIEW --> DELETE_REM
    
    LIST_REM --> CREATE_REM[CTA: Nuevo recordatorio]
    CREATE_REM --> TYPE{Tipo de recordatorio}
    TYPE --> DATE_TYPE[Por fecha<br/>#40;Cada N días / Fecha fija#41;]
    TYPE --> USAGE_TYPE[Por uso<br/>#40;Cada N horas de uso#41;]
    
    DATE_TYPE --> FORM_REM["Formulario:<br/>• Nombre<br/>• Descripción<br/>• Anticipación<br/>• Tareas a realizar<br/>• Fecha<br/>• X Dato"]
    USAGE_TYPE --> FORM_REM
    
    %% Automatización del Scheduler
    FORM_REM -. Actualizar/Crear Scheduler .-> SCHEDULER_UPDATE[Scheduler Creado/Actualizado]
    SCHEDULER_UPDATE -. Cuando corresponda .-> ALERT[Generar Alerta]
    ALERT --> NOTIFICATION[Centro de Notificaciones]
```

## 6. Gestión de Repuestos

```mermaid
flowchart TD
    DETAIL[Detalle de Máquina] -->|presiona en opción de Respuestos| LIST_SPARE[Lista de Repuestos]
    
    FORM_SPARE -->|Guardar| LIST_SPARE
    
    LIST_SPARE <--> DELETE_SPARE[Eliminar Repuesto]
    LIST_SPARE <--> VIEW_SPARE[Detalles del Respuesto]
    VIEW_SPARE --> EDIT_SPARE
    LIST_SPARE --> EDIT_SPARE[Editar Repuesto]
    EDIT_SPARE --> FORM_SPARE
    VIEW_SPARE --> DELETE_SPARE
    
    LIST_SPARE --> ADD_SPARE[CTA: Agregar repuesto]
    ADD_SPARE --> FORM_SPARE["Formulario Repuesto<br/>• Nombre<br/>• Categoría<br/>• Cantidad<br/>• Estado<br/>• Notas"]
```

## 7. Registro de Eventos y Mantenimientos

```mermaid
flowchart TD
    DETAIL[Detalle de Máquina] --> EVENT[Registrar Evento]
    DETAIL --> TAB_HIST[Tab: Historial]
    
    EVENT --> EVENT_TYPE{Tipo de Evento}
    EVENT_TYPE --> MAINT[Mantenimiento<br/>#40;Preventivo/Correctivo#41;]
    EVENT_TYPE --> INCIDENT[Incidente]
    EVENT_TYPE --> FAILURE[Falla]
    EVENT_TYPE --> DOWNTIME[Detención]
    
    MAINT --> MAINT_FORM["Formulario Mantenimiento<br/>• Fecha/Hora<br/>• Tipo<br/>• Descripción<br/>• Técnico responsable<br/>• Repuestos usados<br/>• Tiempo empleado"]
    
    INCIDENT --> INCIDENT_FORM["Formulario Incidente<br/>• Fecha/Hora<br/>• Descripción<br/>• Severidad<br/>• Acciones tomadas"]
    
    FAILURE --> FAILURE_FORM["Formulario Falla<br/>• Fecha/Hora<br/>• Componente afectado<br/>• Descripción<br/>• Causa probable<br/>• Solución aplicada"]
    
    DOWNTIME --> DOWNTIME_FORM["Formulario Detención<br/>• Fecha/Hora inicio<br/>• Fecha/Hora fin<br/>• Motivo<br/>• Impacto operacional"]
    
    MAINT_FORM --> SAVE_EVENT[Guardar en Historial]
    INCIDENT_FORM --> SAVE_EVENT
    FAILURE_FORM --> SAVE_EVENT
    DOWNTIME_FORM --> SAVE_EVENT
    
    SAVE_EVENT --> TIMELINE[Timeline de Eventos]
    TIMELINE --> TAB_HIST
    
    %% Algunos eventos pueden generar notificaciones
    SAVE_EVENT -. Eventos críticos .-> AUTO_NOTIF[Notificación Automática]
    AUTO_NOTIF --> NOTIFICATION[Centro de Notificaciones]
```

## 8. Centro de Notificaciones y Comunicaciones

```mermaid
flowchart TD
    DASH[Dashboard] --> NOTIF_CENTER[Centro de Notificaciones]
    
    %% Fuentes de notificaciones
    REMINDERS[Recordatorios de Mantenimiento] -. Scheduler .-> GEN_NOTIF[Generar Notificación]
    QC_FAILED[QuickCheck No Aprobado] -. Automático .-> GEN_NOTIF
    CRITICAL_EVENTS[Eventos Críticos] -. Automático .-> GEN_NOTIF
    
    GEN_NOTIF --> NOTIF_CENTER
    
    NOTIF_CENTER --> NOTIF_LIST["Lista de Notificaciones<br/>🔴 Críticas<br/>🟡 Advertencias<br/>🔵 Informativas"]
    
    NOTIF_LIST --> NOTIF_DETAIL[Ver Detalle de Notificación]
    NOTIF_LIST --> MARK_READ[Marcar como leída]
    NOTIF_LIST --> NOTIF_ACTION[Acción directa]
    
    NOTIF_DETAIL --> MACHINE_CONTEXT[Ir a Máquina relacionada]
    NOTIF_ACTION --> QUICK_FIX[Resolución rápida]
    NOTIF_ACTION --> CONTACT_SUPPORT[Contactar Soporte]
    
    MACHINE_CONTEXT --> DETAIL[Detalle de Máquina]
    
    %% Comunicaciones
    DETAIL --> CONTACT_DIST[Contactar Distribuidor]
    CONTACT_SUPPORT --> CONTACT_DIST
    
    CONTACT_DIST --> CONTACT_METHOD{Método disponible}
    CONTACT_METHOD --> PHONE[📞 Llamar]
    CONTACT_METHOD --> WHATSAPP[💬 WhatsApp]
    CONTACT_METHOD --> EMAIL[📧 Email]
    CONTACT_METHOD --> INTERNAL[💼 Mensaje interno<br/>#40;si distribuidor registrado#41;]
    
    INTERNAL --> CHAT[Chat interno]
    CHAT --> NOTIF_CENTER
```

## 9. Flujo Completo Integrado - Vista de Alto Nivel

```mermaid
flowchart TD
    START[🚀 Inicio App] --> AUTH[🔐 Autenticación]
    AUTH --> DASH[📊 Dashboard]
    
    DASH --> MACHINES[🏭 Mis Máquinas]
    DASH --> QA[⚡ QuickActions]
    DASH --> NOTIF[🔔 Notificaciones]
    
    MACHINES --> DETAIL[📋 Detalle Máquina]
    DETAIL --> REMINDERS[⏰ Recordatorios]
    DETAIL --> SPARES[🔧 Repuestos]
    DETAIL --> HISTORY[📈 Historial]
    DETAIL --> EVENTS[📝 Eventos]
    
    QC --> QC_RESULT[Resultado QuickCheck]
    REMINDERS --> ALERTS[🚨 Alertas]
    EVENTS --> ALERTS
    QC_RESULT --> ALERTS
    
    ALERTS --> NOTIF
    NOTIF --> ACTIONS[🎯 Acciones]
    ACTIONS --> CONTACT[📞 Comunicación]
    
    %% Navegación de retorno
    DETAIL -.-> MACHINES[Mis Máquinas]
    MACHINES -.-> DASH
    NOTIF -.-> DASH
    QC -.-> DASH
    CONTACT -.-> DETAIL
```