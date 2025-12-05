# QuickCheck - Implementación con Embedded Records

**Fecha:** 4 de diciembre de 2025  
**Sprint:** #7 - QuickCheck MVP  
**Enfoque:** Embedded subdocuments en Machine (simplificado para MVP)

## 📋 Resumen de Decisión Técnica

Se implementó QuickCheck con un enfoque **embedded** donde los registros de inspección se almacenan directamente como subdocumentos dentro del array `quickChecks[]` de cada máquina en MongoDB.

### Ventajas del Enfoque Embedded
- ✅ **Simplicidad:** No requiere entidades separadas ni colecciones adicionales
- ✅ **Performance:** Acceso directo sin JOINs ni queries adicionales
- ✅ **MVP-friendly:** Reducción de complejidad para implementación rápida
- ✅ **Atomicidad:** Updates atómicos usando operadores Mongoose `$push`
- ✅ **Historial limitado:** Automáticamente limitado a 100 registros por máquina

### Estructura de Datos

```typescript
// Registro individual de QuickCheck (embedded en Machine)
interface IQuickCheckRecord {
  result: 'approved' | 'disapproved' | 'notInitiated';
  date: Date;
  executedById: string;
  quickCheckItems: IQuickCheckItem[];
  observations?: string;
}

// Item individual dentro del QuickCheck
interface IQuickCheckItem {
  name: string;
  description?: string;
  result: 'approved' | 'disapproved' | 'omitted';
}
```

## 🏗️ Implementación por Capas

### 1. Contratos (`packages/contracts`)
**Archivo:** `src/quickcheck.contract.ts`

Define schemas Zod para validación cross-layer:
- `QuickCheckItemSchema`: Validación de items (name, description, result)
- `QuickCheckRecordSchema`: Validación de registros completos
- `CreateQuickCheckRecordSchema`: Request desde frontend (sin date)
- `QuickCheckHistoryFiltersSchema`: Filtros de historial

```typescript
// Ejemplo de uso
import { CreateQuickCheckRecordSchema } from '@packages/contracts';

const validated = CreateQuickCheckRecordSchema.parse(requestData);
```

### 2. Dominio (`packages/domain`)
**Archivo:** `src/models/interfaces.ts`

Extendió `IMachine` con:
```typescript
export interface IMachine extends IBaseEntity {
  // ... otras propiedades
  readonly quickChecks?: readonly IQuickCheckRecord[];
}
```

**Exports desde `src/index.ts`:**
- `IQuickCheckRecord`: Registro completo
- `IQuickCheckItem`: Item individual
- `QuickCheckItemResult`: `'approved' | 'disapproved' | 'omitted'`
- `QuickCheckResult`: `'approved' | 'disapproved' | 'notInitiated'`

**Nota:** Se renombraron interfaces viejas a `IQuickCheckTemplate` e `IQuickCheckItemTemplate` para evitar conflictos (no se usan en MVP).

### 3. Persistencia (`packages/persistence`)

#### Schema Mongoose (`src/models/machine.model.ts`)
Agregado subdocument schema:
```typescript
quickChecks: [{
  result: {
    type: String,
    enum: ['approved', 'disapproved', 'notInitiated'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  executedById: {
    type: String,
    required: true,
    ref: 'User'
  },
  quickCheckItems: [{
    name: {
      type: String,
      required: true,
      maxlength: 100
    },
    description: {
      type: String,
      maxlength: 500
    },
    result: {
      type: String,
      enum: ['approved', 'disapproved', 'omitted'],
      required: true
    }
  }],
  observations: {
    type: String,
    maxlength: 1000
  }
}]
```

#### Repositorio (`src/repositories/machine.repository.ts`)
Nuevos métodos:

1. **`addQuickCheckRecord(machineId, record)`**
   - Agrega nuevo QuickCheck usando `$push` con `$slice: 100`
   - Mantiene automáticamente los últimos 100 registros
   - Registros más recientes primero (`$position: 0`)

2. **`getQuickCheckHistory(machineId, filters?)`**
   - Retorna historial completo o filtrado
   - Filtros: result, dateFrom, dateTo, executedById
   - Soporta paginación (skip/limit)

3. **`getLatestQuickCheck(machineId)`**
   - Retorna el QuickCheck más reciente
   - Útil para mostrar último estado

4. **`countDisapprovedQuickChecks(machineId)`**
   - Cuenta cuántos QuickChecks no aprobados tiene una máquina
   - Usa MongoDB aggregation pipeline

## 📦 Archivos Creados/Modificados

### Creados
- `packages/contracts/src/quickcheck.contract.ts`
- `docs/implementation-summaries/quickcheck-embedded-approach.md` (este archivo)

### Modificados
- `packages/domain/src/models/interfaces.ts` - Agregado IQuickCheckRecord, IQuickCheckItem, tipos
- `packages/domain/src/entities/machine/machine.entity.ts` - toPublicInterface() incluye quickChecks: []
- `packages/domain/src/index.ts` - Exports de tipos QuickCheck
- `packages/contracts/src/index.ts` - Export quickcheck.contract
- `packages/persistence/src/models/machine.model.ts` - Schema subdocument
- `packages/persistence/src/repositories/machine.repository.ts` - Métodos QuickCheck
- `packages/persistence/package.json` - Agregada dependencia @packages/contracts

### Eliminados
- `packages/domain/src/entities/quick-check/` - Placeholder vacío
- `packages/domain/src/entities/quick-check-item/` - Placeholder vacío

## 🔄 Flujo de Uso Típico

### Frontend → Backend
```typescript
// 1. Frontend crea QuickCheck
const newQuickCheck: CreateQuickCheckRecord = {
  result: 'approved',
  executedById: currentUser.id,
  quickCheckItems: [
    { name: 'Frenos', description: 'Estado general', result: 'approved' },
    { name: 'Luces', description: 'Luces delanteras y traseras', result: 'approved' },
    { name: 'Dirección', description: 'Responsiva', result: 'omitted' }
  ],
  observations: 'Todo en orden'
};

// 2. Backend valida con Zod
const validated = CreateQuickCheckRecordSchema.parse(req.body);

// 3. Repository agrega a DB
const result = await machineRepo.addQuickCheckRecord(
  machineId, 
  validated
);

// 4. Si result.data.result === 'disapproved', emitir notificación (RF-017)
```

### Consulta de Historial
```typescript
// Obtener últimos 20 QuickChecks de una máquina
const history = await machineRepo.getQuickCheckHistory(machineId, {
  limit: 20,
  skip: 0
});

// Filtrar solo disapproved del último mes
const recentFails = await machineRepo.getQuickCheckHistory(machineId, {
  result: 'disapproved',
  dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  limit: 10
});
```

## ⚠️ Limitaciones Conocidas

1. **Cap de 100 registros:** Automáticamente se eliminan registros antiguos (strategy de rotación)
2. **No versionado:** Sin tracking de cambios en templates (no hay templates en MVP)
3. **Sin templates editables:** Cada QuickCheck lleva sus items embedidos (no hay template reutilizable)
4. **Queries complejas limitadas:** Para analytics avanzados requeriría agregaciones pesadas

## 🔮 Evolución Post-MVP

Si se necesita escalabilidad/analytics:
- **Opción A:** Migrar a colección separada `quickchecks` con referencia a `machineId`
- **Opción B:** Mantener embedded + event sourcing para analytics (materializar vistas)
- **Opción C:** Híbrido: últimos 10 embedded + histórico en colección separada

Por ahora, el enfoque embedded es **perfecto para MVP** y permite implementación rápida en Sprint #7.

## ✅ Verificación

```bash
# Typecheck pasando
cd packages/persistence
pnpm typecheck # ✅ Sin errores

# Build exitoso
pnpm build # ✅ Sin errores

# Integración verificada
# - @packages/contracts exporta schemas ✅
# - @packages/domain exporta tipos ✅
# - @packages/persistence usa ambos ✅
```

---

**Próximos pasos (Application Layer):**
1. Implementar Use Cases en `apps/backend/src/application/quickcheck/`
2. Crear controllers y routes para API REST
3. Integrar con frontend (formularios + historial)
4. Implementar notificación RF-017 (QuickCheck no aprobado)
