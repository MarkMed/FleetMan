# Sistema de Notificaciones por Email para Eventos de Máquina

## Overview

Sistema modular de notificaciones que envía emails automáticos cuando se crean eventos de máquina. Se integra como observador del use case `CreateMachineEvent`, permitiendo notificar a usuarios relevantes según reglas configurables por organización.

**Complejidad:** Media-Baja (4 días estimados)  
**Impacto:** Mejora comunicación proactiva sobre eventos críticos

---

## Arquitectura

### Componentes Principales

```
┌─────────────────────────────────────────────┐
│   CreateMachineEventUseCase                 │
│   ┌─────────────────────────────────────┐   │
│   │ 1. Crear evento (lógica existente) │   │
│   │ 2. Guardar en DB                    │   │
│   │ 3. sendNotificationIfNeeded() ────┐ │   │
│   └─────────────────────────────────────┘ │   │
└───────────────────────────────────────────┼───┘
                                            │
                    ┌───────────────────────▼─────────────────────┐
                    │  Verificar reglas de notificación           │
                    │  - Obtener NotificationConfig              │
                    │  - Filtrar por tipo de evento              │
                    │  - Filtrar por severidad mínima            │
                    └───────────────────┬─────────────────────────┘
                                        │
                            ┌───────────▼──────────────┐
                            │   EmailService           │
                            │   - Generar HTML         │
                            │   - Enviar vía SMTP      │
                            │   - Log errores          │
                            └──────────────────────────┘
```

### 1. EmailService (Infrastructure Layer)

**Ubicación:** `apps/backend/src/infrastructure/email/emailService.ts`

**Responsabilidades:**
- Configurar conexión SMTP con nodemailer
- Generar plantillas HTML de emails
- Enviar notificaciones sin bloquear el flujo principal
- Capturar y loguear errores sin lanzar excepciones

**Métodos principales:**
```typescript
sendMachineEventNotification(recipients: string[], eventData: MachineEventEmailData): Promise<void>
generateEventEmailTemplate(data: MachineEventEmailData): string
```

---

### 2. NotificationConfig (Domain Layer)

**Ubicación:** `apps/backend/src/domain/machine-events/notificationConfig.ts`

**Modelo de reglas configurables:**
```typescript
interface NotificationRule {
  eventTypeId?: string;      // undefined = todos los eventos
  minSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recipients: string[];      // Lista de emails
  enabled: boolean;
}

interface NotificationConfig {
  organizationId: string;
  rules: NotificationRule[];
}
```

**Persistencia:** Colección separada en MongoDB

---

### 3. NotificationConfigRepository (Infrastructure Layer)

**Ubicación:** `apps/backend/src/infrastructure/persistence/mongodb/notificationConfigRepository.ts`

**Operaciones:**
- `findByOrganization(orgId: string)`: Obtener config actual
- `update(orgId: string, config: NotificationConfig)`: Actualizar reglas
- `create(config: NotificationConfig)`: Inicializar config para nueva org

---

### 4. Integración en CreateMachineEventUseCase

**Modificaciones:**

1. Agregar dependencias en constructor:
```typescript
constructor(
  private eventRepo: IMachineEventRepository,
  private machineRepo: IMachineRepository,
  private eventTypeRepo: IMachineEventTypeRepository,
  private emailService: EmailService,              // NUEVO
  private notificationRepo: INotificationConfigRepository  // NUEVO
) {}
```

2. Agregar método privado `sendNotificationIfNeeded`:
   - Obtener config de la organización
   - Filtrar reglas aplicables (tipo + severidad)
   - Enviar email a destinatarios únicos
   - Capturar errores sin romper flujo

3. Llamar al método después de crear el evento exitosamente

---

## Flujo de Ejecución

1. **Usuario crea evento** → `POST /machine-events`
2. **Controller valida** → Llama a `CreateMachineEventUseCase.execute()`
3. **Use case crea evento** → Guarda en DB (esto SIEMPRE pasa)
4. **Use case verifica notificación** → Llama a `sendNotificationIfNeeded()`
5. **Sistema consulta reglas** → `notificationRepo.findByOrganization()`
6. **Filtra reglas aplicables:**
   - Verifica tipo de evento (si está especificado)
   - Verifica severidad mínima
7. **Si hay reglas aplicables** → Recopila destinatarios únicos
8. **EmailService envía** → Genera HTML + envía vía SMTP
9. **Si falla SMTP** → Log error, pero evento ya existe en DB

---

## Variables de Entorno

```env
# SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=fleetman@yourdomain.com
EMAIL_PASS=your_app_password
EMAIL_FROM="FleetMan Notifications <fleetman@yourdomain.com>"
```

**Nota:** Para Gmail usar App Password, no password normal.

---

## API Endpoints (Configuración)

**GET** `/api/v1/notifications/config`
- Obtener configuración actual del usuario autenticado
- Response: `NotificationConfig`

**PUT** `/api/v1/notifications/config`
- Actualizar reglas de notificación
- Body: `{ rules: NotificationRule[] }`

**POST** `/api/v1/notifications/test`
- Enviar email de prueba para verificar config SMTP
- Body: `{ testRecipient: string }`

---

## Dependencias

```bash
# Backend
pnpm add nodemailer
pnpm add -D @types/nodemailer
```

---

## Orden de Implementación

1. **EmailService** (1 día)
   - Crear servicio básico con nodemailer
   - Implementar método de envío y plantilla HTML

2. **NotificationConfig Domain Model** (0.5 días)
   - Definir interfaces y tipos
   - Crear esquema Mongoose

3. **NotificationConfigRepository** (0.5 días)
   - Implementar métodos CRUD
   - Seguir patrón de repositorios existentes

4. **Integrar en Use Case** (0.5 días)
   - Modificar constructor
   - Agregar método `sendNotificationIfNeeded`
   - Llamar después de crear evento

5. **Dependency Injection** (0.5 días)
   - Instanciar EmailService con config ENV
   - Inyectar en CreateMachineEventUseCase

6. **API Endpoints** (1 día)
   - Crear routes de configuración
   - Validación con Zod
   - Tests manuales

---

## Consideraciones Importantes

### Performance
- **No bloqueante:** Email se envía en el mismo proceso pero no afecta response HTTP
- **Rate limiting:** Limitar a 1 email cada 5 min por tipo de evento (evitar spam)
- **Futuro:** Considerar queue (Bull/Redis) para emails async

### Seguridad
- **Validar destinatarios:** Solo emails de usuarios de la organización
- **SPF/DKIM/DMARC:** Configurar en dominio para evitar spam
- **Secrets:** Credenciales SMTP en variables de entorno, nunca en código

### UX
- **Plantillas responsive:** HTML funcional en Gmail, Outlook, Apple Mail
- **Estilos inline:** Mejor compatibilidad entre clientes de email
- **Asunto claro:** `[SEVERIDAD] Tipo Evento - Nombre Máquina`

### Logging
- Log detallado en cada paso:
  - Conexión SMTP exitosa
  - Email encolado
  - Email enviado
  - Error de envío (con detalles)

### Testing
- Endpoint `/notifications/test` para verificar config SMTP
- No romper creación de eventos si email falla
- Tests unitarios para filtrado de reglas

---

## Ejemplo de Uso

### Configuración de Regla

```json
{
  "organizationId": "org_123",
  "rules": [
    {
      "minSeverity": "CRITICAL",
      "recipients": ["admin@empresa.com", "supervisor@empresa.com"],
      "enabled": true
    },
    {
      "eventTypeId": "evt_type_maintenance",
      "minSeverity": "MEDIUM",
      "recipients": ["mecanico@empresa.com"],
      "enabled": true
    }
  ]
}
```

### Email Generado

**Asunto:** `[CRITICAL] Falla de motor - Excavadora CAT 320D`

**Body:**
```
Nuevo evento de máquina

Máquina: Excavadora CAT 320D
Tipo: Falla de motor
Severidad: CRITICAL
Descripción: Motor no enciende después de mantenimiento
Fecha: 20/01/2026 14:30:00
Asignado a: Juan Pérez

[Ver detalles en FleetMan]
```

---

## Extensibilidad Futura

El sistema está diseñado para ser extensible:

1. **Múltiples canales:** Agregar SMS, Slack, WhatsApp siguiendo el mismo patrón
2. **Plantillas personalizables:** Permitir que cada org configure sus plantillas
3. **Webhooks:** Notificar a sistemas externos (ERP, CRM)
4. **Digest diario:** Enviar resumen de eventos del día en un solo email
5. **Priorización:** Queue con prioridades (CRITICAL se envía inmediato, LOW en batch)

---

## Referencias

- [Machine Events System Architecture](./machine-events-system-architecture.md)
- [Real-time Notification System](./Real-time-Notification-System.md)
- [Clean Architecture Flow](./clean-architecture-flow.md)
