import React from 'react';
import { Link } from 'react-router-dom';
import { Heading1, BodyText } from '@components/ui';
import { ROUTES } from '@constants/index';

export const RegisterScreen: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Heading1 size="headline" className="tracking-tight text-foreground">
            Crear Cuenta
          </Heading1>
          <BodyText size="small" className="mt-2 text-muted-foreground">
            Registro de nueva cuenta FleetMan
          </BodyText>
        </div>

        <div className="mt-8 space-y-6">
          <BodyText className="text-center text-muted-foreground">
            Formulario de registro - En construcción
          </BodyText>
          
          <div className="text-center">
            <BodyText size="small" className="text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to={ROUTES.AUTH.LOGIN}
                className="font-medium text-primary hover:text-primary/80"
              >
                Iniciar Sesión
              </Link>
            </BodyText>
          </div>
        </div>
      </div>
    </div>
  );
};