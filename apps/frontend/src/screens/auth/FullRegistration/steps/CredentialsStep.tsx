import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { InputField } from '@components/ui';
import { Mail, Lock } from 'lucide-react';
import type { CompleteRegistrationData } from '../../../../types/registration.types';

/**
 * CredentialsStep - Step 1 of Complete Registration Wizard
 * Sprint #14 Task 2.1b
 * 
 * Captures user credentials:
 * - Email (required, unique)
 * - Password (required, min 8 chars, complexity rules)
 * - Confirm Password (required, must match)
 * 
 * Features:
 * - Password strength indicator (reusing logic from RegisterScreen)
 * - Real-time validation
 * - Match validation for confirm password
 */
export const CredentialsStep: React.FC = () => {
  const { t } = useTranslation();
  const { control, watch, formState: { errors } } = useFormContext<CompleteRegistrationData>();
  
  const password = watch('password');

  // Password strength calculation (same logic as RegisterScreen)
  const getPasswordStrength = (pwd: string): 'weak' | 'medium' | 'strong' => {
    if (pwd.length < 8) return 'weak';
    
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    
    const score = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (score >= 3 && pwd.length >= 10) return 'strong';
    if (score >= 2 && pwd.length >= 8) return 'medium';
    return 'weak';
  };

  const passwordStrength = password ? getPasswordStrength(password) : null;

  const getPasswordStrengthConfig = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'weak':
        return {
          color: 'bg-destructive',
          width: 'w-1/3',
          text: t('auth.register.passwordStrength.weak'),
          textColor: 'text-destructive'
        };
      case 'medium':
        return {
          color: 'bg-warning',
          width: 'w-2/3',
          text: t('auth.register.passwordStrength.medium'),
          textColor: 'text-warning'
        };
      case 'strong':
        return {
          color: 'bg-success',
          width: 'w-full',
          text: t('auth.register.passwordStrength.strong'),
          textColor: 'text-success'
        };
    }
  };

  const strengthConfig = passwordStrength ? getPasswordStrengthConfig(passwordStrength) : null;

  return (
    <div className="space-y-6">

      {/* Form fields */}
      <div className="space-y-4">
        {/* Email */}
        <Controller
          name="email"
          control={control}
          rules={{
            required: t('validation.required'),
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: t('validation.invalidEmail')
            }
          }}
          render={({ field }) => (
            <InputField
              {...field}
              type="email"
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              icon={Mail}
              error={errors.email?.message}
              required
              helperText={t('auth.register.emailHelper')}
            />
          )}
        />

        {/* Password with strength indicator */}
        <div className="space-y-2">
          <Controller
            name="password"
            control={control}
            rules={{
              required: t('validation.required'),
              minLength: {
                value: 8,
                message: t('validation.passwordMinLength')
              },
              pattern: {
                value: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: t('validation.passwordComplexity')
              }
            }}
            render={({ field }) => (
              <InputField
                {...field}
                label={t('auth.password')}
                placeholder={t('auth.passwordPlaceholder')}
                icon={Lock}
                error={errors.password?.message}
                required
                helperText={t('auth.register.passwordHelper')}
                secureTextEntry
              />
            )}
          />

          {/* Password Strength Indicator */}
          {password && strengthConfig && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ease-out ${strengthConfig.color} ${strengthConfig.width}`}
                  />
                </div>
                <span className={`text-xs font-semibold ${strengthConfig.textColor}`}>
                  {strengthConfig.text}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {passwordStrength === 'weak' && t('auth.register.passwordStrength.weakHint')}
                {passwordStrength === 'medium' && t('auth.register.passwordStrength.mediumHint')}
                {passwordStrength === 'strong' && t('auth.register.passwordStrength.strongHint')}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            required: t('validation.required'),
            validate: (value) => 
              value === password || t('validation.passwordMismatch')
          }}
          render={({ field }) => (
            <InputField
              {...field}
              label={t('auth.confirmPassword')}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              icon={Lock}
              error={errors.confirmPassword?.message}
              required
              helperText={t('auth.register.confirmPasswordHelper')}
              secureTextEntry
            />
          )}
        />
      </div>
    </div>
  );
};
