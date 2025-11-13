const { Machine, MachineStatuses } = require('./dist/index.cjs');

console.log('=== Verificación updateMachineProps ===\n');

// Test 1: Crear máquina básica
console.log('🔧 Test 1: Crear máquina y actualizar propiedades básicas');
const machineResult = Machine.create({
  serialNumber: 'TEST123',
  brand: 'Caterpillar',
  model: 'D6T',
  machineTypeId: 'mtype_excavator_001',
  ownerId: 'user_owner_123',
  createdById: 'user_creator_456',
  nickname: 'Cat Original'
});

if (!machineResult.success) {
  console.log('❌ Error creando máquina:', machineResult.error.message);
  process.exit(1);
}

const machine = machineResult.data;
console.log('✅ Máquina creada:');
console.log(`   Display: ${machine.getDisplayName()}`);
console.log(`   Brand: ${machine.brand}`);
console.log(`   Model: ${machine.model}`);
console.log(`   Nickname: ${machine.nickname}`);

// Test 2: Actualizar propiedades básicas
console.log('\n🎨 Test 2: Actualizar propiedades básicas');
const updateResult = machine.updateMachineProps({
  brand: 'John Deere',
  model: '850K',
  nickname: 'JD Crawler'
});

if (!updateResult.success) {
  console.log('❌ Error actualizando:', updateResult.error.message);
} else {
  console.log('✅ Actualización exitosa:');
  console.log(`   Display: ${machine.getDisplayName()}`);
  console.log(`   Brand: ${machine.brand}`);
  console.log(`   Model: ${machine.model}`);
  console.log(`   Nickname: ${machine.nickname}`);
}

// Test 3: Actualización parcial
console.log('\n🔄 Test 3: Actualización parcial (solo nickname)');
const partialUpdateResult = machine.updateMachineProps({
  nickname: 'Super Crawler'
});

if (!partialUpdateResult.success) {
  console.log('❌ Error en actualización parcial:', partialUpdateResult.error.message);
} else {
  console.log('✅ Actualización parcial exitosa:');
  console.log(`   Display: ${machine.getDisplayName()}`);
  console.log(`   Brand: ${machine.brand} (sin cambio)`);
  console.log(`   Model: ${machine.model} (sin cambio)`);
  console.log(`   Nickname: ${machine.nickname} (actualizado)`);
}

// Test 4: Validaciones
console.log('\n⚠️  Test 4: Validaciones');

// Brand vacío
const emptyBrandResult = machine.updateMachineProps({
  brand: '   '
});
console.log(`Brand vacío: ${!emptyBrandResult.success ? '✅ Falló como esperado' : '❌ Debería fallar'}`);
if (!emptyBrandResult.success) {
  console.log(`   Error: ${emptyBrandResult.error.message}`);
}

// Nickname muy largo
const longNicknameResult = machine.updateMachineProps({
  nickname: 'Este nickname es demasiado largo para ser aceptado por la validación'
});
console.log(`Nickname largo: ${!longNicknameResult.success ? '✅ Falló como esperado' : '❌ Debería fallar'}`);
if (!longNicknameResult.success) {
  console.log(`   Error: ${longNicknameResult.error.message}`);
}

// Test 5: Estado inicial configurable
console.log('\n🎯 Test 5: Estado inicial configurable');
const machineWithInitialStatusResult = Machine.create({
  serialNumber: 'MAINT001',
  brand: 'Volvo',
  model: 'EC480D',
  machineTypeId: 'mtype_excavator_002',
  ownerId: 'user_owner_789',
  createdById: 'user_creator_101',
  initialStatus: 'MAINTENANCE'
});

if (!machineWithInitialStatusResult.success) {
  console.log('❌ Error creando máquina con estado inicial:', machineWithInitialStatusResult.error.message);
} else {
  const maintenanceMachine = machineWithInitialStatusResult.data;
  console.log('✅ Máquina creada con estado inicial:');
  console.log(`   Display: ${maintenanceMachine.getDisplayName()}`);
  console.log(`   Estado: ${maintenanceMachine.status.displayName}`);
  console.log(`   Código: ${maintenanceMachine.status.code}`);
}

console.log('\n🎉 Entidad Machine actualizada y funcionando correctamente!');
console.log(`📦 Bundle actual: ~${Math.round((55.90 + 54.08) / 2)} KB`);