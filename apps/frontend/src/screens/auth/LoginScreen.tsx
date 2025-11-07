import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/ui/Button';
import { useZodForm } from '@hooks/useZodForm';
import { useLogin } from '@hooks/useAuth';
import { loginSchema, type LoginFormData } from '@validators/index';
import { ROUTES } from '@constants/index';

export const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useZodForm({
    schema: loginSchema,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = handleSubmit(async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      // Error is handled by the mutation
      console.error('Login error:', error);
    }
  });

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

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                {t('auth.login.email')}
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder={t('auth.login.email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                {t('auth.login.password')}
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder={t('auth.login.password')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-foreground">
                  {t('auth.login.rememberMe')}
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to={ROUTES.AUTH.FORGOT_PASSWORD}
                  className="font-medium text-primary hover:text-primary/80"
                >
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>
            </div>
          </div>

          {loginMutation.error && (
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="text-sm text-destructive">
                {loginMutation.error instanceof Error 
                  ? loginMutation.error.message 
                  : t('auth.errors.invalidCredentials')
                }
              </p>
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting || loginMutation.isPending}
              disabled={isSubmitting || loginMutation.isPending}
            >
              {t('auth.login.loginButton')}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth.login.noAccount')}{' '}
              <Link
                to={ROUTES.AUTH.REGISTER}
                className="font-medium text-primary hover:text-primary/80"
              >
                {t('auth.login.signUpLink')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};