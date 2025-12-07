import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthProvider';
import type { RegisterRequest } from '@contracts';
import { UserType } from '@contracts';
import type { RegisterFormData, RegisterFormErrors, PasswordStrength } from '../../models';
import { mapRegisterFormToRequest } from '../../utils/mappers';
import { ROUTES } from '../../constants';

export const useRegisterViewModel = () => {
  const { register, isLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<RegisterFormErrors>({});

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
  }, [formErrors]);

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
      }
    }
  }, [formData, validateForm, register, navigate]);

  const clearErrors = useCallback(() => {
    setFormErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setFormErrors({});
  }, []);

  return {
    // State
    formData,
    formErrors,
    isLoading,
    authError,
    
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