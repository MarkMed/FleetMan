# 🏗️ Entities - Núcleo del Dominio

## � **Propósito**
Las **Entidades** son el corazón del Domain-Driven Design. Representan conceptos del negocio con identidad única y encapsulan tanto datos como comportamientos (reglas de negocio).

## 📁 **Estructura Actual**
```
entities/
├── client-user/
│   └── client-user.entity.ts      ← Usuario tipo cliente
├── machine/
│   ├── machine.entity.ts          ← Entidad principal: Máquina/Activo ✅
│   └── machineStatus/             ← Estados de máquina (patrón State) ✅
├── machine-type/
│   └── machine-type.entity.ts     ← Tipo de máquina configurable ✅
└── user/
    └── user.entity.ts             ← Entidad base de usuario ✅
```

## 🎯 **Responsabilidades**

### **✅ Lo que SÍ hacen las Entidades:**
- **🛡️ Validaciones de Negocio**: Garantizan que los datos cumplan reglas del dominio
- **🎯 Lógica de Negocio**: Métodos que implementan operaciones del negocio
- **🔒 Encapsulación**: Protegen su estado interno mediante getters inmutables
- **📋 Invariantes**: Mantienen consistencia interna en todo momento
- **🆔 Identidad**: Cada entidad tiene un ID único e inmutable

### **❌ Lo que NO hacen las Entidades:**
- **�️ Persistencia**: No saben cómo guardarse en base de datos
- **🌐 Comunicación Externa**: No llaman APIs o servicios externos
- **📧 Notificaciones**: No envían emails ni mensajes
- **🎨 Presentación**: No saben cómo mostrarse en UI

## 🔧 **Patrón de Implementación**

### **🏭 Factory Method Pattern:**
```typescript
export class Machine {
  private constructor(private props: MachineProps) {}

  // ✅ Constructor público estático con validaciones
  public static create(createProps: CreateMachineProps): Result<Machine, DomainError> {
    // Validaciones exhaustivas
    // Creación segura
    // Retorno inmutable
  }
}
```

### **�️ Encapsulación Total:**
```typescript
// ✅ Solo getters (inmutables)
get serialNumber(): SerialNumber {
  return this.props.serialNumber;
}

// ✅ Métodos de negocio que validan
public assignProvider(providerId: UserId): Result<void, DomainError> {
  // Validaciones de negocio
  // Cambio de estado controlado
  // Actualización de timestamp
}
```

## 💡 **Beneficios**

### **🔄 Consistencia:**
- Las reglas de negocio están centralizadas
- Imposible crear entidades en estado inválido
- Validaciones aplicadas siempre, sin excepción

### **🧪 Testabilidad:**
- Fácil unit testing sin dependencias externas
- Lógica de negocio aislada y predecible
- Mocking innecesario para reglas de dominio

### **🚀 Mantenibilidad:**
- Cambio de regla en un solo lugar
- Código autodocumentado mediante métodos de negocio
- Refactoring seguro con TypeScript

### **🛡️ Robustez:**
- Estado siempre válido
- Operaciones atómicas
- Fallos controlados con Result types

## 📚 **Ejemplos de Uso**

### **✅ Crear Máquina:**
```typescript
const machineResult = Machine.create({
  serialNumber: 'CAT-2024-001',
  brand: 'Caterpillar',
  model: 'D6T',
  machineTypeId: 'mtype_excavator_001',
  ownerId: 'user_client_123',
  createdById: 'user_admin_456'
});

if (!machineResult.success) {
  throw new Error(machineResult.error.message);
}

const machine = machineResult.data;
```

### **✅ Operaciones de Negocio:**
```typescript
// Asignar proveedor con validaciones automáticas
const assignResult = machine.assignProvider(providerId);

// Cambiar estado con transiciones validadas
const statusResult = machine.changeStatus(MachineStatuses.Maintenance());

// Actualizar specs con rangos validados
const specsResult = machine.updateSpecs({
  enginePower: 300,
  maxCapacity: 5000
});
```

## � **Próximas Entidades**

### **👥 ProviderUser:**
- Extenderá User base
- Propiedades específicas del proveedor
- Validaciones de certificaciones/licencias

### **📋 MaintenanceRecord:**
- Historial de mantenimientos
- Relación con Machine y ProviderUser
- Cálculos de costos y tiempos

### **📄 Contract:**
- Contratos entre clientes y proveedores
- Términos, condiciones y tarifas
- Estados del contrato

## 🎯 **Reglas de Oro**

1. **🎯 Una Entidad = Un Concepto del Negocio**
2. **🛡️ Siempre Validar en Constructor**
3. **🔒 Estado Inmutable desde el Exterior**
4. **📋 Métodos de Negocio Expresivos**
5. **🚫 Zero Dependencies Externas**
6. **✅ Result Types para Operaciones**

---

> 💡 **Recuerda**: Las entidades son el **alma del sistema**. Si están bien diseñadas, el resto de la aplicación fluye naturalmente.