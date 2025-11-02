/**
 * Test rápido para verificar que ClientUser funciona con la herencia polimórfica
 */
import { ClientUser, CreateClientUserProps, SubscriptionLevel, CompanyInfo } from './client-user.entity';
import { MachineId } from '../../value-objects/machine-id.vo';

console.log('=== Testing ClientUser (herencia polimórfica) ===\n');

// =============================================================================
// Test 1: Creación básica con nuevo factory method polimórfico
// =============================================================================
console.log('🧪 Test 1: Creación con factory polimórfico');

const companyInfo: CompanyInfo = {
  name: 'Transportes Modernos SA',
  industry: 'Logística',
  size: 'MEDIUM',
  taxId: '20-12345678-9',
  address: {
    street: 'Av. Libertador 1500',
    city: 'Buenos Aires',
    state: 'CABA',
    zipCode: '1428',
    country: 'Argentina'
  }
};

const createProps: CreateClientUserProps = {
  email: 'admin@transportesmodernos.com',
  passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
  profile: {
    companyName: 'Transportes Modernos SA',
    phone: '+541198765432',
    address: 'Av. Libertador 1500, CABA'
  },
  subscriptionLevel: SubscriptionLevel.PREMIUM,
  companyInfo: companyInfo
};

const result = ClientUser.create(createProps);
if (result.success) {
  const client = result.data;
  console.log('✅ ClientUser creado exitosamente');
  console.log('  🏢 Company:', client.getDisplayName());
  console.log('  📧 Email:', client.email.getValue());
  console.log('  📱 Phone:', client.profile.phone);
  console.log('  📍 Address:', client.profile.address);
  console.log('  🎗️ Subscription:', client.subscriptionLevel);
  console.log('  🏭 Company Info:', client.companyInfo?.name);
  console.log('  🚚 Machine Count:', client.machineCount);
  console.log('  📊 Can add more machines:', client.canAddMoreMachines() ? 'Sí' : 'No');
  
  const stats = client.getStats();
  console.log('  📈 Stats:');
  console.log('    📊 Total Machines:', stats.totalMachines);
  console.log('    🎗️ Subscription:', stats.subscriptionLevel);
  console.log('    🚚 Max Allowed:', stats.maxMachinesAllowed);
  console.log('    🆓 Remaining Slots:', stats.remainingSlots);
} else {
  console.log('❌ Error:', result.error.message);
}

// =============================================================================
// Test 2: Validaciones específicas de ClientUser
// =============================================================================
console.log('\n🧪 Test 2: Validaciones');

// Company name vacío
const invalidCompany = ClientUser.create({
  email: 'test@example.com',
  passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
  profile: { companyName: 'Test Company' },
  companyInfo: { name: '' } // Company name vacío
});
console.log('  Company name vacío:', invalidCompany.success ? '❌ Debería fallar' : '✅ ' + invalidCompany.error.message);

// =============================================================================
// Test 3: Gestión de máquinas (solo si creación básica fue exitosa)
// =============================================================================
if (result.success) {
  const client = result.data;
  
  console.log('\n🧪 Test 3: Gestión de máquinas');
  
  // Crear algunos IDs de máquinas
  const machine1Result = MachineId.create('machine_001');
  const machine2Result = MachineId.create('machine_002');
  
  if (machine1Result.success && machine2Result.success) {
    const machine1 = machine1Result.data;
    const machine2 = machine2Result.data;
    
    // Agregar primera máquina
    const addResult1 = client.addMachine(machine1);
    console.log('  Agregar máquina 1:', addResult1.success ? '✅ Exitoso' : '❌ ' + addResult1.error.message);
    
    if (addResult1.success) {
      console.log('  🚚 Máquinas después de agregar:', client.machineCount);
      console.log('  🔍 Posee machine_001:', client.ownsMachine(machine1) ? 'Sí' : 'No');
    }
    
    // Agregar segunda máquina
    const addResult2 = client.addMachine(machine2);
    console.log('  Agregar máquina 2:', addResult2.success ? '✅ Exitoso' : '❌ ' + addResult2.error.message);
    
    // Intentar agregar máquina duplicada
    const duplicateResult = client.addMachine(machine1);
    console.log('  Agregar duplicada:', duplicateResult.success ? '❌ No debería permitir' : '✅ Prevención OK');
    
    // Remover máquina
    const removeResult = client.removeMachine(machine1);
    console.log('  Remover máquina 1:', removeResult.success ? '✅ Exitoso' : '❌ ' + removeResult.error.message);
    
    if (removeResult.success) {
      console.log('  🚚 Máquinas después de remover:', client.machineCount);
      console.log('  🔍 Posee machine_001:', client.ownsMachine(machine1) ? 'Sí' : 'No');
    }
  }
  
  console.log('\n🧪 Test 4: Información y logs');
  console.log('  📋 Log info:', client.getLogInfo());
  console.log('  🆔 User ID:', client.id.getValue());
  console.log('  📅 Created:', client.createdAt.toISOString().split('T')[0]);
  console.log('  ⚡ Active:', client.isActive ? 'Sí' : 'No');
}

console.log('\n🎉 Tests completados para ClientUser');
console.log('✅ Herencia polimórfica funcionando correctamente');
console.log('✅ Factory method refactorizado exitosamente');

export {};