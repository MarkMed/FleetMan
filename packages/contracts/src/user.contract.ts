import { z } from 'zod';
import { SortOrderSchema, PaginationSchema, BasePaginatedResponseSchema } from './common.types';

// =============================================================================
// Validation Constants (Sprint #13 Task 10.2)
// =============================================================================

/**
 * Límites de validación para todos los campos de UserProfile
 * SSOT: Centralizados en capa de contracts para reutilización en frontend/backend
 * Sprint #13 Task 10.1 + 10.2
 */
export const USER_PROFILE_LIMITS = {
  MAX_COMPANY_NAME_LENGTH: 100,
  MAX_PHONE_LENGTH: 20,
  MAX_ADDRESS_LENGTH: 200,
  MAX_BIO_LENGTH: 500,
  MAX_TAGS: 5,
  MAX_TAG_LENGTH: 100
} as const;

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
  bio?: string; // 🆕 Sprint #13 Task 10.2: Biografía
  tags?: string[]; // 🆕 Sprint #13 Task 10.2: Tags/etiquetas
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
 * 🆕 Sprint #13 Task 10.1 + 10.2: Validaciones completas para todos los campos
 * SSOT: Única fuente de verdad para validación de perfil de usuario
 */
export const UserProfileSchema = z.object({
  phone: z.string()
    .max(USER_PROFILE_LIMITS.MAX_PHONE_LENGTH, `Phone must be max ${USER_PROFILE_LIMITS.MAX_PHONE_LENGTH} characters`)
    .trim()
    .optional(),
  companyName: z.string()
    .max(USER_PROFILE_LIMITS.MAX_COMPANY_NAME_LENGTH, `Company name must be max ${USER_PROFILE_LIMITS.MAX_COMPANY_NAME_LENGTH} characters`)
    .trim()
    .optional(),
  address: z.string()
    .max(USER_PROFILE_LIMITS.MAX_ADDRESS_LENGTH, `Address must be max ${USER_PROFILE_LIMITS.MAX_ADDRESS_LENGTH} characters`)
    .trim()
    .optional(),
  bio: z.string()
    .max(USER_PROFILE_LIMITS.MAX_BIO_LENGTH, `Bio must be max ${USER_PROFILE_LIMITS.MAX_BIO_LENGTH} characters`)
    .trim()
    .optional(),
  tags: z.array(
    z.string()
      .max(USER_PROFILE_LIMITS.MAX_TAG_LENGTH, `Each tag must be max ${USER_PROFILE_LIMITS.MAX_TAG_LENGTH} characters`)
      .trim()
      .min(1, 'Tags cannot be empty')
      .transform(val => val.toLowerCase()) // Normalize to lowercase
  )
    .max(USER_PROFILE_LIMITS.MAX_TAGS, `Maximum ${USER_PROFILE_LIMITS.MAX_TAGS} tags allowed`)
    .optional()
    // NOTE: Duplicate check AFTER transform is intentional
    // Example: ['Tag', 'tag'] → ['tag', 'tag'] → detects duplicate correctly (case-insensitive)
    .refine(
      (tags) => {
        if (!tags || tags.length === 0) return true;
        const uniqueTags = new Set(tags);
        return uniqueTags.size === tags.length;
      },
      { message: 'Duplicate tags are not allowed' }
    )
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
 * Schema para actualizar usuario (admin use case - requiere id)
 */
export const UpdateUserRequestSchema = z.object({
  id: z.string(),
  profile: UserProfileSchema.partial().optional(),
  isActive: z.coerce.boolean().optional() // Puede venir como query o body param
});

export const UpdateUserResponseSchema = CreateUserResponseSchema;

/**
 * Schema para actualizar perfil propio (Sprint #13 Task 10.1+10.2)
 * Para endpoint PATCH /users/me/profile - sin id porque viene del JWT
 */
export const UpdateMyProfileRequestSchema = z.object({
  profile: UserProfileSchema.partial().optional()
});

export const UpdateMyProfileResponseSchema = CreateUserResponseSchema;

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

export type UpdateMyProfileRequest = z.infer<typeof UpdateMyProfileRequestSchema>;
export type UpdateMyProfileResponse = z.infer<typeof UpdateMyProfileResponseSchema>;

export type ListUsersRequest = z.infer<typeof ListUsersRequestSchema>;
export type ListUsersResponse = z.infer<typeof ListUsersResponseSchema>;

// =============================================================================
// Chat Access Control Schemas (Sprint #13 Task 9.3e-h)
// =============================================================================

/**
 * Schema para validar parámetros de ruta en accept/block chat endpoints
 * Sprint #13 Task 9.3g: Interfaces Layer Backend
 * 
 * Usado para validar el userId en rutas como:
 * POST /api/v1/messages/chats/:userId/accept
 * POST /api/v1/messages/chats/:userId/block
 */
export const ChatAccessControlParamsSchema = z.object({
  userId: z.string().min(1, 'User ID is required').max(100, 'User ID too long')
});

/**
 * Schema para request de aceptar chat
 * Sprint #13 Task 9.3g
 * 
 * NOTE: El userId viene de params, no del body
 * Body vacío, schema para consistencia con otros endpoints
 */
export const AcceptChatRequestSchema = z.object({});

/**
 * Schema para response de aceptar chat
 * Sprint #13 Task 9.3g
 */
export const AcceptChatResponseSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

/**
 * Schema para request de bloquear usuario
 * Sprint #13 Task 9.3g
 * 
 * NOTE: El userId viene de params, no del body
 * Body vacío, schema para consistencia con otros endpoints
 */
export const BlockUserRequestSchema = z.object({});

/**
 * Schema para response de bloquear usuario
 * Sprint #13 Task 9.3g
 */
export const BlockUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

// =============================================================================
// Type Inference - Chat Access Control
// =============================================================================

export type ChatAccessControlParams = z.infer<typeof ChatAccessControlParamsSchema>;
export type AcceptChatRequest = z.infer<typeof AcceptChatRequestSchema>;
export type AcceptChatResponse = z.infer<typeof AcceptChatResponseSchema>;
export type BlockUserRequest = z.infer<typeof BlockUserRequestSchema>;
export type BlockUserResponse = z.infer<typeof BlockUserResponseSchema>;