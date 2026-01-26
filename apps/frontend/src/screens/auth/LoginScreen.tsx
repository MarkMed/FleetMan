import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLoginViewModel } from '../../viewModels/auth';
import { InputField, Button, Checkbox, Card, CardHeader, CardContent, CardTitle, CardDescription, Skeleton } from '../../components/ui';
import { Mail, Lock } from 'lucide-react';

// TODO: Mejorar a RHF para validación más robusta y UX (Sprint futuro)
export const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const {
    formData,
    formErrors,
    isLoading,
    authError,
    handleInputChange,
    handleSubmit,
    canSubmit,
  } = useLoginViewModel();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('auth.login.title')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('auth.login.subtitle')}
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-20 rounded" />
                    </div>
                    <Skeleton className="h-4 w-32 rounded" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full rounded" />
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Email Field */}
                  <InputField
                    label={t('auth.login.email')}
                    placeholder={t('auth.login.emailPlaceholder')}
                    icon={Mail}
                    keyboardType="email"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange({ 
                      target: { name: 'email', value } 
                    } as React.ChangeEvent<HTMLInputElement>)}
                    error={formErrors.email}
                    required
                    helperText={t('auth.login.emailHelper')}
                  />

                  {/* Password Field */}
                  <InputField
                    label={t('auth.login.password')}
                    placeholder={t('auth.login.passwordPlaceholder')}
                    icon={Lock}
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(value) => handleInputChange({ 
                      target: { name: 'password', value } 
                    } as React.ChangeEvent<HTMLInputElement>)}
                    error={formErrors.password}
                    required
                    helperText={t('auth.login.passwordHelper')}
                  />

                  {/* Remember Me and Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) => handleInputChange({ 
                          target: { name: 'rememberMe', type: 'checkbox', checked } 
                        } as React.ChangeEvent<HTMLInputElement>)}
                      />
                      <label 
                        htmlFor="rememberMe" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {t('auth.login.rememberMe')}
                      </label>
                    </div>

                    <Link
                      to="/auth/forgot-password"
                      className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      {t('auth.login.forgotPassword')}
                    </Link>
                  </div>
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
                  {isLoading ? t('auth.login.loggingIn') : t('auth.login.loginButton')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.login.noAccount')}{' '}
            <Link
              to="/auth/register"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {t('auth.login.createAccount')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};