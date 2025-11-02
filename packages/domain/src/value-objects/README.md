# 📦 Value Objects - Tipos Primitivos del Dominio

## 📋 **Propósito**
Los **Value Objects** son tipos primitivos con validaciones integradas que representan conceptos simples pero importantes del dominio. Son inmutables y se comparan por valor, no por identidad.

## 📁 **Estructura Actual**
```
value-objects/
├── email.vo.ts               ← Validación de emails ✅
├── machine-id.vo.ts          ← ID único de máquinas ✅
├── machine-type-id.vo.ts     ← ID único de tipos de máquina ✅
├── serial-number.vo.ts       ← Número de serie validado ✅
├── user-id.vo.ts             ← ID único de usuarios ✅
└── index.ts                  ← Exportaciones centralizadas ✅
```

## 🎯 **Características Clave**

### **🔒 Inmutabilidad Total:**
```typescript
export class Email {
  private constructor(private readonly value: string) {}
  
  public getValue(): string {
    return this.value; // Solo lectura
  }
  
  // ❌ No hay setters - immutable
}
```

### **🛡️ Validación en Construcción:**
```typescript
public static create(email: string): Result<Email, DomainError> {
  if (!email || email.trim().length === 0) {
    return err(DomainError.validation('Email is required'));
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return err(DomainError.validation('Invalid email format'));
  }
  
  return ok(new Email(email.trim().toLowerCase()));
}
```

### **⚖️ Comparación por Valor:**
```typescript
public equals(other: Email): boolean {
  return this.value === other.value;
}
```

## 💡 **Beneficios**

### **🔄 Consistencia de Datos:**
```typescript
// ❌ Sin Value Objects - inconsistencias posibles
const userId1 = "user123";
const userId2 = "USER123";
const userId3 = "user_123";

// ✅ Con Value Objects - formato garantizado
const userIdResult = UserId.create("user123");
// Siempre formato: "user_" + 8 caracteres alfanuméricos
```

### **🛡️ Validación Automática:**
```typescript
// ❌ Validación dispersa en múltiples lugares
if (!email || !email.includes('@')) {
  throw new Error('Invalid email');
}

// ✅ Validación centralizada en VO
const emailResult = Email.create(inputEmail);
if (!emailResult.success) {
  return emailResult.error; // Mensaje consistente
}
```

### **🧪 Testing Simplificado:**
```typescript
// ✅ Test una vez, funciona en toda la app
describe('Email VO', () => {
  it('should reject invalid formats', () => {
    const result = Email.create('invalid-email');
    expect(result.success).toBe(false);
  });
});
```

### **🚀 Refactoring Seguro:**
```typescript
// ✅ Cambio de formato en un solo lugar
export class UserId {
  private static readonly PREFIX = 'user_';
  private static readonly ID_LENGTH = 8;
  
  // Cambio aquí se propaga automáticamente
}
```

## 📚 **Tipos de Value Objects**

### **🆔 Identificadores:**
```typescript
// IDs únicos con formato específico
UserId.create("user_abc12345")
MachineId.create("machine_xyz789")
MachineTypeId.create("mtype_excavator_001")
```

### **📧 Contacto:**
```typescript
// Información de contacto validada
Email.create("user@domain.com")
PhoneNumber.create("+1-234-567-8900") // Pendiente
Address.create({...}) // Pendiente
```

### **🏷️ Códigos y Seriales:**
```typescript
// Códigos específicos del negocio
SerialNumber.create("CAT-2024-D6T-001")
LicenseCode.create("CDL-A-12345") // Pendiente
```

### **💰 Valores Monetarios:**
```typescript
// Valores con validación de rango
Money.create(1250.50, 'USD') // Pendiente
Rate.create(75.00, 'USD/hour') // Pendiente
```

## 🔧 **Patrón de Implementación**

### **🏭 Factory con Validación:**
```typescript
export class SerialNumber {
  private constructor(private readonly value: string) {}

  public static create(serial: string): Result<SerialNumber, DomainError> {
    // 1. Validar requerido
    if (!serial?.trim()) {
      return err(DomainError.validation('Serial number is required'));
    }

    // 2. Validar formato
    if (serial.length < 3 || serial.length > 50) {
      return err(DomainError.validation('Serial number must be 3-50 characters'));
    }

    // 3. Validar caracteres
    if (!/^[A-Z0-9\-_]+$/.test(serial.toUpperCase())) {
      return err(DomainError.validation('Invalid serial number format'));
    }

    return ok(new SerialNumber(serial.toUpperCase()));
  }
}
```

### **🔍 Métodos Útiles:**
```typescript
export class SerialNumber {
  public getValue(): string {
    return this.value;
  }
  
  public equals(other: SerialNumber): boolean {
    return this.value === other.value;
  }
  
  public toString(): string {
    return this.value;
  }
  
  // Métodos específicos del dominio
  public toCensoredString(): string {
    return this.value.substring(0, 3) + '***' + this.value.slice(-3);
  }
  
  public getManufacturerCode(): string {
    return this.value.split('-')[0]; // Ejemplo: "CAT" de "CAT-2024-001"
  }
}
```

## 🔮 **Value Objects Pendientes**

### **📱 Comunicación:**
- `PhoneNumber` - Números telefónicos internacionales
- `Address` - Direcciones postales completas
- `Coordinates` - Latitud/Longitud validadas

### **💼 Negocio:**
- `Money` - Valores monetarios con moneda
- `Rate` - Tarifas por hora/día/mes
- `Percentage` - Porcentajes con rangos válidos

### **⏰ Tiempo:**
- `DateRange` - Rangos de fechas válidos
- `BusinessHours` - Horarios de operación
- `Duration` - Duración en horas/días

### **📋 Documentos:**
- `LicenseNumber` - Licencias de conducir/operador
- `TaxId` - Números de identificación fiscal
- `ContractNumber` - Números de contrato

## 🎯 **Reglas de Oro**

1. **🔒 Siempre Inmutable** - Sin setters, solo getters
2. **🛡️ Validar en Constructor** - Fallar rápido y claro
3. **⚖️ Comparar por Valor** - Método `equals()` obligatorio
4. **🎯 Un Concepto = Un VO** - No mezclar responsabilidades
5. **📋 Factory Method** - `create()` estático para construcción
6. **✅ Result Types** - Manejo de errores consistente

## 📚 **Ejemplos de Uso en Entidades**

```typescript
export class Machine {
  public static create(props: CreateMachineProps): Result<Machine, DomainError> {
    // ✅ Validación automática via Value Objects
    const serialResult = SerialNumber.create(props.serialNumber);
    const machineTypeResult = MachineTypeId.create(props.machineTypeId);
    const ownerResult = UserId.create(props.ownerId);
    
    if (!serialResult.success) return err(serialResult.error);
    if (!machineTypeResult.success) return err(machineTypeResult.error);
    if (!ownerResult.success) return err(ownerResult.error);
    
    // ✅ Entidad creada con VOs validados
    return ok(new Machine({
      serialNumber: serialResult.data,
      machineTypeId: machineTypeResult.data,
      ownerId: ownerResult.data,
      // ...
    }));
  }
}
```

---

> 💡 **Recuerda**: Los Value Objects son los **ladrillos fundamentales** del dominio. Pequeños pero críticos para la integridad de los datos.