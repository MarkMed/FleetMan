import mongoose from 'mongoose';
import { MachineTypeRepository } from '@packages/persistence';

/**
 * Script de seed para tipos de máquina
 * Precarga tipos comunes de equipos de manejo de materiales
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

async function seedMachineTypes() {
  try {
    // Conectar a MongoDB (usar IPv4 explícitamente para evitar problemas con IPv6)
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fleetman';
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to MongoDB');

    // Crear instancia del repositorio
    const repository = new MachineTypeRepository();

    let created = 0;
    let updated = 0;

    for (const typeData of MACHINE_TYPES_SEED) {
      try {
        // El repositorio ya maneja la lógica de crear o actualizar
        const machineType = await repository.save(typeData.name, typeData.languages[0]);
        
        // Agregar idiomas adicionales si existen
        for (let i = 1; i < typeData.languages.length; i++) {
          await repository.save(typeData.name, typeData.languages[i]);
        }
        
        // Verificar si fue creación o actualización comparando idiomas
        const existing = await repository.findByName(typeData.name);
        if (existing && existing.languages.length === typeData.languages.length) {
          created++;
          console.log(`✨ Created: ${typeData.name} (${typeData.languages.join(', ')})`);
        } else {
          updated++;
          console.log(`🔄 Updated: ${typeData.name} (added languages)`);
        }
      } catch (error) {
        console.error(`❌ Error with ${typeData.name}:`, error);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   - Created: ${created}`);
    console.log(`   - Updated: ${updated}`);
    console.log(`   - Total: ${MACHINE_TYPES_SEED.length}`);

    // Desconectar
    await mongoose.disconnect();
    console.log('\n✅ Seed completed successfully');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding machine types:', error);
    process.exit(1);
  }
}

// Ejecutar seed
seedMachineTypes();
