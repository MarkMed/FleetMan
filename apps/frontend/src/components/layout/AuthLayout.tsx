import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Left side - Branding/Image */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary">
          <div className="flex flex-col justify-center items-center w-full p-12 text-primary-foreground">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">FleetMan</h1>
              <p className="text-xl opacity-90 mb-8">
                Gestión profesional de tu flota de máquinas
              </p>
              <div className="space-y-4 text-left max-w-md">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  <span>Control completo de mantenimiento</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  <span>Chequeos de seguridad rápidos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  <span>Alertas y notificaciones inteligentes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  <span>Historial completo de operaciones</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};