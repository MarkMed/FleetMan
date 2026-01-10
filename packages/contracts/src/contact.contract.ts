import { z } from 'zod';
import { UserPublicProfileSchema } from './user-discovery.contract';

// =============================================================================
// CONTACT MANAGEMENT CONTRACTS (Sprint #12 Module 2)
// =============================================================================

/**
 * Path params validation for contact operations
 * Used in: POST/DELETE /api/v1/users/me/contacts/:contactUserId
 */
export const ContactUserIdParamSchema = z.object({
  contactUserId: z.string()
    .min(1, 'Contact user ID is required')
    .max(100, 'Contact user ID too long')
});

/**
 * Contact subdocument schema (for internal representation)
 * Matches IContact from domain
 */
export const ContactSchema = z.object({
  contactUserId: z.string(),
  addedAt: z.coerce.date()
  // TODO: Campos estratégicos para futuro (personalización de agenda)
  // nickname: z.string().max(100).optional(), // Alias personalizado
  // tags: z.array(z.string().max(50)).optional(), // Etiquetas
  // notes: z.string().max(500).optional(), // Notas privadas
  // isFavorite: z.boolean().optional() // Favorito
});

/**
 * Response schema for listing contacts
 * Reutiliza UserPublicProfileSchema de User Discovery (DRY/SSOT)
 */
export const ListContactsResponseSchema = z.object({
  contacts: z.array(UserPublicProfileSchema),
  total: z.number().int().nonnegative()
});

// =============================================================================
// TYPE EXPORTS (inferred from Zod schemas)
// =============================================================================

export type ContactUserIdParam = z.infer<typeof ContactUserIdParamSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type ListContactsResponse = z.infer<typeof ListContactsResponseSchema>;
