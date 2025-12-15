import React from 'react';
import { Heading1, Heading2, BodyText, Button, Card } from '@components/ui';
import { User, Mail, Phone, Calendar, Shield, Edit } from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Heading1 size="headline" className="tracking-tight text-foreground">
            Mi Perfil
          </Heading1>
          <BodyText className="text-muted-foreground">
            Gestiona tu información personal y preferencias de cuenta
          </BodyText>
        </div>
        <Button variant="filled" size="default">
          <Edit className="w-4 h-4 mr-2" />
          Editar Perfil
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <div className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
              </div>
              <div>
                <Heading2 size="large" weight="bold" className="text-foreground">
                  Usuario Demo
                </Heading2>
                <BodyText size="small" className="text-muted-foreground">
                  Administrador de Flota
                </BodyText>
              </div>
              <div className="w-full pt-4 border-t border-border space-y-2">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <BodyText size="small">Cuenta Verificada</BodyText>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <BodyText size="small">Miembro desde Ene 2024</BodyText>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Information Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <div className="p-6">
              <Heading2 size="large" weight="bold" className="mb-4">
                Información Personal
              </Heading2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <BodyText size="small" weight="medium" className="text-muted-foreground">
                    Nombre Completo
                  </BodyText>
                  <BodyText className="text-foreground">
                    Usuario Demo
                  </BodyText>
                </div>
                <div className="space-y-2">
                  <BodyText size="small" weight="medium" className="text-muted-foreground">
                    RUT
                  </BodyText>
                  <BodyText className="text-foreground">
                    12.345.678-9
                  </BodyText>
                </div>
                <div className="space-y-2">
                  <BodyText size="small" weight="medium" className="text-muted-foreground">
                    Cargo
                  </BodyText>
                  <BodyText className="text-foreground">
                    Administrador de Flota
                  </BodyText>
                </div>
                <div className="space-y-2">
                  <BodyText size="small" weight="medium" className="text-muted-foreground">
                    Departamento
                  </BodyText>
                  <BodyText className="text-foreground">
                    Operaciones
                  </BodyText>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card>
            <div className="p-6">
              <Heading2 size="large" weight="bold" className="mb-4">
                Información de Contacto
              </Heading2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <BodyText size="small" className="text-muted-foreground">
                      Email
                    </BodyText>
                    <BodyText weight="medium" className="text-foreground">
                      usuario.demo@fleetman.cl
                    </BodyText>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <BodyText size="small" className="text-muted-foreground">
                      Teléfono
                    </BodyText>
                    <BodyText weight="medium" className="text-foreground">
                      +56 9 1234 5678
                    </BodyText>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Account Stats */}
          <Card>
            <div className="p-6">
              <Heading2 size="large" weight="bold" className="mb-4">
                Estadísticas de Cuenta
              </Heading2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Heading2 size="large" weight="bold" className="text-primary">
                    12
                  </Heading2>
                  <BodyText size="small" className="text-muted-foreground">
                    Máquinas
                  </BodyText>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Heading2 size="large" weight="bold" className="text-primary">
                    48
                  </Heading2>
                  <BodyText size="small" className="text-muted-foreground">
                    QuickChecks
                  </BodyText>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Heading2 size="large" weight="bold" className="text-primary">
                    156
                  </Heading2>
                  <BodyText size="small" className="text-muted-foreground">
                    Horas
                  </BodyText>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Heading2 size="large" weight="bold" className="text-primary">
                    5
                  </Heading2>
                  <BodyText size="small" className="text-muted-foreground">
                    Eventos
                  </BodyText>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Security Section */}
      <Card>
        <div className="p-6">
          <Heading2 size="large" weight="bold" className="mb-4">
            Seguridad y Privacidad
          </Heading2>
          <div className="flex flex-col md:flex-row gap-4">
            <Button variant="outline" size="default">
              Cambiar Contraseña
            </Button>
            <Button variant="outline" size="default">
              Configurar 2FA
            </Button>
            <Button variant="outline" size="default">
              Historial de Sesiones
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
