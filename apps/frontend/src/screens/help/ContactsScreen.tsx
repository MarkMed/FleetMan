import React from 'react';
import { Heading1, Heading2, BodyText, Button, Card } from '@components/ui';

export const ContactsScreen: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Heading1 size="headline" className="tracking-tight text-foreground">
            Contactos y Soporte
          </Heading1>
          <BodyText className="text-muted-foreground">
            Información de contacto y canales de soporte para FleetMan
          </BodyText>
        </div>
      </div>

      {/* Emergency Contacts */}
      <Card className="border-destructive/20">
        <div className="p-6">
          <Heading2 size="large" weight="bold" className="mb-4 text-destructive">
            🚨 Contactos de Emergencia
          </Heading2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <BodyText weight="bold" className="text-destructive mb-2">
                Emergencias 24/7
              </BodyText>
              <BodyText size="large" weight="bold">
                +56 9 1234 5678
              </BodyText>
              <BodyText size="small" className="text-muted-foreground">
                Para accidentes, fallas críticas o emergencias operacionales
              </BodyText>
            </div>
            
            <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
              <BodyText weight="bold" className="text-warning mb-2">
                Soporte Técnico Urgente
              </BodyText>
              <BodyText size="large" weight="bold">
                +56 2 2345 6789
              </BodyText>
              <BodyText size="small" className="text-muted-foreground">
                Para problemas críticos del sistema fuera de horario
              </BodyText>
            </div>
          </div>
        </div>
      </Card>

      {/* Support Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <Heading2 size="large" weight="bold" className="mb-4">
              Canales de Soporte
            </Heading2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
                <span className="text-2xl">📧</span>
                <div className="flex-1">
                  <BodyText weight="medium">Email de Soporte</BodyText>
                  <BodyText size="small" className="text-primary">
                    support@fleetman.com
                  </BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    Respuesta en 24 horas laborales
                  </BodyText>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
                <span className="text-2xl">💬</span>
                <div className="flex-1">
                  <BodyText weight="medium">Chat en Vivo</BodyText>
                  <BodyText size="small" className="text-success">
                    Disponible ahora
                  </BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    Lunes a Viernes 9:00 - 18:00
                  </BodyText>
                </div>
                <Button variant="filled" size="sm">
                  Iniciar Chat
                </Button>
              </div>
              
              <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
                <span className="text-2xl">📞</span>
                <div className="flex-1">
                  <BodyText weight="medium">Teléfono de Soporte</BodyText>
                  <BodyText size="small" className="text-primary">
                    +56 2 3456 7890
                  </BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    Lunes a Viernes 8:00 - 19:00
                  </BodyText>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
                <span className="text-2xl">🎫</span>
                <div className="flex-1">
                  <BodyText weight="medium">Sistema de Tickets</BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    Para seguimiento detallado de problemas
                  </BodyText>
                </div>
                <Button variant="outline" size="sm">
                  Crear Ticket
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <Heading2 size="large" weight="bold" className="mb-4">
              Equipo de Soporte
            </Heading2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">AM</span>
                </div>
                <div className="flex-1">
                  <BodyText weight="medium">Ana María González</BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    Gerente de Soporte Técnico
                  </BodyText>
                  <BodyText size="small" className="text-primary">
                    ana.gonzalez@fleetman.com
                  </BodyText>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <span className="text-success font-bold">CR</span>
                </div>
                <div className="flex-1">
                  <BodyText weight="medium">Carlos Rodríguez</BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    Especialista en Implementación
                  </BodyText>
                  <BodyText size="small" className="text-primary">
                    carlos.rodriguez@fleetman.com
                  </BodyText>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
                <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center">
                  <span className="text-info font-bold">LS</span>
                </div>
                <div className="flex-1">
                  <BodyText weight="medium">Laura Salinas</BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    Capacitación y Entrenamientos
                  </BodyText>
                  <BodyText size="small" className="text-primary">
                    laura.salinas@fleetman.com
                  </BodyText>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Company Information */}
      <Card>
        <div className="p-6">
          <Heading2 size="large" weight="bold" className="mb-4">
            Información de la Empresa
          </Heading2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <BodyText weight="medium" className="mb-2">
                Oficina Principal
              </BodyText>
              <BodyText className="mb-1">FleetMan Solutions SpA</BodyText>
              <BodyText size="small" className="text-muted-foreground">
                Av. Providencia 1234, Piso 12<br />
                Providencia, Santiago<br />
                Región Metropolitana, Chile
              </BodyText>
            </div>
            
            <div>
              <BodyText weight="medium" className="mb-2">
                Información Legal
              </BodyText>
              <BodyText size="small" className="text-muted-foreground">
                RUT: 76.543.210-K<br />
                Giro: Desarrollo de Software<br />
                Razón Social: FleetMan Solutions SpA
              </BodyText>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <Heading2 size="large" weight="bold" className="mb-4">
            Acciones Rápidas
          </Heading2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="filled" size="default" className="h-auto py-4 flex-col gap-2">
              <span className="text-lg">📋</span>
              <span>Reportar Bug</span>
            </Button>
            
            <Button variant="outline" size="default" className="h-auto py-4 flex-col gap-2">
              <span className="text-lg">💡</span>
              <span>Sugerir Mejora</span>
            </Button>
            
            <Button variant="outline" size="default" className="h-auto py-4 flex-col gap-2">
              <span className="text-lg">📚</span>
              <span>Solicitar Capacitación</span>
            </Button>
            
            <Button variant="outline" size="default" className="h-auto py-4 flex-col gap-2">
              <span className="text-lg">🔧</span>
              <span>Soporte Técnico</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Office Hours */}
      <Card>
        <div className="p-6">
          <Heading2 size="large" weight="bold" className="mb-4">
            Horarios de Atención
          </Heading2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <BodyText weight="medium" className="mb-3">Soporte Técnico</BodyText>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Lunes - Viernes:</span>
                  <span>8:00 - 19:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sábados:</span>
                  <span>9:00 - 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingos:</span>
                  <span className="text-muted-foreground">Cerrado</span>
                </div>
              </div>
            </div>
            
            <div>
              <BodyText weight="medium" className="mb-3">Chat en Vivo</BodyText>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Lunes - Viernes:</span>
                  <span>9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sábados:</span>
                  <span className="text-muted-foreground">Cerrado</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingos:</span>
                  <span className="text-muted-foreground">Cerrado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};