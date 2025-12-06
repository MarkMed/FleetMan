import { MachineTypeRepository } from '@packages/persistence';
import { logger } from '../config/logger.config';

/**
 * Datos de seed para tipos de máquina
 * Estos son tipos comunes de equipos de manejo de materiales.
 * 
 * NOTA: Los usuarios pueden agregar más tipos e idiomas después del seed inicial.
 * Por ejemplo, un usuario brasilero puede agregar 'pt' a 'Forklift' existente.
 */
const MACHINE_TYPES_SEED = [
  // Tipos en inglés
  { name: 'Forklift', languages: ['en', 'es'] },
  { name: 'Reach Truck', languages: ['en'] },
  { name: 'Pallet Jack', languages: ['en'] },
  { name: 'Order Picker', languages: ['en'] },
  { name: 'Tow Tractor', languages: ['en'] },
  { name: 'Walkie Stacker', languages: ['en'] },
  { name: 'Side Loader', languages: ['en'] },
  { name: 'Telescopic Handler', languages: ['en'] },
  
  // Tipos en español
  { name: 'Autoelevador', languages: ['es', 'en'] },
  { name: 'Apilador Eléctrico', languages: ['es'] },
  { name: 'Transpaleta', languages: ['es'] },
  { name: 'Trilateral', languages: ['es', 'en'] },
  { name: 'Retráctil', languages: ['es'] },
  { name: 'Recoge Pedidos', languages: ['es'] },
  { name: 'Tractor de Arrastre', languages: ['es'] },
  { name: 'Apilador Manual', languages: ['es'] },
  
  // Tipos generales
  { name: 'Crane', languages: ['en'] },
  { name: 'Grúa', languages: ['es'] },
  { name: 'Platform Truck', languages: ['en'] },
  { name: 'Carretilla de Plataforma', languages: ['es'] }
];

/**
 * Función de seed inteligente que solo pobla si la DB está vacía.
 * 
 * IMPORTANTE: Esta función NO maneja la conexión a MongoDB.
 * Debe ser llamada después de que mongoose ya esté conectado.
 * 
 * Flujo:
 * 1. Consulta si existen registros de MachineType en DB
 * 2. Si existen registros (count > 0), skipea toda la lógica (retorna inmediatamente)
 * 3. Si NO existen registros (count === 0), ejecuta el seed completo
 * 
 * @returns Promise<void>
 */
export async function seedMachineTypesIfEmpty(): Promise<void> {
  try {
    const repository = new MachineTypeRepository();

    // 1. Verificar si ya existen registros en la DB
    const existingTypes = await repository.findAll();
    
    if (existingTypes.length > 0) {
      // DB ya tiene datos - SKIP seed
      logger.info({ count: existingTypes.length }, '⏭️  MachineTypes seed skipped: DB already populated');
      return;
    }

    // 2. DB está vacía - Ejecutar seed
    logger.info({ totalTypes: MACHINE_TYPES_SEED.length }, '🌱 Seeding MachineTypes: DB is empty, populating with initial data...');

    let created = 0;

    for (const typeData of MACHINE_TYPES_SEED) {
      try {
        // El repositorio ya maneja la lógica de crear o actualizar
        await repository.save(typeData.name, typeData.languages[0]);
        
        // Agregar idiomas adicionales si existen
        for (let i = 1; i < typeData.languages.length; i++) {
          await repository.save(typeData.name, typeData.languages[i]);
        }
        
        created++;
        
        // Log discreto solo en desarrollo (opcional)
        if (process.env.NODE_ENV === 'development') {
          logger.debug({ name: typeData.name, languages: typeData.languages }, 'MachineType created');
        }
      } catch (error: any) {
        logger.error({ name: typeData.name, error: error.message }, 'Failed to seed MachineType');
      }
    }

    logger.info({ created, total: MACHINE_TYPES_SEED.length }, '✅ MachineTypes seed completed successfully');

  } catch (error: any) {
    // No lanzar error para evitar que falle el startup del servidor
    // Solo loguear y continuar
    logger.error({ error: error.message }, '❌ Error during MachineTypes seed (non-critical, server will continue)');
  }
}

// ============================================================================
// SCRIPT STANDALONE - Solo se ejecuta si se corre directamente este archivo
// ============================================================================
// Para ejecutar manualmente: pnpm tsx apps/backend/src/scripts/seed-machine-types.ts
// Esto permite testear el seed sin levantar el servidor completo

if (require.main === module) {
  import('mongoose').then(async (mongoose) => {
    try {
      const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fleetman';
      await mongoose.default.connect(mongoUri);
      
      console.log('✅ Connected to MongoDB');

      await seedMachineTypesIfEmpty();

      await mongoose.default.disconnect();
      console.log('✅ Disconnected from MongoDB');
      process.exit(0);

    } catch (error) {
      console.error('❌ Error in standalone seed script:', error);
      process.exit(1);
    }
  });
}
