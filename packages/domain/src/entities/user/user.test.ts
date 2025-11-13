// Test básico para verificar que la entidad User funciona correctamente
import { User, CreateUserProps } from './user.entity';
import { Email } from '../../value-objects/email.vo';
import { UserId } from '../../value-objects/user-id.vo';

// Esta función demuestra el uso básico de la entidad User
function demonstrateUserUsage() {
  // 1. Crear un nuevo UserId
  const userIdResult = UserId.create('user_123_abc');
  console.log('UserId creation:', userIdResult.success ? 'SUCCESS' : 'FAILED');

  // 2. Crear un nuevo Email
  const emailResult = Email.create('juan.perez@example.com');
  console.log('Email creation:', emailResult.success ? 'SUCCESS' : 'FAILED');
  
  if (emailResult.success) {
    console.log('Email domain:', emailResult.data.getDomain());
    console.log('Email censored:', emailResult.data.toCensoredString());
  }

  // 3. Preparar propiedades de usuario
  const createUserProps: CreateUserProps = {
    email: 'contacto@miempresa.com',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456', // Hash de ejemplo
    profile: {
      phone: '+54911234567',
      companyName: 'Mi Empresa SA',
      address: 'Calle Example 123, Galpón 2, Ciudad Autónoma de Buenos Aires',
    },
    type: 'CLIENT',
  };

  console.log('User creation props ready:', !!createUserProps);
  console.log('User type:', createUserProps.type);
  console.log('Profile has company name:', !!createUserProps.profile.companyName);
  console.log('Profile has address:', !!createUserProps.profile.address);
  
  // Nota: Para crear usuarios reales, use ClientUser.create() o ProviderUser.create()
  // La clase User base es abstracta y no se puede instanciar directamente
}

// Exportar la función para uso en tests
export { demonstrateUserUsage };