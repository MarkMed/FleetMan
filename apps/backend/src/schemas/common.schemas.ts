import { z } from 'zod';

// Schema común para paginación
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Schema para respuestas paginadas
export const PaginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

// Schema para respuestas de error estándar
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
  timestamp: z.string(),
  path: z.string().optional(),
});

// Schema para respuestas exitosas estándar
export const SuccessResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string(),
  data: z.any().optional(),
});

// Tipos TypeScript inferidos
export type PaginationDto = z.infer<typeof PaginationSchema>;
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

export default {
  PaginationSchema,
  PaginatedResponseSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
};