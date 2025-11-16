import React from 'react';
import { Link } from 'react-router-dom';
import { useRegisterViewModel } from '../../viewModels/auth';
import { InputField, Button, Card, CardContent } from '../../components/ui';
import { Mail, Lock, User } from 'lucide-react';

export const RegisterScreen: React.FC = () => {
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
          text: 'Débil',
          textColor: 'text-destructive'
        };
      case 'medium': 
        return {
          color: 'bg-warning',
          width: 'w-2/3',
          text: 'Media',
          textColor: 'text-warning'
        };
      case 'strong': 
        return {
          color: 'bg-success',
          width: 'w-full',
          text: 'Fuerte',
          textColor: 'text-success'
        };
    }
  };

  const strengthConfig = getPasswordStrengthConfig(passwordStrength);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Crear Cuenta
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Registro de nueva cuenta FleetMan
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Name Field */}
                <InputField
                  label="Nombre completo"
                  placeholder="Tu nombre completo"
                  icon={User}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange({ 
                    target: { name: 'name', value } 
                  } as React.ChangeEvent<HTMLInputElement>)}
                  error={formErrors.name}
                  required
                  helperText="Nombre de tu empresa o personal"
                />

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
                  helperText="Email que usarás para iniciar sesión"
                />

                {/* Password Field with Strength Indicator */}
                <div className="space-y-2">
                  <InputField
                    label="Contraseña"
                    placeholder="Mínimo 8 caracteres"
                    icon={Lock}
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(value) => handleInputChange({ 
                      target: { name: 'password', value } 
                    } as React.ChangeEvent<HTMLInputElement>)}
                    error={formErrors.password}
                    required
                    helperText="Debe contener mayúsculas, minúsculas y números"
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
                        {passwordStrength === 'weak' && 'Muy fácil de adivinar'}
                        {passwordStrength === 'medium' && 'Puede ser más segura'}
                        {passwordStrength === 'strong' && '¡Excelente seguridad!'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <InputField
                  label="Confirmar contraseña"
                  placeholder="Repite tu contraseña"
                  icon={Lock}
                  secureTextEntry
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange({ 
                    target: { name: 'confirmPassword', value } 
                  } as React.ChangeEvent<HTMLInputElement>)}
                  error={formErrors.confirmPassword}
                  required
                  helperText="Debe ser idéntica a la contraseña anterior"
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
                {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/auth/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};