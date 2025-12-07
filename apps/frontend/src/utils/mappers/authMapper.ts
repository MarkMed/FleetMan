import type { RegisterFormData } from '../../models/forms/AuthForms';
import { RegisterRequest, UserType } from '@contracts';

/**
 * Map UI Register form data to the API contract RegisterRequest (SSOT).
 * Centralizes the transformation so viewmodels/hooks/services can reuse it.
 */
export function mapRegisterFormToRequest(form: RegisterFormData): RegisterRequest {
  return {
    email: form.email,
    password: form.password,
    profile: {
      companyName: form.name,
    },
    type: UserType.CLIENT,
  };
}

export default mapRegisterFormToRequest;
