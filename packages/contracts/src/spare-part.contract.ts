import { z } from 'zod';
import type { ISparePart } from '@packages/domain';

/**
 * Spare Part Contracts (DTOs)
 * Sprint #15/16 - Task 7.1: Alta/edición repuesto (RF-012/014)
 * 
 * Zod schemas for request validation and TypeScript types
 * Pattern: Similar to machine-type.contract.ts
 * 
 * Used by:
 * - API request validation middleware
 * - Frontend form validation
 * - OpenAPI/Swagger documentation
 */

// =============================================================================
// RESPONSE SCHEMA (Read)
// =============================================================================

/**
 * Spare Part response schema
 * Represents a spare part as returned by the API
 */
export const SparePartResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  serialId: z.string(),
  amount: z.number().int().min(0),
  machineId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
}) satisfies z.ZodType<ISparePart>;

export type SparePartResponse = z.infer<typeof SparePartResponseSchema>;

// =============================================================================
// REQUEST SCHEMAS (Create/Update)
// =============================================================================

/**
 * Create Spare Part body schema (for request validation)
 * Validates data sent in request body when creating a new spare part
 * machineId comes from URL params, NOT from body
 * 
 * Validation rules:
 * - name: 2-200 characters, trimmed
 * - serialId: 1-100 characters, trimmed, required
 * - amount: integer >= 0, defaults to 0
 */
export const CreateSparePartBodySchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must be 200 characters or less')
    .trim()
    .transform(val => val.trim()),
  
  serialId: z.string()
    .min(1, 'Serial ID is required')
    .max(100, 'Serial ID must be 100 characters or less')
    .trim()
    .transform(val => val.trim()),
  
  amount: z.number()
    .int('Amount must be an integer')
    .min(0, 'Amount cannot be negative')
    .default(0)
});

export type CreateSparePartBody = z.infer<typeof CreateSparePartBodySchema>;

/**
 * Create Spare Part request schema (for internal use)
 * Full request data including machineId from URL params
 * Used by use cases and internal logic
 */
export const CreateSparePartRequestSchema = CreateSparePartBodySchema.extend({
  machineId: z.string()
    .min(1, 'Machine ID is required')
});

export type CreateSparePartRequest = z.infer<typeof CreateSparePartRequestSchema>;

/**
 * Update Spare Part request schema
 * All fields are optional (partial update)
 * 
 * NOTE: machineId cannot be updated (business rule)
 */
export const UpdateSparePartRequestSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must be 200 characters or less')
    .trim()
    .optional(),
  
  serialId: z.string()
    .min(1, 'Serial ID cannot be empty')
    .max(100, 'Serial ID must be 100 characters or less')
    .trim()
    .optional(),
  
  amount: z.number()
    .int('Amount must be an integer')
    .min(0, 'Amount cannot be negative')
    .optional()
}).refine(
  data => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

export type UpdateSparePartRequest = z.infer<typeof UpdateSparePartRequestSchema>;

// =============================================================================
// API RESPONSE WRAPPERS
// =============================================================================

/**
 * Single spare part response wrapper
 * Standard API response format
 */
export const CreateSparePartResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: SparePartResponseSchema
});

export type CreateSparePartResponse = z.infer<typeof CreateSparePartResponseSchema>;

/**
 * List spare parts response wrapper
 * Includes count for pagination metadata
 */
export const ListSparePartsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(SparePartResponseSchema),
  count: z.number()
});

export type ListSparePartsResponse = z.infer<typeof ListSparePartsResponseSchema>;

/**
 * Get single spare part response wrapper
 * Standard API response format for GET by ID
 */
export const GetSparePartResponseSchema = z.object({
  success: z.boolean(),
  data: SparePartResponseSchema
});

export type GetSparePartResponse = z.infer<typeof GetSparePartResponseSchema>;

/**
 * Update spare part response wrapper
 */
export const UpdateSparePartResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: SparePartResponseSchema
});

export type UpdateSparePartResponse = z.infer<typeof UpdateSparePartResponseSchema>;

/**
 * Delete spare part response wrapper
 */
export const DeleteSparePartResponseSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

export type DeleteSparePartResponse = z.infer<typeof DeleteSparePartResponseSchema>;

// =============================================================================
// ERROR RESPONSE SCHEMAS
// =============================================================================

/**
 * Standard error response
 */
export const SparePartErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  error: z.string()
});

export type SparePartErrorResponse = z.infer<typeof SparePartErrorResponseSchema>;

// =============================================================================
// 🔮 FUTURE SCHEMAS (Commented for v0.0.2+)
// =============================================================================

/**
 * TODO (v0.0.2): Query/filter schemas
 * 
 * export const ListSparePartsQuerySchema = z.object({
 *   machineId: z.string(),
 *   search: z.string().optional(),
 *   minAmount: z.number().int().optional(),
 *   maxAmount: z.number().int().optional(),
 *   sortBy: z.enum(['name', 'serialId', 'amount', 'createdAt']).optional(),
 *   sortOrder: z.enum(['asc', 'desc']).optional(),
 *   page: z.number().int().positive().default(1),
 *   limit: z.number().int().positive().max(100).default(20)
 * });
 */

/**
 * TODO (v0.0.3): Bulk operations schemas
 * 
 * export const BulkCreateSparePartsSchema = z.object({
 *   machineId: z.string(),
 *   spareParts: z.array(CreateSparePartRequestSchema.omit({ machineId: true }))
 * });
 */
