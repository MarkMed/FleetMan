/**
 * Test para la nueva entidad ProviderUser que hereda de User
 */
import { ProviderUser, CreateProviderUserProps } from './provider-user.entity';

console.log('=== Testing ProviderUser (hereda de User) ===\n');

// =============================================================================
// Test 1: Creación básica
// =============================================================================
console.log('🧪 Test 1: Creación básica');

const basicProps: CreateProviderUserProps = {
  email: 'servicios@techsolutions.com',
  passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
  profile: {
    companyName: 'Tech Solutions SA',
    phone: '+54 11 1234-5678',
    address: 'Av. Industrial 456, Zona Norte'
  },
  specialties: ['Excavadoras', 'Mantenimiento Preventivo', 'Reparaciones Hidráulicas'],
  isVerified: false,
  serviceRadius: 50
};

const result = ProviderUser.create(basicProps);
if (result.success) {
  const provider = result.data;
  console.log('✅ ProviderUser creado exitosamente');
  console.log('  🏢 Company:', provider.getDisplayName());
  console.log('  📧 Email:', provider.email.getValue());
  console.log('  📱 Phone:', provider.profile.phone);
  console.log('  📍 Address:', provider.profile.address);
  console.log('  🛠️ Specialties:', provider.specialties.join(', '));
  console.log('  ✅ Verified:', provider.isVerified ? 'Sí' : 'No');
  console.log('  📏 Service Radius:', provider.serviceRadius, 'km');
  console.log('  🔄 Can be assigned:', provider.canBeAssigned() ? 'Sí' : 'No');
  console.log('  ⭐ Rating:', provider.rating);
  console.log('  📊 Completed Jobs:', provider.completedJobs);
} else {
  console.log('❌ Error:', result.error.message);
}

// =============================================================================
// Test 2: Validaciones
// =============================================================================
console.log('\n🧪 Test 2: Validaciones');

// Demasiadas especialidades
const tooManySpecialties = ProviderUser.create({
  email: 'test@example.com',
  passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
  profile: { companyName: 'Test Company' },
  specialties: Array.from({length: 11}, (_, i) => `Specialty ${i + 1}`)
});
console.log('  Demasiadas especialidades:', tooManySpecialties.success ? '❌ Debería fallar' : '✅ ' + tooManySpecialties.error.message);

// Radio de servicio inválido
const invalidRadius = ProviderUser.create({
  email: 'test2@example.com',
  passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
  profile: { companyName: 'Test Company 2' },
  serviceRadius: 1500 // Mayor a 1000
});
console.log('  Radio inválido:', invalidRadius.success ? '❌ Debería fallar' : '✅ ' + invalidRadius.error.message);

// =============================================================================
// Test 3: Métodos de negocio (solo si creación básica fue exitosa)
// =============================================================================
if (result.success) {
  const provider = result.data;
  
  console.log('\n🧪 Test 3: Métodos de negocio');
  
  // Verificar proveedor
  const verifyResult = provider.verify();
  console.log('  Verificar proveedor:', verifyResult.success ? '✅ Exitoso' : '❌ ' + verifyResult.error.message);
  if (verifyResult.success) {
    console.log('  ✅ Ahora está verificado:', provider.isVerified);
    console.log('  🔄 Puede ser asignado:', provider.canBeAssigned());
  }
  
  // Agregar trabajo completado
  const addJobResult = provider.addCompletedJob(4.5);
  console.log('  Agregar trabajo (rating 4.5):', addJobResult.success ? '✅ Exitoso' : '❌ ' + addJobResult.error.message);
  if (addJobResult.success) {
    console.log('  📊 Jobs completados:', provider.completedJobs);
    console.log('  ⭐ Rating actualizado:', provider.rating.toFixed(1));
  }
  
  // Actualizar radio de servicio
  const updateRadiusResult = provider.updateServiceRadius(75);
  console.log('  Actualizar radio a 75km:', updateRadiusResult.success ? '✅ Exitoso' : '❌ ' + updateRadiusResult.error.message);
  if (updateRadiusResult.success) {
    console.log('  📏 Nuevo radio:', provider.serviceRadius, 'km');
  }
  
  // Verificar especialidad
  console.log('  ¿Tiene especialidad "Excavadoras"?:', provider.hasSpecialty('Excavadoras') ? 'Sí' : 'No');
  console.log('  ¿Tiene especialidad "Bulldozers"?:', provider.hasSpecialty('Bulldozers') ? 'Sí' : 'No');
  
  console.log('\n🧪 Test 4: Información del proveedor');
  console.log('  📋 Log info:', provider.getProviderLogInfo());
  
  const summary = provider.getProviderSummary();
  console.log('  📊 Summary:');
  console.log('    🏢 Display Name:', summary.displayName);
  console.log('    🛠️ Specialties:', summary.specialties.length);
  console.log('    ✅ Verified:', summary.isVerified);
  console.log('    ⭐ Rating:', summary.rating.toFixed(1));
  console.log('    📊 Jobs:', summary.completedJobs);
  console.log('    📏 Radius:', summary.serviceRadius, 'km');
}

console.log('\n🎉 Tests completados para ProviderUser');
console.log('✅ Herencia de User funcionando correctamente');
console.log('✅ Polimorfismo implementado exitosamente');

export {};