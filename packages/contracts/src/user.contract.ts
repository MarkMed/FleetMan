import { z } from 'zod';
import { SortOrderSchema, PaginationSchema, BasePaginatedResponseSchema } from './common.types';

// =============================================================================
// User Types & Enums
// =============================================================================

/**
 * Tipos de usuario en el sistema
 */
export enum UserType {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
}

/**
 * Información del perfil de usuario
 * Los usuarios representan empresas/compañías, no personas individuales
 */
export interface UserProfile {
  phone?: string;
  companyName?: string;
  address?: string;
}

/**
 * Propiedades para crear usuario
 */
export interface CreateUserProps {
  email: string;
  password: string; // Sin hash para requests
  profile: UserProfile;
  type: UserType;
}

// =============================================================================
// Schemas Zod
// =============================================================================

/**
 * Schema derivado del enum UserType
 */
export const UserTypeSchema = z.nativeEnum(UserType);

/**
 * Schema basado en la interfaz UserProfile
 */
export const UserProfileSchema = z.object({
  phone: z.string().optional(),
  companyName: z.string().optional(),
  address: z.string().optional()
}) satisfies z.ZodType<UserProfile>;

/**
 * Schema para crear usuario (password sin hash para requests)
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
  isActive: z.coerce.boolean().optional() // Puede venir como query o body param
});

export const UpdateUserResponseSchema = CreateUserResponseSchema;

/**
 * Schema para listar usuarios
 */
export const ListUsersRequestSchema = PaginationSchema.extend({
  type: UserTypeSchema.optional(),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional() // Query param llega como "true"/"false"
});

export const ListUsersResponseSchema = BasePaginatedResponseSchema.extend({
  users: z.array(CreateUserResponseSchema)
});

// =============================================================================
// Type Inference
// =============================================================================

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;

export type GetUserRequest = z.infer<typeof GetUserRequestSchema>;
export type GetUserResponse = z.infer<typeof GetUserResponseSchema>;

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;

export type ListUsersRequest = z.infer<typeof ListUsersRequestSchema>;
export type ListUsersResponse = z.infer<typeof ListUsersResponseSchema>;