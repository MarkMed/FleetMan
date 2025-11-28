# Interfaces - External Adapters

Este directorio contiene adaptadores para interfaces externas que NO son HTTP REST (que van en /controllers y /routes).

## Propósito
- **Adaptadores** para servicios externos al protocolo HTTP
- **Jobs/Cron** para tareas programadas
- **WebSockets** para comunicación en tiempo real (futuro)
- **Message Queues** para procesamiento asíncrono (futuro)
- **CLI Commands** para scripts administrativos (futuro)

## Estructura actual

### **jobs/** - Tareas programadas
- `maintenance-scheduler.job.ts` - Verificar recordatorios de mantenimiento
- `notification-sender.job.ts` - Envío de notificaciones pendientes
- `data-cleanup.job.ts` - Limpieza periódica de datos

## Diferencia con /controllers

### **📁 /controllers + /routes** 
- Maneja requests HTTP REST
- Responde con JSON
- Autenticación via JWT
- Validación con Zod

### **📁 /interfaces**
- Adaptadores NO-HTTP
- Cron jobs, workers, CLI
- Eventos del sistema
- Integraciones externas

## Responsabilidades

### ✅ **Lo que SÍ debe ir aquí:**
```typescript
// Cron job que se ejecuta cada hora
export class MaintenanceSchedulerJob {
  @cron('0 * * * *')
  async checkPendingMaintenance() {
    // Lógica de verificación
  }
}
```

### ❌ **Lo que NO debe ir aquí:**
```typescript
// ❌ Esto va en /controllers (por ej)
export class AuthController {
  @post('/login')
  async login(req: Request, res: Response) {
    // ...
  }
}
```

## Patrón de implementación

```typescript
// interfaces/jobs/maintenance-scheduler.job.ts
import { inject, injectable } from 'tsyringe';
import { CheckPendingMaintenanceUseCase } from '../../application/maintenance';

@injectable()
export class MaintenanceSchedulerJob {
  constructor(
    @inject('CheckPendingMaintenanceUseCase')
    private checkMaintenanceUseCase: CheckPendingMaintenanceUseCase
  ) {}

  @cron('0 8 * * *') // Todos los días a las 8 AM
  async checkDailyMaintenance() {
    const result = await this.checkMaintenanceUseCase.execute();
    if (!result.isSuccess) {
      logger.error('Failed to check pending maintenance:', result.error);
    }
  }
}
```

## Integración con Use Cases

Los adapters en /interfaces NO contienen lógica de negocio, solo:
1. **Reciben** eventos/triggers externos
2. **Llaman** a los Use Cases apropiados
3. **Manejan** errores de infraestructura

```
Cron Trigger → Job → Use Case → Domain → Persistence
WebSocket → Handler → Use Case → Domain → Persistence
CLI Command → Command Handler → Use Case → Domain → Persistence
```

## Ejemplo de uso

```typescript
// Registro en DI container
container.register('MaintenanceSchedulerJob', { useClass: MaintenanceSchedulerJob });
container.register('NotificationSenderJob', { useClass: NotificationSenderJob });

// En main.ts
const maintenanceJob = container.resolve('MaintenanceSchedulerJob');
const notificationJob = container.resolve('NotificationSenderJob');

// Jobs se auto-registran con sus decoradores @cron
```