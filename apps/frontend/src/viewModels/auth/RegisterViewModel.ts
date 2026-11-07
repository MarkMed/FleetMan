import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { modal } from '../../helpers/modal';
import { useAuth } from '../../store/AuthProvider';
import type { RegisterRequest } from '@contracts';
import { UserType } from '@contracts';
import type { RegisterFormData, RegisterFormErrors, PasswordStrength } from '../../models';
import { mapRegisterFormToRequest } from '../../utils/mappers';
import { ROUTES } from '../../constants';

export const useRegisterViewModel = () => {
  const { register, isLoading, error: authError, clearError } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: 'CLIENT', // 🆕 Sprint #14 Task 2.1b: Default to CLIENT
  });

  const [formErrors, setFormErrors] = useState<RegisterFormErrors>({});

  // Clear any stale global auth error on mount and unmount
  useEffect(() => {
    clearError();
    return () => {
      clearError();
    };
  }, [clearError]);

  const validateForm = useCallback((): RegisterFormErrors => {
    const errors: RegisterFormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // 🆕 Sprint #14 Task 2.1b: Type validation
    if (!formData.type) {
      errors.type = 'Debes seleccionar un tipo de usuario';
    }

    // 🆕 Sprint #14 Task 2.1b: Conditional validation - PROVIDER requires company name
    if (formData.type === 'PROVIDER' && !formData.name.trim()) {
      errors.name = 'Los proveedores deben ingresar el nombre de su empresa';
    }

    return errors;
  }, [formData]);

  const updateFormData = useCallback(<K extends keyof RegisterFormData>(
    field: K,
    value: RegisterFormData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear field error when user starts typing
    if (formErrors[field as keyof RegisterFormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
    if (authError) {
      clearError();
    }
  }, [formErrors, authError, clearError]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFormData(name as keyof RegisterFormData, value);
  }, [updateFormData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const registerRequest: RegisterRequest = mapRegisterFormToRequest(formData);
        const result = await register(registerRequest);
        
        // Navigate to dashboard if registration was successful and returned token
        if (result.shouldNavigate) {
          navigate(ROUTES.DASHBOARD, { replace: true });
        }
        // If shouldNavigate is false, user was created but needs to login manually
        // Could show success message and redirect to login
      } catch (error) {
        // Auth error is handled by the AuthProvider
        console.error('Registration error:', error);
        const rawMessage = error instanceof Error ? error.message : 'auth.register.error.unknown';
        const errorMessage = t(rawMessage, { defaultValue: rawMessage });
        modal.error({
          title: t('auth.register.error.title'),
          description: errorMessage,
          dismissText: t('common.close', { defaultValue: 'Cerrar' }),
        });
      }
    }
  }, [formData, validateForm, register, navigate, t]);

  const clearErrors = useCallback(() => {
    setFormErrors({});
    clearError();
  }, [clearError]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      type: 'CLIENT', // 🆕 Sprint #14 Task 2.1b: Reset to default
    });
    setFormErrors({});
  }, []);

  const translatedAuthError = authError ? t(authError, { defaultValue: authError }) : undefined;

  return {
    // State
    formData,
    formErrors,
    isLoading,
    authError: translatedAuthError,
    
    // Actions
    handleInputChange,
    handleSubmit,
    updateFormData,
    clearErrors,
    resetForm,
    
    // Computed
    hasErrors: Object.keys(formErrors).length > 0,
    canSubmit: !isLoading && 
               formData.name && 
               formData.email && 
               formData.password && 
               formData.confirmPassword,
    passwordStrength: getPasswordStrength(formData.password),
  };
};

// Utility function for password strength calculation
function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) return 'weak';
  
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const criteriaCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  
  if (criteriaCount <= 2) return 'weak';
  if (criteriaCount === 3) return 'medium';
  return 'strong';
}