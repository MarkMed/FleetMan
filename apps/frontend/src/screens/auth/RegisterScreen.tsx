import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegisterViewModel } from '../../viewModels/auth';
import { InputField, Button, Card, CardContent, Skeleton, BodyText, Heading3, Heading1 } from '../../components/ui';
import { Mail, Lock, User, Briefcase, Users } from 'lucide-react';
import { cn } from '@utils/cn';

// TODO: Mejorar a RHF + Wizard para experiencia multi-step (Sprint futuro)
export const RegisterScreen: React.FC = () => {
  const { t } = useTranslation();
  const {
    formData,
    formErrors,
    isLoading,
    authError,
    handleInputChange,
    handleSubmit,
    canSubmit,
    passwordStrength,
  } = useRegisterViewModel();

  // Password strength indicator helper
  const getPasswordStrengthConfig = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'weak': 
        return {
          color: 'bg-destructive',
          width: 'w-1/3',
          text: t('auth.register.strengthWeak'),
          textColor: 'text-destructive'
        };
      case 'medium': 
        return {
          color: 'bg-warning',
          width: 'w-2/3',
          text: t('auth.register.strengthMedium'),
          textColor: 'text-warning'
        };
      case 'strong': 
        return {
          color: 'bg-success',
          width: 'w-full',
          text: t('auth.register.strengthStrong'),
          textColor: 'text-success'
        };
    }
  };

  const strengthConfig = getPasswordStrengthConfig(passwordStrength);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Heading1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('auth.register.title')}
          </Heading1>
          <BodyText className="mt-2 text-muted-foreground" size='regular'>
            {t('auth.register.subtitle')}
          </BodyText>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
                <Skeleton className="h-10 w-full rounded" />
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Name Field */}
                  <InputField
                    label={t('auth.register.name')}
                    placeholder={t('auth.register.namePlaceholder')}
                    icon={User}
                    value={formData.name}
                    onChangeText={(value) => handleInputChange({ 
                      target: { name: 'name', value } 
                    } as React.ChangeEvent<HTMLInputElement>)}
                    error={formErrors.name}
                    required
                    helperText={t('auth.register.nameHelper')}
                  />

                  {/* 🆕 Sprint #14 Task 2.1b: User Type Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      {t('auth.register.userType')} <span className="text-destructive">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* CLIENT Option */}
                      <Card
                        className={cn(
                          'cursor-pointer transition-all duration-200 hover:shadow-md',
                          'border-2',
                          formData.type === 'CLIENT' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        )}
                        onClick={() => handleInputChange({ 
                          target: { name: 'type', value: 'CLIENT' } 
                        } as React.ChangeEvent<HTMLInputElement>)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'p-2 rounded-lg',
                              formData.type === 'CLIENT' 
                                ? 'bg-primary/10' 
                                : 'bg-muted'
                            )}>
                              <Users className={cn(
                                'h-5 w-5',
                                formData.type === 'CLIENT' 
                                  ? 'text-primary' 
                                  : 'text-muted-foreground'
                              )} />
                            </div>
                            <div className="flex-1">
                              <Heading3 className="mb-1">{t('auth.register.clientType')}</Heading3>
                              <BodyText size="small" className="text-muted-foreground">
                                {t('auth.register.wizard.userType.clientDescription')}
                              </BodyText>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* PROVIDER Option */}
                      <Card
                        className={cn(
                          'cursor-pointer transition-all duration-200 hover:shadow-md',
                          'border-2',
                          formData.type === 'PROVIDER' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        )}
                        onClick={() => handleInputChange({ 
                          target: { name: 'type', value: 'PROVIDER' } 
                        } as React.ChangeEvent<HTMLInputElement>)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'p-2 rounded-lg',
                              formData.type === 'PROVIDER' 
                                ? 'bg-primary/10' 
                                : 'bg-muted'
                            )}>
                              <Briefcase className={cn(
                                'h-5 w-5',
                                formData.type === 'PROVIDER' 
                                  ? 'text-primary' 
                                  : 'text-muted-foreground'
                              )} />
                            </div>
                            <div className="flex-1">
                              <Heading3 className="mb-1">{t('auth.register.providerType')}</Heading3>
                              <BodyText size="small" className="text-muted-foreground">
                                {t('auth.register.wizard.userType.providerDescription')}
                              </BodyText>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    {formErrors.type && (
                      <p className="text-sm text-destructive">{formErrors.type}</p>
                    )}
                    {formData.type === 'PROVIDER' && (
                      <p className="text-xs text-muted-foreground">
                        ℹ️ {t('auth.register.providerInfo')}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <InputField
                    label={t('auth.register.email')}
                    placeholder={t('auth.register.emailPlaceholder')}
                    icon={Mail}
                    keyboardType="email"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange({ 
                      target: { name: 'email', value } 
                    } as React.ChangeEvent<HTMLInputElement>)}
                    error={formErrors.email}
                    required
                    helperText={t('auth.register.emailHelper')}
                  />

                  {/* Password Field with Strength Indicator */}
                  <div className="space-y-2">
                    <InputField
                      label={t('auth.register.password')}
                      placeholder={t('auth.register.passwordPlaceholder')}
                      icon={Lock}
                      secureTextEntry
                      value={formData.password}
                      onChangeText={(value) => handleInputChange({ 
                        target: { name: 'password', value } 
                      } as React.ChangeEvent<HTMLInputElement>)}
                      error={formErrors.password}
                      required
                      helperText={t('auth.register.passwordHelper')}
                    />
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ease-out ${
                                strengthConfig.color
                              } ${strengthConfig.width}`}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${
                            strengthConfig.textColor
                          }`}>
                            {strengthConfig.text}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {passwordStrength === 'weak' && t('auth.register.strengthWeakMessage')}
                          {passwordStrength === 'medium' && t('auth.register.strengthMediumMessage')}
                          {passwordStrength === 'strong' && t('auth.register.strengthStrongMessage')}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <InputField
                    label={t('auth.register.confirmPassword')}
                    placeholder={t('auth.register.confirmPasswordPlaceholder')}
                    icon={Lock}
                    secureTextEntry
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange({ 
                      target: { name: 'confirmPassword', value } 
                    } as React.ChangeEvent<HTMLInputElement>)}
                    error={formErrors.confirmPassword}
                    required
                    helperText={t('auth.register.confirmPasswordHelper')}
                  />
                </div>

                {/* Error Message */}
                {authError && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                    <p className="text-sm text-destructive font-medium">
                      {authError}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  htmlType="submit"
                  variant="filled"
                  size="default"
                  disabled={!canSubmit}
                  loading={isLoading}
                  className="w-full"
                >
                  {isLoading ? t('auth.register.creatingAccount') : t('auth.register.registerButton')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.register.hasAccount')}{' '}
            <Link
              to="/auth/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {t('auth.register.loginLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};