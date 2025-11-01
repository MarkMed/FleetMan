// Test básico para verificar que la entidad ClientUser funciona correctamente
import { 
  ClientUser, 
  CreateClientUserProps, 
  SubscriptionLevel, 
  CompanyInfo 
} from './client-user.entity';
import { MachineId } from '../../value-objects/machine-id.vo';

// Esta función demuestra el uso básico de la entidad ClientUser
function demonstrateClientUserUsage() {
  console.log('=== Demonstración de ClientUser ===\n');

  // 1. Crear información de empresa
  const companyInfo: CompanyInfo = {
    name: 'Transportes Rápidos S.A.',
    industry: 'Logística y Transporte',
    size: 'MEDIUM',
    taxId: 'CUIT-12345678901',
    address: {
      street: 'Av. Corrientes 1234',
      city: 'Buenos Aires',
      state: 'CABA',
      zipCode: '1043',
      country: 'Argentina',
    },
  };

  // 2. Crear propiedades para ClientUser
  const createClientProps: CreateClientUserProps = {
    email: 'gerente@transportesrapidos.com',
    passwordHash: '$2b$10$N9qo8uLOickgx2ZMRZoMye5J39N.F5gT67Nv9J1lJDhJWkUaQMa.W', // Hash válido de ejemplo
    profile: {
      firstName: 'María',
      lastName: 'González',
      phone: '+541145678900',
      companyName: 'Transportes Rápidos S.A.',
      position: 'Gerente de Flota',
    },
    subscriptionLevel: SubscriptionLevel.PREMIUM,
    companyInfo: companyInfo,
  };

  // 3. Crear ClientUser
  const clientResult = ClientUser.create(createClientProps);
  
  if (!clientResult.success) {
    console.log('❌ Error creando ClientUser:', clientResult.error.message);
    return;
  }

  const client = clientResult.data;
  console.log('✅ ClientUser creado exitosamente');
  console.log('📧 Email:', client.email.getValue());
  console.log('👤 Nombre completo:', client.getFullName());
  console.log('🏢 Empresa:', client.companyInfo?.name);
  console.log('📊 Suscripción:', client.subscriptionLevel);
  console.log('📈 Estadísticas:', client.getStats());
  console.log('');

  // 4. Demostrar gestión de máquinas
  console.log('=== Gestión de Máquinas ===');
  
  // Generar algunos IDs de máquinas
  const machine1 = MachineId.generate();
  const machine2 = MachineId.generate();
  const machine3 = MachineId.generate();

  console.log('🔧 Agregando máquinas...');
  
  // Agregar primera máquina
  const addResult1 = client.addMachine(machine1);
  console.log('Máquina 1:', addResult1.success ? '✅ Agregada' : `❌ Error: ${addResult1.error.message}`);
  
  // Agregar segunda máquina
  const addResult2 = client.addMachine(machine2);
  console.log('Máquina 2:', addResult2.success ? '✅ Agregada' : `❌ Error: ${addResult2.error.message}`);
  
  // Intentar agregar la misma máquina otra vez (debería fallar)
  const duplicateResult = client.addMachine(machine1);
  console.log('Máquina duplicada:', duplicateResult.success ? '✅ Agregada' : `❌ Error esperado: ${duplicateResult.error.message}`);

  console.log('📊 Estadísticas actualizadas:', client.getStats());
  console.log('');

  // 5. Demostrar verificaciones de propiedad
  console.log('=== Verificaciones de Propiedad ===');
  console.log('¿Posee máquina 1?', client.ownsMachine(machine1) ? '✅ Sí' : '❌ No');
  console.log('¿Posee máquina 3?', client.ownsMachine(machine3) ? '✅ Sí' : '❌ No');
  console.log('¿Puede agregar más máquinas?', client.canAddMoreMachines() ? '✅ Sí' : '❌ No');
  console.log('');

  // 6. Demostrar upgrade de suscripción
  console.log('=== Upgrade de Suscripción ===');
  const upgradeResult = client.upgradeSubscription(SubscriptionLevel.ENTERPRISE);
  console.log('Upgrade a Enterprise:', upgradeResult.success ? '✅ Exitoso' : `❌ Error: ${upgradeResult.error.message}`);
  
  if (upgradeResult.success) {
    console.log('📊 Estadísticas post-upgrade:', client.getStats());
  }
  
  console.log('');

  // 7. Información para logs
  console.log('=== Información para Logs ===');
  console.log('Log info:', client.getLogInfo());
  console.log('Email censurado:', client.email.toCensoredString());
}

// Función para demostrar validaciones de error
function demonstrateClientUserValidations() {
  console.log('=== Demonstración de Validaciones ===\n');

  // 1. Email inválido
  const invalidEmailProps: CreateClientUserProps = {
    email: 'email-invalido',
    passwordHash: '$2b$10$N9qo8uLOickgx2ZMRZoMye5J39N.F5gT67Nv9J1lJDhJWkUaQMa.W',
    profile: {
      firstName: 'Juan',
      lastName: 'Pérez',
    },
  };

  const invalidEmailResult = ClientUser.create(invalidEmailProps);
  console.log('Email inválido:', invalidEmailResult.success ? '✅ Creado' : `❌ Error esperado: ${invalidEmailResult.error.message}`);

  // 2. Password hash inválido
  const invalidPasswordProps: CreateClientUserProps = {
    email: 'test@example.com',
    passwordHash: 'password-muy-corto',
    profile: {
      firstName: 'Juan',
      lastName: 'Pérez',
    },
  };

  const invalidPasswordResult = ClientUser.create(invalidPasswordProps);
  console.log('Password inválido:', invalidPasswordResult.success ? '✅ Creado' : `❌ Error esperado: ${invalidPasswordResult.error.message}`);

  // 3. Perfil inválido
  const invalidProfileProps: CreateClientUserProps = {
    email: 'test@example.com',
    passwordHash: '$2b$10$N9qo8uLOickgx2ZMRZoMye5J39N.F5gT67Nv9J1lJDhJWkUaQMa.W',
    profile: {
      firstName: '', // Vacío - debería fallar
      lastName: 'Pérez',
    },
  };

  const invalidProfileResult = ClientUser.create(invalidProfileProps);
  console.log('Perfil inválido:', invalidProfileResult.success ? '✅ Creado' : `❌ Error esperado: ${invalidProfileResult.error.message}`);
}

// Exportar las funciones para uso en tests
export { demonstrateClientUserUsage, demonstrateClientUserValidations };