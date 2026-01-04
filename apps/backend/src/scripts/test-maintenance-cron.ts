/**
 * Script de Testing Manual para Maintenance Cronjob
 * 
 * Este script permite ejecutar el cronjob de mantenimiento manualmente
 * sin esperar al schedule configurado. Útil para:
 * 
 * 1. Testing durante desarrollo
 * 2. Debugging de problemas en producción
 * 3. Ejecución on-demand por admins
 * 4. Verificación después de despliegues
 * 
 * Uso:
 * ```bash
 * # Desde la raíz del backend
 * npx ts-node src/scripts/test-maintenance-cron.ts
 * 
 * # O con npm script (agregar a package.json)
 * npm run test:cron
 * ```
 * 
 * Qué hace:
 * 1. Conecta a la base de datos
 * 2. Ejecuta MaintenanceCronService.execute() una vez
 * 3. Muestra métricas detalladas
 * 4. Desconecta y termina
 * 
 * IMPORTANTE:
 * - NO inicia el scheduler (cron.schedule)
 * - Solo ejecuta la lógica una vez
 * - Usa las mismas configuraciones que el cronjob real
 * 
 * Sprint #11: Maintenance Alarms - Testing Tool
 */

import 'dotenv/config';
import { logger } from '../config/logger.config';
import { connectDatabase, disconnectDatabase } from '../config/database.config';
import { MaintenanceCronService } from '../services/cron/maintenance-cron.service';

async function testMaintenanceCron() {
  const startTime = new Date();
  logger.info('🧪 Starting manual maintenance cronjob test...');
  logger.info({ timestamp: startTime.toISOString() }, 'Test started at');

  try {
    // 1. Conectar a la base de datos
    logger.info('📡 Connecting to database...');
    await connectDatabase();
    logger.info('✅ Database connected');

    // 2. Crear instancia del cronjob service
    const cronService = new MaintenanceCronService();

    // 3. Ejecutar manualmente (sin schedule)
    logger.info('🔧 Executing maintenance cronjob manually...');
    await cronService.execute();

    // 4. Calcular duración total
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    logger.info(
      {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationMs: duration,
        durationMinutes: (duration / 1000 / 60).toFixed(2)
      },
      '✅ Manual cronjob test completed successfully'
    );

    // 5. Desconectar y salir
    await disconnectDatabase();
    logger.info('📡 Database disconnected');
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80));
    
    process.exit(0);

  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      '❌ Manual cronjob test failed'
    );

    // Intentar desconectar DB incluso si hubo error
    try {
      await disconnectDatabase();
    } catch (disconnectError) {
      logger.error({ error: disconnectError }, '❌ Failed to disconnect database');
    }

    console.log('\n' + '='.repeat(80));
    console.log('❌ TEST FAILED');
    console.log('='.repeat(80));
    
    process.exit(1);
  }
}

// Ejecutar el test
testMaintenanceCron();

// TODO: Agregar opciones de CLI para ejecución selectiva
// Razón: Poder ejecutar solo step 1 (update hours) o solo step 2 (check alarms)
// Uso: npx ts-node test-maintenance-cron.ts --only-hours
// Declaración:
// import yargs from 'yargs';
// const argv = yargs
//   .option('only-hours', { type: 'boolean', description: 'Only update operating hours' })
//   .option('only-alarms', { type: 'boolean', description: 'Only check maintenance alarms' })
//   .argv;
// if (argv['only-hours']) {
//   const useCase = new UpdateMachinesOperatingHoursUseCase();
//   await useCase.execute();
// }

// TODO: Agregar modo dry-run para verificación sin cambios
// Razón: Ver qué máquinas/alarmas serían afectadas sin aplicar cambios reales
// Uso: npx ts-node test-maintenance-cron.ts --dry-run
// Declaración:
// if (argv['dry-run']) {
//   logger.info('🔍 Running in DRY-RUN mode - no changes will be persisted');
//   // Pasar flag a use cases para que solo loggeen sin actualizar BD
// }

// TODO: Agregar reporte detallado en formato JSON/CSV
// Razón: Para análisis post-ejecución o integración con herramientas de BI
// Uso: npx ts-node test-maintenance-cron.ts --output report.json
// Declaración:
// import fs from 'fs/promises';
// const report = {
//   timestamp: new Date().toISOString(),
//   hoursResult: { updated: 10, skipped: 5, errors: [] },
//   alarmsResult: { checked: 20, triggered: 3, errors: [] }
// };
// await fs.writeFile('report.json', JSON.stringify(report, null, 2));
