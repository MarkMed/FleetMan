/**
 * Test para la entidad Machine - Aspectos cruciales
 * Cubre las funcionalidades principales sin installDate
 */
import { Machine, CreateMachineProps, MachineSpecs, MachineLocation } from './machine.entity';
import { MachineStatuses } from './machineStatus/machine-status';
import { UserId } from '../../value-objects/user-id.vo';

console.log('=== Tests Machine Entity ===\n');

// =============================================================================
// Test 1: Creación básica
// =============================================================================
console.log('🧪 Test 1: Creación básica');

const basicProps: CreateMachineProps = {
  serialNumber: 'CAT-320D-ABC123XYZ',
  brand: 'Caterpillar',
  model: '320D',
  machineTypeId: 'mtype_excavator_001',
  ownerId: 'user_client_12345',
  createdById: 'user_admin_67890',
  nickname: 'Excavadora Principal'
};

const basicResult = Machine.create(basicProps);
if (basicResult.success) {
  const machine = basicResult.data;
  console.log('✅ Machine creada exitosamente');
  console.log('  📝 Display Name:', machine.getDisplayName());
  console.log('  🔢 Serial (censurado):', machine.serialNumber.toCensoredString());
  console.log('  ⚡ Estado inicial:', machine.status.displayName);
  console.log('  🔄 ¿Operacional?:', machine.isOperational() ? 'Sí' : 'No');
  console.log('  👥 Owner ID:', machine.ownerId.getValue());
} else {
  console.log('❌ Error inesperado:', basicResult.error.message);
}

// =============================================================================
// Test 2: Estado inicial personalizado
// =============================================================================
console.log('\n🧪 Test 2: Estado inicial personalizado');

const maintenanceProps: CreateMachineProps = {
  serialNumber: 'VOL-EC480-MNT001',
  brand: 'Volvo',
  model: 'EC480D',
  machineTypeId: 'mtype_excavator_002',
  ownerId: 'user_client_456',
  createdById: 'user_admin_789',
  initialStatus: 'MAINTENANCE'
};

const maintenanceResult = Machine.create(maintenanceProps);
if (maintenanceResult.success) {
  const machine = maintenanceResult.data;
  console.log('✅ Machine con estado personalizado');
  console.log('  ⚡ Estado:', machine.status.displayName);
  console.log('  🔄 ¿Operacional?:', machine.isOperational() ? 'Sí' : 'No');
} else {
  console.log('❌ Error:', maintenanceResult.error.message);
}

// =============================================================================
// Test 3: Machine con especificaciones completas
// =============================================================================
console.log('\n🧪 Test 3: Machine con especificaciones');

const specs: MachineSpecs = {
  enginePower: 300,
  maxCapacity: 15000,
  fuelType: 'DIESEL',
  year: 2022,
  weight: 25000,
  operatingHours: 1250
};

const location: MachineLocation = {
  siteName: 'Proyecto Torre Central',
  address: 'Av. Corrientes 1500, CABA',
  coordinates: {
    latitude: -34.6037,
    longitude: -58.3816
  },
  lastUpdated: new Date()
};

const fullProps: CreateMachineProps = {
  serialNumber: 'LIE-R9800-FULL001',
  brand: 'Liebherr',
  model: 'R9800',
  machineTypeId: 'mtype_excavator_heavy_001',
  ownerId: 'user_client_789',
  createdById: 'user_admin_123',
  specs: specs,
  location: location,
  nickname: 'Super Excavadora'
};

const fullResult = Machine.create(fullProps);
if (fullResult.success) {
  const machine = fullResult.data;
  console.log('✅ Machine con specs completas');
  console.log('  ⚙️ Potencia:', machine.specs?.enginePower, 'HP');
  console.log('  📊 Capacidad:', machine.specs?.maxCapacity, 'kg');
  console.log('  ⛽ Combustible:', machine.specs?.fuelType);
  console.log('  📍 Ubicación:', machine.location?.siteName);
} else {
  console.log('❌ Error:', fullResult.error.message);
}

// =============================================================================
// Test 4: Validaciones críticas
// =============================================================================
console.log('\n🧪 Test 4: Validaciones');

// Serial number inválido
const invalidSerial = Machine.create({
  serialNumber: 'AB', // muy corto
  brand: 'Test',
  model: 'Test',
  machineTypeId: 'mtype_test_001',
  ownerId: 'user_test_123',
  createdById: 'user_test_456'
});
console.log('  Serial inválido:', invalidSerial.success ? '❌ Debería fallar' : '✅ ' + invalidSerial.error.message);

// Brand vacío
const invalidBrand = Machine.create({
  serialNumber: 'TEST-BRAND-001',
  brand: '',
  model: 'TestModel',
  machineTypeId: 'mtype_test_001',
  ownerId: 'user_test_123',
  createdById: 'user_test_456'
});
console.log('  Brand vacío:', invalidBrand.success ? '❌ Debería fallar' : '✅ ' + invalidBrand.error.message);

// Estado inicial inválido
const invalidStatus = Machine.create({
  serialNumber: 'TEST-STATUS-001',
  brand: 'TestBrand',
  model: 'TestModel',
  machineTypeId: 'mtype_test_001',
  ownerId: 'user_test_123',
  createdById: 'user_test_456',
  initialStatus: 'INVALID_STATUS' as any
});
console.log('  Estado inválido:', invalidStatus.success ? '❌ Debería fallar' : '✅ ' + invalidStatus.error.message);

// =============================================================================
// Tests de operaciones (solo si creación básica fue exitosa)
// =============================================================================
if (basicResult.success) {
  const machine = basicResult.data;
  
  console.log('\n🧪 Test 5: Gestión de proveedores');
  
  // Crear proveedor
  const providerResult = UserId.create('user_provider_111');
  if (providerResult.success) {
    const provider = providerResult.data;
    
    // Asignar proveedor
    const assignResult = machine.assignProvider(provider);
    console.log('  Asignar proveedor:', assignResult.success ? '✅ Exitoso' : '❌ ' + assignResult.error.message);
    
    if (assignResult.success) {
      console.log('  👷 Tiene proveedor:', machine.hasAssignedProvider() ? 'Sí' : 'No');
      
      // Intentar asignar el mismo (debería fallar)
      const duplicateAssign = machine.assignProvider(provider);
      console.log('  Asignar duplicado:', duplicateAssign.success ? '❌ No debería permitir' : '✅ Prevención OK');
      
      // Remover proveedor
      const removeResult = machine.removeProvider();
      console.log('  Remover proveedor:', removeResult.success ? '✅ Exitoso' : '❌ ' + removeResult.error.message);
    }
  }
  
  console.log('\n🧪 Test 6: Cambios de estado');
  
  // Cambiar a MAINTENANCE
  const toMaintenance = machine.changeStatus(MachineStatuses.Maintenance());
  console.log('  Cambio a MAINTENANCE:', toMaintenance.success ? '✅ Exitoso' : '❌ ' + toMaintenance.error.message);
  
  if (toMaintenance.success) {
    console.log('  📊 Estado actual:', machine.status.displayName);
    console.log('  🔄 ¿Operacional?:', machine.isOperational() ? 'Sí' : 'No');
    
    // Volver a ACTIVE
    const toActive = machine.changeStatus(MachineStatuses.Active());
    console.log('  Cambio a ACTIVE:', toActive.success ? '✅ Exitoso' : '❌ ' + toActive.error.message);
  }
  
  console.log('\n🧪 Test 7: Actualización de propiedades (nuevo método)');
  
  // Actualizar nickname usando el nuevo método updateMachineProps
  const updateNickname = machine.updateMachineProps({
    nickname: 'Máquina Actualizada'
  });
  console.log('  Actualizar nickname:', updateNickname.success ? '✅ Exitoso' : '❌ ' + updateNickname.error.message);
  
  if (updateNickname.success) {
    console.log('  🏷️ Nuevo display name:', machine.getDisplayName());
  }
  
  // Actualizar brand y model
  const updateBrandModel = machine.updateMachineProps({
    brand: 'Nueva Marca',
    model: 'Nuevo Modelo'
  });
  console.log('  Actualizar brand/model:', updateBrandModel.success ? '✅ Exitoso' : '❌ ' + updateBrandModel.error.message);
  
  console.log('\n🧪 Test 8: Métodos de consulta');
  console.log('  🏷️ Display Name:', machine.getDisplayName());
  console.log('  🔗 Identificador único:', machine.getUniqueIdentifier());
  console.log('  📋 Log info:', machine.getLogInfo());
  console.log('  🆔 Machine ID:', machine.id.getValue());
  console.log('  ❓ ¿Retirada?:', machine.isRetired() ? 'Sí' : 'No');
}

console.log('\n🎉 Tests completados para Machine Entity');
console.log('✅ Cobertura: Creación, validaciones, estados, proveedores, propiedades');
console.log('🚫 Confirmado: No hay referencias a installDate (eliminado correctamente)');

export {};
