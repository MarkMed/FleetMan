import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/AuthProvider';
import type { LoginRequest } from '@contracts';
import type { LoginFormData, LoginFormErrors } from '../../models';
import { ROUTES } from '../../constants';

export const useLoginViewModel = () => {
  const { login, isLoading, error: authError, clearError } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [formErrors, setFormErrors] = useState<LoginFormErrors>({});

  // Clear any stale global auth error on mount and unmount
  useEffect(() => {
    clearError();
    return () => {
      clearError();
    };
  }, [clearError]);

  const validateForm = useCallback((): LoginFormErrors => {
    const errors: LoginFormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    }

    return errors;
  }, [formData]);

  const updateFormData = useCallback(<K extends keyof LoginFormData>(
    field: K,
    value: LoginFormData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear field error and auth error when user starts typing
    if (formErrors[field as keyof LoginFormErrors]) {
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
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    updateFormData(name as keyof LoginFormData, fieldValue as any);
  }, [updateFormData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const loginRequest: LoginRequest = {
          email: formData.email,
          password: formData.password,
        };
        
        const result = await login(loginRequest.email, loginRequest.password);
        
        // Navigate to dashboard if login was successful
        if (result.shouldNavigate) {
          navigate(ROUTES.DASHBOARD, { replace: true });
        }
      } catch (error) {
        // Auth error is handled by the AuthProvider
        console.error('Login error:', error);
      }
    }
  }, [formData, validateForm, login, navigate]);

  const clearErrors = useCallback(() => {
    setFormErrors({});
    clearError();
  }, [clearError]);

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
    
    // Computed
    hasErrors: Object.keys(formErrors).length > 0,
    canSubmit: !isLoading && formData.email && formData.password,
  };
};