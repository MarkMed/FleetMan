# Infrastructure Package - Servicios Externos

## 📋 Propósito

El paquete `infra` implementa **adapters para servicios externos** que no son base de datos, como email, SMS, WhatsApp, scheduler, logging y reloj del sistema. Proporciona implementaciones concretas de los puertos definidos en el dominio para comunicación con el mundo exterior.

## 🎯 Principios Arquitectónicos

- **Adapter Pattern**: Adapta APIs externas a las interfaces del dominio
- **Vendor Independence**: Fácil cambio de proveedores (SendGrid → AWS SES)
- **Dependency Inversion**: Implementa puertos definidos en el dominio
- **Resilience**: Manejo de fallos y retry logic
- **Observability**: Logging y métricas para monitoreo

## 📁 Estructura de Servicios

### `/communication`
Servicios de comunicación externa:

#### `email.service.ts`
Implementa `IEmailService` para envío de emails:
```typescript
export class EmailService implements IEmailService {
  constructor(
    private provider: SendGridService | AWSSeService,
    private templateEngine: TemplateEngine,
    private logger: ILogger
  ) {}

  async sendEmail(request: EmailRequest): Promise<Result<void, CommunicationError>> {
    try {
      const rendered = await this.templateEngine.render(request.template, request.data);
      await this.provider.send({
        to: request.to,
        subject: request.subject,
        html: rendered
      });
      return ok(undefined);
    } catch (error) {
      this.logger.error('Failed to send email', { error, request });
      return err(new CommunicationError('Email sending failed', error));
    }
  }
}
```

#### `sms.service.ts`
Implementa `ISMSService` para mensajes SMS:
- Integración con Twilio/AWS SNS
- Validación de números internacionales
- Rate limiting y retry logic

#### `whatsapp.service.ts`
Implementa `IWhatsAppService` para mensajes WhatsApp:
- Deep links para abrir conversaciones
- Templates de mensajes predefinidos
- Tracking de entrega

### `/scheduling`
Servicios de programación y tareas:

#### `scheduler.service.ts`
Implementa `ISchedulerService` usando node-cron:
```typescript
export class SchedulerService implements ISchedulerService {
  private jobs = new Map<string, ScheduledTask>();

  async scheduleRecurring(
    id: string, 
    cronExpression: string, 
    task: () => Promise<void>
  ): Promise<Result<void, SchedulingError>> {
    try {
      const job = cron.schedule(cronExpression, task, { scheduled: false });
      this.jobs.set(id, job);
      job.start();
      return ok(undefined);
    } catch (error) {
      return err(new SchedulingError('Failed to schedule task', error));
    }
  }

  async cancelJob(id: string): Promise<void> {
    const job = this.jobs.get(id);
    if (job) {
      job.stop();
      this.jobs.delete(id);
    }
  }
}
```

#### `background-jobs.service.ts`
Para tareas en background (Bull/Agenda):
- Queue management
- Job retry policies
- Progress tracking

### `/observability`
Servicios para monitoreo y observabilidad:

#### `logger.service.ts`
Implementa `ILogger` con structured logging:
```typescript
export class LoggerService implements ILogger {
  constructor(
    private winston: WinstonLogger,
    private context: string = 'FleetMan'
  ) {}

  info(message: string, meta?: Record<string, any>): void {
    this.winston.info(message, {
      context: this.context,
      timestamp: new Date().toISOString(),
      ...meta
    });
  }

  error(message: string, meta?: Record<string, any>): void {
    this.winston.error(message, {
      context: this.context,
      timestamp: new Date().toISOString(),
      error: meta?.error?.stack,
      ...meta
    });
  }
}
```

#### `metrics.service.ts`
Para métricas y telemetría:
- Custom metrics for business events
- Performance monitoring
- Health checks

### `/system`
Servicios del sistema:

#### `clock.service.ts`
Implementa `IClock` para manejo del tiempo:
```typescript
export class ClockService implements IClock {
  now(): Date {
    return new Date();
  }

  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  isAfter(date1: Date, date2: Date): boolean {
    return date1.getTime() > date2.getTime();
  }
}
```

#### `id-generator.service.ts`
Para generación de IDs únicos:
```typescript
export class IdGeneratorService implements IIdGenerator {
  generateUserId(): UserId {
    return new UserId(nanoid());
  }

  generateMachineId(): MachineId {
    return new MachineId(nanoid());
  }
}
```

### `/storage`
Servicios de almacenamiento:

#### `file-storage.service.ts`
Para archivos (AWS S3/Azure Blob):
```typescript
export class FileStorageService implements IFileStorage {
  async uploadFile(
    file: Buffer, 
    key: string, 
    contentType: string
  ): Promise<Result<FileUploadResponse, StorageError>> {
    try {
      const result = await this.s3Client.upload({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType
      }).promise();

      return ok({
        url: result.Location,
        key: result.Key
      });
    } catch (error) {
      return err(new StorageError('File upload failed', error));
    }
  }
}
```

## 🛠 Patterns Implementados

### Circuit Breaker
```typescript
export class CircuitBreaker {
  private failures = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private nextAttempt = Date.now();

  async execute<T>(operation: () => Promise<T>): Promise<Result<T, CircuitBreakerError>> {
    if (this.state === 'open') {
      if (Date.now() < this.nextAttempt) {
        return err(new CircuitBreakerError('Circuit breaker is open'));
      }
      this.state = 'half-open';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return ok(result);
    } catch (error) {
      this.onFailure();
      return err(new CircuitBreakerError('Operation failed', error));
    }
  }
}
```

### Retry with Exponential Backoff
```typescript
export class RetryPolicy {
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<Result<T, RetryError>> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        return ok(result);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) break;
        
        const delay = baseDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    return err(new RetryError('Max retries exceeded', lastError));
  }
}
```

### Health Checks
```typescript
export class HealthCheckService {
  private checks: Map<string, HealthCheck> = new Map();

  register(name: string, check: HealthCheck): void {
    this.checks.set(name, check);
  }

  async checkAll(): Promise<HealthStatus> {
    const results: Record<string, boolean> = {};
    let isHealthy = true;

    for (const [name, check] of this.checks) {
      try {
        await check.execute();
        results[name] = true;
      } catch (error) {
        results[name] = false;
        isHealthy = false;
      }
    }

    return {
      isHealthy,
      checks: results,
      timestamp: new Date().toISOString()
    };
  }
}
```

## 🔧 Configuración

### Environment-based Configuration
```typescript
export class InfraConfig {
  static fromEnv(): InfraConfig {
    return {
      email: {
        provider: process.env.EMAIL_PROVIDER || 'sendgrid',
        apiKey: process.env.EMAIL_API_KEY!,
        fromAddress: process.env.EMAIL_FROM_ADDRESS!
      },
      sms: {
        provider: process.env.SMS_PROVIDER || 'twilio',
        accountSid: process.env.TWILIO_ACCOUNT_SID!,
        authToken: process.env.TWILIO_AUTH_TOKEN!
      },
      storage: {
        provider: process.env.STORAGE_PROVIDER || 'aws-s3',
        bucketName: process.env.S3_BUCKET_NAME!,
        region: process.env.AWS_REGION || 'us-east-1'
      }
    };
  }
}
```

## 🚫 Qué NO va en este paquete

- ❌ Lógica de negocio (eso va en domain)
- ❌ Persistencia de datos (eso va en persistence)
- ❌ Controladores HTTP (eso va en apps/backend)
- ❌ Validaciones de dominio

## 🔄 Dependencias

```typescript
// Depende de:
import { IEmailService, ILogger } from '@packages/domain';

// Puede usar:
import { Result, ok, err } from '@packages/shared';

// NO depende de:
// - @packages/persistence
// - @packages/contracts
```

## 📚 Referencias

- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Retry Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/retry)