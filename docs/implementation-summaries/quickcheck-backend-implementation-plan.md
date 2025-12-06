# QuickCheck Backend Implementation Plan

**Fecha:** 4 Diciembre 2025  
**Sprint:** #7 - QuickCheck MVP  
**Objetivo:** Implementar capa de Application (Backend) para feature QuickCheck con arquitectura embedded

---

## 📋 Contexto y Decisiones Arquitectónicas

### Enfoque Seleccionado: QuickChecks Embedados en Machine

**Decisión:** Los registros de QuickCheck se almacenan como un array `quickChecks[]` dentro del documento de cada máquina en MongoDB, en lugar de crear una colección independiente.

**Justificación:**

1. **Simplicidad:** No requiere joins ni queries complejas entre colecciones
2. **Performance:** Leer historial de inspecciones = 1 sola query a la máquina
3. **Atomicidad:** Actualizar máquina + agregar quickcheck = 1 transacción MongoDB
4. **Escalabilidad suficiente para MVP:** 
   - ~50 quickchecks/año por máquina
   - 3 años de historial = ~150 registros embedados
   - Tamaño estimado: 150 registros × ~2KB = ~300KB por máquina (aceptable en Mongo)
5. **Cohesión de dominio:** QuickCheck es inherente al ciclo de vida de la máquina, no una entidad independiente

**Ejemplo de Estructura de Datos:**

```typescript
// Dentro del documento Machine en MongoDB
{
  _id: "machine_xxx",
  serialNumber: "FLT-12345",
  brand: "Toyota",
  // ... otros campos de máquina
  quickChecks: [
    {
      result: "approved", // approved | disapproved | notInitiated
      date: ISODate("2025-12-04T10:30:00Z"),
      executedById: "user_yyy",
      quickCheckItems: [
        {
          name: "Frenos",
          description: "Inspección visual y prueba de frenado",
          result: "approved" // approved | disapproved | omitted
        },
        {
          name: "Luces traseras",
          description: "Verificar funcionamiento de todas las luces",
          result: "approved"
        }
      ],
      observations: "Máquina en excelente estado"
    }
  ]
}
```

---

## 🎯 Estado Actual de la Implementación

### ✅ Capas Ya Implementadas

#### 1. **Domain Layer** (`packages/domain/src/models/interfaces.ts`)
- ✅ `IQuickCheckRecord` - Interfaz para registro completo
- ✅ `IQuickCheckItem` - Interfaz para item individual
- ✅ `QuickCheckResult` - Tipo para resultado general (`'approved' | 'disapproved' | 'notInitiated'`)
- ✅ `QuickCheckItemResult` - Tipo para resultado individual (`'approved' | 'disapproved' | 'omitted'`)
- ✅ `IMachine.quickChecks?: readonly IQuickCheckRecord[]` - Campo opcional en interfaz pública

#### 2. **Persistence Layer** (`packages/persistence/src/models/machine.model.ts`)
- ✅ Schema Mongoose con subdocumentos embedados:
  ```typescript
  quickChecks: [{
    result: { type: String, enum: [...], required: true },
    date: { type: Date, required: true, default: Date.now },
    executedById: { type: String, required: true, ref: 'User' },
    quickCheckItems: [{ name, description, result }],
    observations: { type: String, maxlength: 1000 }
  }]
  ```

#### 3. **Contracts Layer** (`packages/contracts/src/quickcheck.contract.ts`)
- ✅ `QuickCheckRecordSchema` - Validación completa con Zod
- ✅ `QuickCheckItemSchema` - Validación de items individuales
- ✅ `CreateQuickCheckRecordSchema` - Schema para creación (sin `date` auto-generado)
- ✅ `QuickCheckHistoryFiltersSchema` - Filtros para consultas (result, dateFrom, dateTo, executedById)

#### 4. **Application Layer** (`apps/backend/src/application/quickcheck/`)
- ⚠️ **PENDIENTE:** Carpeta existe pero solo tiene `index.ts` vacío

---

## ❌ Lo Que Falta Implementar (Con Justificaciones)

### 1. **Entity Layer: Métodos en Machine Entity**

**Archivo:** `packages/domain/src/entities/machine/machine.entity.ts`

#### Falta Implementar:

##### a) Método `addQuickCheckRecord()`
```typescript
public addQuickCheckRecord(
  record: IQuickCheckRecord
): Result<void, DomainError>
```

**Por qué es necesario:**
- **Encapsulación de lógica de negocio:** La entidad Machine debe controlar cómo se agregan registros a su historial
- **Validaciones de dominio:**
  - Verificar que la máquina esté en estado válido (`ACTIVE` o `MAINTENANCE`, no `RETIRED`)
  - Validar que el array de items no esté vacío
  - Validar consistencia: si todos los items están `approved`, el resultado general debe ser `approved`
  - Prevenir duplicados (mismo ejecutor + fecha muy cercana)
- **Invariantes:** Mantener integridad del estado de la máquina

##### b) Agregar `quickChecks` a props privadas
```typescript
interface MachineProps {
  // ... existing props
  quickChecks: IQuickCheckRecord[]; // Array mutable privado
}
```

**Por qué es necesario:**
- Actualmente `toPublicInterface()` retorna `quickChecks: []` hardcodeado
- Necesitamos que la entidad mantenga estado de quickchecks en memoria
- Permite hidratar desde DB y manipular en dominio antes de persistir

##### c) Actualizar `toPublicInterface()`
```typescript
quickChecks: this.props.quickChecks // En vez de []
```

**Por qué es necesario:**
- Exponer el estado real de quickchecks al frontend
- Consistencia entre dominio y persistencia

---

### 2. **Persistence Layer: Actualizar MachineMapper**

**Archivo:** `packages/persistence/src/mappers/machine.mapper.ts`

#### Falta Implementar:

##### a) Mapeo de `quickChecks` en `toEntity()`
```typescript
static toEntity(doc: IMachineDocument): Machine | null {
  // ... existing code
  
  // Mapear quickChecks desde documento
  const quickChecks: IQuickCheckRecord[] = doc.quickChecks?.map(qc => ({
    result: qc.result,
    date: qc.date,
    executedById: qc.executedById,
    quickCheckItems: qc.quickCheckItems.map(item => ({
      name: item.name,
      description: item.description,
      result: item.result
    })),
    observations: qc.observations
  })) || [];
  
  // Asignar a props privadas con reflexión
  machineAny.props.quickChecks = quickChecks;
}
```

**Por qué es necesario:**
- Hidratar el estado completo de la máquina desde MongoDB
- Sin esto, la entidad Machine siempre tendría `quickChecks: []` aunque existan en DB
- Permite que use cases lean historial sin queries adicionales

##### b) Mapeo de `quickChecks` en `toDocument()`
```typescript
static toDocument(machine: Machine): Partial<IMachineDocument> {
  const publicInterface = machine.toPublicInterface();
  
  return {
    // ... existing fields
    quickChecks: publicInterface.quickChecks?.map(qc => ({
      result: qc.result,
      date: qc.date,
      executedById: qc.executedById,
      quickCheckItems: qc.quickCheckItems.map(item => ({
        name: item.name,
        description: item.description,
        result: item.result
      })),
      observations: qc.observations
    }))
  };
}
```

**Por qué es necesario:**
- Persistir cambios en quickChecks cuando se guarda la máquina
- Soporta el método `addQuickCheckRecord()` → `repository.save(machine)`

---

### 3. **Persistence Layer: Extender MachineRepository**

**Archivo:** `packages/persistence/src/repositories/machine.repository.ts`

#### Falta Implementar:

##### a) Método `addQuickCheckToMachine()` (Opcional - Optimización)
```typescript
async addQuickCheckToMachine(
  machineId: MachineId, 
  record: IQuickCheckRecord
): Promise<Result<void, DomainError>> {
  try {
    await MachineModel.findByIdAndUpdate(
      machineId.getValue(),
      { 
        $push: { quickChecks: record },
        $set: { updatedAt: new Date() }
      }
    );
    return ok(undefined);
  } catch (error) {
    return err(DomainError.create('PERSISTENCE_ERROR', error.message));
  }
}
```

**Por qué es necesario (OPCIONAL para MVP):**
- **Optimización de performance:** Usa operador `$push` de Mongo en vez de reescribir todo el documento
- **Concurrencia:** Evita race conditions si múltiples usuarios agregan quickchecks simultáneamente
- **Alternativa MVP:** Usar `repository.save(machine)` es suficiente pero menos eficiente

##### b) Método `getQuickCheckHistory()` con filtros
```typescript
async getQuickCheckHistory(
  machineId: MachineId, 
  filters?: QuickCheckHistoryFilters
): Promise<IQuickCheckRecord[]> {
  const machine = await MachineModel.findById(machineId.getValue());
  if (!machine) return [];
  
  let history = machine.quickChecks || [];
  
  // Aplicar filtros
  if (filters?.result) {
    history = history.filter(qc => qc.result === filters.result);
  }
  if (filters?.dateFrom) {
    history = history.filter(qc => qc.date >= filters.dateFrom);
  }
  if (filters?.dateTo) {
    history = history.filter(qc => qc.date <= filters.dateTo);
  }
  if (filters?.executedById) {
    history = history.filter(qc => qc.executedById === filters.executedById);
  }
  
  // Paginación
  const skip = filters?.skip || 0;
  const limit = filters?.limit || 20;
  
  return history
    .sort((a, b) => b.date.getTime() - a.date.getTime()) // Más recientes primero
    .slice(skip, skip + limit);
}
```

**Por qué es necesario:**
- **Flexibilidad de consultas:** Frontend necesita filtrar por fecha, resultado, ejecutor
- **Performance:** Filtrar en backend evita transferir datos innecesarios
- **Paginación:** Historial puede crecer, necesitamos limitar resultados
- **Alternativa:** Podría hacerse en use case, pero repositorio es más semántico

---

### 4. **Contracts Layer: Schemas de Request/Response**

**Archivo:** `packages/contracts/src/quickcheck.contract.ts`

#### Falta Implementar:

##### a) Request para agregar QuickCheck
```typescript
export const AddQuickCheckRequestSchema = z.object({
  machineId: z.string().min(1, 'Machine ID is required'),
  record: CreateQuickCheckRecordSchema
});

export type AddQuickCheckRequest = z.infer<typeof AddQuickCheckRequestSchema>;
```

**Por qué es necesario:**
- Validar estructura de request HTTP `POST /api/v1/machines/:machineId/quickchecks`
- Combinar path param (`machineId`) con body (`record`)
- Type safety en controllers y use cases

##### b) Response exitoso
```typescript
export const AddQuickCheckResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    machineId: z.string(),
    quickCheckAdded: QuickCheckRecordSchema,
    totalQuickChecks: z.number()
  })
});

export type AddQuickCheckResponse = z.infer<typeof AddQuickCheckResponseSchema>;
```

**Por qué es necesario:**
- Contrato claro para respuesta del API
- Frontend sabe qué esperar después de agregar quickcheck
- Incluye metadata útil (total de quickchecks en historial)

##### c) Response de historial
```typescript
export const GetQuickCheckHistoryResponseSchema = z.object({
  machineId: z.string(),
  quickChecks: z.array(QuickCheckRecordSchema),
  total: z.number(),
  filters: QuickCheckHistoryFiltersSchema.optional()
});

export type GetQuickCheckHistoryResponse = z.infer<typeof GetQuickCheckHistoryResponseSchema>;
```

**Por qué es necesario:**
- Endpoint `GET /api/v1/machines/:machineId/quickchecks` necesita schema de respuesta
- Incluye información de paginación (`total`)
- Eco de filtros aplicados para debugging en frontend

---

## 🛠️ Plan de Implementación (7 Pasos)

### **Paso 1: Extender Machine Entity** ⏱️ 1.5 horas

**Archivo:** `packages/domain/src/entities/machine/machine.entity.ts`

**Tareas:**
1. Agregar `quickChecks: IQuickCheckRecord[]` a `MachineProps`
2. Inicializar `quickChecks: []` en `Machine.create()`
3. Implementar método `addQuickCheckRecord()` con validaciones:
   - Estado de máquina válido (`!= RETIRED`)
   - Items no vacíos
   - Consistencia de resultado general
4. Actualizar `toPublicInterface()` para retornar `this.props.quickChecks`

**Validaciones de Negocio:**
```typescript
// No agregar quickcheck a máquina retirada
if (this.props.status.code === 'RETIRED') {
  return err(DomainError.validation('Cannot add quickcheck to retired machine'));
}

// Al menos un item
if (record.quickCheckItems.length === 0) {
  return err(DomainError.validation('QuickCheck must have at least one item'));
}

// Consistencia: todos aprobados → resultado aprobado
const allApproved = record.quickCheckItems.every(item => 
  item.result === 'approved'
);
const anyDisapproved = record.quickCheckItems.some(item => 
  item.result === 'disapproved'
);

if (allApproved && record.result !== 'approved') {
  return err(DomainError.validation('Result should be approved when all items are approved'));
}

if (anyDisapproved && record.result === 'approved') {
  return err(DomainError.validation('Result cannot be approved when items are disapproved'));
}
```

---

### **Paso 2: Actualizar MachineMapper** ⏱️ 1 hora

**Archivo:** `packages/persistence/src/mappers/machine.mapper.ts`

**Tareas:**
1. En `toEntity()`:
   - Mapear `doc.quickChecks` a array de `IQuickCheckRecord`
   - Asignar a `machineAny.props.quickChecks` con reflexión
2. En `toDocument()`:
   - Incluir `quickChecks` desde `publicInterface.quickChecks`

**Código clave:**
```typescript
// toEntity()
const quickChecks: IQuickCheckRecord[] = (doc.quickChecks || []).map(qc => ({
  result: qc.result,
  date: qc.date,
  executedById: qc.executedById,
  quickCheckItems: qc.quickCheckItems.map(item => ({
    name: item.name,
    description: item.description,
    result: item.result
  })),
  observations: qc.observations
}));

machineAny.props.quickChecks = quickChecks;
```

---

### **Paso 3: Extender MachineRepository** ⏱️ 1.5 horas

**Archivo:** `packages/persistence/src/repositories/machine.repository.ts`

**Tareas:**
1. *(OPCIONAL)* Implementar `addQuickCheckToMachine()` con `$push`
2. Implementar `getQuickCheckHistory()` con filtros y paginación

**Decisión:** Para MVP, el método `addQuickCheckToMachine()` es opcional. Podemos usar `save(machine)` directamente desde el use case. Si hay problemas de performance, agregamos el método optimizado después.

---

### **Paso 4: Crear Use Cases** ⏱️ 2.5 horas

**Carpeta:** `apps/backend/src/application/quickcheck/`

#### **4a. `add-quickcheck.use-case.ts`**

**Responsabilidades:**
1. Validar que la máquina existe
2. Validar que el `executedById` tiene acceso:
   - Es el owner (CLIENT)
   - Es el provider asignado
3. Cargar máquina desde repositorio
4. Llamar `machine.addQuickCheckRecord(record)`
5. Persistir con `machineRepository.save(machine)`
6. Retornar resultado

**Pseudo-código:**
```typescript
export class AddQuickCheckUseCase {
  async execute(request: AddQuickCheckRequest, userId: string): Promise<Machine> {
    // 1. Obtener máquina
    const machineResult = await this.machineRepo.findById(MachineId.create(request.machineId).data);
    if (!machineResult.success) throw new Error('Machine not found');
    
    const machine = machineResult.data;
    
    // 2. Validar acceso
    const isOwner = machine.ownerId.getValue() === userId;
    const isAssignedProvider = machine.assignedProviderId?.getValue() === userId;
    
    if (!isOwner && !isAssignedProvider) {
      throw new Error('Access denied: not owner or assigned provider');
    }
    
    // 3. Agregar quickcheck (validaciones de dominio aquí)
    const addResult = machine.addQuickCheckRecord({
      ...request.record,
      date: new Date(), // Auto-generar fecha server-side
      executedById: userId
    });
    
    if (!addResult.success) throw addResult.error;
    
    // 4. Persistir
    const saveResult = await this.machineRepo.save(machine);
    if (!saveResult.success) throw saveResult.error;
    
    return machine;
  }
}
```

#### **4b. `get-quickcheck-history.use-case.ts`**

**Responsabilidades:**
1. Validar que la máquina existe
2. Validar que el usuario tiene acceso
3. Obtener historial con filtros desde repositorio
4. Retornar registros paginados

**Pseudo-código:**
```typescript
export class GetQuickCheckHistoryUseCase {
  async execute(
    machineId: string, 
    userId: string, 
    filters?: QuickCheckHistoryFilters
  ): Promise<IQuickCheckRecord[]> {
    // 1. Validar acceso a máquina
    const machineResult = await this.machineRepo.findById(MachineId.create(machineId).data);
    if (!machineResult.success) throw new Error('Machine not found');
    
    const machine = machineResult.data;
    
    const isOwner = machine.ownerId.getValue() === userId;
    const isAssignedProvider = machine.assignedProviderId?.getValue() === userId;
    
    if (!isOwner && !isAssignedProvider) {
      throw new Error('Access denied');
    }
    
    // 2. Obtener historial
    return await this.machineRepo.getQuickCheckHistory(
      MachineId.create(machineId).data,
      filters
    );
  }
}
```

#### **4c. Exportar desde `index.ts`**
```typescript
export * from './add-quickcheck.use-case';
export * from './get-quickcheck-history.use-case';
```

---

### **Paso 5: Crear QuickCheckController** ⏱️ 1.5 horas

**Archivo:** `apps/backend/src/controllers/quickcheck.controller.ts`

**Métodos:**
1. `addQuickCheck(req, res)` - POST endpoint
2. `getHistory(req, res)` - GET endpoint

**Responsabilidades:**
- Extraer `userId` desde `req.user` (JWT auth)
- Extraer `machineId` desde `req.params`
- Extraer `body` o `query` desde request
- Llamar use case correspondiente
- Mapear errores de dominio a HTTP status codes
- Retornar respuesta JSON

**Mapeo de Errores:**
```typescript
private mapErrorToHttpStatus(error: Error): number {
  const message = error.message.toLowerCase();
  
  if (message.includes('not found')) return 404;
  if (message.includes('access denied')) return 403;
  if (message.includes('validation') || message.includes('invalid')) return 400;
  if (message.includes('retired machine')) return 422; // Unprocessable Entity
  
  return 500; // Internal Server Error
}
```

---

### **Paso 6: Crear Rutas** ⏱️ 1 hora

**Archivo:** `apps/backend/src/routes/quickcheck.routes.ts`

**Endpoints:**

#### POST `/api/v1/machines/:machineId/quickchecks`
```typescript
/**
 * @swagger
 * /api/v1/machines/{machineId}/quickchecks:
 *   post:
 *     summary: Add QuickCheck record to machine
 *     tags: [QuickCheck]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuickCheckRecord'
 *     responses:
 *       201:
 *         description: QuickCheck added successfully
 *       403:
 *         description: Access denied - not owner or assigned provider
 *       404:
 *         description: Machine not found
 *       422:
 *         description: Cannot add quickcheck to retired machine
 */
router.post('/:machineId/quickchecks',
  requestSanitization,
  authMiddleware,
  validateRequest({ body: CreateQuickCheckRecordSchema }),
  quickCheckController.addQuickCheck.bind(quickCheckController)
);
```

#### GET `/api/v1/machines/:machineId/quickchecks`
```typescript
/**
 * @swagger
 * /api/v1/machines/{machineId}/quickchecks:
 *   get:
 *     summary: Get QuickCheck history for machine
 *     tags: [QuickCheck]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *       - in: query
 *         name: result
 *         schema:
 *           type: string
 *           enum: [approved, disapproved, notInitiated]
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *     responses:
 *       200:
 *         description: QuickCheck history retrieved
 *       403:
 *         description: Access denied
 *       404:
 *         description: Machine not found
 */
router.get('/:machineId/quickchecks',
  requestSanitization,
  authMiddleware,
  validateRequest({ query: QuickCheckHistoryFiltersSchema }),
  quickCheckController.getHistory.bind(quickCheckController)
);
```

**Registrar en Router Principal:**
```typescript
// apps/backend/src/routes/index.ts
import quickCheckRoutes from './quickcheck.routes';

router.use('/machines', quickCheckRoutes); // Monta en /api/v1/machines/:machineId/quickchecks
```

---

### **Paso 7: Actualizar Contracts** ⏱️ 0.5 horas

**Archivo:** `packages/contracts/src/quickcheck.contract.ts`

**Agregar:**
1. `AddQuickCheckRequestSchema`
2. `AddQuickCheckResponseSchema`
3. `GetQuickCheckHistoryResponseSchema`

**Exportar desde `index.ts`:**
```typescript
// packages/contracts/src/index.ts
export * from "./quickcheck.contract";
```

---

## 🧪 Testing Mínimo Requerido

### Unit Tests (Domain)
1. `Machine.addQuickCheckRecord()` rechaza máquina `RETIRED`
2. `Machine.addQuickCheckRecord()` valida consistencia de resultados
3. `Machine.addQuickCheckRecord()` rechaza items vacíos

### Integration Tests (Application)
1. POST quickcheck → GET history retorna el registro agregado
2. POST quickcheck sin autenticación → 401 Unauthorized
3. POST quickcheck a máquina de otro usuario → 403 Forbidden
4. GET history con filtro `result=approved` → solo retorna aprobados

---

## ⏱️ Estimación Total

| Paso | Tarea | Tiempo Estimado |
|------|-------|-----------------|
| 1 | Extender Machine Entity | 1.5 hs |
| 2 | Actualizar MachineMapper | 1.0 hs |
| 3 | Extender MachineRepository | 1.5 hs |
| 4 | Crear Use Cases | 2.5 hs |
| 5 | Crear Controller | 1.5 hs |
| 6 | Crear Rutas | 1.0 hs |
| 7 | Actualizar Contracts | 0.5 hs |
| **TOTAL** | | **9.5 horas** |

**Buffer 20%:** +2 horas  
**Total con buffer:** **11.5 horas** ≈ **1.5 días de desarrollo**

---

## 🚀 Próximos Pasos (Post-MVP)

1. **Índices de MongoDB:** Agregar índice en `quickChecks.date` para queries rápidas
2. **Límite de historial:** Archivar quickchecks antiguos después de 200 registros
3. **Notificaciones:** Enviar notificación automática cuando quickcheck `disapproved`
4. **Métricas:** Dashboard con % de aprobación por máquina/tipo
5. **Templates:** Permitir que CLIENTs creen templates de quickcheck personalizados por machineType

---

## 📚 Referencias

- **Sprint Planning:** `docs/SprintsPlanning.md` - Sprint #7
- **User Journey:** `docs/userJourney.md` - Flujo de inspecciones
- **Architecture:** `docs/architecture&domainModel.md` - Clean Architecture
- **Embedded Approach:** `docs/implementation-summaries/quickcheck-embedded-approach.md`
