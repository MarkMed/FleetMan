import React from 'react';
import { Link } from 'react-router-dom';
import { useLoginViewModel } from '../../viewModels/auth';
import { InputField, Button, Checkbox, Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui';
import { Mail, Lock } from 'lucide-react';

// TODO: Mejorar a RHF para validación más robusta y UX (Sprint futuro)
export const LoginScreen: React.FC = () => {
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Iniciar Sesión
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa a tu cuenta FleetMan
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Email Field */}
                <InputField
                  label="Email"
                  placeholder="tu@email.com"
                  icon={Mail}
                  keyboardType="email"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange({ 
                    target: { name: 'email', value } 
                  } as React.ChangeEvent<HTMLInputElement>)}
                  error={formErrors.email}
                  required
                  helperText="Ingresa el email de tu cuenta"
                />

                {/* Password Field */}
                <InputField
                  label="Contraseña"
                  placeholder="Tu contraseña"
                  icon={Lock}
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(value) => handleInputChange({ 
                    target: { name: 'password', value } 
                  } as React.ChangeEvent<HTMLInputElement>)}
                  error={formErrors.password}
                  required
                  helperText="Mínimo 8 caracteres"
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
                      Recordarme
                    </label>
                  </div>

                  <Link
                    to="/auth/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
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
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link
              to="/auth/register"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};