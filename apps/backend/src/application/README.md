# Application Layer - Use Cases

Esta capa contiene los casos de uso del sistema organizados por bounded context según la arquitectura limpia.

## Propósito
- **Orquestrar** la lógica de negocio llamando al dominio
- **Coordinar** múltiples agregados/entidades
- **Manejar** transacciones de base de datos
- **Aplicar** políticas de autorización livianas
- **Transformar** datos entre capas (Domain ↔ DTOs)

## Estructura por Bounded Context

### **identity/** - Gestión de usuarios y autenticación
- `register-user.use-case.ts` - Registro de nuevos usuarios
- `login-user.use-case.ts` - Autenticación y generación de JWT
- `get-user-profile.use-case.ts` - Obtener perfil de usuario
- `update-user-profile.use-case.ts` - Actualizar datos de usuario

### **assets/** - Gestión de máquinas y equipos
- `create-machine.use-case.ts` - Registro de nuevas máquinas
- `update-machine.use-case.ts` - Actualización de datos de máquinas
- `list-user-machines.use-case.ts` - Listar máquinas por usuario

### **maintenance/** - Mantenimiento preventivo
- `create-maintenance-reminder.use-case.ts` - Crear recordatorios
- `check-pending-maintenance.use-case.ts` - Verificar mantenimientos pendientes

### **quickcheck/** - Chequeos de seguridad
- `create-quick-check.use-case.ts` - Crear formularios de chequeo
- `execute-quick-check.use-case.ts` - Ejecutar chequeo de seguridad

### **comms/** - Comunicación interna
- `send-internal-message.use-case.ts` - Mensajería entre usuarios

### **inventory/** - Gestión de repuestos
- `manage-spare-parts.use-case.ts` - Gestión de inventario

### **scheduling/** - Programación y notificaciones
- `schedule-maintenance.use-case.ts` - Programar mantenimientos
- `send-notifications.use-case.ts` - Envío de notificaciones

## Responsabilidades de los Use Cases

### ✅ **Lo que SÍ deben hacer:**
- Validar reglas de negocio complejas
- Orquestar llamadas a múltiples repositorios
- Manejar transacciones (MongoDB sessions)
- Emitir eventos de dominio
- Transformar entidades a DTOs para respuesta
- Aplicar autorización básica (¿el usuario puede hacer esto?)

### ❌ **Lo que NO deben hacer:**
- Conocer detalles de HTTP (requests, responses, status codes)
- Manejar validación de entrada (eso lo hace el controller)
- Conocer detalles de persistencia (MongoDB, Mongoose)
- Contener lógica de presentación
- Manejar errores de infraestructura directamente

## Patrón de implementación

```typescript
export class RegisterUserUseCase {
  constructor(
    @inject('IUserRepository') private userRepo: IUserRepository,
    @inject('IEmailService') private emailService: IEmailService
  ) {}

  async execute(input: RegisterUserInput): Promise<Result<UserDto, DomainError>> {
    // 1. Validaciones de negocio
    const existingUser = await this.userRepo.findByEmail(input.email);
    if (existingUser.isSuccess) {
      return err(DomainError.conflict('Email already exists'));
    }

    // 2. Crear entidad de dominio
    const userResult = User.create(input);
    if (!userResult.isSuccess) {
      return err(userResult.error);
    }

    // 3. Persistir
    const saveResult = await this.userRepo.save(userResult.data);
    if (!saveResult.isSuccess) {
      return err(saveResult.error);
    }

    // 4. Side effects opcionales
    await this.emailService.sendWelcomeEmail(userResult.data.email);

    // 5. Retornar DTO
    return ok(UserDto.fromDomain(userResult.data));
  }
}
```

## Flujo de dependencias

```
Controller → Use Case → Domain Entities/Services → Repositories (via Ports)
                    ↓
                Domain Events → Event Handlers
```

## Inyección de dependencias

Los Use Cases reciben sus dependencias via constructor injection usando tsyringe:

```typescript
// En el DI container
container.register<IUserRepository>('IUserRepository', { useClass: UserRepository });
container.register<RegisterUserUseCase>('RegisterUserUseCase', { useClass: RegisterUserUseCase });
```

## Testing

Los Use Cases se testean mockeando sus dependencias:

```typescript
describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let mockUserRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepo = createMockUserRepository();
    useCase = new RegisterUserUseCase(mockUserRepo);
  });
});
```

## Nota importante

Los Use Cases son la **capa de aplicación** pura - no conocen detalles de HTTP ni de persistencia. Solo orquestan la lógica de negocio usando las abstracciones definidas en el dominio.