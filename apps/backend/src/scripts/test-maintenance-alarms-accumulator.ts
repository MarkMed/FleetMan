/**
 * Script de testing manual para verificar lógica de accumulator pattern
 * 
 * Propósito:
 * - Verificar suma correcta de acumulatedHours cuando ayer fue operativo
 * - Verificar skip cuando ayer NO fue operativo
 * - Verificar trigger + reset cuando acumulatedHours >= intervalHours
 * - Verificar múltiples alarmas en la misma máquina
 * 
 * Uso:
 *   cd apps/backend
 *   npx ts-node src/scripts/test-maintenance-alarms-accumulator.ts
 * 
 * Verificaciones:
 * 1. Alarmas acumulan horas solo si ayer fue operativo
 * 2. Alarmas NO acumulan si ayer NO fue operativo
 * 3. Trigger + reset a 0 cuando acumulatedHours >= intervalHours
 * 4. Múltiples alarmas en misma máquina se procesan independientemente
 * 5. Logs muestran proceso claramente (debug info)
 * 
 * Recomendaciones de Testing:
 * - Crear máquina de prueba con usageSchedule configurado
 * - Agregar 2-3 alarmas con diferentes intervalHours (ej: 50h, 100h, 200h)
 * - Configurar operatingDays para incluir día de ayer
 * - Ejecutar script y observar logs
 * - Verificar en DB que acumulatedHours se actualiza correctamente
 * 
 * Sprint #11: Maintenance Alarms - Accumulator Pattern Implementation
 */

import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../config/database.config';
import { CheckMaintenanceAlarmsUseCase } from '../application/maintenance/check-maintenance-alarms.use-case';
import { logger } from '../config/logger.config';

async function testAccumulatorLogic() {
  console.log('\n🧪 ========================================');
  console.log('   Testing Maintenance Alarms Accumulator Logic');
  console.log('========================================\n');

  try {
    // Conectar a DB
    await connectDatabase();
    console.log('✅ Connected to database\n');

    // Calcular día de ayer para mostrar al usuario
    const today = new Date().getDay();
    const yesterday = (today - 1 + 7) % 7;
    const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    
    console.log('📅 Context Information:');
    console.log(`   Today: ${dayMap[today]}`);
    console.log(`   Yesterday: ${dayMap[yesterday]} (machines that operated on this day will accumulate hours)`);
    console.log('');

    // Ejecutar use case
    console.log('⏳ Executing CheckMaintenanceAlarmsUseCase...\n');
    const useCase = new CheckMaintenanceAlarmsUseCase();
    const result = await useCase.execute();

    // Mostrar resultados
    console.log('\n📊 ========================================');
    console.log('   Execution Results');
    console.log('========================================');
    console.log(`   ✓ Alarms checked: ${result.alarmsChecked}`);
    console.log(`   ✓ Alarms triggered: ${result.alarmsTriggered}`);
    console.log(`   ✓ Errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      result.errors.forEach((err, index) => {
        console.log(`   ${index + 1}. Machine ${err.machineId}, Alarm ${err.alarmId}:`);
        console.log(`      ${err.error}`);
      });
    }

    // Resumen de qué se hizo
    console.log('\n📝 What happened:');
    if (result.alarmsChecked === 0) {
      console.log('   - No active alarms found (or no machines with alarms + usageSchedule)');
      console.log('   - TIP: Create a test machine with:');
      console.log('     * status: ACTIVE');
      console.log(`     * usageSchedule.operatingDays including ${dayMap[yesterday]}`);
      console.log('     * maintenanceAlarms with isActive: true');
    } else {
      console.log(`   - Processed ${result.alarmsChecked} active alarms`);
      if (result.alarmsTriggered > 0) {
        console.log(`   - ${result.alarmsTriggered} alarm(s) reached interval → triggered + reset to 0`);
        console.log('   - Check DB to verify acumulatedHours = 0 for triggered alarms');
      } else {
        console.log('   - No alarms triggered (not reached interval yet)');
        console.log('   - Check DB to verify acumulatedHours was incremented');
      }
    }

    console.log('\n✅ Test completed successfully');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ ========================================');
    console.error('   Test failed with error');
    console.error('========================================');
    console.error(error);
    console.error('========================================\n');
    process.exit(1);
  } finally {
    await disconnectDatabase();
    console.log('✅ Disconnected from database');
    process.exit(0);
  }
}

// Ejecutar test
testAccumulatorLogic();

// TODO: Agregar assertions automáticas
// Razón: Actualmente el script solo ejecuta y muestra logs. Para testing automatizado necesitamos assertions
// Ejemplo:
// - Verificar que máquina X tiene alarma Y con acumulatedHours = Z
// - Verificar que después de ejecutar, acumulatedHours se incrementó correctamente
// - Verificar que trigger resetea a 0
// Declaración:
// import { MachineRepository } from '@packages/persistence';
// const repo = new MachineRepository();
// const machineResult = await repo.findById(testMachineId);
// const alarm = machineResult.data.toPublicInterface().maintenanceAlarms?.find(a => a.id === testAlarmId);
// assert(alarm.acumulatedHours === expectedValue, 'Accumulated hours mismatch');

// TODO: Crear máquina de prueba automáticamente
// Razón: Para testing automatizado en CI/CD, necesitamos setup de datos de prueba
// Declaración:
// async function setupTestData(): Promise<{ machineId: string; alarmIds: string[] }> {
//   const machine = await createTestMachine({
//     status: 'ACTIVE',
//     usageSchedule: { dailyHours: 10, operatingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] },
//     maintenanceAlarms: [
//       { title: 'Test Alarm 1', intervalHours: 50, acumulatedHours: 45 }, // Cerca de trigger
//       { title: 'Test Alarm 2', intervalHours: 100, acumulatedHours: 10 }
//     ]
//   });
//   return { machineId: machine.id, alarmIds: machine.maintenanceAlarms.map(a => a.id) };
// }
// async function cleanupTestData(machineId: string): Promise<void> {
//   await repo.delete(machineId);
// }

// TODO: Agregar modo verbose para debugging
// Razón: Mostrar detalles de cada alarma procesada (útil para debugging issues)
// Declaración:
// const VERBOSE = process.env.VERBOSE === 'true';
// if (VERBOSE) {
//   console.log('Alarm details:', {
//     machineId, alarmId, currentAccumulated, newAccumulated, intervalHours
//   });
// }
