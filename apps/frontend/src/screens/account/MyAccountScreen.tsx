import React from 'react';
import { Heading1, Heading2, BodyText, Button, Card } from '@components/ui';

export const MyAccountScreen: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Heading1 size="headline" className="tracking-tight text-foreground">
            Mi Cuenta
          </Heading1>
          <BodyText className="text-muted-foreground">
            Gestiona tu perfil y configuraciones personales
          </BodyText>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <Heading2 size="large" weight="bold" className="mb-4">
              Información Personal
            </Heading2>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    defaultValue="Juan"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    defaultValue="Pérez"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  defaultValue="juan.perez@fleetman.com"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  defaultValue="+56 9 1234 5678"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cargo/Posición
                </label>
                <input
                  type="text"
                  defaultValue="Supervisor de Mantenimiento"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button variant="filled" size="default">
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Account Summary */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <Heading2 size="large" weight="bold" className="mb-4">
                Resumen de Cuenta
              </Heading2>
              <div className="space-y-3">
                <div>
                  <BodyText size="small" weight="medium" className="text-muted-foreground">
                    Usuario desde
                  </BodyText>
                  <BodyText>Enero 2023</BodyText>
                </div>
                <div>
                  <BodyText size="small" weight="medium" className="text-muted-foreground">
                    Último acceso
                  </BodyText>
                  <BodyText>Hoy, 09:30 AM</BodyText>
                </div>
                <div>
                  <BodyText size="small" weight="medium" className="text-muted-foreground">
                    Rol en el sistema
                  </BodyText>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                    Supervisor
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <Heading2 size="large" weight="bold" className="mb-4">
                Actividad Reciente
              </Heading2>
              <div className="space-y-3">
                <div className="text-sm">
                  <BodyText weight="medium">Quickcheck completado</BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    Hace 2 horas
                  </BodyText>
                </div>
                <div className="text-sm">
                  <BodyText weight="medium">Reporte generado</BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    Ayer, 16:45
                  </BodyText>
                </div>
                <div className="text-sm">
                  <BodyText weight="medium">Máquina editada</BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    2 días atrás
                  </BodyText>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Security Settings */}
      <Card>
        <div className="p-6">
          <Heading2 size="large" weight="bold" className="mb-4">
            Configuración de Seguridad
          </Heading2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border border-border rounded-lg">
              <div>
                <BodyText weight="medium">Cambiar Contraseña</BodyText>
                <BodyText size="small" className="text-muted-foreground">
                  Actualiza tu contraseña regularmente para mantener tu cuenta segura
                </BodyText>
              </div>
              <Button variant="outline" size="default">
                Cambiar
              </Button>
            </div>
            
            <div className="flex justify-between items-center p-4 border border-border rounded-lg">
              <div>
                <BodyText weight="medium">Autenticación de Dos Factores</BodyText>
                <BodyText size="small" className="text-muted-foreground">
                  Agrega una capa extra de seguridad a tu cuenta
                </BodyText>
              </div>
              <Button variant="outline" size="default">
                Configurar
              </Button>
            </div>
            
            <div className="flex justify-between items-center p-4 border border-border rounded-lg">
              <div>
                <BodyText weight="medium">Sesiones Activas</BodyText>
                <BodyText size="small" className="text-muted-foreground">
                  Administra los dispositivos donde has iniciado sesión
                </BodyText>
              </div>
              <Button variant="outline" size="default">
                Ver Sesiones
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};