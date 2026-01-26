import type { RegisterFormData } from '../../models/forms/AuthForms';
import { RegisterRequest, UserType } from '@contracts';

/**
 * Map UI Register form data to the API contract RegisterRequest (SSOT).
 * Centralizes the transformation so viewmodels/hooks/services can reuse it.
 * 
 * 🆕 Sprint #14 Task 2.1b: Now accepts type from form instead of hardcoding CLIENT
 */
export function mapRegisterFormToRequest(form: RegisterFormData): RegisterRequest {
  return {
    email: form.email,
    password: form.password,
    profile: {
      companyName: form.name,
    },
    type: form.type, // ✅ No longer hardcoded - comes from form
  };
}

export default mapRegisterFormToRequest;
