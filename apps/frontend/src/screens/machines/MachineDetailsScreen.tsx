import React from 'react';
import { useParams } from 'react-router-dom';
import { Heading1, Heading2, BodyText, Button, Card } from '@components/ui';

export const MachineDetailsScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Heading1 size="headline" className="tracking-tight text-foreground">
            Detalles de la Máquina #{id}
          </Heading1>
          <BodyText className="text-muted-foreground">
            Información completa y estado actual de la máquina
          </BodyText>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="default">
            Editar Máquina
          </Button>
          <Button variant="filled" size="default">
            Realizar Quickcheck
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Info Card */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <Heading2 size="large" weight="bold" className="mb-4">
              Información General
            </Heading2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
                  Nombre
                </BodyText>
                <BodyText>Excavadora Principal</BodyText>
              </div>
              <div>
                <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
                  Tipo
                </BodyText>
                <BodyText>Excavadora</BodyText>
              </div>
              <div>
                <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
                  Modelo
                </BodyText>
                <BodyText>CAT 320D</BodyText>
              </div>
              <div>
                <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
                  Año
                </BodyText>
                <BodyText>2019</BodyText>
              </div>
              <div>
                <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
                  Número de Serie
                </BodyText>
                <BodyText>CAT0320D-2019-001</BodyText>
              </div>
              <div>
                <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
                  Ubicación Actual
                </BodyText>
                <BodyText>Sector A - Zona Norte</BodyText>
              </div>
            </div>
          </div>
        </Card>

        {/* Status Card */}
        <Card>
          <div className="p-6">
            <Heading2 size="large" weight="bold" className="mb-4">
              Estado Actual
            </Heading2>
            <div className="space-y-4">
              <div>
                <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
                  Estado Operacional
                </BodyText>
                <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-success/10 text-success">
                  Operativa
                </span>
              </div>
              <div>
                <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
                  Horas de Operación
                </BodyText>
                <BodyText>1,247 hrs</BodyText>
              </div>
              <div>
                <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
                  Último Quickcheck
                </BodyText>
                <BodyText>Hace 2 días</BodyText>
              </div>
              <div>
                <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
                  Próximo Mantenimiento
                </BodyText>
                <BodyText>En 15 días</BodyText>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="p-6">
          <Heading2 size="large" weight="bold" className="mb-4">
            Actividad Reciente
          </Heading2>
          <div className="space-y-4">
            <div className="border-l-4 border-success pl-4">
              <BodyText weight="medium">Quickcheck Completado</BodyText>
              <BodyText size="small" className="text-muted-foreground">
                Hace 2 días - Juan Pérez
              </BodyText>
              <BodyText size="small">Todos los sistemas operando normalmente</BodyText>
            </div>
            <div className="border-l-4 border-info pl-4">
              <BodyText weight="medium">Mantenimiento Preventivo</BodyText>
              <BodyText size="small" className="text-muted-foreground">
                Hace 1 semana - Taller Central
              </BodyText>
              <BodyText size="small">Cambio de aceite y filtros completado</BodyText>
            </div>
            <div className="border-l-4 border-warning pl-4">
              <BodyText weight="medium">Alerta de Horas</BodyText>
              <BodyText size="small" className="text-muted-foreground">
                Hace 2 semanas - Sistema
              </BodyText>
              <BodyText size="small">Próximo mantenimiento programado en 500 horas</BodyText>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};