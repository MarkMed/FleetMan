# UseCases Directory

## Propósito
Implementa los casos de uso de la aplicación siguiendo los principios de Clean Architecture. Los use cases encapsulan la lógica de negocio específica de la aplicación y orquestan la interacción entre entidades del dominio y servicios de infraestructura.

## Concepto de Use Case

### Responsabilidades
1. **Lógica de Negocio**: Implementar reglas específicas de la aplicación
2. **Orquestación**: Coordinar servicios, repositories y validaciones
3. **Transformación**: Convertir entre DTOs y entidades del dominio
4. **Validación**: Aplicar validaciones de negocio antes de operaciones
5. **Error Handling**: Manejar errores de forma consistente

### Principios
- **Single Responsibility**: Un use case por operación de negocio
- **Dependency Inversion**: Depender de abstracciones, no implementaciones
- **Testability**: Fácil de testear unitariamente
- **Reusability**: Reutilizable desde diferentes interfaces (web, mobile, CLI)

## Estructura de Archivos

```
useCases/
├── index.ts                    # Barrel exports
├── auth/
│   ├── LoginUseCase.ts         # Autenticación de usuario
│   ├── LogoutUseCase.ts        # Cerrar sesión
│   ├── RegisterUseCase.ts      # Registro de nuevo usuario
│   ├── RefreshTokenUseCase.ts  # Renovar token de acceso
│   ├── ForgotPasswordUseCase.ts # Solicitar reset de contraseña
│   ├── ResetPasswordUseCase.ts # Cambiar contraseña con token
│   └── index.ts                # Exports de auth use cases
├── machines/
│   ├── GetMachinesUseCase.ts   # Obtener lista de máquinas
│   ├── GetMachineByIdUseCase.ts # Obtener máquina por ID
│   ├── CreateMachineUseCase.ts # Crear nueva máquina
│   ├── UpdateMachineUseCase.ts # Actualizar máquina existente
│   ├── DeleteMachineUseCase.ts # Eliminar máquina
│   ├── UploadMachineImageUseCase.ts # Subir imagen de máquina
│   ├── SearchMachinesUseCase.ts # Búsqueda avanzada de máquinas
│   └── index.ts                # Exports de machine use cases
├── maintenance/
│   ├── GetMaintenanceScheduleUseCase.ts # Obtener calendario de mantenimiento
│   ├── CreateMaintenanceUseCase.ts # Programar mantenimiento
│   ├── UpdateMaintenanceUseCase.ts # Actualizar mantenimiento
│   ├── CompleteMaintenanceUseCase.ts # Marcar mantenimiento como completado
│   ├── GetMaintenanceHistoryUseCase.ts # Historial de mantenimientos
│   ├── GetMaintenanceStatsUseCase.ts # Estadísticas de mantenimiento
│   └── index.ts                # Exports de maintenance use cases
├── quickcheck/
│   ├── CreateQuickCheckUseCase.ts # Crear chequeo rápido
│   ├── GetQuickCheckHistoryUseCase.ts # Historial de chequeos
│   ├── GetQuickCheckStatsUseCase.ts # Estadísticas de chequeos
│   ├── GetQuickCheckTemplateUseCase.ts # Templates de checklists
│   └── index.ts                # Exports de quickcheck use cases
├── notifications/
│   ├── GetNotificationsUseCase.ts # Obtener notificaciones del usuario
│   ├── MarkNotificationReadUseCase.ts # Marcar notificación como leída
│   ├── CreateNotificationUseCase.ts # Crear nueva notificación
│   ├── GetNotificationSettingsUseCase.ts # Configuración de notificaciones
│   ├── UpdateNotificationSettingsUseCase.ts # Actualizar configuración
│   └── index.ts                # Exports de notification use cases
├── dashboard/
│   ├── GetDashboardStatsUseCase.ts # Estadísticas del dashboard
│   ├── GetRecentActivityUseCase.ts # Actividad reciente
│   ├── GetAlertsUseCase.ts     # Alertas críticas
│   └── index.ts                # Exports de dashboard use cases
├── reports/
│   ├── GenerateMaintenanceReportUseCase.ts # Reporte de mantenimiento
│   ├── GenerateQuickCheckReportUseCase.ts # Reporte de chequeos
│   ├── ExportDataUseCase.ts    # Exportar datos a Excel/PDF
│   └── index.ts                # Exports de report use cases
├── shared/
│   ├── BaseUseCase.ts          # Clase base para use cases
│   ├── UseCaseTypes.ts         # Tipos comunes
│   ├── ValidationUseCase.ts    # Use case base para validaciones
│   └── index.ts                # Exports de shared
└── types/
    ├── UseCaseResult.ts        # Tipos de resultado
    ├── UseCaseError.ts         # Tipos de error
    └── index.ts                # Exports de tipos
```

## Use Cases Principales

### `LoginUseCase.ts`
**Responsabilidades**:
- Validar credenciales de entrada
- Autenticar con el servicio de auth
- Manejar tokens y sesión
- Registrar evento de login

```typescript
export class LoginUseCase extends BaseUseCase<LoginRequest, AuthResponse> {
  constructor(
    private authService: AuthService,
    private userRepository: UserRepository,
    private auditService: AuditService
  ) {
    super();
  }
  
  async execute(request: LoginRequest): Promise<UseCaseResult<AuthResponse>> {
    try {
      // 1. Validar entrada
      const validationResult = this.validateInput(request);
      if (!validationResult.isValid) {
        return Failure(new ValidationError(validationResult.errors));
      }
      
      // 2. Autenticar
      const authResult = await this.authService.login({
        email: request.email,
        password: request.password
      });
      
      if (!authResult.isSuccess) {
        return Failure(new AuthenticationError('Credenciales inválidas'));
      }
      
      // 3. Obtener datos del usuario
      const user = await this.userRepository.findById(authResult.data.userId);
      if (!user) {
        return Failure(new NotFoundError('Usuario no encontrado'));
      }
      
      // 4. Registrar evento de auditoría
      await this.auditService.logEvent({
        type: 'USER_LOGIN',
        userId: user.id,
        timestamp: new Date(),
        metadata: { ip: request.ip }
      });
      
      // 5. Construir respuesta
      const response: AuthResponse = {
        user,
        token: authResult.data.token,
        refreshToken: authResult.data.refreshToken,
        expiresAt: authResult.data.expiresAt
      };
      
      return Success(response);
      
    } catch (error) {
      return Failure(new UnexpectedError(error.message));
    }
  }
  
  private validateInput(request: LoginRequest): ValidationResult {
    const schema = z.object({
      email: z.string().email('Email inválido'),
      password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres')
    });
    
    return this.validateWithSchema(schema, request);
  }
}
```

### `CreateMachineUseCase.ts`
**Responsabilidades**:
- Validar datos de la nueva máquina
- Verificar unicidad de serial number
- Crear máquina en el repositorio
- Notificar a usuarios relevantes

```typescript
export class CreateMachineUseCase extends BaseUseCase<CreateMachineRequest, Machine> {
  constructor(
    private machineRepository: MachineRepository,
    private machineTypeRepository: MachineTypeRepository,
    private notificationService: NotificationService,
    private fileUploadService: FileUploadService
  ) {
    super();
  }
  
  async execute(request: CreateMachineRequest): Promise<UseCaseResult<Machine>> {
    try {
      // 1. Validar entrada
      const validationResult = await this.validateInput(request);
      if (!validationResult.isValid) {
        return Failure(new ValidationError(validationResult.errors));
      }
      
      // 2. Verificar que el tipo de máquina existe
      const machineType = await this.machineTypeRepository.findById(request.machineTypeId);
      if (!machineType) {
        return Failure(new NotFoundError('Tipo de máquina no encontrado'));
      }
      
      // 3. Verificar unicidad del serial number
      const existingMachine = await this.machineRepository.findBySerialNumber(request.serialNumber);
      if (existingMachine) {
        return Failure(new ConflictError('Ya existe una máquina con ese número de serie'));
      }
      
      // 4. Subir imagen si se proporciona
      let imageUrl: string | undefined;
      if (request.image) {
        const uploadResult = await this.fileUploadService.uploadImage(request.image);
        if (uploadResult.isSuccess) {
          imageUrl = uploadResult.data.url;
        }
      }
      
      // 5. Crear la máquina
      const machine = Machine.create({
        ...request,
        machineType,
        imageUrl,
        status: MachineStatus.ACTIVE,
        operatingHours: 0
      });
      
      const savedMachine = await this.machineRepository.save(machine);
      
      // 6. Enviar notificación
      await this.notificationService.notifyNewMachine({
        machine: savedMachine,
        createdBy: request.createdBy
      });
      
      return Success(savedMachine);
      
    } catch (error) {
      return Failure(new UnexpectedError(error.message));
    }
  }
  
  private async validateInput(request: CreateMachineRequest): Promise<ValidationResult> {
    const schema = z.object({
      name: z.string().min(1, 'Nombre es requerido').max(100, 'Nombre muy largo'),
      serialNumber: z.string().min(1, 'Número de serie es requerido'),
      model: z.string().min(1, 'Modelo es requerido'),
      brand: z.string().min(1, 'Marca es requerida'),
      machineTypeId: z.string().uuid('ID de tipo de máquina inválido'),
      acquisitionDate: z.date().max(new Date(), 'Fecha de adquisición no puede ser futura'),
      warrantyExpiryDate: z.date().optional(),
      location: z.string().optional(),
      notes: z.string().max(1000, 'Notas muy largas').optional()
    });
    
    return this.validateWithSchema(schema, request);
  }
}
```

### `GetDashboardStatsUseCase.ts`
**Responsabilidades**:
- Agregar estadísticas de múltiples dominios
- Calcular métricas en tiempo real
- Aplicar filtros de permisos de usuario

```typescript
export class GetDashboardStatsUseCase extends BaseUseCase<GetDashboardStatsRequest, DashboardStats> {
  constructor(
    private machineRepository: MachineRepository,
    private maintenanceRepository: MaintenanceRepository,
    private quickCheckRepository: QuickCheckRepository,
    private notificationRepository: NotificationRepository
  ) {
    super();
  }
  
  async execute(request: GetDashboardStatsRequest): Promise<UseCaseResult<DashboardStats>> {
    try {
      // Ejecutar queries en paralelo para mejor performance
      const [
        totalMachines,
        activeMachines,
        maintenanceMachines,
        pendingMaintenances,
        criticalAlerts,
        todayChecks,
        unreadNotifications
      ] = await Promise.all([
        this.machineRepository.count(),
        this.machineRepository.countByStatus(MachineStatus.ACTIVE),
        this.machineRepository.countByStatus(MachineStatus.MAINTENANCE),
        this.maintenanceRepository.countPending(),
        this.notificationRepository.countCritical(),
        this.quickCheckRepository.countToday(),
        this.notificationRepository.countUnread(request.userId)
      ]);
      
      // Calcular métricas derivadas
      const maintenanceRate = totalMachines > 0 ? (maintenanceMachines / totalMachines) * 100 : 0;
      const availabilityRate = totalMachines > 0 ? (activeMachines / totalMachines) * 100 : 0;
      
      const stats: DashboardStats = {
        machines: {
          total: totalMachines,
          active: activeMachines,
          inMaintenance: maintenanceMachines,
          outOfService: totalMachines - activeMachines - maintenanceMachines
        },
        maintenance: {
          pending: pendingMaintenances,
          rate: maintenanceRate
        },
        quickChecks: {
          today: todayChecks
        },
        alerts: {
          critical: criticalAlerts,
          unread: unreadNotifications
        },
        kpis: {
          availability: availabilityRate,
          efficiency: await this.calculateEfficiencyRate(),
          compliance: await this.calculateComplianceRate()
        },
        lastUpdated: new Date()
      };
      
      return Success(stats);
      
    } catch (error) {
      return Failure(new UnexpectedError(error.message));
    }
  }
  
  private async calculateEfficiencyRate(): Promise<number> {
    // Lógica para calcular eficiencia basada en horas operativas vs planificadas
    // Implementación específica del negocio
    return 85.5;
  }
  
  private async calculateComplianceRate(): Promise<number> {
    // Lógica para calcular cumplimiento de mantenimientos programados
    // Implementación específica del negocio
    return 92.3;
  }
}
```

## Base Classes

### `BaseUseCase.ts`
**Propósito**: Funcionalidad común para todos los use cases

```typescript
export abstract class BaseUseCase<TRequest, TResponse> {
  abstract execute(request: TRequest): Promise<UseCaseResult<TResponse>>;
  
  protected validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult {
    try {
      schema.parse(data);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        };
      }
      return { isValid: false, errors: [{ field: 'unknown', message: 'Validation error' }] };
    }
  }
  
  protected async executeWithLogging<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      console.log(`[UseCase] ${operationName} completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[UseCase] ${operationName} failed after ${duration}ms:`, error);
      throw error;
    }
  }
}
```

## Result Types

### `UseCaseResult.ts`
**Propósito**: Tipo de resultado para manejo consistente de errores

```typescript
export type UseCaseResult<T> = Success<T> | Failure;

export class Success<T> {
  readonly isSuccess = true;
  readonly isFailure = false;
  
  constructor(public readonly value: T) {}
}

export class Failure {
  readonly isSuccess = false;
  readonly isFailure = true;
  
  constructor(public readonly error: UseCaseError) {}
}

export const Success = <T>(value: T): Success<T> => new Success(value);
export const Failure = (error: UseCaseError): Failure => new Failure(error);
```

### Error Types
```typescript
export abstract class UseCaseError extends Error {
  abstract readonly type: string;
}

export class ValidationError extends UseCaseError {
  readonly type = 'VALIDATION_ERROR';
  
  constructor(public readonly errors: ValidationErrorDetail[]) {
    super('Validation failed');
  }
}

export class NotFoundError extends UseCaseError {
  readonly type = 'NOT_FOUND_ERROR';
  
  constructor(resource: string) {
    super(`${resource} not found`);
  }
}

export class ConflictError extends UseCaseError {
  readonly type = 'CONFLICT_ERROR';
  
  constructor(message: string) {
    super(message);
  }
}

export class AuthenticationError extends UseCaseError {
  readonly type = 'AUTHENTICATION_ERROR';
  
  constructor(message: string) {
    super(message);
  }
}

export class UnexpectedError extends UseCaseError {
  readonly type = 'UNEXPECTED_ERROR';
  
  constructor(message: string) {
    super(message);
  }
}
```

## Principios de Testing

### Unit Tests
```typescript
describe('CreateMachineUseCase', () => {
  let useCase: CreateMachineUseCase;
  let mockMachineRepository: jest.Mocked<MachineRepository>;
  let mockMachineTypeRepository: jest.Mocked<MachineTypeRepository>;
  
  beforeEach(() => {
    mockMachineRepository = createMockMachineRepository();
    mockMachineTypeRepository = createMockMachineTypeRepository();
    
    useCase = new CreateMachineUseCase(
      mockMachineRepository,
      mockMachineTypeRepository,
      createMockNotificationService(),
      createMockFileUploadService()
    );
  });
  
  test('should create machine successfully', async () => {
    // Setup
    const request = createValidMachineRequest();
    const machineType = createMockMachineType();
    
    mockMachineTypeRepository.findById.mockResolvedValue(machineType);
    mockMachineRepository.findBySerialNumber.mockResolvedValue(null);
    mockMachineRepository.save.mockResolvedValue(createMockMachine());
    
    // Execute
    const result = await useCase.execute(request);
    
    // Verify
    expect(result.isSuccess).toBe(true);
    expect(mockMachineRepository.save).toHaveBeenCalledTimes(1);
  });
  
  test('should fail when serial number already exists', async () => {
    // Setup
    const request = createValidMachineRequest();
    const existingMachine = createMockMachine();
    
    mockMachineRepository.findBySerialNumber.mockResolvedValue(existingMachine);
    
    // Execute
    const result = await useCase.execute(request);
    
    // Verify
    expect(result.isFailure).toBe(true);
    expect(result.error.type).toBe('CONFLICT_ERROR');
  });
});
```

## Convenciones

### Nomenclatura
- Use Cases: `{Verb}{Entity}UseCase.ts`
- Métodos: `execute(request)` como método principal
- Requests: `{UseCase}Request`
- Responses: `{UseCase}Response` o usar entidad directamente

### Estructura
1. Validación de entrada
2. Verificaciones de negocio
3. Operaciones principales
4. Side effects (notificaciones, auditoría)
5. Construcción de respuesta

### Dependencies
- Inyectar todas las dependencies en constructor
- Usar interfaces en lugar de implementaciones concretas
- Facilitar testing con mocking