import { MachineModel } from '@packages/persistence';
import { MachineTypeModel } from '@packages/persistence';
import { logger } from '../config/logger.config';

/**
 * Script de Migración: machineTypeId (ObjectId) → machineTypeName (free-text)
 * 
 * PROPÓSITO:
 * Migrar máquinas existentes desde el modelo antiguo (referencia a MachineType por ID)
 * al nuevo modelo (nombre de tipo como texto libre).
 * 
 * ESTRATEGIA:
 * 1. Leer todas las máquinas de la DB
 * 2. Para cada máquina con machineTypeId:
 *    a. Buscar el registro en MachineType collection por ese ID
 *    b. Obtener el campo 'name' del registro
 *    c. Asignar ese nombre al nuevo campo machineTypeName
 *    d. Si no existe el registro o no tiene nombre → asignar "EDITAR"
 * 3. Actualizar documento en MongoDB
 * 4. Log de progreso detallado
 * 
 * ROLLBACK:
 * Este script NO elimina el campo machineTypeId antiguo (solo deja de usarse).
 * Para rollback manual: volver a desplegar código antiguo y los datos siguen disponibles.
 * 
 * EJECUCIÓN:
 * - Standalone: pnpm tsx apps/backend/src/scripts/migrate-machine-type-to-text.ts [--dry-run] [--check]
 * - Desde código: import { migrateMachineTypeToText } from './scripts/migrate-machine-type-to-text'
 * 
 * SEGURIDAD:
 * - Dry-run mode disponible (solo simula, no escribe)
 * - Backup recomendado antes de ejecutar
 * - Operaciones atómicas por documento
 */

interface MigrationStats {
  totalMachines: number;
  migrated: number;
  skipped: number; // Ya tenían machineTypeName
  fallbackUsed: number; // Se usó "EDITAR" como fallback
  errors: number;
  errorDetails: Array<{ machineId: string; error: string }>;
}

/**
 * Verifica el estado de la migración sin ejecutarla.
 * Útil para saber cuántas máquinas necesitan migración.
 * 
 * IMPORTANTE: Esta función NO maneja la conexión a MongoDB.
 * Debe ser llamada después de que mongoose ya esté conectado.
 * 
 * @returns Promise con estadísticas de estado
 */
export async function checkMigrationStatus(): Promise<{
  totalMachines: number;
  alreadyMigrated: number;
  needsMigration: number;
  withoutTypeId: number;
}> {
  const totalMachines = await MachineModel.countDocuments({});
  const alreadyMigrated = await MachineModel.countDocuments({ machineTypeName: { $exists: true } });
  const withoutTypeId = await MachineModel.countDocuments({ 
    machineTypeId: { $exists: false },
    machineTypeName: { $exists: false }
  });
  const needsMigration = totalMachines - alreadyMigrated;

  return {
    totalMachines,
    alreadyMigrated,
    needsMigration,
    withoutTypeId
  };
}

/**
 * Función principal de migración que puede ser llamada desde código.
 * 
 * IMPORTANTE: Esta función NO maneja la conexión a MongoDB.
 * Debe ser llamada después de que mongoose ya esté conectado.
 * 
 * Flujo:
 * 1. Lee todas las máquinas de la DB
 * 2. Para cada máquina sin machineTypeName:
 *    - Si tiene machineTypeId → busca nombre en MachineType collection
 *    - Si no encuentra o no tiene ID → usa fallback "EDITAR"
 * 3. Actualiza documento con nuevo campo
 * 4. Retorna estadísticas de la migración
 * 
 * @param dryRun - Si es true, solo simula sin escribir a DB
 * @returns Promise<MigrationStats> - Estadísticas de la migración
 */
export async function migrateMachineTypeToText(dryRun: boolean = false): Promise<MigrationStats> {
  const stats: MigrationStats = {
    totalMachines: 0,
    migrated: 0,
    skipped: 0,
    fallbackUsed: 0,
    errors: 0,
    errorDetails: []
  };

  try {
    logger.info({ dryRun }, 'Starting machine type migration');

    // 1. Obtener todas las máquinas
    const machines = await MachineModel.find({}).select('_id serialNumber machineTypeId machineTypeName');
    stats.totalMachines = machines.length;

    logger.info({ totalMachines: stats.totalMachines }, 'Found machines to process');

    // 2. Procesar cada máquina
    for (const machine of machines) {
      try {
        // Skip si ya tiene machineTypeName (migración ya ejecutada)
        if (machine.machineTypeName) {
          stats.skipped++;
          logger.debug({ 
            machineId: machine._id, 
            machineTypeName: machine.machineTypeName 
          }, 'Machine already has machineTypeName, skipping');
          continue;
        }

        // Validar que tenga machineTypeId (campo antiguo)
        // NOTA: machineTypeId es legacy, accedemos mediante any por backwards compatibility
        const doc = machine as any;
        if (!doc.machineTypeId) {
          stats.fallbackUsed++;
          const fallbackName = 'EDITAR';
          
          logger.warn({ 
            machineId: machine._id,
            serialNumber: machine.serialNumber 
          }, 'Machine has no machineTypeId, using fallback');

          if (!dryRun) {
            await MachineModel.updateOne(
              { _id: machine._id },
              { 
                $set: { 
                  machineTypeName: fallbackName,
                  updatedAt: new Date()
                } 
              }
            );
          }
          
          stats.migrated++;
          continue;
        }

        // 3. Buscar el tipo de máquina en la collection MachineType
        const machineType = await MachineTypeModel.findById(doc.machineTypeId);

        let machineTypeName: string;

        if (!machineType || !machineType.name) {
          // No se encontró el registro o no tiene nombre → usar fallback
          stats.fallbackUsed++;
          machineTypeName = 'EDITAR';
          
          logger.warn({ 
            machineId: machine._id,
            machineTypeId: doc.machineTypeId,
            serialNumber: machine.serialNumber
          }, 'MachineType not found or has no name, using fallback');
        } else {
          // Usar el nombre del registro encontrado
          machineTypeName = machineType.name;
          
          logger.debug({ 
            machineId: machine._id,
            machineTypeId: doc.machineTypeId,
            machineTypeName,
            serialNumber: machine.serialNumber
          }, 'Found machineType name');
        }

        // 4. Actualizar la máquina con el nuevo campo
        if (!dryRun) {
          await MachineModel.updateOne(
            { _id: machine._id },
            { 
              $set: { 
                machineTypeName,
                updatedAt: new Date()
              }
              // NOTA: NO eliminamos machineTypeId (mantener para rollback)
              // Si quieres eliminarlo: $unset: { machineTypeId: '' }
            }
          );
        }

        stats.migrated++;
        
        // Log de progreso cada 10 máquinas
        if (stats.migrated % 10 === 0) {
          logger.info({ 
            progress: `${stats.migrated}/${stats.totalMachines}`,
            fallbackUsed: stats.fallbackUsed
          }, 'Migration progress');
        }

      } catch (error: any) {
        stats.errors++;
        stats.errorDetails.push({
          machineId: machine._id,
          error: error.message
        });
        
        logger.error({ 
          machineId: machine._id,
          error: error.message,
          serialNumber: machine.serialNumber
        }, 'Error migrating machine');
      }
    }

    // 5. Log final de estadísticas
    logger.info({ 
      stats,
      dryRun 
    }, 'Migration completed');

    return stats;

  } catch (error: any) {
    // No relanzar: esta función es llamada desde main.ts al startup.
    // Si falla, el servidor debe continuar igualmente (datos legacy no deben bloquear arranque).
    logger.error({ error: error.message }, 'Critical error during migration (non-critical, server will continue)');
    stats.errors++;
    stats.errorDetails.push({ machineId: 'GLOBAL', error: error.message });
    return stats;
  }
}

// ============================================================================
// SCRIPT STANDALONE - Solo se ejecuta si se corre directamente este archivo
// ============================================================================
// Para ejecutar manualmente: 
//   pnpm tsx apps/backend/src/scripts/migrate-machine-type-to-text.ts
//   pnpm tsx apps/backend/src/scripts/migrate-machine-type-to-text.ts --dry-run
//   pnpm tsx apps/backend/src/scripts/migrate-machine-type-to-text.ts --check
// Esto permite ejecutar la migración sin levantar el servidor completo

if (require.main === module) {
  import('mongoose').then(async (mongoose) => {
    try {
      // Leer argumentos de línea de comandos
      const args = process.argv.slice(2);
      const dryRun = args.includes('--dry-run');
      const checkOnly = args.includes('--check');

      const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fleetman';
      await mongoose.default.connect(mongoUri);
      
      console.log('✅ Connected to MongoDB');
      logger.info({ dryRun, checkOnly }, 'Machine Type Migration Script (Standalone Mode)');

      if (checkOnly) {
        // Solo verificar estado
        const status = await checkMigrationStatus();
        console.log('\n=== MIGRATION STATUS ===');
        console.log(`Total Machines: ${status.totalMachines}`);
        console.log(`Already Migrated: ${status.alreadyMigrated}`);
        console.log(`Needs Migration: ${status.needsMigration}`);
        console.log(`Without TypeId: ${status.withoutTypeId}`);
        console.log('========================\n');
      } else {
        // Ejecutar migración
        if (dryRun) {
          console.log('\n⚠️  DRY-RUN MODE - No changes will be written to database\n');
        } else {
          console.log('\n🚀 PRODUCTION MODE - Changes will be written to database');
          console.log('⚠️  Press Ctrl+C within 5 seconds to abort...\n');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

        const stats = await migrateMachineTypeToText(dryRun);

        // Mostrar resumen final
        console.log('\n=== MIGRATION SUMMARY ===');
        console.log(`Total Machines: ${stats.totalMachines}`);
        console.log(`Migrated: ${stats.migrated}`);
        console.log(`Skipped (already migrated): ${stats.skipped}`);
        console.log(`Fallback used ("EDITAR"): ${stats.fallbackUsed}`);
        console.log(`Errors: ${stats.errors}`);
        
        if (stats.errorDetails.length > 0) {
          console.log('\nErrors:');
          stats.errorDetails.forEach(err => {
            console.log(`  - Machine ${err.machineId}: ${err.error}`);
          });
        }
        
        console.log('=========================\n');

        if (!dryRun && stats.migrated > 0) {
          console.log('✅ Migration completed successfully!');
          console.log('Next steps:');
          console.log('1. Verify the migration in MongoDB:');
          console.log('   db.machines.find({ machineTypeName: { $exists: true } }).count()');
          console.log('2. Check fallback cases:');
          console.log('   db.machines.find({ machineTypeName: "EDITAR" })');
          console.log('3. Deploy frontend changes to use machineTypeName\n');
        }
      }

      await mongoose.default.disconnect();
      console.log('✅ Disconnected from MongoDB');
      process.exit(0);

    } catch (error) {
      console.error('❌ Error in standalone migration script:', error);
      process.exit(1);
    }
  });
}
