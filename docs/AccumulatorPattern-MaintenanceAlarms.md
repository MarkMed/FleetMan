# Accumulator Pattern - Maintenance Alarms

**Sprint #11 - Maintenance Alarms Implementation**

---

## 🎯 Concepto Central

El **Accumulator Pattern** permite que cada alarma de mantenimiento mantenga su propio contador de horas operativas (`accumulatedHours`) que se incrementa diariamente cuando la máquina opera. Cuando el contador alcanza el umbral configurado (`intervalHours`), la alarma se dispara automáticamente y el contador se resetea a 0, reiniciando el ciclo.

### Ventajas del Patrón

- ✅ **Independencia por alarma**: Cada alarma tiene su propio ciclo (ej: una cada 500h, otra cada 1000h)
- ✅ **Tracking preciso**: Acumula horas día a día basado en `usageSchedule.dailyHours`
- ✅ **Lógica "día después"**: Suma horas el día DESPUÉS de operar (refleja pasado, no futuro)
- ✅ **Reset automático**: Al dispararse, vuelve a 0 y reinicia el ciclo
- ✅ **Simplicidad**: Solo compara `accumulatedHours >= intervalHours`

---

## 📐 Arquitectura del Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                   ACCUMULATOR PATTERN FLOW                  │
└─────────────────────────────────────────────────────────────┘

Cronjob (diario 2am UTC)
  │
  ├─► 1. UpdateMachinesOperatingHoursUseCase
  │      └─► Actualiza operatingHours total (informativo)
  │
  └─► 2. CheckMaintenanceAlarmsUseCase ⭐
         │
         ├─► A. Calcular "yesterday" (día a verificar)
         │
         ├─► B. Obtener máquinas ACTIVE con alarmas + usageSchedule
         │
         └─► C. FOR EACH máquina:
                │
                ├─► ❓ ¿Ayer fue día operativo?
                │   ├─► NO → SKIP máquina
                │   └─► SÍ → Procesar alarmas ↓
                │
                └─► D. FOR EACH alarma activa:
                       │
                       ├─► Calcular: newAccumulated = current + dailyHours
                       │
                       ├─► ❓ newAccumulated >= intervalHours?
                       │   │
                       │   ├─► SÍ → TRIGGER BRANCH:
                       │   │        ├─► Crear evento + notificación
                       │   │        ├─► triggerMaintenanceAlarm()
                       │   │        └─► accumulatedHours = 0 ⭐ RESET
                       │   │
                       │   └─► NO → ACCUMULATE BRANCH:
                       │            ├─► updateAlarmAccumulatedHours()
                       │            └─► accumulatedHours += dailyHours
                       │
                       └─► Log resultado
```

---

## 📁 Archivos Clave por Capa

### 1. DOMAIN LAYER - Definición del Modelo

#### **`packages/domain/src/models/interfaces.ts`** (líneas ~220-260)

Define la interfaz `IMaintenanceAlarm` con los campos clave:

```typescript
export interface IMaintenanceAlarm {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly relatedParts: readonly string[];
  
  // ⭐ CAMPO CLAVE DEL ACCUMULATOR PATTERN
  readonly intervalHours: number; // Cada cuántas horas debe dispararse
  
  // ⭐⭐ NUEVO: El acumulador que se incrementa diariamente
  /**
   * Horas acumuladas desde el último trigger (o desde creación si nunca se disparó)
   * 
   * ACCUMULATOR PATTERN:
   * - El cronjob suma usageSchedule.dailyHours cada día DESPUÉS de que la máquina operó
   * - Cuando accumulatedHours >= intervalHours → trigger alarma + reset a 0
   * - Permite que cada alarma tenga su propio ciclo independiente
   */
  readonly accumulatedHours: number;
  
  readonly isActive: boolean;
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lastTriggeredAt?: Date;
  
  // ⚠️ DEPRECATED (mantener por compatibilidad, remover en v2.0)
  readonly lastTriggeredHours?: number;
  
  readonly timesTriggered: number;
}
```

**🔑 Puntos Clave:**
- `intervalHours`: Umbral en horas para disparar la alarma (ej: 500h)
- `accumulatedHours`: Contador que se incrementa día a día (ej: 0 → 10 → 20 → ... → 500)
- Condición de disparo: `accumulatedHours >= intervalHours`

---

### 2. PERSISTENCE LAYER - Schema en MongoDB

#### **`packages/persistence/src/models/machine.model.ts`** (líneas ~289-360)

Define el schema de MongoDB para el subdocumento de alarmas:

```typescript
maintenanceAlarms: [{
  title: { type: String, required: true },
  description: { type: String },
  relatedParts: [{ type: String }],
  
  intervalHours: {
    type: Number,
    required: true,
    min: 1
  },
  
  // ⭐ NUEVO: Campo del acumulador en la DB
  accumulatedHours: {
    type: Number,
    required: true,
    default: 0,        // ⭐ Inicia en 0 cuando se crea la alarma
    min: 0,
    validate: {
      validator: function(this: any, value: number) {
        // Safety check: no debería exceder 2x el intervalo
        return value <= (this.intervalHours * 2);
      },
      message: 'Accumulated hours should not exceed 2x interval (possible data error)'
    }
  },
  
  isActive: { type: Boolean, required: true, default: true },
  lastTriggeredAt: { type: Date },
  timesTriggered: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now }
}]
```

**🔑 Puntos Clave:**
- Campo persiste en MongoDB como parte del subdocumento de alarmas
- `default: 0` → Nuevas alarmas empiezan desde cero
- Validación de seguridad: no debe exceder 2x el intervalo (detecta bugs o errores de lógica)

---

### 3. PERSISTENCE LAYER - Operaciones del Repository

#### **`packages/persistence/src/repositories/machine.repository.ts`**

##### A) Método para INCREMENTAR el acumulador (líneas ~1026-1065)

```typescript
/**
 * ⭐ MÉTODO CLAVE: Suma horas diarias al acumulador de una alarma
 * 
 * Usado por cronjob para acumular horas cuando la máquina operó ayer
 * 
 * Patrón de uso:
 * - Cronjob ejecuta diario
 * - Verifica que ayer fue día operativo
 * - Suma usageSchedule.dailyHours al acumulador
 * 
 * @param machineId - ID de la máquina
 * @param alarmId - ID de la alarma (subdocument _id)
 * @param hoursToAdd - Horas a sumar (usualmente usageSchedule.dailyHours)
 * @returns Result<void, DomainError>
 */
async updateAlarmAccumulatedHours(
  machineId: MachineId,
  alarmId: string,
  hoursToAdd: number
): Promise<Result<void, DomainError>> {
  try {
    const result = await MachineModel.findOneAndUpdate(
      { _id: machineId.getValue() },
      {
        $inc: {
          // ⭐ Operador $inc de MongoDB: suma hoursToAdd al valor actual
          'maintenanceAlarms.$[alarm].accumulatedHours': hoursToAdd
        },
        $set: {
          'maintenanceAlarms.$[alarm].updatedAt': new Date()
        }
      },
      {
        arrayFilters: [{ 'alarm._id': alarmId }],
        new: true
      }
    );

    if (!result) {
      return err(DomainError.notFound(`Machine with ID ${machineId.getValue()} not found`));
    }

    return ok(undefined);
  } catch (error: any) {
    logger.error({
      machineId: machineId.getValue(),
      alarmId,
      hoursToAdd,
      error: error.message
    }, 'Error updating alarm accumulated hours');
    return err(DomainError.create('PERSISTENCE_ERROR', `Failed to update accumulated hours: ${error.message}`));
  }
}
```

**🔑 Puntos Clave:**
- Usa operador `$inc` de MongoDB para incremento atómico
- Recibe `hoursToAdd` (típicamente `dailyHours` del usageSchedule)
- **No reemplaza** el valor, lo **suma** al existente
- Thread-safe: operación atómica en MongoDB

##### B) Método para RESETEAR el acumulador (líneas ~1067-1110)

```typescript
/**
 * ⭐ MÉTODO CLAVE: Resetea el acumulador cuando la alarma se dispara
 * 
 * Actualiza tracking fields cuando alarma se dispara:
 * - lastTriggeredAt → timestamp actual
 * - accumulatedHours → 0 (RESET - reinicia ciclo)
 * - timesTriggered → incrementa en 1
 * - lastTriggeredHours → horas totales actuales (legacy)
 * 
 * @param machineId - ID de la máquina
 * @param alarmId - ID de la alarma
 * @param currentOperatingHours - Horas operativas totales actuales (informativo)
 * @returns Result<void, DomainError>
 */
async triggerMaintenanceAlarm(
  machineId: MachineId,
  alarmId: string,
  currentOperatingHours: number
): Promise<Result<void, DomainError>> {
  try {
    const result = await MachineModel.findOneAndUpdate(
      { _id: machineId.getValue() },
      {
        $set: {
          'maintenanceAlarms.$[alarm].lastTriggeredAt': new Date(),
          'maintenanceAlarms.$[alarm].lastTriggeredHours': currentOperatingHours,
          'maintenanceAlarms.$[alarm].accumulatedHours': 0, // ⭐ RESET a 0
          'maintenanceAlarms.$[alarm].updatedAt': new Date()
        },
        $inc: {
          'maintenanceAlarms.$[alarm].timesTriggered': 1
        }
      },
      {
        arrayFilters: [{ 'alarm._id': alarmId }],
        new: true
      }
    );

    if (!result) {
      return err(DomainError.notFound(`Machine with ID ${machineId.getValue()} not found`));
    }

    return ok(undefined);
  } catch (error: any) {
    logger.error({
      machineId: machineId.getValue(),
      alarmId,
      currentOperatingHours,
      error: error.message
    }, 'Error triggering maintenance alarm');
    return err(DomainError.create('PERSISTENCE_ERROR', `Failed to trigger maintenance alarm: ${error.message}`));
  }
}
```

**🔑 Puntos Clave:**
- **Resetea `accumulatedHours` a 0** cuando la alarma se dispara
- También actualiza `lastTriggeredAt` (timestamp) y `timesTriggered` (contador)
- Reinicia el ciclo de acumulación desde cero
- Operación atómica: todo sucede en una sola transacción

---

### 4. APPLICATION LAYER - Lógica del Cronjob ⭐⭐⭐

#### **`apps/backend/src/application/maintenance/check-maintenance-alarms.use-case.ts`** 

Este es el **corazón** de toda la lógica del Accumulator Pattern.

##### A) Cálculo del "Día de Ayer" (líneas ~110-120)

```typescript
/**
 * ⭐ LÓGICA "DÍA SIGUIENTE AL DÍA DE USO"
 * 
 * Suma horas el día DESPUÉS de que la máquina operó porque representa
 * el tracking de horas ya registradas (pasado), no horas futuras.
 * 
 * Filosofía del diseño:
 * - Las horas operativas son un hecho del PASADO
 * - El cronjob ejecuta "al día siguiente" para procesar el día anterior
 * - Esto evita predecir horas futuras (que pueden no ocurrir)
 * 
 * Ejemplo:
 *   - Máquina operó: Lunes (10 horas)
 *   - Cronjob ejecuta: Martes 2am
 *   - Acción: Suma 10h al acumulador (refleja las 10h del Lunes)
 */

// 2. Calcular día de AYER (día de operación)
const today = new Date().getDay(); // 0=DOM, 1=LUN, ..., 6=SAB
const yesterday = (today - 1 + 7) % 7; // Handle wrap-around (DOM → SAB)
const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const yesterdayDayOfWeek = dayMap[yesterday];

logger.info({ 
  today: dayMap[today], 
  yesterday: yesterdayDayOfWeek 
}, 'Calculated yesterday for hours accumulation');
```

**🔑 Puntos Clave:**
- Calcula qué día fue **ayer** (no hoy)
- Si hoy es Martes → ayer fue Lunes
- Solo sumará horas si **ayer** fue día operativo según `usageSchedule.operatingDays`
- Wrap-around: si hoy es Domingo (0), ayer fue Sábado (6)

##### B) Filtrar Máquinas con Alarmas (líneas ~125-140)

```typescript
// 3. Obtener todas las máquinas activas
const activeMachines = await this.machineRepository.findByStatus('ACTIVE');

// 4. Filtrar máquinas con alarmas activas Y usageSchedule definido
const machinesWithAlarms = activeMachines.filter((machine: Machine) => {
  const machinePublic = machine.toPublicInterface();
  const hasActiveAlarms = machinePublic.maintenanceAlarms && 
    machinePublic.maintenanceAlarms.some((alarm: any) => alarm.isActive);
  const hasSchedule = machinePublic.usageSchedule !== undefined;
  return hasActiveAlarms && hasSchedule;
});

logger.info(
  { 
    totalActive: activeMachines.length,
    withAlarms: machinesWithAlarms.length
  }, 
  'Filtered machines with active alarms and schedule'
);
```

**🔑 Puntos Clave:**
- Solo procesa máquinas con status **ACTIVE**
- Deben tener **al menos 1 alarma activa** (`isActive: true`)
- Deben tener **usageSchedule configurado** (sino no sabemos cuántas horas sumar)
- Máquinas sin alarmas o sin schedule → skip

##### C) Loop Principal: Por cada Máquina (líneas ~145-180)

```typescript
// 5. Procesar cada máquina
for (const machine of machinesWithAlarms) {
  const machinePublic = machine.toPublicInterface();
  const machineId = machinePublic.id;
  const usageSchedule = machinePublic.usageSchedule!;
  const alarms = machinePublic.maintenanceAlarms || [];
  const activeAlarms = alarms.filter((alarm: any) => alarm.isActive);

  // ⭐ VERIFICAR SI AYER FUE DÍA OPERATIVO
  const operatedYesterday = usageSchedule.operatingDays.includes(yesterdayDayOfWeek as any);

  if (!operatedYesterday) {
    logger.debug({ 
      machineId, 
      yesterday: yesterdayDayOfWeek 
    }, 'Machine did not operate yesterday - skipping');
    continue; // ⭐ SKIP: No operó ayer, no sumar horas
  }

  const dailyHours = usageSchedule.dailyHours;
  
  logger.debug(
    { 
      machineId, 
      yesterdayOperative: yesterdayDayOfWeek,
      dailyHours,
      activeAlarms: activeAlarms.length 
    }, 
    'Processing alarms for machine that operated yesterday'
  );
  
  // ⭐ Ahora procesamos cada alarma de esta máquina...
}
```

**🔑 Puntos Clave:**
- Verifica si **ayer** está en `operatingDays` del `usageSchedule`
- Si NO operó ayer → `continue` (salta esta máquina, no suma horas)
- Si SÍ operó ayer → procesa sus alarmas activas
- Usa `dailyHours` del schedule (ej: 10h/día)

##### D) Loop Interno: Por cada Alarma ⭐⭐⭐ (líneas ~185-280)

```typescript
// 6. Procesar cada alarma activa
for (const alarm of activeAlarms) {
  result.alarmsChecked++;

  try {
    const alarmId = alarm.id;
    const currentAccumulated = alarm.accumulatedHours || 0;
    const newAccumulated = currentAccumulated + dailyHours; // ⭐ SUMA

    logger.debug(
      {
        machineId,
        alarmId,
        alarmTitle: alarm.title,
        currentAccumulated,
        dailyHoursAdded: dailyHours,
        newAccumulated,
        intervalHours: alarm.intervalHours,
        willTrigger: newAccumulated >= alarm.intervalHours // ⭐ CONDICIÓN
      },
      'Evaluating alarm'
    );

    // ⭐⭐ DECISIÓN CRÍTICA: ¿Trigger o solo acumular?
    if (newAccumulated >= alarm.intervalHours) {
      // ============================================================
      // ⭐ BRANCH 1: TRIGGER ALARM (alcanzó el intervalo)
      // ============================================================

      logger.info(
        { machineId, alarmId, newAccumulated, intervalHours: alarm.intervalHours },
        '🚨 Alarm threshold reached - triggering alarm'
      );

      // (a) Crear MachineEvent (genera notificación automática al owner)
      const title = `⚠️ Mantenimiento Requerido: ${alarm.title}`;
      const description = `La alarma "${alarm.title}" se ha disparado después de acumular ${alarm.intervalHours} horas de operación. Horas acumuladas: ${newAccumulated}h.`;

      await this.createMachineEventUseCase.execute(
        machineId,
        'system',
        {
          machineId,
          createdBy: 'system',
          typeId: eventType.id,
          title,
          description,
          metadata: {
            additionalInfo: {
              alarmId: alarm.id,
              alarmTitle: alarm.title,
              intervalHours: alarm.intervalHours,
              accumulatedHours: newAccumulated, // ⭐ Metadata para auditoría
              relatedParts: alarm.relatedParts,
              timesTriggered: alarm.timesTriggered,
              triggeredAt: new Date().toISOString()
            }
          }
        },
        `/machines/${machineId}/maintenance-alarms`,
        true, // sendNotification = true
        'MAINTENANCE'
      );

      // (b) ⭐ Actualizar tracking + RESET accumulatedHours a 0
      const machineIdVO = MachineId.create(machineId);
      const triggerResult = await this.machineRepository.triggerMaintenanceAlarm(
        machineIdVO.data,
        alarmId,
        machinePublic.specs?.operatingHours || 0
      );

      if (!triggerResult.success) {
        throw new Error(`Failed to trigger alarm: ${triggerResult.error.message}`);
      }

      result.alarmsTriggered++;
      logger.info(
        { 
          machineId, 
          alarmId,
          timesTriggered: alarm.timesTriggered + 1
        }, 
        '✅ Maintenance alarm triggered and reset successfully'
      );

    } else {
      // ============================================================
      // ⭐ BRANCH 2: ACCUMULATE ONLY (aún no alcanza el intervalo)
      // ============================================================

      const machineIdVO = MachineId.create(machineId);
      const updateResult = await this.machineRepository.updateAlarmAccumulatedHours(
        machineIdVO.data,
        alarmId,
        dailyHours // ⭐ Suma dailyHours al acumulador
      );

      if (!updateResult.success) {
        throw new Error(`Failed to update accumulated hours: ${updateResult.error.message}`);
      }

      logger.debug(
        { 
          machineId, 
          alarmId,
          newAccumulated,
          remainingHours: alarm.intervalHours - newAccumulated
        }, 
        '➕ Accumulated hours updated (no trigger)'
      );
    }

  } catch (error) {
    result.errors.push({
      machineId,
      alarmId: alarm.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    logger.warn(
      { machineId, alarmId: alarm.id, error: error instanceof Error ? error.message : 'Unknown' },
      '⚠️ Error processing alarm'
    );
  }
}
```

**🔑 Puntos Clave:**

**1. Cálculo:**
```typescript
currentAccumulated = 490h (ejemplo desde DB)
dailyHours = 10h (desde usageSchedule)
newAccumulated = 490 + 10 = 500h
```

**2. Decisión Crítica:**
```typescript
if (newAccumulated >= intervalHours) {
  // 500 >= 500 → TRUE → TRIGGER ALARM
} else {
  // 500 < 500 → FALSE → SOLO ACUMULAR
}
```

**3. Branch 1 - TRIGGER:**
- Crea `MachineEvent` con metadata completa
- `NotificationService` automáticamente envía notificación al dueño
- Llama a `triggerMaintenanceAlarm()`:
  - Resetea `accumulatedHours` a 0
  - Actualiza `lastTriggeredAt` (timestamp)
  - Incrementa `timesTriggered`
- Usuario recibe notificación push/email

**4. Branch 2 - SOLO ACUMULAR:**
- Llama a `updateAlarmAccumulatedHours()`:
  - Suma `dailyHours` al acumulador actual
- NO crea evento ni notificación
- El contador sigue creciendo para la próxima ejecución
- Log con horas restantes para próximo trigger

---

### 5. CRON SERVICE - Orquestación

#### **`apps/backend/src/services/cron/maintenance-cron.service.ts`** (líneas ~50-120)

Orquesta la ejecución diaria de ambos use cases:

```typescript
/**
 * MaintenanceCronService
 * 
 * Orquesta la ejecución diaria de tareas de mantenimiento:
 * 1. Actualizar horas de operación de máquinas activas
 * 2. Verificar alarmas de mantenimiento (ACCUMULATOR PATTERN ejecuta aquí)
 * 
 * Configuración:
 * - Schedule: CRON_MAINTENANCE_SCHEDULE (default: "0 5 * * *" → 2am UY time)
 * - Timezone: UTC (Azure Container Apps)
 * - Prevención de concurrencia: flag isRunning + lastExecutionTime
 */

private async executeTask(): Promise<void> {
  // Prevenir ejecuciones concurrentes
  if (this.isRunning) {
    logger.warn('⚠️ Cronjob already running, skipping execution');
    return;
  }

  // Prevenir ejecuciones duplicadas (menos de 1 hora)
  const now = new Date();
  if (this.lastExecutionTime) {
    const timeSinceLastExecution = now.getTime() - this.lastExecutionTime.getTime();
    if (timeSinceLastExecution < this.minIntervalBetweenExecutionsMs) {
      logger.info('⏸️ Skipping execution: less than 1 hour since last execution');
      return;
    }
  }

  this.isRunning = true;
  logger.info('🚀 Starting scheduled maintenance task execution');

  try {
    // ⭐ PASO 1: Actualizar horas operativas totales de todas las máquinas
    const updateResult = await this.updateHoursUseCase.execute();
    logger.info({ result: updateResult }, '📈 Operating hours update completed');

    // ⭐ PASO 2: Verificar alarmas (ACCUMULATOR PATTERN ejecuta aquí)
    const alarmsResult = await this.checkAlarmsUseCase.execute();
    logger.info({ result: alarmsResult }, '🔔 Maintenance alarms check completed');

    this.lastExecutionTime = now; // ⭐ Actualizar timestamp de última ejecución
    logger.info('✅ Scheduled maintenance task completed successfully');

  } catch (error) {
    logger.error({ error }, '❌ Error executing scheduled maintenance task');
  } finally {
    this.isRunning = false; // ⭐ Liberar flag
  }
}
```

**🔑 Puntos Clave:**
- Ejecuta **dos** use cases en secuencia:
  1. `UpdateMachinesOperatingHoursUseCase` (actualiza `specs.operatingHours` total)
  2. `CheckMaintenanceAlarmsUseCase` ⭐ (donde está el accumulator pattern)
- **Prevención de concurrencia**: flag `isRunning` evita ejecuciones simultáneas
- **Prevención de duplicados**: lastExecutionTime evita ejecuciones < 1 hora
- **Logging estructurado**: métricas detalladas para monitoring
- **Error isolation**: errores en step 1 no bloquean step 2

---

## 🎯 Ejemplo Completo de Flujo

### Escenario Inicial

```
📅 Contexto:
  - Hoy: MARTES 2:00am UTC (cronjob ejecuta)
  - Ayer: LUNES

📊 Máquina: Excavadora CAT-320
  - id: "machine_12345"
  - status: ACTIVE
  - specs.operatingHours: 2490h (total acumulado histórico)
  - usageSchedule:
    * operatingDays: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY]
    * dailyHours: 10h

🔔 Alarma: "Cambiar Filtros Hidráulicos"
  - id: "alarm_abc123"
  - intervalHours: 500h (debe dispararse cada 500h)
  - accumulatedHours: 490h (antes del cronjob)
  - isActive: true
  - timesTriggered: 2 (se disparó 2 veces en el pasado)
  - lastTriggeredAt: 2025-11-05T10:30:00Z
```

### Ejecución del Cronjob - Paso a Paso

```
┌─────────────────────────────────────────────────────────────────┐
│  MARTES 2:00am UTC - Cronjob Ejecuta                           │
└─────────────────────────────────────────────────────────────────┘

1️⃣ MaintenanceCronService.executeTask() inicia
   ├─ node-cron detecta schedule: "0 5 * * *"
   ├─ isRunning = false → procede
   └─ lastExecutionTime > 1h ago → procede

2️⃣ UpdateMachinesOperatingHoursUseCase.execute()
   ├─ Actualiza specs.operatingHours de todas las máquinas
   └─ Excavadora CAT-320: 2490h → 2500h (+10h)
   
3️⃣ CheckMaintenanceAlarmsUseCase.execute() ⭐ ACCUMULATOR PATTERN
   
   ┌─────────────────────────────────────────────────────────────┐
   │  A) CALCULAR "AYER"                                         │
   └─────────────────────────────────────────────────────────────┘
   
   today = 2 (TUESDAY)
   yesterday = 1 (MONDAY)
   yesterdayDayOfWeek = "MONDAY"
   
   LOG: "Calculated yesterday for hours accumulation"
        { today: "TUESDAY", yesterday: "MONDAY" }
   
   ┌─────────────────────────────────────────────────────────────┐
   │  B) OBTENER Y FILTRAR MÁQUINAS                              │
   └─────────────────────────────────────────────────────────────┘
   
   activeMachines = [...] (50 máquinas ACTIVE)
   machinesWithAlarms = filtrar(hasAlarms && hasSchedule)
   
   → Encontró "Excavadora CAT-320" (tiene 1 alarma activa + schedule)
   
   LOG: "Filtered machines with active alarms and schedule"
        { totalActive: 50, withAlarms: 15 }
   
   ┌─────────────────────────────────────────────────────────────┐
   │  C) LOOP POR MÁQUINA: Excavadora CAT-320                    │
   └─────────────────────────────────────────────────────────────┘
   
   machineId = "machine_12345"
   usageSchedule = {
     operatingDays: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY],
     dailyHours: 10
   }
   
   ❓ ¿Operó ayer?
   operatedYesterday = "MONDAY" in [MONDAY, ...FRIDAY] → ✅ TRUE
   
   dailyHours = 10h
   activeAlarms = [{ id: "alarm_abc123", title: "Cambiar Filtros...", ... }]
   
   LOG: "Processing alarms for machine that operated yesterday"
        { machineId: "machine_12345", yesterdayOperative: "MONDAY", 
          dailyHours: 10, activeAlarms: 1 }
   
   ┌─────────────────────────────────────────────────────────────┐
   │  D) LOOP POR ALARMA: "Cambiar Filtros Hidráulicos"         │
   └─────────────────────────────────────────────────────────────┘
   
   alarmId = "alarm_abc123"
   currentAccumulated = 490h (desde DB)
   dailyHours = 10h
   newAccumulated = 490 + 10 = 500h ⭐
   intervalHours = 500h
   
   LOG: "Evaluating alarm"
        { machineId: "machine_12345", alarmId: "alarm_abc123",
          alarmTitle: "Cambiar Filtros Hidráulicos",
          currentAccumulated: 490, dailyHoursAdded: 10,
          newAccumulated: 500, intervalHours: 500,
          willTrigger: true ⭐ }
   
   ❓ Decisión: newAccumulated >= intervalHours?
      500 >= 500 → ✅ TRUE
   
   ┌──────────────────────────────────────────────────────────────┐
   │  ⭐ BRANCH 1: TRIGGER ALARM (umbral alcanzado)               │
   └──────────────────────────────────────────────────────────────┘
   
   LOG: "🚨 Alarm threshold reached - triggering alarm"
        { machineId: "machine_12345", alarmId: "alarm_abc123",
          newAccumulated: 500, intervalHours: 500 }
   
   ──────────────────────────────────────────────────────────────
   PASO 1: Crear MachineEvent
   ──────────────────────────────────────────────────────────────
   
   title: "⚠️ Mantenimiento Requerido: Cambiar Filtros Hidráulicos"
   description: "La alarma 'Cambiar Filtros Hidráulicos' se ha disparado 
                 después de acumular 500 horas de operación. 
                 Horas acumuladas: 500h."
   
   metadata: {
     additionalInfo: {
       alarmId: "alarm_abc123",
       alarmTitle: "Cambiar Filtros Hidráulicos",
       intervalHours: 500,
       accumulatedHours: 500,
       relatedParts: ["Filtro hidráulico principal", "O-rings"],
       timesTriggered: 2,
       triggeredAt: "2025-01-07T02:00:15Z"
     }
   }
   
   → CreateMachineEventUseCase.execute()
   → MachineEvent creado en DB
   → NotificationService automáticamente envía notificación:
      - Destinatario: owner de la máquina (client user)
      - Tipo: MAINTENANCE
      - Canal: in-app + email (según preferencias)
   
   ──────────────────────────────────────────────────────────────
   PASO 2: Actualizar Alarm Tracking + RESET
   ──────────────────────────────────────────────────────────────
   
   → machineRepository.triggerMaintenanceAlarm(
       machineId: "machine_12345",
       alarmId: "alarm_abc123",
       currentOperatingHours: 2500
     )
   
   UPDATE maintenanceAlarms SET:
     accumulatedHours = 0                  ⭐ RESET
     lastTriggeredAt = 2025-01-07T02:00:15Z
     lastTriggeredHours = 2500            (legacy)
     timesTriggered = 3                   (+1)
     updatedAt = 2025-01-07T02:00:15Z
   WHERE 
     _id = "machine_12345" AND
     maintenanceAlarms._id = "alarm_abc123"
   
   LOG: "✅ Maintenance alarm triggered and reset successfully"
        { machineId: "machine_12345", alarmId: "alarm_abc123",
          timesTriggered: 3 }
   
   ──────────────────────────────────────────────────────────────
   
4️⃣ Resultado Final en DB:
   
   Máquina "Excavadora CAT-320":
     specs.operatingHours: 2500h (actualizado por step 1)
     
   Alarma "Cambiar Filtros Hidráulicos":
     accumulatedHours: 0 ⭐ (reseteado - reinicia ciclo)
     lastTriggeredAt: 2025-01-07T02:00:15Z
     timesTriggered: 3
     isActive: true
   
   MachineEvent creado:
     id: "event_xyz789"
     machineId: "machine_12345"
     typeId: "maintenance_alarm"
     title: "⚠️ Mantenimiento Requerido: Cambiar Filtros Hidráulicos"
     createdAt: 2025-01-07T02:00:15Z
     
   Notificación enviada:
     recipientId: "owner_user_id"
     type: "MAINTENANCE"
     read: false
     sentAt: 2025-01-07T02:00:16Z
   
5️⃣ Usuario ve notificación:
   
   📱 In-App Notification:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🔔 Mantenimiento Requerido
   
   Excavadora CAT-320
   ⚠️ Cambiar Filtros Hidráulicos
   
   La alarma se ha disparado después de acumular 
   500 horas de operación.
   
   Repuestos relacionados:
   • Filtro hidráulico principal
   • O-rings
   
   [Ver Detalles] [Marcar Completado]
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   📧 Email:
   Subject: "Mantenimiento Requerido - Excavadora CAT-320"
   Body: [Mismo contenido con link a la app]
```

### Próxima Ejecución - Miércoles 2am UTC

```
┌─────────────────────────────────────────────────────────────────┐
│  MIÉRCOLES 2:00am UTC - Cronjob Ejecuta Nuevamente             │
└─────────────────────────────────────────────────────────────────┘

1️⃣ CheckMaintenanceAlarmsUseCase.execute()
   
   A) Calcular "ayer":
      today = 3 (WEDNESDAY)
      yesterday = 2 (TUESDAY)
      yesterdayDayOfWeek = "TUESDAY"
   
   B) Procesar "Excavadora CAT-320":
      operatedYesterday = "TUESDAY" in [MONDAY, ...FRIDAY] → ✅ TRUE
      dailyHours = 10h
   
   C) Procesar Alarma "Cambiar Filtros Hidráulicos":
      currentAccumulated = 0 ⭐ (reseteado ayer)
      dailyHours = 10h
      newAccumulated = 0 + 10 = 10h
      intervalHours = 500h
      
      ❓ Decisión: 10 >= 500? → ❌ FALSE
   
   ┌──────────────────────────────────────────────────────────────┐
   │  ⭐ BRANCH 2: ACCUMULATE ONLY (no trigger)                   │
   └──────────────────────────────────────────────────────────────┘
   
   → machineRepository.updateAlarmAccumulatedHours(
       machineId: "machine_12345",
       alarmId: "alarm_abc123",
       hoursToAdd: 10
     )
   
   UPDATE maintenanceAlarms SET:
     accumulatedHours = accumulatedHours + 10  ⭐ Solo suma
     updatedAt = NOW()
   WHERE 
     _id = "machine_12345" AND
     maintenanceAlarms._id = "alarm_abc123"
   
   Resultado: accumulatedHours = 0 + 10 = 10h
   
   LOG: "➕ Accumulated hours updated (no trigger)"
        { machineId: "machine_12345", alarmId: "alarm_abc123",
          newAccumulated: 10, remainingHours: 490 }

2️⃣ El ciclo continúa día a día...
   
   Jueves:  10 + 10 = 20h  (remainingHours: 480)
   Viernes: 20 + 10 = 30h  (remainingHours: 470)
   Lunes:   30 + 10 = 40h  (remainingHours: 460)
   ...
   49 días operativos después...
   ...
   Día 49:  480 + 10 = 490h (remainingHours: 10)
   Día 50:  490 + 10 = 500h → ✅ TRIGGER AGAIN
```

---

## 📊 Diagrama de Estados de una Alarma

```
┌────────────────────────────────────────────────────────────────┐
│                   LIFECYCLE DE UNA ALARMA                      │
└────────────────────────────────────────────────────────────────┘

   [CREADA]
   accumulatedHours: 0
   isActive: true
   timesTriggered: 0
        │
        ├─► Máquina NO operó ayer
        │   └─► SKIP (no cambios)
        │
        ├─► Máquina operó ayer + accumulatedHours < intervalHours
        │   └─► accumulatedHours += dailyHours
        │       └─► [ACUMULANDO]
        │           │
        │           ├─► Día 1:  0 + 10 = 10h
        │           ├─► Día 2:  10 + 10 = 20h
        │           ├─► Día 3:  20 + 10 = 30h
        │           │   ...
        │           ├─► Día 49: 480 + 10 = 490h
        │           └─► Día 50: 490 + 10 = 500h ≥ 500h
        │
        └─► accumulatedHours >= intervalHours
            └─► [TRIGGER]
                ├─► Crear MachineEvent
                ├─► Enviar Notificación
                ├─► accumulatedHours = 0 ⭐ RESET
                ├─► timesTriggered++
                └─► lastTriggeredAt = NOW()
                    │
                    └─► Vuelve a [ACUMULANDO] (ciclo reinicia)

   [PAUSADA]
   isActive: false
   └─► Cronjob la ignora (no suma ni verifica)

   [ELIMINADA]
   (soft delete via isActive = false)
   └─► Puede reactivarse cambiando isActive = true
```

---

## 🎓 Conceptos Clave del Patrón

### 1. **Independencia por Alarma**

```typescript
// ✅ Cada alarma tiene su propio ciclo
Alarma "Cambiar Aceite":
  intervalHours: 500h
  accumulatedHours: 250h → trigger en 25 días

Alarma "Cambiar Filtros":
  intervalHours: 1000h
  accumulatedHours: 800h → trigger en 20 días

Alarma "Revisión General":
  intervalHours: 2000h
  accumulatedHours: 100h → trigger en 190 días
```

Todas acumulan simultáneamente sin interferencia.

### 2. **Lógica "Día Después"**

```typescript
// ⭐ ¿Por qué sumar el día DESPUÉS y no el mismo día?

❌ INCORRECTO (sumar HOY):
  Problema: Predice horas futuras que pueden no ocurrir
  
  Lunes 2am: Cronjob suma 10h (pero aún no operó el Lunes)
  → Si la máquina NO opera el Lunes, las horas son incorrectas

✅ CORRECTO (sumar AYER):
  Solución: Suma horas del PASADO (ya registradas)
  
  Martes 2am: Cronjob suma 10h (por las horas del Lunes)
  → Si la máquina operó el Lunes, las horas son correctas
  → Si NO operó el Lunes, no suma nada (operatedYesterday = false)
```

### 3. **Operador $inc de MongoDB**

```typescript
// ⭐ Operación atómica para incrementar

await MachineModel.findOneAndUpdate(
  { _id: machineId },
  {
    $inc: {
      // Incrementa el valor actual en +10
      // Thread-safe: múltiples operaciones no se pisan
      'maintenanceAlarms.$[alarm].accumulatedHours': 10
    }
  },
  { arrayFilters: [{ 'alarm._id': alarmId }] }
);

// Equivalente SQL:
// UPDATE maintenanceAlarms 
// SET accumulatedHours = accumulatedHours + 10
// WHERE _id = alarmId
```

### 4. **Reset Automático**

```typescript
// ⭐ Cuando se dispara, vuelve a 0

Antes del trigger:
  accumulatedHours: 500h
  
Trigger:
  1. Crear evento + notificación
  2. UPDATE accumulatedHours = 0
  3. timesTriggered++
  
Después del trigger:
  accumulatedHours: 0h (reinicia ciclo)
  timesTriggered: 1 (registra que se disparó)
```

---

## 🛠️ Casos Edge y Manejo de Errores

### 1. **Máquina sin usageSchedule**

```typescript
// ❓ ¿Qué pasa si la máquina NO tiene usageSchedule?

const hasSchedule = machinePublic.usageSchedule !== undefined;
if (!hasSchedule) {
  // 🚫 SKIP: No sabemos cuántas horas sumar
  continue;
}

// Solución: Usuario debe configurar usageSchedule antes de crear alarmas
```

### 2. **Día no operativo**

```typescript
// ❓ ¿Qué pasa si ayer fue sábado/domingo?

const operatedYesterday = usageSchedule.operatingDays.includes(yesterdayDayOfWeek);

if (!operatedYesterday) {
  // 🚫 SKIP: No suma horas
  // accumulatedHours permanece igual
  continue;
}

// Ejemplo:
// Viernes: 490h
// Sábado (no opera): cronjob no suma → sigue en 490h
// Domingo (no opera): cronjob no suma → sigue en 490h
// Lunes: 490 + 10 = 500h → trigger
```

### 3. **Alarma desactivada**

```typescript
// ❓ ¿Qué pasa si isActive = false?

const activeAlarms = alarms.filter((alarm: any) => alarm.isActive);

for (const alarm of activeAlarms) {
  // 🚫 Alarmas con isActive=false no entran al loop
  // accumulatedHours se "congela" (no suma ni verifica)
}

// Uso: Pausar alarmas temporalmente sin perder el progreso
```

### 4. **Error al crear evento**

```typescript
// ❓ ¿Qué pasa si falla CreateMachineEventUseCase?

try {
  await this.createMachineEventUseCase.execute(...);
  await this.machineRepository.triggerMaintenanceAlarm(...);
} catch (error) {
  // ⚠️ Error capturado
  result.errors.push({ machineId, alarmId, error: error.message });
  logger.warn('Error processing alarm');
  
  // ⚠️ La alarma NO se resetea si hubo error
  // accumulatedHours permanece en 500h
  // En la próxima ejecución, intentará trigger nuevamente
}
```

### 5. **Validación de seguridad**

```typescript
// ⚠️ Safety check en el schema

accumulatedHours: {
  type: Number,
  validate: {
    validator: function(value: number) {
      // Si supera 2x el intervalo, algo está mal
      return value <= (this.intervalHours * 2);
    },
    message: 'Accumulated hours exceeds 2x interval - possible bug'
  }
}

// Detecta bugs como:
// - Cronjob ejecutándose múltiples veces por día
// - Error en cálculo de dailyHours
// - Alarma que no se disparó cuando debió
```

---

## 📈 Métricas y Monitoring

### Logs Estructurados

```typescript
// Cada ejecución del cronjob loggea:

INFO: "Starting scheduled maintenance task execution"
INFO: "Calculated yesterday for hours accumulation" 
      { today: "TUESDAY", yesterday: "MONDAY" }
INFO: "Filtered machines with active alarms and schedule" 
      { totalActive: 50, withAlarms: 15 }

DEBUG: "Processing alarms for machine that operated yesterday"
       { machineId: "...", yesterdayOperative: "MONDAY", 
         dailyHours: 10, activeAlarms: 3 }

DEBUG: "Evaluating alarm"
       { machineId: "...", alarmId: "...", 
         currentAccumulated: 490, newAccumulated: 500,
         willTrigger: true }

INFO: "🚨 Alarm threshold reached - triggering alarm"
INFO: "✅ Maintenance alarm triggered and reset successfully"

FINAL: "🔔 Maintenance alarms check completed"
       { alarmsChecked: 45, alarmsTriggered: 3, errors: 0 }
```

### KPIs para Monitoring

```typescript
{
  alarmsChecked: 45,        // Total de alarmas evaluadas
  alarmsTriggered: 3,       // Alarmas que se dispararon
  errors: 0,                // Errores durante procesamiento
  executionTimeMs: 1250,    // Tiempo de ejecución
  machinesProcessed: 15,    // Máquinas con alarmas procesadas
  
  // Métricas por alarma:
  perAlarm: [
    {
      machineId: "...",
      alarmId: "...",
      action: "triggered",   // o "accumulated" o "skipped"
      accumulatedBefore: 490,
      accumulatedAfter: 0,
      hoursAdded: 10
    }
  ]
}
```

---

## 🚀 Deployment y Configuración

### Variables de Entorno

```bash
# Cronjob Schedule (cron expression)
CRON_MAINTENANCE_SCHEDULE="0 5 * * *"  # Default: 2am UY time (5am UTC)

# Para testing:
CRON_MAINTENANCE_SCHEDULE="*/5 * * * *"  # Cada 5 minutos
```

### Consideraciones de Timezone

```typescript
/**
 * ⚠️ IMPORTANTE: Timezone en Azure Container Apps
 * 
 * Azure Container Apps ejecuta en UTC siempre
 * El cronjob "0 5 * * *" ejecuta a las 5am UTC = 2am UY (UTC-3)
 * 
 * Si la región del servidor cambia, el horario NO cambia
 * → Siempre ejecuta basado en UTC
 * 
 * TODO FUTURO: Implementar timezone awareness por máquina
 * Para clientes en diferentes zonas horarias
 */
```

### Ejecución Manual (Testing)

```typescript
// Endpoint admin para trigger manual:
POST /api/v1/admin/cronjobs/maintenance-alarms/trigger

// Headers:
Authorization: Bearer <admin_token>

// Response:
{
  "success": true,
  "message": "Maintenance cronjob executed successfully",
  "data": {
    "executionTimeMs": 1250,
    "executedAt": "2025-01-07T02:00:15Z",
    "triggeredBy": "admin_user_id",
    "note": "Check logs for detailed execution metrics"
  }
}
```

---

## ✅ Checklist de Implementación

### Domain Layer
- [x] `IMaintenanceAlarm.accumulatedHours` definido
- [x] `IMaintenanceAlarm.intervalHours` definido
- [x] Documentación inline del patrón

### Persistence Layer
- [x] Schema MongoDB con campo `accumulatedHours`
- [x] Validación: `accumulatedHours <= intervalHours * 2`
- [x] `updateAlarmAccumulatedHours()` implementado
- [x] `triggerMaintenanceAlarm()` con reset a 0
- [x] MaintenanceAlarmMapper mapea `accumulatedHours`

### Application Layer
- [x] CheckMaintenanceAlarmsUseCase con accumulator logic
- [x] Cálculo de "ayer" (yesterday calculation)
- [x] Filtro por `operatingDays`
- [x] Branch 1: Trigger (evento + notificación + reset)
- [x] Branch 2: Accumulate only
- [x] Error handling por alarma

### Infrastructure Layer
- [x] MaintenanceCronService orquesta ejecución
- [x] node-cron scheduler con CRON_MAINTENANCE_SCHEDULE
- [x] Prevención de concurrencia
- [x] Logging estructurado
- [x] Graceful shutdown

### API Layer
- [x] Admin endpoint para trigger manual
- [x] Admin endpoint para ver status
- [x] CRUD endpoints para alarmas

### Testing
- [x] Script de testing: test-maintenance-alarms-accumulator.ts
- [x] Logs detallados para debugging
- [x] Métricas por ejecución

---

## 📚 Referencias

### Archivos Principales

| Archivo | Propósito | Criticidad |
|---------|-----------|------------|
| `check-maintenance-alarms.use-case.ts` | Core logic del accumulator | ⭐⭐⭐ |
| `machine.repository.ts` | Operaciones de acumulación y reset | ⭐⭐ |
| `maintenance-cron.service.ts` | Orquestación del cronjob | ⭐⭐ |
| `interfaces.ts` (domain) | Definición del modelo | ⭐ |
| `machine.model.ts` (persistence) | Schema MongoDB | ⭐ |
| `maintenance-alarm.mapper.ts` | Mapeo domain ↔ DB | ⭐ |

### Comandos Útiles

```bash
# Ejecutar cronjob manualmente (testing)
pnpm --filter @app/backend run test-maintenance-alarms

# Ver logs del cronjob
docker logs <container_id> | grep "maintenance"

# Verificar última ejecución
curl -H "Authorization: Bearer <token>" \
  https://api.fleetman.com/api/v1/admin/cronjobs/maintenance-alarms/status
```

---

## 🎯 Próximos Pasos (Futuro)

### TODO: Timezone Awareness per Machine

```typescript
/**
 * Mejora: Soportar múltiples zonas horarias
 * 
 * Cambios requeridos:
 * 1. Agregar campo `timezone` a cada máquina (ej: 'America/Montevideo')
 * 2. Cronjob ejecuta cada hora (no solo 2am)
 * 3. Por cada máquina, calcular su hora local
 * 4. Solo actualizar si su hora local es 2am ± 30min
 * 
 * Librerías: luxon, date-fns-tz, moment-timezone
 */
```

### TODO: Notificaciones Proactivas

```typescript
/**
 * Mejora: Alertas antes del trigger
 * 
 * Ejemplo:
 * - Alarma cada 500h
 * - Cuando accumulatedHours >= 450h (90%)
 *   → Enviar notificación: "Faltan 50h para mantenimiento"
 */
```

### TODO: Historial de Triggers

```typescript
/**
 * Mejora: Persistir cada trigger en collection separada
 * 
 * MaintenanceAlarmHistory:
 * - alarmId
 * - machineId
 * - triggeredAt
 * - accumulatedHours (snapshot)
 * - completedAt (cuando usuario marca como hecho)
 * - completedBy
 * 
 * Permite:
 * - Reportes de mantenimientos realizados
 * - Auditoría completa
 * - Análisis de compliance
 */
```

---

## 📝 Notas Finales

Este patrón fue diseñado con los siguientes principios:

1. **Simplicidad**: Lógica fácil de entender y debuggear
2. **Robustez**: Manejo de errores por alarma (error isolation)
3. **Escalabilidad**: Operaciones atómicas de MongoDB
4. **Observabilidad**: Logging estructurado para monitoring
5. **Flexibilidad**: Cada alarma con su propio ciclo independiente

El Accumulator Pattern permite tracking preciso de horas operativas por alarma sin depender de cálculos complejos o comparaciones de timestamps. Es predecible, testeable y fácil de mantener.

---

**Documento creado:** Enero 3, 2026  
**Sprint:** #11 - Maintenance Alarms  
**Autor:** FleetMan Development Team
