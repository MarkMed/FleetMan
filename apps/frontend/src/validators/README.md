# Validators Directory

## Propósito
Contiene esquemas de validación usando Zod para todas las formas de entrada de datos en la aplicación. Proporciona validación consistente y tipado automático para formularios, APIs y transformaciones de datos.

## Organización de Validadores

### 1. **Domain Validators** - Validadores de Entidades del Dominio
### 2. **Form Validators** - Validadores de Formularios
### 3. **API Validators** - Validadores de Request/Response
### 4. **Common Validators** - Validadores Reutilizables

## Estructura de Archivos

```
validators/
├── index.ts              # ✅ Barrel exports
├── schemas/
│   ├── auth.schemas.ts   # Validadores de autenticación
│   ├── machine.schemas.ts # Validadores de máquinas
│   ├── maintenance.schemas.ts # Validadores de mantenimiento
│   ├── quickcheck.schemas.ts # Validadores de chequeos rápidos
│   ├── notification.schemas.ts # Validadores de notificaciones
│   ├── user.schemas.ts   # Validadores de usuario
│   └── index.ts          # Exports de schemas
├── forms/
│   ├── loginForm.validator.ts # Validador de formulario de login
│   ├── registerForm.validator.ts # Validador de formulario de registro
│   ├── machineForm.validator.ts # Validador de formulario de máquinas
│   ├── maintenanceForm.validator.ts # Validador de formulario de mantenimiento
│   ├── quickCheckForm.validator.ts # Validador de formulario de chequeos
│   ├── userProfileForm.validator.ts # Validador de perfil de usuario
│   └── index.ts          # Exports de form validators
├── api/
│   ├── request.validators.ts # Validadores de requests
│   ├── response.validators.ts # Validadores de responses
│   ├── query.validators.ts # Validadores de query parameters
│   └── index.ts          # Exports de API validators
├── common/
│   ├── base.validators.ts # Validadores base reutilizables
│   ├── field.validators.ts # Validadores de campos específicos
│   ├── format.validators.ts # Validadores de formato
│   └── index.ts          # Exports de common validators
├── rules/
│   ├── business.rules.ts # Reglas de negocio complejas
│   ├── security.rules.ts # Reglas de seguridad
│   ├── constraints.rules.ts # Restricciones del dominio
│   └── index.ts          # Exports de rules
└── types/
    ├── ValidationTypes.ts # Tipos derivados de schemas
    ├── ErrorTypes.ts     # Tipos de errores de validación
    └── index.ts          # Exports de types
```

## Schemas Principales

### `auth.schemas.ts`
**Propósito**: Validación de operaciones de autenticación

```typescript
import { z } from 'zod';
import { emailValidator, passwordValidator } from '../common/field.validators';

// Login
export const LoginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, 'Contraseña es requerida'),
  rememberMe: z.boolean().optional()
});

// Register
export const RegisterSchema = z.object({
  firstName: z.string()
    .min(1, 'Nombre es requerido')
    .max(50, 'Nombre muy largo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Solo letras y espacios permitidos'),
  
  lastName: z.string()
    .min(1, 'Apellido es requerido')
    .max(50, 'Apellido muy largo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Solo letras y espacios permitidos'),
  
  email: emailValidator,
  password: passwordValidator,
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Debe aceptar los términos y condiciones'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

// Forgot Password
export const ForgotPasswordSchema = z.object({
  email: emailValidator
});

// Reset Password
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token es requerido'),
  password: passwordValidator,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

// Tipos inferidos
export type LoginData = z.infer<typeof LoginSchema>;
export type RegisterData = z.infer<typeof RegisterSchema>;
export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;
```

### `machine.schemas.ts`
**Propósito**: Validación de datos de máquinas

```typescript
import { z } from 'zod';
import { MachineStatus } from '@/models';

// Base Machine Schema
export const MachineBaseSchema = z.object({
  name: z.string()
    .min(1, 'Nombre es requerido')
    .max(100, 'Nombre muy largo'),
  
  serialNumber: z.string()
    .min(1, 'Número de serie es requerido')
    .max(50, 'Número de serie muy largo')
    .regex(/^[A-Z0-9\-]+$/, 'Formato de serie inválido'),
  
  model: z.string()
    .min(1, 'Modelo es requerido')
    .max(50, 'Modelo muy largo'),
  
  brand: z.string()
    .min(1, 'Marca es requerida')
    .max(50, 'Marca muy larga'),
  
  machineTypeId: z.string()
    .uuid('ID de tipo de máquina inválido'),
  
  location: z.string()
    .max(100, 'Ubicación muy larga')
    .optional(),
  
  acquisitionDate: z.coerce.date()
    .max(new Date(), 'Fecha de adquisición no puede ser futura'),
  
  warrantyExpiryDate: z.coerce.date()
    .optional()
    .refine(date => !date || date > new Date(), {
      message: 'Fecha de garantía debe ser futura'
    }),
  
  notes: z.string()
    .max(1000, 'Notas muy largas')
    .optional()
});

// Create Machine Schema
export const CreateMachineSchema = MachineBaseSchema.extend({
  image: z.instanceof(File)
    .optional()
    .refine(file => !file || file.size <= 5 * 1024 * 1024, {
      message: 'Imagen debe ser menor a 5MB'
    })
    .refine(file => !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), {
      message: 'Formato de imagen no válido'
    })
});

// Update Machine Schema
export const UpdateMachineSchema = MachineBaseSchema.partial().extend({
  id: z.string().uuid('ID de máquina inválido'),
  status: z.nativeEnum(MachineStatus).optional(),
  operatingHours: z.number()
    .min(0, 'Horas operativas no pueden ser negativas')
    .optional(),
  fuelLevel: z.number()
    .min(0, 'Nivel de combustible no puede ser negativo')
    .max(100, 'Nivel de combustible no puede exceder 100%')
    .optional()
});

// Machine Filter Schema
export const MachineFilterSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(MachineStatus).optional(),
  machineTypeId: z.string().uuid().optional(),
  location: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
}).refine(data => {
  if (data.dateFrom && data.dateTo) {
    return data.dateFrom <= data.dateTo;
  }
  return true;
}, {
  message: 'Fecha inicial debe ser menor o igual a fecha final',
  path: ['dateTo']
});

// Tipos inferidos
export type CreateMachineData = z.infer<typeof CreateMachineSchema>;
export type UpdateMachineData = z.infer<typeof UpdateMachineSchema>;
export type MachineFilterData = z.infer<typeof MachineFilterSchema>;
```

### `quickcheck.schemas.ts`
**Propósito**: Validación de chequeos rápidos

```typescript
import { z } from 'zod';

// Quick Check Status
export const QuickCheckStatusSchema = z.enum(['EXCELLENT', 'ATTENTION', 'CRITICAL']);

// Checklist Item
export const ChecklistItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  checked: z.boolean(),
  required: z.boolean().default(false)
});

// Create Quick Check Schema
export const CreateQuickCheckSchema = z.object({
  machineId: z.string().uuid('ID de máquina inválido'),
  
  generalStatus: QuickCheckStatusSchema,
  
  fuelLevel: z.number()
    .min(0, 'Nivel de combustible no puede ser negativo')
    .max(100, 'Nivel de combustible no puede exceder 100%')
    .optional(),
  
  operatingHours: z.number()
    .min(0, 'Horas operativas no pueden ser negativas')
    .optional(),
  
  checklist: z.array(ChecklistItemSchema)
    .min(1, 'Debe completar al menos un item del checklist')
    .refine(items => {
      const requiredItems = items.filter(item => item.required);
      const checkedRequiredItems = requiredItems.filter(item => item.checked);
      return checkedRequiredItems.length === requiredItems.length;
    }, {
      message: 'Todos los items requeridos deben estar marcados'
    }),
  
  observations: z.string()
    .max(1000, 'Observaciones muy largas')
    .optional(),
  
  images: z.array(z.instanceof(File))
    .max(5, 'Máximo 5 imágenes permitidas')
    .optional()
    .refine(files => !files || files.every(file => file.size <= 5 * 1024 * 1024), {
      message: 'Cada imagen debe ser menor a 5MB'
    })
    .refine(files => !files || files.every(file => 
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    ), {
      message: 'Formato de imagen no válido'
    })
});

// Quick Check Filter Schema
export const QuickCheckFilterSchema = z.object({
  machineId: z.string().uuid().optional(),
  status: QuickCheckStatusSchema.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  userId: z.string().uuid().optional()
});

// Tipos inferidos
export type CreateQuickCheckData = z.infer<typeof CreateQuickCheckSchema>;
export type QuickCheckFilterData = z.infer<typeof QuickCheckFilterSchema>;
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
```

## Common Validators

### `field.validators.ts`
**Propósito**: Validadores reutilizables para campos comunes

```typescript
import { z } from 'zod';

// Email validator
export const emailValidator = z.string()
  .min(1, 'Email es requerido')
  .email('Formato de email inválido')
  .max(255, 'Email muy largo');

// Password validator
export const passwordValidator = z.string()
  .min(8, 'Contraseña debe tener al menos 8 caracteres')
  .max(128, 'Contraseña muy larga')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un caracter especial');

// Phone validator
export const phoneValidator = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de teléfono inválido')
  .optional();

// URL validator
export const urlValidator = z.string()
  .url('URL inválida')
  .optional();

// Date range validator
export const dateRangeValidator = z.object({
  from: z.coerce.date(),
  to: z.coerce.date()
}).refine(data => data.from <= data.to, {
  message: 'Fecha inicial debe ser menor o igual a fecha final',
  path: ['to']
});

// File validator
export const fileValidator = (
  maxSize: number = 5 * 1024 * 1024, // 5MB default
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
) => z.instanceof(File)
  .refine(file => file.size <= maxSize, {
    message: `Archivo debe ser menor a ${maxSize / (1024 * 1024)}MB`
  })
  .refine(file => allowedTypes.includes(file.type), {
    message: 'Tipo de archivo no permitido'
  });

// Currency validator
export const currencyValidator = z.number()
  .min(0, 'Monto no puede ser negativo')
  .multipleOf(0.01, 'Máximo 2 decimales permitidos');

// Percentage validator
export const percentageValidator = z.number()
  .min(0, 'Porcentaje no puede ser negativo')
  .max(100, 'Porcentaje no puede exceder 100%');
```

### `format.validators.ts`
**Propósito**: Validadores de formato específicos

```typescript
import { z } from 'zod';

// Spanish DNI/NIE validator
export const dniValidator = z.string()
  .regex(/^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i, 'DNI inválido')
  .refine(dni => {
    const number = dni.slice(0, 8);
    const letter = dni.slice(8).toUpperCase();
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    return letters[parseInt(number) % 23] === letter;
  }, 'DNI inválido');

// License plate validator (Spain)
export const licensePlateValidator = z.string()
  .regex(/^[0-9]{4}\s?[BCDFGHJKLMNPRSTVWXYZ]{3}$/i, 'Matrícula inválida');

// IBAN validator
export const ibanValidator = z.string()
  .regex(/^ES[0-9]{2}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{2}\s?[0-9]{10}$/, 'IBAN inválido');

// Postal code validator (Spain)
export const postalCodeValidator = z.string()
  .regex(/^[0-5][0-9]{4}$/, 'Código postal inválido');

// Color hex validator
export const hexColorValidator = z.string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color hexadecimal inválido');

// UUID validator
export const uuidValidator = z.string()
  .uuid('UUID inválido');

// Slug validator
export const slugValidator = z.string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido');
```

## Business Rules

### `business.rules.ts`
**Propósito**: Reglas de negocio complejas como validadores

```typescript
import { z } from 'zod';

// Maintenance scheduling rule
export const maintenanceSchedulingRule = z.object({
  machineId: z.string().uuid(),
  scheduledDate: z.coerce.date(),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY'])
}).refine(async (data) => {
  // Check if machine has conflicting maintenance
  // This would typically call a service to check
  return true; // Simplified for example
}, {
  message: 'Máquina ya tiene mantenimiento programado para esa fecha'
});

// Machine operational hours rule
export const operationalHoursRule = z.object({
  currentHours: z.number().min(0),
  newHours: z.number().min(0)
}).refine(data => data.newHours >= data.currentHours, {
  message: 'Nuevas horas operativas no pueden ser menores a las actuales'
});

// User permissions rule
export const userPermissionsRule = z.object({
  userId: z.string().uuid(),
  action: z.string(),
  resource: z.string()
}).refine(async (data) => {
  // Check user permissions
  return true; // Simplified for example
}, {
  message: 'Usuario no tiene permisos para esta acción'
});
```

## Validation Helpers

### Helper Functions
```typescript
// Validate with schema and return typed result
export const validateWithSchema = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> => {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return {
      success: false,
      errors: [{ path: 'unknown', message: 'Validation error' }]
    };
  }
};

// Async validation wrapper
export const validateAsync = async <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<ValidationResult<T>> => {
  try {
    const validData = await schema.parseAsync(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return {
      success: false,
      errors: [{ path: 'unknown', message: 'Validation error' }]
    };
  }
};

// Create partial schema for updates
export const createUpdateSchema = <T extends z.ZodRawShape>(
  baseSchema: z.ZodObject<T>
) => baseSchema.partial();
```

## Integration with Forms

### useZodForm Integration
```typescript
// Custom hook for form validation
export const useValidatedForm = <T extends z.ZodType>(
  schema: T,
  defaultValues?: Partial<z.infer<T>>
) => {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues
  });
  
  return {
    ...form,
    validateField: (field: keyof z.infer<T>, value: any) => {
      const fieldSchema = schema.shape[field];
      const result = fieldSchema.safeParse(value);
      return result.success ? null : result.error.errors[0].message;
    }
  };
};
```

## Testing

### Validator Tests
```typescript
describe('Machine Validators', () => {
  test('should validate create machine data', () => {
    const validData = {
      name: 'Excavadora Test',
      serialNumber: 'EXC-001',
      model: 'X100',
      brand: 'CatTest',
      machineTypeId: '123e4567-e89b-12d3-a456-426614174000',
      acquisitionDate: new Date('2023-01-01')
    };
    
    const result = CreateMachineSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
  
  test('should reject invalid serial number format', () => {
    const invalidData = {
      serialNumber: 'invalid-format-123!'
    };
    
    const result = CreateMachineSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toContain('Formato de serie inválido');
  });
});
```

## Convenciones

### Nomenclatura
- Schemas: `EntitySchema`, `CreateEntitySchema`, `UpdateEntitySchema`
- Validators: `fieldValidator`, `formatValidator`
- Rules: `businessRuleName`

### Mensajes de Error
- En español para user-facing errors
- Descriptivos y accionables
- Consistentes en tono y formato

### Organización
- Schemas agrupados por dominio
- Validators reutilizables en common/
- Business rules separadas de validación de formato