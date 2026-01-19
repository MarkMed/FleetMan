import { z } from 'zod';
import { 
  USER_PROFILE_LIMITS, 
  UserProfileSchema,
  type UpdateUserRequest 
} from '@contracts';

/**
 * User Profile Types
 * Sprint #13 Tasks 10.1 + 10.2: User Profile Editing + Bio & Tags
 * SSOT: Uses validation schemas from @contracts, no duplication
 */

/**
 * Form data structure for profile editing wizard
 * UI-specific: Separado en steps para mejor UX y validación granular
 */
export interface UserProfileEditData {
  basicInfo: {
    companyName?: string;
    phone?: string;
    address?: string;
  };
  bioAndTags: {
    bio?: string;
    tags?: string[];
  };
}

/**
 * Step 1 Validation Schema: Basic Info
 * SSOT: Composed from UserProfileSchema (contracts)
 * Picks only fields relevant to basicInfo step
 */
const BasicInfoStepSchema = UserProfileSchema.pick({
  companyName: true,
  phone: true,
  address: true,
}).partial().transform((data) => ({
  // Transform empty strings to undefined for proper optional handling
  companyName: data.companyName?.trim() || undefined,
  phone: data.phone?.trim() || undefined,
  address: data.address?.trim() || undefined,
}));

/**
 * Step 2 Validation Schema: Bio and Tags
 * SSOT: Composed from UserProfileSchema (contracts)
 * Picks only bio and tags fields
 */
const BioAndTagsStepSchema = UserProfileSchema.pick({
  bio: true,
  tags: true,
}).partial().transform((data) => ({
  // Transform empty strings to undefined
  bio: data.bio?.trim() || undefined,
  tags: data.tags && data.tags.length > 0 ? data.tags : undefined,
}));

/**
 * Complete wizard validation schema
 * SSOT: Composes step schemas from contracts UserProfileSchema
 * Maintains wizard structure but delegates validation to SSOT
 */
export const UserProfileEditSchema = z.object({
  basicInfo: z.object({
    companyName: z.string().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
  }),
  bioAndTags: z.object({
    bio: z.string().optional().or(z.literal('')),
    tags: z.array(z.string()).optional().default([]),
  }),
});

/**
 * Default/empty values for form initialization
 */
export const defaultUserProfileEditData: UserProfileEditData = {
  basicInfo: {
    companyName: '',
    phone: '',
    address: '',
  },
  bioAndTags: {
    bio: '',
    tags: [],
  },
};

/**
 * Validation function for individual wizard steps
 * SSOT: Uses UserProfileSchema from contracts for validation
 * Flattens nested wizard structure → validates with contracts schema → returns result
 * 
 * @param step - Step name to validate
 * @param data - Complete wizard data
 * @returns true if step is valid, false otherwise
 */
export function validateProfileStep(
  step: 'basicInfo' | 'bioAndTags',
  data: UserProfileEditData
): boolean {
  try {
    switch (step) {
      case 'basicInfo': {
        // Validate using contracts schema for basic info fields
        const result = BasicInfoStepSchema.safeParse(data.basicInfo);
        return result.success;
      }
      case 'bioAndTags': {
        // Validate using contracts schema for bio and tags
        const result = BioAndTagsStepSchema.safeParse(data.bioAndTags);
        return result.success;
      }
      default:
        return false;
    }
  } catch {
    return false;
  }
}

/**
 * Maps wizard form data to UpdateUserRequest format
 * Transforms UI format → API format
 * 
 * @param formData - Data from wizard form
 * @param userId - User ID for the request
 * @returns Data in UpdateUserRequest format for API call
 */
export function mapEditDataToUpdateRequest(
  formData: UserProfileEditData,
  userId: string
): UpdateUserRequest {
  // Convert empty strings to undefined for optional fields
  const companyName = formData.basicInfo.companyName?.trim() || undefined;
  const phone = formData.basicInfo.phone?.trim() || undefined;
  const address = formData.basicInfo.address?.trim() || undefined;
  const bio = formData.bioAndTags.bio?.trim() || undefined;
  const tags = formData.bioAndTags.tags?.length ? formData.bioAndTags.tags : undefined;

  return {
    id: userId,
    profile: {
      companyName,
      phone,
      address,
      bio,
      tags,
    },
  };
}

/**
 * Maps API user data to wizard form format
 * Transforms API format → UI format
 * Used for pre-populating the form with current user data
 * 
 * @param user - User data from API/AuthStore
 * @returns Data in UserProfileEditData format for form initialization
 */
export function mapUserDataToEditForm(user: {
  id: string;
  profile?: {
    companyName?: string;
    phone?: string;
    address?: string;
    bio?: string;
    tags?: string[];
  };
}): UserProfileEditData {
  return {
    basicInfo: {
      companyName: user.profile?.companyName || '',
      phone: user.profile?.phone || '',
      address: user.profile?.address || '',
    },
    bioAndTags: {
      bio: user.profile?.bio || '',
      tags: user.profile?.tags || [],
    },
  };
}

/**
 * Helper para validar y obtener errores traducidos de Zod
 * Específico para el flujo de edición de perfil
 * Mapea errores de validación Zod a keys de i18n
 * 
 * @param step - Step del wizard a validar
 * @param data - Datos a validar
 * @param t - Función de traducción i18n
 * @returns { valid: boolean, errors: Record<string, string> } - Resultado y errores traducidos
 * 
 * @example
 * const { valid, errors } = validateProfileStepWithErrors('basicInfo', data, t);
 * if (!valid) {
 *   console.error(errors); // { companyName: "El nombre debe tener máximo 100 caracteres" }
 * }
 */
export function validateProfileStepWithErrors(
  step: 'basicInfo' | 'bioAndTags',
  data: UserProfileEditData,
  t: (key: string, options?: Record<string, unknown>) => string
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  try {
    switch (step) {
      case 'basicInfo': {
        const result = BasicInfoStepSchema.safeParse(data.basicInfo);
        if (!result.success) {
          result.error.issues.forEach((issue) => {
            const field = issue.path[0] as string;
            // Map Zod error codes to i18n keys
            if (issue.code === 'too_big' && issue.type === 'string') {
              errors[field] = t('profile.edit.validation.maxLength', { 
                max: issue.maximum 
              });
            } else {
              errors[field] = t('profile.edit.validation.invalid');
            }
          });
          return { valid: false, errors };
        }
        return { valid: true, errors: {} };
      }
      case 'bioAndTags': {
        const result = BioAndTagsStepSchema.safeParse(data.bioAndTags);
        if (!result.success) {
          result.error.issues.forEach((issue) => {
            const field = issue.path[0] as string;
            if (issue.code === 'too_big') {
              if (field === 'bio') {
                errors[field] = t('profile.edit.validation.bioMaxLength', {
                  max: USER_PROFILE_LIMITS.MAX_BIO_LENGTH
                });
              } else if (field === 'tags') {
                errors[field] = t('profile.edit.validation.tagsMaxCount', {
                  max: USER_PROFILE_LIMITS.MAX_TAGS
                });
              }
            } else if (issue.code === 'custom' && issue.message?.includes('Duplicate')) {
              errors[field] = t('profile.edit.validation.duplicateTags');
            } else {
              errors[field] = t('profile.edit.validation.invalid');
            }
          });
          return { valid: false, errors };
        }
        return { valid: true, errors: {} };
      }
      default:
        return { valid: false, errors: { general: t('profile.edit.validation.invalidStep') } };
    }
  } catch (error) {
    console.error('Error validating profile step:', error);
    return { valid: false, errors: { general: t('profile.edit.validation.unexpectedError') } };
  }
}

// Future enhancement: Validation for complete profile update (all fields at once)
// export function validateCompleteProfile(data: UserProfileEditData): boolean {
//   const flatProfile = {
//     ...data.basicInfo,
//     ...data.bioAndTags,
//   };
//   const result = UserProfileSchema.safeParse(flatProfile);
//   return result.success;
// }
