import React from 'react';

export const RegisterScreen: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Crear Cuenta
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Registro de nueva cuenta FleetMan
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <p className="text-center text-muted-foreground">
            Formulario de registro - En construcción
          </p>
        </div>
      </div>
    </div>
  );
};