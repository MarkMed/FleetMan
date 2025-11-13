// Auth Form Data Types
// These are specific to UI forms and may differ from API contracts

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterFormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

// Password strength types
export type PasswordStrength = 'weak' | 'medium' | 'strong';

export interface PasswordStrengthConfig {
  color: string;
  width: string;
  text: string;
  textColor: string;
  description: string;
}

// Auth form states
export interface AuthFormState<TData, TErrors> {
  data: TData;
  errors: TErrors;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Form field validation types
export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => string | undefined;
}

export type AuthFormValidationRules = {
  [K in keyof (LoginFormData | RegisterFormData)]?: FieldValidation;
};

// Auth UI specific types
export interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export interface AuthLinkConfig {
  text: string;
  linkText: string;
  to: string;
}