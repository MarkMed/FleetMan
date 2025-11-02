// Test básico para verificar que la entidad Machine funciona correctamente
import { 
  Machine, 
  CreateMachineProps, 
  MachineSpecs,
  MachineLocation 
} from './machine.entity';
import { MachineStatus, MachineStatuses } from './machineStatus/machine-status';
import { UserId } from '../../value-objects/user-id.vo';
import { MachineId } from '../../value-objects/machine-id.vo';

// Esta función demuestra el uso básico de la entidad Machine
function demonstrateMachineUsage() {
  console.log('=== Demonstración de Machine ===\n');

  // 1. Crear especificaciones técnicas
  const specs: MachineSpecs = {
    enginePower: 300, // HP
    maxCapacity: 15000, // kg
    fuelType: 'DIESEL',
    year: 2022,
    weight: 25000, // kg
    operatingHours: 1250,
  };

  // 2. Crear información de ubicación
  const location: MachineLocation = {
    siteName: 'Construcción Torre Central',
    address: 'Av. Corrientes 1500, CABA, Argentina',
    coordinates: {
      latitude: -34.6037,
      longitude: -58.3816,
    },
    lastUpdated: new Date(),
  };

  // 3. Crear propiedades para Machine
  const createMachineProps: CreateMachineProps = {
    serialNumber: 'CAT-240D-ABC123XYZ',
    brand: 'Caterpillar',
    model: '240D',
    machineTypeId: 'EXCAVATOR',
    ownerId: 'user_client_12345',
    createdById: 'user_client_12345', // Mismo cliente que la creó
    specs: specs,
    location: location,
    nickname: 'Excavadora Principal',
  };

  // 4. Crear Machine
  const machineResult = Machine.create(createMachineProps);
  
  if (!machineResult.success) {
    console.log('❌ Error creando Machine:', machineResult.error.message);
    return;
  }

  const machine = machineResult.data;
  console.log('✅ Machine creada exitosamente');
  console.log('🚜 Máquina:', machine.getDisplayName());
  console.log('🔢 Serie:', machine.serialNumber.toCensoredString());
  console.log('📊 Tipo ID:', machine.machineTypeId.getValue());
  console.log('⚡ Estado:', machine.status.displayName);
  console.log('🏭 Identificador único:', machine.getUniqueIdentifier());
  console.log('📍 Ubicación:', machine.location?.siteName);
  console.log('⚙️ Potencia:', machine.specs?.enginePower, 'HP');
  console.log('🕐 Horas de operación:', machine.specs?.operatingHours);
  console.log('');

  // 5. Demostrar gestión de proveedor
  console.log('=== Gestión de Proveedor ===');
  
  const providerIdResult = UserId.create('user_provider_98765');
  if (providerIdResult.success) {
    const providerId = providerIdResult.data;
    
    console.log('🔧 Asignando proveedor...');
    const assignResult = machine.assignProvider(providerId);
    console.log('Asignación:', assignResult.success ? '✅ Exitosa' : `❌ Error: ${assignResult.error.message}`);
    
    if (assignResult.success) {
      console.log('👷 Tiene proveedor asignado:', machine.hasAssignedProvider() ? '✅ Sí' : '❌ No');
      console.log('📅 Asignado el:', machine.providerAssignedAt?.toISOString());
    }
  }
  console.log('');

  // 6. Demostrar cambios de estado
  console.log('=== Gestión de Estados ===');
  
  console.log('📊 Estado actual:', machine.status.displayName);
  console.log('🔄 ¿Operacional?:', machine.isOperational() ? '✅ Sí' : '❌ No');
  
  // Cambiar a mantenimiento
  const maintenanceResult = machine.changeStatus(MachineStatuses.Maintenance());
  console.log('Cambio a MAINTENANCE:', maintenanceResult.success ? '✅ Exitoso' : `❌ Error: ${maintenanceResult.error.message}`);
  
  if (maintenanceResult.success) {
    console.log('📊 Nuevo estado:', machine.status.displayName);
    console.log('🔄 ¿Operacional?:', machine.isOperational() ? '✅ Sí' : '❌ No');
  }
  
  // Volver a activo
  const activeResult = machine.changeStatus(MachineStatuses.Active());
  console.log('Cambio a ACTIVE:', activeResult.success ? '✅ Exitoso' : `❌ Error: ${activeResult.error.message}`);
  
  console.log('');

  // 7. Demostrar actualización de especificaciones
  console.log('=== Actualización de Especificaciones ===');
  
  const newSpecs = { operatingHours: 1300 };
  const updateSpecsResult = machine.updateSpecs(newSpecs);
  console.log('Actualización horas:', updateSpecsResult.success ? '✅ Exitosa' : `❌ Error: ${updateSpecsResult.error.message}`);
  
  if (updateSpecsResult.success) {
    console.log('🕐 Nuevas horas:', machine.specs?.operatingHours);
  }
  
  console.log('');

  // 8. Demostrar establecimiento de fecha de instalación
  console.log('=== Fecha de Instalación ===');
  
  const installDate = new Date('2022-03-15');
  const installResult = machine.setInstallDate(installDate);
  console.log('Fecha instalación:', installResult.success ? '✅ Establecida' : `❌ Error: ${installResult.error.message}`);
  
  if (installResult.success) {
    console.log('📅 Instalada el:', machine.installDate?.toISOString().split('T')[0]);
  }
  
  console.log('');

  // 9. Información para logs
  console.log('=== Información para Logs ===');
  console.log('Log info:', machine.getLogInfo());
  console.log('Serial censurado:', machine.serialNumber.toCensoredString());
}

// Función para demostrar validaciones de error
function demonstrateMachineValidations() {
  console.log('=== Demonstración de Validaciones ===\n');

  // 1. Número de serie inválido
  const invalidSerialProps: CreateMachineProps = {
    serialNumber: 'abc', // Muy corto
    brand: 'Caterpillar',
    model: '320D',
    machineTypeId: 'EXCAVATOR',
    ownerId: 'user_test_123',
    createdById: 'user_test_123',
  };

  const invalidSerialResult = Machine.create(invalidSerialProps);
  console.log('Serial inválido:', invalidSerialResult.success ? '✅ Creada' : `❌ Error esperado: ${invalidSerialResult.error.message}`);

  // 2. Brand vacío
  const emptyBrandProps: CreateMachineProps = {
    serialNumber: 'CAT-320D-ABC123',
    brand: '', // Vacío
    model: '320D',
    machineTypeId: 'EXCAVATOR',
    ownerId: 'user_test_123',
    createdById: 'user_test_123',
  };

  const emptyBrandResult = Machine.create(emptyBrandProps);
  console.log('Brand vacío:', emptyBrandResult.success ? '✅ Creada' : `❌ Error esperado: ${emptyBrandResult.error.message}`);

  // 3. Especificaciones inválidas
  const invalidSpecsProps: CreateMachineProps = {
    serialNumber: 'CAT-320D-ABC123',
    brand: 'Caterpillar',
    model: '320D',
    machineTypeId: 'EXCAVATOR',
    ownerId: 'user_test_123',
    createdById: 'user_test_123',
    specs: {
      enginePower: -100, // Negativo - inválido
      year: 2050, // Futuro - inválido
    },
  };

  const invalidSpecsResult = Machine.create(invalidSpecsProps);
  console.log('Specs inválidas:', invalidSpecsResult.success ? '✅ Creada' : `❌ Error esperado: ${invalidSpecsResult.error.message}`);

  // 4. Coordenadas inválidas
  const invalidLocationProps: CreateMachineProps = {
    serialNumber: 'CAT-320D-ABC123',
    brand: 'Caterpillar',
    model: '320D',
    machineTypeId: 'EXCAVATOR',
    ownerId: 'user_test_123',
    createdById: 'user_test_123',
    location: {
      coordinates: {
        latitude: 200, // Inválido
        longitude: -200, // Inválido
      },
      lastUpdated: new Date(),
    },
  };

  const invalidLocationResult = Machine.create(invalidLocationProps);
  console.log('Ubicación inválida:', invalidLocationResult.success ? '✅ Creada' : `❌ Error esperado: ${invalidLocationResult.error.message}`);
}

// Función para demostrar diferentes tipos de máquinas
function demonstrateMachineTypes() {
  console.log('=== Tipos de Máquinas ===\n');

  const machineConfigs = [
    {
      machineTypeId: 'EXCAVATOR',
      brand: 'Caterpillar',
      model: '320D',
      serial: 'CAT-320D-EXC001',
      nickname: 'Excavadora Yellow'
    },
    {
      machineTypeId: 'CRANE',
      brand: 'Liebherr',
      model: 'LTM1090',
      serial: 'LIE-LTM1090-CRN001',
      nickname: 'Grúa Grande'
    },
    {
      machineTypeId: 'FORKLIFT',
      brand: 'Toyota',
      model: '8FG25',
      serial: 'TOY-8FG25-FLT001',
      nickname: 'Montacarga Principal'
    },
    {
      machineTypeId: 'GENERATOR',
      brand: 'Cummins',
      model: 'C125D5',
      serial: 'CUM-C125D5-GEN001',
      nickname: 'Generador Backup'
    }
  ];

  machineConfigs.forEach((config, index) => {
    const createProps: CreateMachineProps = {
      serialNumber: config.serial,
      brand: config.brand,
      model: config.model,
      machineTypeId: config.machineTypeId,
      ownerId: 'user_demo_client',
      createdById: 'user_demo_client',
      nickname: config.nickname,
    };

    const result = Machine.create(createProps);
    
    if (result.success) {
      const machine = result.data;
      console.log(`${index + 1}. ${machine.getDisplayName()}`);
      console.log(`   Tipo: ${machine.machineTypeId.getValue()}`);
      console.log(`   Serie: ${machine.serialNumber.toCensoredString()}`);
      console.log(`   ID: ${machine.getUniqueIdentifier()}`);
      console.log('');
    }
  });
}

// Exportar las funciones para uso en tests
export { 
  demonstrateMachineUsage, 
  demonstrateMachineValidations, 
  demonstrateMachineTypes 
};