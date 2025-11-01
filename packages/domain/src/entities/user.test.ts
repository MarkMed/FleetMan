// Test básico para verificar que la entidad User funciona correctamente
import { User, UserType, CreateUserProps } from './user.entity';
import { Email } from '../value-objects/email.vo';
import { UserId } from '../value-objects/user-id.vo';

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

  // 3. Intentar crear un usuario (esto fallaría porque las clases derivadas no están implementadas)
  const createUserProps: CreateUserProps = {
    email: 'juan.perez@example.com',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456', // Hash de ejemplo
    profile: {
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+54911234567',
      companyName: 'Mi Empresa',
      position: 'Gerente',
    },
    type: UserType.CLIENT,
  };

  console.log('User creation props ready:', !!createUserProps);
  
  // Nota: No podemos crear el usuario aún porque necesitamos implementar ClientUser y ProviderUser
}

// Exportar la función para uso en tests
export { demonstrateUserUsage };