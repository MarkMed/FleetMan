# ⚠️ Errors - Sistema de Errores del Dominio

## 📋 **Propósito**
El sistema de **Errors** proporciona un manejo de errores tipado, consistente y expresivo en todo el dominio. Implementa el patrón **Result<T, E>** para operaciones que pueden fallar de manera controlada.

## 📁 **Estructura Actual**
```
errors/
├── domain-error.ts              ← Clase base de errores del dominio ✅
├── domain-error-codes.ts        ← Códigos y tipos de error ✅
├── result.ts                    ← Result<T, E> type ✅
└── index.ts                     ← Exportaciones centralizadas ✅
```

## 🎯 **Filosofía: Fallos Controlados**

### **❌ Problemas con Exceptions Tradicionales:**
```typescript
// ❌ Exceptions ocultas - no se sabe qué puede fallar
function createUser(email: string): User {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email'); // ← Sorpresa! Runtime error
  }
  return new User(email);
}

// ❌ Caller no sabe que debe manejar errores
const user = createUser('invalid'); // ← Puede explotar
```

### **✅ Result Pattern - Fallos Explícitos:**
```typescript
// ✅ Errores explícitos en la signatura
function createUser(email: string): Result<User, DomainError> {
  if (!isValidEmail(email)) {
    return err(DomainError.validation('Invalid email format'));
  }
  return ok(new User(email));
}

// ✅ Caller DEBE manejar ambos casos
const userResult = createUser('invalid');
if (!userResult.success) {
  console.log(userResult.error.message); // ← Manejo explícito
  return;
}
const user = userResult.data; // ← Solo si es exitoso
```

## 🏗️ **Arquitectura del Sistema**

### **🎯 Result<T, E> Type:**
```typescript
export type Result<T, E> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Helpers para construcción
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}
```

### **🎨 DomainError - Error Base:**
```typescript
export class DomainError {
  constructor(
    public readonly message: string,
    public readonly code: DomainErrorCode,
    public readonly details?: Record<string, any>
  ) {}

  // Factory methods para diferentes tipos
  static validation(message: string, details?: any): DomainError {
    return new DomainError(message, DomainErrorCodes.VALIDATION_ERROR, details);
  }

  static notFound(message: string = 'Resource not found'): DomainError {
    return new DomainError(message, DomainErrorCodes.NOT_FOUND);
  }

  static domainRule(message: string, details?: any): DomainError {
    return new DomainError(message, DomainErrorCodes.DOMAIN_RULE_VIOLATION, details);
  }
}
```

### **📋 Códigos de Error Tipados:**
```typescript
export const DomainErrorCodes = {
  // Validación de datos
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_FORMAT: 'INVALID_FORMAT',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  
  // Reglas de negocio
  DOMAIN_RULE_VIOLATION: 'DOMAIN_RULE_VIOLATION',
  BUSINESS_CONSTRAINT: 'BUSINESS_CONSTRAINT',
  WORKFLOW_VIOLATION: 'WORKFLOW_VIOLATION',
  
  // Estado de recursos
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Operaciones
  OPERATION_FAILED: 'OPERATION_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Persistencia
  PERSISTENCE_ERROR: 'PERSISTENCE_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR'
} as const;

export type DomainErrorCode = typeof DomainErrorCodes[keyof typeof DomainErrorCodes];
```

## 💡 **Beneficios del Sistema**

### **🎯 Errores Tipados y Explícitos:**
```typescript
// ✅ TypeScript fuerza manejo de errores
function processUser(userResult: Result<User, DomainError>): void {
  if (!userResult.success) {
    // TypeScript sabe que aquí tenemos error
    switch (userResult.error.code) {
      case DomainErrorCodes.VALIDATION_ERROR:
        handleValidationError(userResult.error);
        break;
      case DomainErrorCodes.NOT_FOUND:
        handleNotFoundError(userResult.error);
        break;
      default:
        handleGenericError(userResult.error);
    }
    return;
  }
  
  // TypeScript sabe que aquí tenemos data válida
  const user = userResult.data;
  doSomethingWithUser(user);
}
```

### **🔄 Composabilidad de Operaciones:**
```typescript
// ✅ Chain de operaciones que pueden fallar
export class Machine {
  public static create(props: CreateMachineProps): Result<Machine, DomainError> {
    // 1. Validar serial number
    const serialResult = SerialNumber.create(props.serialNumber);
    if (!serialResult.success) return err(serialResult.error);
    
    // 2. Validar machine type
    const typeResult = MachineTypeId.create(props.machineTypeId);
    if (!typeResult.success) return err(typeResult.error);
    
    // 3. Validar owner
    const ownerResult = UserId.create(props.ownerId);
    if (!ownerResult.success) return err(ownerResult.error);
    
    // 4. Si todo OK, crear entidad
    return ok(new Machine({
      serialNumber: serialResult.data,
      machineTypeId: typeResult.data,
      ownerId: ownerResult.data
    }));
  }
}
```

### **🧪 Testing Predictible:**
```typescript
describe('Machine creation', () => {
  it('should fail with invalid serial number', () => {
    const result = Machine.create({
      serialNumber: '', // ← Invalid
      brand: 'Cat',
      model: 'D6T',
      // ...
    });
    
    expect(result.success).toBe(false);
    expect(result.error.code).toBe(DomainErrorCodes.VALIDATION_ERROR);
    expect(result.error.message).toContain('Serial number');
  });
  
  it('should succeed with valid data', () => {
    const result = Machine.create(validProps);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(Machine);
  });
});
```

## 🔧 **Patrones de Uso**

### **🛡️ Validación en Value Objects:**
```typescript
export class Email {
  public static create(email: string): Result<Email, DomainError> {
    if (!email || email.trim().length === 0) {
      return err(DomainError.validation('Email is required', { field: 'email' }));
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return err(DomainError.validation('Invalid email format', { 
        field: 'email', 
        value: email,
        pattern: emailRegex.source
      }));
    }
    
    return ok(new Email(email.trim().toLowerCase()));
  }
}
```

### **🎯 Reglas de Negocio en Entidades:**
```typescript
export class Machine {
  public assignProvider(providerId: UserId): Result<void, DomainError> {
    if (this.props.status.code === 'RETIRED') {
      return err(DomainError.domainRule(
        'Cannot assign provider to retired machine',
        { 
          machineId: this.props.id.getValue(),
          currentStatus: this.props.status.code
        }
      ));
    }
    
    if (this.props.assignedProviderId?.equals(providerId)) {
      return err(DomainError.domainRule(
        'Provider is already assigned to this machine',
        {
          machineId: this.props.id.getValue(),
          providerId: providerId.getValue()
        }
      ));
    }
    
    this.props.assignedProviderId = providerId;
    this.props.providerAssignedAt = new Date();
    
    return ok(undefined);
  }
}
```

### **🔍 Operaciones de Repository:**
```typescript
export class MongooseMachineTypeRepository implements IMachineTypeRepository {
  async findById(id: MachineTypeId): Promise<Result<MachineType, DomainError>> {
    try {
      const document = await this.MachineTypeModel.findById(id.getValue());
      
      if (!document) {
        return err(DomainError.notFound(
          `MachineType with id ${id.getValue()} not found`
        ));
      }
      
      const entity = this.toDomainEntity(document);
      return ok(entity);
      
    } catch (error) {
      return err(DomainError.persistence(
        'Failed to find MachineType',
        { id: id.getValue(), error: error.message }
      ));
    }
  }
}
```

## 🎨 **Mensajes de Error Expresivos**

### **👥 Para Desarrolladores:**
```typescript
// ✅ Contexto completo para debugging
DomainError.validation(
  'Serial number format is invalid',
  {
    field: 'serialNumber',
    value: 'abc-123',
    expectedPattern: '[A-Z]{3}-[0-9]{4}-[A-Z0-9]{3}',
    actualLength: 7,
    expectedLength: '11-15 characters'
  }
);
```

### **👤 Para Usuarios Finales:**
```typescript
// ✅ Mapping a mensajes amigables
const errorMessages = {
  [DomainErrorCodes.VALIDATION_ERROR]: {
    'Email is required': 'Por favor ingresa tu email',
    'Invalid email format': 'El formato del email no es válido',
    'Serial number format is invalid': 'El número de serie no tiene el formato correcto'
  },
  [DomainErrorCodes.DOMAIN_RULE_VIOLATION]: {
    'Cannot assign provider to retired machine': 'No se puede asignar proveedor a una máquina retirada',
    'Provider is already assigned': 'Este proveedor ya está asignado a la máquina'
  }
};
```

## 📊 **Agregación de Errores**

### **📋 Múltiples Errores de Validación:**
```typescript
export class ValidationResult {
  private errors: DomainError[] = [];
  
  addError(error: DomainError): void {
    this.errors.push(error);
  }
  
  hasErrors(): boolean {
    return this.errors.length > 0;
  }
  
  toResult<T>(): Result<T, DomainError> {
    if (this.hasErrors()) {
      return err(DomainError.validation(
        'Multiple validation errors',
        { errors: this.errors.map(e => e.message) }
      ));
    }
    return ok(undefined as any);
  }
}

// Uso en validaciones complejas
const validation = new ValidationResult();

if (!props.brand) validation.addError(DomainError.validation('Brand is required'));
if (!props.model) validation.addError(DomainError.validation('Model is required'));
if (props.year < 1900) validation.addError(DomainError.validation('Invalid year'));

const validationResult = validation.toResult();
if (!validationResult.success) return err(validationResult.error);
```

## 🔮 **Extensiones Futuras**

### **📊 Error Analytics:**
```typescript
// Tracking de errores para mejora del sistema
export class ErrorTracker {
  static track(error: DomainError, context: string): void {
    // Log structured para analytics
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      errorCode: error.code,
      message: error.message,
      context,
      details: error.details
    }));
  }
}
```

### **🌐 Internacionalización:**
```typescript
// Mensajes en múltiples idiomas
export class ErrorLocalizer {
  static localize(error: DomainError, locale: string): string {
    const messages = errorMessages[locale] || errorMessages['en'];
    return messages[error.code]?.[error.message] || error.message;
  }
}
```

## 🎯 **Reglas de Oro**

1. **✅ Siempre Result Types** - No exceptions en domain layer
2. **📋 Códigos Tipados** - Enum de códigos para cada categoría
3. **📝 Mensajes Descriptivos** - Contexto suficiente para debugging
4. **🎯 Factory Methods** - `DomainError.validation()`, `DomainError.notFound()`
5. **📊 Detalles Estructurados** - Object con contexto adicional
6. **🚫 No Errores Genéricos** - Específicos al dominio
7. **🔄 Composabilidad** - Errores que se pueden combinar

---

> 💡 **Recuerda**: Un buen sistema de errores convierte **sorpresas** en **expectativas** manejables. El código debe fallar de manera predecible y útil.