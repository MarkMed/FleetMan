# Estrategia de Índices en FleetMan

## Resumen
Este documento describe la estrategia de unicidad e indexación implementada en los modelos Mongoose de FleetMan.

## Principio General: Unicidad Simple

Para garantizar unicidad en campos clave, usamos **una sola declaración** por campo:

### ✅ Opción Simple (Recomendada)
```typescript
// En la definición del schema
email: {
  type: String,
  required: true,
  unique: true,  // ← Mongoose crea automáticamente el índice único
  trim: true
}

// NO declarar index manual para el mismo campo
// ❌ userSchema.index({ email: 1 }, { unique: true }); // DUPLICADO - NO HACER
```

### ✅ Opción Avanzada (Solo para casos especiales)
```typescript
// En la definición del schema - SIN unique: true
name: {
  type: String,
  required: true,
  trim: true
}

// Declarar índice manual con opciones especiales
machineTypeSchema.index(
  { name: 1 }, 
  { 
    unique: true, 
    collation: { locale: 'en', strength: 2 } // Case-insensitive
  }
);
```

## Implementación por Modelo

### 1. User Model
**Campo único:** `email`  
**Método:** `unique: true` en el campo  
**Razón:** Unicidad simple sin collation especial

```typescript
email: {
  type: String,
  required: true,
  unique: true,  // ← Índice único automático
  trim: true,
  lowercase: true
}
```

### 2. Machine Model
**Campo único:** `serialNumber`  
**Método:** `unique: true` en el campo  
**Razón:** Unicidad simple

```typescript
serialNumber: {
  type: String,
  required: true,
  unique: true,  // ← Índice único automático
  trim: true,
  uppercase: true
}
```

**Índices compuestos adicionales:**
- `{ ownerId: 1, 'status.code': 1 }` - Búsqueda de máquinas por dueño y estado
- `{ assignedProviderId: 1, 'status.isOperational': 1 }` - Máquinas asignadas operativas
- `{ machineTypeId: 1, 'status.code': 1 }` - Filtrado por tipo y estado
- `{ brand: 1, modelName: 1 }` - Búsqueda por marca y modelo
- `{ 'location.coordinates': '2dsphere' }` - Búsquedas geoespaciales
- Índice de texto para search en múltiples campos

### 3. MachineType Model
**Campo único:** `name`  
**Método:** Índice manual con collation  
**Razón:** Requiere case-insensitive matching (collation)

```typescript
// Campo SIN unique: true
name: {
  type: String,
  required: true,
  trim: true
}

// Índice manual con collation
machineTypeSchema.index(
  { name: 1 }, 
  { 
    unique: true, 
    collation: { locale: 'en', strength: 2 } 
  }
);
```

**Comportamiento:**
- "Forklift" === "forklift" === "FORKLIFT" (mismo documento)
- Permite multi-idioma: `{ name: "Forklift", languages: ["en", "es"] }`

### 4. MachineEventType Model
**Campo único:** `normalizedName`  
**Método:** `unique: true` en el campo  
**Razón:** Unicidad simple (ya se normaliza en middleware pre-save)

```typescript
normalizedName: {
  type: String,
  required: true,
  unique: true,  // ← Índice único automático
  trim: true,
  lowercase: true
}
```

**Índices compuestos adicionales:**
- `{ systemGenerated: 1, isActive: 1 }` - Tipos del sistema activos
- `{ createdBy: 1, isActive: 1 }` - Tipos por usuario
- `{ timesUsed: -1, isActive: 1 }` - Tipos más usados
- `{ isActive: 1, timesUsed: -1 }` - Activos ordenados por uso
- Índice de texto para search

## Reglas de Oro

### ✅ DO
1. **Usar `unique: true` en el campo** para unicidad simple
2. **Usar índice manual** solo si necesitas collation, sparse, o índices compuestos
3. **Una sola declaración de unicidad** por campo
4. **Documentar** por qué usas índice manual en lugar de `unique: true`

### ❌ DON'T
1. **Nunca combinar** `unique: true` en el campo con `schema.index({ campo: 1 }, { unique: true })`
2. **No usar índices manuales** si `unique: true` es suficiente
3. **No olvidar** eliminar la colección al cambiar estructura de índices

## Ventajas de esta Estrategia

### Simplicidad
- Código más limpio y fácil de mantener
- Menos propenso a errores de duplicidad

### Performance
- MongoDB optimiza automáticamente los índices
- No hay índices duplicados que desperdicien espacio

### Mantenibilidad
- Fácil identificar qué campos son únicos
- Cambios futuros son más seguros

## Migración de Índices

Si necesitas cambiar un campo de `unique: true` a índice manual:

```bash
# 1. Eliminar la colección (desarrollo)
mongosh fleetman --eval "db.collection_name.drop();"

# 2. O eliminar solo el índice (producción)
mongosh fleetman --eval "db.collection_name.dropIndex('campo_1');"

# 3. Modificar el código
# 4. Reiniciar la aplicación (Mongoose recrea índices)
```

## Verificación

### Listar índices de una colección
```bash
mongosh fleetman --eval "db.machine_types.getIndexes();"
```

### Probar unicidad
```bash
# Intentar insertar duplicado (debe fallar)
mongosh fleetman --eval "db.machine_types.insertOne({ name: 'Forklift', languages: ['en'] });"
```

## Testing

El seed script `seed-machine-types.ts` verifica:
- ✅ Creación exitosa de 20 tipos de máquinas
- ✅ Sin warnings de índices duplicados
- ✅ Unicidad case-insensitive funcionando
- ✅ Multi-idioma funcionando correctamente

## Conclusión

Esta estrategia balancea simplicidad con flexibilidad:
- **Casos comunes (90%)**: `unique: true` en el campo
- **Casos especiales (10%)**: Índice manual con opciones avanzadas
- **Resultado**: Código limpio, performante y mantenible
