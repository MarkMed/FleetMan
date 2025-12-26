import { MachineEventTypeRepository } from '@packages/persistence';
import { logger } from '../config/logger.config';
import { NOTIFICATION_MESSAGE_KEYS } from '../constants/notification-messages.constants';

/**
 * Datos de seed para tipos de eventos de máquina
 * 
 * Incluye tipos de sistema (automáticos) y tipos sugeridos (manuales).
 * Estrategia 1000 IQ: Crowdsourcing - usuarios pueden crear custom types después,
 * pero core types siempre existen.
 * 
 * NOTA: Estos son los tipos de eventos en español por defecto.
 * Los usuarios pueden agregar más tipos e idiomas después del seed inicial.
 * Por ejemplo, un usuario puede agregar 'en' a 'Mantenimiento Completado' existente.
 */
const MACHINE_EVENT_TYPES_SEED = [
  // ===== TIPOS DE SISTEMA (Automáticos) =====
  // Generados por features del sistema (QuickCheck, Alertas, etc.)
  // Usan constantes del archivo machine-event-type-keys.constants.ts
  // Esto permite binding automático en use cases y evita typos
  // Languages: ['es', 'en'] indica disponibilidad para todos los idiomas soportados
  { 
    name: NOTIFICATION_MESSAGE_KEYS.quickcheck.completed.approved, 
    languages: ['es', 'en'], 
    systemGenerated: true 
  },
  { 
    name: NOTIFICATION_MESSAGE_KEYS.quickcheck.completed.disapproved, 
    languages: ['es', 'en'], 
    systemGenerated: true 
  },
  { 
    name: NOTIFICATION_MESSAGE_KEYS.maintenance.scheduled, 
    languages: ['es', 'en'], 
    systemGenerated: true 
  },
  { 
    name: NOTIFICATION_MESSAGE_KEYS.maintenance.reminder, 
    languages: ['es', 'en'], 
    systemGenerated: true 
  },
  { 
    name: NOTIFICATION_MESSAGE_KEYS.maintenance.cancelled, 
    languages: ['es', 'en'],
    systemGenerated: true 
  },
  { 
    name: NOTIFICATION_MESSAGE_KEYS.maintenance.completed, 
    languages: ['es', 'en'],
    systemGenerated: true 
  },
  
  // ===== TIPOS SUGERIDOS (Manuales) - ESPAÑOL =====
  // Tipos comunes que los usuarios pueden reportar manualmente
  // Estos son opciones precargadas según el idioma del usuario
  { 
    name: 'Mantenimiento Completado', 
    languages: ['es'], 
    systemGenerated: false 
  },
  { 
    name: 'Reparación Iniciada', 
    languages: ['es'], 
    systemGenerated: false 
  },
  { 
    name: 'Reparación Completada', 
    languages: ['es'], 
    systemGenerated: false 
  },
  { 
    name: 'Rotura', 
    languages: ['es'], 
    systemGenerated: false 
  },
  { 
    name: 'Incidente de Seguridad', 
    languages: ['es'], 
    systemGenerated: false 
  },
  { 
    name: 'Máquina Detenida', 
    languages: ['es'], 
    systemGenerated: false 
  },
  { 
    name: 'Cambio de Estado', 
    languages: ['es'], 
    systemGenerated: false 
  },
  { 
    name: 'Inspección Técnica', 
    languages: ['es'], 
    systemGenerated: false 
  },
  { 
    name: 'Cambio de Repuesto', 
    languages: ['es'], 
    systemGenerated: false 
  },
  { 
    name: 'Lubricación', 
    languages: ['es'], 
    systemGenerated: false 
  },
  { 
    name: 'Limpieza Profunda', 
    languages: ['es'], 
    systemGenerated: false 
  },
  { 
    name: 'Calibración', 
    languages: ['es'], 
    systemGenerated: false 
  },

  // ===== TIPOS SUGERIDOS (Manuales) - ENGLISH =====
  // Same suggested types but in English for English-speaking users
  { 
    name: 'Maintenance Completed', 
    languages: ['en'], 
    systemGenerated: false 
  },
  { 
    name: 'Repair Started', 
    languages: ['en'], 
    systemGenerated: false 
  },
  { 
    name: 'Repair Completed', 
    languages: ['en'], 
    systemGenerated: false 
  },
  { 
    name: 'Breakdown', 
    languages: ['en'], 
    systemGenerated: false 
  },
  { 
    name: 'Safety Incident', 
    languages: ['en'], 
    systemGenerated: false 
  },
  { 
    name: 'Machine Stopped', 
    languages: ['en'], 
    systemGenerated: false 
  },
  { 
    name: 'Status Change', 
    languages: ['en'], 
    systemGenerated: false 
  },
  { 
    name: 'Technical Inspection', 
    languages: ['en'], 
    systemGenerated: false 
  },
  { 
    name: 'Part Replacement', 
    languages: ['en'], 
    systemGenerated: false 
  },
  { 
    name: 'Lubrication', 
    languages: ['en'], 
    systemGenerated: false 
  },
  { 
    name: 'Deep Cleaning', 
    languages: ['en'], 
    systemGenerated: false 
  },
  { 
    name: 'Calibration', 
    languages: ['en'], 
    systemGenerated: false 
  }
];

/**
 * Función de seed inteligente que solo pobla si la DB está vacía.
 * 
 * IMPORTANTE: Esta función NO maneja la conexión a MongoDB.
 * Debe ser llamada después de que mongoose ya esté conectado.
 * 
 * Flujo:
 * 1. Consulta si existen registros de MachineEventType en DB
 * 2. Si existen registros (count > 0), skipea toda la lógica (retorna inmediatamente)
 * 3. Si NO existen registros (count === 0), ejecuta el seed completo
 * 
 * Estrategia: Usar repository.save() para aprovechar la lógica de upsert 
 * que maneja duplicados y race conditions (error code 11000).
 * 
 * @returns Promise<void>
 */
export async function seedMachineEventTypesIfEmpty(): Promise<void> {
  try {
    const repository = new MachineEventTypeRepository();

    // 1. Verificar si ya existen registros en la DB
    const existingTypes = await repository.findAllActive();
    
    if (existingTypes.length > 0) {
      // DB ya tiene datos - SKIP seed
      logger.info({ count: existingTypes.length }, '⏭️  MachineEventTypes seed skipped: DB already populated');
      return;
    }

    // 2. DB está vacía - Ejecutar seed
    logger.info({ totalTypes: MACHINE_EVENT_TYPES_SEED.length }, '🌱 Seeding MachineEventTypes: DB is empty, populating with initial data...');

    let created = 0;

    for (const typeData of MACHINE_EVENT_TYPES_SEED) {
      try {
        // El repositorio maneja la lógica de crear o actualizar (patrón MachineType)
        await repository.save(
          typeData.name,
          typeData.languages[0],
          typeData.systemGenerated
        );
        
        // Agregar idiomas adicionales si existen
        for (let i = 1; i < typeData.languages.length; i++) {
          await repository.save(
            typeData.name,
            typeData.languages[i],
            typeData.systemGenerated
          );
        }
        
        created++;
        
        // Log discreto solo en desarrollo
        if (process.env.NODE_ENV === 'development') {
          logger.debug({ 
            name: typeData.name, 
            languages: typeData.languages,
            systemGenerated: typeData.systemGenerated 
          }, 'MachineEventType created');
        }
      } catch (error: any) {
        logger.error({ name: typeData.name, error: error.message }, 'Failed to seed MachineEventType');
      }
    }

    logger.info({ created, total: MACHINE_EVENT_TYPES_SEED.length }, '✅ MachineEventTypes seed completed successfully');

  } catch (error: any) {
    // No lanzar error para evitar que falle el startup del servidor
    // Solo loguear y continuar
    logger.error({ error: error.message }, '❌ Error during MachineEventTypes seed (non-critical, server will continue)');
  }
}

// ============================================================================
// SCRIPT STANDALONE - Solo se ejecuta si se corre directamente este archivo
// ============================================================================
// Para ejecutar manualmente: pnpm tsx apps/backend/src/scripts/seed-machine-event-types.ts
// Esto permite testear el seed sin levantar el servidor completo

if (require.main === module) {
  import('mongoose').then(async (mongoose) => {
    try {
      const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fleetman';
      await mongoose.default.connect(mongoUri);
      
      console.log('✅ Connected to MongoDB');

      await seedMachineEventTypesIfEmpty();

      await mongoose.default.disconnect();
      console.log('✅ Disconnected from MongoDB');
      process.exit(0);

    } catch (error) {
      console.error('❌ Error in standalone seed script:', error);
      process.exit(1);
    }
  });
}
