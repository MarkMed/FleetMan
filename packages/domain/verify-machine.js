// Script simple para verificar que Machine funciona con el nuevo MachineStatus
import { Machine, MachineType } from './dist/index.js';

console.log('=== Verificación de Machine con nuevo MachineStatus ===\n');

// Crear una máquina básica
const createMachineProps = {
  serialNumber: 'CAT-320D-TEST001',
  brand: 'Caterpillar',
  model: '320D',
  type: MachineType.EXCAVATOR,
  ownerId: 'user_test_123',
  createdById: 'user_test_123',
  nickname: 'Excavadora de Prueba',
};

const machineResult = Machine.create(createMachineProps);

if (!machineResult.success) {
  console.log('❌ Error creando Machine:', machineResult.error.message);
  process.exit(1);
}

const machine = machineResult.data;
console.log('✅ Machine creada exitosamente');
console.log('🚜 Máquina:', machine.getDisplayName());
console.log('⚡ Estado inicial:', machine.status.displayName);
console.log('🔄 ¿Operacional?:', machine.isOperational() ? '✅ Sí' : '❌ No');
console.log('🏠 ¿Retirada?:', machine.isRetired() ? '✅ Sí' : '❌ No');

console.log('\n=== Prueba completada ===');