# Helpers Directory

## Propósito
Contiene funciones helper y utilidades específicas que proporcionan funcionalidad auxiliar para tareas comunes en la aplicación. Se diferencia de `utils/` en que estas funciones están más específicamente relacionadas con la lógica de negocio de FleetMan.

## Diferencia con Utils
- **Utils**: Funciones agnósticas al dominio, reutilizables en cualquier proyecto
- **Helpers**: Funciones específicas del dominio FleetMan, con conocimiento del negocio

## Estructura de Archivos

```
helpers/
├── index.ts              # Barrel exports
├── machines/
│   ├── machineHelpers.ts # Helpers específicos de máquinas
│   ├── statusHelpers.ts  # Helpers para estados de máquinas
│   ├── calculationHelpers.ts # Cálculos relacionados con máquinas
│   └── index.ts          # Exports de machine helpers
├── maintenance/
│   ├── maintenanceHelpers.ts # Helpers de mantenimiento
│   ├── schedulingHelpers.ts # Helpers para programación
│   ├── costHelpers.ts    # Helpers de costos
│   └── index.ts          # Exports de maintenance helpers
├── quickcheck/
│   ├── checklistHelpers.ts # Helpers para checklists
│   ├── scoreHelpers.ts   # Helpers para puntuaciones
│   └── index.ts          # Exports de quickcheck helpers
├── auth/
│   ├── permissionHelpers.ts # Helpers de permisos
│   ├── roleHelpers.ts    # Helpers de roles
│   └── index.ts          # Exports de auth helpers
├── notifications/
│   ├── notificationHelpers.ts # Helpers de notificaciones
│   ├── alertHelpers.ts   # Helpers de alertas
│   └── index.ts          # Exports de notification helpers
├── forms/
│   ├── formHelpers.ts    # Helpers específicos de formularios
│   ├── validationHelpers.ts # Helpers de validación del dominio
│   └── index.ts          # Exports de form helpers
├── data/
│   ├── transformHelpers.ts # Transformaciones de datos
│   ├── filterHelpers.ts  # Helpers para filtros
│   ├── sortHelpers.ts    # Helpers para ordenamiento
│   └── index.ts          # Exports de data helpers
└── ui/
    ├── displayHelpers.ts # Helpers para mostrar datos
    ├── formatHelpers.ts  # Formateo específico del dominio
    ├── iconHelpers.ts    # Helpers para iconos
    └── index.ts          # Exports de UI helpers
```

## Helpers por Dominio

### `machineHelpers.ts`
**Propósito**: Funciones específicas para el dominio de máquinas

```typescript
import { 
  Machine, 
  MachineStatus, 
  MachineType,
  MACHINE_STATUS,
  MACHINE_TYPES,
  DEFAULT_MAINTENANCE_INTERVALS,
  FUEL_LEVELS 
} from '@/models';
import { MACHINE_STATUS_COLORS, MACHINE_TYPE_ICONS } from '@/constants';

// Determinar si una máquina necesita mantenimiento
export const needsMaintenance = (machine: Machine): boolean => {
  if (!machine.lastMaintenanceDate || !machine.operatingHours) {
    return false;
  }
  
  const interval = DEFAULT_MAINTENANCE_INTERVALS[machine.machineType.code] || 250;
  const lastMaintenanceHours = machine.operatingHours; // Simplificado
  
  return (machine.operatingHours - lastMaintenanceHours) >= interval;
};

// Calcular el próximo mantenimiento
export const calculateNextMaintenance = (machine: Machine): Date | null => {
  if (!machine.lastMaintenanceDate || !machine.operatingHours) {
    return null;
  }
  
  const interval = DEFAULT_MAINTENANCE_INTERVALS[machine.machineType.code] || 250;
  const hoursUntilMaintenance = interval - (machine.operatingHours % interval);
  
  // Estimar fecha basada en uso promedio (simplificado)
  const averageHoursPerDay = 8;
  const daysUntilMaintenance = Math.ceil(hoursUntilMaintenance / averageHoursPerDay);
  
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysUntilMaintenance);
  
  return nextDate;
};

// Determinar el estado visual de una máquina
export const getMachineStatusDisplay = (machine: Machine) => {
  const color = MACHINE_STATUS_COLORS[machine.status];
  const isOverdue = needsMaintenance(machine);
  
  return {
    status: machine.status,
    color: isOverdue ? 'warning' : color,
    label: isOverdue ? 'Mantenimiento Vencido' : machine.status,
    icon: MACHINE_TYPE_ICONS[machine.machineType.code] || 'generic-machine',
    isOverdue,
  };
};

// Calcular eficiencia de máquina
export const calculateMachineEfficiency = (machine: Machine): number => {
  if (!machine.operatingHours || machine.operatingHours === 0) {
    return 0;
  }
  
  // Cálculo simplificado de eficiencia
  const daysSinceAcquisition = Math.floor(
    (Date.now() - machine.acquisitionDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const expectedHours = daysSinceAcquisition * 8; // 8 horas por día esperadas
  const efficiency = (machine.operatingHours / expectedHours) * 100;
  
  return Math.min(Math.max(efficiency, 0), 100); // Clamp entre 0-100
};

// Obtener categoría de combustible
export const getFuelLevelCategory = (fuelLevel: number) => {
  for (const [category, range] of Object.entries(FUEL_LEVELS)) {
    if (fuelLevel >= range.min && fuelLevel <= range.max) {
      return {
        category,
        ...range,
      };
    }
  }
  
  return {
    category: 'UNKNOWN',
    min: 0,
    max: 0,
    label: 'Desconocido',
    color: 'muted',
  };
};

// Determinar si una máquina está disponible para operación
export const isMachineAvailable = (machine: Machine): boolean => {
  return machine.status === MACHINE_STATUS.ACTIVE && 
         machine.fuelLevel > 10; // Mínimo 10% de combustible
};

// Generar resumen de máquina para mostrar en cards
export const getMachineSummary = (machine: Machine) => {
  const statusDisplay = getMachineStatusDisplay(machine);
  const efficiency = calculateMachineEfficiency(machine);
  const fuelCategory = getFuelLevelCategory(machine.fuelLevel || 0);
  const nextMaintenance = calculateNextMaintenance(machine);
  
  return {
    id: machine.id,
    name: machine.name,
    serialNumber: machine.serialNumber,
    type: machine.machineType.name,
    status: statusDisplay,
    efficiency: Math.round(efficiency),
    fuel: {
      level: machine.fuelLevel || 0,
      category: fuelCategory,
    },
    nextMaintenance,
    isAvailable: isMachineAvailable(machine),
    operatingHours: machine.operatingHours,
    location: machine.location,
    imageUrl: machine.imageUrl,
  };
};

// Filtrar máquinas por criterios específicos
export const filterMachinesByAvailability = (machines: Machine[]): Machine[] => {
  return machines.filter(isMachineAvailable);
};

export const filterMachinesByMaintenanceDue = (machines: Machine[]): Machine[] => {
  return machines.filter(needsMaintenance);
};

export const filterMachinesByLowFuel = (machines: Machine[]): Machine[] => {
  return machines.filter(machine => (machine.fuelLevel || 0) < 25);
};

// Agrupar máquinas por tipo
export const groupMachinesByType = (machines: Machine[]) => {
  return machines.reduce((groups, machine) => {
    const type = machine.machineType.code;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(machine);
    return groups;
  }, {} as Record<string, Machine[]>);
};

// Calcular estadísticas de máquinas
export const calculateMachineStats = (machines: Machine[]) => {
  const total = machines.length;
  const active = machines.filter(m => m.status === MACHINE_STATUS.ACTIVE).length;
  const maintenance = machines.filter(m => m.status === MACHINE_STATUS.MAINTENANCE).length;
  const outOfService = machines.filter(m => m.status === MACHINE_STATUS.OUT_OF_SERVICE).length;
  const needsMaintenanceCount = machines.filter(needsMaintenance).length;
  const lowFuelCount = filterMachinesByLowFuel(machines).length;
  
  const avgEfficiency = machines.reduce((sum, machine) => {
    return sum + calculateMachineEfficiency(machine);
  }, 0) / total || 0;
  
  const avgOperatingHours = machines.reduce((sum, machine) => {
    return sum + machine.operatingHours;
  }, 0) / total || 0;
  
  return {
    total,
    active,
    maintenance,
    outOfService,
    availability: total > 0 ? (active / total) * 100 : 0,
    needsMaintenance: needsMaintenanceCount,
    lowFuel: lowFuelCount,
    avgEfficiency: Math.round(avgEfficiency),
    avgOperatingHours: Math.round(avgOperatingHours),
  };
};
```

### `maintenanceHelpers.ts`
**Propósito**: Funciones específicas para el dominio de mantenimiento

```typescript
import { 
  Maintenance, 
  MaintenanceStatus, 
  MaintenanceType,
  MAINTENANCE_STATUS,
  MAINTENANCE_TYPES,
  MAINTENANCE_PRIORITIES 
} from '@/models';
import { differenceInDays, addDays, isAfter, isBefore } from 'date-fns';

// Determinar si un mantenimiento está vencido
export const isMaintenanceOverdue = (maintenance: Maintenance): boolean => {
  if (maintenance.status === MAINTENANCE_STATUS.COMPLETED || 
      maintenance.status === MAINTENANCE_STATUS.CANCELLED) {
    return false;
  }
  
  return isAfter(new Date(), maintenance.scheduledDate);
};

// Calcular días hasta el mantenimiento
export const getDaysUntilMaintenance = (maintenance: Maintenance): number => {
  return differenceInDays(maintenance.scheduledDate, new Date());
};

// Determinar la prioridad visual del mantenimiento
export const getMaintenancePriorityDisplay = (maintenance: Maintenance) => {
  const daysUntil = getDaysUntilMaintenance(maintenance);
  const isOverdue = isMaintenanceOverdue(maintenance);
  
  if (isOverdue) {
    return {
      level: 'CRITICAL',
      color: 'destructive',
      label: 'Vencido',
      urgency: 'high',
    };
  }
  
  if (daysUntil <= 1) {
    return {
      level: 'HIGH',
      color: 'destructive',
      label: 'Urgente',
      urgency: 'high',
    };
  }
  
  if (daysUntil <= 3) {
    return {
      level: 'MEDIUM',
      color: 'warning',
      label: 'Próximo',
      urgency: 'medium',
    };
  }
  
  return {
    level: 'LOW',
    color: 'info',
    label: 'Programado',
    urgency: 'low',
  };
};

// Calcular el costo estimado del mantenimiento
export const calculateMaintenanceCost = (
  maintenance: Maintenance,
  laborHourRate: number = 50,
  partsMultiplier: number = 1.2
): number => {
  const baseCost = {
    [MAINTENANCE_TYPES.PREVENTIVE]: 200,
    [MAINTENANCE_TYPES.CORRECTIVE]: 500,
    [MAINTENANCE_TYPES.EMERGENCY]: 800,
    [MAINTENANCE_TYPES.INSPECTION]: 100,
  };
  
  const laborCost = (maintenance.estimatedDuration || 4) * laborHourRate;
  const partsCost = baseCost[maintenance.type] * partsMultiplier;
  
  return laborCost + partsCost;
};

// Generar cronograma de mantenimiento preventivo
export const generatePreventiveSchedule = (
  machineId: string,
  startDate: Date,
  intervalDays: number,
  occurrences: number
): Partial<Maintenance>[] => {
  const schedule: Partial<Maintenance>[] = [];
  
  for (let i = 0; i < occurrences; i++) {
    const scheduledDate = addDays(startDate, i * intervalDays);
    
    schedule.push({
      machineId,
      type: MAINTENANCE_TYPES.PREVENTIVE,
      scheduledDate,
      status: MAINTENANCE_STATUS.SCHEDULED,
      description: `Mantenimiento preventivo programado #${i + 1}`,
      estimatedDuration: 4,
    });
  }
  
  return schedule;
};

// Agrupar mantenimientos por estado
export const groupMaintenanceByStatus = (maintenances: Maintenance[]) => {
  return maintenances.reduce((groups, maintenance) => {
    const status = maintenance.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(maintenance);
    return groups;
  }, {} as Record<MaintenanceStatus, Maintenance[]>);
};

// Filtrar mantenimientos por proximidad
export const getUpcomingMaintenances = (
  maintenances: Maintenance[],
  daysAhead: number = 7
): Maintenance[] => {
  const cutoffDate = addDays(new Date(), daysAhead);
  
  return maintenances.filter(maintenance => {
    return maintenance.status === MAINTENANCE_STATUS.SCHEDULED &&
           isBefore(maintenance.scheduledDate, cutoffDate) &&
           isAfter(maintenance.scheduledDate, new Date());
  });
};

// Calcular estadísticas de mantenimiento
export const calculateMaintenanceStats = (maintenances: Maintenance[]) => {
  const total = maintenances.length;
  const completed = maintenances.filter(m => m.status === MAINTENANCE_STATUS.COMPLETED).length;
  const scheduled = maintenances.filter(m => m.status === MAINTENANCE_STATUS.SCHEDULED).length;
  const overdue = maintenances.filter(isMaintenanceOverdue).length;
  const inProgress = maintenances.filter(m => m.status === MAINTENANCE_STATUS.IN_PROGRESS).length;
  
  const completionRate = total > 0 ? (completed / total) * 100 : 0;
  
  const totalCost = maintenances
    .filter(m => m.actualCost)
    .reduce((sum, m) => sum + (m.actualCost || 0), 0);
  
  const avgCost = completed > 0 ? totalCost / completed : 0;
  
  // Calcular tiempo promedio de mantenimiento
  const completedWithDuration = maintenances.filter(m => 
    m.status === MAINTENANCE_STATUS.COMPLETED && m.actualDuration
  );
  const avgDuration = completedWithDuration.length > 0 
    ? completedWithDuration.reduce((sum, m) => sum + (m.actualDuration || 0), 0) / completedWithDuration.length
    : 0;
  
  return {
    total,
    completed,
    scheduled,
    overdue,
    inProgress,
    completionRate: Math.round(completionRate),
    totalCost,
    avgCost: Math.round(avgCost),
    avgDuration: Math.round(avgDuration),
  };
};

// Verificar conflictos de programación
export const hasScheduleConflict = (
  newMaintenance: Partial<Maintenance>,
  existingMaintenances: Maintenance[]
): boolean => {
  if (!newMaintenance.machineId || !newMaintenance.scheduledDate) {
    return false;
  }
  
  return existingMaintenances.some(existing => {
    if (existing.machineId !== newMaintenance.machineId) {
      return false;
    }
    
    if (existing.status === MAINTENANCE_STATUS.COMPLETED ||
        existing.status === MAINTENANCE_STATUS.CANCELLED) {
      return false;
    }
    
    // Verificar si las fechas se solapan (mismo día)
    const existingDate = new Date(existing.scheduledDate);
    const newDate = new Date(newMaintenance.scheduledDate);
    
    return existingDate.toDateString() === newDate.toDateString();
  });
};

// Optimizar programación de mantenimientos
export const optimizeMaintenanceSchedule = (
  maintenances: Partial<Maintenance>[],
  constraints: {
    maxPerDay?: number;
    excludeWeekends?: boolean;
    excludeHolidays?: Date[];
  } = {}
): Partial<Maintenance>[] => {
  const { maxPerDay = 3, excludeWeekends = true, excludeHolidays = [] } = constraints;
  
  const optimized = [...maintenances];
  const dailyCounts: Record<string, number> = {};
  
  return optimized.map(maintenance => {
    if (!maintenance.scheduledDate) return maintenance;
    
    let proposedDate = new Date(maintenance.scheduledDate);
    let attempts = 0;
    const maxAttempts = 30; // Evitar bucle infinito
    
    while (attempts < maxAttempts) {
      const dateKey = proposedDate.toDateString();
      const dayCount = dailyCounts[dateKey] || 0;
      
      // Verificar restricciones
      const isWeekend = excludeWeekends && (proposedDate.getDay() === 0 || proposedDate.getDay() === 6);
      const isHoliday = excludeHolidays.some(holiday => 
        holiday.toDateString() === dateKey
      );
      const exceedsLimit = dayCount >= maxPerDay;
      
      if (!isWeekend && !isHoliday && !exceedsLimit) {
        dailyCounts[dateKey] = dayCount + 1;
        return {
          ...maintenance,
          scheduledDate: proposedDate,
        };
      }
      
      // Mover al siguiente día
      proposedDate = addDays(proposedDate, 1);
      attempts++;
    }
    
    // Si no se encontró fecha óptima, devolver original
    return maintenance;
  });
};
```

### `checklistHelpers.ts`
**Propósito**: Funciones específicas para checklists de chequeos rápidos

```typescript
import { 
  QuickCheck, 
  QuickCheckStatus, 
  ChecklistItem,
  QUICK_CHECK_STATUS,
  DEFAULT_CHECKLIST_ITEMS 
} from '@/models';

// Calcular puntuación de checklist
export const calculateChecklistScore = (checklist: ChecklistItem[]): number => {
  if (checklist.length === 0) return 0;
  
  const totalItems = checklist.length;
  const checkedItems = checklist.filter(item => item.checked).length;
  
  return (checkedItems / totalItems) * 100;
};

// Determinar estado basado en checklist y observaciones
export const determineQuickCheckStatus = (
  checklist: ChecklistItem[],
  hasObservations: boolean = false
): QuickCheckStatus => {
  const score = calculateChecklistScore(checklist);
  const hasFailedCritical = checklist.some(item => 
    item.required && !item.checked
  );
  
  if (hasFailedCritical) {
    return QUICK_CHECK_STATUS.CRITICAL;
  }
  
  if (score < 70 || hasObservations) {
    return QUICK_CHECK_STATUS.ATTENTION;
  }
  
  if (score >= 95) {
    return QUICK_CHECK_STATUS.EXCELLENT;
  }
  
  return QUICK_CHECK_STATUS.GOOD;
};

// Generar checklist por defecto basado en tipo de máquina
export const generateDefaultChecklist = (machineType: string): ChecklistItem[] => {
  const baseChecklist: ChecklistItem[] = [];
  
  // Agregar items por categoría
  Object.entries(DEFAULT_CHECKLIST_ITEMS).forEach(([category, items]) => {
    items.forEach((description, index) => {
      baseChecklist.push({
        id: `${category.toLowerCase()}_${index}`,
        category,
        description,
        checked: false,
        required: category === 'SAFETY', // Items de seguridad son requeridos
      });
    });
  });
  
  return baseChecklist;
};

// Validar completitud de checklist
export const validateChecklistCompletion = (checklist: ChecklistItem[]): {
  isValid: boolean;
  missingRequired: ChecklistItem[];
  score: number;
} => {
  const missingRequired = checklist.filter(item => item.required && !item.checked);
  const score = calculateChecklistScore(checklist);
  
  return {
    isValid: missingRequired.length === 0,
    missingRequired,
    score,
  };
};

// Comparar checklists para detectar tendencias
export const compareChecklists = (
  previous: ChecklistItem[],
  current: ChecklistItem[]
): {
  improved: ChecklistItem[];
  worsened: ChecklistItem[];
  unchanged: ChecklistItem[];
} => {
  const improved: ChecklistItem[] = [];
  const worsened: ChecklistItem[] = [];
  const unchanged: ChecklistItem[] = [];
  
  current.forEach(currentItem => {
    const previousItem = previous.find(p => p.id === currentItem.id);
    
    if (!previousItem) {
      unchanged.push(currentItem);
      return;
    }
    
    if (!previousItem.checked && currentItem.checked) {
      improved.push(currentItem);
    } else if (previousItem.checked && !currentItem.checked) {
      worsened.push(currentItem);
    } else {
      unchanged.push(currentItem);
    }
  });
  
  return { improved, worsened, unchanged };
};

// Generar resumen de checklist para reportes
export const generateChecklistSummary = (checklist: ChecklistItem[]) => {
  const total = checklist.length;
  const checked = checklist.filter(item => item.checked).length;
  const unchecked = total - checked;
  const requiredTotal = checklist.filter(item => item.required).length;
  const requiredChecked = checklist.filter(item => item.required && item.checked).length;
  const score = calculateChecklistScore(checklist);
  
  // Agrupar por categoría
  const byCategory = checklist.reduce((groups, item) => {
    const category = item.category || 'OTHER';
    if (!groups[category]) {
      groups[category] = { total: 0, checked: 0 };
    }
    groups[category].total++;
    if (item.checked) {
      groups[category].checked++;
    }
    return groups;
  }, {} as Record<string, { total: number; checked: number }>);
  
  return {
    overview: {
      total,
      checked,
      unchecked,
      score: Math.round(score),
    },
    required: {
      total: requiredTotal,
      checked: requiredChecked,
      missing: requiredTotal - requiredChecked,
      isComplete: requiredChecked === requiredTotal,
    },
    byCategory,
  };
};

// Calcular tendencia de chequeos
export const calculateCheckTrend = (quickChecks: QuickCheck[]): {
  trend: 'improving' | 'declining' | 'stable';
  averageScore: number;
  lastScore: number;
  change: number;
} => {
  if (quickChecks.length < 2) {
    return {
      trend: 'stable',
      averageScore: 0,
      lastScore: 0,
      change: 0,
    };
  }
  
  const scores = quickChecks.map(check => 
    calculateChecklistScore(check.checklist || [])
  );
  
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const lastScore = scores[scores.length - 1];
  const previousScore = scores[scores.length - 2];
  const change = lastScore - previousScore;
  
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (change > 5) trend = 'improving';
  else if (change < -5) trend = 'declining';
  
  return {
    trend,
    averageScore: Math.round(averageScore),
    lastScore: Math.round(lastScore),
    change: Math.round(change),
  };
};
```

## Principios de Desarrollo

### 1. Orientación al Dominio
- Funciones que entienden el contexto de negocio de FleetMan
- Conocimiento específico de entidades y reglas de negocio
- Abstracciones que faciliten el trabajo con datos del dominio

### 2. Reutilización Inteligente
- Funciones que se pueden usar en múltiples pantallas
- Lógica de negocio centralizada
- Evitar duplicación de cálculos complejos

### 3. Testabilidad
- Funciones puras cuando sea posible
- Parámetros claros y resultados predecibles
- Fácil de mockear para testing

### 4. Performance
- Memoización de cálculos costosos
- Evitar recálculos innecesarios
- Optimización para listas grandes

## Testing

### Helper Tests
```typescript
describe('Machine Helpers', () => {
  test('should calculate machine efficiency correctly', () => {
    const machine = createMockMachine({
      operatingHours: 1000,
      acquisitionDate: new Date('2023-01-01'),
    });
    
    const efficiency = calculateMachineEfficiency(machine);
    expect(efficiency).toBeGreaterThan(0);
    expect(efficiency).toBeLessThanOrEqual(100);
  });
  
  test('should detect maintenance needs', () => {
    const machine = createMockMachine({
      operatingHours: 500,
      lastMaintenanceDate: new Date('2023-01-01'),
    });
    
    expect(needsMaintenance(machine)).toBe(true);
  });
});
```

## Convenciones

### Nomenclatura
- Funciones: camelCase descriptivo
- Archivos: `domainHelpers.ts`
- Exports: named exports preferidos

### Documentación
- JSDoc para funciones complejas
- Ejemplos de uso cuando sea útil
- Descripción de parámetros y return values

### Organización
- Agrupar por dominio de negocio
- Una función por responsabilidad
- Barrel exports para importaciones limpias