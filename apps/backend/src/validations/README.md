# Validations

Este directorio contiene validadores personalizados y reglas de validación específicas del dominio.

## Propósito
- Implementar validaciones personalizadas
- Centralizar reglas de validación complejas
- Validaciones específicas del negocio
- Reutilizar lógica de validación
- Mantener consistencia en validaciones

## Archivos típicos
- `user.validation.ts` - Validaciones específicas de usuarios
- `machine.validation.ts` - Validaciones de máquinas
- `email.validation.ts` - Validaciones de email personalizadas
- `password.validation.ts` - Validaciones de contraseñas
- `serial-number.validation.ts` - Validaciones de números de serie
- `date-range.validation.ts` - Validaciones de rangos de fechas
- `business-rules.validation.ts` - Reglas de negocio complejas
- `file.validation.ts` - Validaciones de archivos
- `custom-validators.ts` - Validadores reutilizables

## Tipos de validaciones
- **Sintácticas**: Formato, longitud, caracteres permitidos
- **Semánticas**: Reglas de negocio específicas
- **Relacionales**: Validaciones que involucran múltiples entidades
- **Temporales**: Validaciones basadas en fechas/tiempos

## Responsabilidades
- Validar reglas de negocio complejas
- Proporcionar mensajes de error descriptivos
- Ser reutilizables y componibles
- Integrar con schemas de validación

## Patrón recomendado
```typescript
export const validateSerialNumber = (serialNumber: string): boolean => {
  // Lógica de validación específica
  return /^[A-Z0-9]{8,12}$/.test(serialNumber);
};

export const validateMaintenanceSchedule = (schedule: MaintenanceSchedule): ValidationResult => {
  // Validaciones de reglas de negocio
};
```