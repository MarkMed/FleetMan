import { z } from 'zod';
import { SortOrderSchema, PaginationSchema, BasePaginatedResponseSchema } from './common.types';

// =============================================================================
// REAL DRY APPROACH: Re-export de types del dominio
// =============================================================================

// Re-exportamos los types exactos del dominio para reutilización
export { UserType, UserProfile, CreateUserProps } from '../../domain/src/entities/user/user.entity';

// Import local para uso en schemas
import { UserType, UserProfile, CreateUserProps } from '../../domain/src/entities/user/user.entity';

// =============================================================================
// Schemas Zod basados en types IMPORTADOS del dominio (DRY REAL)
// =============================================================================

/**
 * Schema derivado del enum UserType del dominio
 */
export const UserTypeSchema = z.nativeEnum(UserType);

/**
 * Schema basado en la interfaz UserProfile del dominio
 */
export const UserProfileSchema = z.object({
  phone: z.string().optional(),
  companyName: z.string().optional(),
  address: z.string().optional()
}) satisfies z.ZodType<UserProfile>;

/**
 * Schema para crear usuario basado en CreateUserProps del dominio
 * (password sin hash para requests)
 */
export const CreateUserRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  profile: UserProfileSchema,
  type: UserTypeSchema
});

/**
 * Respuesta de usuario creado
 */
export const CreateUserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  profile: UserProfileSchema,
  type: UserTypeSchema,
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

/**
 * Schema para obtener usuario
 */
export const GetUserRequestSchema = z.object({
  id: z.string()
});

export const GetUserResponseSchema = CreateUserResponseSchema;

/**
 * Schema para actualizar usuario
 */
export const UpdateUserRequestSchema = z.object({
  id: z.string(),
  profile: UserProfileSchema.partial().optional(),
  isActive: z.boolean().optional()
});

export const UpdateUserResponseSchema = CreateUserResponseSchema;

/**
 * Schema para listar usuarios (usando types comunes)
 */
export const ListUsersRequestSchema = PaginationSchema.extend({
  type: UserTypeSchema.optional(),
  search: z.string().optional(),
  isActive: z.boolean().optional()
});

export const ListUsersResponseSchema = BasePaginatedResponseSchema.extend({
  users: z.array(CreateUserResponseSchema)
});

// =============================================================================
// Type Inference (derivados automáticamente del dominio)
// =============================================================================

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;

export type GetUserRequest = z.infer<typeof GetUserRequestSchema>;
export type GetUserResponse = z.infer<typeof GetUserResponseSchema>;

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;

export type ListUsersRequest = z.infer<typeof ListUsersRequestSchema>;
export type ListUsersResponse = z.infer<typeof ListUsersResponseSchema>;